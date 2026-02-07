'use client';

import type { SummarizeReportOutput } from '@/ai/flows/summarize-report-flow';
import { v4 as uuidv4 } from 'uuid';

export type SavedReport = SummarizeReportOutput & {
  id: string;
  savedAt: string;
};

const REPORTS_STORAGE_KEY = 'medicalReports';
const COMBINED_SUMMARY_KEY = 'combinedMedicalSummary';

// --- Combined Summary ---

export const getCombinedSummary = (): { summary: string, reportCount: number } | null => {
    if (typeof window === 'undefined') return null;
    try {
        const storedSummary = localStorage.getItem(COMBINED_SUMMARY_KEY);
        const reports = getReports();
        const summaryData = storedSummary ? JSON.parse(storedSummary) : { summary: '' };
        return { summary: summaryData.summary, reportCount: reports.length };
    } catch (e) {
        console.error("Failed to get combined summary", e);
        return null;
    }
}

// This function is called by other report actions, not directly from the UI
export const updateCombinedSummary = async (): Promise<void> => {
    if (typeof window === 'undefined') return;
    const reports = getReports();

    // This dispatches a storage event that other parts of the app can listen to.
    const dispatchStorageEvent = () => window.dispatchEvent(new Event('storage'));

    if (reports.length === 0) {
        localStorage.removeItem(COMBINED_SUMMARY_KEY);
        dispatchStorageEvent();
        return;
    }

    try {
        const response = await fetch('/api/summarize-reports', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reports }),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch combined summary from AI.');
        }

        const data = await response.json();
        localStorage.setItem(COMBINED_SUMMARY_KEY, JSON.stringify({ summary: data.combinedSummary }));
        dispatchStorageEvent();

    } catch(e) {
        console.error("Error updating combined summary:", e);
    }
};

// --- Report Management ---

export const getReports = (): SavedReport[] => {
  if (typeof window === 'undefined') return [];
  try {
    const storedReports = localStorage.getItem(REPORTS_STORAGE_KEY);
    const reports = storedReports ? JSON.parse(storedReports) : [];
    // sort by date, newest first
    return reports.sort((a: SavedReport, b: SavedReport) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
  } catch (error) {
    console.error("Failed to parse reports from localStorage", error);
    return [];
  }
};

export const saveReport = async (report: SummarizeReportOutput): Promise<SavedReport> => {
  const reports = getReports();
  const newReport: SavedReport = {
      ...report,
      id: uuidv4(),
      savedAt: new Date().toISOString()
  };
  const updatedReports = [...reports, newReport];
  localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(updatedReports));
  
  await updateCombinedSummary(); // Update combined summary after saving a new report
  
  return newReport;
};

export const deleteReport = async (reportId: string): Promise<void> => {
  const reports = getReports();
  const updatedReports = reports.filter(r => r.id !== reportId);
  localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(updatedReports));

  await updateCombinedSummary(); // Update combined summary after deleting a report
};
