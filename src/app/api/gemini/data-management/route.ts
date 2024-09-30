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

  const { action } = await request.json();

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent(`
      You are an AI assistant for managing GitHub repository access. The user wants to perform the following action:
      ${action}
      
      Analyze the request and provide a JSON response with the following structure:
      {
        "action": "github-action-name",
        "params": {
          // Any necessary parameters for the action
        }
      }
      
      Possible actions include:
      - github-revoke-access-all
      - github-list-collaborators
      - github-add-collaborator
      
      Ensure the JSON is valid and contains all necessary information to perform the requested action.
    `);

    console.log(result.response.text());
    let jsonResponse;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = result.response.text().match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : result.response.text();
      jsonResponse = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      jsonResponse = {
        action: "error",
        params: {
          message: "Failed to parse Gemini response. Please try rephrasing your request."
        }
      };
    }

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ 
      action: "error", 
      params: { 
        message: "An error occurred while processing your request." 
      } 
    }, { status: 500 });
  }
}