export type UserRole = 'student' | 'consultant';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  city: string;
  country: string;
  postalCode: string;
  address: string;
  qualification?: string; // Only for consultants
  isVerified: boolean;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}
