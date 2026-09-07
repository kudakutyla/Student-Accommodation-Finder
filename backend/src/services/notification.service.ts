import { prisma } from '../config/db';

interface CreateNotificationInput {
  userId: string;
  type:
    | 'ENQUIRY_RECEIVED'
    | 'ENQUIRY_RESPONDED'
    | 'NEW_MESSAGE'
    | 'LISTING_APPROVED'
    | 'LISTING_REJECTED'
    | 'LISTING_SUBMITTED'
    | 'NEW_REVIEW'
    | 'REPORT_SUBMITTED'
    | 'REPORT_RESOLVED'
    | 'LANDLORD_VERIFIED'
    | 'LANDLORD_REJECTED'
    | 'LANDLORD_REGISTERED'
    | 'SYSTEM';
  title: string;
  message: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
}

export async function createNotification(input: CreateNotificationInput) {
  return prisma.notification.create({ data: input });
}

export async function listNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
}

export async function markNotificationRead(userId: string, notificationId: string) {
  const notification = await prisma.notification.findUnique({ where: { id: notificationId } });
  if (!notification || notification.userId !== userId) {
    return null;
  }
  return prisma.notification.update({ where: { id: notificationId }, data: { isRead: true } });
}

export async function markAllNotificationsRead(userId: string) {
  await prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
}
