import { prisma } from '../config/db';
import { ConflictError, NotFoundError } from '../utils/appError';

export async function addFavourite(studentId: string, listingId: string) {
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing || listing.approvalStatus !== 'APPROVED') {
    throw new NotFoundError('Listing not found');
  }

  const existing = await prisma.favourite.findUnique({
    where: { studentId_listingId: { studentId, listingId } },
  });
  if (existing) throw new ConflictError('Listing already in favourites');

  return prisma.favourite.create({ data: { studentId, listingId } });
}

export async function removeFavourite(studentId: string, listingId: string) {
  const existing = await prisma.favourite.findUnique({
    where: { studentId_listingId: { studentId, listingId } },
  });
  if (!existing) throw new NotFoundError('Favourite not found');
  await prisma.favourite.delete({ where: { id: existing.id } });
}

export async function listFavourites(studentId: string) {
  return prisma.favourite.findMany({
    where: { studentId },
    include: {
      listing: {
        include: { campus: true, photos: { orderBy: { order: 'asc' } } },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}
