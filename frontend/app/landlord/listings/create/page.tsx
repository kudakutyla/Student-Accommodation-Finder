import { PageHeader } from '@/components/page-header';
import { ListingForm } from '@/components/listing-form';

export default function CreateListingPage() {
  return (
    <div>
      <PageHeader title="Create Listing" description="Fill in the details below. Your listing will be reviewed by an admin before it goes live." />
      <ListingForm />
    </div>
  );
}
