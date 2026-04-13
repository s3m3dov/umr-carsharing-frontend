import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { driverApi } from '@/shared/api/driver-api';
import { passengerApi } from '@/shared/api/passenger-api';
import { RideBasicInfoDTO, RideLifecycleStatus, UserRole } from '@/types/api';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Clock, Car, Users, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

function getRideStatusClass(status: string): string {
  switch (status.toUpperCase()) {
    case RideLifecycleStatus.ALLOTTED:
    case RideLifecycleStatus.CONFIRMED:
    case RideLifecycleStatus.AVAILABLE:
      return 'bg-green-500/10 text-green-700 border-green-200';
    case RideLifecycleStatus.CANCELLED:
      return 'bg-red-500/10 text-red-700 border-red-200';
    case RideLifecycleStatus.COMPLETED:
      return 'bg-secondary text-secondary-foreground border-border';
    case RideLifecycleStatus.IN_PROGRESS:
      return 'bg-blue-500/10 text-blue-700 border-blue-200';
    default:
      return 'bg-gray-500/10 text-gray-700 border-gray-200';
  }
}

function RideCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/4" />
      </CardContent>
    </Card>
  );
}

export default function MyRides() {
  const { userId, role } = useAuth();
  const navigate = useNavigate();

  const userApi = role === UserRole.DRIVER ? driverApi : passengerApi;

  const { data: upcomingRides, isLoading: loadingUpcoming } = useQuery({
    queryKey: ['upcomingRides', userId],
    queryFn: () => userApi.getUpcomingRides(userId!),
    enabled: !!userId,
  });

  const { data: historyRides, isLoading: loadingHistory } = useQuery({
    queryKey: ['historyRides', userId],
    queryFn: () => userApi.getHistoryRides(userId!),
    enabled: !!userId,
  });

  const RideCard = ({ ride }: { ride: RideBasicInfoDTO }) => {
    const detailUrl = `/my-rides/${ride.rideId ?? ride.tripId}`;
    
    return (
      <Card 
        className="group cursor-pointer hover:border-border/80 transition-all duration-150 hover:shadow-md hover:-translate-y-0.5"
        onClick={() => navigate(detailUrl)}
      >
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row md:items-stretch">
            {/* Date/Time Sidebar */}
            <div className="bg-muted/30 md:w-28 p-4 flex md:flex-col justify-between md:justify-center items-center border-b md:border-b-0 md:border-r text-center gap-1">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                {new Date(ride.rideStartTime).toLocaleDateString(undefined, { month: 'short' })}
              </div>
              <div className="text-xl font-bold text-foreground">
                {new Date(ride.rideStartTime).getDate()}
              </div>
              <div className="text-[10px] font-medium text-muted-foreground">
                {new Date(ride.rideStartTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-tight border ${getRideStatusClass(ride.tripStatus)}`}>
                  {ride.tripStatus}
                </div>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Car className="h-3.5 w-3.5" />
                    <span>{ride.vehicleNumber}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    <span>{ride.seats} seats</span>
                  </div>
                </div>
              </div>

              <div className="relative pl-5 space-y-3">
                <div className="absolute left-[4px] top-[6px] bottom-[6px] w-0.5 bg-border" />
                <div className="relative">
                  <div className="absolute -left-[23px] top-1 w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-background" />
                  <p className="text-sm font-semibold leading-tight line-clamp-1">
                    {ride.pickupPoint.placeAddress ?? `${ride.pickupPoint.latitude.toFixed(4)}, ${ride.pickupPoint.longitude.toFixed(4)}`}
                  </p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[23px] top-1 w-2 h-2 rounded-full bg-rose-500 ring-4 ring-background" />
                  <p className="text-sm font-semibold leading-tight line-clamp-1">
                    {ride.destinationPoint.placeAddress ?? `${ride.destinationPoint.latitude.toFixed(4)}, ${ride.destinationPoint.longitude.toFixed(4)}`}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="hidden md:flex items-center px-3 bg-muted/5 border-l">
              <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const subtitle = role === UserRole.DRIVER ? 'Manage your offered rides' : 'Manage your ride bookings';

  return (
    <Layout>
      <div className="p-6 space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">My Rides</h1>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <Button asChild variant="outline" size="sm" className="hidden sm:flex font-semibold">
            <Link to={role === UserRole.DRIVER ? "/offer-ride" : "/find-rides"}>
              {role === UserRole.DRIVER ? "New Offer" : "Find Rides"}
            </Link>
          </Button>
        </div>

        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="upcoming" className="px-6 text-xs font-semibold">Upcoming</TabsTrigger>
            <TabsTrigger value="history" className="px-6 text-xs font-semibold">History</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4 outline-none">
            {loadingUpcoming ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RideCardSkeleton />
                <RideCardSkeleton />
              </div>
            ) : upcomingRides && upcomingRides.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {upcomingRides.map((ride) => (
                  <RideCard key={ride.rideId ?? ride.tripId} ride={ride} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed rounded-xl bg-muted/5">
                <Car className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No upcoming rides found.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4 outline-none">
            {loadingHistory ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RideCardSkeleton />
                <RideCardSkeleton />
              </div>
            ) : historyRides && historyRides.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {historyRides.map((ride) => (
                  <RideCard key={ride.rideId ?? ride.tripId} ride={ride} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed rounded-xl bg-muted/5">
                <Car className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No ride history found.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
