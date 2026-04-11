import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Pre-built color maps for the project's status enums.
// Each value is a Tailwind className string suitable for a Badge.

export const DRIVER_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-500/10 text-amber-700 border-amber-200 hover:bg-amber-500/10',
  ACTIVE:  'bg-green-500/10 text-green-700 border-green-200 hover:bg-green-500/10',
  REJECTED:'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/10',
};

export const TRIP_STATUS_COLORS: Record<string, string> = {
  CREATED:     'bg-amber-500/10 text-amber-700 border-amber-200 hover:bg-amber-500/10',
  AVAILABLE:   'bg-green-500/10 text-green-700 border-green-200 hover:bg-green-500/10',
  IN_PROGRESS: 'bg-blue-500/10 text-blue-700 border-blue-200 hover:bg-blue-500/10',
  COMPLETED:   'bg-secondary text-secondary-foreground hover:bg-secondary',
  CANCELLED:   'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/10',
};

export const BOOKING_STATUS_COLORS: Record<string, string> = {
  REQUESTED:   'bg-amber-500/10 text-amber-700 border-amber-200 hover:bg-amber-500/10',
  CONFIRMED:   'bg-green-500/10 text-green-700 border-green-200 hover:bg-green-500/10',
  IN_PROGRESS: 'bg-blue-500/10 text-blue-700 border-blue-200 hover:bg-blue-500/10',
  COMPLETED:   'bg-secondary text-secondary-foreground hover:bg-secondary',
  CANCELLED:   'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/10',
  REJECTED:    'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/10',
};

export const REVIEW_STATUS_COLORS: Record<string, string> = {
  PENDING:   'bg-amber-500/10 text-amber-700 border-amber-200 hover:bg-amber-500/10',
  PUBLISHED: 'bg-green-500/10 text-green-700 border-green-200 hover:bg-green-500/10',
  FLAGGED:   'bg-orange-500/10 text-orange-700 border-orange-200 hover:bg-orange-500/10',
  REMOVED:   'bg-secondary text-secondary-foreground hover:bg-secondary',
};

interface StatusBadgeProps {
  status: string;
  colorMap: Record<string, string>;
  className?: string;
}

export function StatusBadge({ status, colorMap, className }: StatusBadgeProps) {
  const colors = colorMap[status];
  return (
    <Badge className={cn(colors ?? 'bg-secondary text-secondary-foreground', className)}>
      {status}
    </Badge>
  );
}
