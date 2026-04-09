import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
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
  ArrowRight,
} from 'lucide-react';

const modules = [
  {
    to: '/admin/drivers',
    label: 'Drivers',
    icon: UserCheck,
    description: 'Approve, reject, and manage driver accounts',
    color: 'bg-emerald-500/10 text-emerald-600',
  },
  {
    to: '/admin/passengers',
    label: 'Passengers',
    icon: Users,
    description: 'Create, update, and manage passenger accounts',
    color: 'bg-violet-500/10 text-violet-600',
  },
  {
    to: '/admin/vehicles',
    label: 'Vehicles',
    icon: Car,
    description: 'View and manage registered vehicles',
    color: 'bg-orange-500/10 text-orange-600',
  },
  {
    to: '/admin/trips',
    label: 'Trips',
    icon: MapPin,
    description: 'Browse upcoming and historical trips',
    color: 'bg-sky-500/10 text-sky-600',
  },
  {
    to: '/admin/bookings',
    label: 'Bookings',
    icon: BookOpen,
    description: 'View and manage ride bookings',
    color: 'bg-indigo-500/10 text-indigo-600',
  },
  {
    to: '/admin/reviews',
    label: 'Reviews',
    icon: Star,
    description: 'Flag, publish, and remove reviews',
    color: 'bg-amber-500/10 text-amber-600',
  },
  {
    to: '/admin/reports',
    label: 'Reports',
    icon: BarChart2,
    description: 'Driver, revenue, and booking analytics',
    color: 'bg-purple-500/10 text-purple-600',
  },
  {
    to: '/admin/audit-logs',
    label: 'Audit Logs',
    icon: ScrollText,
    description: 'View the full admin action audit trail',
    color: 'bg-slate-500/10 text-slate-600',
  },
  {
    to: '/admin/status',
    label: 'Service Status',
    icon: Activity,
    description: 'Live health check for all backend services',
    color: 'bg-teal-500/10 text-teal-600',
  },
];

export default function AdminDashboard() {
  const { email } = useAuth();

  const initials = email
    ? email.split('@')[0].slice(0, 12)
    : 'Admin';

  return (
    <div className="p-6 space-y-8">
      {/* Welcome header */}
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        <h1 className="text-2xl font-bold">Welcome back, {initials}</h1>
      </div>

      {/* Module grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map(({ to, label, icon: Icon, description, color }) => (
          <Link
            key={to}
            to={to}
            className={cn(
              'group flex items-start gap-4 rounded-xl border bg-card p-4',
              'transition-all duration-150',
              'hover:shadow-md hover:border-border/80 hover:-translate-y-px',
            )}
          >
            <div className={cn('mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', color)}>
              <Icon className="h-4.5 w-4.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm leading-snug">{label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{description}</p>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 mt-1 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-muted-foreground" />
          </Link>
        ))}
      </div>
    </div>
  );
}
