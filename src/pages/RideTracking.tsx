
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { driverApi as userApi } from '@/shared/api/driver-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { getBackendErrorMessage } from '@/shared/api/error-toast';
import Layout from '@/components/Layout';
import {
  MapPin,
  Clock,
  Users,
  Car,
  Navigation,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { RideBasicInfoDTO } from '@/types/api';
import { useQuery } from '@tanstack/react-query';

export default function RideTracking() {
  const { userId } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedRide, setSelectedRide] = useState<RideBasicInfoDTO | null>(null);

  // Fetch upcoming rides
  const { data: upcomingRidesResponse, refetch } = useQuery({
    queryKey: ['upcoming-rides', userId],
    queryFn: () => userApi.getUpcomingRides(userId!),
    enabled: !!userId,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });

  const upcomingRides = upcomingRidesResponse || [];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'active':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString();
  };

  const handleCancelRide = async (tripId: string) => {
    try {
      await userApi.cancelRide(userId!, { tripId, cancellationReason: 'User cancelled' });
      toast({
        title: 'Ride Cancelled',
        description: 'Your ride has been successfully cancelled.',
      });
      refetch();
    } catch (error) {
      const message = getBackendErrorMessage(error, 'Failed to cancel ride.');
      toast({
        title: 'Cancellation Failed',
        description: message,
        variant: 'destructive',
      });
    }
  };

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Track Your Rides</h1>
          <p className="text-muted-foreground">Monitor your active and upcoming rides in real-time</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ride List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Active & Upcoming Rides</h2>
            
            {upcomingRides.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Car className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Active Rides</h3>
                  <p className="text-muted-foreground mb-4">
                    You don't have any active or upcoming rides at the moment.
                  </p>
                  <Button onClick={() => navigate('/offer-ride')}>
                    Offer a Ride
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {upcomingRides.map((ride) => (
                  <Card 
                    key={ride.tripId} 
                    className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                      selectedRide?.tripId === ride.tripId ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedRide(ride)}
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <Navigation className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">Trip #{ride.tripId.slice(-6)}</h3>
                            <div className="flex items-center space-x-2">
                              <Badge className={getStatusColor(ride.tripStatus)}>
                                {getStatusIcon(ride.tripStatus)}
                                <span className="ml-1">{ride.tripStatus}</span>
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                            <Car className="h-4 w-4" />
                            <span>{ride.vehicleNumber}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-green-600" />
                          <span className="text-sm">
                            {ride.pickupPoint.placeAddress || `${ride.pickupPoint.latitude}, ${ride.pickupPoint.longitude}`}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-red-600" />
                          <span className="text-sm">
                            {ride.destinationPoint.placeAddress || `${ride.destinationPoint.latitude}, ${ride.destinationPoint.longitude}`}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span className="text-sm">{formatDateTime(ride.rideStartTime)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-purple-600" />
                          <span className="text-sm">{ride.seats} seats</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRide(ride);
                          }}
                        >
                          View Details
                        </Button>
                        {ride.tripStatus.toLowerCase() !== 'completed' && ride.tripStatus.toLowerCase() !== 'cancelled' && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelRide(ride.tripId);
                            }}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Ride Details Panel */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Ride Details</h2>
            
            {selectedRide ? (
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Navigation className="h-5 w-5" />
                    <span>Trip #{selectedRide.tripId.slice(-6)}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status</span>
                    <Badge className={getStatusColor(selectedRide.tripStatus)}>
                      {getStatusIcon(selectedRide.tripStatus)}
                      <span className="ml-1">{selectedRide.tripStatus}</span>
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">From</label>
                      <p className="text-sm">
                        {selectedRide.pickupPoint.placeAddress || `${selectedRide.pickupPoint.latitude}, ${selectedRide.pickupPoint.longitude}`}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">To</label>
                      <p className="text-sm">
                        {selectedRide.destinationPoint.placeAddress || `${selectedRide.destinationPoint.latitude}, ${selectedRide.destinationPoint.longitude}`}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Departure</label>
                      <p className="text-sm">{formatDateTime(selectedRide.rideStartTime)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Vehicle</label>
                      <p className="text-sm">{selectedRide.vehicleNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Seats</label>
                      <p className="text-sm">{selectedRide.seats}</p>
                    </div>
                  </div>

                  <div className="pt-4 space-y-2">
                    {selectedRide.tripStatus.toLowerCase() !== 'completed' && selectedRide.tripStatus.toLowerCase() !== 'cancelled' && (
                      <Button
                        className="w-full"
                        variant="destructive"
                        onClick={() => handleCancelRide(selectedRide.tripId)}
                      >
                        Cancel Ride
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Select a ride from the list to view details and track its status.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
