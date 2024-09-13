import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getToken } from '@/utils/gcpOAuth';
import { oauth2Client } from '@/utils/gcpOAuth';
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=gcp_code_missing`);
  }

  const supabase = createClient();

  try {
    const tokens = await getToken(code);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      oauth2Client.setCredentials({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      });
      const {token } = await oauth2Client.getAccessToken();
      const { error } = await supabase.from('gcp_connections').upsert({
        user_id: user.id,
        access_token: token,
        refresh_token: tokens.refresh_token,
    
        expires_at: new Date(tokens.expiry_date!).toISOString(),
      }, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      });

      if (error) {
        console.error('Error upserting GCP connection:', error);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=gcp_connection_error`);
      }
    }

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=gcp_connected`);
  } catch (error) {
    console.error('Error getting GCP token:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=gcp_token_error`);
  }
}