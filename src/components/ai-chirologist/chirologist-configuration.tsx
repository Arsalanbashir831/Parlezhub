'use client';

import { Settings, Upload } from 'lucide-react';
import { useRef } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AIChirologistSettings } from '@/types/ai-chirologist';

interface ChirologistConfigurationProps {
  settings: AIChirologistSettings;
  onSettingChange: (key: keyof AIChirologistSettings, value: string) => void;
}

export default function ChirologistConfiguration({
  settings,
  onSettingChange,
}: ChirologistConfigurationProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onSettingChange('avatar', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card className="dark:border-gray-700 dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Chirologist Configuration
        </CardTitle>
        <CardDescription>
          Customize your AI chirologist&rsquo;s appearance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar Upload */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src={settings.avatar || '/placeholder.svg'} />
              <AvatarFallback className="bg-primary-100 text-2xl text-primary-700 dark:bg-primary-800 dark:text-primary-200">
                {settings.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <Button
              variant="outline"
              size="sm"
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 transform"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-3 w-3" />
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
          <p className="text-center text-xs text-gray-500">
            Upload a profile picture for your AI chirologist
          </p>
        </div>

        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Chirologist Name</Label>
          <Input
            id="name"
            value={settings.name}
            onChange={(e) => onSettingChange('name', e.target.value)}
            placeholder="Enter chirologist name"
            maxLength={20}
          />
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select
            value={settings.gender}
            onValueChange={(value) => onSettingChange('gender', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="neutral">Neutral</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
