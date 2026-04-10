import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { passengerApi as userApi } from '@/shared/api/passenger-api';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Calendar, MapPin, Clock, Car } from 'lucide-react';

export default function PassengerDashboard() {
  const { email: userId } = useAuth();

  const { data: upcomingRides } = useQuery({
    queryKey: ['upcomingRides', userId],
    queryFn: () => userApi.getUpcomingRides(userId!),
    enabled: !!userId,
  });

  const upcomingRidesData = upcomingRides || [];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {userId}!</h1>
          <p className="text-muted-foreground">Here's your passenger dashboard</p>
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
              <CardTitle className="text-sm font-medium">Find a Ride</CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Link to="/find-rides">
                <Button size="sm" className="mt-1">Search Rides</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5" />
                <span>Find a Ride</span>
              </CardTitle>
              <CardDescription>Search for available rides in your area</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/find-rides">
                <Button className="w-full">Search Rides</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>My Rides</span>
              </CardTitle>
              <CardDescription>View your booked and past rides</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/my-rides">
                <Button variant="outline" className="w-full">View My Rides</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Rides */}
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
                No upcoming rides. <Link to="/find-rides" className="text-primary hover:underline">Find a ride</Link>
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
