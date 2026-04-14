'use client';

import { useCallback, useEffect, useState } from 'react';
import { quickLanguagePrompts } from '@/constants/quick-prompts';
import { useSession } from '@/contexts/session-context';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';

import AgentSession from './agent-session';
import NativeLanguageSelection from './language-selection';
import PromptInput from './prompt-input';
import { QuickPromptList } from './quick-prompt-list';
import TargetLanguageSelection from './target-language-selection';

type FlowStep = 'prompt' | 'native-language' | 'target-language' | 'session';

// Main content component for language agent with multi-step flow
export function MainContent() {
  const { updateConfig } = useSession();
  const [currentStep, setCurrentStep] = useState<FlowStep>('prompt');
  const [prompt, setPrompt] = useState('');

  // Bootstrap state from URL if coming back from login
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const p = params.get('prompt');
    const nl = params.get('native');
    const tl = params.get('target');
    const step = params.get('step');
    if (p) {
      setPrompt(p);
      updateConfig('topic', p);
    }
    if (nl) updateConfig('nativeLanguage', nl);
    if (tl) updateConfig('language', tl);
    if (step === 'session' && (p || params.has('prompt'))) {
      setCurrentStep('session');
    }
  }, [updateConfig]);

  const handlePromptSend = useCallback(() => {
    if (prompt.trim()) {
      // Store the prompt in session context for later use
      updateConfig('topic', prompt);
      // Jump directly to session
      setCurrentStep('session');
    }
  }, [prompt, updateConfig]);

  const handleQuickPromptClick = useCallback(
    (selectedPrompt: string) => {
      setPrompt(selectedPrompt);
      // Store the prompt in session context for later use
      updateConfig('topic', selectedPrompt);
      // Jump directly to session
      setCurrentStep('session');
    },
    [updateConfig]
  );

  const handleNativeLanguageSelect = useCallback(() => {
    setCurrentStep('target-language');
  }, []);

  const handleTargetLanguageSelect = useCallback(() => {
    setCurrentStep('session');
  }, []);

  const handleSessionEnd = useCallback(() => {
    // Reset to initial state after session
    setCurrentStep('prompt');
    setPrompt('');
    // Reset session config to defaults if needed
    updateConfig('topic', 'Daily Conversation');
  }, [updateConfig]);

  const handleBack = useCallback(() => {
    switch (currentStep) {
      case 'native-language':
        setCurrentStep('prompt');
        break;
      case 'target-language':
        setCurrentStep('native-language');
        break;
      case 'session':
        // With direct-to-session flow, go back to prompt
        setCurrentStep('prompt');
        break;
    }
  }, [currentStep]);

  // Render different steps
  if (currentStep === 'session') {
    return (
      <AgentSession
        prompt={prompt}
        onBack={handleBack}
        onEnd={handleSessionEnd}
      />
    );
  }

  return (
    <div className="relative flex h-full min-h-[calc(100vh-4rem)] flex-1 flex-col items-center justify-center overflow-hidden bg-background">
      {/* Celestial Background Accents */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-full overflow-hidden">
        <div className="absolute right-[-10%] top-[-10%] h-[40%] w-[40%] rounded-full bg-primary-500/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-primary-500/5 blur-[120px]" />
      </div>

      <div className="relative z-10 flex w-full flex-1 flex-col items-center justify-center p-8">
        {currentStep === 'prompt' && (
          <div className="flex flex-col items-center text-center duration-700 animate-in fade-in slide-in-from-bottom-4">
            <h1 className="mb-6 max-w-3xl font-serif text-4xl font-bold leading-tight text-primary-500 drop-shadow-sm md:text-5xl">
              What would you like to explore today?
            </h1>
            <p className="mb-12 max-w-2xl text-[15px] font-medium leading-relaxed tracking-tight text-primary-100/60">
              Ask me anything about language learning, practice conversations,
              or get personalized lessons in our archival linguistic chamber.
            </p>

            <div className="w-full max-w-4xl">
              <QuickPromptList
                quickActions={quickLanguagePrompts}
                onQuickActionClick={handleQuickPromptClick}
              />
            </div>

            <div className="mt-8 w-full max-w-2xl">
              <PromptInput
                value={prompt}
                onChange={setPrompt}
                onSend={handlePromptSend}
                disabled={false}
              />
            </div>
          </div>
        )}

        {currentStep === 'native-language' && (
          <div className="w-full max-w-4xl duration-500 animate-in fade-in slide-in-from-right-4">
            <div className="mb-8 flex items-center">
              <Button
                variant="ghost"
                onClick={handleBack}
                className="group rounded-xl px-4 text-[10px] font-bold uppercase tracking-widest text-primary-100/40 transition-all hover:bg-white/5 hover:text-primary-500"
              >
                <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Back to Archives
              </Button>
            </div>
            <NativeLanguageSelection onSelection={handleNativeLanguageSelect} />
          </div>
        )}

        {currentStep === 'target-language' && (
          <div className="w-full max-w-4xl duration-500 animate-in fade-in slide-in-from-right-4">
            <div className="mb-8 flex items-center">
              <Button
                variant="ghost"
                onClick={handleBack}
                className="group rounded-xl px-4 text-[10px] font-bold uppercase tracking-widest text-primary-100/40 transition-all hover:bg-white/5 hover:text-primary-500"
              >
                <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Return to Origin
              </Button>
            </div>
            <TargetLanguageSelection onSelection={handleTargetLanguageSelect} />
          </div>
        )}
      </div>
    </div>
  );
}
