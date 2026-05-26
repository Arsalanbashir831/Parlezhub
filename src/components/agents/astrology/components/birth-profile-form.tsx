'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useBirthProfile, useCreateGuestProfile, useSaveBirthProfile, useUpdateGuestProfile } from '@/hooks/useAstrology';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Country, City } from 'country-state-city';
import { Check, ChevronsUpDown } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import * as React from 'react';

const formSchema = z.object({
  guest_name: z.string().optional(),
  birth_year: z.coerce
    .number()
    .min(1900, 'Year must be after 1900')
    .max(new Date().getFullYear(), 'Year cannot be in the future'),
  birth_month: z.coerce
    .number()
    .min(1, 'Month must be 1-12')
    .max(12, 'Month must be 1-12'),
  birth_day: z.coerce
    .number()
    .min(1, 'Day must be 1-31')
    .max(31, 'Day must be 1-31'),
  birth_hour: z.coerce
    .number()
    .min(0, 'Hour must be 0-23')
    .max(23, 'Hour must be 0-23'),
  birth_minute: z.coerce
    .number()
    .min(0, 'Minute must be 0-59')
    .max(59, 'Minute must be 0-59'),
  city: z.string().min(1, 'City is required'),
  country_code: z.string().length(2, 'Must be 2 letters (e.g., IN, US)'),
  marriage_date: z.string().nullable().optional(),
  kids: z.number().min(0, 'Kids count cannot be negative').or(z.literal('')).nullable().optional(),
  comments: z.string().max(5000, 'Max 5000 characters').nullable().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function BirthProfileForm({
  readOnly = false,
  studentId,
  guestProfileId,
  type = 'me',
  onSuccess,
  className
}: {
  readOnly?: boolean;
  studentId?: string;
  guestProfileId?: string;
  type?: 'me' | 'student' | 'guest';
  onSuccess?: () => void;
  className?: string;
}) {
  // Only fetch existing profile if updating or viewing student
  const shouldFetchProfile = type !== 'guest' || !!guestProfileId;
  const { data: profile } = useBirthProfile(
    type === 'student' ? studentId : undefined,
    type === 'guest' ? guestProfileId : undefined,
    shouldFetchProfile
  );

  // If we are in 'me' mode and no IDs provided, useBirthProfile() without args fetches 'me'.
  // If we are in 'guest' mode and no guestProfileId, we want a fresh form.

  // Ensure isUpdate is false for new guest creation even if 'me' profile is in cache
  const isUpdate = !!profile && (type !== 'guest' || !!guestProfileId);
  const isGuestFlow = type === 'guest';

  // Hooks for different scenarios
  const { mutate: savePersonalProfile, isPending: isPersonalPending } = useSaveBirthProfile(isUpdate);
  const { mutate: createGuest, isPending: isCreateGuestPending } = useCreateGuestProfile();
  const { mutate: updateGuest, isPending: isUpdateGuestPending } = useUpdateGuestProfile(Number(guestProfileId));

  const isPending = isPersonalPending || isCreateGuestPending || isUpdateGuestPending;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    values: {
      guest_name: profile?.guest_name || '',
      birth_year: profile?.birth_year || 1990,
      birth_month: profile?.birth_month || 1,
      birth_day: profile?.birth_day || 1,
      birth_hour: profile?.birth_hour || 12,
      birth_minute: profile?.birth_minute || 0,
      city: profile?.city || '',
      country_code: profile?.country_code || 'US',
      marriage_date: profile?.marriage_date || '',
      kids: profile?.kids !== null && profile?.kids !== undefined ? profile?.kids : '',
      comments: profile?.comments || '',
    },
  });

  const [countryPopoverOpen, setCountryPopoverOpen] = React.useState(false);
  const [cityPopoverOpen, setCityPopoverOpen] = React.useState(false);
  const [citySearch, setCitySearch] = React.useState('');

  const selectedCountry = form.watch('country_code');
  const countries = React.useMemo(() => Country.getAllCountries(), []);

  const allUniqueCities = React.useMemo(() => {
    if (!selectedCountry) return [];
    const all = City.getCitiesOfCountry(selectedCountry) || [];
    const unique = [];
    const seen = new Set();
    for (const city of all) {
      if (!seen.has(city.name)) {
        seen.add(city.name);
        unique.push(city);
      }
    }
    return unique;
  }, [selectedCountry]);

  const filteredCities = React.useMemo(() => {
    if (!citySearch) return allUniqueCities.slice(0, 50);
    const lowerSearch = citySearch.toLowerCase();
    return allUniqueCities
      .filter((c) => c.name.toLowerCase().includes(lowerSearch))
      .slice(0, 50);
  }, [allUniqueCities, citySearch]);

  const onSubmit = (data: FormValues) => {
    const payload = {
      birth_year: data.birth_year,
      birth_month: data.birth_month,
      birth_day: data.birth_day,
      birth_hour: data.birth_hour,
      birth_minute: data.birth_minute,
      city: data.city,
      country_code: data.country_code,
      marriage_date: data.marriage_date || null,
      kids: typeof data.kids === 'number' ? data.kids : null,
      comments: data.comments || null,
    };

    if (type === 'guest') {
      if (guestProfileId) {
        updateGuest(
          { ...payload, guest_name: data.guest_name },
          { onSuccess }
        );
      } else {
        createGuest(
          { ...payload, guest_name: data.guest_name || 'Guest' },
          { onSuccess }
        );
      }
    } else {
      savePersonalProfile(payload, { onSuccess });
    }
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-4">
      <div className={cn("bg-white/1 w-full max-w-md rounded-2xl border border-primary-500/20 p-8 shadow-2xl backdrop-blur-md", className)}>
        <div className="mb-6 text-center">
          <h2 className="font-serif text-2xl font-bold tracking-wide text-primary-500">
            {isGuestFlow ? (guestProfileId ? 'Edit Guest Profile' : 'New Guest Profile') : 'Birth Profile'}
          </h2>
          <p className="mt-2 text-sm text-primary-100/60">
            {isGuestFlow
              ? 'Enter guest details to generate an astrological chart.'
              : 'Please enter your birth details to generate your astrological charts.'}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {isGuestFlow && (
              <FormField
                control={form.control}
                name="guest_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Guest Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. John Doe" {...field} disabled={readOnly} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="birth_year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} disabled={readOnly} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="birth_month"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Month</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} disabled={readOnly} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="birth_day"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Day</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} disabled={readOnly} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="birth_hour"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hour (0-23)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} disabled={readOnly} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="birth_minute"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minute (0-59)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} disabled={readOnly} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="country_code"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Country</FormLabel>
                    <Popover open={countryPopoverOpen} onOpenChange={setCountryPopoverOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between bg-transparent font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                            disabled={readOnly}
                          >
                            {field.value
                              ? countries.find(
                                (country) => country.isoCode === field.value
                              )?.name
                              : "Select country"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0">
                        <Command>
                          <CommandInput placeholder="Search country..." />
                          <CommandList>
                            <CommandEmpty>No country found.</CommandEmpty>
                            <CommandGroup>
                              {countries.map((country) => (
                                <CommandItem
                                  value={country.name}
                                  key={country.isoCode}
                                  onSelect={() => {
                                    form.setValue("country_code", country.isoCode);
                                    form.setValue("city", ""); // Reset city when country changes
                                    setCitySearch("");
                                    setCountryPopoverOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      country.isoCode === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {country.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>City</FormLabel>
                    <Popover open={cityPopoverOpen} onOpenChange={setCityPopoverOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between bg-transparent font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                            disabled={readOnly || !selectedCountry}
                          >
                            {field.value || "Select city"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0">
                        <Command shouldFilter={false}>
                          <CommandInput
                            placeholder="Search city..."
                            value={citySearch}
                            onValueChange={setCitySearch}
                          />
                          <CommandList>
                            <CommandEmpty>No city found.</CommandEmpty>
                            <CommandGroup>
                              {filteredCities.map((city) => (
                                <CommandItem
                                  value={city.name}
                                  key={`${city.name}-${city.latitude}-${city.longitude}`}
                                  onSelect={() => {
                                    form.setValue("city", city.name);
                                    setCityPopoverOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      city.name === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {city.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Optional Personal & Family Details */}
            <div className="space-y-4 rounded-xl border border-primary-500/10 bg-primary-500/5 p-4">
              <h3 className="text-xs font-bold tracking-widest text-primary-400 uppercase">
                Personal & Family Details (Optional)
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="marriage_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Marriage Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={field.value || ''}
                          disabled={readOnly}
                          className="bg-transparent [color-scheme:dark]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="kids"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Number of Kids</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g. 0, 1"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            field.onChange(val === '' ? '' : Number(val));
                          }}
                          disabled={readOnly}
                          className="bg-transparent"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="comments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Personal Comments / Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any additional details or life comments..."
                        {...field}
                        value={field.value || ''}
                        disabled={readOnly}
                        className="bg-transparent min-h-[80px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {!readOnly && (
              <Button
                type="submit"
                className="w-full bg-primary-500 font-bold text-primary-950 hover:bg-primary-600"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary-950" />
                    {isUpdate ? 'Updating...' : 'Generating...'}
                  </>
                ) : isUpdate ? (
                  type === 'guest' ? 'Update Guest' : 'Update Chart'
                ) : (
                  type === 'guest' ? 'Create Guest Profile' : 'Generate Chart'
                )}
              </Button>
            )}
          </form>
        </Form>
      </div>
    </div>
  );
}
