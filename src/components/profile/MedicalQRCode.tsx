
'use client';

import React, { useRef, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface MedicalQRCodeProps {
  user: {
    name: string;
    age: number;
    bloodGroup: string;
    allergies: string[];
    medicalConditions: string[];
    phone: string;
  };
}

export function MedicalQRCode({ user }: MedicalQRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrUrl, setQrUrl] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const medicalSummary = {
        fullName: user.name,
        age: user.age,
        bloodGroup: user.bloodGroup,
        allergies: user.allergies,
        medicalConditions: user.medicalConditions,
        emergencyContact: user.phone,
        generatedAt: new Date().toISOString(),
    };

    try {
        const encodedData = btoa(JSON.stringify(medicalSummary));
        const url = `${window.location.origin}/medical-id?data=${encodedData}`;
        setQrUrl(url);
    } catch (e) {
        console.error("Error encoding data for QR Code:", e);
    }
  }, [user, isClient]);

  useEffect(() => {
    if (canvasRef.current && qrUrl) {
      QRCode.toCanvas(canvasRef.current, qrUrl, { width: 180, margin: 2, errorCorrectionLevel: 'H' }, (error) => {
        if (error) console.error(error);
      });
    }
  }, [qrUrl]);


  const handleDownload = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
      let downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = "medical-id-qr-code.png";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  if (!isClient) {
    return (
       <Card>
            <CardHeader>
                <CardTitle>Medical ID QR Code</CardTitle>
                <CardDescription>
                    In an emergency, anyone can scan this QR code to see your critical medical summary.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row items-center gap-6">
                <Skeleton className="h-[212px] w-[212px]" />
                <div className="flex-grow space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-48" />
                </div>
            </CardContent>
        </Card>
    );
  }
  
  if (!qrUrl) {
      return (
        <Card>
            <CardHeader>
                <CardTitle>Medical ID QR Code</CardTitle>
                <CardDescription>
                    In an emergency, anyone can scan this QR code to see your critical medical summary.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row items-center gap-6">
                 <div className="p-4 bg-muted rounded-lg border flex items-center justify-center" style={{width: 180 + 8*2, height: 180 + 8*2}}>
                    <Loader2 className="size-8 animate-spin text-muted-foreground" />
                </div>
                <div className="flex-grow text-center md:text-left">
                    <h3 className="font-semibold text-lg">Generating Your Medical ID...</h3>
                    <p className="text-muted-foreground mt-2 text-sm">
                        Please wait a moment while we create your secure QR code.
                    </p>
                    <Button disabled className="mt-4">
                        <Download className="mr-2" /> Download QR Code
                    </Button>
                </div>
            </CardContent>
        </Card>
      );
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle>Medical ID QR Code</CardTitle>
            <CardDescription>
                In an emergency, anyone can scan this QR code to see your critical medical summary.
            </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row items-center gap-6">
            <div className="p-4 bg-white rounded-lg border">
                <canvas ref={canvasRef} />
            </div>
            <div className="flex-grow text-center md:text-left">
                <h3 className="font-semibold text-lg">Your Medical ID is Ready</h3>
                <p className="text-muted-foreground mt-2 text-sm">
                    Download and save this QR code to your phone's lock screen, or print it to keep in your wallet.
                </p>
                <Button onClick={handleDownload} className="mt-4">
                    <Download className="mr-2" /> Download QR Code
                </Button>
            </div>
        </CardContent>
    </Card>
  );
}
