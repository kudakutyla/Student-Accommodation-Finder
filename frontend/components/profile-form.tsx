'use client';

import { useEffect, useState, FormEvent } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { StatusBadge } from '@/components/status-badge';
import { useAuth } from '@/lib/auth-context';
import { updateProfileRequest } from '@/services/user.service';
import { listCampusesRequest } from '@/services/campus.service';
import { Campus } from '@/types';
import { initials } from '@/lib/format';
import { ApiClientError } from '@/lib/api-client';

export function ProfileForm() {
  const { user, refreshUser } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber ?? '');
  const [profileImageUrl, setProfileImageUrl] = useState(user?.profileImageUrl ?? '');
  const [campusId, setCampusId] = useState(user?.campusId ?? '');
  const [businessName, setBusinessName] = useState(user?.businessName ?? '');
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.role === 'STUDENT') {
      listCampusesRequest().then((res) => setCampuses(res.data));
    }
  }, [user?.role]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateProfileRequest({
        firstName,
        lastName,
        phoneNumber,
        profileImageUrl,
        campusId: user?.role === 'STUDENT' ? campusId : undefined,
        businessName: user?.role === 'LANDLORD' ? businessName : undefined,
      });
      await refreshUser();
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : 'Unable to update profile.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!user) return null;

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <Card>
        <CardContent className="flex flex-col items-center gap-3 pt-6 text-center">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="bg-primary/10 text-2xl text-primary">
              {initials(user.firstName, user.lastName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-foreground">{user.firstName} {user.lastName}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          {user.role === 'LANDLORD' && user.verificationStatus && (
            <StatusBadge status={user.verificationStatus} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user.email} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone number</Label>
              <Input id="phoneNumber" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profileImageUrl">Profile image URL</Label>
              <Input id="profileImageUrl" value={profileImageUrl} onChange={(e) => setProfileImageUrl(e.target.value)} placeholder="https://..." />
            </div>

            {user.role === 'STUDENT' && (
              <div className="space-y-2">
                <Label htmlFor="campus">Campus</Label>
                <Select value={campusId} onValueChange={(v) => setCampusId(v ?? '')}>
                  <SelectTrigger id="campus" className="w-full"><SelectValue placeholder="Select your campus" /></SelectTrigger>
                  <SelectContent>
                    {campuses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name} - {c.institution}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {user.role === 'LANDLORD' && (
              <div className="space-y-2">
                <Label htmlFor="businessName">Property / business name</Label>
                <Input id="businessName" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
              </div>
            )}

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
