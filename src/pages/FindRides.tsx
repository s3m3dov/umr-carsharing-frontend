import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { passengerApi as userApi } from '@/shared/api/passenger-api';
import { TripSearchCriteriaDTO, TripBasicInfoDTO } from '@/types/api';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getBackendErrorMessage } from '@/shared/api/error-toast';
import { Search, Users, Car, Clock, Calendar, ChevronRight, SlidersHorizontal } from 'lucide-react';
import PlacesAutocomplete from '@/components/PlacesAutocomplete';
import GoogleMap from '@/components/GoogleMap';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function FindRides() {
  const { userId } = useAuth();
  const { toast } = useToast();

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

  const [searchParams, setSearchParams] = useState<TripSearchCriteriaDTO & { pickupAddress: string, destinationAddress: string }>({
    sourceLatitude: 50.8093,
    sourceLongitude: 8.7707,
    pickupAddress: 'Philipps University of Marburg',
    destinationLatitude: 50.1272,
    destinationLongitude: 8.6654,
    destinationAddress: 'Goethe University Frankfurt',
    sourceRadiusKm: 5,
    destinationRadiusKm: 5,
    earliestDepartureTime: getTomorrowAtNoon(),
    requestedSeats: 1,
    minPrice: 0,
    maxPrice: 100,
    carType: 'ANY',
  });

  const [rides, setRides] = useState<TripBasicInfoDTO[]>([]);
  const [bookedTripIds, setBookedTripIds] = useState<Set<string>>(new Set());
  const [isSearching, setIsSearching] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchBookedRides = async () => {
      if (!userId) return;
      try {
        const upcoming = await userApi.getUpcomingRides(userId);
        setBookedTripIds(new Set(upcoming.map(r => r.tripId)));
      } catch (error) {
        console.error('Failed to fetch booked rides', error);
      }
    };
    fetchBookedRides();
  }, [userId]);

  const handleSearch = async () => {
    if (!userId) return;
    
    setIsSearching(true);
    setSelectedTripId(null);
    try {
      const criteria: TripSearchCriteriaDTO = {
        ...searchParams,
        earliestDepartureTime: new Date(searchParams.earliestDepartureTime || '').toISOString(),
        latestDepartureTime: searchParams.latestDepartureTime 
          ? new Date(searchParams.latestDepartureTime).toISOString()
          : undefined,
      };

      if (criteria.carType === 'ANY') delete criteria.carType;

      const result = await userApi.findRides(criteria);
      const filteredResult = result.filter(ride => !bookedTripIds.has(ride.tripId));
      
      setRides(filteredResult);
      
      if (filteredResult.length === 0) {
        if (result.length > filteredResult.length) {
          toast({ 
            title: 'No new rides found', 
            description: 'You have already booked the available matching rides.' 
          });
        } else {
          toast({ title: 'No rides found', description: 'Try adjusting your search criteria.' });
        }
      } else {
        setSelectedTripId(filteredResult[0].tripId);
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
        driverId: trip.userId,
        pickupPoint: {
          latitude: trip.pickupPoint.latitude,
          longitude: trip.pickupPoint.longitude,
          placeAddress: trip.pickupPoint.placeAddress || searchParams.pickupAddress,
        },
        destinationPoint: {
          latitude: trip.destinationPoint.latitude,
          longitude: trip.destinationPoint.longitude,
          placeAddress: trip.destinationPoint.placeAddress || searchParams.destinationAddress,
        },
        rideStartTime: trip.tripStartTime,
        requestedSeats: searchParams.requestedSeats || 1,
      };
      
      await userApi.bookRide(rideData);
      toast({ title: 'Success!', description: 'You have successfully joined the ride.' });
      
      setBookedTripIds(prev => new Set(prev).add(trip.tripId));
      setRides(prev => prev.filter(r => r.tripId !== trip.tripId));
      setSelectedTripId(null);
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
        position: { lat: searchParams.sourceLatitude, lng: searchParams.sourceLongitude },
        title: 'Search Pickup',
      },
      {
        position: { lat: searchParams.destinationLatitude, lng: searchParams.destinationLongitude },
        title: 'Search Destination',
      }
    ];
  }, [selectedTrip, searchParams]);

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden bg-background">
        
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
                    value={searchParams.pickupAddress}
                    onChange={(addr, lat, lng) => setSearchParams(p => ({
                      ...p, sourceLatitude: lat || 0, sourceLongitude: lng || 0, pickupAddress: addr
                    }))}
                    placeholder="Where from?"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Destination</Label>
                  <PlacesAutocomplete
                    value={searchParams.destinationAddress}
                    onChange={(addr, lat, lng) => setSearchParams(p => ({
                      ...p, destinationLatitude: lat || 0, destinationLongitude: lng || 0, destinationAddress: addr
                    }))}
                    placeholder="Where to?"
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 space-y-1.5">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Time</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="datetime-local"
                        value={searchParams.earliestDepartureTime}
                        onChange={(e) => setSearchParams(p => ({ ...p, earliestDepartureTime: e.target.value }))}
                        className="h-10 pl-9 bg-background text-sm"
                      />
                    </div>
                  </div>
                  <div className="col-span-1 space-y-1.5">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Seats</Label>
                    <Input
                      type="number"
                      min="1"
                      value={searchParams.requestedSeats}
                      onChange={(e) => setSearchParams(p => ({ ...p, requestedSeats: parseInt(e.target.value) || 1 }))}
                      className="h-10 bg-background text-sm text-center"
                    />
                  </div>
                </div>

                <Collapsible open={showFilters} onOpenChange={setShowFilters}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-full flex items-center justify-between px-2 text-muted-foreground hover:text-foreground">
                      <div className="flex items-center gap-2">
                        <SlidersHorizontal className="h-3.5 w-3.5" />
                        <span className="text-xs font-semibold uppercase tracking-wider">Advanced Filters</span>
                      </div>
                      <ChevronRight className={cn("h-4 w-4 transition-transform", showFilters && "rotate-90")} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-3 space-y-4">
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label className="text-[10px] uppercase font-bold text-muted-foreground">Pickup Radius: {searchParams.sourceRadiusKm} km</Label>
                        </div>
                        <Slider
                          value={[searchParams.sourceRadiusKm || 5]}
                          min={1}
                          max={50}
                          step={1}
                          onValueChange={([val]) => setSearchParams(p => ({ ...p, sourceRadiusKm: val }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label className="text-[10px] uppercase font-bold text-muted-foreground">Destination Radius: {searchParams.destinationRadiusKm} km</Label>
                        </div>
                        <Slider
                          value={[searchParams.destinationRadiusKm || 5]}
                          min={1}
                          max={50}
                          step={1}
                          onValueChange={([val]) => setSearchParams(p => ({ ...p, destinationRadiusKm: val }))}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Latest Arrival Time (Optional)</Label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="datetime-local"
                            value={searchParams.latestDepartureTime || ''}
                            onChange={(e) => setSearchParams(p => ({ ...p, latestDepartureTime: e.target.value }))}
                            className="h-9 pl-9 text-xs bg-background"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label className="text-[10px] uppercase font-bold text-muted-foreground">Price Limit: €{searchParams.maxPrice}</Label>
                        </div>
                        <Slider
                          value={[searchParams.maxPrice || 100]}
                          min={0}
                          max={200}
                          step={5}
                          onValueChange={([val]) => setSearchParams(p => ({ ...p, maxPrice: val }))}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Car Type</Label>
                        <Select 
                          value={searchParams.carType} 
                          onValueChange={(val) => setSearchParams(p => ({ ...p, carType: val }))}
                        >
                          <SelectTrigger className="h-9 text-xs bg-background">
                            <SelectValue placeholder="Select car type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ANY">Any Type</SelectItem>
                            <SelectItem value="SEDAN">Sedan</SelectItem>
                            <SelectItem value="SUV">SUV</SelectItem>
                            <SelectItem value="HATCHBACK">Hatchback</SelectItem>
                            <SelectItem value="EV">Electric</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
              <Button 
                onClick={handleSearch} 
                disabled={isSearching} 
                className="w-full h-11 font-semibold rounded-lg shadow-sm transition-all mt-2"
              >
                {isSearching ? 'Searching...' : 'Search Rides'}
              </Button>
            </div>

            {rides.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Found {rides.length} matching rides
                  </h2>
                </div>
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
                          disabled={ride.availableSeats < (searchParams.requestedSeats || 1)}
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
            ) : !isSearching && (
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

        <div className="flex-1 relative bg-muted/5">
          <GoogleMap
            markers={mapMarkers}
            routeGeometry={selectedTrip?.routeGeometry}
            className="w-full h-full"
          />
          
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
