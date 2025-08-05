'use client';

import React from 'react';
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
  profileData: ProfileData;
  onProfileChange: (data: ProfileData) => void;
  onSave: () => Promise<void>;
  isLoading: boolean;
  isEditMode: boolean;
  onToggleEditMode: () => void;
  userAvatar?: string;
  userName: string;
  userRole?: 'student' | 'teacher';
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

export default function ProfileSettings({
  profileData,
  onProfileChange,
  onSave,
  isLoading,
  isEditMode,
  onToggleEditMode,
  userAvatar,
  userName,
}: ProfileSettingsProps) {
  const handleInputChange =
    (field: keyof ProfileData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onProfileChange({
        ...profileData,
        [field]: e.target.value,
      });
    };

  const handleSelectChange = (field: keyof ProfileData) => (value: string) => {
    onProfileChange({
      ...profileData,
      [field]: value,
    });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result === 'string') {
          onProfileChange({
            ...profileData,
            avatar: result,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Profile Information</CardTitle>
          <Button variant="outline" onClick={onToggleEditMode}>
            {isEditMode ? 'Cancel' : 'Edit Profile'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar Section */}
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage
              src={profileData.avatar || userAvatar}
              alt={userName}
            />
            <AvatarFallback>
              <User className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
          {isEditMode && (
            <div>
              <Label htmlFor="avatar" className="cursor-pointer">
                <Button variant="outline" size="sm" asChild>
                  <span>
                    <Camera className="mr-2 h-4 w-4" />
                    Change Photo
                  </span>
                </Button>
              </Label>
              <Input
                id="avatar"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <p className="mt-1 text-xs text-gray-500">
                JPG, PNG or GIF. Max size 5MB.
              </p>
            </div>
          )}
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="username">Full Name</Label>
            <Input
              id="username"
              value={profileData.username}
              onChange={handleInputChange('username')}
              placeholder="Enter your full name"
              disabled={!isEditMode}
            />
          </div>

          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={profileData.email}
              onChange={handleInputChange('email')}
              placeholder="Enter your email"
              disabled={!isEditMode}
            />
          </div>

          <div>
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              value={profileData.phoneNumber || ''}
              onChange={handleInputChange('phoneNumber')}
              placeholder="Enter your phone number"
              disabled={!isEditMode}
            />
          </div>

          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={profileData.city}
              onChange={handleInputChange('city')}
              placeholder="Enter your city"
              disabled={!isEditMode}
            />
          </div>

          <div>
            <Label htmlFor="country">Country</Label>
            <Select
              value={profileData.country}
              onValueChange={handleSelectChange('country')}
              disabled={!isEditMode}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Bio Section */}
        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={profileData.bio}
            onChange={handleInputChange('bio')}
            placeholder="Tell us a bit about yourself..."
            rows={4}
            disabled={!isEditMode}
          />
          <p className="mt-1 text-xs text-gray-500">
            {profileData.bio.length}/500 characters
          </p>
        </div>

        {/* Save Button */}
        {isEditMode && (
          <div className="flex justify-end">
            <Button onClick={onSave} disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
