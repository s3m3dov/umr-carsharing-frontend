import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tripsApi } from '@/admin/api';
import type { AdminTripResponse, TripStatus } from '@/admin/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, ChevronRight, Eye, XCircle } from 'lucide-react';
import { TableSkeleton } from '@/admin/shared';

const PAGE_SIZE = 20;

type TabKey = 'all' | 'upcoming' | 'history';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'history', label: 'History' },
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

// ─── Trip Details Dialog ──────────────────────────────────────────────────────

interface TripDetailsDialogProps {
  trip: AdminTripResponse | null;
  onOpenChange: (open: boolean) => void;
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-2">
      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
        {label}
      </span>
      <span className="text-sm break-all">{value ?? '—'}</span>
    </div>
  );
}

function TripDetailsDialog({ trip, onOpenChange }: TripDetailsDialogProps) {
  if (!trip) return null;

  return (
    <Dialog open={!!trip} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Trip Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-1">
          <DetailRow label="Trip ID" value={<span className="font-mono">{trip.tripId}</span>} />
          <Separator />
          <DetailRow label="Driver ID" value={<span className="font-mono">{trip.driverId}</span>} />
          <DetailRow label="Vehicle Number" value={trip.vehicleNumber} />
          <DetailRow label="Car Type" value={trip.carType} />
          <Separator />
          <DetailRow
            label="Status"
            value={<TripStatusBadge status={trip.tripStatus} />}
          />
          <Separator />
          <DetailRow
            label="From"
            value={formatAddress(trip.sourceAddress)}
          />
          <DetailRow
            label="To"
            value={formatAddress(trip.destinationAddress)}
          />
          <Separator />
          <DetailRow label="Total Seats" value={trip.totalSeats} />
          <DetailRow label="Booked Seats" value={trip.bookedSeats} />
          <DetailRow label="Available Seats" value={trip.availableSeats} />
          <DetailRow
            label="Price / Seat"
            value={`$${trip.pricePerSeat.toFixed(2)}`}
          />
          <Separator />
          <DetailRow
            label="Route Distance"
            value={trip.routeDistance != null ? `${trip.routeDistance} km` : '—'}
          />
          <DetailRow
            label="Route Duration"
            value={trip.routeDuration != null ? `${trip.routeDuration} min` : '—'}
          />
          <Separator />
          <DetailRow
            label="Departure (UTC)"
            value={new Date(trip.tripStartDateTimeUTC).toLocaleString()}
          />
          <DetailRow label="Timezone" value={trip.tripTimezone} />
          <Separator />
          <DetailRow
            label="Created At"
            value={new Date(trip.createdAt).toLocaleString()}
          />
          <DetailRow
            label="Updated At"
            value={new Date(trip.updatedAt).toLocaleString()}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminTrips() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [tab, setTab] = useState<TabKey>('all');
  const [page, setPage] = useState(0);
  const [viewTrip, setViewTrip] = useState<AdminTripResponse | null>(null);
  const [cancelTrip, setCancelTrip] = useState<AdminTripResponse | null>(null);

  // Reset to page 0 when switching tabs
  function handleTabChange(key: TabKey) {
    setTab(key);
    setPage(0);
  }

  // ── Query ──────────────────────────────────────────────────────────────────

  function queryFn() {
    const params = { page, size: PAGE_SIZE };
    if (tab === 'upcoming') return tripsApi.upcoming(params);
    if (tab === 'history') return tripsApi.history(params);
    return tripsApi.list(params);
  }

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'trips', tab, page],
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
    onError: () => {
      toast({ title: 'Failed to cancel trip.', variant: 'destructive' });
    },
  });

  // ── Render ─────────────────────────────────────────────────────────────────

  const totalPages = data?.totalPages ?? 1;
  const totalElements = data?.totalElements ?? 0;

  return (
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

      {/* Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {TABS.find((t) => t.key === tab)?.label} Trips
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
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
                    <TableRow key={trip.tripId}>
                      <TableCell
                        className="font-mono text-xs text-muted-foreground"
                        title={trip.tripId}
                      >
                        {truncate(trip.tripId, 8)}
                      </TableCell>
                      <TableCell
                        className="font-mono text-xs text-muted-foreground"
                        title={trip.driverId}
                      >
                        {truncate(trip.driverId, 8)}
                      </TableCell>
                      <TableCell className="max-w-[160px] truncate text-sm" title={formatAddress(trip.sourceAddress)}>
                        {formatAddress(trip.sourceAddress)}
                      </TableCell>
                      <TableCell className="max-w-[160px] truncate text-sm" title={formatAddress(trip.destinationAddress)}>
                        {formatAddress(trip.destinationAddress)}
                      </TableCell>
                      <TableCell>
                        <TripStatusBadge status={trip.tripStatus} />
                      </TableCell>
                      <TableCell className="text-sm">
                        {trip.bookedSeats}/{trip.totalSeats}
                      </TableCell>
                      <TableCell className="text-sm">
                        ${trip.pricePerSeat.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {new Date(trip.tripStartDateTimeUTC).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewTrip(trip)}
                            className="gap-1"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View
                          </Button>
                          {canCancel && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setCancelTrip(trip)}
                              className="gap-1 text-destructive hover:text-destructive"
                            >
                              <XCircle className="h-3.5 w-3.5" />
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
        </CardContent>
      </Card>

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

      {/* View Details Dialog */}
      <TripDetailsDialog
        trip={viewTrip}
        onOpenChange={(open) => { if (!open) setViewTrip(null); }}
      />

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
              <span className="font-mono font-semibold">
                {truncate(cancelTrip?.tripId ?? '', 8)}
              </span>
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
  );
}
