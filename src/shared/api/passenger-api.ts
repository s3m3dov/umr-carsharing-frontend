import { apiClient } from './client';
import { ROUTES } from './service-routes';
import { ApiError } from './error-parser';
import type {
  UserInfoDTO,
  RideDTO,
  RideBasicInfoDTO,
  CancelRideRequestDTO,
  PassengerRideResponse,
  TripBasicInfoDTO,
  ReviewResponse,
  ReviewRequestDTO,
  TripSearchCriteriaDTO,
  MatchingTripResponse,
  BookRideRequestDTO,
  PassengerProfileResponse,
} from '@/types/api';

function toOptionalString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') {
    const normalized = value.trim();
    return normalized ? normalized : null;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  return null;
}

function buildAdvancedRideSearchParams(criteria: RideDTO | TripSearchCriteriaDTO): URLSearchParams {
  const params = new URLSearchParams();

  if ('pickupPoint' in criteria) {
    // Handling RideDTO
    if (criteria.pickupPoint?.latitude) params.set('sourceLatitude', criteria.pickupPoint.latitude.toString());
    if (criteria.pickupPoint?.longitude) params.set('sourceLongitude', criteria.pickupPoint.longitude.toString());
    if (criteria.destinationPoint?.latitude) params.set('destinationLatitude', criteria.destinationPoint.latitude.toString());
    if (criteria.destinationPoint?.longitude) params.set('destinationLongitude', criteria.destinationPoint.longitude.toString());
    
    if (criteria.rideStartTime) {
      params.set('earliestDepartureTime', criteria.rideStartTime);
    }
    if (criteria.requestedSeats) {
      params.set('requestedSeats', criteria.requestedSeats.toString());
      params.set('minAvailableSeats', criteria.requestedSeats.toString());
    }
  } else {
    // Handling TripSearchCriteriaDTO
    if (criteria.sourceLatitude) params.set('sourceLatitude', criteria.sourceLatitude.toString());
    if (criteria.sourceLongitude) params.set('sourceLongitude', criteria.sourceLongitude.toString());
    if (criteria.sourceRadiusKm) params.set('sourceRadiusKm', criteria.sourceRadiusKm.toString());
    if (criteria.destinationLatitude) params.set('destinationLatitude', criteria.destinationLatitude.toString());
    if (criteria.destinationLongitude) params.set('destinationLongitude', criteria.destinationLongitude.toString());
    if (criteria.destinationRadiusKm) params.set('destinationRadiusKm', criteria.destinationRadiusKm.toString());
    if (criteria.earliestDepartureTime) params.set('earliestDepartureTime', criteria.earliestDepartureTime);
    if (criteria.latestDepartureTime) params.set('latestDepartureTime', criteria.latestDepartureTime);
    if (criteria.requestedSeats) params.set('requestedSeats', criteria.requestedSeats.toString());
    if (criteria.minPrice) params.set('minPrice', criteria.minPrice.toString());
    if (criteria.maxPrice) params.set('maxPrice', criteria.maxPrice.toString());
    if (criteria.carType) params.set('carType', criteria.carType);
    if (criteria.minAvailableSeats) params.set('minAvailableSeats', criteria.minAvailableSeats.toString());
  }

  return params;
}

function normalizePassengerRide(ride: PassengerRideResponse): RideBasicInfoDTO {
  // Use pickupLocation but fallback to other possible field names if needed
  const pickup = ride.pickupLocation || (ride as any).sourceAddress || (ride as any).source;
  const dropoff = ride.dropoffLocation || (ride as any).destinationAddress || (ride as any).destination;

  return {
    userId: ride.driverId,
    tripId: ride.tripId,
    rideId: ride.rideId,
    pickupPoint: {
      latitude: pickup?.latitude || 0,
      longitude: pickup?.longitude || 0,
      placeAddress: pickup?.placeAddress || (ride as any).pickupAddress || (ride as any).sourceAddressStr || null,
    },
    destinationPoint: {
      latitude: dropoff?.latitude || 0,
      longitude: dropoff?.longitude || 0,
      placeAddress: dropoff?.placeAddress || (ride as any).dropoffAddress || (ride as any).destinationAddressStr || null,
    },
    rideStartTime: ride.tripStartDateTime,
    seats: `${ride.bookedSeats}`,
    tripStatus: ride.rideStatus,
    vehicleNumber: ride.vehicleNumber ?? '',
    routeGeometry: ride.routeGeometry ?? null,
    pricePerSeat: ride.pricePerSeat ?? 0,
  };
}

function normalizeMatchingTrip(trip: MatchingTripResponse): TripBasicInfoDTO {
  return {
    userId: trip.driverId,
    tripId: trip.tripId,
    fullName: trip.driverId.split('@')[0], // Fallback if name is missing
    vehicleNumber: trip.vehicleNumber,
    pickupPoint: {
      ...trip.sourceAddress,
      placeAddress: trip.sourceAddress.placeAddress || (trip as any).pickupAddress || (trip as any).sourceAddressStr || null,
    },
    destinationPoint: {
      ...trip.destinationAddress,
      placeAddress: trip.destinationAddress.placeAddress || (trip as any).dropoffAddress || (trip as any).destinationAddressStr || null,
    },
    tripStartTime: trip.tripStartDateTimeUTC,
    availableSeats: trip.totalSeats - trip.bookedSeats,
    phoneNumber: '', // Not provided in search result
    requestedSeats: 1, // Default placeholder
    pricePerSeat: trip.pricePerSeat,
    routeGeometry: trip.routeGeometry ?? null,
  };
}

function normalizePassengerProfile(profile: PassengerProfileResponse): UserInfoDTO {
  return {
    userId: profile.userId,
    fullName: `${profile.firstName} ${profile.lastName}`,
    emailId: profile.email,
    phoneNumber: profile.phoneNumber,
    age: profile.age,
  };
}

export const passengerApi = {
  getProfile: (userId: string) =>
    apiClient.get<PassengerProfileResponse>(ROUTES.user.passengerProfile(userId))
      .then(normalizePassengerProfile),

  // Rides — normalised to RideBasicInfoDTO for MyRides compatibility
  getUpcomingRides: (passengerId: string) =>
    apiClient
      .get<PassengerRideResponse[]>(ROUTES.passenger.activeRides(passengerId))
      .then((rides) => rides.map(normalizePassengerRide)),

  getHistoryRides: (passengerId: string) =>
    apiClient
      .get<PassengerRideResponse[]>(ROUTES.passenger.rideHistory(passengerId))
      .then((rides) => rides.map(normalizePassengerRide)),

  bookRide: (data: BookRideRequestDTO) =>
    apiClient.post<string>(ROUTES.passenger.bookRide, data),

  bookRideWithApproval: (data: object) =>
    apiClient.post<string>(ROUTES.passenger.bookRideWithApproval, data),

  cancelRide: (_userId: string, data: CancelRideRequestDTO & { rideId?: string }) =>
    apiClient.post<string>(ROUTES.passenger.cancelRide, data),

  findRides: (criteria: RideDTO | TripSearchCriteriaDTO) => {
    const searchParams = buildAdvancedRideSearchParams(criteria);
    return apiClient
      .get<MatchingTripResponse[]>(`${ROUTES.passenger.searchRoutes}?${searchParams}`)
      .then((trips) => trips.map(normalizeMatchingTrip));
  },

  // Review endpoints
  getReviewsForPassenger: (passengerId: string) =>
    apiClient.get<ReviewResponse[]>(ROUTES.passenger.reviewsReceived(passengerId)),

  getReviewsGivenByPassenger: async (passengerId: string) => {
    try {
      return await apiClient.get<ReviewResponse[]>(ROUTES.passenger.reviewsGiven(passengerId));
    } catch (error) {
      if (error instanceof ApiError && [404, 405].includes(error.status)) {
        return [];
      }
      throw error;
    }
  },

  leaveReviewForDriver: (reviewData: ReviewRequestDTO) =>
    apiClient.post<void>(ROUTES.passenger.leaveReview, reviewData),
};
