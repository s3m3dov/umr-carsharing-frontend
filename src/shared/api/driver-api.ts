import { apiClient } from './client';
import { ROUTES } from './service-routes';
import type {
  UserInfoDTO,
  RideBasicInfoDTO,
  CancelRideRequestDTO,
  DriverTripResponse,
  DriverProfileResponse,
  VehicleResponseDTO,
  VehicleRegisterRequestDTO,
} from '@/types/api';

function normalizeDriverTrip(trip: DriverTripResponse): RideBasicInfoDTO {
  return {
    userId: trip.driverId,
    tripId: trip.tripId,
    pickupPoint: trip.sourceAddress,
    destinationPoint: trip.destinationAddress,
    rideStartTime: trip.tripStartDateTime,
    seats: `${trip.bookedSeats}/${trip.totalSeats}`,
    tripStatus: trip.tripStatus,
    vehicleNumber: trip.vehicleNumber ?? '',
  };
}

export const driverApi = {
  getProfile: (userId: string) =>
    apiClient.get<UserInfoDTO>(ROUTES.user.profile(userId)),

  getDriverProfile: (userId: string) =>
    apiClient.get<DriverProfileResponse>(ROUTES.user.driverProfile(userId)),

  getVehicles: (userId: string) =>
    apiClient.get<VehicleResponseDTO[]>(ROUTES.user.vehicles(userId)),

  registerVehicle: (userId: string, data: VehicleRegisterRequestDTO) =>
    apiClient.post<void>(ROUTES.user.registerVehicle, { userId, ...data }),

  // Trips — normalised to RideBasicInfoDTO for MyRides compatibility
  getUpcomingRides: (driverId: string) =>
    apiClient
      .get<DriverTripResponse[]>(ROUTES.driver.activeTrips(driverId))
      .then((trips) => trips.map(normalizeDriverTrip)),

  getHistoryRides: (driverId: string) =>
    apiClient
      .get<DriverTripResponse[]>(ROUTES.driver.tripHistory(driverId))
      .then((trips) => trips.map(normalizeDriverTrip)),

  offerTrip: (data: object) =>
    apiClient.post<void>(ROUTES.driver.offerTrip, data),

  startTrip: (tripId: string) =>
    apiClient.post<void>(ROUTES.driver.startTrip(tripId), {}),

  completeTrip: (tripId: string) =>
    apiClient.post<void>(ROUTES.driver.completeTrip(tripId), {}),

  cancelRide: (_userId: string, data: CancelRideRequestDTO) =>
    apiClient.post<string>(ROUTES.driver.cancelTrip, data),

  // Bookings
  acceptBooking: (bookingId: string) =>
    apiClient.post<string>(`${ROUTES.driver.acceptBooking}?bookingId=${bookingId}`, {}),

  rejectBooking: (bookingId: string) =>
    apiClient.post<string>(`${ROUTES.driver.rejectBooking}?bookingId=${bookingId}`, {}),

  completeRide: (bookingId: string) =>
    apiClient.post<void>(ROUTES.driver.completeRide(bookingId), {}),
};
