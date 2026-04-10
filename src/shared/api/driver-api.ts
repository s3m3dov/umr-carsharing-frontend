import { apiClient } from './client';
import { ROUTES } from './service-routes';
import type {
  UserInfoDTO,
  RideBasicInfoDTO,
  CancelRideRequestDTO,
  CancelRideResponseDTO,
  OfferRideDTO,
  CreateTripResponseDTO,
  VehicleResponseDTO,
  VehicleRegisterRequestDTO,
} from '@/types/api';

const r = ROUTES.user;

export const driverApi = {
  getProfile: (userId: string) =>
    apiClient.get<UserInfoDTO>(r.profile(userId)),

  getVehicles: (userId: string) =>
    apiClient.get<VehicleResponseDTO[]>(r.vehicles(userId)),

  registerVehicle: (userId: string, data: VehicleRegisterRequestDTO) =>
    apiClient.post<void>(r.registerVehicle, { userId, ...data }),

  createTrip: (userId: string, data: OfferRideDTO) =>
    apiClient.post<CreateTripResponseDTO>(r.createTrip, { userId, ...data }),

  getUpcomingRides: (userId: string) =>
    apiClient.post<RideBasicInfoDTO[]>(r.upcomingRides, { userId }),

  getHistoryRides: (userId: string) =>
    apiClient.post<RideBasicInfoDTO[]>(r.historyRides, { userId }),

  cancelRide: (userId: string, data: CancelRideRequestDTO) =>
    apiClient.post<CancelRideResponseDTO>(r.cancelRide, { userId, ...data }),
};
