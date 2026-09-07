import request from 'supertest';
import { app, prisma, registerAndLogin, cleanupUserByEmail } from './helpers';

describe('Authorization', () => {
  const emails: string[] = [];

  afterAll(async () => {
    await Promise.all(emails.map((e) => cleanupUserByEmail(e)));
    await prisma.$disconnect();
  });

  it('rejects a STUDENT trying to create a listing', async () => {
    const student = await registerAndLogin({ role: 'STUDENT' });
    emails.push(student.email);

    const campus = await prisma.campus.findFirst({ where: { isActive: true } });
    const res = await request(app)
      .post('/api/listings')
      .set('Authorization', `Bearer ${student.token}`)
      .send({
        campusId: campus!.id,
        title: 'Illegal student listing',
        description: 'Students must not be able to create listings.',
        accommodationType: 'ROOM',
        pricePerMonth: 1000,
        address: '1 Test St',
        latitude: -33.9,
        longitude: 18.4,
        totalRooms: 1,
        availableRooms: 1,
      });

    expect(res.status).toBe(403);
  });

  it('rejects an unverified LANDLORD trying to create a listing', async () => {
    const landlord = await registerAndLogin({ role: 'LANDLORD' });
    emails.push(landlord.email);

    const campus = await prisma.campus.findFirst({ where: { isActive: true } });
    const res = await request(app)
      .post('/api/listings')
      .set('Authorization', `Bearer ${landlord.token}`)
      .send({
        campusId: campus!.id,
        title: 'Unverified landlord listing',
        description: 'This should be rejected because the landlord is not verified.',
        accommodationType: 'ROOM',
        pricePerMonth: 1000,
        address: '1 Test St',
        latitude: -33.9,
        longitude: 18.4,
        totalRooms: 1,
        availableRooms: 1,
      });

    expect(res.status).toBe(403);
  });

  it('rejects a STUDENT accessing admin APIs', async () => {
    const student = await registerAndLogin({ role: 'STUDENT' });
    emails.push(student.email);

    const res = await request(app).get('/api/admin/dashboard').set('Authorization', `Bearer ${student.token}`);
    expect(res.status).toBe(403);
  });

  it('rejects a LANDLORD accessing admin APIs', async () => {
    const landlord = await registerAndLogin({ role: 'LANDLORD' });
    emails.push(landlord.email);

    const res = await request(app).get('/api/admin/dashboard').set('Authorization', `Bearer ${landlord.token}`);
    expect(res.status).toBe(403);
  });

  it('rejects requests with no token on protected routes', async () => {
    const res = await request(app).get('/api/favourites');
    expect(res.status).toBe(401);
  });

  it('rejects a LANDLORD editing another landlord listing', async () => {
    const landlordA = await registerAndLogin({ role: 'LANDLORD' });
    const landlordB = await registerAndLogin({ role: 'LANDLORD' });
    emails.push(landlordA.email, landlordB.email);

    await prisma.user.update({ where: { id: landlordA.user.id }, data: { verificationStatus: 'VERIFIED' } });
    const campus = await prisma.campus.findFirst({ where: { isActive: true } });

    const createRes = await request(app)
      .post('/api/listings')
      .set('Authorization', `Bearer ${landlordA.token}`)
      .send({
        campusId: campus!.id,
        title: "Landlord A's listing",
        description: 'A listing owned by landlord A only.',
        accommodationType: 'ROOM',
        pricePerMonth: 1500,
        address: '2 Test St',
        latitude: -33.91,
        longitude: 18.41,
        totalRooms: 2,
        availableRooms: 1,
      });
    expect(createRes.status).toBe(201);
    const listingId = createRes.body.data.id;

    const editAttempt = await request(app)
      .put(`/api/listings/${listingId}`)
      .set('Authorization', `Bearer ${landlordB.token}`)
      .send({ title: 'Hijacked title' });

    expect(editAttempt.status).toBe(403);
  });

  it('has an ADMIN seeded account available', async () => {
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    expect(admin).toBeTruthy();
  });
});
