import { prisma } from '../config/db';
import { UpdateProfileInput } from '../validators/user.validator';
import { NotFoundError } from '../utils/appError';

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

export async function updateOwnProfile(userId: string, role: string, input: UpdateProfileInput) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError('User not found');

  return prisma.user.update({
    where: { id: userId },
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      phoneNumber: input.phoneNumber,
      profileImageUrl: input.profileImageUrl === '' ? null : input.profileImageUrl,
      // Only students may change their campus; only landlords may change business name.
      campusId: role === 'STUDENT' ? input.campusId : undefined,
      businessName: role === 'LANDLORD' ? input.businessName : undefined,
    },
    select: PUBLIC_USER_SELECT,
  });
}
