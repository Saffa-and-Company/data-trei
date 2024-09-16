import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getToken } from '@/utils/gcpOAuth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/gcp-integration?error=gcp_code_missing`);
  }

  const supabase = createClient();

  try {
    const tokens = await getToken(code);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Store tokens with a short expiration (e.g., 1 hour)
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
      const { error } = await supabase.from('gcp_connections').upsert({
        user_id: user.id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: expiresAt.toISOString(),
      }, {
        onConflict: 'user_id',
      });

      if (error) {
        console.error('Error storing GCP connection:', error);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/gcp-integration?error=gcp_connection_error`);
      }
    }

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/gcp-integration?success=gcp_connected`);
  } catch (error) {
    console.error('Error getting GCP token:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/gcp-integration?error=gcp_token_error`);
  }
}