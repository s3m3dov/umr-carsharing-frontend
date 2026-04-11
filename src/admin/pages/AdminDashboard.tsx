import { Link } from 'react-router-dom';
import { useQueries } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  RefreshCw,
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

interface ServiceHealthSnapshot {
  status: ServiceStatus;
  responseMs: number;
}

async function fetchHealth(path: string): Promise<ServiceHealthSnapshot> {
  const start = performance.now();
  try {
    const res = await fetch(`${BASE_URL}${path}`, { signal: AbortSignal.timeout(6000) });
    const responseMs = Math.round(performance.now() - start);
    if (!res.ok) {
      return { status: 'DOWN', responseMs };
    }
    const json = await res.json();
    return {
      status: (json.status as ServiceStatus) ?? 'UNKNOWN',
      responseMs,
    };
  } catch {
    return {
      status: 'DOWN',
      responseMs: Math.round(performance.now() - start),
    };
  }
}

function ServiceDot({ status }: { status: ServiceStatus | undefined }) {
  return (
    <span
      className={cn(
        'inline-block h-2.5 w-2.5 rounded-full',
        !status
          ? 'bg-muted-foreground/40 animate-pulse'
          : status === 'UP'
          ? 'bg-green-500'
          : 'bg-destructive',
      )}
    />
  );
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
  const isRefreshing = healthResults.some((r) => r.isFetching);
  const upCount = healthResults.filter((r) => r.data?.status === 'UP').length;
  const downCount = healthResults.filter((r) => r.data && r.data.status !== 'UP').length;
  const allOk = allHealthDone && downCount === 0;
  const avgResponseMs = (() => {
    const samples = healthResults
      .map((r) => r.data)
      .filter((d): d is ServiceHealthSnapshot => !!d && d.status === 'UP');
    if (samples.length === 0) return null;
    return Math.round(samples.reduce((sum, s) => sum + s.responseMs, 0) / samples.length);
  })();

  const refreshHealth = () => {
    healthResults.forEach((r) => r.refetch());
  };

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
        'border shadow-sm',
        !allHealthDone
          ? ''
          : allOk
          ? 'border-green-200/80 bg-green-500/[0.04]'
          : 'border-destructive/30 bg-destructive/[0.04]',
      )}>
        <CardContent className="py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex items-center gap-2.5">
              {!allHealthDone ? (
                <Minus className="h-4 w-4 text-muted-foreground animate-pulse" />
              ) : allOk ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-destructive" />
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-5">
                  {!allHealthDone
                    ? 'Checking services…'
                    : allOk
                    ? 'All systems operational'
                    : `${downCount} service${downCount !== 1 ? 's' : ''} degraded`}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <div
                    className="inline-flex items-center gap-1 rounded-full border bg-background/70 px-2 py-1"
                    aria-label="Service status dots"
                  >
                    {SERVICES.map((svc, i) => (
                      <ServiceDot key={svc.path} status={healthResults[i].data?.status} />
                    ))}
                  </div>
                  <Badge variant="secondary" className="text-[11px] font-medium">
                    {allHealthDone ? `${upCount}/${SERVICES.length} up` : 'Checking'}
                  </Badge>
                  {avgResponseMs != null && (
                    <Badge variant="outline" className="text-[11px] font-medium">
                      Avg {avgResponseMs} ms
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <Button variant="outline" size="sm" className="gap-2" onClick={refreshHealth}>
                <RefreshCw className={cn('h-3.5 w-3.5', isRefreshing && 'animate-spin')} />
                Refresh
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/admin/status">Details</Link>
              </Button>
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
