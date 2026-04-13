import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { driverApi } from '@/shared/api/driver-api';
import { passengerApi } from '@/shared/api/passenger-api';
import { getBackendErrorMessage } from '@/shared/api/error-toast';
import {
  RideLifecycleStatus,
  ReviewUserType,
  UserRole,
  type ReviewRequestDTO,
  type ReviewResponse,
  type RideBasicInfoDTO,
} from '@/types/api';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, MessageSquare, Star } from 'lucide-react';

function renderStars(rating: number): string {
  const value = Math.max(1, Math.min(5, Math.round(rating)));
  return `${'★'.repeat(value)}${'☆'.repeat(5 - value)}`;
}

export default function Reviews() {
  const { userId, role } = useAuth();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [form, setForm] = useState<ReviewRequestDTO>({ rating: 5, comment: '' });
  const [bookingId, setBookingId] = useState(() => searchParams.get('bookingId') ?? '');
  const [tripId, setTripId] = useState(() => searchParams.get('tripId') ?? '');

  const isDriver = role === UserRole.DRIVER;
  const reviewTargetLabel = isDriver ? 'passenger' : 'driver';

  const { data: reviews = [], isLoading: loadingReviews } = useQuery({
    queryKey: ['reviews', role, userId],
    queryFn: async () => {
      if (!userId) return [] as ReviewResponse[];
      return isDriver
        ? driverApi.getReviewsForDriver(userId)
        : passengerApi.getReviewsForPassenger(userId);
    },
    enabled: !!userId,
  });

  const {
    data: reviewHistory = [],
    isLoading: loadingReviewHistory,
    error: reviewHistoryError,
    refetch: refetchReviewHistory,
  } = useQuery({
    queryKey: ['reviews', 'given', role, userId],
    queryFn: () => (
      isDriver
        ? driverApi.getReviewsGivenByDriver(userId!)
        : passengerApi.getReviewsGivenByPassenger(userId!)
    ),
    enabled: !!userId,
  });

  const {
    data: historyRides = [],
    isLoading: loadingHistoryRides,
    error: historyRidesError,
    refetch: refetchHistoryRides,
  } = useQuery({
    queryKey: ['rides', 'history', role, userId],
    queryFn: () => (
      isDriver
        ? driverApi.getHistoryRides(userId!)
        : passengerApi.getHistoryRides(userId!)
    ),
    enabled: !!userId,
  });

  const { data: driverRating } = useQuery({
    queryKey: ['driver-rating', userId],
    queryFn: () => driverApi.getDriverRating(userId!),
    enabled: !!userId && isDriver,
  });

  const averageRating = useMemo(() => {
    if (isDriver && typeof driverRating === 'number') {
      return driverRating;
    }
    if (!reviews.length) {
      return 0;
    }
    return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  }, [driverRating, isDriver, reviews]);

  const sortedReviews = useMemo(
    () => [...reviews].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [reviews],
  );

  const finishedRides = useMemo(
    () => historyRides.filter((ride) => ride.tripStatus.toUpperCase() === RideLifecycleStatus.COMPLETED),
    [historyRides],
  );

  const pendingReviewTargets = useMemo(() => {
    const reviewedBookingIds = new Set(reviewHistory.map((review) => review.bookingId));
    return finishedRides.filter((ride) => {
      const bookingIdentifier = ride.rideId ?? ride.tripId;
      return !!bookingIdentifier && !reviewedBookingIds.has(bookingIdentifier);
    });
  }, [finishedRides, reviewHistory]);

  const bookingOptions = useMemo(
    () => pendingReviewTargets.map((ride) => ({
      bookingId: ride.rideId ?? ride.tripId,
      tripId: ride.tripId,
    })),
    [pendingReviewTargets],
  );

  const tripOptions = useMemo(
    () => Array.from(new Set(pendingReviewTargets.map((ride) => ride.tripId))),
    [pendingReviewTargets],
  );

  const selectedRideForReview = useMemo(() => {
    const normalizedBookingId = bookingId.trim();
    const normalizedTripId = tripId.trim();
    if (!normalizedBookingId && !normalizedTripId) return null;
    return (
      pendingReviewTargets.find((ride) => {
        const rideBookingId = ride.rideId ?? ride.tripId;
        const bookingMatches = !normalizedBookingId || rideBookingId === normalizedBookingId;
        const tripMatches = !normalizedTripId || ride.tripId === normalizedTripId;
        return bookingMatches && tripMatches;
      }) ?? null
    );
  }, [bookingId, tripId, pendingReviewTargets]);

  const submitReviewMutation = useMutation({
    mutationFn: async () => {
      const normalizedBookingId = bookingId.trim();
      const normalizedTripId = tripId.trim();
      if (!normalizedBookingId) {
        throw new Error('Booking ID is required.');
      }
      if (!normalizedTripId) {
        throw new Error('Trip ID is required.');
      }
      if (isDriver) {
        return driverApi.leaveReviewForPassenger(normalizedBookingId, form);
      }
      return passengerApi.leaveReviewForDriver(normalizedBookingId, form);
    },
    onSuccess: () => {
      toast({
        title: 'Review submitted',
        description: 'Thank you for sharing your experience.',
      });
      setForm({ rating: 5, comment: '' });
      setBookingId('');
      setTripId('');
      queryClient.invalidateQueries({ queryKey: ['reviews', role, userId] });
      queryClient.invalidateQueries({ queryKey: ['reviews', 'given', role, userId] });
      queryClient.invalidateQueries({ queryKey: ['rides', 'history', role, userId] });
      queryClient.invalidateQueries({ queryKey: ['driver-rating', userId] });
    },
    onError: (error) => {
      const message = getBackendErrorMessage(error, 'Failed to submit review.');
      toast({ title: 'Could not submit review', description: message, variant: 'destructive' });
    },
  });

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Reviews</h1>
          <p className="text-sm text-muted-foreground">Read feedback and submit new reviews after completed rides.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border bg-card p-4">
            <p className="text-xs text-muted-foreground mb-1">Received Reviews</p>
            <p className="text-2xl font-bold">{loadingReviews ? '—' : reviews.length}</p>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <p className="text-xs text-muted-foreground mb-1">Average Rating</p>
            <p className="text-2xl font-bold">{averageRating > 0 ? averageRating.toFixed(1) : '—'}</p>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <p className="text-xs text-muted-foreground mb-1">Stars</p>
            <p className="text-xl text-amber-500">{averageRating > 0 ? renderStars(averageRating) : '☆☆☆☆☆'}</p>
          </div>
        </div>

        <Card className="rounded-xl shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="h-5 w-5" />
              Leave a Review
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(reviewHistoryError || historyRidesError) && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Could not load finished rides</AlertTitle>
                <AlertDescription className="space-y-2">
                  <p>We could not confirm finished rides and review eligibility right now.</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        refetchReviewHistory();
                        refetchHistoryRides();
                      }}
                    >
                      Retry
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {!loadingReviewHistory && !loadingHistoryRides && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="eligible-booking" className="text-xs">Booking ID</Label>
                  <Select
                    value={bookingId}
                    onValueChange={(nextBookingId) => {
                      setBookingId(nextBookingId);
                      const selected = bookingOptions.find((option) => option.bookingId === nextBookingId);
                      setTripId(selected?.tripId ?? '');
                    }}
                  >
                    <SelectTrigger id="eligible-booking" className="rounded-lg">
                      <SelectValue placeholder="Select booking ID" />
                    </SelectTrigger>
                    <SelectContent>
                      {bookingOptions.map((option) => (
                        <SelectItem key={option.bookingId} value={option.bookingId}>
                          {option.bookingId}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="eligible-trip" className="text-xs">Trip ID</Label>
                  <Select
                    value={tripId}
                    onValueChange={(nextTripId) => {
                      setTripId(nextTripId);
                      const selected = bookingOptions.find((option) => option.tripId === nextTripId);
                      if (selected) {
                        setBookingId(selected.bookingId);
                      }
                    }}
                  >
                    <SelectTrigger id="eligible-trip" className="rounded-lg">
                      <SelectValue placeholder="Select trip ID" />
                    </SelectTrigger>
                    <SelectContent>
                      {tripOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {!loadingReviewHistory && !loadingHistoryRides && pendingReviewTargets.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No pending review targets found. Once a ride is finished and not reviewed yet, it will appear here.
              </p>
            )}

            {bookingId.trim() && tripId.trim() && !selectedRideForReview && pendingReviewTargets.length > 0 && (
              <p className="text-xs text-destructive">
                The selected booking/trip combination is not eligible (already reviewed or not finished).
              </p>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="rating" className="text-xs">Rating (1-5)</Label>
              <Input
                id="rating"
                type="number"
                min={1}
                max={5}
                value={form.rating}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  setForm((prev) => ({
                    ...prev,
                    rating: Number.isNaN(value) ? prev.rating : Math.max(1, Math.min(5, value)),
                  }));
                }}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="comment" className="text-xs">Comment</Label>
              <Textarea
                id="comment"
                value={form.comment}
                onChange={(event) => setForm((prev) => ({ ...prev, comment: event.target.value }))}
                maxLength={500}
                placeholder={`How was your experience with this ${reviewTargetLabel}?`}
              />
            </div>

            <Button
              onClick={() => submitReviewMutation.mutate()}
              disabled={
                submitReviewMutation.isPending ||
                !form.comment.trim() ||
                !bookingId.trim() ||
                !tripId.trim() ||
                (pendingReviewTargets.length > 0 && !selectedRideForReview)
              }
            >
              {submitReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Star className="h-5 w-5" />
              Recent Received Reviews
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loadingReviews ? (
              <p className="text-sm text-muted-foreground">Loading reviews...</p>
            ) : sortedReviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">No reviews yet.</p>
            ) : (
              sortedReviews.map((review) => (
                <div key={review.reviewId} className="rounded-lg border p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {review.reviewerType === ReviewUserType.DRIVER ? 'DRIVER' : 'PASSENGER'}
                      </Badge>
                      <span className="text-amber-500 text-sm">{renderStars(review.rating)}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm">{review.comment}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
