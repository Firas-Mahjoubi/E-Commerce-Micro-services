export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  emailVerified?: boolean;
  isActive?: boolean;
  roles?: string[];
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface AuthResponse {
  message: string;
  token_type: string;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: User;
}

export interface ApiError {
  error: string;
  message: string;
  details?: string[];
}
