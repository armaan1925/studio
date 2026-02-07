import { NextRequest, NextResponse } from 'next/server';
import { summarizeMultipleReports, type SummarizeMultipleReportsInput } from '@/ai/flows/summarize-multiple-reports-flow';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SummarizeMultipleReportsInput;
    const result = await summarizeMultipleReports(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in summarize-reports API:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { error: `Failed to generate combined summary: ${errorMessage}` },
      { status: 500 }
    );
  }
}
