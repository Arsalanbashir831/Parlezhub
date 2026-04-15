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
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-2xl font-bold text-primary-500">
            <Users className="h-6 w-6 text-primary-500" />
            Shared Astrology Students
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Students who have granted you access to their astrological charts.
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {students.map((record: SharedStudentAccess) => (
            <div
              key={record.id}
              className="group relative flex items-center justify-between p-4 rounded-xl border-white/10 bg-gradient-to-br from-white/[0.08] to-transparent shadow-xl transition-all duration-300 hover:bg-white/[0.12]"
            >
              <div className="flex min-w-0 items-center gap-4">
                <Avatar className="h-12 w-12 border-2 border-primary-500/10">
                  <AvatarImage src={record.student.profile_picture || ''} />
                  <AvatarFallback className=" border border-primary-500/20 bg-gradient-to-br from-primary-500/20 to-primary-500/5 text-primary-500">
                    {(record.student.full_name || 'S')[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-col">
                  <p className="truncate font-semibold text-primary-500/80">
                    {record.student.full_name}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-slate-500">
                    <Star className="h-3 w-3 fill-primary-500 text-primary-500" />
                    Student Access
                  </p>
                </div>
              </div>

              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-primary-600 hover:bg-primary-500/80 hover:text-white"
              >
                <Link href={`/astrology?student_id=${record.student.id}`}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Chart
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
