'use client';

import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Language {
  name: string;
  level: string;
}

export default function AddLanguageDialog() {
  const [open, setOpen] = useState(false);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [currentLanguage, setCurrentLanguage] = useState('');
  const [currentLevel, setCurrentLevel] = useState('');

  const levels = [
    'Beginner (A1)',
    'Elementary (A2)',
    'Intermediate (B1)',
    'Upper-Intermediate (B2)',
    'Advanced (C1)',
    'Proficient (C2)',
  ];

  const handleAddLanguage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (currentLanguage && currentLevel) {
      const newLanguage: Language = {
        name: currentLanguage,
        level: currentLevel,
      };
      setLanguages([...languages, newLanguage]);
      setCurrentLanguage('');
      setCurrentLevel('');
    }
  };

  const handleRemoveLanguage = (index: number) => {
    setLanguages(languages.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    // Here you would typically save to your backend
    console.log('Saving languages:', languages);
    setOpen(false);
    setLanguages([]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Language
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Languages</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <form onSubmit={handleAddLanguage} className="space-y-4">
            <div>
              <Label htmlFor="language">Language</Label>
              <Input
                id="language"
                value={currentLanguage}
                onChange={(e) => setCurrentLanguage(e.target.value)}
                placeholder="e.g., Spanish, French, German"
              />
            </div>
            <div>
              <Label htmlFor="level">Proficiency Level</Label>
              <Select value={currentLevel} onValueChange={setCurrentLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your level" />
                </SelectTrigger>
                <SelectContent>
                  {levels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full">
              Add Language
            </Button>
          </form>

          {languages.length > 0 && (
            <div className="space-y-2">
              <Label>Added Languages</Label>
              <div className="flex flex-wrap gap-2">
                {languages.map((lang, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {lang.name} ({lang.level})
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-red-500"
                      onClick={() => handleRemoveLanguage(index)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={languages.length === 0}>
              Save Languages
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
