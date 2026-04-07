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
} as const;
