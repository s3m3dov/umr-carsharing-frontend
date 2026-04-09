import { Button } from '@/components/ui/button';

interface PaginationProps {
  /** 0-based current page */
  page: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, totalElements, pageSize, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const from = page * pageSize + 1;
  const to = Math.min((page + 1) * pageSize, totalElements);

  return (
    <div className="flex items-center justify-between px-2 py-4">
      <p className="text-sm text-muted-foreground">
        {from}–{to} of {totalElements}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <span className="text-sm tabular-nums">
          Page {page + 1} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
