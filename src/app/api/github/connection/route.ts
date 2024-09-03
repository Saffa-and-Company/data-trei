import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ connected: false }, { status: 401 });
  }

  const { data: connection } = await supabase
    .from('github_connections')
    .select('access_token')
    .eq('user_id', user.id)
    .single();


  return NextResponse.json({ connected: !!connection });
}
