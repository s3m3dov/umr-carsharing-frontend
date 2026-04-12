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

  // Calculate tomorrow at 12:00 for default value
  const getTomorrowAtNoon = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    date.setHours(12, 0, 0, 0);
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [tripData, setTripData] = useState<OfferRideDTO>({
    vehicleNumber: '',
    sourceAddress: {
      latitude: 50.8093,
      longitude: 8.7707,
      placeAddress: 'Philipps University of Marburg',
    },
    destinationAddress: {
      latitude: 50.1272,
      longitude: 8.6654,
      placeAddress: 'Goethe University Frankfurt',
    },
    tripStartDateTime: getTomorrowAtNoon(),
    totalSeats: 4,
    pricePerSeat: 5,
  });

  const { data: vehicles } = useQuery({
    queryKey: ['vehicles', userId],
    queryFn: () => userApi.getVehicles(userId!),
    enabled: !!userId,
  });

  const handleVehicleChange = (value: string) => {
    const selectedVehicle = vehicles?.find(v => v.value === value);
    const capacity = selectedVehicle?.seatingCapacity ? parseInt(selectedVehicle.seatingCapacity) : 4;
    
    setTripData({
      ...tripData,
      vehicleNumber: value,
      totalSeats: capacity,
    });
  };

  const createTripMutation = useMutation({
    mutationFn: (data: OfferRideDTO) => userApi.createTrip(userId!, data),
    onSuccess: () => {
      toast({
        title: 'Trip created successfully!',
        description: 'Your trip has been posted and is now available for others to join.',
      });
      setTripData({
        vehicleNumber: '',
        sourceAddress: { latitude: 0, longitude: 0, placeAddress: '' },
        destinationAddress: { latitude: 0, longitude: 0, placeAddress: '' },
        tripStartDateTime: getTomorrowAtNoon(),
        totalSeats: 4,
        pricePerSeat: 5,
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
    if (!tripData.sourceAddress.placeAddress || !tripData.destinationAddress.placeAddress || !tripData.tripStartDateTime || !tripData.vehicleNumber) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    
    // Convert datetime-local to ISO string
    const tripStartDateTime = new Date(tripData.tripStartDateTime).toISOString();
    createTripMutation.mutate({
      ...tripData,
      tripStartDateTime,
    });
  };

  const handleSourceChange = (address: string, lat?: number, lng?: number) => {
    setTripData(prevData => ({
      ...prevData,
      sourceAddress: {
        latitude: lat || 0,
        longitude: lng || 0,
        placeAddress: address,
      }
    }));
  };

  const handleDestinationChange = (address: string, lat?: number, lng?: number) => {
    setTripData(prevData => ({
      ...prevData,
      destinationAddress: {
        latitude: lat || 0,
        longitude: lng || 0,
        placeAddress: address,
      }
    }));
  };

  const vehiclesData = vehicles || [];

  // Prepare map markers
  const mapMarkers = [];
  if (tripData.sourceAddress.latitude && tripData.sourceAddress.longitude) {
    mapMarkers.push({
      position: {
        lat: tripData.sourceAddress.latitude,
        lng: tripData.sourceAddress.longitude
      },
      title: 'Departure',
      info: tripData.sourceAddress.placeAddress
    });
  }

  if (tripData.destinationAddress.latitude && tripData.destinationAddress.longitude) {
    mapMarkers.push({
      position: {
        lat: tripData.destinationAddress.latitude,
        lng: tripData.destinationAddress.longitude
      },
      title: 'Destination',
      info: tripData.destinationAddress.placeAddress
    });
  }


  return (
    <Layout>
      <div className="p-6 space-y-6">
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
                  <Label htmlFor="create-pickup-location">Departure Location</Label>
                  <PlacesAutocomplete
                      id="create-pickup-location"
                      value={tripData.sourceAddress.placeAddress || ''}
                      onChange={handleSourceChange}
                      placeholder="Enter departure location"
                      required
                  />
                </div>
                <div>
                  <Label htmlFor="create-destination-location">Destination</Label>
                  <PlacesAutocomplete
                      id="create-destination-location"
                      value={tripData.destinationAddress.placeAddress || ''}
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="datetime">Trip Start Time *</Label>
                  <Input
                    id="datetime"
                    type="datetime-local"
                    value={tripData.tripStartDateTime}
                    onChange={(e) => setTripData({...tripData, tripStartDateTime: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="seats">Total Seats *</Label>
                  <Input
                    id="seats"
                    type="number"
                    min="1"
                    max="8"
                    value={tripData.totalSeats}
                    onChange={(e) => setTripData({...tripData, totalSeats: parseInt(e.target.value)})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price Per Seat (€) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.5"
                    value={tripData.pricePerSeat}
                    onChange={(e) => setTripData({...tripData, pricePerSeat: parseFloat(e.target.value)})}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="vehicle">Select Vehicle *</Label>
                <Select
                  value={tripData.vehicleNumber}
                  onValueChange={handleVehicleChange}
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
                          <span>{vehicle.text} ({vehicle.value}) {vehicle.seatingCapacity ? `- ${vehicle.seatingCapacity} seats` : ''}</span>
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
