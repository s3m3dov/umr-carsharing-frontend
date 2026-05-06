import { apiClient } from './client';
import { ROUTES } from './service-routes';
import { ApiError } from './error-parser';
import type {
  UserInfoDTO,
  RideBasicInfoDTO,
  CancelRideRequestDTO,
  DriverTripResponse,
  DriverProfileResponse,
  VehicleResponseDTO,
  VehicleRegisterRequestDTO,
  OfferRideDTO,
  ReviewResponse,
  ReviewRequestDTO,
} from '@/types/api';

function normalizeDriverTrip(trip: DriverTripResponse): RideBasicInfoDTO {
  const passengers = trip.passengers?.map((passenger) => ({
    ...passenger,
    bookingId: passenger.bookingId
      ?? (passenger as any).rideId
      ?? (passenger as any).id
      ?? (passenger as any).booking?.bookingId,
    bookingStatus: passenger.bookingStatus
      ?? (passenger as any).status
      ?? (passenger as any).booking?.status,
  })) ?? [];

  return {
    userId: trip.driverId,
    tripId: trip.tripId,
    pickupPoint: {
      ...trip.sourceAddress,
      placeAddress: trip.sourceAddress.placeAddress || (trip as any).pickupAddress || (trip as any).sourceAddressStr || null,
    },
    destinationPoint: {
      ...trip.destinationAddress,
      placeAddress: trip.destinationAddress.placeAddress || (trip as any).dropoffAddress || (trip as any).destinationAddressStr || null,
    },
    rideStartTime: trip.tripStartDateTime,
    seats: `${trip.bookedSeats}/${trip.totalSeats}`,
    tripStatus: trip.tripStatus,
    vehicleNumber: trip.vehicleNumber ?? '',
    routeGeometry: trip.routeGeometry ?? null,
    bookingIds: trip.joinedBookingIds ?? (trip as any).bookingIds ?? [],
    passengers,
  };
}

function normalizeDriverProfile(profile: DriverProfileResponse): UserInfoDTO {
  return {
    userId: profile.userId,
    fullName: `${profile.firstName} ${profile.lastName}`,
    emailId: profile.email,
    phoneNumber: profile.phoneNumber,
    age: profile.age,
  };
}

export const driverApi = {
  getProfile: (userId: string) =>
    apiClient.get<DriverProfileResponse>(ROUTES.user.driverProfile(userId))
      .then(normalizeDriverProfile),

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

  createTrip: (_userId: string, data: OfferRideDTO) =>
    apiClient.post<void>(ROUTES.driver.offerTrip, data),

  offerTrip: (data: OfferRideDTO) =>
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

  // Review endpoints
  getReviewsForDriver: (driverId: string) =>
    apiClient.get<ReviewResponse[]>(ROUTES.driver.reviewsReceived(driverId)),
  getReviewsGivenByDriver: async (driverId: string) => {
    try {
      return await apiClient.get<ReviewResponse[]>(ROUTES.driver.reviewsGiven(driverId));
    } catch (error) {
      if (error instanceof ApiError && [404, 405].includes(error.status)) {
        return [];
      }
      throw error;
    }
  },
  leaveReviewForPassenger: (reviewData: ReviewRequestDTO) =>
    apiClient.post<void>(ROUTES.driver.leaveReview, reviewData),
  getDriverRating: (driverId: string) =>
    apiClient.get<number>(ROUTES.driver.rating(driverId)),
};
