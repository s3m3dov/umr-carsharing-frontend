// ─── Shared primitives ───────────────────────────────────────────────────────

export interface Points {
  latitude: number;
  longitude: number;
  placeId: string;
  placeAddress: string | null;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // 0-based
  size: number;
}

// ─── Enums ───────────────────────────────────────────────────────────────────

export type DriverStatus = 'PENDING' | 'ACTIVE' | 'REJECTED';
export type TripStatus = 'CREATED' | 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type BookingStatus = 'REQUESTED' | 'REJECTED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type ReviewStatus = 'PENDING' | 'PUBLISHED' | 'FLAGGED' | 'REMOVED';
export type UserType = 'DRIVER' | 'PASSENGER';
export enum VehicleType {
  SEDAN = 'sedan',
  SUV = 'suv',
  MINIVAN = 'minivan',
  HATCHBACK = 'hatchback',
}
export type AuditAction =
  | 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT'
  | 'FLAG' | 'CANCEL' | 'PUBLISH' | 'RESTORE' | 'LOGIN'
  | 'LOGOUT' | 'BOOK' | 'COMPLETE' | 'REVIEW';
export type EntityType =
  | 'DRIVER' | 'PASSENGER' | 'VEHICLE' | 'TRIP'
  | 'BOOKING' | 'REVIEW' | 'USER' | 'ADMIN' | 'SYSTEM';

// ─── Responses ───────────────────────────────────────────────────────────────

export interface DriverResponse {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  userType: UserType;
  phoneNumber: string;
  age: number;
  licenseNumber: string;
  driverStatus: DriverStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PassengerResponse {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  userType: UserType;
  phoneNumber: string;
  age: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminVehicleResponse {
  id: string;
  userId: string;
  vehicleNumber: string;
  vehicleName: string;
  vehicleType: VehicleType;
  vehicleColor: string;
  seatingCapacity: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminTripResponse {
  tripId: string;
  driverId: string;
  vehicleNumber: string;
  carType: string;
  tripStatus: TripStatus;
  sourceAddress: Points;
  destinationAddress: Points;
  totalSeats: number;
  bookedSeats: number;
  availableSeats: number;
  pricePerSeat: number;
  routeDistance: number;
  routeDuration: number;
  routeGeometry?: { type: string; coordinates: number[][] } | null;
  tripStartDateTimeUTC: string;
  tripTimezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingResponse {
  bookingId: string;
  passengerId: string;
  tripId: string;
  driverId: string;
  vehicleNumber: string;
  pickupLocation: Points;
  dropoffLocation: Points;
  requestedSeats: number;
  status: BookingStatus;
  estimatedPrice: number;
  pricePerSeat: number;
  rideStartTimeUTC: string;
  rideTimezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewResponse {
  reviewId: string;
  tripId: string;
  bookingId: string;
  reviewerId: string;
  reviewerType: UserType;
  revieweeId: string;
  revieweeType: UserType;
  rating: number;
  comment: string;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DriverPerformanceReport {
  totalDrivers: number;
  totalTripsCompleted: number;
  totalTripsCancelled: number;
  totalTripsInProgress: number;
  totalTripsAvailable: number;
}

export interface BookingSummaryReport {
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  requestedBookings: number;
  completedBookings: number;
  rejectedBookings: number;
}

export interface RevenueReport {
  totalCompletedBookings: number;
  totalRevenue: number;
  averageRevenuePerBooking: number;
}

export interface PassengerActivityReport {
  totalBookings: number;
  activeBookings: number;
  completedBookings: number;
  cancelledBookings: number;
}

export interface AuditLogResponse {
  id: string;
  action: AuditAction;
  entityType: EntityType;
  entityId: string;
  performedBy: string;
  details: string;
  serviceName: string;
  timestamp: string;
}

// ─── Requests ────────────────────────────────────────────────────────────────

export interface CreatePassengerRequest {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  age: number;
}

export interface UpdatePassengerRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  age?: number;
}

export interface UpdateDriverRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  age?: number;
  licenseNumber?: string;
}

export interface BulkDriverActionRequest {
  driverIds: string[];
}

export interface RegisterVehicleRequest {
  userId: string;
  vehicleName: string;
  vehicleNumber: string;
  vehicleType: VehicleType;
  vehicleColor?: string;
  seatingCapacity?: string;
}

export interface UpdateVehicleRequest {
  vehicleName?: string;
  vehicleType?: VehicleType;
  vehicleColor?: string;
  seatingCapacity?: string;
}

export interface UpdateBookingRequest {
  status?: BookingStatus;
  requestedSeats?: number;
}
