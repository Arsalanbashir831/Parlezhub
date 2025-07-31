'use client';

import { useCallback, useState } from 'react';
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

  const handlePromptSend = useCallback(() => {
    if (prompt.trim()) {
      // Store the prompt in session context for later use
      updateConfig('topic', prompt);
      setCurrentStep('native-language');
    }
  }, [prompt, updateConfig]);

  const handleQuickPromptClick = useCallback(
    (selectedPrompt: string) => {
      setPrompt(selectedPrompt);
      // Store the prompt in session context for later use
      updateConfig('topic', selectedPrompt);
      setCurrentStep('native-language');
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
        setCurrentStep('target-language');
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
    <div className="flex h-full min-h-[calc(100vh-4rem)] flex-1 flex-col items-center justify-center bg-gray-50">
      <div className="flex w-full flex-1 flex-col items-center justify-center p-8">
        {currentStep === 'prompt' && (
          <>
            <h1 className="mb-4 text-center text-3xl font-bold text-gray-900 md:text-4xl">
              What would you like to learn today?
            </h1>
            <p className="mb-8 max-w-2xl text-center text-gray-600">
              Ask me anything about language learning, practice conversations,
              or get personalized lessons
            </p>

            <QuickPromptList
              quickActions={quickLanguagePrompts}
              onQuickActionClick={handleQuickPromptClick}
            />

            <div className="mb-8 w-full max-w-2xl">
              <PromptInput
                value={prompt}
                onChange={setPrompt}
                onSend={handlePromptSend}
                disabled={false}
              />
            </div>
          </>
        )}

        {currentStep === 'native-language' && (
          <div className="w-full max-w-4xl">
            <div className="mb-6 flex items-center">
              <Button variant="ghost" onClick={handleBack} className="mr-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </div>
            <NativeLanguageSelection onSelection={handleNativeLanguageSelect} />
          </div>
        )}

        {currentStep === 'target-language' && (
          <div className="w-full max-w-4xl">
            <div className="mb-6 flex items-center">
              <Button variant="ghost" onClick={handleBack} className="mr-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </div>
            <TargetLanguageSelection onSelection={handleTargetLanguageSelect} />
          </div>
        )}
      </div>
    </div>
  );
}
