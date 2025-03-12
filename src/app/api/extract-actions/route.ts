import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    const prompt = `
      Analyze the following text and extract or infer action items. Consider:
      1. Explicit tasks (e.g., "need to", "todo", "should")
      2. Implied tasks from context
      3. Break down complex tasks into smaller actionable items
      4. Convert discussions/notes into concrete action items
      
      Text to analyze:
      ${text}
      
      Return ONLY the list of action items in a clear, actionable format. Each action should be on a new line.
      If no actions are found, return "NO_ACTIONS".
    `;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4-turbo-preview",
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0].message.content;

    return NextResponse.json({ actions: aiResponse });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Failed to process text' },
      { status: 500 }
    );
  }
} 