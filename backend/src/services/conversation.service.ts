import { prisma } from '../config/db';
import { ForbiddenError, NotFoundError } from '../utils/appError';
import { createNotification } from './notification.service';

async function assertParticipant(conversationId: string, userId: string) {
  const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!conversation) throw new NotFoundError('Conversation not found');
  if (conversation.studentId !== userId && conversation.landlordId !== userId) {
    // Return 404 instead of 403 to avoid leaking existence of other users' conversations.
    throw new NotFoundError('Conversation not found');
  }
  return conversation;
}

export async function listMyConversations(userId: string, role: string) {
  const where = role === 'LANDLORD' ? { landlordId: userId } : { studentId: userId };
  return prisma.conversation.findMany({
    where,
    include: {
      listing: { select: { id: true, title: true } },
      student: { select: { id: true, firstName: true, lastName: true } },
      landlord: { select: { id: true, firstName: true, lastName: true, businessName: true } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function getConversationMessages(conversationId: string, userId: string) {
  const conversation = await assertParticipant(conversationId, userId);

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
  });

  // Mark messages from the other participant as read now that this user has viewed them.
  await prisma.message.updateMany({
    where: { conversationId, senderId: { not: userId }, isRead: false },
    data: { isRead: true },
  });

  return { conversation, messages };
}

export async function postMessage(conversationId: string, userId: string, content: string) {
  const conversation = await assertParticipant(conversationId, userId);

  const message = await prisma.message.create({
    data: { conversationId, senderId: userId, content },
  });

  await prisma.conversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } });

  const recipientId = conversation.studentId === userId ? conversation.landlordId : conversation.studentId;
  await createNotification({
    userId: recipientId,
    type: 'NEW_MESSAGE',
    title: 'New message',
    message: 'You have a new message about a listing.',
    relatedEntityType: 'Conversation',
    relatedEntityId: conversationId,
  });

  return message;
}
