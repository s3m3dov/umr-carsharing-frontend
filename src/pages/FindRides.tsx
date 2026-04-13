
import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { passengerApi as userApi } from '@/shared/api/passenger-api';
import { RideDTO, TripBasicInfoDTO } from '@/types/api';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getBackendErrorMessage } from '@/shared/api/error-toast';
import { Search, Users, Car, MapPin, Clock, Calendar, ChevronRight } from 'lucide-react';
import PlacesAutocomplete from '@/components/PlacesAutocomplete';
import GoogleMap from '@/components/GoogleMap';
import { cn } from '@/lib/utils';

export default function FindRides() {
  const { userId } = useAuth();
  const { toast } = useToast();

  const getTomorrowAtNoon = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    date.setHours(12, 0, 0, 0);
    return date.toISOString().slice(0, 16);
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
    requestedSeats: 1
  });

  const [rides, setRides] = useState<TripBasicInfoDTO[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!userId) return;
    
    setIsSearching(true);
    setSelectedTripId(null);
    try {
      const result = await userApi.findRides(searchParams);
      setRides(result);
      if (result.length === 0) {
        toast({ title: 'No rides found', description: 'Try adjusting your search criteria.' });
      } else {
        setSelectedTripId(result[0].tripId);
      }
    } catch (error) {
      const message = getBackendErrorMessage(error, 'Failed to search for rides.');
      toast({ title: 'Search failed', description: message, variant: 'destructive' });
    } finally {
      setIsSearching(false);
    }
  };

  const handleJoinRide = async (trip: TripBasicInfoDTO) => {
    if (!userId) return;

    try {
      const rideData = {
        tripId: trip.tripId,
        driverId: trip.userId, // userId in TripBasicInfoDTO is the driver's email/ID
        pickupPoint: {
          latitude: trip.pickupPoint.latitude,
          longitude: trip.pickupPoint.longitude,
        },
        destinationPoint: {
          latitude: trip.destinationPoint.latitude,
          longitude: trip.destinationPoint.longitude,
        },
        rideStartTime: trip.tripStartTime,
        requestedSeats: searchParams.requestedSeats,
      };
      
      await userApi.bookRide(rideData);
      toast({ title: 'Success!', description: 'You have successfully joined the ride.' });
      handleSearch();
    } catch (error) {
      const message = getBackendErrorMessage(error, 'Failed to join ride.');
      toast({ title: 'Failed to join ride', description: message, variant: 'destructive' });
    }
  };

  const selectedTrip = useMemo(() => 
    rides.find(r => r.tripId === selectedTripId) || null
  , [rides, selectedTripId]);

  const mapMarkers = useMemo(() => {
    if (selectedTrip) {
      return [
        {
          position: { lat: selectedTrip.pickupPoint.latitude, lng: selectedTrip.pickupPoint.longitude },
          title: 'Pickup',
          info: `<strong>Pickup:</strong> ${selectedTrip.pickupPoint.placeAddress}`,
        },
        {
          position: { lat: selectedTrip.destinationPoint.latitude, lng: selectedTrip.destinationPoint.longitude },
          title: 'Destination',
          info: `<strong>Destination:</strong> ${selectedTrip.destinationPoint.placeAddress}`,
        }
      ];
    }
    return [
      {
        position: { lat: searchParams.pickupPoint.latitude, lng: searchParams.pickupPoint.longitude },
        title: 'Search Pickup',
      },
      {
        position: { lat: searchParams.destinationPoint.latitude, lng: searchParams.destinationPoint.longitude },
        title: 'Search Destination',
      }
    ];
  }, [selectedTrip, searchParams]);

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden bg-background">
        
        {/* Left Side: Search & Results */}
        <div className="w-full lg:w-[480px] flex flex-col border-r overflow-y-auto">
          <div className="p-6 space-y-6">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">Find a Ride</h1>
              <p className="text-sm text-muted-foreground">Enter your details to see available carpools</p>
            </div>

            <div className="space-y-4 p-4 rounded-xl border bg-muted/30">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Departure</Label>
                  <PlacesAutocomplete
                    value={searchParams.pickupPoint.placeAddress}
                    onChange={(addr, lat, lng) => setSearchParams(p => ({
                      ...p, pickupPoint: { latitude: lat || 0, longitude: lng || 0, placeAddress: addr }
                    }))}
                    placeholder="Where from?"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Destination</Label>
                  <PlacesAutocomplete
                    value={searchParams.destinationPoint.placeAddress}
                    onChange={(addr, lat, lng) => setSearchParams(p => ({
                      ...p, destinationPoint: { latitude: lat || 0, longitude: lng || 0, placeAddress: addr }
                    }))}
                    placeholder="Where to?"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Time</Label>
                    <Input
                      type="datetime-local"
                      value={searchParams.rideStartTime.slice(0, 16)}
                      onChange={(e) => setSearchParams(p => ({ ...p, rideStartTime: new Date(e.target.value).toISOString() }))}
                      className="h-10 bg-background"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Seats</Label>
                    <Input
                      type="number"
                      min="1"
                      value={searchParams.requestedSeats}
                      onChange={(e) => setSearchParams(p => ({ ...p, requestedSeats: parseInt(e.target.value) || 1 }))}
                      className="h-10 bg-background"
                    />
                  </div>
                </div>
              </div>
              <Button 
                onClick={handleSearch} 
                disabled={isSearching} 
                className="w-full h-11 font-semibold rounded-lg shadow-sm transition-all"
              >
                {isSearching ? 'Searching...' : 'Search Rides'}
              </Button>
            </div>

            {rides.length > 0 ? (
              <div className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">
                  Found {rides.length} matching rides
                </h2>
                {rides.map((ride) => (
                  <Card 
                    key={ride.tripId} 
                    className={cn(
                      "cursor-pointer transition-all duration-200 border-2",
                      selectedTripId === ride.tripId 
                        ? "border-primary bg-primary/5 shadow-md" 
                        : "border-transparent hover:border-muted-foreground/20 hover:bg-muted/20 shadow-none"
                    )}
                    onClick={() => setSelectedTripId(ride.tripId)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="space-y-1">
                          <p className="font-bold text-sm">{ride.fullName}</p>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <span className="flex items-center gap-1"><Car className="h-3 w-3" /> {ride.vehicleNumber}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {ride.availableSeats} left</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-primary">€{ride.pricePerSeat || '10'}</p>
                          <p className="text-[10px] text-muted-foreground uppercase font-medium">per seat</p>
                        </div>
                      </div>

                      <div className="relative pl-4 space-y-3 border-l-2 border-dashed border-muted-foreground/30 ml-1">
                        <div className="relative">
                          <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background" />
                          <p className="text-[11px] font-semibold leading-none truncate">{ride.pickupPoint.placeAddress}</p>
                          <p className="text-[9px] text-muted-foreground mt-0.5 flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5" /> 
                            {new Date(ride.tripStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <div className="relative">
                          <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-rose-500 border-2 border-background" />
                          <p className="text-[11px] font-semibold leading-none truncate">{ride.destinationPoint.placeAddress}</p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 text-[11px] px-3 font-semibold"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTripId(ride.tripId);
                          }}
                        >
                          View Route
                        </Button>
                        <Button 
                          size="sm" 
                          className="h-8 text-[11px] px-4 font-bold"
                          disabled={ride.availableSeats < searchParams.requestedSeats}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleJoinRide(ride);
                          }}
                        >
                          Join Ride
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : !isSearching && rides.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-3 bg-muted/10 rounded-2xl border border-dashed">
                <div className="p-3 bg-muted rounded-full">
                  <Search className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold">No rides found yet</p>
                  <p className="text-xs text-muted-foreground max-w-[200px]">
                    Adjust your filters or locations to see available trips.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Map */}
        <div className="flex-1 relative bg-muted/5">
          <GoogleMap
            markers={mapMarkers}
            routeGeometry={selectedTrip?.routeGeometry}
            className="w-full h-full"
          />
          
          {/* Floating selection summary mobile only or overlay */}
          {selectedTrip && (
            <div className="absolute bottom-6 left-6 right-6 lg:left-auto lg:right-6 lg:w-80 bg-background/95 backdrop-blur shadow-2xl rounded-2xl border p-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[9px] uppercase tracking-wider font-bold">Selected Ride</Badge>
                  <h3 className="font-bold text-sm">{selectedTrip.fullName}'s Trip</h3>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => setSelectedTripId(null)}>
                  <ChevronRight className="h-4 w-4 rotate-90" />
                </Button>
              </div>
              <Separator className="my-3" />
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-[11px]">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{new Date(selectedTrip.tripStartTime).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                  <Users className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{selectedTrip.availableSeats} seats available</span>
                </div>
                <Button className="w-full h-9 text-xs font-bold mt-2" onClick={() => handleJoinRide(selectedTrip)}>
                  Book This Ride Now
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function Separator({ className }: { className?: string }) {
  return <div className={cn("h-px bg-border w-full", className)} />;
}

function Badge({ children, variant, className }: { children: React.ReactNode, variant?: 'secondary', className?: string }) {
  return (
    <span className={cn(
      "px-2 py-0.5 rounded text-[10px] font-medium border",
      variant === 'secondary' ? "bg-secondary text-secondary-foreground border-transparent" : "bg-background text-foreground border-border",
      className
    )}>
      {children}
    </span>
  );
}
