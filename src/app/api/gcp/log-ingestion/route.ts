// src/app/api/gcp/log-ingestion/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  const supabase = createClient();

  try {
    const message = await request.json();
    const logEntry = JSON.parse(Buffer.from(message.message.data, 'base64').toString());

    // Extract the project ID from the log entry
    const projectId = logEntry.resource?.labels?.project_id;

    if (!projectId) {
      console.error('Project ID not found in log entry');
      return NextResponse.json({ error: 'Project ID not found' }, { status: 400 });
    }

    const formattedLog = {
      project_id: projectId,
      timestamp: logEntry.timestamp,
      severity: logEntry.severity,
      resource: logEntry.resource,
      log_name: logEntry.logName,
      text_payload: logEntry.textPayload,
      json_payload: logEntry.jsonPayload,
    };

    const { error } = await supabase.from('gcp_logs').insert(formattedLog);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing log entry:', error);
    return NextResponse.json({ error: 'Failed to process log entry' }, { status: 500 });
  }
}