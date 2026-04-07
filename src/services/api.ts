
import { 
  ResponseDTO, 
  ResponseListDTO, 
  RequestDTO, 
  LoginRequestDTO, 
  LoginResponseDTO,
  UserInfoDTO,
  SignUpResponseDTO,
  RideDTO,
  TripBasicInfoDTO,
  JoinRideResponseDTO,
  RideBasicInfoDTO,
  CancelRideRequestDTO,
  CancelRideResponseDTO,
  OfferRideDTO,
  CreateTripResponseDTO,
  VehicleResponseDTO,
  VehicleRegisterRequestDTO
} from '@/types/api';


const API_BASE_URL = 'http://localhost:8081/api';

class ApiService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // User Authentication
  async login(loginData: LoginRequestDTO): Promise<ResponseDTO<LoginResponseDTO>> {
    return this.makeRequest('/users/login', {
      method: 'POST',
      body: JSON.stringify({ 
        userId: loginData.emailId,
        requestContent: loginData 
      }),
    });
  }

  async signup(userData: UserInfoDTO): Promise<ResponseDTO<SignUpResponseDTO>> {
    return this.makeRequest('/users/signup', {
      method: 'POST',
      body: JSON.stringify({ 
        userId: userData.emailId,
        requestContent: userData 
      }),
    });
  }

  async getUserInfo(userId: string): Promise<ResponseDTO<UserInfoDTO>> {
    return this.makeRequest(`/users/${userId}`);
  }

  // Ride Finding
  async findRides(userId: string, rideData: RideDTO): Promise<ResponseListDTO<TripBasicInfoDTO>> {
    return this.makeRequest('/rides/find-ride', {
      method: 'POST',
      body: JSON.stringify({ userId, requestContent: rideData }),
    });
  }

  async joinTrip(userId: string, rideData: RideDTO): Promise<ResponseDTO<JoinRideResponseDTO>> {
    return this.makeRequest('/rides/join-trip', {
      method: 'POST',
      body: JSON.stringify({ userId, requestContent: rideData }),
    });
  }

  // My Rides
  async getUpcomingRides(userId: string): Promise<ResponseListDTO<RideBasicInfoDTO>> {
    return this.makeRequest('/myrides/upcoming', {
      method: 'POST',
      body: JSON.stringify({ userId, requestContent: null }),
    });
  }

  async getHistoryRides(userId: string): Promise<ResponseListDTO<RideBasicInfoDTO>> {
    return this.makeRequest('/myrides/history', {
      method: 'POST',
      body: JSON.stringify({ userId, requestContent: null }),
    });
  }

  async cancelRide(userId: string, cancelData: CancelRideRequestDTO): Promise<ResponseDTO<CancelRideResponseDTO>> {
    return this.makeRequest('/myrides/cancel', {
      method: 'POST',
      body: JSON.stringify({ userId, requestContent: cancelData }),
    });
  }

  // Trip Creation
  async createTrip(userId: string, tripData: OfferRideDTO): Promise<ResponseDTO<CreateTripResponseDTO>> {
    return this.makeRequest('/ride/create-trip', {
      method: 'POST',
      body: JSON.stringify({ userId, requestContent: tripData }),
    });
  }

  // Vehicle Management
  async getUserVehicles(userId: string): Promise<ResponseListDTO<VehicleResponseDTO>> {
    return this.makeRequest(`/vehicles/${userId}`);
  }

  async registerVehicle(userId: string, vehicleData: VehicleRegisterRequestDTO): Promise<ResponseDTO<void>> {
    return this.makeRequest('/vehicles/register', {
      method: 'POST',
      body: JSON.stringify({ userId, requestContent: vehicleData }),
    });
  }
}

export const apiService = new ApiService();
