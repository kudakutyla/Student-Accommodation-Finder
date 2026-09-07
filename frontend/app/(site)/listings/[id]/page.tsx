'use client';

import { useEffect, useState, use } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import {
  MapPin,
  BedDouble,
  Heart,
  MessageSquare,
  Flag,
  Loader2,
  Building2,
  Phone,
  Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LinkButton } from '@/components/link-button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StarRating } from '@/components/star-rating';
import { StatusBadge } from '@/components/status-badge';
import { LoadingState } from '@/components/loading-state';
import { EmptyState } from '@/components/empty-state';
import { useAuth } from '@/lib/auth-context';
import { formatCurrency, formatDate, formatDistance, accommodationTypeLabel, availabilityLabel } from '@/lib/format';
import { getListingRequest } from '@/services/listing.service';
import { addFavouriteRequest, listFavouritesRequest, removeFavouriteRequest } from '@/services/favourite.service';
import { createEnquiryRequest } from '@/services/enquiry.service';
import { createReviewRequest, listListingReviewsRequest } from '@/services/review.service';
import { createReportRequest } from '@/services/report.service';
import { Listing, Review, ReportReason } from '@/types';
import { ApiClientError } from '@/lib/api-client';
import { useRouter } from 'next/navigation';

const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: 'SUSPICIOUS_FRAUDULENT', label: 'Suspicious / Fraudulent' },
  { value: 'INCORRECT_INFORMATION', label: 'Incorrect Information' },
  { value: 'INAPPROPRIATE_CONTENT', label: 'Inappropriate Content' },
  { value: 'ALREADY_OCCUPIED', label: 'Already Occupied' },
  { value: 'DUPLICATE_LISTING', label: 'Duplicate Listing' },
  { value: 'OTHER', label: 'Other' },
];

export default function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const router = useRouter();

  const [listing, setListing] = useState<Listing | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavourite, setIsFavourite] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);

  const [enquiryMessage, setEnquiryMessage] = useState('');
  const [isSendingEnquiry, setIsSendingEnquiry] = useState(false);
  const [enquiryOpen, setEnquiryOpen] = useState(false);

  const [reportReason, setReportReason] = useState<ReportReason>('SUSPICIOUS_FRAUDULENT');
  const [reportDescription, setReportDescription] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const [reviewRating, setReviewRating] = useState('5');
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting loading flag before fetching the listing by id
    setIsLoading(true);
    Promise.all([getListingRequest(id), listListingReviewsRequest(id)])
      .then(([listingRes, reviewsRes]) => {
        setListing(listingRes.data);
        setReviews(reviewsRes.data);
      })
      .catch(() => toast.error('Unable to load this listing.'))
      .finally(() => setIsLoading(false));
  }, [id]);

  useEffect(() => {
    if (user?.role === 'STUDENT') {
      listFavouritesRequest()
        .then((res) => setIsFavourite(res.data.some((f) => f.listingId === id)))
        .catch(() => undefined);
    }
  }, [user, id]);

  async function handleToggleFavourite() {
    if (!user) return router.push('/login');
    try {
      if (isFavourite) {
        await removeFavouriteRequest(id);
        setIsFavourite(false);
        toast.success('Favourite removed');
      } else {
        await addFavouriteRequest(id);
        setIsFavourite(true);
        toast.success('Favourite saved');
      }
    } catch {
      toast.error('Unable to update favourites.');
    }
  }

  async function handleSendEnquiry() {
    if (!enquiryMessage.trim()) return;
    setIsSendingEnquiry(true);
    try {
      await createEnquiryRequest({ listingId: id, message: enquiryMessage });
      toast.success('Enquiry sent to the landlord');
      setEnquiryMessage('');
      setEnquiryOpen(false);
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : 'Unable to send enquiry.');
    } finally {
      setIsSendingEnquiry(false);
    }
  }

  async function handleSubmitReport() {
    setIsSubmittingReport(true);
    try {
      await createReportRequest({ listingId: id, reason: reportReason, description: reportDescription || undefined });
      toast.success('Report submitted. Our team will review it.');
      setReportDescription('');
      setReportOpen(false);
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : 'Unable to submit report.');
    } finally {
      setIsSubmittingReport(false);
    }
  }

  async function handleSubmitReview() {
    setIsSubmittingReview(true);
    try {
      await createReviewRequest({ listingId: id, rating: Number(reviewRating), comment: reviewComment || undefined });
      toast.success('Review submitted successfully');
      setReviewComment('');
      setReviewOpen(false);
      const [listingRes, reviewsRes] = await Promise.all([getListingRequest(id), listListingReviewsRequest(id)]);
      setListing(listingRes.data);
      setReviews(reviewsRes.data);
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : 'Unable to submit review.');
    } finally {
      setIsSubmittingReview(false);
    }
  }

  if (isLoading) return <LoadingState label="Loading listing..." />;
  if (!listing) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState title="Listing not found" description="This listing may have been removed or is no longer available." />
      </div>
    );
  }

  const photos = listing.photos?.length ? listing.photos : [];
  const isOwner = user?.id === listing.ownerId;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <div className="relative h-64 w-full overflow-hidden rounded-xl bg-muted sm:h-96">
          {photos.length > 0 ? (
            <Image src={photos[activePhoto].url} alt={listing.title} fill unoptimized className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">No photos available</div>
          )}
        </div>
        {photos.length > 1 && (
          <div className="mt-2 flex gap-2 overflow-x-auto">
            {photos.map((photo, index) => (
              <button
                key={photo.id}
                onClick={() => setActivePhoto(index)}
                className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-md border-2 ${
                  index === activePhoto ? 'border-primary' : 'border-transparent'
                }`}
              >
                <Image src={photo.url} alt="" fill unoptimized className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{accommodationTypeLabel(listing.accommodationType)}</Badge>
            <StatusBadge status={listing.availabilityStatus} />
            {(isOwner || user?.role === 'ADMIN') && <StatusBadge status={listing.approvalStatus} />}
          </div>
          <h1 className="text-3xl font-bold text-foreground">{listing.title}</h1>
          <p className="mt-2 flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-4 w-4" /> {listing.address} &middot; {listing.campus?.name} &middot;{' '}
            {formatDistance(listing.distanceFromCampus)}
          </p>
          <div className="mt-3">
            <StarRating rating={listing.averageRating} reviewCount={listing.reviewCount} size={18} />
          </div>

          <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-foreground">{listing.description}</p>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs text-muted-foreground">Total rooms</p>
              <p className="text-lg font-semibold">{listing.totalRooms}</p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs text-muted-foreground">Available rooms</p>
              <p className="text-lg font-semibold">{listing.availableRooms}</p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs text-muted-foreground">Availability</p>
              <p className="text-lg font-semibold">{availabilityLabel(listing.availabilityStatus)}</p>
            </div>
          </div>

          {listing.amenities.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-3 font-semibold text-foreground">Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {listing.amenities.map((amenity) => (
                  <Badge key={amenity} variant="outline">{amenity}</Badge>
                ))}
              </div>
            </div>
          )}

          {listing.approvalStatus === 'REJECTED' && listing.rejectionReason && (isOwner || user?.role === 'ADMIN') && (
            <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              <strong>Rejection reason:</strong> {listing.rejectionReason}
            </div>
          )}

          <div className="mt-10">
            <h2 className="mb-4 font-semibold text-foreground">Reviews ({reviews.length})</h2>
            {reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">No reviews yet. Be the first to review this listing.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-foreground">
                          {review.student?.firstName} {review.student?.lastName?.charAt(0)}.
                        </p>
                        <span className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</span>
                      </div>
                      <StarRating rating={review.rating} className="mt-1" />
                      {review.comment && <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {user?.role === 'STUDENT' && (
              <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
                <DialogTrigger render={<Button variant="outline" className="mt-4">Write a review</Button>} />
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Rate this accommodation</DialogTitle>
                    <DialogDescription>Share your experience to help other students.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Rating</Label>
                      <Select value={reviewRating} onValueChange={(v) => setReviewRating(v ?? '5')}>
                        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {[5, 4, 3, 2, 1].map((r) => (
                            <SelectItem key={r} value={String(r)}>{r} star{r > 1 ? 's' : ''}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Review (optional)</Label>
                      <Textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} rows={4} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleSubmitReview} disabled={isSubmittingReview}>
                      {isSubmittingReview && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Submit review
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-4 pt-4">
              <p className="text-3xl font-bold text-primary">
                {formatCurrency(listing.pricePerMonth)}
                <span className="text-sm font-normal text-muted-foreground"> /month</span>
              </p>

              <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {listing.owner.businessName || `${listing.owner.firstName} ${listing.owner.lastName}`}
                  </p>
                  <p className="text-xs text-muted-foreground">Property owner</p>
                </div>
              </div>

              {isOwner && (
                <>
                  <Mail className="hidden" />
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> {listing.owner.phoneNumber ?? 'No phone provided'}</p>
                    <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> {listing.owner.email}</p>
                  </div>
                </>
              )}

              {user?.role === 'STUDENT' && (
                <div className="flex flex-col gap-2">
                  <Button variant="outline" className="w-full" onClick={handleToggleFavourite}>
                    <Heart className={isFavourite ? 'fill-primary text-primary' : ''} />
                    {isFavourite ? 'Saved to favourites' : 'Save to favourites'}
                  </Button>
                  <Dialog open={enquiryOpen} onOpenChange={setEnquiryOpen}>
                    <DialogTrigger render={<Button className="w-full"><MessageSquare className="mr-1 h-4 w-4" /> Contact Landlord</Button>} />
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Contact the landlord</DialogTitle>
                        <DialogDescription>Ask about availability, pricing or move-in dates.</DialogDescription>
                      </DialogHeader>
                      <Textarea
                        placeholder="Hi, is this room still available and are utilities included?"
                        value={enquiryMessage}
                        onChange={(e) => setEnquiryMessage(e.target.value)}
                        rows={5}
                      />
                      <DialogFooter>
                        <Button onClick={handleSendEnquiry} disabled={isSendingEnquiry}>
                          {isSendingEnquiry && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Send enquiry
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Dialog open={reportOpen} onOpenChange={setReportOpen}>
                    <DialogTrigger
                      render={
                        <Button variant="ghost" className="w-full text-muted-foreground">
                          <Flag className="mr-1 h-4 w-4" /> Report listing
                        </Button>
                      }
                    />
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Report this listing</DialogTitle>
                        <DialogDescription>Let us know if something looks wrong with this listing.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Reason</Label>
                          <Select value={reportReason} onValueChange={(v) => setReportReason((v ?? 'OTHER') as ReportReason)}>
                            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {REPORT_REASONS.map((r) => (
                                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Details (optional)</Label>
                          <Textarea value={reportDescription} onChange={(e) => setReportDescription(e.target.value)} rows={4} />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleSubmitReport} disabled={isSubmittingReport} variant="destructive">
                          {isSubmittingReport && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Submit report
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              )}

              {isOwner && (
                <LinkButton className="w-full" href={`/landlord/listings/${listing.id}/edit`}>Manage this listing</LinkButton>
              )}

              {!user && (
                <LinkButton className="w-full" href="/login">Log in to contact landlord</LinkButton>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-3 pt-4 text-sm text-muted-foreground">
              <BedDouble className="h-5 w-5 shrink-0 text-secondary" />
              This listing has been reviewed and approved by our admin team.
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
