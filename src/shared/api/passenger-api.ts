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

function buildRideSearchParams(criteria: RideDTO): URLSearchParams {
  const params = new URLSearchParams();

  const pickupLat = toOptionalString(criteria.pickupPoint?.latitude);
  const pickupLng = toOptionalString(criteria.pickupPoint?.longitude);
  const pickupAddress = toOptionalString(criteria.pickupPoint?.placeAddress);
  const destinationLat = toOptionalString(criteria.destinationPoint?.latitude);
  const destinationLng = toOptionalString(criteria.destinationPoint?.longitude);
  const destinationAddress = toOptionalString(criteria.destinationPoint?.placeAddress);
  const requestedSeats = toOptionalString(criteria.requestedSeats);
  const rideStartTime = toOptionalString(criteria.rideStartTime);

  if (pickupLat) {
    params.set('pickupPoint.latitude', pickupLat);
    params.set('pickupLatitude', pickupLat);
  }
  if (pickupLng) {
    params.set('pickupPoint.longitude', pickupLng);
    params.set('pickupLongitude', pickupLng);
  }
  if (pickupAddress) {
    params.set('pickupPoint.placeAddress', pickupAddress);
    params.set('pickupAddress', pickupAddress);
  }

  if (destinationLat) {
    params.set('destinationPoint.latitude', destinationLat);
    params.set('destinationLatitude', destinationLat);
  }
  if (destinationLng) {
    params.set('destinationPoint.longitude', destinationLng);
    params.set('destinationLongitude', destinationLng);
  }
  if (destinationAddress) {
    params.set('destinationPoint.placeAddress', destinationAddress);
    params.set('destinationAddress', destinationAddress);
  }

  if (requestedSeats) {
    params.set('requestedSeats', requestedSeats);
  }
  if (rideStartTime) {
    params.set('rideStartTime', rideStartTime);
  }

  const tripId = toOptionalString(criteria.tripId);
  if (tripId) {
    params.set('tripId', tripId);
  }

  return params;
}

function normalizePassengerRide(ride: PassengerRideResponse): RideBasicInfoDTO {
  return {
    userId: ride.driverId,
    tripId: ride.tripId,
    rideId: ride.rideId,
    pickupPoint: ride.pickupLocation,
    destinationPoint: ride.dropoffLocation,
    rideStartTime: ride.tripStartDateTime,
    seats: `${ride.bookedSeats}`,
    tripStatus: ride.rideStatus,
    vehicleNumber: ride.vehicleNumber ?? '',
    routeGeometry: ride.routeGeometry ?? null,
  };
}

export const passengerApi = {
  getProfile: (userId: string) =>
    apiClient.get<UserInfoDTO>(ROUTES.user.profile(userId)),

  // Rides — normalised to RideBasicInfoDTO for MyRides compatibility
  getUpcomingRides: (passengerId: string) =>
    apiClient
      .get<PassengerRideResponse[]>(ROUTES.passenger.activeRides(passengerId))
      .then((rides) => rides.map(normalizePassengerRide)),

  getHistoryRides: (passengerId: string) =>
    apiClient
      .get<PassengerRideResponse[]>(ROUTES.passenger.rideHistory(passengerId))
      .then((rides) => rides.map(normalizePassengerRide)),

  joinTrip: (_userId: string, data: RideDTO) =>
    apiClient.post<string>(ROUTES.passenger.bookRideWithApproval, data),

  bookRide: (data: object) =>
    apiClient.post<string>(ROUTES.passenger.bookRide, data),

  bookRideWithApproval: (data: object) =>
    apiClient.post<string>(ROUTES.passenger.bookRideWithApproval, data),

  cancelRide: (_userId: string, data: CancelRideRequestDTO & { rideId?: string }) =>
    apiClient.post<string>(ROUTES.passenger.cancelRide, data),

  findRides: (criteria: RideDTO) => {
    const searchParams = buildRideSearchParams(criteria);
    return apiClient.get<TripBasicInfoDTO[]>(
      `${ROUTES.passenger.searchRoutes}?${searchParams}`,
    );
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

  leaveReviewForDriver: (bookingId: string, reviewData: ReviewRequestDTO) =>
    apiClient.post<void>(ROUTES.passenger.leaveReview(bookingId), reviewData),
};
