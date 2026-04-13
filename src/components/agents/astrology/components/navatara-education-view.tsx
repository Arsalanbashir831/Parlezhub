'use client';

import React from 'react';
import { AlertCircle, Info, Loader2, Sparkles, Star } from 'lucide-react';

import { useNakshatraPredictions } from '@/hooks/useAstrology';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface NavataraEducationViewProps {
  studentId?: string;
  onClose?: () => void;
}

const TARA_CATEGORIES = [
  {
    count: '1st, 10th, 19th',
    name: 'Janma',
    meaning: 'Birth',
    category: '1',
    description:
      'Represents the self, health, and mind. A time for reflection and self-care.',
    color: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  {
    count: '2nd, 11th, 20th',
    name: 'Sampat',
    meaning: 'Wealth',
    category: '2',
    description:
      'Auspicious. Focuses on financial gains, prosperity, and material success.',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  {
    count: '3rd, 12th, 21st',
    name: 'Vipat',
    meaning: 'Danger',
    category: '3',
    description:
      'Inauspicious. Indicates potential hurdles or unexpected "speed bumps." Proceed with caution.',
    color: 'bg-red-100 text-red-800 border-red-300',
  },
  {
    count: '4th, 13th, 22nd',
    name: 'Kshema',
    meaning: 'Safety / Well-being',
    category: '4',
    description:
      'Auspicious. Brings comfort, protection, and overall security to your endeavors.',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  {
    count: '5th, 14th, 23rd',
    name: 'Pratyari',
    meaning: 'Obstacle / Opposition',
    category: '5',
    description:
      'Challenging. Represents enemies or obstacles. Best for internal work rather than external battles.',
    color: 'bg-red-100 text-red-800 border-red-300',
  },
  {
    count: '6th, 15th, 24th',
    name: 'Sadhaka',
    meaning: 'Achievement / Success',
    category: '6',
    description:
      'Highly Auspicious. The "Achievement" star. Perfect for major tasks and fulfilling goals.',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  {
    count: '7th, 16th, 25th',
    name: 'Vadha',
    meaning: 'Destruction',
    category: '7',
    description:
      'Critical. The most challenging Tara. Indicates a need for transformation or extreme caution in new ventures.',
    color: 'bg-red-100 text-red-800 border-red-300',
  },
  {
    count: '8th, 17th, 26th',
    name: 'Mitra',
    meaning: 'Friend',
    category: '8',
    description:
      'Benefic. Friendly energy that aids in social connections and ease of work.',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  {
    count: '9th, 18th, 27th',
    name: 'Ati-Mitra',
    meaning: 'Great Friend / Best Friend',
    category: '9',
    description:
      'Highly Benefic. Deeply supportive energy; ideal for long-term commitments and partnerships.',
    color: 'bg-green-100 text-green-800 border-green-300',
  },
];

export function NavataraEducationView({
  studentId,
  onClose,
}: NavataraEducationViewProps) {
  const { data, isLoading, error } = useNakshatraPredictions(true, studentId);

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      {/* Header Section */}
      <div className="space-y-2 border-b border-slate-200 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-2 font-serif text-3xl text-slate-800">
              <Sparkles className="h-7 w-7 text-primary-500" />
              Navatara: The Cycle of Nine Stars
            </h1>
            <p className="mt-2 text-slate-600">
              Your Personal Energy Map across the 27 Nakshatras
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-sm font-medium text-slate-500 hover:text-slate-900"
            >
              Back to Overview
            </button>
          )}
        </div>
        <div className="mt-4 flex items-center gap-2 pt-2">
          <Badge variant="outline" className="bg-primary-50 text-primary-700">
            System Badge: [Parashari Logic: Tara Bala Analysis]
          </Badge>
        </div>
        <p className="mt-4 max-w-3xl leading-relaxed text-slate-600">
          The Navatara system categorizes all 27 Nakshatras into nine functional
          groups based on their relationship to your Janma Nakshatra (Birth
          Star). This analysis reveals which stars bring prosperity, which
          demand caution, and which act as your cosmic allies.
        </p>
      </div>

      {/* Dynamic API Insight Section */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 font-serif text-xl text-slate-800">
          <Star className="h-5 w-5 text-amber-500" />
          Your Transit Tara of the Day
        </h2>

        {isLoading ? (
          <Card className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          </Card>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load daily Nakshatra predictions. Please try again
              later.
            </AlertDescription>
          </Alert>
        ) : data ? (
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-primary-100 bg-primary-50/50 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  Today&apos;s Tara Bala
                </CardTitle>
                <CardDescription>
                  Based on the Moon transiting {data.current_moon.nakshatra}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-end gap-3">
                    <span className="font-serif text-4xl font-bold text-primary-700">
                      {data.tarabala.name}
                    </span>
                    <span className="pb-1 text-sm font-medium text-slate-500">
                      (Tara #{data.tarabala.count})
                    </span>
                  </div>
                  <div className="rounded-lg bg-white p-4 shadow-sm">
                    <p className="font-medium text-slate-700">
                      {data.tarabala.effect}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="text-sm text-slate-500">
                      Overall Lunar Score:
                    </span>
                    <Badge
                      variant={
                        data.overall_score > 60 ? 'default' : 'secondary'
                      }
                    >
                      {data.overall_score}% Favorable
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Daily Guidance</CardTitle>
                <CardDescription>
                  Recommendations for {data.current_moon.nakshatra} nakshatra
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-emerald-700">
                    Favorable Activities
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {data.guidance.favorable_activities.map((activity, i) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className="border-emerald-200 bg-emerald-50 text-emerald-700"
                      >
                        {activity}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-rose-700">
                    Avoid Activities
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {data.guidance.avoid_activities.map((activity, i) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className="border-rose-200 bg-rose-50 text-rose-700"
                      >
                        {activity}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </section>

      {/* Educational Context */}
      <section className="rounded-xl border border-blue-100 bg-blue-50/50 p-6">
        <h2 className="mb-4 flex items-center gap-2 font-serif text-xl text-blue-900">
          <Info className="h-5 w-5 text-blue-500" />
          Educational Context: How it Works
        </h2>
        <div className="space-y-4 text-blue-800/80">
          <div className="rounded-lg bg-white/60 p-4">
            <h3 className="mb-2 font-semibold text-blue-900">
              The Triple Cycle (The Rule of Nine)
            </h3>
            <p>
              The 27 Nakshatras are divided into three cycles of nine stars
              each. The counting always starts from your Birth Star (Janma
              Nakshatra = 1). The cycle repeats every 9 stars. For example:
              whether a star is the 2nd, 11th, or 20th from your birth star, it
              will always fall under the Sampat (Wealth) category.
            </p>
          </div>
          <div className="rounded-lg bg-white/60 p-4">
            <h3 className="mb-2 font-semibold text-blue-900">
              The Purpose of Navatara
            </h3>
            <ul className="list-inside list-disc space-y-1">
              <li>
                <strong>Daily Planning:</strong> Use it to see if today&apos;s
                Moon Nakshatra is favorable for you.
              </li>
              <li>
                <strong>Compatibility:</strong> Check if a partner&apos;s
                Nakshatra falls in a &apos;Mitra&apos; or &apos;Sadhaka&apos;
                zone for you.
              </li>
              <li>
                <strong>Dasha Strength:</strong> Determine the quality of the
                results you will get during a specific Nakshatra-based Dasha.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* The Legend Table */}
      <section>
        <h2 className="mb-4 font-serif text-xl text-slate-800">
          The Navatara Legend: The Nine Categories
        </h2>
        <p className="mb-6 text-sm text-slate-500">
          Reference this table to understand the core meaning behind each Tara
          Bala rating.
        </p>

        <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b bg-slate-50 p-4 text-xs uppercase text-slate-700">
                <tr>
                  <th scope="col" className="px-6 py-4 font-semibold">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-4 font-semibold">
                    Tara Name
                  </th>
                  <th scope="col" className="px-6 py-4 font-semibold">
                    Meaning & Influence
                  </th>
                  <th scope="col" className="px-6 py-4 font-semibold">
                    Sequence
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {TARA_CATEGORIES.map((tara, index) => (
                  <tr key={index} className="hover:bg-slate-50/50">
                    <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-900">
                      {tara.category}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={tara.color}>
                        {tara.name}
                      </Badge>
                      <div className="mt-1 text-xs font-medium text-slate-400">
                        ({tara.meaning})
                      </div>
                    </td>
                    <td className="px-6 py-4 leading-relaxed">
                      {tara.description}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-slate-400">
                      {tara.count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
