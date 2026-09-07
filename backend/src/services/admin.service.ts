import { prisma } from '../config/db';
import { NotFoundError, ValidationError } from '../utils/appError';
import { VerifyLandlordInput } from '../validators/admin.validator';
import { createNotification } from './notification.service';
import { logAudit } from './audit.service';

const PUBLIC_USER_SELECT = {
  id: true,
  email: true,
  role: true,
  firstName: true,
  lastName: true,
  phoneNumber: true,
  profileImageUrl: true,
  campusId: true,
  businessName: true,
  verificationStatus: true,
  isSuspended: true,
  createdAt: true,
  updatedAt: true,
} as const;

export async function listUsers(role?: 'STUDENT' | 'LANDLORD' | 'ADMIN') {
  return prisma.user.findMany({
    where: role ? { role } : undefined,
    select: PUBLIC_USER_SELECT,
    orderBy: { createdAt: 'desc' },
  });
}

export async function listPendingLandlords() {
  return prisma.user.findMany({
    where: { role: 'LANDLORD', verificationStatus: 'PENDING' },
    select: PUBLIC_USER_SELECT,
    orderBy: { createdAt: 'asc' },
  });
}

export async function verifyLandlord(landlordId: string, adminId: string, input: VerifyLandlordInput) {
  const landlord = await prisma.user.findUnique({ where: { id: landlordId } });
  if (!landlord || landlord.role !== 'LANDLORD') {
    throw new ValidationError('User is not a landlord');
  }

  const updated = await prisma.user.update({
    where: { id: landlordId },
    data: { verificationStatus: input.status },
    select: PUBLIC_USER_SELECT,
  });

  await createNotification({
    userId: landlordId,
    type: input.status === 'VERIFIED' ? 'LANDLORD_VERIFIED' : 'LANDLORD_REJECTED',
    title: `Verification status: ${input.status}`,
    message:
      input.status === 'VERIFIED'
        ? 'Your landlord account has been verified. You can now create listings.'
        : `Your landlord verification status is now ${input.status}.${input.reason ? ` Reason: ${input.reason}` : ''}`,
    relatedEntityType: 'User',
    relatedEntityId: landlordId,
  });

  await logAudit({
    actorId: adminId,
    action: `LANDLORD_${input.status}`,
    entityType: 'User',
    entityId: landlordId,
    metadata: input.reason ? { reason: input.reason } : undefined,
  });

  return updated;
}

export async function setUserSuspension(userId: string, adminId: string, isSuspended: boolean) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError('User not found');
  if (user.role === 'ADMIN') throw new ValidationError('Cannot suspend an admin account');

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { isSuspended },
    select: PUBLIC_USER_SELECT,
  });

  await logAudit({
    actorId: adminId,
    action: isSuspended ? 'USER_SUSPENDED' : 'USER_UNSUSPENDED',
    entityType: 'User',
    entityId: userId,
  });

  return updated;
}

export async function listAuditLogs() {
  return prisma.auditLog.findMany({
    include: { actor: { select: { id: true, firstName: true, lastName: true, role: true } } },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });
}

export async function getDashboardStats() {
  const [
    totalStudents,
    totalLandlords,
    verifiedLandlords,
    pendingLandlords,
    totalListings,
    pendingListings,
    approvedListings,
    pendingReports,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.user.count({ where: { role: 'LANDLORD' } }),
    prisma.user.count({ where: { role: 'LANDLORD', verificationStatus: 'VERIFIED' } }),
    prisma.user.count({ where: { role: 'LANDLORD', verificationStatus: 'PENDING' } }),
    prisma.listing.count(),
    prisma.listing.count({ where: { approvalStatus: 'PENDING' } }),
    prisma.listing.count({ where: { approvalStatus: 'APPROVED' } }),
    prisma.report.count({ where: { status: 'PENDING' } }),
  ]);

  const recentActivity = await prisma.auditLog.findMany({
    include: { actor: { select: { id: true, firstName: true, lastName: true, role: true } } },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  return {
    totalStudents,
    totalLandlords,
    verifiedLandlords,
    pendingLandlords,
    totalListings,
    pendingListings,
    approvedListings,
    pendingReports,
    recentActivity,
  };
}
