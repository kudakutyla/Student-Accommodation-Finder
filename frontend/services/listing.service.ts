import { apiRequest } from '@/lib/api-client';
import { AccommodationType, ApiSuccess, AvailabilityStatus, Listing } from '@/types';

export interface SearchListingsParams {
  campusId?: string;
  minPrice?: number;
  maxPrice?: number;
  maxDistance?: number;
  accommodationType?: AccommodationType;
  availabilityStatus?: AvailabilityStatus;
  minAvailableRooms?: number;
  amenities?: string[];
  minRating?: number;
  search?: string;
  sort?: 'price_asc' | 'price_desc' | 'nearest' | 'rating' | 'newest';
  page?: number;
  limit?: number;
}

export function searchListingsRequest(params: SearchListingsParams) {
  return apiRequest<ApiSuccess<Listing[]>>('/listings', {
    query: params as Record<string, string | number | boolean | string[] | undefined>,
    authenticated: false,
  });
}

export function getListingRequest(id: string) {
  return apiRequest<ApiSuccess<Listing>>(`/listings/${id}`, { authenticated: !!id });
}

export function getMyListingsRequest() {
  return apiRequest<ApiSuccess<Listing[]>>('/listings/mine');
}

export interface ListingPayload {
  campusId: string;
  title: string;
  description: string;
  accommodationType: AccommodationType;
  pricePerMonth: number;
  address: string;
  latitude: number;
  longitude: number;
  totalRooms: number;
  availableRooms: number;
  amenities: string[];
  photos: string[];
}

export function createListingRequest(payload: ListingPayload) {
  return apiRequest<ApiSuccess<Listing>>('/listings', { method: 'POST', body: payload });
}

export function updateListingRequest(id: string, payload: Partial<ListingPayload>) {
  return apiRequest<ApiSuccess<Listing>>(`/listings/${id}`, { method: 'PUT', body: payload });
}

export function updateAvailabilityRequest(
  id: string,
  payload: { availabilityStatus?: AvailabilityStatus; availableRooms?: number }
) {
  return apiRequest<ApiSuccess<Listing>>(`/listings/${id}/availability`, { method: 'PATCH', body: payload });
}

export function deleteListingRequest(id: string) {
  return apiRequest<ApiSuccess<null>>(`/listings/${id}`, { method: 'DELETE' });
}
