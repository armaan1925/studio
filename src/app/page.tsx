'use client';

import { useVoiceAssistant } from '@/context/voice-assistant-context';
import { DemoPreview } from '@/components/home/demo-preview';
import { FeatureCard } from '@/components/home/feature-card';
import { HomeHero } from '@/components/home/hero';
import { Bot, Mic, NotebookText, ScanLine } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    title: 'Pill Scanner',
    description: 'Scan any medicine using your camera or by uploading an image.',
    href: '/pill-recognition',
    icon: <ScanLine className="size-10" />,
  },
  {
    title: 'Medical Summary',
    description: 'Understand prescriptions and medical reports with AI-powered summaries.',
    href: '/medical-summary',
    icon: <NotebookText className="size-10" />,
  },
  {
    title: 'AI Chat Assistant',
    description: 'Ask any medical or health-related question to our friendly AI.',
    href: '/assistant',
    icon: <Bot className="size-10" />,
  },
  {
    title: 'Voice Assistant',
    description: 'Talk with our AI assistant for hands-free help and guidance.',
    icon: <Mic className="size-10" />,
    onClick: true,
  },
];

export default function Home() {
  const { toggleAssistant } = useVoiceAssistant();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-950 to-black text-white overflow-x-hidden">
      <div className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]"></div>
      <main className="container mx-auto px-4 py-8 md:py-12">
        <HomeHero />

        <motion.div
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={itemVariants}>
              <FeatureCard
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                href={feature.onClick ? undefined : feature.href}
                onClick={feature.onClick ? toggleAssistant : undefined}
              />
            </motion.div>
          ))}
        </motion.div>

        <DemoPreview />
      </main>
    </div>
  );
}
