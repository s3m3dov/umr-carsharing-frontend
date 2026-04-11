import { Skeleton } from '@/components/ui/skeleton';
import { TableBody, TableCell, TableRow } from '@/components/ui/table';

interface TableSkeletonProps {
  columns: number;
  rows?: number;
}

/**
 * Drop-in replacement for a <TableBody> while data is loading.
 * Renders `rows` skeleton rows, each with `columns` cells.
 */
export function TableSkeleton({ columns, rows = 6 }: TableSkeletonProps) {
  return (
    <TableBody>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i} className="hover:bg-transparent">
          {Array.from({ length: columns }).map((_, j) => (
            <TableCell key={j}>
              <Skeleton className="h-4 rounded" style={{ width: `${60 + ((i * 3 + j * 7) % 30)}%` }} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  );
}
