import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { apiKeyAuth } from '@/middleware/apiKeyAuth';

export async function POST(request: Request) {
  const authResponse = await apiKeyAuth(request);
  if (authResponse) return authResponse;

  const supabase = createClient();

  // Authenticate the request
  const apiKey = request.headers.get('X-API-Key');
  if (apiKey !== process.env.WEBHOOK_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await request.json();

  // Validate the payload
  const { repo_name, event_type, message, timestamp, metadata } = payload;

  if (!repo_name || !event_type || !message) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  // Store the log
  const { error } = await supabase
    .from('event_logs')
    .insert({
      source: 'webhook',
      repo_name,
      event_type,
      message,
      created_at: timestamp || new Date().toISOString(),
      metadata
    });

  if (error) {
    console.error('Error storing log:', error);
    return NextResponse.json({ error: 'Failed to store log' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
