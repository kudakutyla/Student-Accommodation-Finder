import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/config/db';

export { app, prisma };

export function uniqueEmail(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}@example.test`;
}

export async function registerAndLogin(overrides: Partial<{
  email: string;
  password: string;
  role: 'STUDENT' | 'LANDLORD';
  firstName: string;
  lastName: string;
  campusId: string;
  businessName: string;
}> = {}) {
  const email = overrides.email ?? uniqueEmail('user');
  const password = overrides.password ?? 'TestPass123';
  const role = overrides.role ?? 'STUDENT';

  let campusId = overrides.campusId;
  if (role === 'STUDENT' && !campusId) {
    const campus = await prisma.campus.findFirst({ where: { isActive: true } });
    campusId = campus?.id;
  }

  const res = await request(app)
    .post('/api/auth/register')
    .send({
      email,
      password,
      role,
      firstName: overrides.firstName ?? 'Test',
      lastName: overrides.lastName ?? 'User',
      ...(role === 'STUDENT' ? { campusId } : {}),
      ...(role === 'LANDLORD' ? { businessName: overrides.businessName ?? 'Test Business' } : {}),
    });

  return { token: res.body.data.token as string, user: res.body.data.user, email, password, status: res.status };
}

export async function cleanupUserByEmail(email: string) {
  await prisma.user.deleteMany({ where: { email } });
}
