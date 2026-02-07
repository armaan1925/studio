'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { currentUser } from '@/lib/data';
import { motion } from 'framer-motion';
import { Lightbulb, FileHeart, Sparkles, Loader2, FolderKanban } from 'lucide-react';
import { Badge } from '../ui/badge';
import { getCombinedSummary, type SavedReport } from '@/lib/reports';

type DailyInsights = {
  tips: string[];
  historySummary: string;
  isDemo?: boolean;
};

type CachedData = {
  date: string;
  data: DailyInsights;
};

const mockInsightsData: DailyInsights = {
  isDemo: true,
  tips: [
    "Drink at least 2–3 liters of water today to stay hydrated.",
    "Take your medicines after food to avoid stomach irritation.",
    "Maintain proper sleep of 7–8 hours for better recovery.",
    "Avoid outside food if you are recovering from infection."
  ],
  historySummary: "You recently had mild fever and throat infection. Your prescribed medicines help reduce fever and control infection. Follow proper rest, hydration, and complete your medication course for faster recovery."
};


export function PersonalizedInsights() {
  const [insights, setInsights] = useState<DailyInsights | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [combinedSummary, setCombinedSummary] = useState<{ summary: string, reportCount: number } | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const fetchInsights = async () => {
      setIsLoading(true);
      const today = new Date().toISOString().split('T')[0];

      try {
        const cachedItem = localStorage.getItem('dailyHealthInsights');
        if (cachedItem) {
          const { date, data }: CachedData = JSON.parse(cachedItem);
          if (date === today) {
            setInsights(data);
            setIsLoading(false);
            return;
          }
        }

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
          setInsights(mockInsightsData);
          setIsLoading(false);
          return;
        }

        const data: DailyInsights = await response.json();
        setInsights(data);
        localStorage.setItem('dailyHealthInsights', JSON.stringify({ date: today, data }));

      } catch (e: any) {
        setInsights(mockInsightsData);
      } finally {
        setIsLoading(false);
      }
    };
    
    const loadCombinedSummary = () => {
        const summaryData = getCombinedSummary();
        setCombinedSummary(summaryData);
    };

    fetchInsights();
    loadCombinedSummary();

    // Listen for storage changes to update the combined summary in real-time
    const handleStorageChange = () => {
        loadCombinedSummary();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };

  }, [isClient]);

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
        <div className="h-32 w-full bg-slate-800/50 rounded-lg animate-pulse"></div>
    </div>
  )

  const renderContent = () => (
     <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8 relative">
        {insights?.isDemo && (
             <Badge variant="outline" className="absolute -top-4 right-0 bg-cyan-400/10 text-cyan-300 border border-cyan-400/30 animate-pulse">
                Demo AI Health Insights
            </Badge>
        )}
        
        <motion.div variants={itemVariants}>
            <Card className="bg-slate-900/40 border-purple-500/20 backdrop-blur-lg text-slate-100 overflow-hidden">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between text-lg text-purple-300">
                        <span className='flex items-center gap-3'><FileHeart /> Your Medical Summary</span>
                        <Badge variant="secondary">{combinedSummary?.reportCount || 0} Reports</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-slate-300">
                        {combinedSummary?.summary || "No medical reports available yet. Scan and save a report to get your combined summary."}
                    </p>
                </CardContent>
            </Card>
        </motion.div>

        {insights?.tips && (
            <motion.div variants={itemVariants}>
                <Card className="bg-slate-900/40 border-cyan-500/20 backdrop-blur-lg text-slate-100 overflow-hidden">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-lg text-cyan-300">
                           <Sparkles /> Daily Health Tips
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            {insights.tips.map((tip, index) => (
                                <li key={index} className="flex items-start gap-3 text-slate-300">
                                    <Lightbulb className="size-5 mt-0.5 shrink-0 text-cyan-400" />
                                    <span>{tip}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </motion.div>
        )}
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
            {!isClient || isLoading ? renderLoading() : (insights ? renderContent() : null)}
        </div>
    </div>
  );
}
