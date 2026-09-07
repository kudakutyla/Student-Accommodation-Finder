import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { calculateDistanceKm } from '../src/utils/distance';

const prisma = new PrismaClient();

const DEV_PASSWORD = 'Passw0rd!'; // dummy development-only password for all seeded accounts

async function hash(password: string) {
  return bcrypt.hash(password, 12);
}

async function main() {
  console.log('Seeding database...');

  // ---- Campuses ----
  const campusData = [
    { name: 'Main Campus', institution: 'University of Cape Town', address: 'Rondebosch, Cape Town', latitude: -33.9577, longitude: 18.4612 },
    { name: 'Hatfield Campus', institution: 'University of Pretoria', address: 'Hatfield, Pretoria', latitude: -25.7545, longitude: 28.2314 },
    { name: 'Pretoria Campus', institution: 'Tshwane University of Technology', address: 'Staatsartillerie Rd, Pretoria West', latitude: -25.7296, longitude: 28.1631 },
    { name: 'Westville Campus', institution: 'University of KwaZulu-Natal', address: 'Westville, Durban', latitude: -29.8258, longitude: 30.9430 },
    { name: 'Auckland Park Campus', institution: 'University of Johannesburg', address: 'Auckland Park, Johannesburg', latitude: -26.1825, longitude: 27.9998 },
  ];

  const campuses = [];
  for (const c of campusData) {
    const campus = await prisma.campus.upsert({
      where: { name_institution: { name: c.name, institution: c.institution } },
      update: {},
      create: c,
    });
    campuses.push(campus);
  }

  // ---- Admin ----
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@example.com';
  const adminPasswordHash = await hash(process.env.ADMIN_PASSWORD ?? DEV_PASSWORD);
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      firstName: 'Platform',
      lastName: 'Admin',
    },
  });

  // ---- Students ----
  const studentSeed = [
    { email: 'student1@example.com', firstName: 'Thabo', lastName: 'Nkosi', campus: campuses[0] },
    { email: 'student2@example.com', firstName: 'Lerato', lastName: 'Molefe', campus: campuses[1] },
    { email: 'student3@example.com', firstName: 'Sipho', lastName: 'Dlamini', campus: campuses[2] },
  ];
  const passwordHash = await hash(DEV_PASSWORD);
  const students = [];
  for (const s of studentSeed) {
    const student = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        email: s.email,
        passwordHash,
        role: 'STUDENT',
        firstName: s.firstName,
        lastName: s.lastName,
        phoneNumber: '0710000000',
        campusId: s.campus.id,
      },
    });
    students.push(student);
  }

  // ---- Landlords ----
  const landlordSeed = [
    { email: 'landlord1@example.com', firstName: 'Anna', lastName: 'Botha', businessName: 'Botha Student Lettings', status: 'VERIFIED' as const },
    { email: 'landlord2@example.com', firstName: 'David', lastName: 'Naidoo', businessName: 'Naidoo Properties', status: 'VERIFIED' as const },
    { email: 'landlord3@example.com', firstName: 'Grace', lastName: 'Mahlangu', businessName: 'Grace Residences', status: 'PENDING' as const },
  ];
  const landlords = [];
  for (const l of landlordSeed) {
    const landlord = await prisma.user.upsert({
      where: { email: l.email },
      update: {},
      create: {
        email: l.email,
        passwordHash,
        role: 'LANDLORD',
        firstName: l.firstName,
        lastName: l.lastName,
        phoneNumber: '0820000000',
        businessName: l.businessName,
        verificationStatus: l.status,
      },
    });
    landlords.push(landlord);
  }

  // ---- Listings (only from verified landlords) ----
  const listingSeeds = [
    {
      owner: landlords[0],
      campus: campuses[0],
      title: 'Modern Studio Near UCT',
      description: 'Bright, fully-furnished studio apartment a short walk from campus. Includes fibre wifi and secure parking.',
      accommodationType: 'STUDIO' as const,
      pricePerMonth: 6500,
      address: '12 Main Rd, Rondebosch',
      latitude: -33.9601,
      longitude: 18.4655,
      totalRooms: 1,
      availableRooms: 1,
      amenities: ['WiFi', 'Parking', 'Security', 'Furnished'],
      photos: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af'],
    },
    {
      owner: landlords[0],
      campus: campuses[0],
      title: 'Shared House - 4 Bedrooms',
      description: 'Spacious shared house with 4 bedrooms, ideal for a group of students. Close to shops and public transport.',
      accommodationType: 'SHARED_HOUSE' as const,
      pricePerMonth: 4200,
      address: '45 Station Rd, Rondebosch',
      latitude: -33.9550,
      longitude: 18.4700,
      totalRooms: 4,
      availableRooms: 2,
      amenities: ['WiFi', 'Backyard', 'Washing Machine'],
      photos: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2'],
    },
    {
      owner: landlords[1],
      campus: campuses[1],
      title: 'Hatfield Student Residence Room',
      description: 'Single room in a managed student residence with 24/7 security and study areas.',
      accommodationType: 'STUDENT_RESIDENCE' as const,
      pricePerMonth: 5200,
      address: '8 Burnett St, Hatfield',
      latitude: -25.7480,
      longitude: 28.2350,
      totalRooms: 1,
      availableRooms: 1,
      amenities: ['WiFi', 'Security', 'Study Room', 'Laundry'],
      photos: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5'],
    },
    {
      owner: landlords[1],
      campus: campuses[1],
      title: 'Bachelor Flat Close to Campus',
      description: 'Self-contained bachelor flat with private entrance, kitchenette and bathroom.',
      accommodationType: 'BACHELOR' as const,
      pricePerMonth: 4800,
      address: '22 Prospect St, Hatfield',
      latitude: -25.7500,
      longitude: 28.2280,
      totalRooms: 1,
      availableRooms: 0,
      amenities: ['WiFi', 'Kitchenette'],
      photos: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb'],
    },
  ];

  for (const l of listingSeeds) {
    const distanceFromCampus = calculateDistanceKm(l.latitude, l.longitude, l.campus.latitude, l.campus.longitude);
    const existing = await prisma.listing.findFirst({ where: { title: l.title, ownerId: l.owner.id } });
    if (existing) continue;

    await prisma.listing.create({
      data: {
        ownerId: l.owner.id,
        campusId: l.campus.id,
        title: l.title,
        description: l.description,
        accommodationType: l.accommodationType,
        pricePerMonth: l.pricePerMonth,
        address: l.address,
        latitude: l.latitude,
        longitude: l.longitude,
        distanceFromCampus,
        totalRooms: l.totalRooms,
        availableRooms: l.availableRooms,
        amenities: l.amenities,
        approvalStatus: 'APPROVED',
        availabilityStatus: l.availableRooms === 0 ? 'FULL' : l.availableRooms < l.totalRooms ? 'LIMITED' : 'AVAILABLE',
        photos: { create: l.photos.map((url, index) => ({ url, order: index })) },
      },
    });
  }

  const allListings = await prisma.listing.findMany({ where: { approvalStatus: 'APPROVED' } });

  // One pending listing for admin approval demo
  const pendingExisting = await prisma.listing.findFirst({ where: { title: 'New Apartment Awaiting Approval' } });
  if (!pendingExisting) {
    const campus = campuses[0];
    const lat = -33.965;
    const lng = 18.47;
    await prisma.listing.create({
      data: {
        ownerId: landlords[0].id,
        campusId: campus.id,
        title: 'New Apartment Awaiting Approval',
        description: 'Recently listed apartment pending admin review.',
        accommodationType: 'APARTMENT',
        pricePerMonth: 5800,
        address: '3 New St, Rondebosch',
        latitude: lat,
        longitude: lng,
        distanceFromCampus: calculateDistanceKm(lat, lng, campus.latitude, campus.longitude),
        totalRooms: 2,
        availableRooms: 2,
        amenities: ['WiFi'],
        approvalStatus: 'PENDING',
      },
    });
  }

  // ---- Favourites ----
  if (allListings.length > 0) {
    await prisma.favourite.upsert({
      where: { studentId_listingId: { studentId: students[0].id, listingId: allListings[0].id } },
      update: {},
      create: { studentId: students[0].id, listingId: allListings[0].id },
    });
  }

  // ---- Enquiry + Conversation + Message ----
  if (allListings.length > 0) {
    const listing = allListings[0];
    const conversation = await prisma.conversation.upsert({
      where: {
        listingId_studentId_landlordId: {
          listingId: listing.id,
          studentId: students[0].id,
          landlordId: listing.ownerId,
        },
      },
      update: {},
      create: { listingId: listing.id, studentId: students[0].id, landlordId: listing.ownerId },
    });

    const existingMessages = await prisma.message.count({ where: { conversationId: conversation.id } });
    if (existingMessages === 0) {
      await prisma.message.create({
        data: { conversationId: conversation.id, senderId: students[0].id, content: 'Hi, is this room still available and are utilities included?' },
      });
      await prisma.message.create({
        data: { conversationId: conversation.id, senderId: listing.ownerId, content: 'Yes, the room is available. Water is included and electricity is prepaid.', isRead: false },
      });
    }

    await prisma.enquiry.upsert({
      where: { conversationId: conversation.id },
      update: {},
      create: {
        studentId: students[0].id,
        landlordId: listing.ownerId,
        listingId: listing.id,
        conversationId: conversation.id,
        message: 'Hi, is this room still available and are utilities included?',
        status: 'RESPONDED',
      },
    });
  }

  // ---- Reviews ----
  if (allListings.length > 1) {
    await prisma.review.upsert({
      where: { studentId_listingId: { studentId: students[1].id, listingId: allListings[1].id } },
      update: {},
      create: { studentId: students[1].id, listingId: allListings[1].id, rating: 4, comment: 'Great location, responsive landlord.' },
    });
  }

  // ---- Reports ----
  if (allListings.length > 2) {
    const existingReport = await prisma.report.findFirst({ where: { listingId: allListings[2].id, reporterId: students[2].id } });
    if (!existingReport) {
      await prisma.report.create({
        data: {
          reporterId: students[2].id,
          listingId: allListings[2].id,
          reason: 'INCORRECT_INFORMATION',
          description: 'The listed price does not match what was advertised on the door.',
        },
      });
    }
  }

  // ---- Notifications ----
  await prisma.notification.upsert({
    where: { id: 'seed-admin-notification' },
    update: {},
    create: {
      id: 'seed-admin-notification',
      userId: admin.id,
      type: 'SYSTEM',
      title: 'Welcome to the Admin Dashboard',
      message: 'Review pending landlord verifications and listing approvals to get started.',
    },
  }).catch(() => undefined); // ignore if a fixed-id record already exists under a different shape

  console.log('Seed complete.');
  console.log('--- Development login credentials (dummy, not for production) ---');
  console.log(`Admin:    ${adminEmail} / ${process.env.ADMIN_PASSWORD ?? DEV_PASSWORD}`);
  console.log(`Students: student1@example.com, student2@example.com, student3@example.com / ${DEV_PASSWORD}`);
  console.log(`Landlords: landlord1@example.com, landlord2@example.com, landlord3@example.com / ${DEV_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
