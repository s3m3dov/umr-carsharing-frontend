import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { driverApi } from '@/shared/api/driver-api';
import { passengerApi } from '@/shared/api/passenger-api';
import { useSubmittedReviews } from '@/hooks/use-submitted-reviews';
import { RideBasicInfoDTO, RideLifecycleStatus, UserRole, CancelRideRequestDTO, ReviewUserType } from '@/types/api';
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
import { ArrowLeft, MapPin, XCircle, CheckCircle2, PlayCircle, Clock, Car, Users, Star, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

function getRideStatusClass(status: string): string {
  switch (status.toUpperCase()) {
    case RideLifecycleStatus.ALLOTTED:
    case RideLifecycleStatus.CONFIRMED:
    case RideLifecycleStatus.AVAILABLE:
      return 'bg-green-500/10 text-green-700 border-green-200';
    case RideLifecycleStatus.CREATED:
      return 'bg-amber-500/10 text-amber-700 border-amber-200';
    case RideLifecycleStatus.CANCELLED:
    case RideLifecycleStatus.REJECTED:
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

function renderStars(rating: number): string {
  const value = Math.max(1, Math.min(5, Math.round(rating)));
  return `${'★'.repeat(value)}${'☆'.repeat(5 - value)}`;
}

function getCompletableBookingIds(ride: RideBasicInfoDTO): string[] {
  const terminalBookingStatuses = new Set([
    RideLifecycleStatus.COMPLETED,
    RideLifecycleStatus.CANCELLED,
    RideLifecycleStatus.REJECTED,
  ]);

  const bookingIds = new Set<string>();

  ride.bookingIds?.forEach((bookingId) => {
    if (bookingId) {
      bookingIds.add(bookingId);
    }
  });

  ride.passengers?.forEach((passenger) => {
    const bookingStatus = passenger.bookingStatus?.toUpperCase();
    if (bookingStatus && terminalBookingStatuses.has(bookingStatus as RideLifecycleStatus)) {
      if (passenger.bookingId) {
        bookingIds.delete(passenger.bookingId);
      }
      return;
    }
    if (passenger.bookingId) {
      bookingIds.add(passenger.bookingId);
    }
  });

  return Array.from(bookingIds);
}

export default function RideDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userId, role } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [confirmComplete, setConfirmComplete] = useState(false);
  const [confirmStart, setConfirmStart] = useState(false);

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

  const ride = useMemo(() => {
    const allRides = [...upcoming, ...history];
    return allRides.find(r => r.rideId === id || r.tripId === id);
  }, [upcoming, history, id]);

  const ridesForReviewLookup = useMemo(() => (ride ? [ride] : []), [ride]);
  const { data: givenReviews = [] } = useSubmittedReviews(ridesForReviewLookup);

  const startMutation = useMutation({
    mutationFn: () => driverApi.startTrip(ride!.tripId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upcomingRides', userId] });
      setConfirmStart(false);
      toast({ title: 'Trip started.', description: 'You are on the way — drive safely.' });
    },
    onError: (error) => {
      const message = getBackendErrorMessage(error, 'Failed to start trip.');
      toast({ title: 'Failed to start trip.', description: message, variant: 'destructive' });
    },
  });

  const completeMutation = useMutation({
    mutationFn: async () => {
      const currentRide = ride!;
      const bookingIds = getCompletableBookingIds(currentRide);

      if ((currentRide.passengers?.length ?? 0) > 0 && bookingIds.length === 0) {
        throw new Error('No booking IDs were available to complete passenger rides.');
      }

      await Promise.all(bookingIds.map((bookingId) => driverApi.completeRide(bookingId)));
      return driverApi.completeTrip(currentRide.tripId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upcomingRides', userId] });
      queryClient.invalidateQueries({ queryKey: ['historyRides', userId] });
      setConfirmComplete(false);
      toast({ title: 'Trip completed.', description: 'Passenger rides were completed and reviews are now available.' });
    },
    onError: (error) => {
      const message = getBackendErrorMessage(error, 'Failed to complete trip.');
      toast({ title: 'Failed to complete trip.', description: message, variant: 'destructive' });
    },
  });

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

  const normalizedStatus = ride.tripStatus.toUpperCase() as RideLifecycleStatus;
  const isTerminal = [
    RideLifecycleStatus.COMPLETED,
    RideLifecycleStatus.CANCELLED,
    RideLifecycleStatus.REJECTED,
  ].includes(normalizedStatus);
  const isStartable =
    role === UserRole.DRIVER &&
    [RideLifecycleStatus.CREATED, RideLifecycleStatus.AVAILABLE].includes(normalizedStatus);
  const isCompletable =
    role === UserRole.DRIVER && normalizedStatus === RideLifecycleStatus.IN_PROGRESS;
  // Drivers must Complete (not Cancel) once a trip is IN_PROGRESS.
  const isCancellable =
    !isTerminal && !(role === UserRole.DRIVER && normalizedStatus === RideLifecycleStatus.IN_PROGRESS);

  const bookingIdentifier = ride.rideId ?? ride.tripId;
  const reviewedBookingIds = new Set(givenReviews.map((review) => review.bookingId));
  const submittedReviewsForTrip = givenReviews
    .filter((review) => review.tripId === ride.tripId)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  const hasSubmittedReview =
    !!bookingIdentifier && reviewedBookingIds.has(bookingIdentifier);
  const canReview =
    ride.tripStatus.toUpperCase() === RideLifecycleStatus.COMPLETED &&
    !!bookingIdentifier &&
    !hasSubmittedReview;

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
              {isStartable && (
                <Button
                  size="sm"
                  className="gap-1.5 bg-blue-600 text-white hover:bg-blue-700"
                  onClick={() => setConfirmStart(true)}
                >
                  <PlayCircle className="h-4 w-4" />
                  Start Trip
                </Button>
              )}
              {isCompletable && (
                <Button
                  size="sm"
                  className="gap-1.5 bg-green-600 text-white hover:bg-green-700"
                  onClick={() => setConfirmComplete(true)}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Complete Trip
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
                    <p className="text-sm font-medium leading-relaxed">
                      {ride.pickupPoint.placeAddress || `${ride.pickupPoint.latitude.toFixed(4)}, ${ride.pickupPoint.longitude.toFixed(4)}`}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">Destination</span>
                    <p className="text-sm font-medium leading-relaxed">
                      {ride.destinationPoint.placeAddress || `${ride.destinationPoint.latitude.toFixed(4)}, ${ride.destinationPoint.longitude.toFixed(4)}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {role === UserRole.DRIVER && ride.passengers && ride.passengers.length > 0 && (
              <>
                <Separator className="my-4" />
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    Passengers ({ride.passengers.length})
                  </h3>
                  <div className="space-y-3">
                    {ride.passengers.map((p, idx) => {
                      const fullName = [p.firstName, p.lastName].filter(Boolean).join(' ');
                      const displayName = fullName || p.userId.split('@')[0];

                      return (
                        <Card key={idx} className="bg-muted/30 border-none shadow-none">
                          <CardContent className="p-3">
                            <div className="flex justify-between items-center">
                              <div className="flex flex-col">
                                <span className="text-xs font-bold">{displayName}</span>
                                <span className="text-[10px] text-muted-foreground">{p.userId}</span>
                              </div>
                              <Badge variant="secondary" className="text-[9px] h-5">
                                {p.bookedSeats} {p.bookedSeats === 1 ? 'seat' : 'seats'}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {submittedReviewsForTrip.length > 0 && (
              <>
                <Separator className="my-4" />
                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-400" />
                    Your Review{submittedReviewsForTrip.length > 1 ? 's' : ''}
                  </h3>
                  {submittedReviewsForTrip.map((review) => (
                    <Card key={review.reviewId} className="bg-muted/30 border-none shadow-none">
                      <CardContent className="p-3 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-[9px] h-5">
                              For {review.revieweeType === ReviewUserType.DRIVER ? 'DRIVER' : 'PASSENGER'}
                            </Badge>
                            <span className="text-amber-500 text-sm">{renderStars(review.rating)}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-xs text-foreground/90">{review.comment}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
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

      {/* Start trip confirmation */}
      <AlertDialog open={confirmStart} onOpenChange={setConfirmStart}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start Trip</AlertDialogTitle>
            <AlertDialogDescription>
              Begin this trip now? Passengers will see it as in progress, and the trip can no
              longer be cancelled — you'll need to complete it on arrival.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Not yet</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                startMutation.mutate();
              }}
              disabled={startMutation.isPending}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {startMutation.isPending ? 'Starting…' : 'Start Trip'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Complete trip confirmation */}
      <AlertDialog open={confirmComplete} onOpenChange={setConfirmComplete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Trip</AlertDialogTitle>
            <AlertDialogDescription>
              Mark this trip as completed? Any remaining passengers will be auto-completed,
              and reviews will become available for everyone on board. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Not yet</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                completeMutation.mutate();
              }}
              disabled={completeMutation.isPending}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              {completeMutation.isPending ? 'Completing…' : 'Complete Trip'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
