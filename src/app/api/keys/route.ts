import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import crypto from 'crypto';
import { uniqueNamesGenerator, Config, adjectives, colors, animals } from 'unique-names-generator';

const USAGE_LIMIT = 1000;

const nameConfig: Config = {
  dictionaries: [adjectives, colors, animals],
  separator: '-',
  length: 3,
  style: 'capital',
};

function generateRandomName(): string {
  return uniqueNamesGenerator(nameConfig);
}

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const key = crypto.randomBytes(32).toString('hex');
  const name = generateRandomName();

  const { data, error } = await supabase
    .from('api_keys')
    .insert({
      user_id: user.id,
      key,
      name,
      usage_limit: USAGE_LIMIT
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') { // PostgreSQL error code for unique constraint violation
      return NextResponse.json({ error: 'You already have an API key' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create API key' }, { status: 500 });
  }

  return NextResponse.json({ key: data.key, name: data.name });
}

export async function GET(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('api_keys')
    .select('id, name, active, created_at, last_used_at, usage_count, usage_limit, expires_at')
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch API keys' }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, active } = await request.json();

  const { error } = await supabase
    .from('api_keys')
    .update({ active })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: 'Failed to update API key' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await request.json();

  const { error } = await supabase
    .from('api_keys')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: 'Failed to delete API key' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
