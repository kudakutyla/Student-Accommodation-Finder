import { AccommodationType, ApprovalStatus, AvailabilityStatus, ReportReason } from '@/types';

export function formatCurrency(amount: string | number): string {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', maximumFractionDigits: 0 }).format(
    value
  );
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-ZA', { dateStyle: 'medium' }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-ZA', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date));
}

export function formatDistance(km?: number | null): string {
  if (km === undefined || km === null) return 'Distance unknown';
  return km < 1 ? `${Math.round(km * 1000)} m from campus` : `${km.toFixed(1)} km from campus`;
}

const ACCOMMODATION_TYPE_LABELS: Record<AccommodationType, string> = {
  STUDENT_RESIDENCE: 'Student Residence',
  ROOM: 'Room',
  SHARED_ROOM: 'Shared Room',
  APARTMENT: 'Apartment',
  BACHELOR: 'Bachelor Flat',
  STUDIO: 'Studio',
  HOUSE: 'House',
  SHARED_HOUSE: 'Shared House',
  TOWNHOUSE: 'Townhouse',
  OTHER: 'Other',
};

export function accommodationTypeLabel(type: AccommodationType): string {
  return ACCOMMODATION_TYPE_LABELS[type] ?? type;
}

const AVAILABILITY_LABELS: Record<AvailabilityStatus, string> = {
  AVAILABLE: 'Available',
  LIMITED: 'Limited availability',
  FULL: 'Full',
  UNAVAILABLE: 'Unavailable',
};

export function availabilityLabel(status: AvailabilityStatus): string {
  return AVAILABILITY_LABELS[status] ?? status;
}

const APPROVAL_LABELS: Record<ApprovalStatus, string> = {
  PENDING: 'Pending Approval',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

export function approvalLabel(status: ApprovalStatus): string {
  return APPROVAL_LABELS[status] ?? status;
}

const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  SUSPICIOUS_FRAUDULENT: 'Suspicious / Fraudulent',
  INCORRECT_INFORMATION: 'Incorrect Information',
  INAPPROPRIATE_CONTENT: 'Inappropriate Content',
  ALREADY_OCCUPIED: 'Already Occupied',
  DUPLICATE_LISTING: 'Duplicate Listing',
  OTHER: 'Other',
};

export function reportReasonLabel(reason: ReportReason): string {
  return REPORT_REASON_LABELS[reason] ?? reason;
}

export function initials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}
