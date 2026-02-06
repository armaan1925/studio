'use client';

import { motion } from 'framer-motion';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { CheckCircle, ShieldCheck } from 'lucide-react';

const mockMedicine = {
  name: 'Paracetamol 500mg',
  use: 'Fever and pain relief',
  dosage: 'Twice daily',
  confidence: '98%',
};

export function DemoPreview() {
  return (
    <motion.div
      className="mt-16 md:mt-24"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <h2 className="text-center text-3xl font-bold tracking-tight">
        Example AI Medicine Analysis
      </h2>
      <p className="text-center text-lg text-slate-400 mt-2">
        Get clear and simple information instantly.
      </p>
      <Card className="mt-8 max-w-2xl mx-auto bg-slate-900/40 border-purple-500/20 backdrop-blur-lg text-slate-100 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-cyan-300">
            {mockMedicine.name}
          </CardTitle>
          <div className="flex items-center gap-2 pt-2">
            <Badge variant="secondary" className="bg-cyan-400/10 text-cyan-300 border-cyan-400/20">
              Analgesic
            </Badge>
            <Badge variant="secondary" className="bg-purple-400/10 text-purple-300 border-purple-400/20">
              Antipyretic
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Separator className="bg-purple-500/20 mb-4" />
          <div className="space-y-4 text-slate-300">
            <div className="flex justify-between items-center">
              <span className="font-medium text-slate-400 flex items-center gap-2">
                <CheckCircle className="text-green-400 size-5" /> Main Use
              </span>
              <span className="font-bold text-lg">{mockMedicine.use}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium text-slate-400">Dosage</span>
              <span className="font-semibold">{mockMedicine.dosage}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium text-slate-400 flex items-center gap-2">
                <ShieldCheck className="text-blue-400 size-5" /> AI Confidence
              </span>
              <span className="font-bold text-lg text-green-400">
                {mockMedicine.confidence}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
