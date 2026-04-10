import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { driverApi as userApi } from '@/shared/api/driver-api';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Car, Navigation, Calendar, MapPin, Clock, Plus } from 'lucide-react';

export default function DriverDashboard() {
  const { email: userId } = useAuth();

  const { data: upcomingRides } = useQuery({
    queryKey: ['upcomingRides', userId],
    queryFn: () => userApi.getUpcomingRides(userId!),
    enabled: !!userId,
  });

  const { data: vehicles } = useQuery({
    queryKey: ['vehicles', userId],
    queryFn: () => userApi.getVehicles(userId!),
    enabled: !!userId,
  });

  const upcomingRidesData = upcomingRides || [];
  const vehiclesData = vehicles || [];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {userId}!</h1>
          <p className="text-muted-foreground">Here's your driver dashboard</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Rides</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingRidesData.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Vehicles</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vehiclesData.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Offer a Ride</span>
              </CardTitle>
              <CardDescription>Create a new trip and help others commute</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/offer-ride">
                <Button className="w-full">Create Trip</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Car className="h-5 w-5" />
                <span>My Vehicles</span>
              </CardTitle>
              <CardDescription>Manage your registered vehicles</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/vehicles">
                <Button variant="outline" className="w-full">Manage Vehicles</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Navigation className="h-5 w-5" />
                <span>Track Ride</span>
              </CardTitle>
              <CardDescription>Track an active ride in real time</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/track-ride">
                <Button variant="outline" className="w-full">Track Ride</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Rides</CardTitle>
              <CardDescription>Your next scheduled rides</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingRidesData.length > 0 ? (
                <div className="space-y-4">
                  {upcomingRidesData.slice(0, 3).map((ride) => (
                    <div key={ride.tripId} className="flex items-center space-x-4 rounded-lg border p-4">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center space-x-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{ride.pickupPoint.placeAddress} → {ride.destinationPoint.placeAddress}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{new Date(ride.rideStartTime).toLocaleString()}</span>
                        </div>
                        {ride.vehicleNumber && (
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Car className="h-4 w-4" />
                            <span>{ride.vehicleNumber}</span>
                          </div>
                        )}
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          ride.tripStatus === 'ALLOTTED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {ride.tripStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                  <Link to="/my-rides">
                    <Button variant="outline" className="w-full">View All Rides</Button>
                  </Link>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  No upcoming rides. <Link to="/offer-ride" className="text-primary hover:underline">Offer a ride</Link>
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>My Vehicles</CardTitle>
              <CardDescription>Your registered vehicles</CardDescription>
            </CardHeader>
            <CardContent>
              {vehiclesData.length > 0 ? (
                <div className="space-y-4">
                  {vehiclesData.slice(0, 3).map((vehicle) => (
                    <div key={vehicle.value} className="flex items-center space-x-4 rounded-lg border p-4">
                      <Car className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{vehicle.text}</p>
                        <p className="text-sm text-muted-foreground">{vehicle.value}</p>
                      </div>
                    </div>
                  ))}
                  <Link to="/vehicles">
                    <Button variant="outline" className="w-full">Manage Vehicles</Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-2">No vehicles registered</p>
                  <Link to="/vehicles">
                    <Button>Add Vehicle</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
