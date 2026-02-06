'use server';
import { scanMedicine, type ScanMedicineInput, type ScanMedicineOutput } from '@/ai/flows/scan-medicine-flow';

export async function getPillInformation(input: ScanMedicineInput): Promise<{ success: boolean, data?: ScanMedicineOutput, error?: string }> {
  try {
    const result = await scanMedicine(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to identify pill. The AI model may have had an issue. Please try again.' };
  }
}
