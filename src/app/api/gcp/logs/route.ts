import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { oauth2Client } from '@/utils/gcpOAuth';
import { Logging } from '@google-cloud/logging';
import { JSONClient } from 'google-auth-library/build/src/auth/googleauth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');

  if (!projectId) {
    return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
  }

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
  

    const logging = new Logging({ 
      projectId: projectId,
      authClient: oauth2Client as JSONClient,
      scopes: ['https://www.googleapis.com/auth/logging.read', 'https://www.googleapis.com/auth/cloud-platform.read-only']
    });

    console.log('Logging client initialized');

    console.log('Fetching logs for project:', projectId);

    const [entries] = await logging.getEntries({
      pageSize: 50,
      orderBy: 'timestamp desc',
    });

    console.log('Number of log entries:', entries.length);

    if (entries.length === 0) {
      return NextResponse.json({ logs: [] });
    }



    const formattedLogs = entries.map(entry => {
      if (!entry || !entry.metadata) {
        console.log('Invalid entry:', entry);
        return null;
      }
      return {
        timestamp: entry.metadata.timestamp,
        severity: entry.metadata.severity,
        resource: entry.metadata.resource,
        httpRequest: entry.metadata.httpRequest || null,
        labels: entry.metadata.labels || null,
        logName: entry.metadata.logName || null,
        textPayload: entry.data?.textPayload || null,
        jsonPayload: entry.data?.jsonPayload || null,
      };
    }).filter(log => log !== null);

    return NextResponse.json({ logs: formattedLogs });
  } catch (error) {
    console.error('Error fetching GCP logs:', error);
    return NextResponse.json({ error: 'Failed to fetch GCP logs', details: (error as Error).message }, { status: 500 });
  }
}