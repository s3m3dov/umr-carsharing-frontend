import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { driverApi } from '@/shared/api/driver-api';
import { cn } from '@/lib/utils';
import Layout from '@/components/Layout';
import {
  Plus,
  Calendar,
  Car,
  Navigation,
  User,
  History,
  Star,
  ArrowRight,
} from 'lucide-react';

const modules = [
  {
    to: '/offer-ride',
    label: 'Offer Ride',
    icon: Plus,
    description: 'Create a new trip and share your route',
    color: 'bg-emerald-500/10 text-emerald-600',
  },
  {
    to: '/my-rides',
    label: 'My Rides',
    icon: Calendar,
    description: 'View and track your offered rides',
    color: 'bg-sky-500/10 text-sky-600',
  },
  {
    to: '/vehicles',
    label: 'Vehicles',
    icon: Car,
    description: 'Manage your registered vehicles',
    color: 'bg-orange-500/10 text-orange-600',
  },
  {
    to: '/profile',
    label: 'Profile',
    icon: User,
    description: 'Update account and contact information',
    color: 'bg-amber-500/10 text-amber-600',
  },
  {
    to: '/my-rides',
    label: 'Ride History',
    icon: History,
    description: 'Review past trips and ride history',
    color: 'bg-rose-500/10 text-rose-600',
  },
  {
    to: '/reviews',
    label: 'Reviews',
    icon: Star,
    description: 'Read feedback and leave passenger reviews',
    color: 'bg-yellow-500/10 text-yellow-700',
  },
];

export default function DriverDashboard() {
  const { email, userId } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ['driverProfile', userId],
    queryFn: () => driverApi.getProfile(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  const { data: upcomingRides, isLoading: loadingUpcoming } = useQuery({
    queryKey: ['upcomingRides', userId],
    queryFn: () => driverApi.getUpcomingRides(userId!),
    enabled: !!userId,
  });

  const { data: historyRides, isLoading: loadingHistory } = useQuery({
    queryKey: ['historyRides', userId],
    queryFn: () => driverApi.getHistoryRides(userId!),
    enabled: !!userId,
  });

  const { data: rating, isLoading: loadingRating } = useQuery({
    queryKey: ['driver-rating', userId],
    queryFn: () => driverApi.getDriverRating(userId!),
    enabled: !!userId,
  });

  const displayName =
    (profile as { fullName?: string } | undefined)?.fullName ??
    (email ? email.split('@')[0].slice(0, 12) : 'Driver');

  const upcomingCount = loadingUpcoming ? null : (upcomingRides?.length ?? 0);
  const completedCount = loadingHistory ? null : (historyRides?.length ?? 0);
  const avgRating = loadingRating ? null : (typeof rating === 'number' ? rating.toFixed(1) : '—');

  return (
    <Layout>
      <div className="p-6 space-y-8">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString(undefined, {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          <h1 className="text-2xl font-bold">Welcome back, {displayName}</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex-1 rounded-xl border bg-card p-4">
            <p className="text-xs text-muted-foreground mb-1">Upcoming</p>
            <p className="text-2xl font-bold">{upcomingCount ?? '—'}</p>
          </div>
          <div className="flex-1 rounded-xl border bg-card p-4">
            <p className="text-xs text-muted-foreground mb-1">Completed</p>
            <p className="text-2xl font-bold">{completedCount ?? '—'}</p>
          </div>
          <div className="flex-1 rounded-xl border bg-card p-4">
            <p className="text-xs text-muted-foreground mb-1">Rating</p>
            <p className="text-2xl font-bold">{avgRating ?? '—'}</p>
          </div>
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
