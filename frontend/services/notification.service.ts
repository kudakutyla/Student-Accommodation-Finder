import { apiRequest } from '@/lib/api-client';
import { ApiSuccess, Notification } from '@/types';

export function listNotificationsRequest() {
  return apiRequest<ApiSuccess<Notification[]>>('/notifications');
}

export function markNotificationReadRequest(id: string) {
  return apiRequest<ApiSuccess<Notification>>(`/notifications/${id}/read`, { method: 'PATCH' });
}

export function markAllNotificationsReadRequest() {
  return apiRequest<ApiSuccess<null>>('/notifications/read-all', { method: 'PATCH' });
}
