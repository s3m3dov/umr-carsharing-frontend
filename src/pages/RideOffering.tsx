
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { driverApi as userApi } from '@/shared/api/driver-api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getBackendErrorMessage } from '@/shared/api/error-toast';
import Layout from '@/components/Layout';
import PlacesAutocomplete from '@/components/PlacesAutocomplete';
import { 
  MapPin, 
  Car,
  Euro,
  Info
} from 'lucide-react';
import { Points, OfferRideDTO } from '@/types/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import GoogleMap from '@/components/GoogleMap';
import { cn } from '@/lib/utils';

export default function RideOffering() {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const getTomorrowAtNoon = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    date.setHours(12, 0, 0, 0);
    return date.toISOString().slice(0, 16);
  };

  const [form, setForm] = useState({
    source: {
      latitude: 50.8093,
      longitude: 8.7707,
      placeAddress: 'Philipps University of Marburg'
    } as Points,
    destination: {
      latitude: 50.1272,
      longitude: 8.6654,
      placeAddress: 'Goethe University Frankfurt'
    } as Points,
    departureTime: getTomorrowAtNoon(),
    seats: 4,
    price: 10,
    vehicleNumber: ''
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles', userId],
    queryFn: () => userApi.getVehicles(userId!),
    enabled: !!userId,
  });

  const createTripMutation = useMutation({
    mutationFn: (data: OfferRideDTO) => userApi.createTrip(userId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upcomingRides', userId] });
      toast({ title: 'Trip created!', description: 'Your ride is now available for booking.' });
      navigate('/my-rides');
    },
    onError: (error) => {
      const message = getBackendErrorMessage(error, 'Failed to create trip.');
      toast({ title: 'Error', description: message, variant: 'destructive' });
    },
  });

  const handleVehicleChange = (value: string) => {
    const v = vehicles.find(v => v.value === value);
    setForm(prev => ({
      ...prev,
      vehicleNumber: value,
      seats: v?.seatingCapacity ? parseInt(v.seatingCapacity) : prev.seats
    }));
  };

  const handleSubmit = () => {
    if (!form.vehicleNumber || !form.source.placeAddress || !form.destination.placeAddress) {
      toast({ title: 'Missing Info', description: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }

    createTripMutation.mutate({
      vehicleNumber: form.vehicleNumber,
      sourceAddress: form.source,
      destinationAddress: form.destination,
      tripStartDateTime: new Date(form.departureTime).toISOString(),
      totalSeats: form.seats,
      pricePerSeat: form.price
    });
  };

  const mapMarkers = useMemo(() => [
    { position: { lat: form.source.latitude, lng: form.source.longitude }, title: 'Pickup' },
    { position: { lat: form.destination.latitude, lng: form.destination.longitude }, title: 'Destination' }
  ], [form.source, form.destination]);

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden bg-background">
        
        {/* Left Side: Form */}
        <div className="w-full lg:w-[480px] flex flex-col border-r overflow-y-auto">
          <div className="p-6 space-y-8">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">Offer a Ride</h1>
              <p className="text-sm text-muted-foreground">Share your journey and earn by helping others travel.</p>
            </div>

            <div className="space-y-6">
              {/* Route Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
                  <MapPin className="h-3 w-3" />
                  Route Details
                </div>
                
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">From</Label>
                    <PlacesAutocomplete
                      value={form.source.placeAddress}
                      onChange={(addr, lat, lng) => setForm(f => ({ ...f, source: { latitude: lat || 0, longitude: lng || 0, placeAddress: addr } }))}
                      placeholder="Departure city or address"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">To</Label>
                    <PlacesAutocomplete
                      value={form.destination.placeAddress}
                      onChange={(addr, lat, lng) => setForm(f => ({ ...f, destination: { latitude: lat || 0, longitude: lng || 0, placeAddress: addr } }))}
                      placeholder="Destination city or address"
                    />
                  </div>
                </div>
              </div>

              {/* Vehicle & Time Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
                  <Car className="h-3 w-3" />
                  Trip Specifications
                </div>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Select Vehicle</Label>
                    <Select value={form.vehicleNumber} onValueChange={handleVehicleChange}>
                      <SelectTrigger className="h-11 rounded-lg border-2">
                        <SelectValue placeholder="Which car are you driving?" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicles.map((v) => (
                          <SelectItem key={v.value} value={v.value}>
                            <div className="flex items-center gap-2 font-medium">
                              <Car className="h-3.5 w-3.5" />
                              {v.text} <span className="text-[10px] text-muted-foreground">({v.value})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {vehicles.length === 0 && (
                      <Button variant="link" size="sm" className="h-auto p-0 text-[10px] text-primary" onClick={() => navigate('/vehicles')}>
                        + Register a vehicle first
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Date & Time</Label>
                      <Input
                        type="datetime-local"
                        value={form.departureTime}
                        onChange={(e) => setForm(f => ({ ...f, departureTime: e.target.value }))}
                        className="h-11 rounded-lg border-2"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Seats Available</Label>
                      <Input
                        type="number"
                        min="1"
                        max="8"
                        value={form.seats}
                        onChange={(e) => setForm(f => ({ ...f, seats: parseInt(e.target.value) || 1 }))}
                        className="h-11 rounded-lg border-2 font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Price per seat (€)</Label>
                    <div className="relative">
                      <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        min="0"
                        step="0.5"
                        value={form.price}
                        onChange={(e) => setForm(f => ({ ...f, price: parseFloat(e.target.value) || 0 }))}
                        className="h-11 pl-9 rounded-lg border-2 font-bold text-lg text-primary"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleSubmit} 
                disabled={createTripMutation.isPending || vehicles.length === 0}
                className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                {createTripMutation.isPending ? 'Publishing...' : 'Publish Trip Offer'}
              </Button>
            </div>
          </div>
        </div>

        {/* Right Side: Preview Map */}
        <div className="flex-1 relative bg-muted/5">
          <div className="absolute inset-0">
            <GoogleMap
              markers={mapMarkers}
              className="w-full h-full"
            />
          </div>

          {/* Floating Preview Card */}
          <div className="absolute top-6 left-6 right-6 lg:left-auto lg:right-6 lg:w-80">
            <Card className="bg-background/95 backdrop-blur shadow-2xl border-2 border-primary/10 rounded-2xl overflow-hidden text-card-foreground">
              <div className="bg-primary p-3 text-primary-foreground flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-widest">Live Preview</p>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/20 rounded-full text-[9px] font-bold">
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  ACTIVE
                </div>
              </div>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center mt-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <div className="w-0.5 h-8 bg-border my-1" />
                    <div className="w-2 h-2 rounded-full bg-rose-500" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-3">
                    <p className="text-xs font-bold truncate leading-none">{form.source.placeAddress || 'Enter pickup'}</p>
                    <p className="text-xs font-bold truncate leading-none pt-1">{form.destination.placeAddress || 'Enter destination'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="p-2 rounded-lg bg-muted/50 border text-center space-y-0.5">
                    <p className="text-[8px] text-muted-foreground uppercase font-bold">Departure</p>
                    <p className="text-[10px] font-bold">{new Date(form.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50 border text-center space-y-0.5">
                    <p className="text-[8px] text-muted-foreground uppercase font-bold">Earnings</p>
                    <p className="text-[10px] font-bold text-primary">€{(form.price * form.seats).toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
            <div className="flex items-center gap-2 px-4 py-2 bg-background/80 backdrop-blur rounded-full border shadow-sm text-[10px] font-medium text-muted-foreground whitespace-nowrap">
              <Info className="h-3 w-3 text-primary" />
              Adjust your route on the left to update the map view
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
