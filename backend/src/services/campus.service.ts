import { prisma } from '../config/db';
import { CreateCampusInput, UpdateCampusInput } from '../validators/campus.validator';
import { NotFoundError } from '../utils/appError';
import { logAudit } from './audit.service';

export async function listCampuses(includeInactive = false) {
  return prisma.campus.findMany({
    where: includeInactive ? undefined : { isActive: true },
    orderBy: { name: 'asc' },
  });
}

export async function getCampusById(id: string) {
  const campus = await prisma.campus.findUnique({ where: { id } });
  if (!campus) throw new NotFoundError('Campus not found');
  return campus;
}

export async function createCampus(input: CreateCampusInput, actorId: string) {
  const campus = await prisma.campus.create({ data: { ...input, isActive: input.isActive ?? true } });
  await logAudit({ actorId, action: 'CAMPUS_CREATED', entityType: 'Campus', entityId: campus.id });
  return campus;
}

export async function updateCampus(id: string, input: UpdateCampusInput, actorId: string) {
  await getCampusById(id);
  const campus = await prisma.campus.update({ where: { id }, data: input });
  await logAudit({ actorId, action: 'CAMPUS_UPDATED', entityType: 'Campus', entityId: campus.id });
  return campus;
}
