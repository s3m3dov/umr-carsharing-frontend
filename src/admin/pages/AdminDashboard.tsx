import { Link } from 'react-router-dom';
import { useQueries } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
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
  CheckCircle2,
  XCircle,
  Minus,
} from 'lucide-react';

// ─── Nav module grid ──────────────────────────────────────────────────────────

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

// ─── Health check ─────────────────────────────────────────────────────────────

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';

const SERVICES = [
  { name: 'API Gateway',          path: '/actuator/health' },
  { name: 'Auth Service',         path: '/auth-service/actuator/health' },
  { name: 'User Service',         path: '/user-service/actuator/health' },
  { name: 'Trip Service',         path: '/trip-service/actuator/health' },
  { name: 'Review Service',       path: '/review-service/actuator/health' },
  { name: 'Notification Service', path: '/notification-service/actuator/health' },
];

type ServiceStatus = 'UP' | 'DOWN' | 'OUT_OF_SERVICE' | 'UNKNOWN';

async function fetchHealth(path: string): Promise<ServiceStatus> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return 'DOWN';
    const json = await res.json();
    return (json.status as ServiceStatus) ?? 'UNKNOWN';
  } catch {
    return 'DOWN';
  }
}

// ─── Health summary ───────────────────────────────────────────────────────────

function ServiceDot({ status }: { status: ServiceStatus | undefined }) {
  if (!status) return <span className="inline-block h-2 w-2 rounded-full bg-muted-foreground/40 animate-pulse" />;
  if (status === 'UP') return <span className="inline-block h-2 w-2 rounded-full bg-green-500" />;
  return <span className="inline-block h-2 w-2 rounded-full bg-destructive" />;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { email } = useAuth();

  const initials = email ? email.split('@')[0].slice(0, 12) : 'Admin';

  // Health queries
  const healthResults = useQueries({
    queries: SERVICES.map((svc) => ({
      queryKey: ['service-health-summary', svc.path],
      queryFn: () => fetchHealth(svc.path),
      refetchInterval: 30_000,
      retry: false,
    })),
  });

  const allHealthDone = healthResults.every((r) => !r.isLoading);
  const upCount = healthResults.filter((r) => r.data === 'UP').length;
  const downCount = healthResults.filter((r) => r.data && r.data !== 'UP').length;
  const allOk = allHealthDone && downCount === 0;

  return (
    <div className="p-6 space-y-8">
      {/* Welcome header */}
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        <h1 className="text-2xl font-bold">Welcome back, {initials}</h1>
      </div>

      {/* Service health summary */}
      <Card className={cn(
        'border',
        !allHealthDone
          ? ''
          : allOk
          ? 'border-green-200 bg-green-500/5'
          : 'border-destructive/30 bg-destructive/5',
      )}>
        <CardContent className="py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              {!allHealthDone ? (
                <Minus className="h-4 w-4 text-muted-foreground animate-pulse" />
              ) : allOk ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-destructive" />
              )}
              <div>
                <p className="text-sm font-semibold">
                  {!allHealthDone
                    ? 'Checking services…'
                    : allOk
                    ? 'All systems operational'
                    : `${downCount} service${downCount !== 1 ? 's' : ''} degraded`}
                </p>
                <p className="text-xs text-muted-foreground">
                  {allHealthDone
                    ? `${upCount} of ${SERVICES.length} services up`
                    : 'Auto-refreshes every 30 s'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {SERVICES.map((svc, i) => (
                <div key={svc.path} className="flex flex-col items-center gap-1">
                  <ServiceDot status={healthResults[i].data} />
                  <span className="text-[10px] text-muted-foreground hidden sm:block">{svc.name.split(' ')[0]}</span>
                </div>
              ))}
              <Link
                to="/admin/status"
                className="ml-2 text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
              >
                Details
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

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
