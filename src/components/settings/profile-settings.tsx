'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '@/contexts/user-context';
import { Camera, Save, User } from 'lucide-react';

import { ProfileData } from '@/types/profile-data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface ProfileSettingsProps {
  userRole?: 'student' | 'consultant';
}

const countries = [
  'United States',
  'Canada',
  'United Kingdom',
  'Germany',
  'France',
  'Spain',
  'Italy',
  'Japan',
  'Australia',
  'Brazil',
  'Mexico',
  'India',
  'China',
  'South Korea',
  'Netherlands',
  'Sweden',
  'Norway',
  'Denmark',
  'Finland',
  'Switzerland',
  // Add more countries as needed
];

export default function ProfileSettings({ userRole }: ProfileSettingsProps) {
  const {
    user,
    updateStudentProfile,
    updateConsultantProfile,
    isUpdatingProfile,
    uploadProfilePicture,
  } = useUser();
  const [isEditMode, setIsEditMode] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    username: '',
    email: '',
    phoneNumber: '',
    city: '',
    country: '',
    bio: '',
    avatar: '',
    qualification: '',
    experience_years: 0,
  });

  // Initialize profile data from user context
  useEffect(() => {
    if (user) {
      setProfileData({
        username: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        email: user.email || '',
        phoneNumber: user.phone_number || '',
        city: user.city || '',
        country: user.country || '',
        bio: user.bio || '',
        avatar: user.profile_picture || '',
        qualification: user.qualification || '',
        experience_years: user.experience_years || 0,
      });
    }
  }, [user]);

  const handleInputChange =
    (field: keyof ProfileData) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value =
          field === 'experience_years'
            ? parseInt(e.target.value) || 0
            : e.target.value;

        setProfileData({
          ...profileData,
          [field]: value,
        });
      };

  const handleSelectChange = (field: keyof ProfileData) => (value: string) => {
    setProfileData({
      ...profileData,
      [field]: value,
    });
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const result = await uploadProfilePicture(file);
        setProfileData((prev) => ({
          ...prev,
          avatar: result.profile_picture,
        }));
      } catch (error) {
        // Error is already handled by the user context with toast
        console.error('Profile picture upload error:', error);
      }
    }
  };

  const handleSave = async () => {
    try {
      const nameParts = profileData.username.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      if (userRole === 'student') {
        await updateStudentProfile({
          first_name: firstName,
          last_name: lastName,
          phone_number: profileData.phoneNumber,
          city: profileData.city,
          country: profileData.country,
          bio: profileData.bio,
        });
      } else if (userRole === 'consultant') {
        await updateConsultantProfile({
          first_name: firstName,
          last_name: lastName,
          phone_number: profileData.phoneNumber,
          city: profileData.city,
          country: profileData.country,
          bio: profileData.bio,
          qualification: profileData.qualification,
          experience_years: profileData.experience_years,
        });
      }

      setIsEditMode(false);
    } catch (error) {
      // Error is already handled by the user context with toast
      console.error('Profile update error:', error);
    }
  };

  const handleToggleEditMode = () => {
    if (isEditMode) {
      // Reset to original data when canceling
      if (user) {
        setProfileData({
          username: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
          email: user.email || '',
          phoneNumber: user.phone_number || '',
          city: user.city || '',
          country: user.country || '',
          bio: user.bio || '',
          avatar: user.profile_picture || '',
          qualification: user.qualification || '',
          experience_years: user.experience_years || 0,
        });
      }
    }
    setIsEditMode(!isEditMode);
  };

  return (
    <Card className="overflow-hidden rounded-3xl border-white/5 bg-white/[0.03] shadow-2xl backdrop-blur-md transition-all duration-300">
      <CardHeader className="p-8 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="font-serif text-2xl font-bold text-primary-500">
            Profile Information
          </CardTitle>
          <Button
            variant="ghost"
            onClick={handleToggleEditMode}
            className="h-10 rounded-2xl border border-primary-500/10 px-6 text-[10px] font-bold uppercase tracking-widest text-primary-400 hover:bg-primary-500/10"
          >
            {isEditMode ? 'Cancel' : 'Edit Profile'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-8 p-8 pt-4">
        {/* Avatar Section */}
        <div className="flex items-center gap-6">
          <div className="group relative">
            <Avatar className="h-24 w-24 border-2 border-primary-500/20 shadow-2xl shadow-primary-500/10 transition-colors group-hover:border-primary-500">
              <AvatarImage
                src={profileData.avatar || user?.profile_picture || undefined}
                alt={user?.first_name + ' ' + user?.last_name}
              />
              <AvatarFallback className="bg-primary-500/10 font-bold text-primary-500">
                <User className="h-10 w-10" />
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-primary-950/40 opacity-0 backdrop-blur-[2px] transition-opacity group-hover:opacity-100">
              <Camera className="h-6 w-6 text-white" />
            </div>
          </div>
          <div>
            <Label htmlFor="avatar" className="cursor-pointer">
              <span className="inline-flex h-10 items-center justify-center rounded-xl border border-primary-500/10 bg-white/5 px-6 text-[10px] font-bold uppercase tracking-widest text-primary-400 transition-colors hover:bg-primary-500/10">
                <Camera className="mr-2 h-4 w-4" />
                Change Photo
              </span>
            </Label>
            <input
              id="avatar"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Profile Fields */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label
              htmlFor="username"
              className="ml-1 text-[10px] font-bold uppercase tracking-widest text-primary-100/60"
            >
              Full Name
            </Label>
            <Input
              id="username"
              value={profileData.username}
              onChange={handleInputChange('username')}
              disabled={!isEditMode}
              placeholder="Enter your full name"
              className="h-12 rounded-xl border-primary-500/10 bg-white/5 text-white placeholder:text-primary-100/20 focus-visible:ring-primary-500/30"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="ml-1 text-[10px] font-bold uppercase tracking-widest text-primary-100/60"
            >
              Email
            </Label>
            <Input
              id="email"
              value={profileData.email}
              disabled={true}
              placeholder="Enter your email"
              className="h-12 cursor-not-allowed rounded-xl border-white/5 bg-white/[0.02] text-primary-100/30"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="phoneNumber"
              className="ml-1 text-[10px] font-bold uppercase tracking-widest text-primary-100/60"
            >
              Phone Number
            </Label>
            <Input
              id="phoneNumber"
              value={profileData.phoneNumber}
              onChange={handleInputChange('phoneNumber')}
              disabled={!isEditMode}
              placeholder="Enter your phone number"
              className="h-12 rounded-xl border-primary-500/10 bg-white/5 text-white placeholder:text-primary-100/20 focus-visible:ring-primary-500/30"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="city"
              className="ml-1 text-[10px] font-bold uppercase tracking-widest text-primary-100/60"
            >
              City
            </Label>
            <Input
              id="city"
              value={profileData.city}
              onChange={handleInputChange('city')}
              disabled={!isEditMode}
              placeholder="Enter your city"
              className="h-12 rounded-xl border-primary-500/10 bg-white/5 text-white placeholder:text-primary-100/20 focus-visible:ring-primary-500/30"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="country"
              className="ml-1 text-[10px] font-bold uppercase tracking-widest text-primary-100/60"
            >
              Country
            </Label>
            <Select
              value={profileData.country}
              onValueChange={handleSelectChange('country')}
              disabled={!isEditMode}
            >
              <SelectTrigger className="h-12 rounded-xl border-primary-500/10 bg-white/5 text-sm text-white focus:ring-primary-500/30">
                <SelectValue placeholder="Select your country" />
              </SelectTrigger>
              <SelectContent className="border-primary-500/10 bg-background">
                {countries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Consultant-specific fields */}
          {userRole === 'consultant' && (
            <>
              <div className="space-y-2">
                <Label
                  htmlFor="qualification"
                  className="ml-1 text-[10px] font-bold uppercase tracking-widest text-primary-100/60"
                >
                  Qualification
                </Label>
                <Input
                  id="qualification"
                  value={profileData.qualification}
                  onChange={handleInputChange('qualification')}
                  disabled={!isEditMode}
                  placeholder="e.g., Bachelor's in Education, TEFL Certificate"
                  className="h-12 rounded-xl border-primary-500/10 bg-white/5 text-white placeholder:text-primary-100/20 focus-visible:ring-primary-500/30"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="experience_years"
                  className="ml-1 text-[10px] font-bold uppercase tracking-widest text-primary-100/60"
                >
                  Years of Experience
                </Label>
                <Input
                  id="experience_years"
                  type="number"
                  min="0"
                  max="50"
                  value={profileData.experience_years}
                  onChange={handleInputChange('experience_years')}
                  disabled={!isEditMode}
                  placeholder="Enter years of teaching experience"
                  className="h-12 rounded-xl border-primary-500/10 bg-white/5 text-white placeholder:text-primary-100/20 focus-visible:ring-primary-500/30"
                />
              </div>
            </>
          )}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="bio"
            className="ml-1 text-[10px] font-bold uppercase tracking-widest text-primary-100/60"
          >
            Bio
          </Label>
          <Textarea
            id="bio"
            value={profileData.bio}
            onChange={handleInputChange('bio')}
            disabled={!isEditMode}
            placeholder="Tell us about yourself..."
            rows={4}
            className="resize-none rounded-2xl border-primary-500/10 bg-white/5 p-4 text-white placeholder:text-primary-100/20 focus-visible:ring-primary-500/30"
          />
        </div>

        {isEditMode && (
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="ghost"
              onClick={handleToggleEditMode}
              className="h-12 rounded-2xl border border-primary-500/10 px-8 text-[10px] font-bold uppercase tracking-widest text-primary-400 hover:bg-primary-500/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isUpdatingProfile}
              className="h-12 rounded-2xl bg-primary-500 px-10 text-[10px] font-bold uppercase tracking-widest text-primary-950 shadow-lg shadow-primary-500/20 transition-all hover:bg-primary-600 active:scale-95"
            >
              <Save className="mr-2 h-4 w-4" />
              {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
