import { apiRequest } from '@/lib/api-client';
import { ApiSuccess, Enquiry } from '@/types';

export function createEnquiryRequest(payload: { listingId: string; message: string }) {
  return apiRequest<ApiSuccess<Enquiry>>('/enquiries', { method: 'POST', body: payload });
}

export function listEnquiriesRequest() {
  return apiRequest<ApiSuccess<Enquiry[]>>('/enquiries');
}

export function getEnquiryRequest(id: string) {
  return apiRequest<ApiSuccess<Enquiry>>(`/enquiries/${id}`);
}
