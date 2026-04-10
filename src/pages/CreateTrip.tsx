import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { driverApi as userApi } from '@/shared/api/driver-api';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getBackendErrorMessage } from '@/shared/api/error-toast';
import { Plus, Car } from 'lucide-react';
import { OfferRideDTO } from '@/types/api';
import PlacesAutocomplete from '@/components/PlacesAutocomplete';
import GoogleMap from '@/components/GoogleMap';

export default function CreateTrip() {
  const { userId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [tripData, setTripData] = useState<OfferRideDTO>({
    vehicleNumber: '',
    pickupPoint: {
      latitude: 0,
      longitude: 0,
      placeAddress: '',
    },
    destinationPoint: {
      latitude: 0,
      longitude: 0,
      placeAddress: '',
    },
    tripStartTime: '',
    offeredSeats: 1,
  });

  const { data: vehicles } = useQuery({
    queryKey: ['vehicles', userId],
    queryFn: () => userApi.getVehicles(userId!),
    enabled: !!userId,
  });

  const createTripMutation = useMutation({
    mutationFn: (data: OfferRideDTO) => userApi.createTrip(userId!, data),
    onSuccess: () => {
      toast({
        title: 'Trip created successfully!',
        description: 'Your trip has been posted and is now available for others to join.',
      });
      setTripData({
        vehicleNumber: '',
        pickupPoint: { latitude: 0, longitude: 0, placeAddress: '' },
        destinationPoint: { latitude: 0, longitude: 0, placeAddress: '' },
        tripStartTime: '',
        offeredSeats: 1,
      });
      queryClient.invalidateQueries({ queryKey: ['upcomingRides'] });
    },
    onError: (error) => {
      const message = getBackendErrorMessage(error, 'Failed to create trip. Please try again.');
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripData.pickupPoint.placeAddress || !tripData.destinationPoint.placeAddress || !tripData.tripStartTime || !tripData.vehicleNumber) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    
    // Convert datetime-local to ISO string
    const tripStartTime = new Date(tripData.tripStartTime).toISOString();
    createTripMutation.mutate({
      ...tripData,
      tripStartTime,
    });
  };

  const handlePickupChange = (address: string, lat?: number, lng?: number) => {
    setTripData(prevData => ({
      ...prevData,
      pickupPoint: {
        latitude: lat || 0,
        longitude: lng || 0,
        placeAddress: address,
      }
    }));
  };

  const handleDestinationChange = (address: string, lat?: number, lng?: number) => {
    setTripData(prevData => ({
      ...prevData,
      destinationPoint: {
        latitude: lat || 0,
        longitude: lng || 0,
        placeAddress: address,
      }
    }));
  };

  const vehiclesData = vehicles || [];

  // Prepare map markers
  const mapMarkers = [];
  if (tripData.pickupPoint.latitude && tripData.pickupPoint.longitude) {
    mapMarkers.push({
      position: {
        lat: tripData.pickupPoint.latitude,
        lng: tripData.pickupPoint.longitude
      },
      title: 'Pickup',
      info: tripData.pickupPoint.placeAddress
    });
  }

  if (tripData.destinationPoint.latitude && tripData.destinationPoint.longitude) {
    mapMarkers.push({
      position: {
        lat: tripData.destinationPoint.latitude,
        lng: tripData.destinationPoint.longitude
      },
      title: 'Destination',
      info: tripData.destinationPoint.placeAddress
    });
  }


  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Create Trip</h1>
          <p className="text-muted-foreground">Offer a ride to help others reach their destination</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Trip Details</span>
            </CardTitle>
            <CardDescription>
              Fill in the details of your trip to make it available for others to join
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="create-pickup-location">Pickup Location</Label>
                  <PlacesAutocomplete
                      id="create-pickup-location"
                      value={tripData.pickupPoint.placeAddress}
                      onChange={handlePickupChange}
                      placeholder="Enter pickup location"
                      required
                  />
                </div>
                <div>
                  <Label htmlFor="create-destination-location">Destination</Label>
                  <PlacesAutocomplete
                      id="create-destination-location"
                      value={tripData.destinationPoint.placeAddress}
                      onChange={handleDestinationChange}
                      placeholder="Enter destination"
                      required
                  />
                </div>
              </div>

              {/* Map View */}
              {mapMarkers.length > 0 && (
                <div className="space-y-2">
                  <Label>Route Preview</Label>
                  <GoogleMap
                    markers={mapMarkers}
                    className="w-full h-64 rounded-lg border"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="datetime">Trip Start Time *</Label>
                  <Input
                    id="datetime"
                    type="datetime-local"
                    value={tripData.tripStartTime}
                    onChange={(e) => setTripData({...tripData, tripStartTime: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="seats">Offered Seats *</Label>
                  <Input
                    id="seats"
                    type="number"
                    min="1"
                    max="8"
                    value={tripData.offeredSeats}
                    onChange={(e) => setTripData({...tripData, offeredSeats: parseInt(e.target.value)})}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="vehicle">Select Vehicle *</Label>
                <Select

                  value={tripData.vehicleNumber}
                  onValueChange={(value) => setTripData({...tripData, vehicleNumber: value})}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose your vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehiclesData.map((vehicle) => (
                      <SelectItem key={vehicle.value} value={vehicle.value}>
                        <div className="flex items-center space-x-2">
                          <Car className="h-4 w-4" />
                          <span>{vehicle.text} ({vehicle.value})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {vehiclesData.length === 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    No vehicles found. Please add a vehicle first.
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                disabled={createTripMutation.isPending || vehiclesData.length === 0}
                className="w-full"
              >
                {createTripMutation.isPending ? 'Creating Trip...' : 'Create Trip'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
