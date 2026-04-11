
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  Car, 
  Search, 
  Plus, 
  Calendar, 
  MapPin,
  Clock,
  Users
} from 'lucide-react';

export default function MobileDashboard() {
  const { email } = useAuth();
  const navigate = useNavigate();

  const quickActions = [
    {
      title: 'Find Rides',
      description: 'Search for available rides',
      icon: Search,
      action: () => navigate('/find-rides'),
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      title: 'Create Trip',
      description: 'Offer your ride to others',
      icon: Plus,
      action: () => navigate('/create-trip'),
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      title: 'My Rides',
      description: 'View your bookings',
      icon: Calendar,
      action: () => navigate('/my-rides'),
      color: 'bg-purple-500 hover:bg-purple-600',
    },
    {
      title: 'Vehicles',
      description: 'Manage your vehicles',
      icon: Car,
      action: () => navigate('/vehicles'),
      color: 'bg-orange-500 hover:bg-orange-600',
    },
  ];

  const recentActivities = [
    {
      type: 'ride_booked',
      title: 'Ride Booked',
      description: 'Downtown to Airport',
      time: '2 hours ago',
      status: 'confirmed'
    },
    {
      type: 'trip_created',
      title: 'Trip Created',
      description: 'Mall to University',
      time: '1 day ago',
      status: 'active'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, {email?.split('@')[0] || 'User'}!
            </h1>
            <p className="text-primary-foreground/80">
              Ready for your next journey?
            </p>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <Car className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-foreground">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Card 
                key={index} 
                className="cursor-pointer hover:shadow-lg transition-all duration-200 active:scale-95"
                onClick={action.action}
              >
                <CardContent className="p-4 text-center">
                  <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{action.title}</h3>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Stats Overview */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-foreground">Your Stats</h2>
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">12</div>
              <p className="text-xs text-blue-600/80">Rides Taken</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">8</div>
              <p className="text-xs text-green-600/80">Trips Offered</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">4.9</div>
              <p className="text-xs text-purple-600/80">Rating</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-foreground">Recent Activity</h2>
        <div className="space-y-3">
          {recentActivities.map((activity, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      {activity.type === 'ride_booked' ? (
                        <MapPin className="w-5 h-5 text-primary" />
                      ) : (
                        <Plus className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{activity.title}</h3>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={activity.status === 'confirmed' ? 'default' : 'secondary'}>
                      {activity.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Share Your Ride Today
          </h3>
          <p className="text-muted-foreground mb-4">
            Help others get around while earning some extra cash
          </p>
          <Button 
            onClick={() => navigate('/create-trip')}
            className="w-full bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Trip
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
