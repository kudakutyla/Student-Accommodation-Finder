'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, SearchX } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ListingCard } from '@/components/listing-card';
import { LoadingState } from '@/components/loading-state';
import { EmptyState } from '@/components/empty-state';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { searchListingsRequest, SearchListingsParams } from '@/services/listing.service';
import { listCampusesRequest } from '@/services/campus.service';
import { addFavouriteRequest, listFavouritesRequest, removeFavouriteRequest } from '@/services/favourite.service';
import { AccommodationType, Campus, Listing, PaginationMeta } from '@/types';
import { accommodationTypeLabel } from '@/lib/format';

const ACCOMMODATION_TYPES: AccommodationType[] = [
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
];

const SORT_OPTIONS: { value: NonNullable<SearchListingsParams['sort']>; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'nearest', label: 'Nearest to Campus' },
  { value: 'rating', label: 'Highest Rated' },
];

function FiltersPanel({
  campuses,
  filters,
  onChange,
}: {
  campuses: Campus[];
  filters: SearchListingsParams;
  onChange: (next: Partial<SearchListingsParams>) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>Campus</Label>
        <Select value={filters.campusId ?? 'all'} onValueChange={(v) => onChange({ campusId: !v || v === 'all' ? undefined : v })}>
          <SelectTrigger className="w-full"><SelectValue placeholder="All campuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All campuses</SelectItem>
            {campuses.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Accommodation type</Label>
        <Select
          value={filters.accommodationType ?? 'all'}
          onValueChange={(v) => onChange({ accommodationType: !v || v === 'all' ? undefined : (v as AccommodationType) })}
        >
          <SelectTrigger className="w-full"><SelectValue placeholder="Any type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any type</SelectItem>
            {ACCOMMODATION_TYPES.map((t) => (
              <SelectItem key={t} value={t}>{accommodationTypeLabel(t)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Min price (R)</Label>
          <Input
            type="number"
            min={0}
            value={filters.minPrice ?? ''}
            onChange={(e) => onChange({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>
        <div className="space-y-2">
          <Label>Max price (R)</Label>
          <Input
            type="number"
            min={0}
            value={filters.maxPrice ?? ''}
            onChange={(e) => onChange({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Max distance from campus (km)</Label>
        <Input
          type="number"
          min={0}
          value={filters.maxDistance ?? ''}
          onChange={(e) => onChange({ maxDistance: e.target.value ? Number(e.target.value) : undefined })}
        />
      </div>

      <div className="space-y-2">
        <Label>Minimum available rooms</Label>
        <Input
          type="number"
          min={0}
          value={filters.minAvailableRooms ?? ''}
          onChange={(e) => onChange({ minAvailableRooms: e.target.value ? Number(e.target.value) : undefined })}
        />
      </div>

      <div className="space-y-2">
        <Label>Availability</Label>
        <Select
          value={filters.availabilityStatus ?? 'all'}
          onValueChange={(v) => onChange({ availabilityStatus: !v || v === 'all' ? undefined : (v as SearchListingsParams['availabilityStatus']) })}
        >
          <SelectTrigger className="w-full"><SelectValue placeholder="Any availability" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any availability</SelectItem>
            <SelectItem value="AVAILABLE">Available</SelectItem>
            <SelectItem value="LIMITED">Limited</SelectItem>
            <SelectItem value="FULL">Full</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Minimum rating</Label>
        <Select
          value={filters.minRating?.toString() ?? 'all'}
          onValueChange={(v) => onChange({ minRating: !v || v === 'all' ? undefined : Number(v) })}
        >
          <SelectTrigger className="w-full"><SelectValue placeholder="Any rating" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any rating</SelectItem>
            <SelectItem value="4">4+ stars</SelectItem>
            <SelectItem value="3">3+ stars</SelectItem>
            <SelectItem value="2">2+ stars</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export function BrowseContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [favouriteIds, setFavouriteIds] = useState<Set<string>>(new Set());
  const [searchText, setSearchText] = useState(searchParams.get('search') ?? '');

  const [filters, setFilters] = useState<SearchListingsParams>(() => ({
    campusId: searchParams.get('campusId') ?? undefined,
    search: searchParams.get('search') ?? undefined,
    sort: (searchParams.get('sort') as SearchListingsParams['sort']) ?? 'newest',
    page: Number(searchParams.get('page') ?? 1),
    limit: 12,
  }));

  const runSearch = useCallback(async (nextFilters: SearchListingsParams) => {
    setIsLoading(true);
    try {
      const res = await searchListingsRequest(nextFilters);
      setListings(res.data);
      setPagination(res.pagination ?? null);
    } catch {
      toast.error('Unable to load listings right now.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    listCampusesRequest().then((res) => setCampuses(res.data));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- runSearch sets loading/results state for the current filters
    runSearch(filters);
  }, [filters, runSearch]);

  useEffect(() => {
    if (user?.role === 'STUDENT') {
      listFavouritesRequest()
        .then((res) => setFavouriteIds(new Set(res.data.map((f) => f.listingId))))
        .catch(() => undefined);
    }
  }, [user]);

  function updateFilters(next: Partial<SearchListingsParams>) {
    setFilters((prev) => ({ ...prev, ...next, page: 1 }));
  }

  function handleSearchSubmit() {
    updateFilters({ search: searchText || undefined });
  }

  async function toggleFavourite(listingId: string) {
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role !== 'STUDENT') {
      toast.error('Only students can save favourites.');
      return;
    }
    const isFav = favouriteIds.has(listingId);
    try {
      if (isFav) {
        await removeFavouriteRequest(listingId);
        setFavouriteIds((prev) => {
          const next = new Set(prev);
          next.delete(listingId);
          return next;
        });
        toast.success('Favourite removed');
      } else {
        await addFavouriteRequest(listingId);
        setFavouriteIds((prev) => new Set(prev).add(listingId));
        toast.success('Favourite saved');
      }
    } catch {
      toast.error('Unable to update favourites.');
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Browse Accommodation</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {pagination ? `${pagination.total} listings found` : 'Searching...'}
          </p>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Search by title, address..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
            className="w-full sm:w-64"
          />
          <Button onClick={handleSearchSubmit}>Search</Button>
          <Sheet>
            <SheetTrigger
              render={
                <Button variant="outline" className="lg:hidden">
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              }
            />
            <SheetContent side="left" className="w-80 overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="px-4 pb-6">
                <FiltersPanel campuses={campuses} filters={filters} onChange={updateFilters} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-xl border border-border bg-card p-5">
            <h2 className="mb-4 font-semibold text-foreground">Filters</h2>
            <FiltersPanel campuses={campuses} filters={filters} onChange={updateFilters} />
          </div>
        </aside>

        <div>
          <div className="mb-4 flex justify-end">
            <Select value={filters.sort} onValueChange={(v) => updateFilters({ sort: (v ?? 'newest') as SearchListingsParams['sort'] })}>
              <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <LoadingState label="Searching for accommodation..." />
          ) : listings.length === 0 ? (
            <EmptyState
              icon={<SearchX className="h-8 w-8" />}
              title="No listings match your filters"
              description="Try widening your price range, distance, or clearing some filters."
            />
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {listings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    isFavourite={favouriteIds.has(listing.id)}
                    onToggleFavourite={user?.role !== 'LANDLORD' ? toggleFavourite : undefined}
                  />
                ))}
              </div>

              {pagination && pagination.totalPages > 1 && (
                <Pagination className="mt-8">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => updateFilters({ page: Math.max(1, (filters.page ?? 1) - 1) })}
                        className={filters.page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                      .slice(0, 7)
                      .map((p) => (
                        <PaginationItem key={p}>
                          <PaginationLink isActive={p === pagination.page} onClick={() => setFilters((prev) => ({ ...prev, page: p }))} className="cursor-pointer">
                            {p}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => updateFilters({ page: Math.min(pagination.totalPages, (filters.page ?? 1) + 1) })}
                        className={filters.page === pagination.totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <BrowseContent />
    </Suspense>
  );
}
