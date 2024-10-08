import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

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
    const { data: existingSetup, error: fetchError } = await supabase
      .from('gcp_log_ingestion')
      .select('*')
      .eq('user_id', user.id)
      .eq('project_id', projectId)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: 'Failed to fetch existing setup' }, { status: 500 });
    }

    if (!existingSetup) {
      return NextResponse.json({ error: 'No existing log ingestion setup found' }, { status: 404 });
    }

    const pubsub = google.pubsub({ version: 'v1', auth: oauth2Client });
    const logging = google.logging({ version: 'v2', auth: oauth2Client });

    // Delete log sink
    if (existingSetup.log_sink) {
      try {
        await logging.projects.sinks.delete({
          sinkName: `projects/${projectId}/sinks/${existingSetup.log_sink}`,
        });
      } catch (error) {
        console.error('Error deleting log sink:', error);
        // Continue with deletion of other resources even if sink deletion fails
      }
    }

    // Delete Pub/Sub subscription
    if (existingSetup.subscription_name) {
      try {
        await pubsub.projects.subscriptions.delete({
          subscription: `projects/${projectId}/subscriptions/${existingSetup.subscription_name}`,
        });
      } catch (error) {
        console.error('Error deleting Pub/Sub subscription:', error);
      }
    }

    // Delete Pub/Sub topic
    if (existingSetup.pubsub_topic) {
      try {
        await pubsub.projects.topics.delete({
          topic: `projects/${projectId}/topics/${existingSetup.pubsub_topic}`,
        });
      } catch (error) {
        console.error('Error deleting Pub/Sub topic:', error);
      }
    }

    // Delete record from Supabase
    const { error: deleteError } = await supabase
      .from('gcp_log_ingestion')
      .delete()
      .eq('id', existingSetup.id);

    if (deleteError) {
      throw deleteError;
    }

    // Cleanup: Check for and delete any orphaned sinks
    try {
      const sinks = await logging.projects.sinks.list({
        parent: `projects/${projectId}`,
      });

      for (const sink of sinks.data.sinks || []) {
        if (sink.name?.includes('data-trei-sink')) {
          await logging.projects.sinks.delete({
            sinkName: sink.name,
          });
          console.log(`Deleted orphaned sink: ${sink.name}`);
        }
      }
    } catch (error) {
      console.error('Error during orphaned sink cleanup:', error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting log ingestion setup:', error);
    return NextResponse.json({ error: 'Failed to delete log ingestion setup' }, { status: 500 });
  }
}