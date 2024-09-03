import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const perPage = 30; // GitHub default, adjust as needed

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

  const reposResponse = await fetch(`https://api.github.com/user/repos?per_page=${perPage}&page=${page}`, {
    headers: {
      Authorization: `token ${connection.access_token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  const repos = await reposResponse.json();

  // Check if there are more pages
  const linkHeader = reposResponse.headers.get('Link');
  const hasNextPage = linkHeader && linkHeader.includes('rel="next"');

  // Get total count from the response headers
  const totalCount = parseInt(reposResponse.headers.get('X-Total-Count') || '0', 10);

  return NextResponse.json({ repos, hasNextPage, totalCount, currentPage: page });
}