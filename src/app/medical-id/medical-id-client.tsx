
'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, User, Droplet, ShieldAlert, HeartPulse, Phone } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

interface MedicalSummary {
  fullName: string;
  age: number;
  bloodGroup: string;
  allergies: string[];
  medicalConditions: string[];
  emergencyContact: string;
  generatedAt: string;
}

const InfoRow = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: React.ReactNode }) => (
    <div className="flex items-start gap-4 py-3">
        <div className="text-primary mt-1">{icon}</div>
        <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="font-medium text-lg">{value}</p>
        </div>
    </div>
);

export default function MedicalIdClient() {
    const searchParams = useSearchParams();
    const [summary, setSummary] = useState<MedicalSummary | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const data = searchParams.get('data');
        if (data) {
            try {
                const decodedData = atob(data);
                const parsedData = JSON.parse(decodedData);
                // Basic validation
                if (parsedData.fullName && parsedData.age) {
                    setSummary(parsedData);
                } else {
                   throw new Error("Incomplete medical data.");
                }
            } catch (e) {
                console.error("Failed to parse medical ID data:", e);
                setError("Invalid or corrupted medical ID data. The QR code may be incorrect or expired.");
            }
        } else {
            setError("No medical ID data found. Please scan a valid QR code.");
        }
    }, [searchParams]);

    if (error) {
        return (
            <Alert variant="destructive" className="max-w-lg mx-auto">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    if (!summary) {
        return (
            <Card className="max-w-lg mx-auto">
                <CardHeader>
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64 mt-2" />
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </CardContent>
            </Card>
        )
    }
    
    const generatedDate = new Date(summary.generatedAt).toLocaleString();

    return (
        <Card className="max-w-lg mx-auto border-red-500/50 dark:border-red-500/30">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-destructive flex items-center gap-2">
                    <HeartPulse /> Emergency Medical Summary
                </CardTitle>
                <CardDescription>
                    This information was generated on {generatedDate}.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Separator className="mb-4" />
                <InfoRow icon={<User size={20} />} label="Full Name" value={summary.fullName} />
                <Separator />
                <div className="grid grid-cols-2">
                    <InfoRow icon={<User size={20} />} label="Age" value={summary.age} />
                    <InfoRow icon={<Droplet size={20} />} label="Blood Group" value={summary.bloodGroup} />
                </div>
                <Separator />
                <InfoRow icon={<ShieldAlert size={20} />} label="Allergies" value={summary.allergies.join(', ') || 'None reported'} />
                <Separator />
                <InfoRow icon={<HeartPulse size={20} />} label="Existing Medical Conditions" value={summary.medicalConditions.join(', ') || 'None reported'} />
                <Separator />
                <InfoRow icon={<Phone size={20} />} label="Emergency Contact" value={summary.emergencyContact} />
            </CardContent>
        </Card>
    );
}
