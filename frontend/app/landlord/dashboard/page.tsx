'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Building2, CheckCircle2, Clock, XCircle, Mail, MessageCircle, Plus, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LinkButton } from '@/components/link-button';
import { Card, CardContent } from '@/components/ui/card';
import { StatCard } from '@/components/stat-card';
import { PageHeader } from '@/components/page-header';
import { LoadingState } from '@/components/loading-state';
import { EmptyState } from '@/components/empty-state';
import { StatusBadge } from '@/components/status-badge';
import { useAuth } from '@/lib/auth-context';
import { getMyListingsRequest } from '@/services/listing.service';
import { listEnquiriesRequest } from '@/services/enquiry.service';
import { listConversationsRequest } from '@/services/conversation.service';
import { Listing, Enquiry, Conversation } from '@/types';
import { formatDate } from '@/lib/format';

export default function LandlordDashboardPage() {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMyListingsRequest(), listEnquiriesRequest(), listConversationsRequest()])
      .then(([listingsRes, enquiriesRes, conversationsRes]) => {
        setListings(listingsRes.data);
        setEnquiries(enquiriesRes.data);
        setConversations(conversationsRes.data);
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <LoadingState label="Loading your dashboard..." />;

  const approved = listings.filter((l) => l.approvalStatus === 'APPROVED').length;
  const pending = listings.filter((l) => l.approvalStatus === 'PENDING').length;
  const rejected = listings.filter((l) => l.approvalStatus === 'REJECTED').length;
  const availableRooms = listings.reduce((sum, l) => sum + l.availableRooms, 0);
  const unreadMessages = conversations.filter((c) => c.messages?.[0] && c.messages[0].senderId !== user?.id && !c.messages[0].isRead).length;

  const isUnverified = user?.verificationStatus !== 'VERIFIED';

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.firstName}`}
        description="Manage your listings, enquiries and conversations."
        action={
          isUnverified ? (
            <Button disabled>
              <Plus className="mr-1 h-4 w-4" /> Create listing
            </Button>
          ) : (
            <LinkButton href="/landlord/listings/create">
              <Plus className="mr-1 h-4 w-4" /> Create listing
            </LinkButton>
          )
        }
      />

      {isUnverified && (
        <Card className="mb-6 border-amber-300 bg-amber-50">
          <CardContent className="flex items-center gap-3 pt-4 text-amber-800">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <p className="text-sm">
              Your account verification status is <strong>{user?.verificationStatus}</strong>. You must be
              verified by an administrator before you can create listings.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total listings" value={listings.length} icon={Building2} />
        <StatCard label="Approved" value={approved} icon={CheckCircle2} tone="success" />
        <StatCard label="Pending approval" value={pending} icon={Clock} tone="warning" />
        <StatCard label="Rejected" value={rejected} icon={XCircle} tone="danger" />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Available rooms" value={availableRooms} icon={Building2} />
        <StatCard label="Enquiries received" value={enquiries.length} icon={Mail} />
        <StatCard label="Unread messages" value={unreadMessages} icon={MessageCircle} tone={unreadMessages > 0 ? 'warning' : 'default'} />
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Recent enquiries</h2>
          <Link href="/landlord/enquiries" className="text-sm text-primary hover:underline">View all</Link>
        </div>
        {enquiries.length === 0 ? (
          <EmptyState title="No enquiries yet" description="Enquiries from students will appear here." />
        ) : (
          <div className="space-y-3">
            {enquiries.slice(0, 5).map((enquiry) => (
              <Card key={enquiry.id}>
                <CardContent className="flex items-center justify-between gap-3 pt-4">
                  <div>
                    <p className="font-medium text-foreground">{enquiry.listing?.title}</p>
                    <p className="text-xs text-muted-foreground">
                      From {enquiry.student?.firstName} {enquiry.student?.lastName} &middot; {formatDate(enquiry.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={enquiry.status} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
