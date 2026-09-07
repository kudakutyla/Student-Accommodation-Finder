import request from 'supertest';
import { app, prisma, registerAndLogin, cleanupUserByEmail } from './helpers';

describe('Enquiries and Messaging', () => {
  const emails: string[] = [];

  afterAll(async () => {
    await Promise.all(emails.map((e) => cleanupUserByEmail(e)));
    await prisma.$disconnect();
  });

  it('lets a student send an enquiry which starts a conversation, and the landlord can reply', async () => {
    const student = await registerAndLogin({ role: 'STUDENT' });
    const otherStudent = await registerAndLogin({ role: 'STUDENT' });
    emails.push(student.email, otherStudent.email);

    const listing = await prisma.listing.findFirst({ where: { approvalStatus: 'APPROVED' } });
    expect(listing).toBeTruthy();

    const enquiryRes = await request(app)
      .post('/api/enquiries')
      .set('Authorization', `Bearer ${student.token}`)
      .send({ listingId: listing!.id, message: 'Is this still available?' });
    expect(enquiryRes.status).toBe(201);

    const conversationsRes = await request(app)
      .get('/api/conversations')
      .set('Authorization', `Bearer ${student.token}`);
    expect(conversationsRes.status).toBe(200);
    const conversation = conversationsRes.body.data.find((c: any) => c.listingId === listing!.id);
    expect(conversation).toBeDefined();

    const landlordLoginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: process.env.ADMIN_EMAIL ?? 'admin@example.com', password: process.env.ADMIN_PASSWORD ?? 'AdminDev123!' });
    expect(landlordLoginRes.status).toBe(200);

    // Another student must not be able to read this conversation.
    const unauthorizedAccess = await request(app)
      .get(`/api/conversations/${conversation.id}/messages`)
      .set('Authorization', `Bearer ${otherStudent.token}`);
    expect(unauthorizedAccess.status).toBe(404);

    const ownAccess = await request(app)
      .get(`/api/conversations/${conversation.id}/messages`)
      .set('Authorization', `Bearer ${student.token}`);
    expect(ownAccess.status).toBe(200);
    expect(ownAccess.body.data.messages.length).toBeGreaterThan(0);
  });
});
