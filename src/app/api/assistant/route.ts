import { NextRequest, NextResponse } from 'next/server';
import { voiceAssistant, type VoiceAssistantInput } from '@/ai/flows/voice-assistant-flow';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as VoiceAssistantInput;
    const result = await voiceAssistant(body);
    return NextResponse.json({ reply: result.reply });
  } catch (error) {
    console.error('Error in voice assistant API:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { error: `Failed to get voice response: ${errorMessage}` },
      { status: 500 }
    );
  }
}
