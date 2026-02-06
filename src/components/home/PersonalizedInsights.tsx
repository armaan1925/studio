'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { currentUser } from '@/lib/data';
import { motion } from 'framer-motion';
import { Lightbulb, FileHeart, Sparkles, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

type DailyInsights = {
  tips: string[];
  historySummary: string;
};

type CachedData = {
  date: string;
  data: DailyInsights;
};

const mockTips = [
    "Remember to drink plenty of water throughout the day.",
    "Aim for 7-8 hours of quality sleep tonight.",
    "A short walk can boost your energy and mood.",
];

export function PersonalizedInsights() {
  const [insights, setInsights] = useState<DailyInsights | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      setIsLoading(true);
      setError(null);
      const today = new Date().toISOString().split('T')[0];

      try {
        // Check cache first
        const cachedItem = localStorage.getItem('dailyHealthInsights');
        if (cachedItem) {
          const { date, data }: CachedData = JSON.parse(cachedItem);
          if (date === today) {
            setInsights(data);
            setIsLoading(false);
            return;
          }
        }

        // Fetch from API if cache is old or doesn't exist
        const response = await fetch('/api/generate-daily-tips', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userProfile: {
                name: currentUser.name,
                age: currentUser.age,
                allergies: currentUser.allergies,
                medicalConditions: currentUser.medicalConditions,
            },
            language: currentUser.preferredLanguage,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch insights from AI.');
        }

        const data: DailyInsights = await response.json();
        setInsights(data);

        // Update cache
        localStorage.setItem('dailyHealthInsights', JSON.stringify({ date: today, data }));

      } catch (e: any) {
        console.error("Failed to get daily insights:", e);
        setError(e.message || "Could not load AI-powered insights.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsights();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
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
      },
    },
  };

  const renderLoading = () => (
    <div className="space-y-4">
        <div className="flex items-center gap-2 text-slate-400">
            <Loader2 className="animate-spin" />
            <p>Generating your personalized AI insights for today...</p>
        </div>
        <div className="h-24 w-full bg-slate-800/50 rounded-lg animate-pulse"></div>
    </div>
  )

  const renderError = () => (
     <Alert variant="destructive">
        <AlertTitle>Could not load insights</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
    </Alert>
  )

  const renderContent = () => (
     <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
        {insights?.historySummary && (
            <motion.div variants={itemVariants}>
                <Card className="bg-slate-900/40 border-purple-500/20 backdrop-blur-lg text-slate-100 overflow-hidden">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-lg text-purple-300">
                            <FileHeart /> Medical Snapshot
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-slate-300">{insights.historySummary}</p>
                    </CardContent>
                </Card>
            </motion.div>
        )}
        <motion.div variants={itemVariants}>
            <Card className="bg-slate-900/40 border-cyan-500/20 backdrop-blur-lg text-slate-100 overflow-hidden">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-lg text-cyan-300">
                       <Sparkles /> Daily Health Tips
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-3">
                        {(insights?.tips || mockTips).map((tip, index) => (
                            <li key={index} className="flex items-start gap-3 text-slate-300">
                                <Lightbulb className="size-5 mt-0.5 shrink-0 text-cyan-400" />
                                <span>{tip}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </motion.div>
     </motion.div>
  )

  return (
    <div className="my-16 md:my-24">
        <h2 className="text-center text-3xl font-bold tracking-tight">
            Your Personal AI Health Dashboard
        </h2>
        <p className="text-center text-lg text-slate-400 mt-2 mb-8">
            Insights tailored just for you, updated daily.
        </p>
        <div className="max-w-3xl mx-auto">
            {isLoading ? renderLoading() : error ? renderError() : renderContent()}
        </div>
    </div>
  );
}
