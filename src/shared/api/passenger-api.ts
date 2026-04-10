import { apiClient } from './client';
import { ROUTES } from './service-routes';
import type {
  UserInfoDTO,
  RideDTO,
  TripBasicInfoDTO,
  RideBasicInfoDTO,
  JoinRideResponseDTO,
  CancelRideRequestDTO,
  CancelRideResponseDTO,
} from '@/types/api';

const r = ROUTES.user;

export const passengerApi = {
  getProfile: (userId: string) =>
    apiClient.get<UserInfoDTO>(r.profile(userId)),

  findRides: (userId: string, ride: RideDTO) =>
    apiClient.post<TripBasicInfoDTO[]>(r.findRides, { userId, ...ride }),

  joinTrip: (userId: string, ride: RideDTO) =>
    apiClient.post<JoinRideResponseDTO>(r.joinTrip, { userId, ...ride }),

  getUpcomingRides: (userId: string) =>
    apiClient.post<RideBasicInfoDTO[]>(r.upcomingRides, { userId }),

  getHistoryRides: (userId: string) =>
    apiClient.post<RideBasicInfoDTO[]>(r.historyRides, { userId }),

  cancelRide: (userId: string, data: CancelRideRequestDTO) =>
    apiClient.post<CancelRideResponseDTO>(r.cancelRide, { userId, ...data }),
};
