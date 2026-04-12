import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tripsApi } from '@/shared/api/admin-api';
import type { AdminTripResponse, TripStatus } from '@/admin/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { getBackendErrorMessage } from '@/shared/api/error-toast';
import { ChevronLeft, ChevronRight, Eye, XCircle, Search } from 'lucide-react';
import { TableSkeleton, FilterBar } from '@/admin/shared';

const PAGE_SIZE = 20;

type TabKey = 'all' | 'upcoming' | 'history';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'history', label: 'History' },
];

const TRIP_STATUSES: (TripStatus | 'ALL')[] = [
  'ALL',
  'CREATED',
  'AVAILABLE',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
];

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<TripStatus, string> = {
  AVAILABLE:   'bg-green-500/10 text-green-700 border-green-200 hover:bg-green-500/10',
  IN_PROGRESS: 'bg-blue-500/10 text-blue-700 border-blue-200 hover:bg-blue-500/10',
  COMPLETED:   'bg-gray-500/10 text-gray-600 border-gray-200 hover:bg-gray-500/10',
  CANCELLED:   'bg-red-500/10 text-red-700 border-red-200 hover:bg-red-500/10',
  CREATED:     'bg-yellow-500/10 text-yellow-700 border-yellow-200 hover:bg-yellow-500/10',
};

function TripStatusBadge({ status }: { status: TripStatus }) {
  return (
    <Badge className={STATUS_STYLES[status] ?? ''}>
      {status.replace('_', ' ')}
    </Badge>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function truncate(str: string, len = 8) {
  if (!str) return '—';
  if (str.length <= len) return str;
  return str.slice(0, len) + '…';
}

function formatAddress(address: AdminTripResponse['sourceAddress'] | null | undefined): string {
  if (!address) return '—';
  return address.placeAddress ?? `${address.latitude.toFixed(4)}, ${address.longitude.toFixed(4)}`;
}

const CANCELLABLE: TripStatus[] = ['AVAILABLE', 'CREATED'];

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminTrips() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [tab, setTab] = useState<TabKey>('all');
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<TripStatus | 'ALL'>('ALL');
  const [cancelTrip, setCancelTrip] = useState<AdminTripResponse | null>(null);

  function handleTabChange(key: TabKey) {
    setTab(key);
    setPage(0);
  }

  function clearFilters() {
    setStatusFilter('ALL');
    setPage(0);
  }

  // ── Query ──────────────────────────────────────────────────────────────────

  function queryFn() {
    const params = {
      page,
      size: PAGE_SIZE,
      status: statusFilter === 'ALL' ? undefined : statusFilter,
    };
    if (tab === 'upcoming') return tripsApi.upcoming(params);
    if (tab === 'history') return tripsApi.history(params);
    return tripsApi.list(params);
  }

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'trips', tab, page, statusFilter],
    queryFn,
  });

  // ── Cancel Mutation ────────────────────────────────────────────────────────

  const cancelMutation = useMutation({
    mutationFn: (id: string) => tripsApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'trips'] });
      setCancelTrip(null);
      toast({ title: 'Trip cancelled successfully.' });
    },
    onError: (error) => {
      const message = getBackendErrorMessage(error, 'Failed to cancel trip.');
      toast({ title: 'Failed to cancel trip.', description: message, variant: 'destructive' });
    },
  });

  // ── Render ─────────────────────────────────────────────────────────────────

  const totalPages = data?.totalPages ?? 1;
  const totalElements = data?.totalElements ?? 0;

  return (
    <TooltipProvider>
      <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Trips</h1>
          {data && (
            <p className="text-sm text-muted-foreground">
              {totalElements} trip{totalElements !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 border-b">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handleTabChange(key)}
            className={[
              'px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
              tab === key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <FilterBar onClear={statusFilter !== 'ALL' ? clearFilters : undefined}>
        <Select
          value={statusFilter}
          onValueChange={(v) => { setStatusFilter(v as TripStatus | 'ALL'); setPage(0); }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {TRIP_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterBar>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Trip ID</TableHead>
              <TableHead>Driver ID</TableHead>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Seats</TableHead>
              <TableHead>Price/Seat</TableHead>
              <TableHead>Departure</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
            {isLoading ? (
              <TableSkeleton columns={9} />
            ) : isError ? (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-destructive py-8">
                    Failed to load trips.
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : (
              <TableBody>
                {data?.content.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      No trips found.
                    </TableCell>
                  </TableRow>
                )}
                {data?.content.map((trip) => {
                  const canCancel = CANCELLABLE.includes(trip.tripStatus);
                  return (
                    <TableRow
                      key={trip.tripId}
                      className="cursor-pointer"
                      onClick={() => navigate(`/admin/trips/${trip.tripId}`)}
                    >
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help">{truncate(trip.tripId, 8)}</span>
                          </TooltipTrigger>
                          <TooltipContent>{trip.tripId}</TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help">{truncate(trip.driverId, 8)}</span>
                          </TooltipTrigger>
                          <TooltipContent>{trip.driverId}</TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="max-w-[160px] truncate text-sm">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="block truncate cursor-help">{formatAddress(trip.sourceAddress)}</span>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs whitespace-pre-wrap">{formatAddress(trip.sourceAddress)}</TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="max-w-[160px] truncate text-sm">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="block truncate cursor-help">{formatAddress(trip.destinationAddress)}</span>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs whitespace-pre-wrap">{formatAddress(trip.destinationAddress)}</TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <TripStatusBadge status={trip.tripStatus} />
                      </TableCell>
                      <TableCell className="text-sm">
                        {trip.bookedSeats}/{trip.totalSeats}
                      </TableCell>
                      <TableCell className="text-sm">
                        ${(trip.pricePerSeat ?? 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {new Date(trip.tripStartDateTimeUTC).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs gap-1"
                            onClick={(e) => { e.stopPropagation(); navigate(`/admin/trips/${trip.tripId}`); }}
                          >
                            <Eye className="h-3 w-3" />
                            View
                          </Button>
                          {canCancel && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-xs gap-1 text-destructive border-destructive/30 hover:bg-destructive/5"
                              onClick={(e) => { e.stopPropagation(); setCancelTrip(trip); }}
                            >
                              <XCircle className="h-3 w-3" />
                              Cancel
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            )}
          </Table>
      </div>

      {/* Pagination */}
      {data && totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="gap-1"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Cancel Confirmation */}
      <AlertDialog
        open={!!cancelTrip}
        onOpenChange={(open) => { if (!open) setCancelTrip(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Trip</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel trip{' '}
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="font-mono font-semibold cursor-help">
                    {truncate(cancelTrip?.tripId ?? '', 8)}
                  </span>
                </TooltipTrigger>
                <TooltipContent>{cancelTrip?.tripId ?? ''}</TooltipContent>
              </Tooltip>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Trip</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cancelTrip && cancelMutation.mutate(cancelTrip.tripId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancelMutation.isPending ? 'Cancelling…' : 'Cancel Trip'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </TooltipProvider>
  );
}
