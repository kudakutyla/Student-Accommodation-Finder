'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  Search,
  ShieldCheck,
  MessageSquare,
  MapPin,
  Star,
  Building2,
  ArrowRight,
  Users,
} from 'lucide-react';
import { LinkButton } from '@/components/link-button';
import { Card, CardContent } from '@/components/ui/card';
import { ListingCard } from '@/components/listing-card';
import { LoadingState } from '@/components/loading-state';
import { EmptyState } from '@/components/empty-state';
import { searchListingsRequest } from '@/services/listing.service';
import { listCampusesRequest } from '@/services/campus.service';
import { Listing, Campus } from '@/types';

const HOW_IT_WORKS = [
  {
    icon: Search,
    title: 'Search by campus',
    description: 'Select your campus and filter by price, distance, room type and amenities.',
  },
  {
    icon: MessageSquare,
    title: 'Contact landlords directly',
    description: 'Send an enquiry, chat in real time, and get your questions answered fast.',
  },
  {
    icon: ShieldCheck,
    title: 'Move in with confidence',
    description: 'Every landlord is verified and every listing is reviewed before it goes live.',
  },
];

const BENEFITS = [
  { icon: Building2, title: 'Verified landlords', description: 'Every property owner is vetted by our admin team before they can list.' },
  { icon: MapPin, title: 'Distance you can trust', description: 'Accurate, backend-calculated distance from your exact campus.' },
  { icon: Star, title: 'Real student reviews', description: 'Ratings and reviews from students who actually lived there.' },
  { icon: Users, title: 'Built for students', description: 'A single place to search, compare, and message - no more scattered WhatsApp groups.' },
];

export default function HomePage() {
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([listCampusesRequest(), searchListingsRequest({ sort: 'newest', limit: 6 })])
      .then(([campusRes, listingRes]) => {
        setCampuses(campusRes.data);
        setListings(listingRes.data);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-accent/60 to-background">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              Find your place. <span className="text-primary">Stay closer.</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              NestlyCampus brings verified student accommodation near every campus into one trusted
              platform - no more scattered listings, unanswered messages, or guesswork.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <LinkButton size="lg" href="/browse">
                Find Accommodation <ArrowRight className="ml-1 h-4 w-4" />
              </LinkButton>
              <LinkButton size="lg" variant="outline" href="/register?role=LANDLORD">List Your Property</LinkButton>
            </div>
          </div>
        </div>
      </section>

      {/* Search by campus */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <h2 className="text-center text-2xl font-bold text-foreground">Search by campus</h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-muted-foreground">
          Choose your institution to see accommodation options nearby.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {campuses.map((campus) => (
            <Link
              key={campus.id}
              href={`/browse?campusId=${campus.id}`}
              className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card p-4 text-center transition hover:border-primary hover:shadow-sm"
            >
              <Building2 className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium text-foreground">{campus.name}</span>
              <span className="text-xs text-muted-foreground">{campus.institution}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-border bg-muted/30 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-center text-2xl font-bold text-foreground">How it works</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {HOW_IT_WORKS.map((step) => (
              <Card key={step.title} className="text-center">
                <CardContent className="flex flex-col items-center gap-3 pt-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <step.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-foreground">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured listings */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Recently listed</h2>
          <LinkButton variant="ghost" href="/browse">
            View all <ArrowRight className="ml-1 h-4 w-4" />
          </LinkButton>
        </div>
        {isLoading ? (
          <LoadingState label="Loading listings..." />
        ) : listings.length === 0 ? (
          <EmptyState title="No listings yet" description="Check back soon for new accommodation." />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>

      {/* Benefits / Trust & Safety */}
      <section className="border-t border-border bg-muted/30 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-center text-2xl font-bold text-foreground">Why students trust NestlyCampus</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((benefit) => (
              <div key={benefit.title} className="rounded-xl border border-border bg-card p-5">
                <benefit.icon className="h-6 w-6 text-secondary" />
                <h3 className="mt-3 font-semibold text-foreground">{benefit.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6">
        <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Ready to find your next home?</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
          Join thousands of students who found verified, affordable accommodation close to campus.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <LinkButton size="lg" href="/register">Get Started</LinkButton>
          <LinkButton size="lg" variant="outline" href="/browse">Browse Listings</LinkButton>
        </div>
      </section>
    </div>
  );
}
