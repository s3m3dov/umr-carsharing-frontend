import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  UserCheck,
  Users,
  Car,
  MapPin,
  BookOpen,
  Star,
  BarChart2,
  ScrollText,
  Activity,
} from 'lucide-react';

const modules = [
  { to: '/admin/drivers',    label: 'Drivers',         icon: UserCheck,  description: 'Approve, reject, and manage driver accounts' },
  { to: '/admin/passengers', label: 'Passengers',      icon: Users,      description: 'Create, update, and manage passenger accounts' },
  { to: '/admin/vehicles',   label: 'Vehicles',        icon: Car,        description: 'View and manage registered vehicles' },
  { to: '/admin/trips',      label: 'Trips',           icon: MapPin,     description: 'Browse and cancel trips' },
  { to: '/admin/bookings',   label: 'Bookings',        icon: BookOpen,   description: 'View and manage ride bookings' },
  { to: '/admin/reviews',    label: 'Reviews',         icon: Star,       description: 'Flag, publish, and remove reviews' },
  { to: '/admin/reports',    label: 'Reports',         icon: BarChart2,  description: 'Driver, revenue, and booking reports' },
  { to: '/admin/audit-logs', label: 'Audit Logs',      icon: ScrollText, description: 'View the full admin action audit trail' },
  { to: '/admin/status',     label: 'Service Status',  icon: Activity,   description: 'Live health check for all backend services' },
];

export default function AdminDashboard() {
  const { email } = useAuth();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Signed in as {email}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {modules.map(({ to, label, icon: Icon, description }) => (
          <Link key={to} to={to}>
            <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm font-semibold">{label}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
