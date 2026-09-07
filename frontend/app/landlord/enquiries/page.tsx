'use client';

import { useEffect, useState } from 'react';
import { Mail } from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { LoadingState } from '@/components/loading-state';
import { EmptyState } from '@/components/empty-state';
import { StatusBadge } from '@/components/status-badge';
import { Card, CardContent } from '@/components/ui/card';
import { listEnquiriesRequest } from '@/services/enquiry.service';
import { Enquiry } from '@/types';
import { formatDateTime } from '@/lib/format';

export default function LandlordEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    listEnquiriesRequest()
      .then((res) => setEnquiries(res.data))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div>
      <PageHeader title="Enquiries" description="Enquiries students have sent about your listings." />
      {isLoading ? (
        <LoadingState />
      ) : enquiries.length === 0 ? (
        <EmptyState icon={<Mail className="h-8 w-8" />} title="No enquiries yet" description="When students contact you about a listing, they'll appear here." />
      ) : (
        <div className="space-y-3">
          {enquiries.map((enquiry) => (
            <Link key={enquiry.id} href="/landlord/messages">
              <Card className="transition hover:border-primary">
                <CardContent className="flex items-center justify-between gap-4 pt-4">
                  <div>
                    <p className="font-medium text-foreground">{enquiry.listing?.title}</p>
                    <p className="text-xs text-muted-foreground">
                      From {enquiry.student?.firstName} {enquiry.student?.lastName}
                    </p>
                    <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{enquiry.message}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(enquiry.createdAt)}</p>
                  </div>
                  <StatusBadge status={enquiry.status} />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
