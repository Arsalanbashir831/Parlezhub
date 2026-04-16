'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Clock, DollarSign, Plus, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { toast } from 'sonner';

import { ServiceFormData, ServiceType } from '@/types/service';
import { getServiceTypeLabel } from '@/lib/service-utils';
import { useAIGeneration } from '@/hooks/useAIGeneration';
import AIGenerateButton from '@/components/ui/ai-generate-button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
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

const serviceFormSchema = z.object({
  type: z.enum(['language', 'astrology', 'general']),
  title: z
    .string()
    .min(10, 'Title must be at least 10 characters')
    .max(80, 'Title must not exceed 80 characters'),
  description: z
    .string()
    .min(100, 'Description must be at least 100 characters')
    .max(1200, 'Description must not exceed 1200 characters'),
  shortDescription: z
    .string()
    .min(20, 'Short description must be at least 20 characters')
    .max(160, 'Short description must not exceed 160 characters'),
  price: z
    .number()
    .min(5, 'Price must be at least $5')
    .max(1000, 'Price must not exceed $1000'),
  duration: z
    .number()
    .min(15, 'Duration must be at least 15 minutes')
    .max(300, 'Duration must not exceed 5 hours'),
  tags: z
    .array(z.string())
    .min(1, 'At least one tag is required')
    .max(5, 'Maximum 5 tags allowed'),
  whatYouProvide: z
    .array(z.string())
    .min(1, 'At least one service item is required')
    .max(10, 'Maximum 10 service items allowed'),
});

type ServiceFormSchema = z.infer<typeof serviceFormSchema>;

interface ServiceFormProps {
  initialData?: Partial<ServiceFormData>;
  onSubmit: (data: ServiceFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  error?: string | null;
  mode?: 'create' | 'edit';
  availableTypes?: ServiceType[];
}

export default function ServiceForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  error = null,
  mode = 'create',
  availableTypes = ['language', 'astrology', 'general'],
}: ServiceFormProps) {
  const [newTag, setNewTag] = useState('');
  const [newService, setNewService] = useState('');
  const { isGenerating: isGeneratingDescription, generateContent, error: aiError } =
    useAIGeneration();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues,
  } = useForm<ServiceFormSchema>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      type: 'language',
      title: '',
      description: '',
      shortDescription: '',
      price: 25,
      duration: 60,
      tags: [],
      whatYouProvide: [],
      ...initialData,
    },
  });

  const watchedFields = watch();

  const addTag = () => {
    if (newTag.trim() && !watchedFields.tags?.includes(newTag.trim())) {
      const currentTags = getValues('tags') || [];
      setValue('tags', [...currentTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = getValues('tags') || [];
    setValue(
      'tags',
      currentTags.filter((tag) => tag !== tagToRemove)
    );
  };

  const addService = () => {
    if (
      newService.trim() &&
      !watchedFields.whatYouProvide?.includes(newService.trim())
    ) {
      const currentServices = getValues('whatYouProvide') || [];
      setValue('whatYouProvide', [...currentServices, newService.trim()]);
      setNewService('');
    }
  };

  const removeService = (index: number) => {
    const currentServices = getValues('whatYouProvide') || [];
    setValue(
      'whatYouProvide',
      currentServices.filter((_, i) => i !== index)
    );
  };

  const onFormSubmit = async (data: ServiceFormSchema) => {
    await onSubmit(data as ServiceFormData);
  };

  const handleGenerateDescription = async () => {
    const title = watchedFields.title?.trim();
    const shortDescription = watchedFields.shortDescription?.trim();
    const serviceType = watchedFields.type;

    if (!title || !shortDescription) {
      toast.error('Please enter a title and short description first');
      return;
    }

    try {
      const { content, error: generationError } = await generateContent({
        type: 'service',
        title,
        shortDescription,
        serviceType,
        maxLength: 1200,
      });

      if (content) {
        setValue('description', content);
        toast.success('Description generated successfully!');
      } else if (generationError) {
        toast.error(generationError);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate content');
    }
  };

  const canGenerateDescription =
    watchedFields.title?.trim() && watchedFields.shortDescription?.trim();

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Error Display */}
      {error && (
        <Alert variant="destructive" className="rounded-2xl border-red-500/20 bg-red-500/10 text-red-200">
          <AlertDescription className="font-medium">{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Basic Information */}
        <Card className="overflow-hidden rounded-3xl border-white/5 bg-white/[0.03] shadow-2xl backdrop-blur-md transition-all duration-300">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="font-serif text-2xl font-bold text-primary-500">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Service Type */}
            <div>
              <Label htmlFor="type" className="ml-1 text-[10px] font-bold uppercase tracking-widest text-primary-100/60">Service Type</Label>
              <Select
                value={watchedFields.type}
                onValueChange={(value: ServiceType) => setValue('type', value)}
                disabled={mode === 'edit'}
              >
                <SelectTrigger className="h-12 w-full rounded-xl border-primary-500/10 bg-white/5 text-primary-100 placeholder:text-primary-100/20 focus:ring-primary-500/30">
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent className="border-primary-500/10 bg-background text-white">
                  {availableTypes.map((type) => (
                    <SelectItem key={type} value={type} className="focus:bg-primary-500 focus:text-primary-950">
                      {getServiceTypeLabel(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.type.message}
                </p>
              )}
            </div>

            {/* Title */}
            <div>
              <Label htmlFor="title" className="ml-1 text-[10px] font-bold uppercase tracking-widest text-primary-100/60">Service Title</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="I will provide professional language consultation..."
                maxLength={80}
                className="h-12 rounded-xl border-primary-500/10 bg-white/5 text-white placeholder:text-primary-100/20 focus-visible:ring-primary-500/30"
              />
              <div className="mt-1 flex justify-between text-[10px] font-bold uppercase tracking-widest text-primary-100/40">
                {errors.title && (
                  <span className="text-red-400">{errors.title.message}</span>
                )}
                <span className="ml-auto">
                  {watchedFields.title?.length || 0}/80
                </span>
              </div>
            </div>

            {/* Short Description */}
            <div>
              <Label htmlFor="shortDescription" className="ml-1 text-[10px] font-bold uppercase tracking-widest text-primary-100/60">Short Description</Label>
              <Textarea
                id="shortDescription"
                {...register('shortDescription')}
                placeholder="Brief summary of what you offer..."
                rows={2}
                maxLength={160}
                className="h-12 rounded-xl border-primary-500/10 bg-white/5 text-white placeholder:text-primary-100/20 focus-visible:ring-primary-500/30"
              />
              <div className="mt-1 flex justify-between text-[10px] font-bold uppercase tracking-widest text-primary-100/40">
                {errors.shortDescription && (
                  <span className="text-red-400">
                    {errors.shortDescription.message}
                  </span>
                )}
                <span className="ml-auto">
                  {watchedFields.shortDescription?.length || 0}/160
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="description" className="ml-1 text-[10px] font-bold uppercase tracking-widest text-primary-100/60">Full Description</Label>
                <AIGenerateButton
                  onClick={handleGenerateDescription}
                  disabled={!canGenerateDescription}
                  isGenerating={isGeneratingDescription}
                />
              </div>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Detailed description of your service..."
                rows={6}
                maxLength={1200}
                disabled={isGeneratingDescription}
                className="h-12 mt-2 rounded-xl border-primary-500/10 bg-white/5 text-white placeholder:text-primary-100/20 focus-visible:ring-primary-500/30"
              />
              <div className="mt-1 flex justify-between text-[10px] font-bold uppercase tracking-widest text-primary-100/40">
                {errors.description && (
                  <span className="text-red-400">
                    {errors.description.message}
                  </span>
                )}
                <span className="ml-auto">
                  {watchedFields.description?.length || 0}/1200
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Session Details */}
        <Card className="overflow-hidden rounded-3xl border-white/5 bg-white/[0.03] shadow-2xl backdrop-blur-md transition-all duration-300">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="font-serif text-2xl font-bold text-primary-500">Pricing & Session Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Price */}
            <div>
              <Label htmlFor="price" className="ml-1 text-[10px] font-bold uppercase tracking-widest text-primary-100/60">Price per Session (USD)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <Input
                  id="price"
                  type="number"
                  {...register('price', { valueAsNumber: true })}
                  className="pl-10 h-12 rounded-xl border-primary-500/10 bg-white/5 text-white placeholder:text-primary-100/20 focus-visible:ring-primary-500/30"
                  placeholder="25"
                  min={5}
                  max={1000}

                />
              </div>
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.price.message}
                </p>
              )}
            </div>

            {/* Duration */}
            <div>
              <Label htmlFor="duration" className="ml-1 text-[10px] font-bold uppercase tracking-widest text-primary-100/60">Session Duration (minutes)</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <Input
                  id="duration"
                  type="number"
                  {...register('duration', { valueAsNumber: true })}
                  className="pl-10 h-12 rounded-xl border-primary-500/10 bg-white/5 text-white placeholder:text-primary-100/20 focus-visible:ring-primary-500/30"
                  placeholder="60"
                  min={15}
                  max={300}
                  disabled
                />
              </div>
              {errors.duration && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.duration.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tags */}
      <Card className="overflow-hidden rounded-3xl border-white/5 bg-white/[0.03] shadow-2xl backdrop-blur-md transition-all duration-300">
        <CardHeader>
          <CardTitle className="font-serif text-2xl font-bold text-primary-500">Tags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add a tag..."
              onKeyPress={(e) =>
                e.key === 'Enter' && (e.preventDefault(), addTag())
              }
              maxLength={20}
              className="h-12 rounded-xl border-primary-500/10 bg-white/5 text-white placeholder:text-primary-100/20 focus-visible:ring-primary-500/30"
            />
            <Button type="button" onClick={addTag} variant="outline" size="sm" className="h-12 rounded-xl border-primary-500/10 bg-white/5 text-white placeholder:text-primary-100/20 focus-visible:ring-primary-500/30">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {watchedFields.tags?.map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="flex items-center gap-2 rounded-lg border-primary-500/20 bg-primary-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-primary-400"
              >
                {tag}
                <X
                  className="h-3.5 w-3.5 cursor-pointer transition-colors hover:text-red-400"
                  onClick={() => removeTag(tag)}
                />
              </Badge>
            ))}
          </div>

          {errors.tags && (
            <p className="text-sm text-red-600">{errors.tags.message}</p>
          )}
        </CardContent>
      </Card>

      {/* What You Provide */}
      <Card className="overflow-hidden rounded-3xl border-white/5 bg-white/[0.03] shadow-2xl backdrop-blur-md transition-all duration-300">
        <CardHeader>
          <CardTitle className="font-serif text-2xl font-bold text-primary-500">What You Provide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              placeholder="Add what you will provide in your session..."
              onKeyPress={(e) =>
                e.key === 'Enter' && (e.preventDefault(), addService())
              }
              className="h-12 rounded-xl border-primary-500/10 bg-white/5 text-white placeholder:text-primary-100/20 focus-visible:ring-primary-500/30"
            />
            <Button
              type="button"
              onClick={addService}
              variant="outline"
              size="sm"
              className="h-12 rounded-xl border-primary-500/10 bg-white/5 text-white placeholder:text-primary-100/20 focus-visible:ring-primary-500/30"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {watchedFields.whatYouProvide?.map((item, index) => (
              <div
                key={index}
                className="group flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3 transition-colors hover:bg-white/5"
              >
                <span className="text-sm font-medium text-primary-100/80">{item}</span>
                <X
                  className="h-4 w-4 cursor-pointer text-primary-100/20 transition-colors hover:text-red-400 group-hover:text-primary-100/40"
                  onClick={() => removeService(index)}
                />
              </div>
            ))}
          </div>

          {errors.whatYouProvide && (
            <p className="text-sm text-red-600">
              {errors.whatYouProvide.message}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
        {onCancel && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="h-12 rounded-xl border-primary-500/10 bg-white/5 text-white px-8 font-bold"
          >
            Cancel
          </Button>
        )}
        <Button 
          type="submit" 
          disabled={isLoading || isGeneratingDescription}
          className="h-12 rounded-xl bg-primary-500 px-10 text-sm font-bold uppercase tracking-widest text-white shadow-xl transition-all hover:bg-primary-600 active:scale-95"
        >
          {isLoading
            ? 'Saving...'
            : mode === 'create'
              ? 'Create Service'
              : 'Update Service'}
        </Button>
      </div>
    </form>
  );
}
