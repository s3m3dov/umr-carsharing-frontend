
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">My Vehicles</h1>
            <p className="text-muted-foreground">Manage your registered vehicles</p>
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Vehicle
          </Button>
        </div>

        {showAddForm && (
          <Card>
            <CardHeader>
              <CardTitle>Add New Vehicle</CardTitle>
              <CardDescription>Register a new vehicle for carpooling</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vehicleName">Vehicle Name *</Label>
                  <Input
                    id="vehicleName"
                    placeholder="e.g., Honda Civic"
                    value={newVehicle.vehicleName}
                    onChange={(e) => setNewVehicle({
                      ...newVehicle,
                      vehicleName: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="vehicleNumber">Vehicle Number *</Label>
                  <Input
                    id="vehicleNumber"
                    placeholder="e.g., ABC-1234"
                    value={newVehicle.vehicleNumber}
                    onChange={(e) => setNewVehicle({
                      ...newVehicle,
                      vehicleNumber: e.target.value.toUpperCase()
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="vehicleType">Vehicle Type *</Label>
                  <Select 
                    value={newVehicle.vehicleType} 
                    onValueChange={(value) => setNewVehicle({
                      ...newVehicle,
                      vehicleType: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select vehicle type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HATCHBACK">Hatchback</SelectItem>
                      <SelectItem value="SEDAN">Sedan</SelectItem>
                      <SelectItem value="SUV">SUV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="vehicleColor">Color *</Label>
                  <Input
                    id="vehicleColor"
                    placeholder="e.g., Red"
                    value={newVehicle.vehicleColor}
                    onChange={(e) => setNewVehicle({
                      ...newVehicle,
                      vehicleColor: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="seatingCapacity">Seating Capacity</Label>
                  <Input
                    id="seatingCapacity"
                    placeholder="e.g., 4"
                    value={newVehicle.seatingCapacity}
                    onChange={(e) => setNewVehicle({
                      ...newVehicle,
                      seatingCapacity: e.target.value
                    })}
                  />
                </div>
              </div>
              <div className="flex space-x-2">
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
          <h2 className="text-2xl font-semibold">Registered Vehicles</h2>
          {isLoading ? (
            <div className="text-center py-8">Loading vehicles...</div>
          ) : vehicles && vehicles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vehicles.map((vehicle) => (
                <Card key={vehicle.value}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <Car className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{vehicle.text}</h3>
                        <p className="text-sm text-muted-foreground">{vehicle.value}</p>
                        {vehicle.seatingCapacity && (
                          <p className="text-xs text-muted-foreground">
                            Capacity: {vehicle.seatingCapacity} seats
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No vehicles registered yet.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Add your first vehicle to start offering rides.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
