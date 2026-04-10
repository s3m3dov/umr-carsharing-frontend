import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { auditLogsApi } from '@/shared/api/admin-api';
import { TableSkeleton } from '@/admin/shared';
import type { AuditAction, EntityType } from '@/admin/types';

const AUDIT_ACTIONS: AuditAction[] = [
  'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT',
  'FLAG', 'CANCEL', 'PUBLISH', 'RESTORE', 'LOGIN',
  'LOGOUT', 'BOOK', 'COMPLETE', 'REVIEW',
];

const ENTITY_TYPES: EntityType[] = [
  'DRIVER', 'PASSENGER', 'VEHICLE', 'TRIP',
  'BOOKING', 'REVIEW', 'USER', 'ADMIN', 'SYSTEM',
];

const ACTION_BADGE_CLASS: Record<AuditAction, string> = {
  CREATE:   'bg-green-500/10 text-green-700 border-green-200 hover:bg-green-500/10',
  UPDATE:   'bg-blue-500/10 text-blue-700 border-blue-200 hover:bg-blue-500/10',
  DELETE:   'bg-red-500/10 text-red-700 border-red-200 hover:bg-red-500/10',
  APPROVE:  'bg-green-500/10 text-green-700 border-green-200 hover:bg-green-500/10',
  REJECT:   'bg-red-500/10 text-red-700 border-red-200 hover:bg-red-500/10',
  FLAG:     'bg-orange-500/10 text-orange-700 border-orange-200 hover:bg-orange-500/10',
  CANCEL:   'bg-red-500/10 text-red-700 border-red-200 hover:bg-red-500/10',
  PUBLISH:  'bg-green-500/10 text-green-700 border-green-200 hover:bg-green-500/10',
  RESTORE:  'bg-gray-500/10 text-gray-700 border-gray-200 hover:bg-gray-500/10',
  LOGIN:    'bg-gray-500/10 text-gray-700 border-gray-200 hover:bg-gray-500/10',
  LOGOUT:   'bg-gray-500/10 text-gray-700 border-gray-200 hover:bg-gray-500/10',
  BOOK:     'bg-gray-500/10 text-gray-700 border-gray-200 hover:bg-gray-500/10',
  COMPLETE: 'bg-gray-500/10 text-gray-700 border-gray-200 hover:bg-gray-500/10',
  REVIEW:   'bg-gray-500/10 text-gray-700 border-gray-200 hover:bg-gray-500/10',
};

const PAGE_SIZE = 20;

export default function AdminAuditLogs() {
  const [actionFilter, setActionFilter] = useState<AuditAction | ''>('');
  const [entityTypeFilter, setEntityTypeFilter] = useState<EntityType | ''>('');
  const [performedByInput, setPerformedByInput] = useState('');
  const [performedByQuery, setPerformedByQuery] = useState('');
  const [page, setPage] = useState(0);

  // Debounce the performedBy text input
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPerformedByQuery(performedByInput);
      setPage(0);
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [performedByInput]);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [actionFilter, entityTypeFilter]);

  const { data, isLoading, isError } = useQuery({
    queryKey: [
      'admin-audit-logs',
      { action: actionFilter, entityType: entityTypeFilter, performedBy: performedByQuery, page },
    ],
    queryFn: () =>
      auditLogsApi.list({
        action: actionFilter || undefined,
        entityType: entityTypeFilter || undefined,
        performedBy: performedByQuery || undefined,
        page,
        size: PAGE_SIZE,
      }),
  });

  const clearFilters = () => {
    setActionFilter('');
    setEntityTypeFilter('');
    setPerformedByInput('');
    setPerformedByQuery('');
    setPage(0);
  };

  const totalPages = data?.totalPages ?? 0;

  return (
    <TooltipProvider>
      <div className="p-6 space-y-6">
      {/* Header */}
      <h1 className="text-2xl font-bold">Audit Logs</h1>

      {/* Filter bar */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-end gap-4">
            {/* Action filter */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="action-filter" className="text-xs">Action</Label>
              <Select
                value={actionFilter}
                onValueChange={(val) => setActionFilter(val === 'ALL' ? '' : val as AuditAction)}
              >
                <SelectTrigger id="action-filter" className="w-40">
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All actions</SelectItem>
                  {AUDIT_ACTIONS.map((a) => (
                    <SelectItem key={a} value={a}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Entity type filter */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="entity-filter" className="text-xs">Entity Type</Label>
              <Select
                value={entityTypeFilter}
                onValueChange={(val) => setEntityTypeFilter(val === 'ALL' ? '' : val as EntityType)}
              >
                <SelectTrigger id="entity-filter" className="w-40">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All types</SelectItem>
                  {ENTITY_TYPES.map((e) => (
                    <SelectItem key={e} value={e}>{e}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Performed by */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="performed-by" className="text-xs">Performed By</Label>
              <Input
                id="performed-by"
                placeholder="Email or ID..."
                value={performedByInput}
                onChange={(e) => setPerformedByInput(e.target.value)}
                className="w-52"
              />
            </div>

            {/* Clear button */}
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {data ? `${data.totalElements} entries` : 'Audit Entries'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity Type</TableHead>
                <TableHead>Entity ID</TableHead>
                <TableHead>Performed By</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            {isLoading ? (
              <TableSkeleton columns={7} />
            ) : isError ? (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-destructive py-8">
                    Failed to load audit logs.
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : (
              <TableBody>
                {data!.content.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No audit logs found.
                    </TableCell>
                  </TableRow>
                )}
                {data!.content.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={ACTION_BADGE_CLASS[log.action]}>
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.entityType}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-default">{log.entityId.slice(0, 8)}</span>
                        </TooltipTrigger>
                        <TooltipContent>{log.entityId}</TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell className="text-sm max-w-[180px] truncate">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="block truncate cursor-default">{log.performedBy}</span>
                        </TooltipTrigger>
                        <TooltipContent>{log.performedBy}</TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell className="text-sm">{log.serviceName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="block truncate cursor-default">
                            {log.details.length > 50
                              ? `${log.details.slice(0, 50)}…`
                              : log.details}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs whitespace-pre-wrap">{log.details}</TooltipContent>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            )}
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {data && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page + 1} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="gap-1"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      </div>
    </TooltipProvider>
  );
}
