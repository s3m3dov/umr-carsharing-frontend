import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import Layout from '@/components/Layout';
import {
  Search,
  Calendar,
  Ticket,
  User,
  ArrowRight,
} from 'lucide-react';

const modules = [
  {
    to: '/find-rides',
    label: 'Find Rides',
    icon: Search,
    description: 'Search routes and join upcoming rides',
    color: 'bg-sky-500/10 text-sky-600',
  },
  {
    to: '/my-rides',
    label: 'My Rides',
    icon: Calendar,
    description: 'Track upcoming and completed bookings',
    color: 'bg-emerald-500/10 text-emerald-600',
  },
  {
    to: '/my-rides',
    label: 'Bookings',
    icon: Ticket,
    description: 'Review ride history and booking details',
    color: 'bg-indigo-500/10 text-indigo-600',
  },
  {
    to: '/profile',
    label: 'Profile',
    icon: User,
    description: 'Manage your account and contact information',
    color: 'bg-amber-500/10 text-amber-600',
  },
];

export default function PassengerDashboard() {
  const { email } = useAuth();

  const initials = email ? email.split('@')[0].slice(0, 12) : 'Passenger';

  return (
    <Layout>
      <div className="space-y-8">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString(undefined, {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          <h1 className="text-2xl font-bold">Welcome back, {initials}</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map(({ to, label, icon: Icon, description, color }) => (
            <Link
              key={`${to}-${label}`}
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
    </Layout>
  );
}
