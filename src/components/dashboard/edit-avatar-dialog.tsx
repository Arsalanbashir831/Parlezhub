'use client';

import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EditAvatarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentAvatar?: string;
  userName?: string;
  onSave: (avatarUrl: string) => void;
}

export default function EditAvatarDialog({
  open,
  onOpenChange,
  currentAvatar,
  userName = 'User',
  onSave,
}: EditAvatarDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentAvatar || null
  );
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRemoveAvatar = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleSave = async () => {
    setIsUploading(true);
    try {
      // In a real app, you would upload the file to your server/cloud storage
      // For now, we'll just use the preview URL
      const avatarUrl = previewUrl || '';
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate upload
      onSave(avatarUrl);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to upload avatar:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewUrl(currentAvatar || null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile Picture</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Current Avatar Preview */}
          <div className="flex justify-center">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={previewUrl || undefined} alt={userName} />
                <AvatarFallback className="text-lg">
                  {userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {previewUrl && (
                <button
                  onClick={handleRemoveAvatar}
                  className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="avatar-upload">Upload New Picture</Label>
            <div className="flex items-center gap-2">
              <Input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  document.getElementById('avatar-upload')?.click()
                }
                className="flex-1"
              >
                <Upload className="mr-2 h-4 w-4" />
                Choose File
              </Button>
              {selectedFile && (
                <span className="text-sm text-gray-600">
                  {selectedFile.name}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Recommended: Square image, max 5MB
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isUploading}>
              {isUploading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
