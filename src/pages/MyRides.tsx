
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { passengerApi as userApi } from '@/shared/api/passenger-api';
import { RideBasicInfoDTO, CancelRideRequestDTO } from '@/types/api';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { getBackendErrorMessage } from '@/shared/api/error-toast';
import { MapPin, Clock, Car, Users, X, Map } from 'lucide-react';
import GoogleMap from '@/components/GoogleMap';

export default function MyRides() {
  const { userId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const cancelRideMutation = useMutation({
    mutationFn: ({ tripId, reason }: { tripId: string; reason?: string }) => {
      const cancelData: CancelRideRequestDTO = {
        tripId,
        cancellationReason: reason
      };
      return userApi.cancelRide(userId!, cancelData);
    },
    onSuccess: () => {
      toast({
        title: 'Ride cancelled',
        description: 'Your ride has been successfully cancelled.',
      });
      queryClient.invalidateQueries({ queryKey: ['upcomingRides', userId] });
      queryClient.invalidateQueries({ queryKey: ['historyRides', userId] });
    },
    onError: (error) => {
      const message = getBackendErrorMessage(error, 'Failed to cancel ride');
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    },
  });

  const handleCancelRide = async (tripId: string) => {
    if (window.confirm('Are you sure you want to cancel this ride?')) {
      cancelRideMutation.mutate({ tripId });
    }
  };

  const RideCard = ({ ride, showCancelButton = false }: { ride: RideBasicInfoDTO; showCancelButton?: boolean }) => {
    const [showMap, setShowMap] = useState(false);
    const mapMarkers = [
      {
        position: { lat: ride.pickupPoint.latitude, lng: ride.pickupPoint.longitude },
        title: 'Pickup',
        info: `<strong>Pickup</strong><br/>${ride.pickupPoint.placeAddress ?? ''}`,
      },
      {
        position: { lat: ride.destinationPoint.latitude, lng: ride.destinationPoint.longitude },
        title: 'Destination',
        info: `<strong>Destination</strong><br/>${ride.destinationPoint.placeAddress ?? ''}`,
      },
    ];

    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div className="space-y-2 flex-1">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {ride.pickupPoint.placeAddress} → {ride.destinationPoint.placeAddress}
                </span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{new Date(ride.rideStartTime).toLocaleString()}</span>
                </div>
                {ride.vehicleNumber && (
                  <div className="flex items-center space-x-1">
                    <Car className="h-4 w-4" />
                    <span>{ride.vehicleNumber}</span>
                  </div>
                )}
              </div>
              {ride.seats && (
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{ride.seats}</span>
                </div>
              )}
              <div className="inline-block">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  ride.tripStatus === 'ALLOTTED' ? 'bg-green-100 text-green-800' :
                  ride.tripStatus === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                  ride.tripStatus === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {ride.tripStatus}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-4 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMap((v) => !v)}
              >
                <Map className="h-4 w-4 mr-1" />
                {showMap ? 'Hide Map' : 'Map'}
              </Button>
              {showCancelButton && ride.tripStatus === 'ALLOTTED' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCancelRide(ride.tripId)}
                  disabled={cancelRideMutation.isPending}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              )}
            </div>
          </div>
          {showMap && (
            <div className="mt-4">
              <GoogleMap markers={mapMarkers} className="w-full h-52 rounded-md overflow-hidden" />
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Rides</h1>
          <p className="text-muted-foreground">Manage your ride bookings</p>
        </div>

        <Tabs defaultValue="upcoming" className="space-y-4">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming Rides</TabsTrigger>
            <TabsTrigger value="history">Ride History</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {loadingUpcoming ? (
              <div className="text-center py-8">Loading upcoming rides...</div>
            ) : upcomingRides && upcomingRides.length > 0 ? (
              <div className="space-y-4">
                {upcomingRides.map((ride) => (
                  <RideCard key={ride.tripId} ride={ride} showCancelButton={true} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No upcoming rides found.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {loadingHistory ? (
              <div className="text-center py-8">Loading ride history...</div>
            ) : historyRides && historyRides.length > 0 ? (
              <div className="space-y-4">
                {historyRides.map((ride) => (
                  <RideCard key={ride.tripId} ride={ride} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No ride history found.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
