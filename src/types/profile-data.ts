export interface ProfileData {
  username: string;
  email: string;
  bio: string;
  phoneNumber?: string;
  city: string;
  country: string;
  postalCode?: string;
  address?: string;
  avatar?: string;
  // Teacher-specific fields (optional for students)
  qualification?: string;
  experience_years?: number;
  teachingExperience?: string;
  hourlyRate?: number;
  education?: string;
  languages?: string[];
  specialties?: string[];
}
