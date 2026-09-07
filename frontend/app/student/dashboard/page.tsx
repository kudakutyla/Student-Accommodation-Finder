'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, Mail, MessageCircle, Search, Star, ArrowRight } from 'lucide-react';
import { LinkButton } from '@/components/link-button';
import { Card, CardContent } from '@/components/ui/card';
import { StatCard } from '@/components/stat-card';
import { PageHeader } from '@/components/page-header';
import { ListingCard } from '@/components/listing-card';
import { LoadingState } from '@/components/loading-state';
import { EmptyState } from '@/components/empty-state';
import { useAuth } from '@/lib/auth-context';
import { listFavouritesRequest } from '@/services/favourite.service';
import { listEnquiriesRequest } from '@/services/enquiry.service';
import { listConversationsRequest } from '@/services/conversation.service';
import { listNotificationsRequest } from '@/services/notification.service';
import { Favourite, Enquiry, Conversation, Notification } from '@/types';
import { formatDate } from '@/lib/format';
import { StatusBadge } from '@/components/status-badge';

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [favourites, setFavourites] = useState<Favourite[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      listFavouritesRequest(),
      listEnquiriesRequest(),
      listConversationsRequest(),
      listNotificationsRequest(),
    ])
      .then(([favRes, enqRes, convRes, notifRes]) => {
        setFavourites(favRes.data);
        setEnquiries(enqRes.data);
        setConversations(convRes.data);
        setNotifications(notifRes.data);
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <LoadingState label="Loading your dashboard..." />;

  const unreadMessages = conversations.filter((c) => c.messages?.[0] && c.messages[0].senderId !== user?.id && !c.messages[0].isRead).length;
  const unreadNotifications = notifications.filter((n) => !n.isRead).length;

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.firstName}`}
        description="Here's what's happening with your accommodation search."
        action={
          <LinkButton href="/student/search">
            <Search className="mr-1 h-4 w-4" /> Search accommodation
          </LinkButton>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Saved listings" value={favourites.length} icon={Heart} />
        <StatCard label="Enquiries sent" value={enquiries.length} icon={Mail} />
        <StatCard label="Unread messages" value={unreadMessages} icon={MessageCircle} tone={unreadMessages > 0 ? 'warning' : 'default'} />
        <StatCard label="Notifications" value={unreadNotifications} icon={Star} tone={unreadNotifications > 0 ? 'warning' : 'default'} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Saved listings</h2>
            <Link href="/student/favourites" className="text-sm text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {favourites.length === 0 ? (
            <EmptyState title="No saved listings yet" description="Browse accommodation and tap the heart icon to save your favourites." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {favourites.slice(0, 4).map((fav) => (
                <ListingCard key={fav.id} listing={fav.listing} isFavourite />
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Recent enquiries</h2>
            <Link href="/student/enquiries" className="text-sm text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {enquiries.length === 0 ? (
            <EmptyState title="No enquiries yet" description="Contact a landlord from a listing page to start a conversation." />
          ) : (
            <div className="space-y-3">
              {enquiries.slice(0, 5).map((enquiry) => (
                <Card key={enquiry.id}>
                  <CardContent className="flex items-center justify-between gap-3 pt-4">
                    <div>
                      <p className="font-medium text-foreground">{enquiry.listing?.title}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(enquiry.createdAt)}</p>
                    </div>
                    <StatusBadge status={enquiry.status} />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
