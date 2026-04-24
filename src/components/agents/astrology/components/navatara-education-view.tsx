'use client';

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
  guestProfileId?: string;
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
    color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  },
  {
    count: '2nd, 11th, 20th',
    name: 'Sampat',
    meaning: 'Wealth',
    category: '2',
    description:
      'Auspicious. Focuses on financial gains, prosperity, and material success.',
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  {
    count: '3rd, 12th, 21st',
    name: 'Vipat',
    meaning: 'Danger',
    category: '3',
    description:
      'Inauspicious. Indicates potential hurdles or unexpected "speed bumps." Proceed with caution.',
    color: 'bg-red-500/20 text-red-400 border-red-500/30',
  },
  {
    count: '4th, 13th, 22nd',
    name: 'Kshema',
    meaning: 'Safety / Well-being',
    category: '4',
    description:
      'Auspicious. Brings comfort, protection, and overall security to your endeavors.',
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  {
    count: '5th, 14th, 23rd',
    name: 'Pratyari',
    meaning: 'Obstacle / Opposition',
    category: '5',
    description:
      'Challenging. Represents enemies or obstacles. Best for internal work rather than external battles.',
    color: 'bg-red-500/20 text-red-400 border-red-500/30',
  },
  {
    count: '6th, 15th, 24th',
    name: 'Sadhaka',
    meaning: 'Achievement / Success',
    category: '6',
    description:
      'Highly Auspicious. The "Achievement" star. Perfect for major tasks and fulfilling goals.',
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  {
    count: '7th, 16th, 25th',
    name: 'Vadha',
    meaning: 'Destruction',
    category: '7',
    description:
      'Critical. The most challenging Tara. Indicates a need for transformation or extreme caution in new ventures.',
    color: 'bg-red-500/20 text-red-400 border-red-500/30',
  },
  {
    count: '8th, 17th, 26th',
    name: 'Mitra',
    meaning: 'Friend',
    category: '8',
    description:
      'Benefic. Friendly energy that aids in social connections and ease of work.',
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  {
    count: '9th, 18th, 27th',
    name: 'Ati-Mitra',
    meaning: 'Great Friend / Best Friend',
    category: '9',
    description:
      'Highly Benefic. Deeply supportive energy; ideal for long-term commitments and partnerships.',
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
];

export function NavataraEducationView({
  studentId,
  guestProfileId,
  onClose,
}: NavataraEducationViewProps) {
  const { data, isLoading, error } = useNakshatraPredictions(true, studentId, guestProfileId);

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 pb-12 text-foreground sm:px-6">
      {/* Header Section */}
      <div className="space-y-4 border-b border-primary-500/20 pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 font-serif text-2xl text-primary-500 sm:text-3xl">
              <Sparkles className="h-6 w-6 text-primary-500 sm:h-7 sm:w-7" />
              Navatara: The Cycle of Nine Stars
            </h1>
            <p className="mt-2 text-sm text-primary-100/70 sm:text-base">
              Your Personal Energy Map across the 27 Nakshatras
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="self-start text-sm font-medium text-primary-500/70 transition-colors hover:text-primary-500 sm:self-auto"
            >
              Back to Overview
            </button>
          )}
        </div>
        <div className="mt-4 flex items-center gap-2 pt-2">
          <Badge
            variant="outline"
            className="border-primary-500/30 bg-primary-500/10 text-primary-300"
          >
            System Badge: [Parashari Logic: Tara Bala Analysis]
          </Badge>
        </div>
        <p className="mt-4 max-w-3xl leading-relaxed text-primary-100/80">
          The Navatara system categorizes all 27 Nakshatras into nine functional
          groups based on their relationship to your Janma Nakshatra (Birth
          Star). This analysis reveals which stars bring prosperity, which
          demand caution, and which act as your cosmic allies.
        </p>
      </div>

      {/* Dynamic API Insight Section */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 font-serif text-xl text-primary-400">
          <Star className="h-5 w-5 text-primary-500" />
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
            <Card className="bg-white/1 border-primary-500/20 shadow-sm backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-lg text-primary-500">
                  <span>Today&apos;s Tara Bala</span>
                  {data.ai_guidance && (
                    <Badge variant="outline" className="border-primary-500/30 bg-primary-500/10 text-xs text-primary-400">
                      {data.ai_guidance.status.nature}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-primary-100/60">
                  Based on the Moon transiting {data.current_moon.nakshatra}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-end gap-3">
                    <span className="font-serif text-4xl font-bold text-primary-500">
                      {data.tarabala.name}
                    </span>
                    <span className="pb-1 text-sm font-medium text-primary-500/50">
                      (Tara #{data.tarabala.count})
                    </span>
                  </div>

                  {data.ai_guidance ? (
                    <div className="rounded-lg border border-primary-500/20 bg-primary-500/10 p-4">
                      <p className="font-medium italic leading-relaxed text-primary-100">
                        &quot;{data.ai_guidance.guidance.summary}&quot;
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-primary-500/20 bg-primary-500/10 p-4">
                      <p className="font-medium text-primary-100">
                        {data.tarabala.effect}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <span className="text-sm text-primary-500/70">
                      Favorability Score:
                    </span>
                    <Badge
                      className={
                        (data.overall_score || parseInt(data.ai_guidance?.status.favorability_score || '0')) > 60
                          ? 'border-emerald-500/30 bg-emerald-500/20 text-emerald-400'
                          : 'bg-primary-500/10 text-primary-300'
                      }
                    >
                      {data.ai_guidance?.status.favorability_score || `${data.overall_score}%`}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/1 border-primary-500/20 shadow-sm backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-primary-500">
                  Daily Guidance
                </CardTitle>
                <CardDescription className="text-primary-100/60">
                  AI-Powered Recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-400">
                    <Sparkles className="h-4 w-4" />
                    Recommended Actions
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(data.ai_guidance?.guidance.dos || data.guidance.favorable_activities).map((activity, i) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                      >
                        {activity}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-red-400">
                    <AlertCircle className="h-4 w-4" />
                    Areas of Caution
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(data.ai_guidance?.guidance.donts || data.guidance.avoid_activities).map((activity, i) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className="border-red-500/30 bg-red-500/10 text-red-300"
                      >
                        {activity}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {data.ai_guidance && (
              <Card className="md:col-span-2 bg-gradient-to-br from-primary-950/40 to-transparent border-primary-500/20 shadow-lg backdrop-blur-md">
                <CardContent className="pt-6">
                  <div className="grid gap-8 md:grid-cols-2">
                    <div className="space-y-4">
                      <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary-500/70">
                        <Info className="h-4 w-4" />
                        Planning Tip
                      </h4>
                      <p className="text-lg font-medium text-primary-100 leading-relaxed">
                        {data.ai_guidance.planning_tip}
                      </p>
                    </div>
                    <div className="relative space-y-4 rounded-xl bg-primary-500/5 p-6 border border-primary-500/10">
                      <Sparkles className="absolute -top-3 -right-3 h-8 w-8 text-primary-500/20" />
                      <h4 className="text-sm font-bold uppercase tracking-widest text-primary-500/70">
                        Cosmic Affirmation
                      </h4>
                      <p className="font-serif text-xl italic text-primary-200 leading-loose">
                        {data.ai_guidance.motivational_message.split('\n').map((line, i) => (
                          <span key={i} className="block">{line}</span>
                        ))}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : null}
      </section>

      {/* Educational Context */}
      <section className="bg-white/1 rounded-xl border border-primary-500/20 p-6 backdrop-blur-sm">
        <h2 className="mb-4 flex items-center gap-2 font-serif text-xl text-primary-400">
          <Info className="h-5 w-5 text-primary-500" />
          Educational Context: How it Works
        </h2>
        <div className="space-y-4 text-primary-100/80">
          <div className="rounded-lg border border-primary-500/10 bg-primary-500/5 p-4">
            <h3 className="mb-2 font-semibold text-primary-300">
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
          <div className="rounded-lg border border-primary-500/10 bg-primary-500/5 p-4">
            <h3 className="mb-2 font-semibold text-primary-300">
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
        <h2 className="mb-4 font-serif text-xl text-primary-400">
          The Navatara Legend: The Nine Categories
        </h2>
        <p className="mb-6 text-sm text-primary-100/60">
          Reference this table to understand the core meaning behind each Tara
          Bala rating.
        </p>

        <div className="rounded-xl border border-primary-500/20 bg-primary-900/10 shadow-sm backdrop-blur-sm">
          <div className="w-full max-w-sm md:max-w-full overflow-x-auto overflow-y-hidden [webkit-overflow-scrolling:touch]">
            <table className="w-full min-w-[800px] text-left text-sm text-primary-100/80">
              <thead className="border-b border-primary-500/20 bg-primary-950/30 text-xs uppercase text-primary-300">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-4 text-center font-semibold"
                  >
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
              <tbody className="bg-white/1 divide-y divide-primary-500/10">
                {TARA_CATEGORIES.map((tara, index) => (
                  <tr
                    key={index}
                    className="transition-colors hover:bg-primary-500/10"
                  >
                    <td className="whitespace-nowrap px-6 py-4 text-center text-lg font-bold text-primary-500">
                      {tara.category}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={tara.color}>
                        {tara.name}
                      </Badge>
                      <div className="mt-1 text-[10px] font-bold uppercase tracking-tighter text-primary-500/50">
                        ({tara.meaning})
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium leading-relaxed">
                      {tara.description}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 font-mono text-xs text-primary-500/40">
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
