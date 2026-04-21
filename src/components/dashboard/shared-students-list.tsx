'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Search, Star, } from 'lucide-react';

import { SharedStudentAccess } from '@/types/astrology';
import { useConsultantSharedStudents } from '@/hooks/useAstrology';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export function SharedStudentsList() {
  const { data: students, isLoading } = useConsultantSharedStudents();
  const [searchQuery, setSearchQuery] = useState('');

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary-500"></div>
        <p className="font-serif text-lg font-bold text-primary-100/60">Loading students...</p>
      </div>
    );
  }

  const filteredStudents = students?.filter((record) =>
    record.student.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (!students || students.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-12 text-center">
        <div className="rounded-full bg-primary-500/10 p-6">
          <Star className="h-12 w-12 text-primary-500/40" />
        </div>
        <h3 className="mt-6 font-serif text-2xl font-bold text-white">No Shared Access Yet</h3>
        <p className="mt-2 max-w-sm text-primary-100/60">
          When students grant you access to their astrological charts, they will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Filters & Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-500/40" />
          <Input
            placeholder="Search students by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 rounded-xl border-white/5 bg-white/5 pl-11 text-white placeholder:text-primary-100/20 focus:ring-primary-500/30"
          />
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="h-10 rounded-xl border-primary-500/20 bg-primary-500/5 px-4 font-serif text-sm font-bold text-primary-500">
            {filteredStudents.length} Students Found
          </Badge>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredStudents.map((record: SharedStudentAccess) => (
          <div
            key={record.id}
            className="group relative flex flex-col items-start p-6 rounded-3xl border border-white/5 bg-white/[0.03] shadow-2xl backdrop-blur-md transition-all duration-300 hover:bg-white/[0.06] hover:shadow-primary-500/10 hover:-translate-y-1"
          >
            <div className="flex w-full items-start justify-between">
              <Avatar className="h-16 w-16 border-2 border-primary-500/10 transition-colors group-hover:border-primary-500">
                <AvatarImage src={record.student.profile_picture || ''} />
                <AvatarFallback className="font-serif text-xl font-bold bg-primary-500/20 text-primary-500">
                  {(record.student.full_name || 'S')[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="mt-4 space-y-1 w-full">
              <h3 className="truncate font-serif text-lg font-bold text-white group-hover:text-primary-500 transition-colors">
                {record.student.full_name}
              </h3>
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary-100/40">
                <Star className="h-3 w-3 fill-primary-500/40 text-primary-500/40" />
                Granted {new Date(record.granted_at).toLocaleDateString()}
              </p>
            </div>

            <div className="mt-6 flex w-full items-center gap-3">
              <Button
                asChild
                className="flex-1 rounded-xl bg-primary-500 font-bold text-primary-950 transition-all hover:bg-primary-400"
              >
                <Link href={`/astrology?student_id=${record.student.id}`}>
                  View Chart
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        ))}

        {filteredStudents.length === 0 && searchQuery && (
          <div className="col-span-full flex flex-col items-center justify-center p-12 text-center">
            <p className="font-serif text-xl font-bold text-primary-100/40">No students match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
