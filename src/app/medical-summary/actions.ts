'use server';
import { summarizePrescription, type SummarizePrescriptionInput, type SummarizePrescriptionOutput } from '@/ai/flows/summarize-prescription-flow';
import { scanMedicine, type ScanMedicineInput, type ScanMedicineOutput } from '@/ai/flows/scan-medicine-flow';
import { summarizeMedicalReport, type SummarizeReportInput, type SummarizeReportOutput } from '@/ai/flows/summarize-report-flow';

export async function getPrescriptionSummary(input: SummarizePrescriptionInput): Promise<{ success: boolean, data?: SummarizePrescriptionOutput, error?: string }> {
  try {
    const result = await summarizePrescription(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to summarize prescription. Please try again.' };
  }
}

export async function getMedicineInfo(input: ScanMedicineInput): Promise<{ success: boolean, data?: ScanMedicineOutput, error?: string }> {
    try {
      const result = await scanMedicine(input);
      return { success: true, data: result };
    } catch (error) {
      console.error(error);
      return { success: false, error: 'Failed to identify medicine. The AI model may have had an issue. Please try again.' };
    }
  }

export async function getReportSummary(input: SummarizeReportInput): Promise<{ success: boolean, data?: SummarizeReportOutput, error?: string }> {
  try {
    const result = await summarizeMedicalReport(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to summarize report. Please try again.' };
  }
}
