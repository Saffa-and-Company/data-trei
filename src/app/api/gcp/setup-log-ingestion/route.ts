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
    const pubsub = google.pubsub({ version: 'v1', auth: oauth2Client });
    const logging = google.logging({ version: 'v2', auth: oauth2Client });

    // Create Pub/Sub topic
    const topicName = `data-trei-logs-${uuidv4()}`;
    await pubsub.projects.topics.create({
      name: `projects/${projectId}/topics/${topicName}`,
    });

    // Create log sink
    const sinkName = `data-trei-sink-${uuidv4()}`;
    await logging.projects.sinks.create({
      parent: `projects/${projectId}`,
      requestBody: {
        name: sinkName,
        destination: `pubsub.googleapis.com/projects/${projectId}/topics/${topicName}`,
        filter: 'logName:"projects/${projectId}/logs/cloudaudit.googleapis.com"',
      },
    });

    // Create a subscription to the topic, pointing to your Next.js API route
    const subscriptionName = `data-trei-sub-${uuidv4()}`;
    await pubsub.projects.subscriptions.create({
      name: `projects/${projectId}/subscriptions/${subscriptionName}`,
      requestBody: {
        topic: `projects/${projectId}/topics/${topicName}`,
        pushConfig: {
          pushEndpoint: `${process.env.NEXT_PUBLIC_APP_PRODUCTION_URL}/api/gcp/log-ingestion`,
        },
      },
    });

    // Store the sink, topic, and subscription info in Supabase
    await supabase.from('gcp_log_ingestion').insert({
      user_id: user.id,
      project_id: projectId,
      pubsub_topic: topicName,
      log_sink: sinkName,
      subscription_name: subscriptionName,
    });

    return NextResponse.json({ success: true, topicName, sinkName, subscriptionName });
  } catch (error) {
    console.error('Error setting up log ingestion:', error);
    return NextResponse.json({ error: 'Failed to set up log ingestion' }, { status: 500 });
  }
}