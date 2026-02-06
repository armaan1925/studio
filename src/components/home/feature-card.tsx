'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type FeatureCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  href?: string;
  onClick?: () => void;
  className?: string;
};

export function FeatureCard({
  icon,
  title,
  description,
  href,
  onClick,
  className,
}: FeatureCardProps) {
  const content = (
    <motion.div
      className={cn(
        'group relative flex h-full flex-col justify-between rounded-2xl p-6 overflow-hidden bg-slate-900/50 border border-cyan-400/20 shadow-lg',
        'backdrop-blur-md',
        className
      )}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-tr from-transparent via-cyan-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="mb-4 text-cyan-300">{icon}</div>
        <h3 className="text-xl font-bold text-slate-100">{title}</h3>
        <p className="mt-2 text-sm text-slate-400 flex-grow">{description}</p>
        <div className="mt-4 flex items-center text-sm font-medium text-cyan-300 group-hover:text-cyan-200 transition-colors">
          {href ? 'Open Feature' : 'Activate'}
          <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </motion.div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return <button onClick={onClick}>{content}</button>;
}
