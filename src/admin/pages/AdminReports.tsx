import { useQueries } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  RefreshCw,
  UserCheck,
  CalendarCheck,
  Euro,
  Users,
} from 'lucide-react';
import { reportsApi } from '@/admin/api';
import type {
  DriverPerformanceReport,
  BookingSummaryReport,
  RevenueReport,
  PassengerActivityReport,
} from '@/admin/types';

function fmt(amount: number) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR' }).format(amount);
}

function fmtNum(n: number) {
  return new Intl.NumberFormat().format(n);
}

// ─── Stat grid inside a card ─────────────────────────────────────────────────

interface Stat {
  label: string;
  value: string | number;
  highlight?: boolean;
}

function StatGrid({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
      {stats.map(({ label, value, highlight }) => (
        <div key={label}>
          <p className={highlight
            ? 'text-2xl font-bold tabular-nums'
            : 'text-xl font-semibold tabular-nums text-foreground/90'
          }>
            {typeof value === 'number' ? fmtNum(value) : value}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
        </div>
      ))}
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="space-y-3">
      {[80, 60, 80, 60].map((w, i) => (
        <Skeleton key={i} className="h-8 rounded" style={{ width: `${w}%` }} />
      ))}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AdminReports() {
  const [driversQ, bookingsQ, revenueQ, passengersQ] = useQueries({
    queries: [
      { queryKey: ['admin-report-drivers'],    queryFn: () => reportsApi.drivers() },
      { queryKey: ['admin-report-bookings'],   queryFn: () => reportsApi.bookings() },
      { queryKey: ['admin-report-revenue'],    queryFn: () => reportsApi.revenue() },
      { queryKey: ['admin-report-passengers'], queryFn: () => reportsApi.passengers() },
    ],
  });

  const refreshAll = () => {
    driversQ.refetch();
    bookingsQ.refetch();
    revenueQ.refetch();
    passengersQ.refetch();
  };

  const drivers    = driversQ.data    as DriverPerformanceReport    | undefined;
  const bookings   = bookingsQ.data   as BookingSummaryReport       | undefined;
  const revenue    = revenueQ.data    as RevenueReport              | undefined;
  const passengers = passengersQ.data as PassengerActivityReport    | undefined;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reports &amp; Analytics</h1>
        <Button variant="outline" size="sm" onClick={refreshAll} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Driver Performance */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              <UserCheck className="h-4 w-4" />
              Driver Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {driversQ.isLoading && <CardSkeleton />}
            {driversQ.isError && <p className="text-sm text-destructive">Failed to load.</p>}
            {drivers && (
              <StatGrid stats={[
                { label: 'Total Drivers',     value: drivers.totalDrivers,          highlight: true },
                { label: 'Trips Completed',   value: drivers.totalTripsCompleted,   highlight: true },
                { label: 'In Progress',       value: drivers.totalTripsInProgress },
                { label: 'Available',         value: drivers.totalTripsAvailable },
                { label: 'Cancelled',         value: drivers.totalTripsCancelled },
              ]} />
            )}
          </CardContent>
        </Card>

        {/* Booking Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              <CalendarCheck className="h-4 w-4" />
              Booking Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bookingsQ.isLoading && <CardSkeleton />}
            {bookingsQ.isError && <p className="text-sm text-destructive">Failed to load.</p>}
            {bookings && (
              <StatGrid stats={[
                { label: 'Total Bookings', value: bookings.totalBookings,     highlight: true },
                { label: 'Confirmed',      value: bookings.confirmedBookings, highlight: true },
                { label: 'Completed',      value: bookings.completedBookings },
                { label: 'Requested',      value: bookings.requestedBookings },
                { label: 'Cancelled',      value: bookings.cancelledBookings },
                { label: 'Rejected',       value: bookings.rejectedBookings },
              ]} />
            )}
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              <Euro className="h-4 w-4" />
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            {revenueQ.isLoading && <CardSkeleton />}
            {revenueQ.isError && <p className="text-sm text-destructive">Failed to load.</p>}
            {revenue && (
              <StatGrid stats={[
                { label: 'Total Revenue',         value: fmt(revenue.totalRevenue),                  highlight: true },
                { label: 'Avg / Booking',         value: fmt(revenue.averageRevenuePerBooking),      highlight: true },
                { label: 'Completed Bookings',    value: revenue.totalCompletedBookings },
              ]} />
            )}
          </CardContent>
        </Card>

        {/* Passenger Activity */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              <Users className="h-4 w-4" />
              Passenger Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {passengersQ.isLoading && <CardSkeleton />}
            {passengersQ.isError && <p className="text-sm text-destructive">Failed to load.</p>}
            {passengers && (
              <StatGrid stats={[
                { label: 'Total Bookings', value: passengers.totalBookings,    highlight: true },
                { label: 'Active',         value: passengers.activeBookings,   highlight: true },
                { label: 'Completed',      value: passengers.completedBookings },
                { label: 'Cancelled',      value: passengers.cancelledBookings },
              ]} />
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
