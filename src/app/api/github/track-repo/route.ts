import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { Octokit } from "@octokit/rest";

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { repoName } = await request.json();

  if (!repoName) {
    return NextResponse.json({ error: 'Repository name is required' }, { status: 400 });
  }

  const { data: connection } = await supabase
    .from('github_connections')
    .select('access_token')
    .eq('user_id', user.id)
    .single();

  if (!connection) {
    return NextResponse.json({ error: 'GitHub not connected' }, { status: 400 });
  }

  try {
    // Fetch the user's GitHub username
    const octokit = new Octokit({ auth: connection.access_token });
    const { data: githubUser } = await octokit.users.getAuthenticated();

    // Set up webhook for the repository
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/github/webhook`;

    const webhookResponse = await octokit.repos.createWebhook({
      owner: githubUser.login,
      repo: repoName,
      config: {
        url: webhookUrl,
        content_type: 'json',
        insecure_ssl: '0',
      },
      events: ['*']  
    });

    console.log('Webhook response:', webhookResponse)
    if (webhookResponse.status !== 201) {
      console.error('Webhook creation failed:', webhookResponse.data);
      return NextResponse.json({ error: 'Failed to set up webhook', details: webhookResponse.data }, { status: 500 });
    }

    // Store or update the tracked repository in the database
    const { error } = await supabase
      .from('tracked_repos')
      .upsert(
        { user_id: user.id, repo_name: repoName },
        { onConflict: 'user_id,repo_name' }
      );

    if (error) {
      console.error('Database upsert error:', error);
      return NextResponse.json({ error: 'Failed to store or update tracked repository', details: error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in track-repo:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'An unexpected error occurred', details: errorMessage }, { status: 500 });
  }
}