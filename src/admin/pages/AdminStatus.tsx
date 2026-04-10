import { useQueries } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { RefreshCw, CheckCircle2, XCircle, Minus } from 'lucide-react';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';

const SERVICES = [
  { name: 'API Gateway',            path: '/actuator/health' },
  { name: 'Auth Service',           path: '/auth-service/actuator/health' },
  { name: 'User Service',           path: '/user-service/actuator/health' },
  { name: 'Trip Service',           path: '/trip-service/actuator/health' },
  { name: 'Review Service',         path: '/review-service/actuator/health' },
  { name: 'Notification Service',   path: '/notification-service/actuator/health' },
];

type ServiceStatus = 'UP' | 'DOWN' | 'OUT_OF_SERVICE' | 'UNKNOWN';

interface HealthResult {
  status: ServiceStatus;
  responseMs: number;
  checkedAt: Date;
}

async function fetchHealth(path: string): Promise<HealthResult> {
  const start = performance.now();
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      signal: AbortSignal.timeout(6000),
    });
    const responseMs = Math.round(performance.now() - start);
    if (!res.ok) return { status: 'DOWN', responseMs, checkedAt: new Date() };
    const json = await res.json();
    const status: ServiceStatus = json.status ?? 'UNKNOWN';
    return { status, responseMs, checkedAt: new Date() };
  } catch {
    return {
      status: 'DOWN',
      responseMs: Math.round(performance.now() - start),
      checkedAt: new Date(),
    };
  }
}

function StatusIcon({ status }: { status: ServiceStatus | undefined }) {
  if (!status) return <Minus className="h-5 w-5 text-muted-foreground animate-pulse" />;
  if (status === 'UP') return <CheckCircle2 className="h-5 w-5 text-green-500" />;
  return <XCircle className="h-5 w-5 text-destructive" />;
}

function StatusBadge({ status }: { status: ServiceStatus | undefined }) {
  if (!status)
    return <Badge variant="secondary" className="text-[11px] font-medium">Checking</Badge>;
  if (status === 'UP')
    return <Badge variant="secondary" className="text-[11px] font-medium">UP</Badge>;
  if (status === 'DOWN')
    return <Badge variant="destructive">DOWN</Badge>;
  return <Badge variant="outline" className="text-[11px] font-medium">{status}</Badge>;
}

function fmt(date: Date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function AdminStatus() {
  const results = useQueries({
    queries: SERVICES.map((svc) => ({
      queryKey: ['service-health-detail', svc.path],
      queryFn: () => fetchHealth(svc.path),
      refetchInterval: 30_000,
      retry: false,
    })),
  });

  const allDone = results.every((r) => !r.isLoading);
  const upCount = results.filter((r) => r.data?.status === 'UP').length;
  const downCount = results.filter((r) => r.data?.status !== 'UP' && r.data).length;

  const overallOk = allDone && downCount === 0;
  const refreshAll = () => results.forEach((r) => r.refetch());

  return (
    <TooltipProvider>
      <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Service Status</h1>
          <p className="text-sm text-muted-foreground">
            Auto-refreshes every 30 s
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={refreshAll} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Summary banner */}
      <Card className={overallOk ? 'border-green-200 bg-green-500/5' : 'border-destructive/30 bg-destructive/5'}>
        <CardContent className="py-4 flex items-center gap-3">
          <StatusIcon status={allDone ? (overallOk ? 'UP' : 'DOWN') : undefined} />
          <div>
            <p className="font-semibold text-sm">
              {!allDone
                ? 'Checking services…'
                : overallOk
                ? 'All systems operational'
                : `${downCount} service${downCount !== 1 ? 's' : ''} degraded`}
            </p>
            {allDone && (
              <p className="text-xs text-muted-foreground">
                {upCount} of {SERVICES.length} services up
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Service rows */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Services
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {SERVICES.map((svc, i) => {
            const result = results[i];
            const data = result.data;
            return (
              <div key={svc.path}>
                {i > 0 && <Separator />}
                <div className="flex items-center gap-4 px-6 py-4">
                  <StatusIcon status={data?.status} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{svc.name}</p>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="text-xs text-muted-foreground font-mono truncate cursor-pointer">
                          {BASE_URL}{svc.path}
                        </p>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs break-all">{BASE_URL}{svc.path}</TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    {data && (
                      <p className="text-xs text-muted-foreground tabular-nums w-16 text-right">
                        {data.responseMs} ms
                      </p>
                    )}
                    <StatusBadge status={data?.status} />
                    {data && (
                      <p className="text-xs text-muted-foreground w-20 text-right">
                        {fmt(data.checkedAt)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
      </div>
    </TooltipProvider>
  );
}
