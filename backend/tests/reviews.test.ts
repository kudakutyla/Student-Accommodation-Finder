import request from 'supertest';
import { app, prisma, registerAndLogin, cleanupUserByEmail } from './helpers';

describe('Reviews', () => {
  const emails: string[] = [];

  afterAll(async () => {
    await Promise.all(emails.map((e) => cleanupUserByEmail(e)));
    await prisma.$disconnect();
  });

  it('creates a review, prevents duplicate reviews from the same student, and computes the average rating', async () => {
    const student = await registerAndLogin({ role: 'STUDENT' });
    emails.push(student.email);

    const listing = await prisma.listing.findFirst({ where: { approvalStatus: 'APPROVED' } });
    expect(listing).toBeTruthy();

    const createRes = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${student.token}`)
      .send({ listingId: listing!.id, rating: 5, comment: 'Excellent place to stay.' });
    expect(createRes.status).toBe(201);

    const duplicateRes = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${student.token}`)
      .send({ listingId: listing!.id, rating: 3, comment: 'Trying to review again.' });
    expect(duplicateRes.status).toBe(409);

    const listingDetail = await request(app).get(`/api/listings/${listing!.id}`);
    expect(listingDetail.body.data.averageRating).toBeGreaterThan(0);
    expect(listingDetail.body.data.reviewCount).toBeGreaterThan(0);

    await prisma.review.deleteMany({ where: { studentId: student.user.id } });
  });

  it('rejects an out-of-range rating', async () => {
    const student = await registerAndLogin({ role: 'STUDENT' });
    emails.push(student.email);
    const listing = await prisma.listing.findFirst({ where: { approvalStatus: 'APPROVED' } });

    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${student.token}`)
      .send({ listingId: listing!.id, rating: 10 });
    expect(res.status).toBe(422);
  });

  it('rejects a LANDLORD trying to submit a review', async () => {
    const landlord = await registerAndLogin({ role: 'LANDLORD' });
    emails.push(landlord.email);
    const listing = await prisma.listing.findFirst({ where: { approvalStatus: 'APPROVED' } });

    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${landlord.token}`)
      .send({ listingId: listing!.id, rating: 4 });
    expect(res.status).toBe(403);
  });
});
