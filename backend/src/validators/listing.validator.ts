import { z } from 'zod';

const accommodationTypeEnum = z.enum([
  'STUDENT_RESIDENCE',
  'ROOM',
  'SHARED_ROOM',
  'APARTMENT',
  'BACHELOR',
  'STUDIO',
  'HOUSE',
  'SHARED_HOUSE',
  'TOWNHOUSE',
  'OTHER',
]);

const availabilityStatusEnum = z.enum(['AVAILABLE', 'LIMITED', 'FULL', 'UNAVAILABLE']);

export const createListingSchema = z
  .object({
    campusId: z.string().uuid(),
    title: z.string().min(3).max(150),
    description: z.string().min(10).max(5000),
    accommodationType: accommodationTypeEnum,
    pricePerMonth: z.number().positive('Price must be a positive amount'),
    address: z.string().min(3).max(300),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    totalRooms: z.number().int().nonnegative(),
    availableRooms: z.number().int().nonnegative(),
    amenities: z.array(z.string().max(100)).max(30).default([]),
    photos: z
      .array(z.string().url('Each photo must be a valid URL'))
      .max(15, 'A maximum of 15 photos is allowed')
      .optional()
      .default([]),
  })
  .refine((data) => data.availableRooms <= data.totalRooms, {
    message: 'Available rooms cannot exceed total rooms',
    path: ['availableRooms'],
  });

export const updateListingSchema = z
  .object({
    campusId: z.string().uuid().optional(),
    title: z.string().min(3).max(150).optional(),
    description: z.string().min(10).max(5000).optional(),
    accommodationType: accommodationTypeEnum.optional(),
    pricePerMonth: z.number().positive().optional(),
    address: z.string().min(3).max(300).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    totalRooms: z.number().int().nonnegative().optional(),
    availableRooms: z.number().int().nonnegative().optional(),
    amenities: z.array(z.string().max(100)).max(30).optional(),
    photos: z.array(z.string().url()).max(15).optional(),
  })
  .refine(
    (data) =>
      data.totalRooms === undefined ||
      data.availableRooms === undefined ||
      data.availableRooms <= data.totalRooms,
    { message: 'Available rooms cannot exceed total rooms', path: ['availableRooms'] }
  );

export const updateAvailabilitySchema = z.object({
  availabilityStatus: availabilityStatusEnum.optional(),
  availableRooms: z.number().int().nonnegative().optional(),
});

export const searchListingsSchema = z.object({
  campusId: z.string().uuid().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  maxDistance: z.coerce.number().positive().optional(),
  accommodationType: accommodationTypeEnum.optional(),
  availabilityStatus: availabilityStatusEnum.optional(),
  minAvailableRooms: z.coerce.number().int().nonnegative().optional(),
  amenities: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((v) => (v === undefined ? undefined : Array.isArray(v) ? v : [v])),
  minRating: z.coerce.number().min(0).max(5).optional(),
  search: z.string().max(200).optional(),
  sort: z
    .enum(['price_asc', 'price_desc', 'nearest', 'rating', 'newest'])
    .optional()
    .default('newest'),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

export const rejectListingSchema = z.object({
  rejectionReason: z.string().min(3).max(500),
});

export type CreateListingInput = z.infer<typeof createListingSchema>;
export type UpdateListingInput = z.infer<typeof updateListingSchema>;
export type SearchListingsInput = z.infer<typeof searchListingsSchema>;
