'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AIDisclaimer() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem('hideAIDisclaimer');
      if (dismissed !== 'true') {
        setIsVisible(true);
      }
    } catch (error) {
      console.error("Could not access localStorage:", error);
      // If localStorage is not available, just show the banner
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      localStorage.setItem('hideAIDisclaimer', 'true');
    } catch (error) {
       console.error("Could not write to localStorage:", error);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, height: 0, margin: 0, padding: 0 }}
          transition={{ duration: 0.3 }}
          className={cn(
            'relative mx-4 mt-3 rounded-xl border border-yellow-400/30 bg-yellow-500/10 px-4 py-3 text-yellow-200 shadow-lg shadow-yellow-500/10 backdrop-blur-xl'
          )}
          role="alert"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <p className="flex-grow text-sm font-medium">
              AI-generated content for educational purposes only. Always consult a qualified healthcare professional for medical advice.
            </p>
            <button
              onClick={handleDismiss}
              aria-label="Dismiss disclaimer"
              className="-my-1 -mr-2 rounded-full p-1.5 text-yellow-200/70 transition-colors hover:bg-white/10 hover:text-yellow-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
