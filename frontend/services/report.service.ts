import { apiRequest } from '@/lib/api-client';
import { ApiSuccess, Report, ReportReason } from '@/types';

export function createReportRequest(payload: { listingId: string; reason: ReportReason; description?: string }) {
  return apiRequest<ApiSuccess<Report>>('/reports', { method: 'POST', body: payload });
}
