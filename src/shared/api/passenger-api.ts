import { apiClient } from './client';
import { ROUTES } from './service-routes';
import type {
  UserInfoDTO,
  RideBasicInfoDTO,
  CancelRideRequestDTO,
  PassengerRideResponse,
} from '@/types/api';

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

  bookRide: (data: object) =>
    apiClient.post<string>(ROUTES.passenger.bookRide, data),

  bookRideWithApproval: (data: object) =>
    apiClient.post<string>(ROUTES.passenger.bookRideWithApproval, data),

  cancelRide: (_userId: string, data: CancelRideRequestDTO & { rideId?: string }) =>
    apiClient.post<string>(ROUTES.passenger.cancelRide, data),

  findRides: (criteria: object) =>
    apiClient.get<unknown[]>(
      `${ROUTES.passenger.searchRoutes}?${new URLSearchParams(criteria as Record<string, string>)}`,
    ),
};
