import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { Octokit } from '@octokit/rest';

export async function POST(request: Request) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { repo, username } = await request.json();
  if (!repo || !username) {
    return NextResponse.json({ error: 'Repository and username are required' }, { status: 400 });
  }

  const [owner, repoName] = repo.split('/');

  const { data: connection } = await supabase
    .from('github_connections')
    .select('access_token')
    .eq('user_id', user.id)
    .single();

  if (!connection) {
    return NextResponse.json({ error: 'GitHub not connected' }, { status: 400 });
  }

  const octokit = new Octokit({ auth: connection.access_token });

  try {
    await octokit.repos.removeCollaborator({
      owner,
      repo: repoName,
      username,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error revoking access:', error);
    if (error instanceof Error && 'status' in error && error.status === 404) {
      return NextResponse.json({ error: 'Unable to revoke access. You may not have permission or the user might not be a direct collaborator.' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to revoke access' }, { status: 500 });
  }
}