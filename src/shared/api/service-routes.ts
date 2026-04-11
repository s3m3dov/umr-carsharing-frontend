// Gateway-relative paths for all backend services.
// Prefix every path with VITE_API_BASE_URL in the API client.
// Gateway strips the service prefix before forwarding (StripPrefix=1).

export const ROUTES = {
  auth: {
    login: '/auth-service/api/auth/login',
    signup: '/auth-service/api/auth/signup',
    validate: '/auth-service/api/auth/validate',
    resetPassword: '/auth-service/api/auth/reset-password',
    resetPasswordConfirm: '/auth-service/api/auth/reset-password/confirm',
    changePassword: '/auth-service/api/auth/change-password',
  },
  admin: {
    drivers: '/user-service/api/admin/drivers',
    passengers: '/user-service/api/admin/passengers',
    vehicles: '/user-service/api/admin/vehicles',
    trips: '/trip-service/api/admin/trips',
    bookings: '/trip-service/api/admin/bookings',
    reviews: '/review-service/api/admin/reviews',
    reports: '/trip-service/api/admin/reports',
    auditLogs: '/trip-service/api/admin/audit-logs',
  },
  user: {
    profile: (userId: string) => `/user-service/api/users/${userId}`,
    driverProfile: (userId: string) => `/user-service/api/drivers/${userId}`,
    passengerProfile: (userId: string) => `/user-service/api/passengers/${userId}`,
    vehicles: (userId: string) => `/user-service/api/vehicles/${userId}`,
    registerVehicle: '/user-service/api/vehicles/register',
  },
  driver: {
    activeTrips: (driverId: string) => `/trip-service/api/trips/active/driver/${driverId}`,
    tripHistory: (driverId: string) => `/trip-service/api/trips/history/driver/${driverId}`,
    offerTrip: '/trip-service/api/trips/offer',
    startTrip: (tripId: string) => `/trip-service/api/trips/${tripId}/start`,
    completeTrip: (tripId: string) => `/trip-service/api/trips/${tripId}/complete`,
    cancelTrip: '/trip-service/api/trips/cancel',
    acceptBooking: '/trip-service/api/bookings/accept',
    rejectBooking: '/trip-service/api/bookings/reject',
    completeRide: (bookingId: string) => `/trip-service/api/bookings/${bookingId}/complete`,
  },
  passenger: {
    activeRides: (passengerId: string) => `/trip-service/api/rides/active/passenger/${passengerId}`,
    rideHistory: (passengerId: string) => `/trip-service/api/rides/history/passenger/${passengerId}`,
    bookRide: '/trip-service/api/rides/book',
    bookRideWithApproval: '/trip-service/api/rides/book/new',
    cancelRide: '/trip-service/api/rides/cancel',
    searchRoutes: '/trip-service/api/trips/search/matching-route',
  },
} as const;
