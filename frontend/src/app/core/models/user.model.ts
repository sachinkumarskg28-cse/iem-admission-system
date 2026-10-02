export type UserRole = 'student' | 'officer' | 'admin';

export interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  department?: string;
  isActive?: boolean;
  isEmailVerified?: boolean;
  lastLogin?: string | Date;
  createdAt?: string | Date;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token: string;
  user: User;
  student?: any;
}
