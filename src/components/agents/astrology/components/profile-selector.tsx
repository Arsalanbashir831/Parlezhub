'use client';

import { Check, ChevronDown, Edit2, Plus, Trash2, User, Users } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useConsultantSharedStudents, useGuestProfiles } from '@/hooks/useAstrology';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export type ProfileType = 'me' | 'student' | 'guest';

export interface SelectedProfile {
  type: ProfileType;
  id?: string;
  name: string;
}

interface ProfileSelectorProps {
  selectedProfile: SelectedProfile;
  onSelect: (profile: SelectedProfile) => void;
  onAddGuest: () => void;
  onEditGuest: (id: string, name: string) => void;
  onDeleteGuest: (id: string, name: string) => void;
}

export function ProfileSelector({
  selectedProfile,
  onSelect,
  onAddGuest,
  onEditGuest,
  onDeleteGuest,
}: ProfileSelectorProps) {
  const { activeRole } = useAuth();
  const { data: students } = useConsultantSharedStudents();
  const { data: guests } = useGuestProfiles();

  if (activeRole !== 'TEACHER') return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex h-auto items-center gap-3 px-4 py-2 hover:bg-primary-500/10 rounded-2xl border border-white/5 bg-white/[0.03] shadow-lg"
        >
          <div className="flex flex-col items-start gap-0.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary-500/60">
              Viewing Chart
            </span>
            <span className="max-w-[120px] truncate font-serif text-sm font-bold text-primary-200">
              {selectedProfile.name}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 text-primary-500/50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 border-primary-500/20 bg-background/95 backdrop-blur-md">
        <DropdownMenuLabel className="p-2 text-[10px] font-bold uppercase tracking-widest text-primary-500/60">
          Personal
        </DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => onSelect({ type: 'me', name: 'My Chart' })}
          className="flex items-center gap-3 py-3 font-medium focus:bg-primary-500/10 focus:text-primary-200"
        >
          <User className="h-4 w-4 text-primary-500" />
          <span>My Chart</span>
          {selectedProfile.type === 'me' && (
            <Check className="ml-auto h-4 w-4 text-primary-500" />
          )}
        </DropdownMenuItem>

        {(students && students.length > 0) && (
          <>
            <DropdownMenuSeparator className="bg-primary-500/10" />
            <DropdownMenuLabel className="p-2 text-[10px] font-bold uppercase tracking-widest text-primary-500/60">
              Shared Students
            </DropdownMenuLabel>
            <DropdownMenuGroup>
              {students.map((access) => (
                <DropdownMenuItem
                  key={access.student.id}
                  onClick={() =>
                    onSelect({
                      type: 'student',
                      id: access.student.id,
                      name: access.student.full_name,
                    })
                  }
                  className="flex items-center gap-3 py-3 focus:bg-primary-500/10 focus:text-primary-200"
                >
                  <Avatar className="h-6 w-6 border border-primary-500/20">
                    <AvatarImage src={access.student.profile_picture || ''} />
                    <AvatarFallback className="text-[10px]">
                      {access.student.full_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">{access.student.full_name}</span>
                  {selectedProfile.type === 'student' &&
                    selectedProfile.id === access.student.id && (
                      <Check className="ml-auto h-4 w-4 text-primary-500" />
                    )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </>
        )}

        <DropdownMenuSeparator className="bg-primary-500/10" />
        <DropdownMenuLabel className="flex items-center justify-between p-2 text-[10px] font-bold uppercase tracking-widest text-primary-500/60">
          Guest Profiles
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 rounded-full hover:bg-primary-500/20"
            onClick={(e) => {
              e.stopPropagation();
              onAddGuest();
            }}
          >
            <Plus className="h-3 w-3 text-primary-500" />
          </Button>
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          {guests?.map((guest) => (
            <DropdownMenuItem
              key={guest.id}
              onClick={() =>
                onSelect({
                  type: 'guest',
                  id: String(guest.id),
                  name: guest.guest_name || 'Guest',
                })
              }
              className="group flex items-center gap-3 py-3 focus:bg-primary-500/10 focus:text-primary-200"
            >
              <Users className="h-4 w-4 text-primary-500/70" />
              <span className="max-w-[120px] truncate">{guest.guest_name}</span>

              <div className="ml-auto flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-md hover:bg-primary-500/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditGuest(String(guest.id), guest.guest_name || 'Guest');
                  }}
                >
                  <Edit2 className="h-3 w-3 text-primary-400" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-md hover:bg-red-500/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteGuest(String(guest.id), guest.guest_name || 'Guest');
                  }}
                >
                  <Trash2 className="h-3 w-3 text-red-400" />
                </Button>
              </div>

              {selectedProfile.type === 'guest' &&
                selectedProfile.id === String(guest.id) && (
                  <Check className="ml-0.5 h-4 w-4 text-primary-500" />
                )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem
            onClick={onAddGuest}
            className="flex items-center gap-3 py-3 text-primary-500 focus:bg-primary-500/10 focus:text-primary-400"
          >
            <Plus className="h-4 w-4" />
            <span className="font-bold">Add New Guest</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
