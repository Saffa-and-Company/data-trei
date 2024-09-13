// src/app/api/gcp/setup-log-ingestion/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { oauth2Client } from '@/utils/gcpOAuth';
import { google } from 'googleapis';
import { v4 as uuidv4 } from 'uuid';

async function deleteExistingSetup(projectId: string, supabase: any, user: any, oauth2Client: any) {
    console.log('Deleting existing log ingestion setup');
    
    const { data: existingSetup, error: fetchError } = await supabase
      .from('gcp_log_ingestion')
      .select('*')
      .eq('user_id', user.id)
      .eq('project_id', projectId)
      .single();
  
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching existing setup:', fetchError);
      throw fetchError;
    }
  
    if (existingSetup) {
      const pubsub = google.pubsub({ version: 'v1', auth: oauth2Client });
      const logging = google.logging({ version: 'v2', auth: oauth2Client });
  
      try {
        // Delete log sink
        if (existingSetup.log_sink) {
          await logging.projects.sinks.delete({
            sinkName: `projects/${projectId}/sinks/${existingSetup.log_sink}`,
          });
          console.log('Deleted existing log sink');
        }
  
        // Delete Pub/Sub subscription
        if (existingSetup.subscription_name) {
          await pubsub.projects.subscriptions.delete({
            subscription: `projects/${projectId}/subscriptions/${existingSetup.subscription_name}`,
          });
          console.log('Deleted existing Pub/Sub subscription');
        }
  
        // Delete Pub/Sub topic
        if (existingSetup.pubsub_topic) {
          await pubsub.projects.topics.delete({
            topic: `projects/${projectId}/topics/${existingSetup.pubsub_topic}`,
          });
          console.log('Deleted existing Pub/Sub topic');
        }
  
        // Delete record from Supabase
        const { error: deleteError } = await supabase
          .from('gcp_log_ingestion')
          .delete()
          .eq('id', existingSetup.id);
  
        if (deleteError) {
          console.error('Error deleting existing setup from Supabase:', deleteError);
          throw deleteError;
        }
  
        console.log('Deleted existing setup from Supabase');
      } catch (error) {
        console.error('Error deleting existing setup:', error);
        throw error;
      }
    } else {
      console.log('No existing setup found');
    }
  }

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

  oauth2Client.setCredentials({
    access_token: gcpConnection.access_token,
    refresh_token: gcpConnection.refresh_token,
  });

  try {
    await deleteExistingSetup(projectId, supabase, user, oauth2Client);
    const pubsub = google.pubsub({ version: 'v1', auth: oauth2Client });
    const logging = google.logging({ version: 'v2', auth: oauth2Client });

    const topicName = `data-trei-logs-${uuidv4()}`;
    await pubsub.projects.topics.create({
      name: `projects/${projectId}/topics/${topicName}`,
    });

    const sinkName = `data-trei-sink-${uuidv4()}`;
    await logging.projects.sinks.create({
      parent: `projects/${projectId}`,
      requestBody: {
        name: sinkName,
        destination: `pubsub.googleapis.com/projects/${projectId}/topics/${topicName}`,
        filter: 'logName:"projects/${projectId}/logs/cloudaudit.googleapis.com"',
      },
    });

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

    const { error: insertError } = await supabase.from('gcp_log_ingestion').insert({
      user_id: user.id,
      project_id: projectId,
      pubsub_topic: topicName,
      log_sink: sinkName,
      subscription_name: subscriptionName,
    });

    if (insertError) {
      throw insertError;
    }

    return NextResponse.json({ success: true, topicName, sinkName, subscriptionName });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to set up log ingestion', details: (error as Error).message }, { status: 500 });
  }
}