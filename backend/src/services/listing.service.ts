import { Prisma } from '@prisma/client';
import { prisma } from '../config/db';
import { calculateDistanceKm } from '../utils/distance';
import { buildPagination } from '../utils/apiResponse';
import { ForbiddenError, NotFoundError, ValidationError } from '../utils/appError';
import {
  CreateListingInput,
  UpdateListingInput,
  SearchListingsInput,
} from '../validators/listing.validator';
import { createNotification } from './notification.service';
import { logAudit } from './audit.service';

const LISTING_INCLUDE = {
  campus: true,
  photos: { orderBy: { order: 'asc' as const } },
  owner: {
    select: { id: true, firstName: true, lastName: true, businessName: true, phoneNumber: true, email: true },
  },
} satisfies Prisma.ListingInclude;

async function attachRatings<T extends { id: string }>(listings: T[]) {
  if (listings.length === 0) return listings.map((l) => ({ ...l, averageRating: 0, reviewCount: 0 }));
  const ids = listings.map((l) => l.id);
  const grouped = await prisma.review.groupBy({
    by: ['listingId'],
    where: { listingId: { in: ids } },
    _avg: { rating: true },
    _count: { rating: true },
  });
  const map = new Map(grouped.map((g) => [g.listingId, { avg: g._avg.rating ?? 0, count: g._count.rating }]));
  return listings.map((l) => ({
    ...l,
    averageRating: Math.round((map.get(l.id)?.avg ?? 0) * 10) / 10,
    reviewCount: map.get(l.id)?.count ?? 0,
  }));
}

async function assertVerifiedLandlord(ownerId: string) {
  const owner = await prisma.user.findUnique({ where: { id: ownerId } });
  if (!owner || owner.role !== 'LANDLORD') {
    throw new ForbiddenError('Only landlords can manage listings');
  }
  if (owner.verificationStatus !== 'VERIFIED') {
    throw new ForbiddenError('Your landlord account must be verified before you can create listings');
  }
  return owner;
}

export async function createListing(ownerId: string, input: CreateListingInput) {
  await assertVerifiedLandlord(ownerId);

  const campus = await prisma.campus.findUnique({ where: { id: input.campusId } });
  if (!campus || !campus.isActive) {
    throw new ValidationError('Selected campus is invalid');
  }

  // Distance is always computed server-side - never trust a client-supplied value.
  const distanceFromCampus = calculateDistanceKm(
    input.latitude,
    input.longitude,
    campus.latitude,
    campus.longitude
  );

  const listing = await prisma.listing.create({
    data: {
      ownerId,
      campusId: input.campusId,
      title: input.title,
      description: input.description,
      accommodationType: input.accommodationType,
      pricePerMonth: input.pricePerMonth,
      address: input.address,
      latitude: input.latitude,
      longitude: input.longitude,
      distanceFromCampus,
      totalRooms: input.totalRooms,
      availableRooms: input.availableRooms,
      amenities: input.amenities,
      approvalStatus: 'PENDING',
      availabilityStatus: input.availableRooms > 0 ? 'AVAILABLE' : 'UNAVAILABLE',
      photos: {
        create: (input.photos ?? []).map((url, index) => ({ url, order: index })),
      },
    },
    include: LISTING_INCLUDE,
  });

  const admins = await prisma.user.findMany({ where: { role: 'ADMIN' }, select: { id: true } });
  await Promise.all(
    admins.map((admin) =>
      createNotification({
        userId: admin.id,
        type: 'LISTING_SUBMITTED',
        title: 'New listing pending approval',
        message: `"${listing.title}" was submitted and requires approval.`,
        relatedEntityType: 'Listing',
        relatedEntityId: listing.id,
      })
    )
  );
  await logAudit({ actorId: ownerId, action: 'LISTING_SUBMITTED', entityType: 'Listing', entityId: listing.id });

  return listing;
}

export async function updateListing(listingId: string, ownerId: string, input: UpdateListingInput) {
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) throw new NotFoundError('Listing not found');
  if (listing.ownerId !== ownerId) throw new ForbiddenError('You do not own this listing');

  let distanceFromCampus = listing.distanceFromCampus ?? undefined;
  const nextCampusId = input.campusId ?? listing.campusId;
  const nextLat = input.latitude ?? listing.latitude;
  const nextLng = input.longitude ?? listing.longitude;

  if (input.campusId || input.latitude !== undefined || input.longitude !== undefined) {
    const campus = await prisma.campus.findUnique({ where: { id: nextCampusId } });
    if (!campus || !campus.isActive) throw new ValidationError('Selected campus is invalid');
    distanceFromCampus = calculateDistanceKm(nextLat, nextLng, campus.latitude, campus.longitude);
  }

  const updated = await prisma.listing.update({
    where: { id: listingId },
    data: {
      campusId: input.campusId,
      title: input.title,
      description: input.description,
      accommodationType: input.accommodationType,
      pricePerMonth: input.pricePerMonth,
      address: input.address,
      latitude: input.latitude,
      longitude: input.longitude,
      distanceFromCampus,
      totalRooms: input.totalRooms,
      availableRooms: input.availableRooms,
      amenities: input.amenities,
      // Content changed - require admin to re-review before it is publicly visible again.
      approvalStatus: 'PENDING',
      rejectionReason: null,
      ...(input.photos
        ? {
            photos: {
              deleteMany: {},
              create: input.photos.map((url, index) => ({ url, order: index })),
            },
          }
        : {}),
    },
    include: LISTING_INCLUDE,
  });

  await logAudit({ actorId: ownerId, action: 'LISTING_UPDATED', entityType: 'Listing', entityId: listingId });
  return updated;
}

export async function updateAvailability(
  listingId: string,
  ownerId: string,
  input: { availabilityStatus?: string; availableRooms?: number }
) {
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) throw new NotFoundError('Listing not found');
  if (listing.ownerId !== ownerId) throw new ForbiddenError('You do not own this listing');

  if (input.availableRooms !== undefined && input.availableRooms > listing.totalRooms) {
    throw new ValidationError('Available rooms cannot exceed total rooms');
  }

  const updated = await prisma.listing.update({
    where: { id: listingId },
    data: {
      availableRooms: input.availableRooms,
      availabilityStatus: input.availabilityStatus as any,
    },
    include: LISTING_INCLUDE,
  });
  await logAudit({ actorId: ownerId, action: 'LISTING_AVAILABILITY_UPDATED', entityType: 'Listing', entityId: listingId });
  return updated;
}

export async function deleteListing(listingId: string, requesterId: string, isAdmin: boolean) {
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) throw new NotFoundError('Listing not found');
  if (!isAdmin && listing.ownerId !== requesterId) {
    throw new ForbiddenError('You do not own this listing');
  }
  await prisma.listing.delete({ where: { id: listingId } });
  await logAudit({ actorId: requesterId, action: 'LISTING_DELETED', entityType: 'Listing', entityId: listingId });
}

export async function getListingById(listingId: string, viewer?: { userId: string; role: string }) {
  const listing = await prisma.listing.findUnique({ where: { id: listingId }, include: LISTING_INCLUDE });
  if (!listing) throw new NotFoundError('Listing not found');

  const isOwner = viewer?.userId === listing.ownerId;
  const isAdmin = viewer?.role === 'ADMIN';
  if (listing.approvalStatus !== 'APPROVED' && !isOwner && !isAdmin) {
    throw new NotFoundError('Listing not found');
  }

  const [withRating] = await attachRatings([listing]);
  return withRating;
}

export async function listMyListings(ownerId: string) {
  const listings = await prisma.listing.findMany({
    where: { ownerId },
    include: LISTING_INCLUDE,
    orderBy: { createdAt: 'desc' },
  });
  return attachRatings(listings);
}

export async function searchListings(filters: SearchListingsInput) {
  const where: Prisma.ListingWhereInput = {
    approvalStatus: 'APPROVED',
    ...(filters.campusId ? { campusId: filters.campusId } : {}),
    ...(filters.accommodationType ? { accommodationType: filters.accommodationType } : {}),
    ...(filters.availabilityStatus ? { availabilityStatus: filters.availabilityStatus } : {}),
    ...(filters.minAvailableRooms !== undefined
      ? { availableRooms: { gte: filters.minAvailableRooms } }
      : {}),
    ...(filters.maxDistance !== undefined ? { distanceFromCampus: { lte: filters.maxDistance } } : {}),
    ...(filters.amenities && filters.amenities.length > 0
      ? { amenities: { hasEvery: filters.amenities } }
      : {}),
    ...(filters.minPrice !== undefined || filters.maxPrice !== undefined
      ? {
          pricePerMonth: {
            ...(filters.minPrice !== undefined ? { gte: filters.minPrice } : {}),
            ...(filters.maxPrice !== undefined ? { lte: filters.maxPrice } : {}),
          },
        }
      : {}),
    ...(filters.search
      ? {
          OR: [
            { title: { contains: filters.search, mode: 'insensitive' } },
            { description: { contains: filters.search, mode: 'insensitive' } },
            { address: { contains: filters.search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const needsRatingComputation = filters.sort === 'rating' || filters.minRating !== undefined;

  if (!needsRatingComputation) {
    const orderBy: Prisma.ListingOrderByWithRelationInput =
      filters.sort === 'price_asc'
        ? { pricePerMonth: 'asc' }
        : filters.sort === 'price_desc'
        ? { pricePerMonth: 'desc' }
        : filters.sort === 'nearest'
        ? { distanceFromCampus: 'asc' }
        : { createdAt: 'desc' };

    const [total, listings] = await Promise.all([
      prisma.listing.count({ where }),
      prisma.listing.findMany({
        where,
        include: LISTING_INCLUDE,
        orderBy,
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
    ]);
    const withRatings = await attachRatings(listings);
    return { listings: withRatings, pagination: buildPagination(filters.page, filters.limit, total) };
  }

  // Rating filter/sort requires an aggregate computed across the full matching set first.
  const allMatching = await prisma.listing.findMany({
    where,
    include: LISTING_INCLUDE,
    orderBy: { createdAt: 'desc' },
  });
  let withRatings = await attachRatings(allMatching);

  if (filters.minRating !== undefined) {
    withRatings = withRatings.filter((l) => l.averageRating >= filters.minRating!);
  }
  if (filters.sort === 'rating') {
    withRatings = withRatings.sort((a, b) => b.averageRating - a.averageRating);
  }

  const total = withRatings.length;
  const start = (filters.page - 1) * filters.limit;
  const page = withRatings.slice(start, start + filters.limit);

  return { listings: page, pagination: buildPagination(filters.page, filters.limit, total) };
}

// ----- Admin -----

export async function adminListListings(approvalStatus?: string) {
  const listings = await prisma.listing.findMany({
    where: approvalStatus ? { approvalStatus: approvalStatus as any } : undefined,
    include: LISTING_INCLUDE,
    orderBy: { createdAt: 'desc' },
  });
  return attachRatings(listings);
}

export async function approveListing(listingId: string, adminId: string) {
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) throw new NotFoundError('Listing not found');

  const updated = await prisma.listing.update({
    where: { id: listingId },
    data: { approvalStatus: 'APPROVED', rejectionReason: null },
    include: LISTING_INCLUDE,
  });

  await createNotification({
    userId: listing.ownerId,
    type: 'LISTING_APPROVED',
    title: 'Listing approved',
    message: `Your listing "${listing.title}" has been approved and is now publicly visible.`,
    relatedEntityType: 'Listing',
    relatedEntityId: listing.id,
  });
  await logAudit({ actorId: adminId, action: 'LISTING_APPROVED', entityType: 'Listing', entityId: listingId });

  return updated;
}

export async function rejectListing(listingId: string, adminId: string, rejectionReason: string) {
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) throw new NotFoundError('Listing not found');

  const updated = await prisma.listing.update({
    where: { id: listingId },
    data: { approvalStatus: 'REJECTED', rejectionReason },
    include: LISTING_INCLUDE,
  });

  await createNotification({
    userId: listing.ownerId,
    type: 'LISTING_REJECTED',
    title: 'Listing rejected',
    message: `Your listing "${listing.title}" was rejected. Reason: ${rejectionReason}`,
    relatedEntityType: 'Listing',
    relatedEntityId: listing.id,
  });
  await logAudit({ actorId: adminId, action: 'LISTING_REJECTED', entityType: 'Listing', entityId: listingId, metadata: { rejectionReason } });

  return updated;
}
