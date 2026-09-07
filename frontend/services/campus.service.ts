import { apiRequest } from '@/lib/api-client';
import { ApiSuccess, Campus } from '@/types';

export function listCampusesRequest(all?: boolean) {
  return apiRequest<ApiSuccess<Campus[]>>('/campuses', {
    query: all ? { all: true } : undefined,
    authenticated: !!all,
  });
}

export function getCampusRequest(id: string) {
  return apiRequest<ApiSuccess<Campus>>(`/campuses/${id}`, { authenticated: false });
}

export interface CampusPayload {
  name: string;
  institution: string;
  address: string;
  latitude: number;
  longitude: number;
  isActive?: boolean;
}

export function createCampusRequest(payload: CampusPayload) {
  return apiRequest<ApiSuccess<Campus>>('/campuses', { method: 'POST', body: payload });
}

export function updateCampusRequest(id: string, payload: Partial<CampusPayload>) {
  return apiRequest<ApiSuccess<Campus>>(`/campuses/${id}`, { method: 'PUT', body: payload });
}
