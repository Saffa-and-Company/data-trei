import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { Octokit } from '@octokit/rest';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const repo = searchParams.get('repo');

  if (!repo) {
    return NextResponse.json({ error: 'Repository not specified' }, { status: 400 });
  }

  const [owner, repoName] = repo.split('/');

  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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
    const { data: collaborators } = await octokit.repos.listCollaborators({
      owner,
      repo: repoName,
    });

    return NextResponse.json(collaborators);
  } catch (error) {
    console.error('Error fetching collaborators:', error);
    return NextResponse.json({ error: 'Failed to fetch collaborators' }, { status: 500 });
  }
}