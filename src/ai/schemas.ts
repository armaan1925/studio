import { z } from 'zod';

export const AbnormalFindingSchema = z.object({
    testName: z.string().describe('The name of the test with an abnormal value (e.g., "Hemoglobin", "Blood Sugar").'),
    value: z.string().describe('The value found in the report (e.g., "10.5 g/dL", "150 mg/dL").'),
    normalRange: z.string().describe('The normal reference range for this test (e.g., "12.0-15.5 g/dL", "70-100 mg/dL").'),
    interpretation: z.string().describe('A very simple, one-sentence interpretation of this finding (e.g., "This is slightly lower than normal.", "This is higher than the normal range.").'),
});

export const SummarizeReportOutputSchema = z.object({
    isReportDetected: z.boolean().describe("Set to true if a medical report is detected in the image, otherwise false."),
    patientName: z.string().optional().describe("The patient's name, if found."),
    reportDate: z.string().optional().describe("The date of the report, if found."),
    summaryShort: z.string().describe("A single, very simple sentence (max 18 words) summarizing the report's key finding for a non-medical user."),
    summaryDetailed: z.string().describe("A 2-3 sentence detailed explanation of the findings in simple, easy-to-understand language."),
    riskLevel: z.enum(['low', 'moderate', 'high', 'unknown']).describe("The overall risk level based on the findings. Use 'unknown' if not clear."),
    abnormalFindings: z.array(AbnormalFindingSchema).describe("A list of all abnormal findings from the report."),
    doctorRemarks: z.string().optional().describe("Any final comments or remarks from the doctor, if present."),
    nextSteps: z.array(z.string()).describe("A short list of 2-3 recommended next steps, like 'Consult a doctor' or 'Monitor symptoms'.")
});
