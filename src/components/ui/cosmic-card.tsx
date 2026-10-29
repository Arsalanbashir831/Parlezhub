'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';

interface CosmicCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  withGlow?: boolean;
}

const CosmicCard = ({
  children,
  className,
  hover = true,
  withGlow = false,
}: CosmicCardProps) => {
  return (
    <motion.div
      whileHover={hover ? { y: -4 } : {}}
      className={cn(
        'group/card relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm transition-all duration-300',
        hover && 'hover:border-ember/40',
        withGlow && 'shadow-[0_0_50px_-12px_rgba(255,163,90,0.25)]',
        className
      )}
    >
      {/* top hairline highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      {/* hover glow */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/card:opacity-100 [background:radial-gradient(360px_circle_at_50%_0%,rgba(255,163,90,0.1),transparent_60%)]" />
      {/* slow shimmer sweep */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -inset-x-full top-0 h-full -skew-x-12 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent transition-transform duration-1000 group-hover/card:translate-x-[60%]" />
      </div>

      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};

export default CosmicCard;
