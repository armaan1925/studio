'use client';

import { motion } from 'framer-motion';
import { BrainCircuit } from 'lucide-react';

export function HomeHero() {
  return (
    <motion.div
      className="text-center py-16 md:py-24"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <motion.div
        className="relative mx-auto w-fit"
        initial={{ y: 0 }}
        animate={{ y: [-5, 5, -5] }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <BrainCircuit className="absolute -top-8 -left-12 size-12 md:-top-10 md:-left-16 md:size-16 text-cyan-400/50" />
      </motion.div>

      <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 text-transparent bg-clip-text animate-text-glow">
        Chiranjeevani.AI
      </h1>
      <p className="mt-4 text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">
        Scan, Understand, and Manage Your Medicines with AI
      </p>
    </motion.div>
  );
}
