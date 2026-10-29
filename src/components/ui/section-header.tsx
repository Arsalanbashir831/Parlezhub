'use client';

import { motion } from 'framer-motion';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

const SectionHeader = ({ title, subtitle }: SectionHeaderProps) => {
  return (
    <div className="mb-12 text-center">
      {/* Eyebrow ornament */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mb-4 flex items-center justify-center gap-3"
      >
        <span className="h-px w-14 bg-gradient-to-r from-transparent to-ember/60" />
        <span className="animate-twinkle text-sm text-ember">✦</span>
        <span className="h-px w-14 bg-gradient-to-l from-transparent to-ember/60" />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: -16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-gradient mx-auto max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl"
      >
        {title}
      </motion.h2>

      {subtitle && (
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-neutral-400"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
};

export default SectionHeader;
