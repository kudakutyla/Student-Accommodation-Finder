import { prisma } from '../config/db';
import { Prisma } from '@prisma/client';

interface LogAuditInput {
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Prisma.InputJsonValue;
}

// Never pass passwords/secrets/tokens in metadata.
export async function logAudit(input: LogAuditInput) {
  return prisma.auditLog.create({
    data: {
      actorId: input.actorId ?? null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      metadata: input.metadata,
    },
  });
}
