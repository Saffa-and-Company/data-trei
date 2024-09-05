import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const payload = await request.json();

  // Extract relevant information from the payload
  const repoName = payload.repository.name;
  const eventType = request.headers.get('X-GitHub-Event');
  let message = '';

  if (eventType === 'push') {
    message = `New commit: ${payload.head_commit.message}`;
  } else if (eventType === 'pull_request') {
    message = `Pull request ${payload.action}: ${payload.pull_request.title}`;
  }

  // Store the log in the database
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