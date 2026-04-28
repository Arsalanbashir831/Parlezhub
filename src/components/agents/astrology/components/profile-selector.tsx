'use client';

import { useState } from 'react';
import { Check, ChevronDown, Edit2, Plus, Trash2, User, Users } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useConsultantSharedStudents, useGuestProfiles } from '@/hooks/useAstrology';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useDebounce } from '@/hooks/use-debounce';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command';

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
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch] = useDebounce(searchQuery, 300);

  // Fetch paginated/searchable data (using a larger page_size for quick search)
  const { data: studentsData } = useConsultantSharedStudents({ search: debouncedSearch, page_size: 20 });
  const { data: guestsData } = useGuestProfiles({ search: debouncedSearch, page_size: 20 });

  const students = studentsData?.results || [];
  const guests = guestsData?.results || [];

  if (activeRole !== 'TEACHER') return null;

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="flex h-auto items-center gap-3 px-4 py-2 hover:bg-primary-500/10 rounded-2xl border border-white/5 bg-white/[0.03] shadow-lg"
      >
        <div className="flex flex-col items-start gap-0.5 text-left">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary-500/60">
            Viewing Chart
          </span>
          <span className="max-w-[120px] truncate font-serif text-sm font-bold text-primary-200">
            {selectedProfile.name}
          </span>
        </div>
        <ChevronDown className="h-4 w-4 text-primary-500/50" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden p-0 shadow-lg border-primary-500/20 bg-background/95 backdrop-blur-md max-w-md sm:rounded-2xl">
          <Command shouldFilter={false} className="bg-transparent">
            <CommandInput 
              placeholder="Search students or guests..." 
              value={searchQuery}
              onValueChange={setSearchQuery} 
              className="h-14"
            />
            <CommandList className="max-h-[350px] sm:max-h-[450px]">
              <CommandEmpty className="py-6 text-center text-sm text-primary-100/60">
                No profiles found.
              </CommandEmpty>
              
              <CommandGroup heading={<span className="text-primary-500/60 font-bold uppercase tracking-widest">Personal</span>}>
                <CommandItem
                  onSelect={() => {
                    onSelect({ type: 'me', name: 'My Chart' });
                    setOpen(false);
                  }}
                  className="flex cursor-pointer items-center gap-3 py-3 font-medium aria-selected:bg-primary-500/10 aria-selected:text-primary-200"
                >
                  <User className="h-4 w-4 text-primary-500" />
                  <span>My Chart</span>
                  {selectedProfile.type === 'me' && (
                    <Check className="ml-auto h-4 w-4 text-primary-500" />
                  )}
                </CommandItem>
              </CommandGroup>

              {students.length > 0 && (
                <>
                  <CommandSeparator className="bg-primary-500/10" />
                  <CommandGroup heading={<span className="text-primary-500/60 font-bold uppercase tracking-widest">Shared Students</span>}>
                    {students.map((access) => (
                      <CommandItem
                        key={`student-${access.student.id}`}
                        onSelect={() => {
                          onSelect({
                            type: 'student',
                            id: access.student.id,
                            name: access.student.full_name,
                          });
                          setOpen(false);
                        }}
                        className="flex cursor-pointer items-center gap-3 py-3 aria-selected:bg-primary-500/10 aria-selected:text-primary-200"
                      >
                        <Avatar className="h-6 w-6 border border-primary-500/20">
                          <AvatarImage src={access.student.profile_picture || ''} />
                          <AvatarFallback className="text-[10px]">
                            {access.student.full_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate">{access.student.full_name}</span>
                        {selectedProfile.type === 'student' && selectedProfile.id === access.student.id && (
                          <Check className="ml-auto h-4 w-4 text-primary-500" />
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}

              <CommandSeparator className="bg-primary-500/10" />
              <CommandGroup heading={
                <div className="flex items-center justify-between text-primary-500/60 font-bold uppercase tracking-widest">
                  Guest Profiles
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 rounded-full hover:bg-primary-500/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddGuest();
                      setOpen(false);
                    }}
                  >
                    <Plus className="h-3 w-3 text-primary-500" />
                  </Button>
                </div>
              }>
                {guests.map((guest) => (
                  <CommandItem
                    key={`guest-${guest.id}`}
                    onSelect={() => {
                      onSelect({
                        type: 'guest',
                        id: String(guest.id),
                        name: guest.guest_name || 'Guest',
                      });
                      setOpen(false);
                    }}
                    className="group flex cursor-pointer items-center gap-3 py-3 aria-selected:bg-primary-500/10 aria-selected:text-primary-200"
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
                          setOpen(false);
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
                          setOpen(false);
                        }}
                      >
                        <Trash2 className="h-3 w-3 text-red-400" />
                      </Button>
                    </div>

                    {selectedProfile.type === 'guest' && selectedProfile.id === String(guest.id) && (
                      <Check className="ml-0.5 h-4 w-4 text-primary-500" />
                    )}
                  </CommandItem>
                ))}
                
                <CommandItem
                  onSelect={() => {
                    onAddGuest();
                    setOpen(false);
                  }}
                  className="flex cursor-pointer items-center gap-3 py-3 text-primary-500 aria-selected:bg-primary-500/10 aria-selected:text-primary-400"
                >
                  <Plus className="h-4 w-4" />
                  <span className="font-bold">Add New Guest</span>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}

