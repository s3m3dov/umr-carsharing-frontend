import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tripsApi } from '@/shared/api/admin-api';
import type { AdminTripResponse, TripStatus } from '@/admin/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
import { useToast } from '@/hooks/use-toast';
import { getBackendErrorMessage } from '@/shared/api/error-toast';
import GoogleMap from '@/components/GoogleMap';
import { ArrowLeft, MapPin, XCircle } from 'lucide-react';

// ─── Status badge ─────────────────────────────────────────────────────────────

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

function formatAddress(address: AdminTripResponse['sourceAddress'] | null | undefined): string {
  if (!address) return '—';
  return address.placeAddress ?? `${address.latitude.toFixed(4)}, ${address.longitude.toFixed(4)}`;
}

function formatDistanceKm(distanceInMeters: number | null | undefined): string {
  if (distanceInMeters == null || Number.isNaN(distanceInMeters)) return '—';
  const km = distanceInMeters / 1000;
  return `${km.toFixed(1)} km`;
}

function formatDurationMinutes(durationInSeconds: number | null | undefined): string {
  if (durationInSeconds == null || Number.isNaN(durationInSeconds)) return '—';
  const minutes = durationInSeconds / 60;
  return `${minutes.toFixed(1)} min`;
}

// ─── Detail row ───────────────────────────────────────────────────────────────

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

// ─── Page ─────────────────────────────────────────────────────────────────────

const CANCELLABLE: TripStatus[] = ['AVAILABLE', 'CREATED'];

export default function AdminTripDetail() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [confirmCancel, setConfirmCancel] = useState(false);

  const { data: trip, isLoading, isError } = useQuery({
    queryKey: ['admin', 'trips', tripId],
    queryFn: () => tripsApi.get(tripId!),
    enabled: !!tripId,
  });

  const cancelMutation = useMutation({
    mutationFn: () => tripsApi.cancel(tripId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'trips'] });
      setConfirmCancel(false);
      toast({ title: 'Trip cancelled successfully.' });
    },
    onError: (error) => {
      const message = getBackendErrorMessage(error, 'Failed to cancel trip.');
      toast({ title: 'Failed to cancel trip.', description: message, variant: 'destructive' });
    },
  });

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
        Loading trip…
      </div>
    );
  }

  if (isError || !trip) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4">
        <p className="text-destructive text-sm">Failed to load trip.</p>
        <Button variant="outline" size="sm" onClick={() => navigate('/admin/trips')}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Trips
        </Button>
      </div>
    );
  }

  const canCancel = CANCELLABLE.includes(trip.tripStatus);

  const mapMarkers = [
    {
      position: { lat: trip.sourceAddress.latitude, lng: trip.sourceAddress.longitude },
      title: 'Departure',
      info: `<strong>Departure</strong><br/>${formatAddress(trip.sourceAddress)}`,
    },
    {
      position: { lat: trip.destinationAddress.latitude, lng: trip.destinationAddress.longitude },
      title: 'Destination',
      info: `<strong>Destination</strong><br/>${formatAddress(trip.destinationAddress)}`,
    },
  ];

  return (
    <>
      <div className="flex h-full">
        {/* ── Left panel: details ───────────────────────────────────────── */}
        <div className="w-[420px] shrink-0 flex flex-col border-r overflow-y-auto">
          {/* Back + actions */}
          <div className="flex items-center justify-between px-5 py-3 border-b sticky top-0 bg-card z-10">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => navigate('/admin/trips')}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Trips
            </Button>
            {canCancel && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 text-destructive hover:text-destructive"
                onClick={() => setConfirmCancel(true)}
              >
                <XCircle className="h-4 w-4" />
                Cancel Trip
              </Button>
            )}
          </div>

          {/* Details */}
          <div className="px-5 py-4 space-y-0.5">
            <h1 className="text-lg font-semibold mb-4">Trip Details</h1>

            <DetailRow label="Trip ID" value={<span className="font-mono text-xs">{trip.tripId}</span>} />
            <Separator />
            <DetailRow label="Driver ID" value={<span className="font-mono text-xs">{trip.driverId}</span>} />
            <DetailRow label="Vehicle" value={trip.vehicleNumber} />
            <DetailRow label="Car Type" value={trip.carType} />
            <Separator />
            <DetailRow label="Status" value={<TripStatusBadge status={trip.tripStatus} />} />
            <Separator />
            <DetailRow label="Total Seats" value={trip.totalSeats} />
            <DetailRow label="Booked Seats" value={trip.bookedSeats} />
            <DetailRow label="Available Seats" value={trip.availableSeats} />
            <DetailRow label="Price / Seat" value={`$${(trip.pricePerSeat ?? 0).toFixed(2)}`} />
            <Separator />
            <DetailRow
              label="Route Distance"
              value={formatDistanceKm(trip.routeDistance)}
            />
            <DetailRow
              label="Route Duration"
              value={formatDurationMinutes(trip.routeDuration)}
            />
            <Separator />
            <DetailRow
              label="Departure (UTC)"
              value={new Date(trip.tripStartDateTimeUTC).toLocaleString()}
            />
            <DetailRow label="Timezone" value={trip.tripTimezone} />
            <Separator />
            <DetailRow label="Created At" value={new Date(trip.createdAt).toLocaleString()} />
            <DetailRow label="Updated At" value={new Date(trip.updatedAt).toLocaleString()} />
          </div>
        </div>

        {/* ── Right panel: route + map ──────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* From / To */}
          <div className="px-6 py-4 border-b bg-card shrink-0">
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="space-y-1 text-sm">
                <div>
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground mr-2">From</span>
                  {formatAddress(trip.sourceAddress)}
                </div>
                <div>
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground mr-2">To</span>
                  {formatAddress(trip.destinationAddress)}
                </div>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="flex-1 min-h-0">
            <GoogleMap markers={mapMarkers} routeGeometry={trip.routeGeometry} className="w-full h-full" />
          </div>
        </div>
      </div>

      {/* Cancel confirmation */}
      <AlertDialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Trip</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this trip? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Trip</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cancelMutation.mutate()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancelMutation.isPending ? 'Cancelling…' : 'Cancel Trip'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
