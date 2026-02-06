import { NextRequest, NextResponse } from 'next/server';
import { generateDailyInsights, type DailyInsightsInput } from '@/ai/flows/generate-daily-insights-flow';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as DailyInsightsInput;
    const result = await generateDailyInsights(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in daily tips API:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { error: `Failed to generate tips: ${errorMessage}` },
      { status: 500 }
    );
  }
}
