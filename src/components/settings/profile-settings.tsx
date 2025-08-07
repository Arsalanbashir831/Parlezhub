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

export default function ProfileSettings({ userRole }: ProfileSettingsProps) {
  const {
    user,
    updateStudentProfile,
    updateTeacherProfile,
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
      } else if (userRole === 'teacher') {
        await updateTeacherProfile({
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Profile Information</CardTitle>
          <Button variant="outline" onClick={handleToggleEditMode}>
            {isEditMode ? 'Cancel' : 'Edit Profile'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar Section */}
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage
              src={profileData.avatar || user?.profile_picture || undefined}
              alt={user?.first_name + ' ' + user?.last_name}
            />
            <AvatarFallback>
              <User className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
          <div>
            <Label htmlFor="avatar" className="cursor-pointer">
              <Button variant="outline" size="sm" asChild>
                <span>
                  <Camera className="mr-2 h-4 w-4" />
                  Change Photo
                </span>
              </Button>
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="username">Full Name</Label>
            <Input
              id="username"
              value={profileData.username}
              onChange={handleInputChange('username')}
              disabled={!isEditMode}
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={profileData.email}
              disabled={true}
              placeholder="Enter your email"
            />
          </div>

          <div>
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              value={profileData.phoneNumber}
              onChange={handleInputChange('phoneNumber')}
              disabled={!isEditMode}
              placeholder="Enter your phone number"
            />
          </div>

          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={profileData.city}
              onChange={handleInputChange('city')}
              disabled={!isEditMode}
              placeholder="Enter your city"
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
                <SelectValue placeholder="Select your country" />
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

          {/* Teacher-specific fields */}
          {userRole === 'teacher' && (
            <>
              <div>
                <Label htmlFor="qualification">Qualification</Label>
                <Input
                  id="qualification"
                  value={profileData.qualification}
                  onChange={handleInputChange('qualification')}
                  disabled={!isEditMode}
                  placeholder="e.g., Bachelor's in Education, TEFL Certificate"
                />
              </div>

              <div>
                <Label htmlFor="experience_years">Years of Experience</Label>
                <Input
                  id="experience_years"
                  type="number"
                  min="0"
                  max="50"
                  value={profileData.experience_years}
                  onChange={handleInputChange('experience_years')}
                  disabled={!isEditMode}
                  placeholder="Enter years of teaching experience"
                />
              </div>
            </>
          )}
        </div>

        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={profileData.bio}
            onChange={handleInputChange('bio')}
            disabled={!isEditMode}
            placeholder="Tell us about yourself..."
            rows={4}
          />
        </div>

        {isEditMode && (
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleToggleEditMode}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isUpdatingProfile}>
              <Save className="mr-2 h-4 w-4" />
              {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
