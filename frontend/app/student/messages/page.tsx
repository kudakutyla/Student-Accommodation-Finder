import { PageHeader } from '@/components/page-header';
import { ConversationsView } from '@/components/conversations-view';

export default function StudentMessagesPage() {
  return (
    <div>
      <PageHeader title="Messages" description="Your conversations with landlords." />
      <ConversationsView />
    </div>
  );
}
