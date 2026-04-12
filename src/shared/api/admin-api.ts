import { apiClient } from '@/shared/api/client';
import { ROUTES } from '@/shared/api/service-routes';
import type {
  Page,
  DriverResponse,
  PassengerResponse,
  AdminVehicleResponse,
  AdminTripResponse,
  BookingResponse,
  ReviewResponse,
  DriverPerformanceReport,
  BookingSummaryReport,
  RevenueReport,
  PassengerActivityReport,
  AuditLogResponse,
  CreatePassengerRequest,
  UpdatePassengerRequest,
  UpdateDriverRequest,
  BulkDriverActionRequest,
  RegisterVehicleRequest,
  UpdateVehicleRequest,
  UpdateBookingRequest,
  DriverStatus,
  ReviewStatus,
  AuditAction,
  EntityType,
  TripStatus,
  BookingStatus,
} from '@/admin/types';

const r = ROUTES.admin;

// ─── Drivers ─────────────────────────────────────────────────────────────────

export const driversApi = {
  list: (params?: { status?: DriverStatus; page?: number; size?: number }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    q.set('page', String(params?.page ?? 0));
    q.set('size', String(params?.size ?? 20));
    return apiClient.get<Page<DriverResponse>>(`${r.drivers}?${q}`);
  },
  get: (id: string) => apiClient.get<DriverResponse>(`${r.drivers}/${id}`),
  approve: (id: string) => apiClient.post<DriverResponse>(`${r.drivers}/${id}/approve`, {}),
  reject: (id: string) => apiClient.post<DriverResponse>(`${r.drivers}/${id}/reject`, {}),
  bulkApprove: (body: BulkDriverActionRequest) =>
    apiClient.post<string>(`${r.drivers}/bulk-approve`, body),
  bulkReject: (body: BulkDriverActionRequest) =>
    apiClient.post<string>(`${r.drivers}/bulk-reject`, body),
  update: (id: string, body: UpdateDriverRequest) =>
    apiClient.put<DriverResponse>(`${r.drivers}/${id}`, body),
  delete: (id: string) => apiClient.delete<string>(`${r.drivers}/${id}`),
};

// ─── Passengers ──────────────────────────────────────────────────────────────

export const passengersApi = {
  list: (params?: { page?: number; size?: number }) => {
    const q = new URLSearchParams();
    q.set('page', String(params?.page ?? 0));
    q.set('size', String(params?.size ?? 20));
    return apiClient.get<Page<PassengerResponse>>(`${r.passengers}?${q}`);
  },
  get: (id: string) => apiClient.get<PassengerResponse>(`${r.passengers}/${id}`),
  create: (body: CreatePassengerRequest) =>
    apiClient.post<PassengerResponse>(r.passengers, body),
  update: (id: string, body: UpdatePassengerRequest) =>
    apiClient.put<PassengerResponse>(`${r.passengers}/${id}`, body),
  delete: (id: string) => apiClient.delete<string>(`${r.passengers}/${id}`),
};

// ─── Vehicles ────────────────────────────────────────────────────────────────

export const vehiclesApi = {
  list: (params?: { page?: number; size?: number }) => {
    const q = new URLSearchParams();
    q.set('page', String(params?.page ?? 0));
    q.set('size', String(params?.size ?? 20));
    return apiClient.get<Page<AdminVehicleResponse>>(`${r.vehicles}?${q}`);
  },
  get: (id: string) => apiClient.get<AdminVehicleResponse>(`${r.vehicles}/${id}`),
  create: (body: RegisterVehicleRequest) =>
    apiClient.post<AdminVehicleResponse>(r.vehicles, body),
  update: (id: string, body: UpdateVehicleRequest) =>
    apiClient.put<AdminVehicleResponse>(`${r.vehicles}/${id}`, body),
  delete: (id: string) => apiClient.delete<string>(`${r.vehicles}/${id}`),
};

// ─── Trips ───────────────────────────────────────────────────────────────────

export const tripsApi = {
  list: (params?: {
    status?: TripStatus;
    driverId?: string;
    page?: number;
    size?: number;
  }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.driverId) q.set('driverId', params.driverId);
    q.set('page', String(params?.page ?? 0));
    q.set('size', String(params?.size ?? 20));
    return apiClient.get<Page<AdminTripResponse>>(`${r.trips}?${q}`);
  },
  upcoming: (params?: { page?: number; size?: number }) => {
    const q = new URLSearchParams();
    q.set('page', String(params?.page ?? 0));
    q.set('size', String(params?.size ?? 20));
    return apiClient.get<Page<AdminTripResponse>>(`${r.trips}/upcoming?${q}`);
  },
  history: (params?: { page?: number; size?: number }) => {
    const q = new URLSearchParams();
    q.set('page', String(params?.page ?? 0));
    q.set('size', String(params?.size ?? 20));
    return apiClient.get<Page<AdminTripResponse>>(`${r.trips}/history?${q}`);
  },
  get: (id: string) => apiClient.get<AdminTripResponse>(`${r.trips}/${id}`),
  cancel: (id: string) => apiClient.delete<string>(`${r.trips}/${id}`),
};

// ─── Bookings ────────────────────────────────────────────────────────────────

export const bookingsApi = {
  list: (params?: {
    status?: BookingStatus;
    passengerId?: string;
    tripId?: string;
    page?: number;
    size?: number;
  }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.passengerId) q.set('passengerId', params.passengerId);
    if (params?.tripId) q.set('tripId', params.tripId);
    q.set('page', String(params?.page ?? 0));
    q.set('size', String(params?.size ?? 20));
    return apiClient.get<Page<BookingResponse>>(`${r.bookings}?${q}`);
  },
  get: (id: string) => apiClient.get<BookingResponse>(`${r.bookings}/${id}`),
  update: (id: string, body: UpdateBookingRequest) =>
    apiClient.put<BookingResponse>(`${r.bookings}/${id}`, body),
  cancel: (id: string) => apiClient.delete<string>(`${r.bookings}/${id}`),
  byPassenger: (passengerId: string, params?: { page?: number; size?: number }) => {
    const q = new URLSearchParams();
    q.set('page', String(params?.page ?? 0));
    q.set('size', String(params?.size ?? 20));
    return apiClient.get<Page<BookingResponse>>(`${r.bookings}/passenger/${passengerId}?${q}`);
  },
};

// ─── Reviews ─────────────────────────────────────────────────────────────────

export const reviewsApi = {
  list: (params?: { status?: ReviewStatus; page?: number; size?: number }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    q.set('page', String(params?.page ?? 0));
    q.set('size', String(params?.size ?? 20));
    return apiClient.get<Page<ReviewResponse>>(`${r.reviews}?${q}`);
  },
  get: (id: string) => apiClient.get<ReviewResponse>(`${r.reviews}/${id}`),
  flag: (id: string) => apiClient.post<ReviewResponse>(`${r.reviews}/${id}/flag`, {}),
  publish: (id: string) => apiClient.post<ReviewResponse>(`${r.reviews}/${id}/publish`, {}),
  delete: (id: string) => apiClient.delete<string>(`${r.reviews}/${id}`),
};

// ─── Reports ─────────────────────────────────────────────────────────────────

export const reportsApi = {
  drivers: () => apiClient.get<DriverPerformanceReport>(`${r.reports}/drivers`),
  bookings: () => apiClient.get<BookingSummaryReport>(`${r.reports}/bookings`),
  revenue: () => apiClient.get<RevenueReport>(`${r.reports}/revenue`),
  passengers: () => apiClient.get<PassengerActivityReport>(`${r.reports}/passengers`),
};

// ─── Audit Logs ──────────────────────────────────────────────────────────────

export const auditLogsApi = {
  list: (params?: {
    action?: AuditAction;
    entityType?: EntityType;
    performedBy?: string;
    from?: string;
    to?: string;
    page?: number;
    size?: number;
  }) => {
    const q = new URLSearchParams();
    if (params?.action) q.set('action', params.action);
    if (params?.entityType) q.set('entityType', params.entityType);
    if (params?.performedBy) q.set('performedBy', params.performedBy);
    if (params?.from) q.set('from', params.from);
    if (params?.to) q.set('to', params.to);
    q.set('page', String(params?.page ?? 0));
    q.set('size', String(params?.size ?? 20));
    // Audit logs are served from the reports controller path
    return apiClient.get<Page<AuditLogResponse>>(`${r.reports}/audit-logs?${q}`);
  },
  get: (id: string) =>
    apiClient.get<AuditLogResponse>(`${r.reports}/audit-logs/${id}`),
};
