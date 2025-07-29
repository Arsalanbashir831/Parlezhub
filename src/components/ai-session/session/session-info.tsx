'use client';

import { SessionConfig } from '@/types/ai-session';

interface SessionInfoProps {
  config: SessionConfig;
}

export default function SessionInfo({ config }: SessionInfoProps) {
  return (
    <div className="mb-12 text-center">
      <h1 className="mb-3 text-xl font-bold capitalize text-black dark:text-white sm:text-2xl md:text-3xl">
        {config.language.charAt(0).toUpperCase() + config.language.slice(1)}{' '}
        Conversation Practice
      </h1>
      <p className="mb-4 text-sm font-medium text-gray-700 dark:text-gray-300 sm:text-lg md:text-xl">
        {config.topic}
      </p>
      <div className="flex items-center justify-center gap-4 rounded-full border border-white/20 bg-black/5 px-6 py-2 text-xs text-gray-400 backdrop-blur-sm dark:bg-white/10 md:text-sm">
        <span className="capitalize text-orange-500 dark:text-orange-300">
          {config.gender} voice
        </span>
        <span className="text-gray-500">•</span>
        <span className="text-gray-500 dark:text-white">
          {config.accent} accent
        </span>
        <span className="text-gray-500">•</span>
        <span className="capitalize text-green-500 dark:text-green-300">
          {config.level} level
        </span>
      </div>
    </div>
  );
}
