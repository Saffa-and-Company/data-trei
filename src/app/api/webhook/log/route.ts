import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { apiKeyAuth } from '@/middleware/apiKeyAuth';

export async function POST(request: Request) {
  const authResponse = await apiKeyAuth(request);
  if ('error' in authResponse) {
    return NextResponse.json({ error: authResponse.error }, { status: authResponse.status });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  const payload = await request.json();

  // Validate the payload
  const { repo_name, event_type, message, timestamp, metadata } = payload;

  if (!repo_name || !event_type || !message) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  // Store the log
  const { error } = await supabase
    .from('custom_logs')
    .insert({
      repo_name,
      event_type,
      message,
      metadata: metadata,
      api_key_id: authResponse.api_key_id,
      user_id: authResponse.user_id,
    });

  if (error) {
    console.error('Error storing log:', error);
    return NextResponse.json({ error: 'Failed to store log' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
