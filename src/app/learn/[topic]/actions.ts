'use server';
import { generateQuizQuestions, type GenerateQuizQuestionsOutput } from '@/ai/flows/generate-quiz-questions';

export async function createQuiz(topic: string, numQuestions: number = 5): Promise<{ success: boolean; data?: GenerateQuizQuestionsOutput; error?: string }> {
  try {
    const result = await generateQuizQuestions({ topic, numQuestions });
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to generate quiz questions. Please try again.' };
  }
}
