'use client';

import Link from 'next/link';
import { ExternalLink, Star, Users } from 'lucide-react';

import { SharedStudentAccess } from '@/types/astrology';
import { useTeacherSharedStudents } from '@/hooks/useAstrology';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function SharedStudentsList() {
  const { data: students, isLoading } = useTeacherSharedStudents();

  if (isLoading || !students || students.length === 0) {
    return null;
  }

  return (
    <Card className="lg:col-span-12 h-full rounded-3xl border-white/5 bg-white/[0.03] shadow-2xl backdrop-blur-md transition-all duration-300">
      <CardHeader className="p-8">
        <div className="space-y-1">
          <CardTitle className="font-serif text-3xl font-bold text-white">
            Shared <span className="text-primary-500">Astrology Students</span>
          </CardTitle>
          <p className="text-primary-100/60 font-medium">
            Students who have granted you access to their astrological charts for deeper insights.
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6 p-8 pt-0 md:grid-cols-2 lg:grid-cols-3">
          {students.map((record: SharedStudentAccess) => (
            <div
              key={record.id}
              className="group relative flex items-center justify-between p-5 rounded-2xl border border-white/5 bg-white/[0.02] transition-all duration-300 hover:bg-white/[0.05] hover:shadow-2xl hover:shadow-primary-500/5"
            >
              <div className="flex min-w-0 items-center gap-4">
                <Avatar className="h-14 w-14 border-2 border-primary-500/10 transition-colors group-hover:border-primary-500">
                  <AvatarImage src={record.student.profile_picture || ''} />
                  <AvatarFallback className="font-serif text-lg font-bold bg-primary-500/20 text-primary-500">
                    {(record.student.full_name || 'S')[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-col">
                  <p className="truncate font-serif text-base font-bold text-white transition-colors group-hover:text-primary-500">
                    {record.student.full_name}
                  </p>
                  <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary-100/40">
                    <Star className="h-3 w-3 fill-primary-500/40 text-primary-500/40" />
                    Student Access
                  </p>
                </div>
              </div>

              <Button
                asChild
                variant="ghost"
                size="sm"
                className="h-10 w-10 rounded-xl p-0 text-primary-500 transition-all hover:bg-primary-500 hover:text-primary-950"
              >
                <Link href={`/astrology?student_id=${record.student.id}`} title="View Chart">
                  <ExternalLink className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
