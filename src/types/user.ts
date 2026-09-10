export type UserRole = 'patient' | 'caregiver' | 'doctor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title?: string;
  relationship?: string;
  organization?: string;
  phone?: string;
  avatarUrl?: string;
  createdAt?: string;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: string;
}
