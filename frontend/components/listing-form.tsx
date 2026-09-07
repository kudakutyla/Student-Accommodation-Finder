'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { listCampusesRequest } from '@/services/campus.service';
import { createListingRequest, updateListingRequest, ListingPayload } from '@/services/listing.service';
import { AccommodationType, Campus, Listing } from '@/types';
import { accommodationTypeLabel } from '@/lib/format';
import { ApiClientError } from '@/lib/api-client';

const ACCOMMODATION_TYPES: AccommodationType[] = [
  'STUDENT_RESIDENCE', 'ROOM', 'SHARED_ROOM', 'APARTMENT', 'BACHELOR', 'STUDIO', 'HOUSE', 'SHARED_HOUSE', 'TOWNHOUSE', 'OTHER',
];

export function ListingForm({ listing }: { listing?: Listing }) {
  const router = useRouter();
  const isEdit = !!listing;

  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [campusId, setCampusId] = useState(listing?.campusId ?? '');
  const [title, setTitle] = useState(listing?.title ?? '');
  const [description, setDescription] = useState(listing?.description ?? '');
  const [accommodationType, setAccommodationType] = useState<AccommodationType>(listing?.accommodationType ?? 'ROOM');
  const [pricePerMonth, setPricePerMonth] = useState(listing ? String(listing.pricePerMonth) : '');
  const [address, setAddress] = useState(listing?.address ?? '');
  const [latitude, setLatitude] = useState(listing ? String(listing.latitude) : '');
  const [longitude, setLongitude] = useState(listing ? String(listing.longitude) : '');
  const [totalRooms, setTotalRooms] = useState(listing ? String(listing.totalRooms) : '1');
  const [availableRooms, setAvailableRooms] = useState(listing ? String(listing.availableRooms) : '1');
  const [amenityInput, setAmenityInput] = useState('');
  const [amenities, setAmenities] = useState<string[]>(listing?.amenities ?? []);
  const [photoInput, setPhotoInput] = useState('');
  const [photos, setPhotos] = useState<string[]>(listing?.photos?.map((p) => p.url) ?? []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    listCampusesRequest().then((res) => setCampuses(res.data));
  }, []);

  function addAmenity() {
    const value = amenityInput.trim();
    if (value && !amenities.includes(value)) {
      setAmenities([...amenities, value]);
      setAmenityInput('');
    }
  }

  function addPhoto() {
    const value = photoInput.trim();
    if (value && photos.length < 15) {
      setPhotos([...photos, value]);
      setPhotoInput('');
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (Number(availableRooms) > Number(totalRooms)) {
      toast.error('Available rooms cannot exceed total rooms');
      return;
    }

    const payload: ListingPayload = {
      campusId,
      title,
      description,
      accommodationType,
      pricePerMonth: Number(pricePerMonth),
      address,
      latitude: Number(latitude),
      longitude: Number(longitude),
      totalRooms: Number(totalRooms),
      availableRooms: Number(availableRooms),
      amenities,
      photos,
    };

    setIsSubmitting(true);
    try {
      if (isEdit) {
        await updateListingRequest(listing!.id, payload);
        toast.success('Listing updated and resubmitted for approval');
      } else {
        await createListingRequest(payload);
        toast.success('Listing submitted for approval');
      }
      router.push('/landlord/listings');
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : 'Unable to save listing.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardContent className="space-y-4 pt-6">
          <h2 className="font-semibold text-foreground">Basic information</h2>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Modern Studio Near Campus" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" required rows={5} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Accommodation type</Label>
              <Select value={accommodationType} onValueChange={(v) => setAccommodationType((v ?? accommodationType) as AccommodationType)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ACCOMMODATION_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{accommodationTypeLabel(t)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Campus</Label>
              <Select value={campusId} onValueChange={(v) => setCampusId(v ?? '')}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select campus" /></SelectTrigger>
                <SelectContent>
                  {campuses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <h2 className="font-semibold text-foreground">Location &amp; pricing</h2>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" required value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input id="latitude" type="number" step="any" required value={latitude} onChange={(e) => setLatitude(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input id="longitude" type="number" step="any" required value={longitude} onChange={(e) => setLongitude(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price per month (R)</Label>
              <Input id="price" type="number" min={1} step="0.01" required value={pricePerMonth} onChange={(e) => setPricePerMonth(e.target.value)} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Distance from campus is calculated automatically by the server based on these coordinates.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <h2 className="font-semibold text-foreground">Rooms &amp; amenities</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="totalRooms">Total rooms</Label>
              <Input id="totalRooms" type="number" min={0} required value={totalRooms} onChange={(e) => setTotalRooms(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="availableRooms">Available rooms</Label>
              <Input id="availableRooms" type="number" min={0} required value={availableRooms} onChange={(e) => setAvailableRooms(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Amenities</Label>
            <div className="flex gap-2">
              <Input
                value={amenityInput}
                onChange={(e) => setAmenityInput(e.target.value)}
                onKeyDown={(e) => (e.key === 'Enter' ? (e.preventDefault(), addAmenity()) : undefined)}
                placeholder="e.g. WiFi"
              />
              <Button type="button" variant="outline" onClick={addAmenity}><Plus className="h-4 w-4" /></Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {amenities.map((amenity) => (
                <Badge key={amenity} variant="secondary" className="gap-1">
                  {amenity}
                  <button type="button" onClick={() => setAmenities(amenities.filter((a) => a !== amenity))}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <h2 className="font-semibold text-foreground">Photos</h2>
          <div className="flex gap-2">
            <Input
              value={photoInput}
              onChange={(e) => setPhotoInput(e.target.value)}
              onKeyDown={(e) => (e.key === 'Enter' ? (e.preventDefault(), addPhoto()) : undefined)}
              placeholder="https://images.example.com/photo.jpg"
            />
            <Button type="button" variant="outline" onClick={addPhoto}><Plus className="h-4 w-4" /></Button>
          </div>
          <p className="text-xs text-muted-foreground">Add up to 15 photo URLs. The first photo is used as the cover image.</p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {photos.map((url, index) => (
              <div key={url} className="group relative aspect-video overflow-hidden rounded-md border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary external photo URLs, not optimizable by next/image */}
                <img src={url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setPhotos(photos.filter((_, i) => i !== index))}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-background/90 opacity-0 transition group-hover:opacity-100"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isEdit ? 'Save changes' : 'Submit listing for approval'}
      </Button>
    </form>
  );
}
