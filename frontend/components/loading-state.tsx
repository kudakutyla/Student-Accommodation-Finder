import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LoadingState({ label = 'Loading...', className }: { label?: string; className?: string }) {
  return (
    <div className={cn('flex min-h-[30vh] flex-col items-center justify-center gap-2 text-muted-foreground', className)}>
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
