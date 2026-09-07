import { apiRequest } from '@/lib/api-client';
import { ApiSuccess, User } from '@/types';

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  campusId?: string;
  businessName?: string;
}

export function getProfileRequest() {
  return apiRequest<ApiSuccess<User>>('/users/profile');
}

export function updateProfileRequest(payload: UpdateProfilePayload) {
  return apiRequest<ApiSuccess<User>>('/users/profile', { method: 'PUT', body: payload });
}
