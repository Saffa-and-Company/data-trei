import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: repos, error } = await supabase
    .from('tracked_repos')
    .select('id, repo_name')
    .eq('user_id', user.id)
    .order('repo_name', { ascending: true });

  if (error) {
    console.error('Error fetching tracked repos:', error);
    return NextResponse.json({ error: 'Failed to fetch tracked repositories' }, { status: 500 });
  }

  return NextResponse.json({ repos });
}