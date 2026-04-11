
// API Response Types
export interface ResponseDTO<T> {
  success: boolean;
  errorMessage: string | null;
  responseContent: T | null;
}

export interface ResponseListDTO<T> {
  success: boolean;
  errorMessage: string | null;
  responseContent: T[] | null;
}

export interface RequestDTO<T> {
  userId: string;
  requestContent: T;
}

// Points/Location Type
export interface Points {
  latitude: number;
  longitude: number;
  placeId?: string;
  placeAddress?: string;
}

// GeoJSON LineString geometry from OSRM (coordinates are [lng, lat] pairs)
export interface RouteGeometry {
  type: 'LineString';
  coordinates: number[][];
}

// User Types
export interface UserInfoDTO {
  fullName: string;
  emailId: string;
  userId?: string;
  phoneNumber: string;
  password?: string;
  age?: number;
  dob?: string;
  empId?: string;
  organisationName?: string;
  profilePicUrl?: string;
  userCars?: Vehicles[];
}

export interface LoginRequestDTO {
  emailId: string;
  password: string;
}

export interface LoginResponseDTO {
  username?: string;
  userId?: string;
  loginSuccess: boolean;
  errMsg?: string;
}

export interface SignUpResponseDTO {
  userId?: string;
  username?: string;
  signUpSuccess: boolean;
}

// Ride Types
export interface RideDTO {
  userId?: string;
  tripId?: string;
  pickupPoint: Points;
  destinationPoint: Points;
  rideStartTime: string;
  requestedSeats: number;
  tripStatus?: string;
  rideStatus?: string;
}

export interface TripBasicInfoDTO {
  userId: string;
  tripId: string;
  profilePic?: string;
  fullName: string;
  vehicleNumber: string;
  pickupPoint: Points;
  destinationPoint: Points;
  tripStartTime: string;
  availableSeats: number;
  phoneNumber: string;
  requestedSeats: number;
}

export interface RideBasicInfoDTO {
  userId: string;
  tripId: string;
  /** Populated for passenger rides; used when cancelling a specific booking */
  rideId?: string;
  pickupPoint: Points;
  destinationPoint: Points;
  rideStartTime: string;
  seats: string;
  tripStatus: string;
  vehicleNumber: string;
  routeGeometry?: RouteGeometry | null;
}

// --- New backend DTOs ---

export interface DriverTripResponse {
  tripId: string;
  driverId: string;
  vehicleNumber: string;
  carType: string;
  tripStatus: 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  sourceAddress: Points;
  destinationAddress: Points;
  tripStartDateTime: string;
  tripTimezone: string;
  totalSeats: number;
  availableSeats: number;
  bookedSeats: number;
  passengers: Array<{
    userId: string;
    bookedSeats: number;
    pickupLocation: Points;
    dropoffLocation: Points;
  }>;
  routeDistanceInKm: number | null;
  routeDurationInMinutes: number | null;
  pricePerSeat: number | null;
  estimatedEarnings: number | null;
  routeGeometry?: RouteGeometry | null;
}

export interface PassengerRideResponse {
  rideId: string;
  tripId: string;
  driverId: string;
  vehicleNumber: string;
  carType: string;
  rideStatus: 'REQUESTED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'REJECTED';
  pickupLocation: Points;
  dropoffLocation: Points;
  tripStartDateTime: string;
  tripTimezone: string;
  bookedSeats: number;
  rideDistanceInKm: number | null;
  rideDurationInMinutes: number | null;
  pricePerSeat: number | null;
  estimatedFare: number | null;
  routeGeometry?: RouteGeometry | null;
  driverDetails: {
    name: string;
    rating: number | null;
    totalTrips: number | null;
  } | null;
}

export interface DriverProfileResponse {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  age: number;
  licenseNumber: string;
  driverStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  createdAt: string;
  updatedAt: string;
}

export interface JoinRideResponseDTO {
  rideJoined: boolean;
  errMsg?: string;
}

export interface CancelRideRequestDTO {
  tripId: string;
  cancellationReason?: string;
}

export interface CancelRideResponseDTO {
  rideCancelled: boolean;
  errMsg?: string;
}

// Trip Creation Types
export interface OfferRideDTO {
  vehicleNumber: string;
  pickupPoint: Points;
  destinationPoint: Points;
  tripStartTime: string;
  offeredSeats: number;
}

export interface CreateTripResponseDTO {
  tripId?: string;
  vehicleNumber?: string;
  pickupPoint?: Points;
  destinationPoint?: Points;
  tripStartTime?: string;
  tripCreated: boolean;
  errMsg?: string;
}

// Vehicle Types
export interface Vehicles {
  userId: string;
  vehicleNumber: string;
  vehicleType: string;
  vehicleName?: string;
  vehicleColor?: string;
}

export interface VehicleResponseDTO {
  value: string; // vehicle number
  text: string; // vehicle name + color
  seatingCapacity?: string;
}

export interface VehicleRegisterRequestDTO {
  vehicleName: string;
  vehicleNumber: string;
  vehicleType: string;
  vehicleColor: string;
  seatingCapacity?: string;
}
