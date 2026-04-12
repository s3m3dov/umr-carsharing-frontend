
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

  const [sourceAddress, setSourceAddress] = useState<Points | null>({
    latitude: 50.8093,
    longitude: 8.7707,
    placeAddress: 'Philipps University of Marburg'
  });
  const [destinationAddress, setDestinationAddress] = useState<Points | null>({
    latitude: 50.1272,
    longitude: 8.6654,
    placeAddress: 'Goethe University Frankfurt'
  });
  const [sourceAddressStr, setSourceAddressStr] = useState('Philipps University of Marburg');
  const [destinationAddressStr, setDestinationAddressStr] = useState('Goethe University Frankfurt');
  const [tripStartDateTime, setTripStartDateTime] = useState(getTomorrowAtNoon());
  const [totalSeats, setTotalSeats] = useState(4);
  const [pricePerSeat, setPricePerSeat] = useState(5);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Fetch user vehicles
  const { data: vehiclesResponse } = useQuery({
    queryKey: ['vehicles', userId],
    queryFn: () => userApi.getVehicles(userId!),
    enabled: !!userId,
  });

  const vehicles = vehiclesResponse || [];

  const handleVehicleChange = (value: string) => {
    setSelectedVehicle(value);
    const vehicle = vehicles.find(v => v.value === value);
    if (vehicle?.seatingCapacity) {
      const capacity = parseInt(vehicle.seatingCapacity);
      setTotalSeats(capacity);
    }
  };

  const handleSourceChange = (address: string, lat?: number, lng?: number) => {
    setSourceAddressStr(address);
    if (lat !== undefined && lng !== undefined) {
      setSourceAddress({
        latitude: lat,
        longitude: lng,
        placeAddress: address
      });
    }
  };

  const handleDestinationChange = (address: string, lat?: number, lng?: number) => {
    setDestinationAddressStr(address);
    if (lat !== undefined && lng !== undefined) {
      setDestinationAddress({
        latitude: lat,
        longitude: lng,
        placeAddress: address
      });
    }
  };

  const handleCreateTrip = async () => {
    if (!sourceAddress || !destinationAddress || !tripStartDateTime || !selectedVehicle) {
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
        sourceAddress,
        destinationAddress,
        tripStartDateTime: new Date(tripStartDateTime).toISOString(),
        totalSeats,
        pricePerSeat,
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
      <div className="p-6 max-w-6xl mx-auto space-y-8">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString(undefined, {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          <h1 className="text-2xl font-bold">Offer a Ride</h1>
          <p className="text-sm text-muted-foreground">Share your journey and help others get around</p>
        </div>

        {/* Create Trip Form */}
        <Card className="rounded-xl border shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Plus className="h-5 w-5" />
              <span>Create New Trip</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Route Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Route Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="pickup" className="text-xs">Departure Location</Label>
                  <PlacesAutocomplete
                    value={sourceAddressStr}
                    onChange={handleSourceChange}
                    placeholder="Enter departure location"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="destination" className="text-xs">Destination</Label>
                  <PlacesAutocomplete
                    value={destinationAddressStr || ''}
                    onChange={handleDestinationChange}
                    placeholder="Enter destination"
                  />
                </div>
              </div>
            </div>

            {/* Trip Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Trip Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2 space-y-1.5">
                  <Label htmlFor="datetime" className="text-xs">Departure Time</Label>
                  <Input
                    id="datetime"
                    type="datetime-local"
                    value={tripStartDateTime}
                    onChange={(e) => setTripStartDateTime(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="seats" className="text-xs">Total Seats</Label>
                  <Input
                    id="seats"
                    type="number"
                    min="1"
                    max="8"
                    value={totalSeats}
                    onChange={(e) => setTotalSeats(parseInt(e.target.value))}
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="price" className="text-xs">Price Per Seat (€)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.5"
                    value={pricePerSeat}
                    onChange={(e) => setPricePerSeat(parseFloat(e.target.value))}
                    className="rounded-lg"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="vehicle" className="text-xs">Select Vehicle</Label>
                <Select onValueChange={handleVehicleChange}>
                  <SelectTrigger className="rounded-lg">
                    <SelectValue placeholder="Choose your vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.value} value={vehicle.value}>
                        <div className="flex items-center space-x-2">
                          <Car className="h-4 w-4" />
                          <span>{vehicle.text} ({vehicle.value}) {vehicle.seatingCapacity ? `- ${vehicle.seatingCapacity} seats` : ''}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Trip Preview */}
            {sourceAddress && destinationAddress && tripStartDateTime && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Trip Preview</h3>
                <Card className="rounded-xl border border-dashed bg-muted/5">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-4 w-4 text-emerald-500" />
                        <span className="text-sm font-medium">
                          <span className="text-muted-foreground mr-1">From:</span> {sourceAddress.placeAddress || `${sourceAddress.latitude}, ${sourceAddress.longitude}`}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-4 w-4 text-rose-500" />
                        <span className="text-sm font-medium">
                          <span className="text-muted-foreground mr-1">To:</span> {destinationAddress.placeAddress || `${destinationAddress.latitude}, ${destinationAddress.longitude}`}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Clock className="h-4 w-4 text-sky-500" />
                        <span className="text-sm font-medium">
                          <span className="text-muted-foreground mr-1">When:</span> {new Date(tripStartDateTime).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Users className="h-4 w-4 text-amber-500" />
                        <span className="text-sm font-medium">
                          <span className="text-muted-foreground mr-1">Capacity:</span> {totalSeats} seats | €{pricePerSeat}/seat
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <Button 
              onClick={handleCreateTrip}
              disabled={isCreating}
              className="w-full bg-primary hover:bg-primary/90 py-4 rounded-xl font-bold"
            >
              {isCreating ? 'Creating Trip...' : 'Create Trip'}
            </Button>
          </CardContent>
        </Card>

        {/* No Vehicles Warning */}
        {vehicles.length === 0 && (
          <Card className="rounded-xl border-amber-200 bg-amber-50/50 shadow-none">
            <CardContent className="p-6 text-center">
              <Car className="h-10 w-10 text-amber-600 mx-auto mb-3" />
              <h3 className="font-bold text-amber-800 mb-1">No Vehicles Found</h3>
              <p className="text-sm text-amber-700 mb-4">
                You need to register a vehicle before you can offer rides.
              </p>
              <Button
                onClick={() => navigate('/vehicles')}
                variant="outline"
                className="border-amber-600 text-amber-600 hover:bg-amber-100 rounded-lg"
              >
                Register Vehicle
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
