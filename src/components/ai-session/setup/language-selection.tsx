'use client';

import { useMemo, useState } from 'react';
import { NATIVE_LANGUAGES } from '@/constants/ai-session';
import { useSession } from '@/contexts/session-context';
import { Search } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function NativeLanguageSelection() {
  const { config, updateConfig } = useSession();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter languages based on search query
  const filteredLanguages = useMemo(() => {
    if (!searchQuery.trim()) {
      return NATIVE_LANGUAGES;
    }

    return NATIVE_LANGUAGES.filter((language) =>
      language.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="mb-2 text-2xl font-bold">Your Native Language</h2>
        <p className="text-gray-600 dark:text-gray-400">
          What is your first language?
        </p>
      </div>

      {/* Search Bar */}
      <div className="mx-auto max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <Input
            type="text"
            placeholder="Search languages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-2 pl-10 pr-4"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredLanguages.length > 0 ? (
          filteredLanguages.map((language) => (
            <Card
              key={language.value}
              className={`cursor-pointer transition-all hover:shadow-md ${
                config.nativeLanguage === language.value
                  ? 'bg-primary-50 ring-2 ring-primary-500 dark:bg-primary-900/20'
                  : ''
              }`}
              onClick={() => updateConfig('nativeLanguage', language.value)}
            >
              <CardContent className="p-6 text-center">
                <div className="mb-2 text-4xl">{language.flag}</div>
                <h3 className="font-semibold">{language.label}</h3>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No languages found matching &ldquot;{searchQuery}&rdquot;
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
