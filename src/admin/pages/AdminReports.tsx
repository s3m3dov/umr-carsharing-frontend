import { useQueries } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  RefreshCw,
  Users,
  CalendarCheck,
  DollarSign,
  Activity,
} from 'lucide-react';
import { reportsApi } from '@/admin/api';
import type {
  DriverPerformanceReport,
  BookingSummaryReport,
  RevenueReport,
  PassengerActivityReport,
} from '@/admin/types';

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function fmt(amount: number) {
  return `€${amount.toFixed(2)}`;
}

export default function AdminReports() {
  const [driversQ, bookingsQ, revenueQ, passengersQ] = useQueries({
    queries: [
      {
        queryKey: ['admin-report-drivers'],
        queryFn: () => reportsApi.drivers(),
      },
      {
        queryKey: ['admin-report-bookings'],
        queryFn: () => reportsApi.bookings(),
      },
      {
        queryKey: ['admin-report-revenue'],
        queryFn: () => reportsApi.revenue(),
      },
      {
        queryKey: ['admin-report-passengers'],
        queryFn: () => reportsApi.passengers(),
      },
    ],
  });

  const refreshAll = () => {
    driversQ.refetch();
    bookingsQ.refetch();
    revenueQ.refetch();
    passengersQ.refetch();
  };

  const drivers = driversQ.data as DriverPerformanceReport | undefined;
  const bookings = bookingsQ.data as BookingSummaryReport | undefined;
  const revenue = revenueQ.data as RevenueReport | undefined;
  const passengers = passengersQ.data as PassengerActivityReport | undefined;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reports &amp; Analytics</h1>
        <Button variant="outline" size="sm" onClick={refreshAll} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh All
        </Button>
      </div>

      {/* 2x2 grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Driver Performance */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4 text-muted-foreground" />
              Driver Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {driversQ.isLoading && (
              <p className="text-sm text-muted-foreground">Loading...</p>
            )}
            {driversQ.isError && (
              <p className="text-sm text-destructive">Failed to load driver report.</p>
            )}
            {drivers && (
              <>
                <StatRow label="Total Drivers" value={drivers.totalDrivers} />
                <Separator />
                <StatRow label="Trips Completed" value={drivers.totalTripsCompleted} />
                <Separator />
                <StatRow label="Trips Cancelled" value={drivers.totalTripsCancelled} />
                <Separator />
                <StatRow label="In Progress" value={drivers.totalTripsInProgress} />
                <Separator />
                <StatRow label="Available" value={drivers.totalTripsAvailable} />
              </>
            )}
          </CardContent>
        </Card>

        {/* Card 2: Booking Summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarCheck className="h-4 w-4 text-muted-foreground" />
              Booking Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bookingsQ.isLoading && (
              <p className="text-sm text-muted-foreground">Loading...</p>
            )}
            {bookingsQ.isError && (
              <p className="text-sm text-destructive">Failed to load booking report.</p>
            )}
            {bookings && (
              <>
                <StatRow label="Total Bookings" value={bookings.totalBookings} />
                <Separator />
                <StatRow label="Confirmed" value={bookings.confirmedBookings} />
                <Separator />
                <StatRow label="Cancelled" value={bookings.cancelledBookings} />
                <Separator />
                <StatRow label="Requested" value={bookings.requestedBookings} />
                <Separator />
                <StatRow label="Completed" value={bookings.completedBookings} />
                <Separator />
                <StatRow label="Rejected" value={bookings.rejectedBookings} />
              </>
            )}
          </CardContent>
        </Card>

        {/* Card 3: Revenue */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            {revenueQ.isLoading && (
              <p className="text-sm text-muted-foreground">Loading...</p>
            )}
            {revenueQ.isError && (
              <p className="text-sm text-destructive">Failed to load revenue report.</p>
            )}
            {revenue && (
              <>
                <StatRow
                  label="Total Completed Bookings"
                  value={revenue.totalCompletedBookings}
                />
                <Separator />
                <StatRow label="Total Revenue" value={fmt(revenue.totalRevenue)} />
                <Separator />
                <StatRow
                  label="Avg Revenue / Booking"
                  value={fmt(revenue.averageRevenuePerBooking)}
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* Card 4: Passenger Activity */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4 text-muted-foreground" />
              Passenger Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {passengersQ.isLoading && (
              <p className="text-sm text-muted-foreground">Loading...</p>
            )}
            {passengersQ.isError && (
              <p className="text-sm text-destructive">Failed to load passenger report.</p>
            )}
            {passengers && (
              <>
                <StatRow label="Total Bookings" value={passengers.totalBookings} />
                <Separator />
                <StatRow label="Active" value={passengers.activeBookings} />
                <Separator />
                <StatRow label="Completed" value={passengers.completedBookings} />
                <Separator />
                <StatRow label="Cancelled" value={passengers.cancelledBookings} />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
