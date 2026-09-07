import request from 'supertest';
import { app, prisma, uniqueEmail, cleanupUserByEmail } from './helpers';

describe('Authentication', () => {
  const createdEmails: string[] = [];

  afterAll(async () => {
    await Promise.all(createdEmails.map((e) => cleanupUserByEmail(e)));
    await prisma.$disconnect();
  });

  it('registers a new student', async () => {
    const campus = await prisma.campus.findFirst({ where: { isActive: true } });
    const email = uniqueEmail('register-student');
    createdEmails.push(email);

    const res = await request(app).post('/api/auth/register').send({
      email,
      password: 'StrongPass1',
      role: 'STUDENT',
      firstName: 'Jane',
      lastName: 'Doe',
      campusId: campus!.id,
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe(email);
    expect(res.body.data.user.passwordHash).toBeUndefined();
  });

  it('rejects registration with a weak password', async () => {
    const email = uniqueEmail('weak-pass');
    const res = await request(app).post('/api/auth/register').send({
      email,
      password: 'weak',
      role: 'STUDENT',
      firstName: 'Jane',
      lastName: 'Doe',
    });
    expect(res.status).toBe(422);
  });

  it('rejects public registration as ADMIN', async () => {
    const email = uniqueEmail('fake-admin');
    const res = await request(app).post('/api/auth/register').send({
      email,
      password: 'StrongPass1',
      role: 'ADMIN',
      firstName: 'Fake',
      lastName: 'Admin',
    });
    expect(res.status).toBe(422);
  });

  it('hashes the password (never stored in plaintext)', async () => {
    const email = uniqueEmail('hash-check');
    createdEmails.push(email);
    const campus = await prisma.campus.findFirst({ where: { isActive: true } });
    await request(app).post('/api/auth/register').send({
      email,
      password: 'StrongPass1',
      role: 'STUDENT',
      firstName: 'Jane',
      lastName: 'Doe',
      campusId: campus!.id,
    });
    const user = await prisma.user.findUnique({ where: { email } });
    expect(user!.passwordHash).not.toBe('StrongPass1');
    expect(user!.passwordHash.startsWith('$2')).toBe(true);
  });

  it('logs in with correct credentials and rejects incorrect ones', async () => {
    const email = uniqueEmail('login-test');
    createdEmails.push(email);
    const campus = await prisma.campus.findFirst({ where: { isActive: true } });
    await request(app).post('/api/auth/register').send({
      email,
      password: 'StrongPass1',
      role: 'STUDENT',
      firstName: 'Jane',
      lastName: 'Doe',
      campusId: campus!.id,
    });

    const goodLogin = await request(app).post('/api/auth/login').send({ email, password: 'StrongPass1' });
    expect(goodLogin.status).toBe(200);
    expect(goodLogin.body.data.token).toBeDefined();

    const badLogin = await request(app).post('/api/auth/login').send({ email, password: 'WrongPassword1' });
    expect(badLogin.status).toBe(401);
  });

  it('rejects /me without a token and accepts it with a valid token', async () => {
    const noAuth = await request(app).get('/api/auth/me');
    expect(noAuth.status).toBe(401);

    const email = uniqueEmail('me-test');
    createdEmails.push(email);
    const campus = await prisma.campus.findFirst({ where: { isActive: true } });
    const register = await request(app).post('/api/auth/register').send({
      email,
      password: 'StrongPass1',
      role: 'STUDENT',
      firstName: 'Jane',
      lastName: 'Doe',
      campusId: campus!.id,
    });
    const token = register.body.data.token;

    const me = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(me.status).toBe(200);
    expect(me.body.data.email).toBe(email);
  });
});
