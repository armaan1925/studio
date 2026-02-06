'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Camera, CheckCircle, FileText, HeartPulse, Info, Loader2, ScanLine, ShieldAlert, TestTube2, XCircle, Upload, Trash2, ShieldCheck, CircleOff, NotebookText } from 'lucide-react';
import { getPillInformation } from './actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { ScanMedicineOutput } from '@/ai/flows/scan-medicine-flow';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { mockMedicine } from '@/lib/data';

export default function PillRecognitionClient() {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pillInfo, setPillInfo] = useState<ScanMedicineOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

    const imageDataUri = canvas.toDataURL('image/jpeg');
    setImagePreview(imageDataUri);
    setPillInfo(null);
    setError(null);
  };
  
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
        toast({
            variant: 'destructive',
            title: 'Invalid File Type',
            description: 'Please upload a JPG, PNG, or WEBP image.',
        });
        return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
        const base64Image = reader.result as string;
        setImagePreview(base64Image);
        setPillInfo(null);
        setError(null);
    };
    reader.onerror = () => {
        toast({
            variant: 'destructive',
            title: 'File Read Error',
            description: 'Could not read the selected file.',
        });
    };
    reader.readAsDataURL(file);
  };
  
  const handleScan = async () => {
    if (!imagePreview) return;

    setIsLoading(true);
    setPillInfo(null);
    setError(null);

    const result = await getPillInformation({ imageDataUri: imagePreview });

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

  const handleClear = () => {
    setImagePreview(null);
    setPillInfo(null);
    setError(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };
  
  const InfoSection = ({ title, content, icon, className }: { title: string; content: string; icon: React.ReactNode; className?: string; }) => (
    content ? <div className={className}>
        <h3 className="font-semibold text-lg flex items-center gap-2 mb-2">{icon} {title}</h3>
        <div className="prose prose-sm prose-stone dark:prose-invert max-w-none text-muted-foreground">
            {content.split('\n').map((line, i) => <p key={i}>{line}</p>)}
        </div>
    </div> : null
  );

  const MockResultCard = () => (
    <div className="space-y-6">
        <Badge variant="outline" className='absolute top-6 right-6'>Sample Analysis (Demo)</Badge>
        <div>
            <h2 className="text-2xl font-bold text-primary">{mockMedicine.medicineName}</h2>
            <p className="text-muted-foreground font-medium">Brand: {mockMedicine.brand}</p>
        </div>
        <div className='flex gap-2 flex-wrap'>
            <div className='flex items-center gap-1 text-sm border rounded-full px-3 py-1 bg-secondary text-secondary-foreground'>
                <TestTube2 className='size-4' /> {mockMedicine.medicineType}
            </div>
            <div className='flex items-center gap-1 text-sm border rounded-full px-3 py-1 bg-secondary text-secondary-foreground'>
                <HeartPulse className='size-4' /> {mockMedicine.drugClass}
            </div>
            <div className='flex items-center gap-1 text-sm border rounded-full px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'>
                <ShieldCheck className='size-4' /> AI Confidence: {mockMedicine.confidence}
            </div>
             <div className={`flex items-center gap-1 text-sm border rounded-full px-3 py-1 ${!mockMedicine.prescriptionRequired ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'}`}>
                {mockMedicine.prescriptionRequired ? <NotebookText className='size-4' /> : <CircleOff className='size-4' />}
                {mockMedicine.prescriptionRequired ? 'Prescription Required' : 'OTC Drug'}
            </div>
        </div>
        <Separator/>
        <InfoSection title="Summary" content={mockMedicine.summary} icon={<FileText className="size-5" />} />
        <InfoSection title="Uses" content={mockMedicine.uses} icon={<CheckCircle className="size-5" />} />
        <InfoSection title="How It Works" content={mockMedicine.howItWorks} icon={<Info className="size-5" />} />
        <InfoSection title="Safe Use Instructions" content={mockMedicine.safeUseInstructions} icon={<ShieldAlert className="size-5" />} />
        <InfoSection title="Common Side Effects" content={mockMedicine.commonSideEffects} icon={<AlertCircle className="size-5" />} />
        <InfoSection title="Serious Side Effects" content={mockMedicine.seriousSideEffects} icon={<AlertCircle className="size-5 text-destructive" />} />
        <InfoSection title="Warnings" content={mockMedicine.warnings} icon={<XCircle className="size-5 text-destructive" />} />
        <InfoSection title="When to Consult Doctor" content={mockMedicine.whenToConsultDoctor} icon={<HeartPulse className="size-5" />} />
    </div>
  );

  return (
    <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Camera className="text-primary"/> Pill Scanner</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="aspect-video bg-muted rounded-md overflow-hidden relative flex items-center justify-center">
                    {imagePreview ? (
                        <Image src={imagePreview} alt="Pill preview" layout="fill" objectFit="contain" />
                    ) : (
                        <>
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
                        </>
                    )}
                </div>
                <canvas ref={canvasRef} className="hidden" />
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/jpeg,image/png,image/webp,image/jpg" className="hidden" />

                {imagePreview ? (
                    <div className='mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2'>
                        <Button onClick={handleClear} variant="outline" disabled={isLoading}>
                           <Trash2 className="mr-2" /> Clear
                        </Button>
                        <Button onClick={handleScan} disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <ScanLine className="mr-2" />}
                            {isLoading ? 'Analyzing...' : 'Analyze Image'}
                        </Button>
                    </div>
                ) : (
                    <div className="w-full mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Button onClick={handleCapture} disabled={isLoading || hasCameraPermission !== true}>
                            <Camera className="mr-2" /> Capture Photo
                        </Button>
                         <Button onClick={handleUploadClick} variant="secondary" disabled={isLoading}>
                            <Upload className="mr-2" /> Upload Image
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
        
        <Card className="relative">
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
                            <p className="text-muted-foreground font-medium">{pillInfo.brand ? `Brand: ${pillInfo.brand}` : pillInfo.genericName}</p>
                        </div>
                         <div className='flex gap-2 flex-wrap'>
                            <div className='flex items-center gap-1 text-sm border rounded-full px-3 py-1 bg-secondary text-secondary-foreground'>
                                <TestTube2 className='size-4' /> {pillInfo.medicineType}
                            </div>
                            <div className='flex items-center gap-1 text-sm border rounded-full px-3 py-1 bg-secondary text-secondary-foreground'>
                                <HeartPulse className='size-4' /> {pillInfo.drugClass}
                            </div>
                            {pillInfo.confidence && (
                                <div className='flex items-center gap-1 text-sm border rounded-full px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'>
                                    <ShieldCheck className='size-4' /> AI Confidence: {pillInfo.confidence}
                                </div>
                            )}
                             {pillInfo.prescriptionRequired !== undefined && (
                                <div className={`flex items-center gap-1 text-sm border rounded-full px-3 py-1 ${!pillInfo.prescriptionRequired ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'}`}>
                                    {pillInfo.prescriptionRequired ? <NotebookText className='size-4' /> : <CircleOff className='size-4' />}
                                    {pillInfo.prescriptionRequired ? 'Prescription Required' : 'OTC Drug'}
                                </div>
                             )}
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

                {!isLoading && !pillInfo && !error && !imagePreview && (
                   <MockResultCard />
                )}
                 {!isLoading && !pillInfo && !error && imagePreview && (
                    <div className="text-center text-muted-foreground py-10">
                        <Info className="mx-auto size-12" />
                        <p className="mt-4">Click "Analyze Image" to get information about the pill.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
