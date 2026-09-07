import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Tone = 'success' | 'warning' | 'danger' | 'neutral' | 'info';

const TONE_CLASSES: Record<Tone, string> = {
  success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  warning: 'bg-amber-100 text-amber-800 border-amber-200',
  danger: 'bg-red-100 text-red-800 border-red-200',
  neutral: 'bg-muted text-muted-foreground border-border',
  info: 'bg-sky-100 text-sky-800 border-sky-200',
};

const STATUS_TONE: Record<string, Tone> = {
  APPROVED: 'success',
  VERIFIED: 'success',
  AVAILABLE: 'success',
  RESOLVED: 'success',
  RESPONDED: 'success',
  ACTIVE: 'success',
  PENDING: 'warning',
  LIMITED: 'warning',
  INVESTIGATING: 'warning',
  OPEN: 'info',
  REJECTED: 'danger',
  SUSPENDED: 'danger',
  FULL: 'danger',
  UNAVAILABLE: 'neutral',
  DISMISSED: 'neutral',
  CLOSED: 'neutral',
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const tone = STATUS_TONE[status] ?? 'neutral';
  return (
    <Badge variant="outline" className={cn(TONE_CLASSES[tone], 'font-medium', className)}>
      {status.replace(/_/g, ' ')}
    </Badge>
  );
}
