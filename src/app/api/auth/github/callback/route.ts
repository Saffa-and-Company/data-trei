import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=github_code_missing`);
  }

  const supabase = createClient();

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=github_token_error`);
    }

    // Store the access token in your database
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      let expiresAt;
      if (tokenData.expires_in) {
        expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);
      } else {
        // If expires_in is not provided, set a default expiration (e.g., 1 hour from now)
        expiresAt = new Date(Date.now() + 60 * 60 * 1000);
      }
      
      const { error } = await supabase.from('github_connections').upsert({
        user_id: user.id,
        access_token: tokenData.access_token,
        expires_at: expiresAt.toISOString(),
      }, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      });

      if (error) {
        console.error('Error upserting GitHub connection:', error);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=github_connection_error`);
      }
    }

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=github_connected`);
  } catch (error) {
    console.error('Error in GitHub callback:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=github_callback_error`);
  }
}