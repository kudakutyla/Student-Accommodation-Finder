// Shared types mirroring the backend Prisma models/enums.

export type Role = 'STUDENT' | 'LANDLORD' | 'ADMIN';
export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';
export type AccommodationType =
  | 'STUDENT_RESIDENCE'
  | 'ROOM'
  | 'SHARED_ROOM'
  | 'APARTMENT'
  | 'BACHELOR'
  | 'STUDIO'
  | 'HOUSE'
  | 'SHARED_HOUSE'
  | 'TOWNHOUSE'
  | 'OTHER';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type AvailabilityStatus = 'AVAILABLE' | 'LIMITED' | 'FULL' | 'UNAVAILABLE';
export type EnquiryStatus = 'OPEN' | 'RESPONDED' | 'CLOSED';
export type ConversationStatus = 'OPEN' | 'CLOSED';
export type ReportReason =
  | 'SUSPICIOUS_FRAUDULENT'
  | 'INCORRECT_INFORMATION'
  | 'INAPPROPRIATE_CONTENT'
  | 'ALREADY_OCCUPIED'
  | 'DUPLICATE_LISTING'
  | 'OTHER';
export type ReportStatus = 'PENDING' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';
export type NotificationType =
  | 'ENQUIRY_RECEIVED'
  | 'ENQUIRY_RESPONDED'
  | 'NEW_MESSAGE'
  | 'LISTING_APPROVED'
  | 'LISTING_REJECTED'
  | 'LISTING_SUBMITTED'
  | 'NEW_REVIEW'
  | 'REPORT_SUBMITTED'
  | 'REPORT_RESOLVED'
  | 'LANDLORD_VERIFIED'
  | 'LANDLORD_REJECTED'
  | 'LANDLORD_REGISTERED'
  | 'SYSTEM';

export interface User {
  id: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
  profileImageUrl?: string | null;
  campusId?: string | null;
  businessName?: string | null;
  verificationStatus?: VerificationStatus | null;
  isSuspended: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Campus {
  id: string;
  name: string;
  institution: string;
  address: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ListingPhoto {
  id: string;
  listingId: string;
  url: string;
  order: number;
}

export interface ListingOwner {
  id: string;
  firstName: string;
  lastName: string;
  businessName?: string | null;
  phoneNumber?: string | null;
  email: string;
}

export interface Listing {
  id: string;
  ownerId: string;
  campusId: string;
  campus: Campus;
  owner: ListingOwner;
  title: string;
  description: string;
  accommodationType: AccommodationType;
  pricePerMonth: string | number;
  address: string;
  latitude: number;
  longitude: number;
  distanceFromCampus?: number | null;
  totalRooms: number;
  availableRooms: number;
  amenities: string[];
  availabilityStatus: AvailabilityStatus;
  approvalStatus: ApprovalStatus;
  rejectionReason?: string | null;
  photos: ListingPhoto[];
  averageRating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Favourite {
  id: string;
  studentId: string;
  listingId: string;
  listing: Listing;
  createdAt: string;
}

export interface Enquiry {
  id: string;
  studentId: string;
  landlordId: string;
  listingId: string;
  conversationId?: string | null;
  message: string;
  status: EnquiryStatus;
  createdAt: string;
  listing?: { id: string; title: string };
  student?: { id: string; firstName: string; lastName: string };
  landlord?: { id: string; firstName: string; lastName: string; businessName?: string | null };
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  listingId: string;
  studentId: string;
  landlordId: string;
  status: ConversationStatus;
  createdAt: string;
  updatedAt: string;
  listing?: { id: string; title: string };
  student?: { id: string; firstName: string; lastName: string };
  landlord?: { id: string; firstName: string; lastName: string; businessName?: string | null };
  messages?: Message[];
}

export interface Review {
  id: string;
  studentId: string;
  listingId: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  updatedAt: string;
  student?: { id: string; firstName: string; lastName: string };
  listing?: { id: string; title: string };
}

export interface Report {
  id: string;
  reporterId: string;
  listingId: string;
  reason: ReportReason;
  description?: string | null;
  status: ReportStatus;
  createdAt: string;
  resolvedAt?: string | null;
  resolvedById?: string | null;
  listing?: { id: string; title: string };
  reporter?: { id: string; firstName: string; lastName: string };
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  relatedEntityType?: string | null;
  relatedEntityId?: string | null;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId?: string | null;
  actor?: { id: string; firstName: string; lastName: string; role: Role } | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: unknown;
  createdAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiSuccess<T> {
  success: true;
  message?: string;
  data: T;
  pagination?: PaginationMeta;
}

export interface ApiError {
  success: false;
  message: string;
  details?: unknown;
}
