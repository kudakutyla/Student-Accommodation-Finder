'use client';

import { useEffect, useState, FormEvent, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Home, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/lib/auth-context';
import { ApiClientError } from '@/lib/api-client';
import { listCampusesRequest } from '@/services/campus.service';
import { Campus } from '@/types';

function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = (searchParams.get('role') === 'LANDLORD' ? 'LANDLORD' : 'STUDENT') as 'STUDENT' | 'LANDLORD';

  const [role, setRole] = useState<'STUDENT' | 'LANDLORD'>(initialRole);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [campusId, setCampusId] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listCampusesRequest().then((res) => setCampuses(res.data));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (role === 'STUDENT' && !campusId) {
      setError('Please select your campus');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await register({
        email,
        password,
        role,
        firstName,
        lastName,
        phoneNumber: phoneNumber || undefined,
        campusId: role === 'STUDENT' ? campusId : undefined,
        businessName: role === 'LANDLORD' ? businessName : undefined,
      });
      toast.success('Account created successfully');
      if (user.role === 'LANDLORD') {
        router.push('/landlord/dashboard');
      } else {
        router.push('/student/dashboard');
      }
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Unable to register. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <Link href="/" className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Home className="h-5 w-5" />
          </Link>
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <CardDescription>Join as a student to search accommodation, or a landlord to list properties.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={role} onValueChange={(v) => setRole(v as 'STUDENT' | 'LANDLORD')} className="mb-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="STUDENT">I&apos;m a Student</TabsTrigger>
              <TabsTrigger value="LANDLORD">I&apos;m a Landlord</TabsTrigger>
            </TabsList>
          </Tabs>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input id="firstName" required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" required value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone number</Label>
              <Input id="phoneNumber" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="Optional" />
            </div>

            {role === 'STUDENT' && (
              <div className="space-y-2">
                <Label htmlFor="campus">Campus</Label>
                <Select value={campusId} onValueChange={(v) => setCampusId(v ?? '')}>
                  <SelectTrigger id="campus" className="w-full">
                    <SelectValue placeholder="Select your campus" />
                  </SelectTrigger>
                  <SelectContent>
                    {campuses.map((campus) => (
                      <SelectItem key={campus.id} value={campus.id}>
                        {campus.name} - {campus.institution}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {role === 'LANDLORD' && (
              <div className="space-y-2">
                <Label htmlFor="businessName">Property / business name</Label>
                <Input id="businessName" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Optional" />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input id="confirmPassword" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a number.
            </p>

            {role === 'LANDLORD' && (
              <p className="rounded-md bg-accent px-3 py-2 text-xs text-accent-foreground">
                Your account will be reviewed by an administrator before you can publish listings.
              </p>
            )}

            {error && <p className="text-sm text-destructive" role="alert">{error}</p>}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create account
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
