import { apiRequest } from '@/lib/api-client';
import { ApiSuccess, User } from '@/types';

export interface RegisterPayload {
  email: string;
  password: string;
  role: 'STUDENT' | 'LANDLORD';
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  campusId?: string;
  businessName?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

interface AuthResponseData {
  user: User;
  token: string;
}

export function registerRequest(payload: RegisterPayload) {
  return apiRequest<ApiSuccess<AuthResponseData>>('/auth/register', {
    method: 'POST',
    body: payload,
    authenticated: false,
  });
}

export function loginRequest(payload: LoginPayload) {
  return apiRequest<ApiSuccess<AuthResponseData>>('/auth/login', {
    method: 'POST',
    body: payload,
    authenticated: false,
  });
}

export function getMeRequest() {
  return apiRequest<ApiSuccess<User>>('/auth/me');
}

export function logoutRequest() {
  return apiRequest<ApiSuccess<null>>('/auth/logout', { method: 'POST' });
}
