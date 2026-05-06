import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { driverApi } from '@/shared/api/driver-api';
import { passengerApi } from '@/shared/api/passenger-api';
import { getBackendErrorMessage } from '@/shared/api/error-toast';
import { useSubmittedReviews } from '@/hooks/use-submitted-reviews';
import {
  RideLifecycleStatus,
  ReviewUserType,
  UserRole,
  type ReviewRequestDTO,
  type ReviewResponse,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, MessageSquare, Star, Send } from 'lucide-react';

function renderStars(rating: number): string {
  const value = Math.max(1, Math.min(5, Math.round(rating)));
  return `${'★'.repeat(value)}${'☆'.repeat(5 - value)}`;
}

export default function Reviews() {
  const { userId, role } = useAuth();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [form, setForm] = useState<Pick<ReviewRequestDTO, 'rating' | 'comment'>>({ rating: 5, comment: '' });
  const [bookingId, setBookingId] = useState(() => searchParams.get('bookingId') ?? '');
  const [tripId, setTripId] = useState(() => searchParams.get('tripId') ?? '');

  const isDriver = role === UserRole.DRIVER;
  const reviewTargetLabel = isDriver ? 'passenger' : 'driver';

  const subjectType = isDriver ? 'DRIVER' : 'PASSENGER';

  const { data: reviews = [], isLoading: loadingReviews } = useQuery({
    queryKey: ['reviews', 'received', subjectType, userId],
    queryFn: async () => {
      if (!userId) return [] as ReviewResponse[];
      return isDriver
        ? driverApi.getReviewsForDriver(userId)
        : passengerApi.getReviewsForPassenger(userId);
    },
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

  const {
    data: reviewHistory,
    isLoading: loadingReviewHistory,
    error: reviewHistoryError,
    refetch: refetchReviewHistory,
  } = useSubmittedReviews(historyRides);

  const { data: ratingData } = useQuery({
    queryKey: ['user-rating', subjectType, userId],
    queryFn: () => (
      isDriver
        ? driverApi.getDriverRating(userId!)
        : passengerApi.getPassengerRating(userId!)
    ),
    enabled: !!userId,
  });

  const averageRating = ratingData?.averageRating ?? 0;

  const sortedReviews = useMemo(
    () => [...reviews].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [reviews],
  );

  const sortedGivenReviews = useMemo(
    () => [...reviewHistory].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [reviewHistory],
  );

  const finishedRides = useMemo(
    () => historyRides.filter((ride) => ride.tripStatus.toUpperCase() === RideLifecycleStatus.COMPLETED),
    [historyRides],
  );

  type PendingReviewTarget = {
    tripId: string;
    bookingId: string;
    passengerName?: string;
    destinationLabel?: string;
    rideStartTime: string;
  };

  const pendingReviewTargets = useMemo<PendingReviewTarget[]>(() => {
    const reviewedKeys = new Set(reviewHistory.map((r) => `${r.tripId}::${r.bookingId}`));

    if (isDriver) {
      return finishedRides.flatMap((ride) =>
        (ride.passengers ?? [])
          .filter(
            (p) =>
              !!p.bookingId &&
              (p.bookingStatus ?? '').toUpperCase() === RideLifecycleStatus.COMPLETED,
          )
          .filter((p) => !reviewedKeys.has(`${ride.tripId}::${p.bookingId}`))
          .map((p) => ({
            tripId: ride.tripId,
            bookingId: p.bookingId!,
            passengerName: [p.firstName, p.lastName].filter(Boolean).join(' ') || p.userId,
            destinationLabel: ride.destinationPoint.placeAddress ?? undefined,
            rideStartTime: ride.rideStartTime,
          })),
      );
    }

    return finishedRides
      .map<PendingReviewTarget | null>((ride) => {
        const rideBookingId = ride.rideId ?? ride.tripId;
        if (!rideBookingId) return null;
        return {
          tripId: ride.tripId,
          bookingId: rideBookingId,
          destinationLabel: ride.destinationPoint.placeAddress ?? undefined,
          rideStartTime: ride.rideStartTime,
        };
      })
      .filter(
        (target): target is PendingReviewTarget =>
          !!target && !reviewedKeys.has(`${target.tripId}::${target.bookingId}`),
      );
  }, [finishedRides, reviewHistory, isDriver]);

  const targetKey = (t: { tripId: string; bookingId: string }) => `${t.tripId}::${t.bookingId}`;

  const selectedTarget = useMemo(() => {
    const normalizedBookingId = bookingId.trim();
    const normalizedTripId = tripId.trim();
    if (!normalizedBookingId || !normalizedTripId) return null;
    return (
      pendingReviewTargets.find(
        (target) => target.tripId === normalizedTripId && target.bookingId === normalizedBookingId,
      ) ?? null
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
      const reviewData: ReviewRequestDTO = {
        tripId: normalizedTripId,
        bookingId: normalizedBookingId,
        rating: form.rating,
        comment: form.comment.trim() || undefined,
      };
      if (isDriver) {
        return driverApi.leaveReviewForPassenger(reviewData);
      }
      return passengerApi.leaveReviewForDriver(reviewData);
    },
    onSuccess: () => {
      toast({
        title: 'Review submitted',
        description: 'Thank you for sharing your experience.',
      });
      setForm({ rating: 5, comment: '' });
      setBookingId('');
      setTripId('');
      queryClient.invalidateQueries({ queryKey: ['reviews', 'received'] });
      queryClient.invalidateQueries({ queryKey: ['rides', 'history', role, userId] });
      queryClient.invalidateQueries({ queryKey: ['user-rating'] });
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

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-xl border bg-card p-4">
            <p className="text-xs text-muted-foreground mb-1">Received Reviews</p>
            <p className="text-2xl font-bold">{loadingReviews ? '—' : reviews.length}</p>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <p className="text-xs text-muted-foreground mb-1">Submitted Reviews</p>
            <p className="text-2xl font-bold">{loadingReviewHistory ? '—' : reviewHistory.length}</p>
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

            {!loadingReviewHistory && !loadingHistoryRides && pendingReviewTargets.length > 0 && (
              <div className="space-y-1.5">
                <Label htmlFor="pending-review" className="text-xs">
                  {isDriver ? 'Passenger booking to review' : 'Ride to review'}
                </Label>
                <Select
                  value={selectedTarget ? targetKey(selectedTarget) : ''}
                  onValueChange={(nextKey) => {
                    const [nextTripId, nextBookingId] = nextKey.split('::');
                    setTripId(nextTripId ?? '');
                    setBookingId(nextBookingId ?? '');
                  }}
                >
                  <SelectTrigger id="pending-review" className="rounded-lg">
                    <SelectValue placeholder={isDriver ? 'Select a passenger booking' : 'Select a ride'} />
                  </SelectTrigger>
                  <SelectContent>
                    {pendingReviewTargets.map((target) => {
                      const key = targetKey(target);
                      const dateLabel = new Date(target.rideStartTime).toLocaleDateString();
                      const destination = target.destinationLabel ?? 'Unknown destination';
                      const label = isDriver
                        ? `${target.passengerName ?? 'Passenger'} — ${destination} (${dateLabel})`
                        : `${destination} — ${dateLabel}`;
                      return (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}

            {!loadingReviewHistory && !loadingHistoryRides && pendingReviewTargets.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No pending review targets found. Once a ride is finished and not reviewed yet, it will appear here.
              </p>
            )}

            {bookingId.trim() && tripId.trim() && !selectedTarget && pendingReviewTargets.length > 0 && (
              <p className="text-xs text-destructive">
                The selected {isDriver ? 'passenger booking' : 'ride'} is not eligible (already reviewed or not finished).
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
                !bookingId.trim() ||
                !tripId.trim() ||
                (pendingReviewTargets.length > 0 && !selectedTarget)
              }
            >
              {submitReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
            </Button>
          </CardContent>
        </Card>

        <Tabs defaultValue="received" className="space-y-4">
          <TabsList>
            <TabsTrigger value="received" className="gap-2">
              <Star className="h-4 w-4" />
              Received ({reviews.length})
            </TabsTrigger>
            <TabsTrigger value="submitted" className="gap-2">
              <Send className="h-4 w-4" />
              Submitted ({reviewHistory.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="received">
            <Card className="rounded-xl shadow-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Star className="h-5 w-5" />
                  Reviews About You
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
                            From {review.reviewerType === ReviewUserType.DRIVER ? 'DRIVER' : 'PASSENGER'}
                          </Badge>
                          <span className="text-amber-500 text-sm">{renderStars(review.rating)}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {review.comment && <p className="text-sm">{review.comment}</p>}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="submitted">
            <Card className="rounded-xl shadow-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Send className="h-5 w-5" />
                  Reviews You Submitted
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {loadingReviewHistory ? (
                  <p className="text-sm text-muted-foreground">Loading reviews...</p>
                ) : sortedGivenReviews.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    You haven't submitted any reviews yet.
                  </p>
                ) : (
                  sortedGivenReviews.map((review) => (
                    <div key={review.reviewId} className="rounded-lg border p-3 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            For {review.revieweeType === ReviewUserType.DRIVER ? 'DRIVER' : 'PASSENGER'}
                          </Badge>
                          <span className="text-amber-500 text-sm">{renderStars(review.rating)}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {review.comment && <p className="text-sm">{review.comment}</p>}
                      <div className="flex items-center gap-2 pt-1 text-[10px] text-muted-foreground font-mono">
                        <span>Trip: {review.tripId}</span>
                        <span>•</span>
                        <span>Booking: {review.bookingId}</span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
