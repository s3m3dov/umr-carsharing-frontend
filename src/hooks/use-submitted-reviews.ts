import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { driverApi } from '@/shared/api/driver-api';
import { passengerApi } from '@/shared/api/passenger-api';
import { UserRole, type RideBasicInfoDTO, type ReviewResponse } from '@/types/api';

/**
 * Returns reviews authored by the current user, scoped to the rides passed in.
 * Backend has no "reviews-by-reviewer" endpoint, so we derive this by reading
 * each counterparty's received reviews and filtering by reviewerId.
 */
export function useSubmittedReviews(rides: RideBasicInfoDTO[]) {
  const { userId, role } = useAuth();
  const isDriver = role === UserRole.DRIVER;

  const counterpartyIds = useMemo(() => {
    const ids = new Set<string>();
    if (isDriver) {
      rides.forEach((ride) =>
        ride.passengers?.forEach((passenger) => {
          if (passenger.userId) ids.add(passenger.userId);
        }),
      );
    } else {
      rides.forEach((ride) => {
        if (ride.userId) ids.add(ride.userId);
      });
    }
    return [...ids];
  }, [rides, isDriver]);

  const counterpartyType = isDriver ? 'PASSENGER' : 'DRIVER';

  const queries = useQueries({
    queries: counterpartyIds.map((counterpartyId) => ({
      queryKey: ['reviews', 'received', counterpartyType, counterpartyId],
      queryFn: () =>
        isDriver
          ? passengerApi.getReviewsForPassenger(counterpartyId)
          : driverApi.getReviewsForDriver(counterpartyId),
      enabled: !!userId && !!counterpartyId,
    })),
  });

  const refetch = () => {
    queries.forEach((query) => query.refetch());
  };

  return useMemo(() => {
    const all: ReviewResponse[] = queries.flatMap((query) => query.data ?? []);
    return {
      data: all.filter((review) => review.reviewerId === userId),
      isLoading: queries.some((query) => query.isLoading),
      error: queries.find((query) => query.error)?.error ?? null,
      refetch,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queries, userId]);
}
