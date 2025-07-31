'use client';

import { Timer, Volume2 } from 'lucide-react';

export default function SessionInstructions() {
  return (
    <div className="mt-16 max-w-4xl text-center">
      <h3 className="mb-6 text-xl font-bold text-black dark:text-white">
        How it works:
      </h3>
      <div className="grid grid-cols-1 gap-8 text-sm md:grid-cols-3">
        <div className="flex flex-col items-center rounded-2xl border border-black/10 bg-black/5 p-6 backdrop-blur-sm dark:border-white/20 dark:bg-white/10">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg shadow-orange-500/30">
            <Volume2 className="h-8 w-8 text-white" />
          </div>
          <p className="font-medium text-gray-800 dark:text-gray-200">
            Speak naturally - the AI listens continuously
          </p>
        </div>
        <div className="flex flex-col items-center rounded-2xl border border-black/10 bg-black/5 p-6 backdrop-blur-sm dark:border-white/20 dark:bg-white/10">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-white to-gray-300 shadow-lg shadow-white/30 dark:to-gray-200">
            <div className="h-8 w-8 rounded-full bg-orange-500" />
          </div>
          <p className="font-medium text-gray-800 dark:text-gray-200">
            No turn-taking - conversation flows like with humans
          </p>
        </div>
        <div className="flex flex-col items-center rounded-2xl border border-white/20 bg-black/5 p-6 backdrop-blur-sm dark:bg-white/10">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-black to-gray-800 shadow-lg shadow-black/50">
            <Timer className="h-8 w-8 text-white" />
          </div>
          <p className="font-medium text-gray-800 dark:text-gray-200">
            5-minute session with real-time feedback
          </p>
        </div>
      </div>
    </div>
  );
}
