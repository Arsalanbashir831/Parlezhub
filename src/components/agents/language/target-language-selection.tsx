'use client';

import { useMemo, useState } from 'react';
import { LANGUAGES } from '@/constants/ai-session';
import { useSession } from '@/contexts/session-context';
import { Search } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface TargetLanguageSelectionProps {
  onSelection?: (language: string) => void;
}

export default function TargetLanguageSelection({
  onSelection,
}: TargetLanguageSelectionProps) {
  const { config, updateConfig } = useSession();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter languages based on search query
  const filteredLanguages = useMemo(() => {
    if (!searchQuery.trim()) {
      return LANGUAGES;
    }

    return LANGUAGES.filter((language) =>
      language.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <div className="space-y-10 duration-500 animate-in fade-in slide-in-from-bottom-4">
      <div className="text-center">
        <h2 className="mb-4 font-serif text-3xl font-bold text-primary-500">
          Destination Language
        </h2>
        <p className="text-[15px] font-medium leading-relaxed tracking-tight text-primary-100/60">
          Which language would you like to practice today?
        </p>
      </div>

      {/* Search Bar */}
      <div className="mx-auto max-w-md">
        <div className="group relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 transform text-primary-500/40 transition-colors group-focus-within:text-primary-500" />
          <Input
            type="text"
            placeholder="Search languages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 w-full rounded-2xl border-primary-500/10 bg-white/5 py-2 pl-12 pr-4 text-white transition-all placeholder:text-primary-100/20 focus-visible:ring-primary-500/30"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {filteredLanguages.length > 0 ? (
          filteredLanguages.map((language) => (
            <Card
              key={language.value}
              className={`group relative cursor-pointer overflow-hidden rounded-3xl border-white/5 bg-white/[0.03] shadow-xl backdrop-blur-md transition-all duration-300 hover:bg-white/[0.08] hover:shadow-primary-500/5 ${
                config.language === language.value
                  ? 'bg-primary-500/5 ring-2 ring-primary-500'
                  : ''
              }`}
              onClick={() => {
                updateConfig('language', language.value);
                onSelection?.(language.value);
              }}
            >
              {/* Gold side-accent on hover */}
              <div
                className={`absolute bottom-0 left-0 top-0 w-1 bg-primary-500 shadow-[2px_0_15px_rgba(212,175,55,0.4)] transition-opacity duration-300 group-hover:opacity-100 ${config.language === language.value ? 'opacity-100' : 'opacity-0'}`}
              />

              <CardContent className="p-6 text-center">
                <div className="mb-4 text-4xl drop-shadow-lg grayscale-[0.2] filter transition-all duration-300 group-hover:grayscale-0">
                  {language.flag}
                </div>
                <h3 className="text-[13px] font-bold uppercase tracking-widest text-primary-100/60 transition-colors group-hover:text-primary-500">
                  {language.label}
                </h3>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary-100/20">
              No regions found matching &ldquo;{searchQuery}&rdquo;
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
