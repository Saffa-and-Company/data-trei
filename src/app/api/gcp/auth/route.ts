import { NextResponse } from 'next/server';
import { getAuthUrl } from '@/utils/gcpOAuth';

export async function GET() {
  const authUrl = getAuthUrl();
  return NextResponse.redirect(authUrl);
}