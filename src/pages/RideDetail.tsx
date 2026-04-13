import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { driverApi } from '@/shared/api/driver-api';
import { passengerApi } from '@/shared/api/passenger-api';
import { RideBasicInfoDTO, RideLifecycleStatus, UserRole, CancelRideRequestDTO } from '@/types/api';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
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
import { ArrowLeft, MapPin, XCircle, Clock, Car, Users, Star, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

function getRideStatusClass(status: string): string {
  switch (status.toUpperCase()) {
    case RideLifecycleStatus.ALLOTTED:
    case RideLifecycleStatus.CONFIRMED:
    case RideLifecycleStatus.AVAILABLE:
      return 'bg-green-500/10 text-green-700 border-green-200';
    case RideLifecycleStatus.CANCELLED:
      return 'bg-red-500/10 text-red-700 border-red-200';
    case RideLifecycleStatus.COMPLETED:
      return 'bg-secondary text-secondary-foreground border-border';
    case RideLifecycleStatus.IN_PROGRESS:
      return 'bg-blue-500/10 text-blue-700 border-blue-200';
    default:
      return 'bg-gray-500/10 text-gray-700 border-gray-200';
  }
}

function DetailRow({ label, value, icon: Icon }: { label: string; value: React.ReactNode; icon?: any }) {
  return (
    <div className="flex flex-col gap-1 py-3">
      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide flex items-center gap-1.5">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </span>
      <span className="text-sm font-medium">{value ?? '—'}</span>
    </div>
  );
}

export default function RideDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userId, role } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [confirmCancel, setConfirmCancel] = useState(false);

  const userApi = role === UserRole.DRIVER ? driverApi : passengerApi;

  // Fetch both lists and merge to find the ride
  const { data: upcoming = [], isLoading: loadingUpcoming } = useQuery({
    queryKey: ['upcomingRides', userId],
    queryFn: () => userApi.getUpcomingRides(userId!),
    enabled: !!userId,
  });

  const { data: history = [], isLoading: loadingHistory } = useQuery({
    queryKey: ['historyRides', userId],
    queryFn: () => userApi.getHistoryRides(userId!),
    enabled: !!userId,
  });

  const { data: givenReviews = [] } = useQuery({
    queryKey: ['reviews', 'given', role, userId],
    queryFn: () => (
      role === UserRole.DRIVER
        ? driverApi.getReviewsGivenByDriver(userId!)
        : passengerApi.getReviewsGivenByPassenger(userId!)
    ),
    enabled: !!userId,
  });

  const ride = useMemo(() => {
    const allRides = [...upcoming, ...history];
    return allRides.find(r => r.rideId === id || r.tripId === id);
  }, [upcoming, history, id]);

  const cancelMutation = useMutation({
    mutationFn: () => {
      const cancelData: CancelRideRequestDTO & { rideId?: string } = { 
        tripId: ride!.tripId, 
        rideId: ride!.rideId 
      };
      return userApi.cancelRide(userId!, cancelData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upcomingRides', userId] });
      queryClient.invalidateQueries({ queryKey: ['historyRides', userId] });
      setConfirmCancel(false);
      toast({ title: 'Ride cancelled successfully.' });
      navigate('/my-rides');
    },
    onError: (error) => {
      const message = getBackendErrorMessage(error, 'Failed to cancel ride.');
      toast({ title: 'Failed to cancel ride.', description: message, variant: 'destructive' });
    },
  });

  if (loadingUpcoming || loadingHistory) {
    return (
      <Layout>
        <div className="h-[80vh] flex items-center justify-center text-muted-foreground text-sm">
          Loading ride details…
        </div>
      </Layout>
    );
  }

  if (!ride) {
    return (
      <Layout>
        <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
          <p className="text-destructive text-sm font-medium">Ride not found.</p>
          <Button variant="outline" size="sm" onClick={() => navigate('/my-rides')}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to My Rides
          </Button>
        </div>
      </Layout>
    );
  }

  const isCancellable = ![RideLifecycleStatus.COMPLETED, RideLifecycleStatus.CANCELLED, RideLifecycleStatus.REJECTED].includes(
    ride.tripStatus.toUpperCase() as RideLifecycleStatus,
  );

  const bookingIdentifier = ride.rideId ?? ride.tripId;
  const reviewedBookingIds = new Set(givenReviews.map((review) => review.bookingId));
  const canReview =
    ride.tripStatus.toUpperCase() === RideLifecycleStatus.COMPLETED &&
    !!bookingIdentifier &&
    !reviewedBookingIds.has(bookingIdentifier);
  
  const reviewLink = `/reviews?bookingId=${encodeURIComponent(ride.rideId ?? ride.tripId)}&tripId=${encodeURIComponent(ride.tripId)}`;

  const mapMarkers = [
    {
      position: { lat: ride.pickupPoint.latitude, lng: ride.pickupPoint.longitude },
      title: 'Departure',
      info: `<strong>Departure</strong><br/>${ride.pickupPoint.placeAddress ?? ''}`,
    },
    {
      position: { lat: ride.destinationPoint.latitude, lng: ride.destinationPoint.longitude },
      title: 'Destination',
      info: `<strong>Destination</strong><br/>${ride.destinationPoint.placeAddress ?? ''}`,
    },
  ];

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden">
        {/* ── Left panel: Details ───────────────────────────────────────── */}
        <div className="w-full lg:w-[420px] shrink-0 flex flex-col border-r bg-card overflow-y-auto">
          {/* Back Action */}
          <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-card z-10">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 -ml-2 text-muted-foreground hover:text-foreground"
              onClick={() => navigate('/my-rides')}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Rides
            </Button>
            <div className="flex gap-2">
              {canReview && (
                <Button variant="outline" size="sm" asChild>
                  <Link to={reviewLink}>
                    <Star className="h-3.5 w-3.5 mr-1.5 fill-yellow-400 text-yellow-400" />
                    Review
                  </Link>
                </Button>
              )}
              {isCancellable && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setConfirmCancel(true)}
                >
                  <XCircle className="h-4 w-4" />
                  Cancel
                </Button>
              )}
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="px-6 py-6 space-y-1">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold tracking-tight">Ride Details</h1>
              <Badge variant="outline" className={getRideStatusClass(ride.tripStatus)}>
                {ride.tripStatus}
              </Badge>
            </div>

            <Separator className="my-4" />
            
            <div className="grid grid-cols-2 gap-x-4">
              <DetailRow label="Ride ID" value={<span className="font-mono text-[10px]">{ride.rideId ?? ride.tripId}</span>} icon={Info} />
              <DetailRow label="Vehicle" value={ride.vehicleNumber} icon={Car} />
            </div>

            <Separator />
            
            <DetailRow 
              label="Departure Time" 
              value={new Date(ride.rideStartTime).toLocaleString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })} 
              icon={Clock} 
            />
            
            <Separator />
            
            <DetailRow 
              label="Seats" 
              value={ride.seats} 
              icon={Users} 
            />

            <Separator />

            <div className="pt-4">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex flex-col items-center mt-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <div className="w-0.5 h-10 bg-border my-1" />
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">Departure</span>
                    <p className="text-sm font-medium leading-relaxed">{ride.pickupPoint.placeAddress}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">Destination</span>
                    <p className="text-sm font-medium leading-relaxed">{ride.destinationPoint.placeAddress}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right panel: Map ─────────────────────────────────────────── */}
        <div className="flex-1 min-h-[300px] lg:min-h-0 relative">
          <GoogleMap 
            markers={mapMarkers} 
            routeGeometry={ride.routeGeometry} 
            className="w-full h-full" 
          />
        </div>
      </div>

      {/* Cancel confirmation */}
      <AlertDialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Ride</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this ride? This action cannot be undone and your seat will be released.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Ride</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cancelMutation.mutate()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancelMutation.isPending ? 'Cancelling…' : 'Cancel Ride'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
