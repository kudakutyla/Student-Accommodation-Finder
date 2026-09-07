import request from 'supertest';
import { app, prisma, registerAndLogin, cleanupUserByEmail } from './helpers';

describe('Listings', () => {
  const emails: string[] = [];

  afterAll(async () => {
    await Promise.all(emails.map((e) => cleanupUserByEmail(e)));
    await prisma.$disconnect();
  });

  async function createVerifiedLandlord() {
    const landlord = await registerAndLogin({ role: 'LANDLORD' });
    emails.push(landlord.email);
    await prisma.user.update({ where: { id: landlord.user.id }, data: { verificationStatus: 'VERIFIED' } });
    return landlord;
  }

  it('rejects listing creation when availableRooms exceeds totalRooms', async () => {
    const landlord = await createVerifiedLandlord();
    const campus = await prisma.campus.findFirst({ where: { isActive: true } });

    const res = await request(app)
      .post('/api/listings')
      .set('Authorization', `Bearer ${landlord.token}`)
      .send({
        campusId: campus!.id,
        title: 'Invalid room count listing',
        description: 'This listing has more available rooms than total rooms.',
        accommodationType: 'APARTMENT',
        pricePerMonth: 2000,
        address: '3 Test St',
        latitude: -33.92,
        longitude: 18.42,
        totalRooms: 1,
        availableRooms: 5,
      });

    expect(res.status).toBe(422);
  });

  it('rejects a negative price', async () => {
    const landlord = await createVerifiedLandlord();
    const campus = await prisma.campus.findFirst({ where: { isActive: true } });

    const res = await request(app)
      .post('/api/listings')
      .set('Authorization', `Bearer ${landlord.token}`)
      .send({
        campusId: campus!.id,
        title: 'Negative price listing',
        description: 'This listing has an invalid negative price.',
        accommodationType: 'APARTMENT',
        pricePerMonth: -500,
        address: '4 Test St',
        latitude: -33.92,
        longitude: 18.42,
        totalRooms: 1,
        availableRooms: 1,
      });

    expect(res.status).toBe(422);
  });

  it('creates a listing as PENDING, hides it from public search, then admin approves it and it becomes visible', async () => {
    const landlord = await createVerifiedLandlord();
    const campus = await prisma.campus.findFirst({ where: { isActive: true } });

    const createRes = await request(app)
      .post('/api/listings')
      .set('Authorization', `Bearer ${landlord.token}`)
      .send({
        campusId: campus!.id,
        title: 'Approval workflow test listing',
        description: 'This listing starts pending and gets approved by an admin.',
        accommodationType: 'STUDIO',
        pricePerMonth: 3000,
        address: '5 Test St',
        latitude: campus!.latitude + 0.01,
        longitude: campus!.longitude + 0.01,
        totalRooms: 1,
        availableRooms: 1,
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.data.approvalStatus).toBe('PENDING');
    expect(createRes.body.data.distanceFromCampus).toBeGreaterThan(0);
    const listingId = createRes.body.data.id;

    const publicSearch = await request(app).get('/api/listings').query({ search: 'Approval workflow test listing' });
    const foundBeforeApproval = publicSearch.body.data.find((l: any) => l.id === listingId);
    expect(foundBeforeApproval).toBeUndefined();

    // Simulate an admin login using the seeded admin account
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: process.env.ADMIN_EMAIL ?? 'admin@example.com', password: process.env.ADMIN_PASSWORD ?? 'AdminDev123!' });
    expect(adminLogin.status).toBe(200);
    const adminToken = adminLogin.body.data.token;

    const approveRes = await request(app)
      .patch(`/api/admin/listings/${listingId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(approveRes.status).toBe(200);
    expect(approveRes.body.data.approvalStatus).toBe('APPROVED');

    const publicSearchAfter = await request(app).get('/api/listings').query({ search: 'Approval workflow test listing' });
    const foundAfterApproval = publicSearchAfter.body.data.find((l: any) => l.id === listingId);
    expect(foundAfterApproval).toBeDefined();
  });

  it('supports pagination metadata on search', async () => {
    const res = await request(app).get('/api/listings').query({ page: 1, limit: 2 });
    expect(res.status).toBe(200);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.limit).toBe(2);
    expect(res.body.data.length).toBeLessThanOrEqual(2);
  });
});
