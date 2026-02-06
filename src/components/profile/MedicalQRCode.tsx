
'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import QRCode from 'qrcode';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

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

  const medicalSummary = useMemo(() => ({
    fullName: user.name,
    age: user.age,
    bloodGroup: user.bloodGroup,
    allergies: user.allergies,
    medicalConditions: user.medicalConditions,
    emergencyContact: user.phone,
    generatedAt: new Date().toISOString(),
  }), [user]);

  const encodedData = useMemo(() => {
    if (typeof window !== 'undefined') {
      try {
        return btoa(JSON.stringify(medicalSummary));
      } catch (e) {
        console.error("Error encoding data:", e);
        return "";
      }
    }
    return '';
  }, [medicalSummary]);

  const qrUrl = useMemo(() => {
    if (typeof window !== 'undefined' && encodedData) {
      return `${window.location.origin}/medical-id?data=${encodedData}`;
    }
    return '';
  }, [encodedData]);

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
  
  if (!qrUrl) return null;

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
