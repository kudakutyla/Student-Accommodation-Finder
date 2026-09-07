import { PageHeader } from '@/components/page-header';
import { ProfileForm } from '@/components/profile-form';

export default function StudentProfilePage() {
  return (
    <div>
      <PageHeader title="My Profile" description="Manage your personal information." />
      <ProfileForm />
    </div>
  );
}
