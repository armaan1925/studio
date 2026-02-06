'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Camera, CheckCircle, FileText, HeartPulse, Info, Languages, Loader2, Mic, ScanLine, ShieldAlert, TestTube2, XCircle, Upload, Trash2, ShieldCheck, CircleOff, NotebookText, Stethoscope, User, FileClock, Activity } from 'lucide-react';
import { getPrescriptionSummary, getMedicineInfo } from './actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { SummarizePrescriptionOutput } from '@/ai/flows/summarize-prescription-flow';
import type { ScanMedicineOutput } from '@/ai/flows/scan-medicine-flow';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockMedicine, mockPrescription } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSpeechSynthesis } from '@/hooks/use-speech-synthesis';

const languages = [
    { value: 'English', label: 'English' },
    { value: 'Hindi', label: 'Hindi' },
    { value: 'Hinglish', label: 'Hinglish' },
    { value: 'Bengali', label: 'Bengali' },
    { value: 'Tamil', label: 'Tamil' },
    { value: 'Telugu', label: 'Telugu' },
    { value: 'Marathi', label: 'Marathi' },
];

export default function MedicalSummaryClient() {
    const { toast } = useToast();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [activeTab, setActiveTab] = useState('prescription');
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedLanguage, setSelectedLanguage] = useState('English');
    const { speak, isSpeaking } = useSpeechSynthesis();

    const [prescriptionResult, setPrescriptionResult] = useState<SummarizePrescriptionOutput | null>(null);
    const [medicineResult, setMedicineResult] = useState<ScanMedicineOutput | null>(null);
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
            }
        };
        getCameraPermission();
    }, []);

    const handleCapture = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d')?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const imageDataUri = canvas.toDataURL('image/jpeg');
        setImagePreview(imageDataUri);
        clearResults();
    };

    const handleUploadClick = () => fileInputRef.current?.click();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
            clearResults();
        };
        reader.readAsDataURL(file);
    };

    const handleScan = async () => {
        if (!imagePreview) return;
        setIsLoading(true);
        clearResults();

        let result;
        if (activeTab === 'prescription') {
            result = await getPrescriptionSummary({ imageDataUri: imagePreview, language: selectedLanguage });
            if (result.success && result.data) setPrescriptionResult(result.data);
        } else {
            result = await getMedicineInfo({ imageDataUri: imagePreview });
            if (result.success && result.data) setMedicineResult(result.data);
        }

        if (!result.success) {
            setError(result.error ?? 'An unknown error occurred.');
            toast({ variant: 'destructive', title: 'Analysis Failed', description: result.error });
        }
        setIsLoading(false);
    };
    
    const handleListen = () => {
        let textToSpeak = '';
        if (activeTab === 'prescription') {
            textToSpeak = prescriptionResult?.summary || mockPrescription.summary;
        } else {
            textToSpeak = medicineResult?.summary || mockMedicine.summary;
        }
        speak(textToSpeak);
    }

    const clearResults = () => {
        setPrescriptionResult(null);
        setMedicineResult(null);
        setError(null);
    };

    const handleClearPreview = () => {
        setImagePreview(null);
        clearResults();
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const InfoSection = ({ title, content, icon, className }: { title: string; content: React.ReactNode; icon?: React.ReactNode; className?: string; }) => (
        content ? <div className={className}>
            <h3 className="font-semibold text-lg flex items-center gap-2 mb-2">{icon} {title}</h3>
            <div className="prose prose-sm prose-stone dark:prose-invert max-w-none text-muted-foreground">
                {typeof content === 'string' ? content.split('\n').map((line, i) => <p key={i}>{line}</p>) : content}
            </div>
        </div> : null
      );

    const renderScanner = () => (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    {activeTab === 'prescription' ? <Stethoscope className="text-primary" /> : <TestTube2 className="text-primary" />}
                    {activeTab === 'prescription' ? 'Prescription Scanner' : 'Medicine Scanner'}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="aspect-video bg-muted rounded-md overflow-hidden relative flex items-center justify-center">
                    {imagePreview ? (
                        <Image src={imagePreview} alt="Preview" layout="fill" objectFit="contain" />
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
                                        <AlertDescription>Enable camera permissions to use this feature.</AlertDescription>
                                    </Alert>
                                </div>
                            )}
                        </>
                    )}
                </div>
                <canvas ref={canvasRef} className="hidden" />
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,application/pdf" className="hidden" />
                {imagePreview ? (
                    <div className='mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2'>
                        <Button onClick={handleClearPreview} variant="outline" disabled={isLoading}><Trash2 className="mr-2" /> Clear</Button>
                        <Button onClick={handleScan} disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <ScanLine className="mr-2" />}
                            {isLoading ? 'Analyzing...' : 'Analyze Image'}
                        </Button>
                    </div>
                ) : (
                    <div className="w-full mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Button onClick={handleCapture} disabled={isLoading || hasCameraPermission !== true}><Camera className="mr-2" /> Capture</Button>
                        <Button onClick={handleUploadClick} variant="secondary" disabled={isLoading}><Upload className="mr-2" /> Upload</Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );

    const renderPrescriptionResult = (data: SummarizePrescriptionOutput, isMock = false) => (
        <div className="space-y-6">
            {isMock && <Badge variant="outline" className='absolute top-6 right-6'>Sample Analysis (Demo)</Badge>}
            <InfoSection title="Summary" content={data.summary} icon={<FileText className="size-5" />} />
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoSection title="Patient" content={data.patientName} icon={<User className="size-5" />} />
                <InfoSection title="Doctor" content={data.doctorName} icon={<Stethoscope className="size-5" />} />
            </div>
            <InfoSection title="Diagnosis" content={data.diagnosis} icon={<Activity className="size-5" />} />
            <InfoSection title="Medicines" content={<ul className='list-disc pl-5 space-y-1'>{data.medicines.map((m, i) => <li key={i}>{m}</li>)}</ul>} icon={<TestTube2 className="size-5" />} />
            <InfoSection title="Dosage Instructions" content={<ul className='list-disc pl-5 space-y-1'>{data.dosageInstructions.map((d, i) => <li key={i}>{d}</li>)}</ul>} icon={<FileClock className="size-5" />} />
            <InfoSection title="Precautions" content={<ul className='list-disc pl-5 space-y-1'>{data.precautions.map((p, i) => <li key={i}>{p}</li>)}</ul>} icon={<ShieldAlert className="size-5" />} />
        </div>
    );
    
    const renderMedicineResult = (data: ScanMedicineOutput, isMock = false) => (
        <div className="space-y-6">
            {isMock && <Badge variant="outline" className='absolute top-6 right-6'>Sample Analysis (Demo)</Badge>}
            <div>
                <h2 className="text-2xl font-bold text-primary">{data.medicineName}</h2>
                <p className="text-muted-foreground font-medium">{data.brand ? `Brand: ${data.brand}` : data.genericName}</p>
            </div>
            <div className='flex gap-2 flex-wrap'>
                {data.medicineType && <Badge><TestTube2 className='size-4 mr-1' /> {data.medicineType}</Badge>}
                {data.drugClass && <Badge><HeartPulse className='size-4 mr-1' /> {data.drugClass}</Badge>}
                {data.confidence && <Badge variant="secondary"><ShieldCheck className='size-4 mr-1' /> AI Confidence: {data.confidence}</Badge>}
                {data.prescriptionRequired !== undefined && <Badge variant={!data.prescriptionRequired ? 'default' : 'destructive'} className={!data.prescriptionRequired ? 'bg-green-600' : ''}><CircleOff className='size-4 mr-1' /> {data.prescriptionRequired ? 'Prescription Required' : 'OTC Drug'}</Badge>}
            </div>
            <Separator/>
            <InfoSection title="Summary" content={data.summary} icon={<FileText className="size-5" />} />
            <InfoSection title="Uses" content={data.uses} icon={<CheckCircle className="size-5" />} />
            <InfoSection title="How It Works" content={data.howItWorks} icon={<Info className="size-5" />} />
            <InfoSection title="Safe Use Instructions" content={data.safeUseInstructions} icon={<ShieldAlert className="size-5" />} />
            <InfoSection title="Common Side Effects" content={data.commonSideEffects} icon={<AlertCircle className="size-5" />} />
            <InfoSection title="Serious Side Effects" content={data.seriousSideEffects} icon={<AlertCircle className="size-5 text-destructive" />} />
            <InfoSection title="Warnings" content={data.warnings} icon={<XCircle className="size-5 text-destructive" />} />
            <InfoSection title="When to Consult Doctor" content={data.whenToConsultDoctor} icon={<HeartPulse className="size-5" />} />
        </div>
    );

    const renderResultCard = () => {
        const isPrescriptionTab = activeTab === 'prescription';
        const currentResult = isPrescriptionTab ? prescriptionResult : medicineResult;
        const mockData = isPrescriptionTab ? mockPrescription : mockMedicine;
        const renderer = isPrescriptionTab ? renderPrescriptionResult : renderMedicineResult;
        
        return (
            <Card className="relative">
                <CardHeader>
                    <div className='flex justify-between items-center'>
                        <CardTitle className="flex items-center gap-2"><Info className="text-primary"/> AI Summary</CardTitle>
                        <Button size="sm" onClick={handleListen} disabled={isSpeaking}>
                            {isSpeaking ? <Loader2 className='animate-spin mr-2'/> : <Mic className="mr-2" />}
                            Listen
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading && <div className="space-y-4"> {[...Array(5)].map((_, i) => <Skeleton key={i} className={`h-4 w-${i % 2 === 0 ? 'full' : '3/4'}`} />)} </div>}
                    {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Analysis Failed</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
                    
                    {!isLoading && !error && currentResult && renderer(currentResult as any)}
                    {!isLoading && !error && !currentResult && !imagePreview && renderer(mockData as any, true)}
                    {!isLoading && !error && !currentResult && imagePreview && (
                        <div className="text-center text-muted-foreground py-10">
                            <Info className="mx-auto size-12" />
                            <p className="mt-4">Click "Analyze Image" to get a summary.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="mt-6">
            <Tabs value={activeTab} onValueChange={(value) => {setActiveTab(value); handleClearPreview();}} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="prescription">Prescription Scanner</TabsTrigger>
                    <TabsTrigger value="medicine">Medicine Scanner</TabsTrigger>
                </TabsList>
                <div className='my-4 flex items-center gap-4'>
                    <div className='flex-grow' />
                    <div className='flex items-center gap-2 text-sm font-medium'>
                        <Languages className='size-5 text-primary' />
                        <span>Summary Language:</span>
                    </div>
                    <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                            {languages.map(lang => (
                                <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                    <TabsContent value="prescription" className='m-0'>{renderScanner()}</TabsContent>
                    <TabsContent value="medicine" className='m-0'>{renderScanner()}</TabsContent>
                    {renderResultCard()}
                </div>
            </Tabs>
        </div>
    );
}
