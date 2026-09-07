import { PageHeader } from '@/components/page-header';
import { ProfileForm } from '@/components/profile-form';

export default function LandlordProfilePage() {
  return (
    <div>
      <PageHeader title="My Profile" description="Manage your personal and business information." />
      <ProfileForm />
    </div>
  );
}
