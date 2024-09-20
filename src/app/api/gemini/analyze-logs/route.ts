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

  const encoder = new TextEncoder();

 const stream = new ReadableStream({
    async start(controller) {
        try {
            let logs;
            if (logType === 'github') {
              const { data, error } = await supabase
                .from('github_logs')
                .select('*')
                .order('created_at', { ascending: false })
             
              if (error) throw error;
              logs = data;
            } else if (logType === 'custom') {
              const { data, error } = await supabase
                .from('custom_logs')
                .select('*')
                .order('created_at', { ascending: false })
           
              if (error) throw error;
              logs = data;
            } else if (logType === 'gcp') {
              const { data, error } = await supabase
                .from('gcp_logs')
                .select('*')
                .order('timestamp', { ascending: false })
        
              if (error) throw error;
              logs = data;
            } else {
              throw new Error('Invalid log type');
            }
        
            const context = JSON.stringify(logs);
        
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
            const result = await model.generateContentStream(`
              You are an AI assistant for analyzing ${logType} log data. Here are the most recent logs:
              ${context}
              
              User question: ${question}
              
              Please analyze the logs and answer the user's question.
            `);
        
            for await (const chunk of result.stream) {
                const chunkText = chunk.text();
                controller.enqueue(encoder.encode(`data: ${chunkText}\n\n`));
              }
        
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          } catch (error) {
            console.error('Error processing question:', error);
            controller.enqueue(encoder.encode('data: [ERROR]\n\n'));
          } finally {
            controller.close();
          }

        
    }
});
        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive'
            }
        });
}

