
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { driverApi as userApi } from '@/shared/api/driver-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getBackendErrorMessage } from '@/shared/api/error-toast';
import Layout from '@/components/Layout';
import PlacesAutocomplete from '@/components/PlacesAutocomplete';
import { 
  Plus, 
  MapPin, 
  Clock, 
  Users, 
  Car,
  CheckCircle
} from 'lucide-react';
import { Points, OfferRideDTO, VehicleResponseDTO } from '@/types/api';
import { useQuery } from '@tanstack/react-query';

export default function RideOffering() {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [pickupPoint, setPickupPoint] = useState<Points | null>(null);
  const [destinationPoint, setDestinationPoint] = useState<Points | null>(null);
  const [pickupAddress, setPickupAddress] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [tripStartTime, setTripStartTime] = useState('');
  const [offeredSeats, setOfferedSeats] = useState(1);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Fetch user vehicles
  const { data: vehiclesResponse } = useQuery({
    queryKey: ['vehicles', userId],
    queryFn: () => userApi.getVehicles(userId!),
    enabled: !!userId,
  });

  const vehicles = vehiclesResponse || [];

  const handlePickupChange = (address: string, lat?: number, lng?: number) => {
    setPickupAddress(address);
    if (lat !== undefined && lng !== undefined) {
      setPickupPoint({
        latitude: lat,
        longitude: lng,
        placeAddress: address
      });
    }
  };

  const handleDestinationChange = (address: string, lat?: number, lng?: number) => {
    setDestinationAddress(address);
    if (lat !== undefined && lng !== undefined) {
      setDestinationPoint({
        latitude: lat,
        longitude: lng,
        placeAddress: address
      });
    }
  };

  const handleCreateTrip = async () => {
    if (!pickupPoint || !destinationPoint || !tripStartTime || !selectedVehicle) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);
    try {
      const tripData: OfferRideDTO = {
        vehicleNumber: selectedVehicle,
        pickupPoint,
        destinationPoint,
        tripStartTime,
        offeredSeats,
      };

      await userApi.createTrip(userId!, tripData);
      toast({
        title: 'Trip Created!',
        description: 'Your ride has been successfully created and is now available for booking.',
      });
      navigate('/my-rides');
    } catch (error) {
      const message = getBackendErrorMessage(error, 'Failed to create trip.');
      toast({
        title: 'Creation Failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Offer a Ride</h1>
          <p className="text-muted-foreground">Share your journey and help others get around</p>
        </div>

        {/* Create Trip Form */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Create New Trip</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Route Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Route Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pickup">Pickup Location</Label>
                  <PlacesAutocomplete
                    value={pickupAddress}
                    onChange={handlePickupChange}
                    placeholder="Enter pickup location"
                  />
                </div>
                <div>
                  <Label htmlFor="destination">Destination</Label>
                  <PlacesAutocomplete
                    value={destinationAddress}
                    onChange={handleDestinationChange}
                    placeholder="Enter destination"
                  />
                </div>
              </div>
            </div>

            {/* Trip Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Trip Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="datetime">Departure Time</Label>
                  <Input
                    id="datetime"
                    type="datetime-local"
                    value={tripStartTime}
                    onChange={(e) => setTripStartTime(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>
                <div>
                  <Label htmlFor="seats">Available Seats</Label>
                  <Input
                    id="seats"
                    type="number"
                    min="1"
                    max="8"
                    value={offeredSeats}
                    onChange={(e) => setOfferedSeats(parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="vehicle">Select Vehicle</Label>
                  <Select onValueChange={setSelectedVehicle}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose your vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map((vehicle) => (
                        <SelectItem key={vehicle.value} value={vehicle.value}>
                          {vehicle.text}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Trip Preview */}
            {pickupPoint && destinationPoint && tripStartTime && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Trip Preview</h3>
                <Card className="border-dashed border-2 border-primary/20 bg-primary/5">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-green-600" />
                        <span className="text-sm">
                          <strong>From:</strong> {pickupPoint.placeAddress || `${pickupPoint.latitude}, ${pickupPoint.longitude}`}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-red-600" />
                        <span className="text-sm">
                          <strong>To:</strong> {destinationPoint.placeAddress || `${destinationPoint.latitude}, ${destinationPoint.longitude}`}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">
                          <strong>Departure:</strong> {new Date(tripStartTime).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-purple-600" />
                        <span className="text-sm">
                          <strong>Available Seats:</strong> {offeredSeats}
                        </span>
                      </div>
                      {selectedVehicle && (
                        <div className="flex items-center space-x-2">
                          <Car className="h-4 w-4 text-orange-600" />
                          <span className="text-sm">
                            <strong>Vehicle:</strong> {vehicles.find(v => v.value === selectedVehicle)?.text}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <Button 
              onClick={handleCreateTrip}
              disabled={isCreating}
              className="w-full bg-primary hover:bg-primary/90 py-3"
            >
              {isCreating ? 'Creating Trip...' : 'Create Trip'}
            </Button>
          </CardContent>
        </Card>

        {/* No Vehicles Warning */}
        {vehicles.length === 0 && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-6 text-center">
              <Car className="h-12 w-12 text-yellow-600 mx-auto mb-3" />
              <h3 className="font-semibold text-yellow-800 mb-2">No Vehicles Found</h3>
              <p className="text-yellow-700 mb-4">
                You need to register a vehicle before you can offer rides.
              </p>
              <Button
                onClick={() => navigate('/vehicles')}
                variant="outline"
                className="border-yellow-600 text-yellow-600 hover:bg-yellow-100"
              >
                Register Vehicle
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Benefits Section */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Benefits of Offering Rides</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm">Reduce travel costs</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm">Help the environment</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm">Meet new people</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
