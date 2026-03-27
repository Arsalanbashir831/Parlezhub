'use client';

import React, { useState } from 'react';
import { ChevronLeft, Loader2, Search, Trash2, UserPlus } from 'lucide-react';

import { AstrologyAccess, AstrologyTeacher } from '@/types/astrology';
import { useDebounce } from '@/hooks/use-debounce';
import {
  useAstrologyAccessList,
  useGrantAstrologyAccess,
  useRevokeAstrologyAccess,
  useSearchAstrologers,
} from '@/hooks/useAstrology';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ShareAccessViewProps {
  onBack: () => void;
}

const ShareAccessView: React.FC<ShareAccessViewProps> = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery] = useDebounce(searchQuery, 500);

  const { data: accessList, isLoading: isLoadingAccess } =
    useAstrologyAccessList();
  const { data: searchResults, isLoading: isSearching } =
    useSearchAstrologers(debouncedQuery);

  const { mutate: grantAccess, isPending: isGranting } =
    useGrantAstrologyAccess();
  const { mutate: revokeAccess, isPending: isRevoking } =
    useRevokeAstrologyAccess();

  const handleGrant = (teacherId: string) => {
    grantAccess(teacherId);
  };

  const handleRevoke = (teacherId: string) => {
    revokeAccess(teacherId);
  };

  const isAlreadyGranted = (teacherId: string) => {
    if (!accessList) return false;
    return accessList.some(
      (access: AstrologyAccess) => access.teacher.id === teacherId
    );
  };

  return (
    <div className="flex w-full flex-col duration-1000 animate-in fade-in zoom-in-95">
      {/* Premium Header */}
      <div className="flex flex-col items-start justify-between gap-4 border-b border-slate-200/60 p-6 pt-6 md:flex-row md:items-center md:p-8">
        <div>
          <h1 className="flex items-center gap-3 font-serif text-2xl font-bold tracking-tight text-slate-900 md:text-4xl">
            <span className="text-3xl md:text-5xl">🤝</span> Share Access
          </h1>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary-500">
            MANAGE ASTROLOGER PERMISSIONS
          </p>
        </div>
        <Button
          onClick={onBack}
          variant="outline"
          className="rounded-full border-slate-200/60 bg-white/50 text-slate-600 shadow-sm backdrop-blur-sm hover:bg-white hover:text-slate-900"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      <div className="mx-auto flex w-full max-w-4xl flex-col gap-12 p-6 md:p-12">
        {/* Find an Astrologer Section */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="font-serif text-2xl font-bold text-slate-900">
              Find an Astrologer
            </h2>
            <p className="text-sm text-slate-500">
              Search the network to grant access to a trusted reader to analyze
              your chart.
            </p>
          </div>

          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 border-slate-200/60 bg-white pl-10 shadow-sm focus-visible:ring-primary-500"
            />

            {debouncedQuery.length > 0 && (
              <div className="absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-xl border border-slate-200/60 bg-white shadow-xl animate-in fade-in slide-in-from-top-2">
                {isSearching ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary-500/50" />
                  </div>
                ) : !searchResults || searchResults.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500">
                    <p>
                      No astrologers found matching &ldquo;{debouncedQuery}
                      &rdquo;
                    </p>
                  </div>
                ) : (
                  <div className="flex max-h-[400px] flex-col divide-y divide-slate-100 overflow-y-auto">
                    {searchResults.map((teacher: AstrologyTeacher) => {
                      const granted = isAlreadyGranted(teacher.id);
                      return (
                        <div
                          key={teacher.id}
                          className="flex items-center justify-between gap-4 p-4 px-6 transition-colors hover:bg-slate-50/50"
                        >
                          <div className="flex min-w-0 items-center gap-4">
                            <Avatar className="h-10 w-10 border-2 border-primary-500/10">
                              <AvatarImage
                                src={teacher.profile_picture || ''}
                              />
                              <AvatarFallback className="bg-primary-50 font-medium text-primary-700">
                                {(teacher.first_name || 'A')[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex min-w-0 flex-col">
                              <p className="truncate font-medium text-slate-900">
                                {teacher.first_name || 'Astrologer'}{' '}
                                {teacher.last_name || ''}
                              </p>
                              {teacher.experience_years > 0 && (
                                <p className="truncate text-xs text-slate-500">
                                  {teacher.experience_years} years experience
                                </p>
                              )}
                            </div>
                          </div>
                          <Button
                            variant={granted ? 'secondary' : 'default'}
                            size="sm"
                            onClick={() => handleGrant(teacher.id)}
                            disabled={isGranting || granted}
                            className={
                              granted
                                ? 'opacity-80'
                                : 'bg-primary-600 hover:bg-primary-700'
                            }
                          >
                            {granted ? (
                              'Access Granted'
                            ) : isGranting ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <UserPlus className="mr-2 h-4 w-4" />
                                Grant Access
                              </>
                            )}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        <hr className="border-t border-slate-200/60" />

        {/* Currently Shared With Section */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="font-serif text-2xl font-bold text-slate-900">
              Currently Shared With
            </h2>
            <p className="text-sm text-slate-500">
              Astrologers who have ongoing access to view your natal chart and
              transits.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/60 bg-white shadow-sm">
            {isLoadingAccess ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary-500/50" />
              </div>
            ) : !accessList || accessList.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500">
                <p>
                  You haven&apos;t shared your chart with any astrologers yet.
                </p>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-slate-100">
                {accessList.map((access: AstrologyAccess) => (
                  <div
                    key={access.teacher.id}
                    className="flex items-center justify-between gap-4 p-4 px-6"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <Avatar className="h-10 w-10 border-2 border-primary-500/10">
                        <AvatarImage
                          src={access.teacher.profile_picture || ''}
                        />
                        <AvatarFallback className="bg-primary-50 font-medium text-primary-700">
                          {(access.teacher.full_name || 'A')[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex min-w-0 flex-col">
                        <p className="truncate font-medium text-slate-900">
                          {access.teacher.full_name || 'Astrologer'}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          Granted on{' '}
                          {new Date(access.granted_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRevoke(access.teacher.id)}
                      disabled={isRevoking}
                      className="shrink-0 font-medium text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      {isRevoking ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="mr-2 h-4 w-4" />
                      )}
                      Revoke
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ShareAccessView;
