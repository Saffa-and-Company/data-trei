import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

type AuthResponse = 
  | { error: string; status: number }
  | { api_key_id: string; user_id: string };

export async function apiKeyAuth(request: Request): Promise<AuthResponse> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const apiKey = request.headers.get('X-API-Key');

  if (!apiKey) {
    return { error: 'API key required', status: 401 };
  }

  const { data: keyData, error } = await supabase
    .from('api_keys')
    .select('*')
    .eq('key', apiKey)
    .single();

  if (error || !keyData) {
    return { error: 'Invalid API key', status: 401 };
  }

  if (!keyData.active) {
    return { error: 'Inactive API key', status: 403 };
  }

  if (keyData.expires_at && new Date(keyData.expires_at) < new Date()) {
    return { error: 'Expired API key', status: 403 };
  }

  if (keyData.usage_limit && keyData.usage_count >= keyData.usage_limit) {
    return { error: 'API key usage limit exceeded', status: 429 };
  }

  // Update usage statistics
  await supabase
    .from('api_keys')
    .update({
      usage_count: keyData.usage_count + 1,
      last_used_at: new Date().toISOString()
    })
    .eq('id', keyData.id);

  return { api_key_id: keyData.id, user_id: keyData.user_id };
}
