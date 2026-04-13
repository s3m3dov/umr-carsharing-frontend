
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { driverApi as userApi } from '@/shared/api/driver-api';
import { VehicleRegisterRequestDTO } from '@/types/api';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getBackendErrorMessage } from '@/shared/api/error-toast';
import { Car, Plus } from 'lucide-react';

export default function Vehicles() {
  const { userId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVehicle, setNewVehicle] = useState<VehicleRegisterRequestDTO>({
    vehicleName: '',
    vehicleNumber: '',
    vehicleType: '',
    vehicleColor: '',
    seatingCapacity: ''
  });

  const { data: vehicles, isLoading } = useQuery({
    queryKey: ['vehicles', userId],
    queryFn: () => userApi.getVehicles(userId!),
    enabled: !!userId,
  });

  const addVehicleMutation = useMutation({
    mutationFn: (vehicleData: VehicleRegisterRequestDTO) =>
      userApi.registerVehicle(userId!, vehicleData),
    onSuccess: () => {
      toast({
        title: 'Vehicle added',
        description: 'Your vehicle has been successfully registered.',
      });
      queryClient.invalidateQueries({ queryKey: ['vehicles', userId] });
      setShowAddForm(false);
      setNewVehicle({
        vehicleName: '',
        vehicleNumber: '',
        vehicleType: '',
        vehicleColor: '',
        seatingCapacity: ''
      });
    },
    onError: (error) => {
      const message = getBackendErrorMessage(error, 'Failed to register vehicle');
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    },
  });

  const handleAddVehicle = () => {
    if (!newVehicle.vehicleName || !newVehicle.vehicleNumber || !newVehicle.vehicleType || !newVehicle.vehicleColor) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    addVehicleMutation.mutate(newVehicle);
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">My Vehicles</h1>
            <p className="text-sm text-muted-foreground">Manage your registered vehicles</p>
          </div>
          <Button variant="outline" size="sm" className="hidden sm:flex font-semibold" onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Vehicle
          </Button>
        </div>

        {showAddForm && (
          <Card className="rounded-xl shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Plus className="h-5 w-5" />
                <span>Add New Vehicle</span>
              </CardTitle>
              <CardDescription className="text-xs">Register a new vehicle for carpooling</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="vehicleName" className="text-xs">Vehicle Name *</Label>
                  <Input
                    id="vehicleName"
                    placeholder="e.g., Honda Civic"
                    value={newVehicle.vehicleName}
                    onChange={(e) => setNewVehicle({
                      ...newVehicle,
                      vehicleName: e.target.value
                    })}
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="vehicleNumber" className="text-xs">Vehicle Number *</Label>
                  <Input
                    id="vehicleNumber"
                    placeholder="e.g., ABC-1234"
                    value={newVehicle.vehicleNumber}
                    onChange={(e) => setNewVehicle({
                      ...newVehicle,
                      vehicleNumber: e.target.value.toUpperCase()
                    })}
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="vehicleType" className="text-xs">Vehicle Type *</Label>
                  <Select
                    value={newVehicle.vehicleType}
                    onValueChange={(value) => setNewVehicle({
                      ...newVehicle,
                      vehicleType: value
                    })}
                  >
                    <SelectTrigger className="rounded-lg">
                      <SelectValue placeholder="Select vehicle type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HATCHBACK">Hatchback</SelectItem>
                      <SelectItem value="SEDAN">Sedan</SelectItem>
                      <SelectItem value="SUV">SUV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="vehicleColor" className="text-xs">Color *</Label>
                  <Input
                    id="vehicleColor"
                    placeholder="e.g., Red"
                    value={newVehicle.vehicleColor}
                    onChange={(e) => setNewVehicle({
                      ...newVehicle,
                      vehicleColor: e.target.value
                    })}
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="seatingCapacity" className="text-xs">Seating Capacity</Label>
                  <Input
                    id="seatingCapacity"
                    placeholder="e.g., 4"
                    value={newVehicle.seatingCapacity}
                    onChange={(e) => setNewVehicle({
                      ...newVehicle,
                      seatingCapacity: e.target.value
                    })}
                    className="rounded-lg"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleAddVehicle}
                  disabled={addVehicleMutation.isPending}
                >
                  {addVehicleMutation.isPending ? 'Adding...' : 'Add Vehicle'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Registered Vehicles</h2>
          {isLoading ? (
            <div className="text-center py-8 text-sm text-muted-foreground">Loading vehicles...</div>
          ) : vehicles && vehicles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vehicles.map((vehicle) => (
                <Card key={vehicle.value} className="rounded-xl shadow-none">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-500/10">
                        <Car className="h-4 w-4 text-orange-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm truncate">{vehicle.text}</h3>
                        <p className="text-xs text-muted-foreground">{vehicle.value}</p>
                        {vehicle.seatingCapacity && (
                          <p className="text-xs text-muted-foreground">
                            {vehicle.seatingCapacity} seats
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed rounded-xl bg-muted/5">
              <Car className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No vehicles registered yet.</p>
              <p className="text-xs text-muted-foreground mt-1">
                Add your first vehicle to start offering rides.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
