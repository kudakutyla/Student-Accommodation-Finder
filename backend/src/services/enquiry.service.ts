import { prisma } from '../config/db';
import { NotFoundError } from '../utils/appError';
import { CreateEnquiryInput } from '../validators/enquiry.validator';
import { createNotification } from './notification.service';

export async function createEnquiry(studentId: string, input: CreateEnquiryInput) {
  const listing = await prisma.listing.findUnique({ where: { id: input.listingId } });
  if (!listing || listing.approvalStatus !== 'APPROVED') {
    throw new NotFoundError('Listing not found');
  }

  const landlordId = listing.ownerId;

  const conversation = await prisma.conversation.upsert({
    where: {
      listingId_studentId_landlordId: { listingId: listing.id, studentId, landlordId },
    },
    update: { status: 'OPEN' },
    create: { listingId: listing.id, studentId, landlordId },
  });

  await prisma.message.create({
    data: { conversationId: conversation.id, senderId: studentId, content: input.message },
  });

  const enquiry = await prisma.enquiry.upsert({
    where: { conversationId: conversation.id },
    update: { message: input.message, status: 'OPEN' },
    create: {
      studentId,
      landlordId,
      listingId: listing.id,
      conversationId: conversation.id,
      message: input.message,
    },
  });

  await createNotification({
    userId: landlordId,
    type: 'ENQUIRY_RECEIVED',
    title: 'New enquiry received',
    message: `You have a new enquiry about "${listing.title}".`,
    relatedEntityType: 'Enquiry',
    relatedEntityId: enquiry.id,
  });

  return prisma.enquiry.findUnique({
    where: { id: enquiry.id },
    include: { listing: { select: { id: true, title: true } }, student: { select: { id: true, firstName: true, lastName: true } } },
  });
}

export async function listMyEnquiries(userId: string, role: string) {
  const where = role === 'LANDLORD' ? { landlordId: userId } : { studentId: userId };
  return prisma.enquiry.findMany({
    where,
    include: {
      listing: { select: { id: true, title: true } },
      student: { select: { id: true, firstName: true, lastName: true } },
      landlord: { select: { id: true, firstName: true, lastName: true, businessName: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getEnquiryById(userId: string, role: string, enquiryId: string) {
  const enquiry = await prisma.enquiry.findUnique({
    where: { id: enquiryId },
    include: { listing: true, student: true, landlord: true },
  });
  if (!enquiry) throw new NotFoundError('Enquiry not found');
  const isParticipant = role === 'LANDLORD' ? enquiry.landlordId === userId : enquiry.studentId === userId;
  if (!isParticipant) throw new NotFoundError('Enquiry not found');
  return enquiry;
}
