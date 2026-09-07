import { apiRequest } from '@/lib/api-client';
import { ApiSuccess, Review } from '@/types';

export function createReviewRequest(payload: { listingId: string; rating: number; comment?: string }) {
  return apiRequest<ApiSuccess<Review>>('/reviews', { method: 'POST', body: payload });
}

export function updateReviewRequest(id: string, payload: { rating?: number; comment?: string }) {
  return apiRequest<ApiSuccess<Review>>(`/reviews/${id}`, { method: 'PUT', body: payload });
}

export function deleteReviewRequest(id: string) {
  return apiRequest<ApiSuccess<null>>(`/reviews/${id}`, { method: 'DELETE' });
}

export function listListingReviewsRequest(listingId: string) {
  return apiRequest<ApiSuccess<Review[]>>(`/reviews/listing/${listingId}`, { authenticated: false });
}

export function listMyReviewsRequest() {
  return apiRequest<ApiSuccess<Review[]>>('/reviews/mine');
}
