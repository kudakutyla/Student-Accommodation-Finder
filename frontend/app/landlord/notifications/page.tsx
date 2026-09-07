import { PageHeader } from '@/components/page-header';
import { NotificationsView } from '@/components/notifications-view';

export default function LandlordNotificationsPage() {
  return (
    <div>
      <PageHeader title="Notifications" />
      <NotificationsView />
    </div>
  );
}
