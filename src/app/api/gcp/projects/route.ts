import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { oauth2Client } from '@/utils/gcpOAuth';
import { google } from 'googleapis';

export async function GET(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: gcpConnection } = await supabase
    .from('gcp_connections')
    .select('access_token, refresh_token')
    .eq('user_id', user.id)
    .single();

  if (!gcpConnection) {
    return NextResponse.json({ error: 'GCP not connected' }, { status: 400 });
  }

  oauth2Client.setCredentials({
    access_token: gcpConnection.access_token,
    refresh_token: gcpConnection.refresh_token,
  });

  try {
    const cloudResourceManager = google.cloudresourcemanager('v1');
    const res = await cloudResourceManager.projects.list({
      auth: oauth2Client,
    });

    const projects = res.data.projects || [];
    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Error fetching GCP projects:', error);
    return NextResponse.json({ error: 'Failed to fetch GCP projects' }, { status: 500 });
  }
}