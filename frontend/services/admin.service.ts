import { apiRequest } from '@/lib/api-client';
import { ApiSuccess, AuditLog, Listing, Report, Review, User } from '@/types';

export interface AdminDashboardStats {
  totalStudents: number;
  totalLandlords: number;
  verifiedLandlords: number;
  pendingLandlords: number;
  totalListings: number;
  pendingListings: number;
  approvedListings: number;
  pendingReports: number;
  recentActivity: AuditLog[];
}

export function getAdminDashboardRequest() {
  return apiRequest<ApiSuccess<AdminDashboardStats>>('/admin/dashboard');
}

export function listUsersRequest(role?: 'STUDENT' | 'LANDLORD' | 'ADMIN') {
  return apiRequest<ApiSuccess<User[]>>('/admin/users', { query: role ? { role } : undefined });
}

export function suspendUserRequest(id: string, isSuspended: boolean) {
  return apiRequest<ApiSuccess<User>>(`/admin/users/${id}/suspend`, { method: 'PATCH', body: { isSuspended } });
}

export function listLandlordsRequest() {
  return apiRequest<ApiSuccess<User[]>>('/admin/landlords');
}

export function listPendingLandlordsRequest() {
  return apiRequest<ApiSuccess<User[]>>('/admin/landlords/pending');
}

export function verifyLandlordRequest(
  id: string,
  status: 'VERIFIED' | 'REJECTED' | 'SUSPENDED' | 'PENDING',
  reason?: string
) {
  return apiRequest<ApiSuccess<User>>(`/admin/landlords/${id}/verify`, {
    method: 'PATCH',
    body: { status, reason },
  });
}

export function listAdminListingsRequest(approvalStatus?: string) {
  return apiRequest<ApiSuccess<Listing[]>>('/admin/listings', { query: approvalStatus ? { approvalStatus } : undefined });
}

export function approveListingRequest(id: string) {
  return apiRequest<ApiSuccess<Listing>>(`/admin/listings/${id}/approve`, { method: 'PATCH' });
}

export function rejectListingRequest(id: string, rejectionReason: string) {
  return apiRequest<ApiSuccess<Listing>>(`/admin/listings/${id}/reject`, {
    method: 'PATCH',
    body: { rejectionReason },
  });
}

export function listAdminReportsRequest(status?: string) {
  return apiRequest<ApiSuccess<Report[]>>('/admin/reports', { query: status ? { status } : undefined });
}

export function resolveReportRequest(id: string, status: 'RESOLVED' | 'DISMISSED' | 'INVESTIGATING') {
  return apiRequest<ApiSuccess<Report>>(`/admin/reports/${id}`, { method: 'PATCH', body: { status } });
}

export function listAuditLogsRequest() {
  return apiRequest<ApiSuccess<AuditLog[]>>('/admin/audit-logs');
}

export function listAdminReviewsRequest() {
  return apiRequest<ApiSuccess<Review[]>>('/admin/reviews');
}

export function deleteAdminReviewRequest(id: string) {
  return apiRequest<ApiSuccess<null>>(`/admin/reviews/${id}`, { method: 'DELETE' });
}
