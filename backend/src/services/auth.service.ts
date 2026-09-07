import { prisma } from '../config/db';
import { hashPassword, comparePassword } from '../utils/password';
import { signToken } from '../utils/jwt';
import { ConflictError, UnauthorizedError, ValidationError } from '../utils/appError';
import { RegisterInput, LoginInput } from '../validators/auth.validator';
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

export async function registerUser(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new ConflictError('An account with this email already exists');
  }

  if (input.role === 'STUDENT' && input.campusId) {
    const campus = await prisma.campus.findUnique({ where: { id: input.campusId } });
    if (!campus || !campus.isActive) {
      throw new ValidationError('Selected campus is invalid');
    }
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      role: input.role,
      firstName: input.firstName,
      lastName: input.lastName,
      phoneNumber: input.phoneNumber,
      campusId: input.role === 'STUDENT' ? input.campusId : undefined,
      businessName: input.role === 'LANDLORD' ? input.businessName : undefined,
      verificationStatus: input.role === 'LANDLORD' ? 'PENDING' : undefined,
    },
    select: PUBLIC_USER_SELECT,
  });

  if (input.role === 'LANDLORD') {
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' }, select: { id: true } });
    await Promise.all(
      admins.map((admin) =>
        createNotification({
          userId: admin.id,
          type: 'LANDLORD_REGISTERED',
          title: 'New landlord registration',
          message: `${user.firstName} ${user.lastName} registered as a landlord and needs verification.`,
          relatedEntityType: 'User',
          relatedEntityId: user.id,
        })
      )
    );
  }

  await logAudit({ actorId: user.id, action: 'USER_REGISTERED', entityType: 'User', entityId: user.id });

  const token = signToken({ userId: user.id, role: user.role });
  return { user, token };
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const valid = await comparePassword(input.password, user.passwordHash);
  if (!valid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  if (user.isSuspended) {
    throw new UnauthorizedError('Your account has been suspended. Contact support.');
  }

  const token = signToken({ userId: user.id, role: user.role });

  const { passwordHash: _omit, ...publicUser } = user;
  return { user: publicUser, token };
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: PUBLIC_USER_SELECT });
  if (!user) {
    throw new UnauthorizedError('User not found');
  }
  return user;
}
