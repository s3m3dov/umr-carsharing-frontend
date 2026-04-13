
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { passengerApi as userApi } from '@/shared/api/passenger-api';
import { RideDTO, TripBasicInfoDTO } from '@/types/api';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getBackendErrorMessage } from '@/shared/api/error-toast';
import { Search, Users, Car } from 'lucide-react';
import PlacesAutocomplete from '@/components/PlacesAutocomplete';
import GoogleMap from '@/components/GoogleMap';

export default function FindRides() {
  const { userId } = useAuth();
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

  const [searchParams, setSearchParams] = useState<RideDTO>({
    pickupPoint: {
      latitude: 50.8093,
      longitude: 8.7707,
      placeAddress: 'Philipps University of Marburg'
    },
    destinationPoint: {
      latitude: 50.1272,
      longitude: 8.6654,
      placeAddress: 'Goethe University Frankfurt'
    },
    rideStartTime: new Date(getTomorrowAtNoon()).toISOString(),
    requestedSeats: 4
  });
  const [rides, setRides] = useState<TripBasicInfoDTO[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!userId) return;
    
    setIsSearching(true);
    try {
      const result = await userApi.findRides(searchParams);
      setRides(result);
      if (result.length === 0) {
        toast({ title: 'No rides found', description: 'Try adjusting your search criteria.' });
      }
    } catch (error) {
      const message = getBackendErrorMessage(error, 'Failed to search for rides.');
      toast({ title: 'Search failed', description: message, variant: 'destructive' });
    } finally {
      setIsSearching(false);
    }
  };

  const handleJoinRide = async (tripId: string) => {
    if (!userId) return;

    try {
      const rideData: RideDTO = {
        ...searchParams,
        tripId
      };
      
      await userApi.joinTrip(userId!, rideData);
      toast({ title: 'Success!', description: 'You have successfully joined the ride.' });
      handleSearch();
    } catch (error) {
      const message = getBackendErrorMessage(error, 'Failed to join ride.');
      toast({ title: 'Failed to join ride', description: message, variant: 'destructive' });
    }
  };

  const handlePickupChange = (address: string, lat?: number, lng?: number) => {
    setSearchParams(prevParams => ({
      ...prevParams,
      pickupPoint: {
        latitude: lat || 0,
        longitude: lng || 0,
        placeAddress: address,
      }
    }));
  };

  const handleDestinationChange = (address: string, lat?: number, lng?: number) => {
    setSearchParams(prevParams => ({
      ...prevParams,
      destinationPoint: {
        latitude: lat || 0,
        longitude: lng || 0,
        placeAddress: address,
      }
    }));
  };


  // Prepare map markers for found rides
  const mapMarkers = [
    // Current search criteria
    {
      position: { lat: searchParams.pickupPoint.latitude, lng: searchParams.pickupPoint.longitude },
      title: 'Your Requested Pickup',
      info: 'Your search start point',
    },
    {
      position: { lat: searchParams.destinationPoint.latitude, lng: searchParams.destinationPoint.longitude },
      title: 'Your Requested Destination',
      info: 'Your search end point',
    },
    // Found rides
    ...rides.flatMap(ride => [
      {
        position: { lat: ride.pickupPoint.latitude, lng: ride.pickupPoint.longitude },
        title: `${ride.fullName}'s Pickup`,
        info: `Pickup: ${ride.pickupPoint.placeAddress}`,
      },
      {
        position: { lat: ride.destinationPoint.latitude, lng: ride.destinationPoint.longitude },
        title: `${ride.fullName}'s Destination`,
        info: `Destination: ${ride.destinationPoint.placeAddress}`,
      }
    ])
  ];

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Find Rides</h1>
          <p className="text-sm text-muted-foreground">Search for available carpool rides</p>
        </div>

        <Card className="rounded-xl shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Search className="h-5 w-5" />
              Search Criteria
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="pickup-location" className="text-xs">Departure Location</Label>
                <PlacesAutocomplete
                    id="pickup-location"
                    value={searchParams.pickupPoint.placeAddress}
                    onChange={handlePickupChange}
                    placeholder="Enter departure location"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="destination-location" className="text-xs">Destination</Label>
                <PlacesAutocomplete
                    id="destination-location"
                    value={searchParams.destinationPoint.placeAddress}
                    onChange={handleDestinationChange}
                    placeholder="Enter destination"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="datetime" className="text-xs">Departure Time</Label>
                <Input
                  id="datetime"
                  type="datetime-local"
                  value={searchParams.rideStartTime.slice(0, 16)}
                  onChange={(e) => setSearchParams({
                    ...searchParams,
                    rideStartTime: new Date(e.target.value).toISOString()
                  })}
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="seats" className="text-xs">Seats Required</Label>
                <Input
                  id="seats"
                  type="number"
                  min="1"
                  max="4"
                  value={searchParams.requestedSeats}
                  onChange={(e) => setSearchParams({
                    ...searchParams,
                    requestedSeats: parseInt(e.target.value) || 1
                  })}
                  className="rounded-lg"
                />
              </div>
            </div>
            <Button onClick={handleSearch} disabled={isSearching} className="w-full bg-primary hover:bg-primary/90 py-4 rounded-xl font-bold">
              <Search className="h-4 w-4 mr-2" />
              {isSearching ? 'Searching...' : 'Search Rides'}
            </Button>
          </CardContent>
        </Card>

        {/* Map View of Found Rides */}
        {mapMarkers.length > 0 && (
          <Card className="rounded-xl shadow-none">
            <CardHeader>
              <CardTitle className="text-lg">Available Rides Map</CardTitle>
            </CardHeader>
            <CardContent>
              <GoogleMap
                markers={mapMarkers}
                routeGeometry={rides.length > 0 ? rides[0].routeGeometry : null}
                className="w-full h-96 rounded-lg border"
              />
            </CardContent>
          </Card>
        )}

        {rides.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Available Rides</h2>
            {rides.map((ride) => (
              <Card key={ride.tripId} className="group rounded-xl shadow-none hover:shadow-md hover:-translate-y-px hover:border-border/80 transition-all duration-150">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row md:items-stretch">
                    {/* Date/Time Sidebar */}
                    <div className="bg-muted/30 md:w-28 p-4 flex md:flex-col justify-between md:justify-center items-center border-b md:border-b-0 md:border-r text-center gap-1">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                        {new Date(ride.tripStartTime).toLocaleDateString(undefined, { month: 'short' })}
                      </div>
                      <div className="text-xl font-bold text-foreground">
                        {new Date(ride.tripStartTime).getDate()}
                      </div>
                      <div className="text-[10px] font-medium text-muted-foreground">
                        {new Date(ride.tripStartTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 p-4 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Car className="h-3.5 w-3.5" />
                            <span>{ride.vehicleNumber}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            <span>{ride.availableSeats} seats available</span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleJoinRide(ride.tripId)}
                          disabled={ride.availableSeats < searchParams.requestedSeats}
                          className="font-semibold"
                        >
                          Join Ride
                        </Button>
                      </div>

                      <div className="relative pl-5 space-y-3">
                        <div className="absolute left-[4px] top-[6px] bottom-[6px] w-0.5 bg-border" />
                        <div className="relative">
                          <div className="absolute -left-[23px] top-1 w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-background" />
                          <p className="text-sm font-semibold leading-tight line-clamp-1">{ride.pickupPoint.placeAddress}</p>
                        </div>
                        <div className="relative">
                          <div className="absolute -left-[23px] top-1 w-2 h-2 rounded-full bg-rose-500 ring-4 ring-background" />
                          <p className="text-sm font-semibold leading-tight line-clamp-1">{ride.destinationPoint.placeAddress}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                        <span className="font-medium text-foreground">{ride.fullName}</span>
                        <span>·</span>
                        <span>{ride.phoneNumber}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
