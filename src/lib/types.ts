export type UserRole = 'student' | 'teacher';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  city: string;
  country: string;
  postalCode: string;
  address: string;
  qualification?: string; // Only for teachers
  isVerified: boolean;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}
