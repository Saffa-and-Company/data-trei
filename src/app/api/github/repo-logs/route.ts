import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  // First, get the user's tracked repos
  const { data: trackedRepos, error: trackedReposError } = await supabase
    .from('tracked_repos')
    .select('repo_name')
    .eq('user_id', user.id);

  if (trackedReposError) {
    console.error('Error fetching tracked repos:', trackedReposError);
    return NextResponse.json({ error: 'Failed to fetch tracked repositories' }, { status: 500 });
  }

  const trackedRepoNames = trackedRepos.map(repo => repo.repo_name);

  // Then, fetch logs for those repos
  const { data: logs, error: logsError } = await supabase
    .from('repo_logs')
    .select('id, repo_name, event_type, message, created_at')
    .in('repo_name', trackedRepoNames)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (logsError) {
    console.error('Error fetching repo logs:', logsError);
    return NextResponse.json({ error: 'Failed to fetch repository logs' }, { status: 500 });
  }

  return NextResponse.json({ logs });
}