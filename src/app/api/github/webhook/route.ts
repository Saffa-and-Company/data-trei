import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { apiKeyAuth } from '@/middleware/apiKeyAuth';

type RequestInitWithDuplex = RequestInit & { duplex?: 'half' | 'full' };

export async function POST(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { searchParams } = new URL(request.url);
  const user_id = searchParams.get('user_id');

  if (!user_id) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  // Fetch the user's API key
  const { data: apiKeyData, error: apiKeyError } = await supabase
    .from('api_keys')
    .select('key')
    .eq('user_id', user_id)
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (apiKeyError || !apiKeyData) {
    // create a new api key
    const { data: newApiKeyData, error: newApiKeyError } = await supabase
      .from('api_keys')
      .insert({
        user_id: user_id,
        key: crypto.randomUUID(),
        active: true,
        name: "New API Key",
        
      })
      .single();
  }

  // Create a new request object with the API key in the header
  const newRequest = new Request(request.url, {
    method: request.method,
    headers: {
      ...request.headers,
      'X-API-Key': apiKeyData.key
    },
    body: request.body,
    duplex: 'half'
  } as RequestInitWithDuplex);

  // Now use apiKeyAuth with the new request
  const authResponse = await apiKeyAuth(newRequest);
  if ('error' in authResponse) {
    return NextResponse.json({ error: authResponse.error }, { status: authResponse.status });
  }

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
    case 'repository':
  
        message = `Repository ${payload.action} by ${payload.sender.login}`;
      break;

    case 'ping':
      message = `Repository pinged by ${payload.sender.login}`;
      break;
    default:
      message = `Unhandled event type: ${eventType}`;
  }

  const { error } = await supabase
    .from('github_logs')
    .insert({
      user_id: authResponse.user_id,
      repo_name: repoName,
      event_type: eventType,
      message: message,
      api_key_id: authResponse.api_key_id
    });

  if (error) {
    console.error('Error storing log:', error);
    return NextResponse.json({ error: 'Failed to store log' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}