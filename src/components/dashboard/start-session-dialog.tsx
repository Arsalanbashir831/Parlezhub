'use client';

import { Globe, Play, Volume2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

interface StartSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartSession: (config: SessionConfig) => void;
}

interface SessionConfig {
  language: string;
  duration: number;
  difficulty: string;
  topic: string;
}

const languages = [
  { value: 'spanish', label: 'Spanish' },
  { value: 'french', label: 'French' },
  { value: 'german', label: 'German' },
  { value: 'italian', label: 'Italian' },
  { value: 'portuguese', label: 'Portuguese' },
];

const difficulties = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const topics = [
  { value: 'general', label: 'General Conversation' },
  { value: 'business', label: 'Business' },
  { value: 'travel', label: 'Travel' },
  { value: 'culture', label: 'Culture' },
  { value: 'food', label: 'Food & Dining' },
];

export default function StartSessionDialog({
  open,
  onOpenChange,
  onStartSession,
}: StartSessionDialogProps) {
  const [language, setLanguage] = useState('');
  const [duration, setDuration] = useState([15]);
  const [difficulty, setDifficulty] = useState('');
  const [topic, setTopic] = useState('');

  const handleStartSession = () => {
    if (language && difficulty && topic) {
      const config: SessionConfig = {
        language,
        duration: duration[0],
        difficulty,
        topic,
      };
      onStartSession(config);
      onOpenChange(false);
      // Reset form
      setLanguage('');
      setDuration([15]);
      setDifficulty('');
      setTopic('');
    }
  };

  const isFormValid = language && difficulty && topic;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Start New Session</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Language Selection */}
          <div className="space-y-2">
            <Label>Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <Globe className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Duration Slider */}
          <div className="space-y-2">
            <Label>Duration: {duration[0]} minutes</Label>
            <div className="px-2">
              <Slider
                value={duration}
                onValueChange={setDuration}
                max={60}
                min={5}
                step={5}
                className="w-full"
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>5 min</span>
              <span>60 min</span>
            </div>
          </div>

          {/* Difficulty Selection */}
          <div className="space-y-2">
            <Label>Difficulty Level</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger>
                <Volume2 className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                {difficulties.map((diff) => (
                  <SelectItem key={diff.value} value={diff.value}>
                    {diff.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Topic Selection */}
          <div className="space-y-2">
            <Label>Conversation Topic</Label>
            <Select value={topic} onValueChange={setTopic}>
              <SelectTrigger>
                <SelectValue placeholder="Select a topic" />
              </SelectTrigger>
              <SelectContent>
                {topics.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleStartSession}
              disabled={!isFormValid}
            >
              <Play className="mr-2 h-4 w-4" />
              Start Session
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
