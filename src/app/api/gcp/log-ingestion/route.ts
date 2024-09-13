// src/app/api/gcp/log-ingestion/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    console.log('Parsing request body');
    const body = await request.json();
    console.log('Received body:', JSON.stringify(body, null, 2));

    let logEntry;
    if (body.message && body.message.data) {
      // If the log is wrapped in a Pub/Sub message format
      console.log('Decoding Pub/Sub message');
      logEntry = JSON.parse(Buffer.from(body.message.data, 'base64').toString());
    } else {
      // If the log is sent directly
      logEntry = body;
    }
    console.log('Parsed log entry:', JSON.stringify(logEntry, null, 2));

    // Extract the project ID from the log entry
    const projectId = logEntry.resource?.labels?.project_id;

    if (!projectId) {
      console.error('Project ID not found in log entry');
      return NextResponse.json({ error: 'Project ID not found' }, { status: 400 });
    }

    console.log('Extracted project ID:', projectId);

    const formattedLog = {
      project_id: projectId,
      timestamp: logEntry.timestamp,
      severity: logEntry.severity,
      resource: logEntry.resource,
      log_name: logEntry.logName,
      text_payload: logEntry.textPayload,
      json_payload: logEntry.jsonPayload,
    };

    console.log('Formatted log:', JSON.stringify(formattedLog, null, 2));

    console.log('Inserting log into Supabase');
    const { data, error } = await supabase.from('gcp_logs').insert(formattedLog);

    if (error) {
      console.error('Supabase insert error:', error);
      throw error;
    }

    console.log('Log inserted successfully:', data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing log entry:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: 'Failed to process log entry', details: error.message }, { status: 500 });
    } else {
      return NextResponse.json({ error: 'Failed to process log entry', details: 'An unknown error occurred' }, { status: 500 });
    }
  }
}