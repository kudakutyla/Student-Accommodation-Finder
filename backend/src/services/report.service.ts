import { prisma } from '../config/db';
import { NotFoundError } from '../utils/appError';
import { CreateReportInput } from '../validators/report.validator';
import { createNotification } from './notification.service';
import { logAudit } from './audit.service';

export async function createReport(reporterId: string, input: CreateReportInput) {
  const listing = await prisma.listing.findUnique({ where: { id: input.listingId } });
  if (!listing) throw new NotFoundError('Listing not found');

  const report = await prisma.report.create({
    data: {
      reporterId,
      listingId: input.listingId,
      reason: input.reason,
      description: input.description,
    },
  });

  const admins = await prisma.user.findMany({ where: { role: 'ADMIN' }, select: { id: true } });
  await Promise.all(
    admins.map((admin) =>
      createNotification({
        userId: admin.id,
        type: 'REPORT_SUBMITTED',
        title: 'New listing report',
        message: `A report was submitted for listing "${listing.title}".`,
        relatedEntityType: 'Report',
        relatedEntityId: report.id,
      })
    )
  );

  return report;
}

export async function listReports(status?: string) {
  return prisma.report.findMany({
    where: status ? { status: status as any } : undefined,
    include: {
      listing: { select: { id: true, title: true } },
      reporter: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function resolveReport(reportId: string, adminId: string, status: 'RESOLVED' | 'DISMISSED' | 'INVESTIGATING') {
  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report) throw new NotFoundError('Report not found');

  const updated = await prisma.report.update({
    where: { id: reportId },
    data: {
      status,
      resolvedAt: status === 'RESOLVED' || status === 'DISMISSED' ? new Date() : null,
      resolvedById: status === 'RESOLVED' || status === 'DISMISSED' ? adminId : null,
    },
  });

  await createNotification({
    userId: report.reporterId,
    type: 'REPORT_RESOLVED',
    title: 'Report update',
    message: `Your report has been updated to status: ${status}.`,
    relatedEntityType: 'Report',
    relatedEntityId: reportId,
  });
  await logAudit({ actorId: adminId, action: 'REPORT_RESOLVED', entityType: 'Report', entityId: reportId, metadata: { status } });

  return updated;
}
