import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewsApi } from '@/shared/api/admin-api';
import type { ReviewResponse, ReviewStatus } from '@/admin/types';
import { useToast } from '@/hooks/use-toast';
import { getBackendErrorMessage } from '@/shared/api/error-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { TableSkeleton } from '@/admin/shared';

const PAGE_SIZE = 20;

type StatusFilter = 'ALL' | ReviewStatus;

const STATUS_OPTIONS: { label: string; value: StatusFilter }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Published', value: 'PUBLISHED' },
  { label: 'Flagged', value: 'FLAGGED' },
  { label: 'Removed', value: 'REMOVED' },
];

function reviewStatusBadge(status: ReviewStatus) {
  switch (status) {
    case 'PENDING':
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100">
          {status}
        </Badge>
      );
    case 'PUBLISHED':
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">
          {status}
        </Badge>
      );
    case 'FLAGGED':
      return (
        <Badge className="bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100">
          {status}
        </Badge>
      );
    case 'REMOVED':
      return (
        <Badge className="bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-100">
          {status}
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function StarRating({ rating }: { rating: number }) {
  const filled = Math.round(rating);
  const stars = Array.from({ length: 5 }, (_, i) => (i < filled ? '★' : '☆'));
  return (
    <span className="text-amber-500 tabular-nums" title={`${rating}/5`}>
      {stars.join('')}
    </span>
  );
}

function truncate(text: string | null | undefined, maxLen: number) {
  if (!text) return '—';
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + '…';
}

interface ReviewRowActionsProps {
  review: ReviewResponse;
}

function ReviewRowActions({ review }: ReviewRowActionsProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const publishMutation = useMutation({
    mutationFn: () => reviewsApi.publish(review.reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] });
      toast({ title: 'Review published.' });
    },
    onError: (error) => {
      const message = getBackendErrorMessage(error, 'Failed to publish review.');
      toast({ title: 'Failed to publish review.', description: message, variant: 'destructive' });
    },
  });

  const flagMutation = useMutation({
    mutationFn: () => reviewsApi.flag(review.reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] });
      toast({ title: 'Review flagged.' });
    },
    onError: (error) => {
      const message = getBackendErrorMessage(error, 'Failed to flag review.');
      toast({ title: 'Failed to flag review.', description: message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => reviewsApi.delete(review.reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] });
      toast({ title: 'Review deleted.' });
    },
    onError: (error) => {
      const message = getBackendErrorMessage(error, 'Failed to delete review.');
      toast({ title: 'Failed to delete review.', description: message, variant: 'destructive' });
    },
  });

  const canPublish = review.status === 'PENDING' || review.status === 'FLAGGED';
  const canFlag = review.status === 'PUBLISHED' || review.status === 'PENDING';
  const isPending = publishMutation.isPending || flagMutation.isPending || deleteMutation.isPending;

  return (
    <div className="flex items-center justify-end gap-2">
      {canPublish && (
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => publishMutation.mutate()}
        >
          Publish
        </Button>
      )}
      {canFlag && (
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => flagMutation.mutate()}
        >
          Flag
        </Button>
      )}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="sm" variant="destructive" disabled={isPending}>
            Delete
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete review{' '}
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="font-mono cursor-help">{review.reviewId.slice(0, 8)}</span>
                </TooltipTrigger>
                <TooltipContent>{review.reviewId}</TooltipContent>
              </Tooltip>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function AdminReviews() {
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'reviews', statusFilter, page],
    queryFn: () =>
      reviewsApi.list({
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        page,
        size: PAGE_SIZE,
      }),
  });

  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  const handleFilterChange = (value: string) => {
    setStatusFilter(value as StatusFilter);
    setPage(0);
  };

  return (
    <TooltipProvider>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">Reviews</h1>
            {data && (
              <p className="text-sm text-muted-foreground">
                {totalElements} review{totalElements !== 1 ? 's' : ''} total
              </p>
            )}
          </div>

          {/* Status filter */}
          <div className="w-44">
            <Select value={statusFilter} onValueChange={handleFilterChange}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Review ID</TableHead>
                <TableHead>Reviewer ID</TableHead>
                <TableHead>Reviewee ID</TableHead>
                <TableHead>Reviewer Type</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            {isLoading ? (
              <TableSkeleton columns={9} />
            ) : isError ? (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-destructive py-8">
                    Failed to load reviews.
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : (
              <TableBody>
                {data!.content.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center text-muted-foreground py-8"
                    >
                      No reviews found.
                    </TableCell>
                  </TableRow>
                )}
                {data!.content.map((review: ReviewResponse) => (
                  <TableRow key={review.reviewId}>
                    <TableCell className="font-mono text-xs">
                       <Tooltip>
                         <TooltipTrigger asChild>
                           <span className="cursor-help">{review.reviewId.slice(0, 8)}</span>
                         </TooltipTrigger>
                         <TooltipContent>{review.reviewId}</TooltipContent>
                       </Tooltip>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                       <Tooltip>
                         <TooltipTrigger asChild>
                           <span className="cursor-help">{review.reviewerId.slice(0, 8)}</span>
                         </TooltipTrigger>
                         <TooltipContent>{review.reviewerId}</TooltipContent>
                       </Tooltip>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                       <Tooltip>
                         <TooltipTrigger asChild>
                           <span className="cursor-help">{review.revieweeId.slice(0, 8)}</span>
                         </TooltipTrigger>
                         <TooltipContent>{review.revieweeId}</TooltipContent>
                       </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {review.reviewerType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <StarRating rating={review.rating} />
                    </TableCell>
                    <TableCell className="max-w-[180px]">
                      {review.comment.length > 60 ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                             <span className="cursor-help text-sm">
                               {truncate(review.comment, 60)}
                             </span>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs whitespace-pre-wrap">
                            {review.comment}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <span className="text-sm">{review.comment}</span>
                      )}
                    </TableCell>
                    <TableCell>{reviewStatusBadge(review.status)}</TableCell>
                    <TableCell className="text-sm">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <ReviewRowActions review={review} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            )}
          </Table>
        </div>

        {/* Pagination */}
        {data && totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  aria-disabled={page === 0}
                  className={
                    page === 0 ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                  }
                />
              </PaginationItem>
              <PaginationItem>
                <span className="px-4 py-2 text-sm">
                  Page {page + 1} of {totalPages}
                </span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  aria-disabled={page >= totalPages - 1}
                  className={
                    page >= totalPages - 1
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </TooltipProvider>
  );
}
