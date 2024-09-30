import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { Octokit } from '@octokit/rest';

export async function POST(request: Request) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { username } = await request.json();
  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
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
    // Get all repositories for the authenticated user
    const { data: repos } = await octokit.repos.listForAuthenticatedUser();

    const results = await Promise.all(repos.map(async (repo) => {
      try {
        await octokit.repos.removeCollaborator({
          owner: repo.owner.login,
          repo: repo.name,
          username,
        });
        return { repo: repo.full_name, success: true };
      } catch (error) {
        return { repo: repo.full_name, success: false, error: error as string };
      }
    }));

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    return NextResponse.json({
      message: `Access revoked from ${successCount} repositories. Failed for ${failureCount} repositories.`,
      details: results
    });
  } catch (error) {
    console.error('Error revoking access:', error);
    return NextResponse.json({ error: 'Failed to revoke access' }, { status: 500 });
  }
}