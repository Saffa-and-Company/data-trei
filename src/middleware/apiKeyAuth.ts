import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function apiKeyAuth(request: Request) {
  const supabase = createClient();
  const apiKey = request.headers.get('X-API-Key');

  if (!apiKey) {
    return NextResponse.json({ error: 'API key required' }, { status: 401 });
  }

  const { data: keyData, error } = await supabase
    .from('api_keys')
    .select('*')
    .eq('key', apiKey)
    .single();

  if (error || !keyData) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
  }

  if (!keyData.active) {
    return NextResponse.json({ error: 'Inactive API key' }, { status: 403 });
  }

  if (keyData.expires_at && new Date(keyData.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Expired API key' }, { status: 403 });
  }

  if (keyData.usage_limit && keyData.usage_count >= keyData.usage_limit) {
    return NextResponse.json({ error: 'API key usage limit exceeded' }, { status: 429 });
  }

  // Update usage statistics
  await supabase
    .from('api_keys')
    .update({
      usage_count: keyData.usage_count + 1,
      last_used_at: new Date().toISOString()
    })
    .eq('id', keyData.id);

  return null; // Proceed with the request
}
