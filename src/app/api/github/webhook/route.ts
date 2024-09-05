import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const payload = await request.json();

  const repoName = payload.repository.name;
  const eventType = request.headers.get('X-GitHub-Event');
  let message = '';

  switch (eventType) {
    case 'push':
      message = `New commit: ${payload.head_commit.message}`;
      break;
    case 'pull_request':
      message = `Pull request ${payload.action}: ${payload.pull_request.title}`;
      break;
    case 'issues':
      message = `Issue ${payload.action}: ${payload.issue.title}`;
      break;
    case 'issue_comment':
      message = `New comment on issue #${payload.issue.number}: ${payload.comment.body.substring(0, 100)}...`;
      break;
    case 'create':
      message = `New ${payload.ref_type} created: ${payload.ref}`;
      break;
    case 'delete':
      message = `${payload.ref_type} deleted: ${payload.ref}`;
      break;
    case 'fork':
      message = `Repository forked by ${payload.forkee.owner.login}`;
      break;
    case 'watch':
      message = `Repository ${payload.action} by ${payload.sender.login}`;
      break;
    case 'release':
      message = `New release ${payload.release.tag_name}: ${payload.release.name}`;
      break;

    case 'star':
      message = `Repository ${payload.action} by ${payload.sender.login}`;
      break;
    case 'branch_protection_rule':
      message = `Branch protection rule ${payload.action}: ${payload.branch_protection_rule.name}`;
      break;
    case 'branch_protection_policy':
      message = `Branch protection policy ${payload.action}: ${payload.branch_protection_policy.name}`;
      break;
    default:
      message = `Unhandled event type: ${eventType}`;
  }

  const { error } = await supabase
    .from('repo_logs')
    .insert({
      repo_name: repoName,
      event_type: eventType,
      message: message,
    });

  if (error) {
    console.error('Error storing log:', error);
    return NextResponse.json({ error: 'Failed to store log' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}