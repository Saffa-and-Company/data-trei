import { createClient } from '@/utils/supabase/server';

export async function getValidGitHubToken(userId: string) {
  const supabase = createClient();
  
  const { data: connection } = await supabase
    .from('github_connections')
    .select('access_token')
    .eq('user_id', userId)
    .single();

  if (!connection) {
    throw new Error('GitHub not connected');
  }

  // Check if the token is still valid
  const response = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `token ${connection.access_token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (response.status === 401) {
    // Token is invalid or revoked
    // Remove the invalid token from the database
    await supabase
      .from('github_connections')
      .delete()
      .eq('user_id', userId);

    throw new Error('GitHub token is invalid or revoked');
  }

  return connection.access_token;
}