import { Suspense } from 'react';
import { BrowseContent } from '@/app/(site)/browse/page';
import { LoadingState } from '@/components/loading-state';

export default function StudentSearchPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <BrowseContent />
    </Suspense>
  );
}
