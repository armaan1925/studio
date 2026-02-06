'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Camera, CheckCircle, FileText, HeartPulse, Info, Loader2, ScanLine, ShieldAlert, TestTube2, XCircle } from 'lucide-react';
import { getPillInformation } from './actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { IdentifyPillOutput } from '@/ai/flows/identify-pill-flow';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

export default function PillRecognitionClient() {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pillInfo, setPillInfo] = useState<IdentifyPillOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getCameraPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasCameraPermission(false);
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this feature.',
        });
      }
    };

    getCameraPermission();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [toast]);

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsLoading(true);
    setPillInfo(null);
    setError(null);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

    const imageDataUri = canvas.toDataURL('image/jpeg');

    const result = await getPillInformation({ imageDataUri });

    if (result.success && result.data) {
        if (result.data.summary.toLowerCase().includes('cannot identify') || result.data.summary.toLowerCase().includes('error')) {
            setError(result.data.summary || 'Could not identify the pill from the image.');
            setPillInfo(null);
        } else {
            setPillInfo(result.data);
        }
    } else {
      setError(result.error ?? 'An unknown error occurred.');
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: result.error,
      });
    }
    setIsLoading(false);
  };
  
  const InfoSection = ({ title, content, icon, className }: { title: string; content: string; icon: React.ReactNode; className?: string; }) => (
    content ? <div className={className}>
        <h3 className="font-semibold text-lg flex items-center gap-2 mb-2">{icon} {title}</h3>
        <div className="prose prose-sm prose-stone dark:prose-invert max-w-none text-muted-foreground">
            {content.split('\n').map((line, i) => <p key={i}>{line}</p>)}
        </div>
    </div> : null
  );

  return (
    <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Camera className="text-primary"/> Camera</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="aspect-video bg-muted rounded-md overflow-hidden relative flex items-center justify-center">
                    <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <ScanLine className="size-24 text-white/50 animate-pulse" />
                    </div>
                    {hasCameraPermission === false && (
                        <div className='absolute inset-0 bg-background/80 flex flex-col items-center justify-center text-center p-4'>
                            <Alert variant="destructive">
                                <AlertTitle>Camera Access Required</AlertTitle>
                                <AlertDescription>
                                    Please allow camera access to use this feature. You may need to change permissions in your browser settings.
                                </AlertDescription>
                            </Alert>
                        </div>
                    )}
                </div>
                <canvas ref={canvasRef} className="hidden" />
                <Button onClick={handleCapture} disabled={isLoading || hasCameraPermission !== true} className="w-full mt-4">
                    {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <Camera className="mr-2" />}
                    {isLoading ? 'Analyzing...' : 'Identify Pill'}
                </Button>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Info className="text-primary"/> Pill Information</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading && (
                     <div className="space-y-4">
                        <Skeleton className="h-8 w-1/2" />
                        <Skeleton className="h-4 w-1/3" />
                        <Separator />
                        <Skeleton className="h-6 w-1/4" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-6 w-1/4" />
                        <Skeleton className="h-16 w-full" />
                     </div>
                )}
                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Identification Failed</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                {pillInfo && !error && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold text-primary">{pillInfo.medicineName}</h2>
                            <p className="text-muted-foreground font-medium">{pillInfo.genericName}</p>
                        </div>
                        <div className='flex gap-2 flex-wrap'>
                            <div className='flex items-center gap-1 text-sm border rounded-full px-3 py-1 bg-secondary text-secondary-foreground'>
                                <TestTube2 className='size-4' /> {pillInfo.medicineType}
                            </div>
                            <div className='flex items-center gap-1 text-sm border rounded-full px-3 py-1 bg-secondary text-secondary-foreground'>
                                <HeartPulse className='size-4' /> {pillInfo.drugClass}
                            </div>
                        </div>
                        <Separator/>
                        <InfoSection title="Summary" content={pillInfo.summary} icon={<FileText className="size-5" />} />
                        <InfoSection title="Uses" content={pillInfo.uses} icon={<CheckCircle className="size-5" />} />
                        <InfoSection title="How It Works" content={pillInfo.howItWorks} icon={<Info className="size-5" />} />
                        <InfoSection title="Safe Use Instructions" content={pillInfo.safeUseInstructions} icon={<ShieldAlert className="size-5" />} />
                        <InfoSection title="Common Side Effects" content={pillInfo.commonSideEffects} icon={<AlertCircle className="size-5" />} />
                        <InfoSection title="Serious Side Effects" content={pillInfo.seriousSideEffects} icon={<AlertCircle className="size-5 text-destructive" />} />
                        <InfoSection title="Warnings" content={pillInfo.warnings} icon={<XCircle className="size-5 text-destructive" />} />
                        <InfoSection title="When to Consult Doctor" content={pillInfo.whenToConsultDoctor} icon={<HeartPulse className="size-5" />} />
                    </div>
                )}
                {!isLoading && !pillInfo && !error && (
                    <div className="text-center text-muted-foreground py-10">
                        <Info className="mx-auto size-12" />
                        <p className="mt-4">Information about the identified pill will be displayed here.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
