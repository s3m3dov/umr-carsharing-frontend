
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

export enum UserRole {
  ADMIN = 'ADMIN',
  DRIVER = 'DRIVER',
  PASSENGER = 'PASSENGER',
}

export enum RideLifecycleStatus {
  CREATED = 'CREATED',
  AVAILABLE = 'AVAILABLE',
  ALLOTTED = 'ALLOTTED',
  REQUESTED = 'REQUESTED',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
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
  pricePerSeat?: number;
  routeGeometry?: RouteGeometry | null;
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
  pricePerSeat?: number;
  bookingIds?: string[];
  passengers?: Array<{
    bookingId?: string;
    userId: string;
    firstName?: string;
    lastName?: string;
    bookedSeats: number;
    bookingStatus?: string;
    pickupLocation: Points;
    dropoffLocation: Points;
  }>;
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
  joinedBookingIds?: string[] | null;
  passengers: Array<{
    bookingId?: string;
    userId: string;
    firstName?: string;
    lastName?: string;
    bookedSeats: number;
    bookingStatus?: string;
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
  routeGeometry?: RouteGeometry | null;
  driverDetails: {
    name: string;
    rating: number | null;
    totalTrips: number | null;
  } | null;
}

export enum ReviewUserType {
  DRIVER = 'DRIVER',
  PASSENGER = 'PASSENGER',
}

export interface ReviewResponse {
  reviewId: string;
  bookingId: string;
  tripId: string;
  reviewerId: string;
  reviewerType: ReviewUserType;
  revieweeId: string;
  revieweeType: ReviewUserType;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ReviewRequestDTO {
  tripId: string;
  bookingId: string;
  rating: number;
  comment?: string;
}

export interface AverageRatingResponse {
  subjectId: string;
  averageRating: number;
  totalReviews: number;
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

export interface PassengerProfileResponse {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  age: number;
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
  sourceAddress: Points;
  destinationAddress: Points;
  tripStartDateTime: string;
  totalSeats: number;
  pricePerSeat: number;
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

export interface TripSearchCriteriaDTO {
  sourceLatitude: number;
  sourceLongitude: number;
  sourceRadiusKm?: number;
  destinationLatitude: number;
  destinationLongitude: number;
  destinationRadiusKm?: number;
  earliestDepartureTime?: string;
  latestDepartureTime?: string;
  requestedSeats?: number;
  minPrice?: number;
  maxPrice?: number;
  carType?: string;
  minAvailableSeats?: number;
}

export interface MatchingTripResponse {
  tripId: string;
  tripStatus: string;
  vehicleNumber: string;
  carType: string;
  driverId: string;
  sourceAddress: Points;
  destinationAddress: Points;
  sourceLocation: { x: number; y: number };
  destinationLocation: { x: number; y: number };
  totalSeats: number;
  bookedSeats: number;
  tripStartDateTimeUTC: string;
  tripTimezone: string;
  routeGeometry: RouteGeometry;
  routeDistance: number;
  routeDuration: number;
  pricePerSeat: number;
  joinedBookingIds: string[] | null;
  createdAt: string;
  updatedAt: string;
  version?: number | null;
}

export interface BookRideRequestDTO {
  tripId: string;
  driverId: string;
  pickupPoint: {
    latitude: number;
    longitude: number;
    placeAddress?: string;
  };
  destinationPoint: {
    latitude: number;
    longitude: number;
    placeAddress?: string;
  };
  rideStartTime: string;
  requestedSeats: number;
}
