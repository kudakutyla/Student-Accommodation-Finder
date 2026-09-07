import { apiRequest } from '@/lib/api-client';
import { ApiSuccess, Favourite } from '@/types';

export function listFavouritesRequest() {
  return apiRequest<ApiSuccess<Favourite[]>>('/favourites');
}

export function addFavouriteRequest(listingId: string) {
  return apiRequest<ApiSuccess<Favourite>>(`/favourites/${listingId}`, { method: 'POST' });
}

export function removeFavouriteRequest(listingId: string) {
  return apiRequest<ApiSuccess<null>>(`/favourites/${listingId}`, { method: 'DELETE' });
}
