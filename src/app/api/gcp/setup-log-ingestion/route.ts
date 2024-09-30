// src/app/api/gcp/setup-log-ingestion/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { oauth2Client } from '@/utils/gcpOAuth';
import { google } from 'googleapis';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  const { projectId } = await request.json();

  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();


  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: gcpConnection, error: gcpConnectionError } = await supabase
    .from('gcp_connections')
    .select('access_token, refresh_token')
    .eq('user_id', user.id)
    .single();

  if (gcpConnectionError) {
    return NextResponse.json({ error: 'Failed to fetch GCP connection' }, { status: 500 });
  }

  if (!gcpConnection) {
    return NextResponse.json({ error: 'GCP not connected' }, { status: 400 });
  }

  // Check if the project is already set up
  const { data: existingLogIngestion, error: existingLogIngestionError } = await supabase
    .from('gcp_log_ingestion')
    .select('*')
    .eq('user_id', user.id)
    .eq('project_id', projectId)
    .single();

  if (existingLogIngestion) {
    return NextResponse.json({ error: 'Log ingestion already set up for this project' }, { status: 409 });
  }

  oauth2Client.setCredentials({
    access_token: gcpConnection.access_token,
    refresh_token: gcpConnection.refresh_token,
  });

  try {
    const pubsub = google.pubsub({ version: 'v1', auth: oauth2Client });
    const logging = google.logging({ version: 'v2', auth: oauth2Client });

    const topicName = `data-trei-logs-${uuidv4()}`;
    await pubsub.projects.topics.create({
      name: `projects/${projectId}/topics/${topicName}`,
    });

    const sinkName = `data-trei-sink-${uuidv4()}`;
    const sink = await logging.projects.sinks.create({
      parent: `projects/${projectId}`,
      requestBody: {
        name: sinkName,
        destination: `pubsub.googleapis.com/projects/${projectId}/topics/${topicName}`,
        filter: `logName:projects/${projectId}/logs/`,
      },
    });

    const serviceAccount = sink.data.writerIdentity;

    if (projectId && topicName && serviceAccount) {
      await pubsub.projects.topics.setIamPolicy({
        resource: `projects/${projectId}/topics/${topicName}`,
        requestBody: {
          policy: {
            bindings: [
              {
                role: 'roles/pubsub.publisher',
                members: [serviceAccount],
              },
            ],
          },
        },
      });
    } else {
      throw new Error('Project ID or Topic Name is undefined');
    }

    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_PRODUCTION_URL}/api/gcp/log-ingestion?user_id=${user.id}`;

    const subscriptionName = `data-trei-sub-${uuidv4()}`;
    await pubsub.projects.subscriptions.create({
      name: `projects/${projectId}/subscriptions/${subscriptionName}`,
      requestBody: {
        topic: `projects/${projectId}/topics/${topicName}`,
        pushConfig: {
          pushEndpoint: webhookUrl,
        },
      },
    });
    const { error: insertError } = await supabase.from('gcp_log_ingestion').insert({
      user_id: user.id,
      project_id: projectId,
      pubsub_topic: topicName,
      log_sink: sinkName,
      subscription_name: subscriptionName,
    });

    if (insertError) {
      if (insertError.code === '23505') { // Unique constraint violation
        return NextResponse.json({ error: 'Log ingestion already set up for this project' }, { status: 409 });
      }
      throw insertError;
    }

    return NextResponse.json({ success: true, topicName, sinkName, subscriptionName });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to set up log ingestion', details: (error as Error).message }, { status: 500 });
  }
}