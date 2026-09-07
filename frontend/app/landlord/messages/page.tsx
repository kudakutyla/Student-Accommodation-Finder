import { PageHeader } from '@/components/page-header';
import { ConversationsView } from '@/components/conversations-view';

export default function LandlordMessagesPage() {
  return (
    <div>
      <PageHeader title="Messages" description="Your conversations with students." />
      <ConversationsView />
    </div>
  );
}
