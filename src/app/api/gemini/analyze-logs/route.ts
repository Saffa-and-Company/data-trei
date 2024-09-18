import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { question, logType } = await request.json();

  try {
    let logs;
    if (logType === 'github') {
      const { data, error } = await supabase
        .from('github_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      logs = data;
    } else if (logType === 'custom') {
      const { data, error } = await supabase
        .from('custom_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      logs = data;
    } else if (logType === 'gcp') {
      const { data, error } = await supabase
        .from('gcp_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);
      if (error) throw error;
      logs = data;
    } else {
      throw new Error('Invalid log type');
    }

    const context = JSON.stringify(logs);

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent(`
      You are an AI assistant for analyzing ${logType} log data. Here are the most recent logs:
      ${context}
      
      User question: ${question}
      
      Please analyze the logs and answer the user's question. If the question involves taking an action, explain how to do it but don't actually perform the action.
    `);

    const answer = result.response.text();

    return NextResponse.json({ answer });
  } catch (error) {
    console.error('Error processing question:', error);
    return NextResponse.json({ error: 'Failed to process question' }, { status: 500 });
  }
}