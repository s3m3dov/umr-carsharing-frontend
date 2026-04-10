
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { passengerApi as userApi } from '@/shared/api/passenger-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import PlacesAutocomplete from '@/components/PlacesAutocomplete';
import { 
  Search, 
  MapPin, 
  Clock, 
  Users, 
  Car,
  Phone,
  Calendar
} from 'lucide-react';
import { Points, TripBasicInfoDTO, RideDTO } from '@/types/api';

export default function RideBooking() {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [pickupPoint, setPickupPoint] = useState<Points | null>(null);
  const [destinationPoint, setDestinationPoint] = useState<Points | null>(null);
  const [pickupAddress, setPickupAddress] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [rideStartTime, setRideStartTime] = useState('');
  const [requestedSeats, setRequestedSeats] = useState(1);
  const [availableRides, setAvailableRides] = useState<TripBasicInfoDTO[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isJoining, setIsJoining] = useState<string | null>(null);

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

  const handleSearch = async () => {
    if (!pickupPoint || !destinationPoint || !rideStartTime) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsSearching(true);
    try {
      const rideData: RideDTO = {
        pickupPoint,
        destinationPoint,
        rideStartTime,
        requestedSeats,
      };

      const result = await userApi.findRides(userId!, rideData);
      setAvailableRides(result);
      if (result.length === 0) {
        toast({ title: 'No Rides Found', description: 'No available rides match your criteria.' });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to search for rides.';
      toast({ title: 'Search Failed', description: message, variant: 'destructive' });
    } finally {
      setIsSearching(false);
    }
  };

  const handleJoinRide = async (trip: TripBasicInfoDTO) => {
    if (!pickupPoint || !destinationPoint) return;

    setIsJoining(trip.tripId);
    try {
      const rideData: RideDTO = {
        tripId: trip.tripId,
        pickupPoint,
        destinationPoint,
        rideStartTime,
        requestedSeats,
      };

      await userApi.joinTrip(userId!, rideData);
      toast({ title: 'Ride Booked!', description: 'You have successfully joined the ride.' });
      navigate('/my-rides');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to book the ride.';
      toast({ title: 'Booking Failed', description: message, variant: 'destructive' });
    } finally {
      setIsJoining(null);
    }
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString();
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Book a Ride</h1>
          <p className="text-muted-foreground">Find and join available rides in your area</p>
        </div>

        {/* Search Form */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Search for Rides</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="datetime">Departure Time</Label>
                <Input
                  id="datetime"
                  type="datetime-local"
                  value={rideStartTime}
                  onChange={(e) => setRideStartTime(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
              <div>
                <Label htmlFor="seats">Seats Needed</Label>
                <Input
                  id="seats"
                  type="number"
                  min="1"
                  max="4"
                  value={requestedSeats}
                  onChange={(e) => setRequestedSeats(parseInt(e.target.value))}
                />
              </div>
            </div>

            <Button 
              onClick={handleSearch}
              disabled={isSearching}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {isSearching ? 'Searching...' : 'Search Rides'}
            </Button>
          </CardContent>
        </Card>

        {/* Available Rides */}
        {availableRides.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Available Rides</h2>
            {availableRides.map((trip) => (
              <Card key={trip.tripId} className="shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-primary font-semibold">
                          {trip.fullName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{trip.fullName}</h3>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Car className="h-4 w-4" />
                          <span>{trip.vehicleNumber}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      <Users className="h-3 w-3 mr-1" />
                      {trip.availableSeats} seats
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium">Pickup</p>
                        <p className="text-sm text-muted-foreground">
                          {trip.pickupPoint.placeAddress || `${trip.pickupPoint.latitude}, ${trip.pickupPoint.longitude}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-red-600" />
                      <div>
                        <p className="text-sm font-medium">Destination</p>
                        <p className="text-sm text-muted-foreground">
                          {trip.destinationPoint.placeAddress || `${trip.destinationPoint.latitude}, ${trip.destinationPoint.longitude}`}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{formatDateTime(trip.tripStartTime)}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{trip.phoneNumber}</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleJoinRide(trip)}
                      disabled={isJoining === trip.tripId}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isJoining === trip.tripId ? 'Booking...' : 'Book Ride'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/offer-ride')}>
            <CardContent className="p-6 text-center">
              <Car className="h-12 w-12 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">Offer a Ride</h3>
              <p className="text-muted-foreground text-sm">Share your journey and help others</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/my-rides')}>
            <CardContent className="p-6 text-center">
              <Calendar className="h-12 w-12 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">My Rides</h3>
              <p className="text-muted-foreground text-sm">View your booked rides</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
