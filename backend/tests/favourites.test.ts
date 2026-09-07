import request from 'supertest';
import { app, prisma, registerAndLogin, cleanupUserByEmail } from './helpers';

describe('Favourites', () => {
  const emails: string[] = [];

  afterAll(async () => {
    await Promise.all(emails.map((e) => cleanupUserByEmail(e)));
    await prisma.$disconnect();
  });

  it('allows a student to favourite and unfavourite a listing, and prevents duplicates', async () => {
    const student = await registerAndLogin({ role: 'STUDENT' });
    emails.push(student.email);

    const listing = await prisma.listing.findFirst({ where: { approvalStatus: 'APPROVED' } });
    expect(listing).toBeTruthy();

    const addRes = await request(app)
      .post(`/api/favourites/${listing!.id}`)
      .set('Authorization', `Bearer ${student.token}`);
    expect(addRes.status).toBe(201);

    const duplicateRes = await request(app)
      .post(`/api/favourites/${listing!.id}`)
      .set('Authorization', `Bearer ${student.token}`);
    expect(duplicateRes.status).toBe(409);

    const listRes = await request(app).get('/api/favourites').set('Authorization', `Bearer ${student.token}`);
    expect(listRes.status).toBe(200);
    expect(listRes.body.data.some((f: any) => f.listingId === listing!.id)).toBe(true);

    const removeRes = await request(app)
      .delete(`/api/favourites/${listing!.id}`)
      .set('Authorization', `Bearer ${student.token}`);
    expect(removeRes.status).toBe(200);

    const listAfterRemove = await request(app).get('/api/favourites').set('Authorization', `Bearer ${student.token}`);
    expect(listAfterRemove.body.data.some((f: any) => f.listingId === listing!.id)).toBe(false);
  });

  it('rejects a LANDLORD trying to favourite a listing', async () => {
    const landlord = await registerAndLogin({ role: 'LANDLORD' });
    emails.push(landlord.email);
    const listing = await prisma.listing.findFirst({ where: { approvalStatus: 'APPROVED' } });

    const res = await request(app)
      .post(`/api/favourites/${listing!.id}`)
      .set('Authorization', `Bearer ${landlord.token}`);
    expect(res.status).toBe(403);
  });
});
