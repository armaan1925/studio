'use client';

import { useState, useEffect } from 'react';
import { deleteReport, getReports, type SavedReport } from '@/lib/reports';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { ArrowRight, FileText, Info, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { AnimatePresence, motion } from 'framer-motion';

function ReportItem({ report, onDelete }: { report: SavedReport; onDelete: (id: string) => void }) {
    const context = btoa(JSON.stringify(report));
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ type: 'spring', stiffness: 500, damping: 50 }}
            className="p-4 border rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
            <div className="flex-grow">
                <p className="font-semibold">{report.summaryShort}</p>
                <p className="text-sm text-muted-foreground">
                    Report Date: {report.reportDate ? format(new Date(report.reportDate), 'PPP') : 'N/A'}
                </p>
            </div>
            <div className="flex gap-2 shrink-0">
                <Button asChild variant="secondary" size="sm">
                    <Link href={`/assistant?reportContext=${context}`}>
                        <ArrowRight className='mr-2' /> Ask AI
                    </Link>
                </Button>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                            <Trash2 className='mr-2' /> Delete
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete this report. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDelete(report.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </motion.div>
    );
}

export default function MedicalReports() {
    const [reports, setReports] = useState<SavedReport[]>([]);
    const [isClient, setIsClient] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        setIsClient(true);
        setReports(getReports());
    }, []);

    const handleDelete = async (reportId: string) => {
        await deleteReport(reportId);
        setReports(getReports());
        toast({
            title: "Report Deleted",
            description: "The medical report has been removed successfully.",
        });
    };

    if (!isClient) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>My Medical Reports</CardTitle>
                    <CardDescription>A centralized list of all your saved medical reports.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-24 w-full bg-muted rounded-lg animate-pulse"></div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>My Medical Reports</CardTitle>
                <CardDescription>A centralized list of all your saved medical reports.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <AnimatePresence>
                        {reports.length > 0 ? (
                            reports.map(report => (
                                <ReportItem key={report.id} report={report} onDelete={handleDelete} />
                            ))
                        ) : (
                            <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
                                <FileText className="mx-auto size-12" />
                                <p className="mt-4 font-medium">No Reports Found</p>
                                <p className='text-sm'>Scan and save a report from the "Medical Summary" page.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </CardContent>
        </Card>
    );
}
