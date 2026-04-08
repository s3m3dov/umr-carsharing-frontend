import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { driversApi } from '@/admin/api';
import type { DriverResponse, DriverStatus, UpdateDriverRequest } from '@/admin/types';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, ChevronRight, CheckCheck, XCircle } from 'lucide-react';

const PAGE_SIZE = 20;

type StatusFilter = 'ALL' | DriverStatus;

function statusBadge(status: DriverStatus) {
  if (status === 'ACTIVE')
    return <Badge className="bg-green-500/10 text-green-700 border-green-200 hover:bg-green-500/10">ACTIVE</Badge>;
  if (status === 'PENDING')
    return <Badge className="bg-amber-500/10 text-amber-700 border-amber-200 hover:bg-amber-500/10">PENDING</Badge>;
  return <Badge variant="destructive">REJECTED</Badge>;
}

const editSchema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  phoneNumber: z.string().optional(),
  age: z.coerce.number().int().min(18).max(100).optional(),
  licenseNumber: z.string().optional(),
});

type EditFormValues = z.infer<typeof editSchema>;

export default function AdminDrivers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editDriver, setEditDriver] = useState<DriverResponse | null>(null);
  const [deleteDriver, setDeleteDriver] = useState<DriverResponse | null>(null);

  const queryKey = ['admin-drivers', { status: statusFilter, page }] as const;

  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn: () =>
      driversApi.list({
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        page,
        size: PAGE_SIZE,
      }),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-drivers'] });

  const approveMutation = useMutation({
    mutationFn: (id: string) => driversApi.approve(id),
    onSuccess: () => { toast({ title: 'Driver approved' }); invalidate(); },
    onError: () => toast({ title: 'Failed to approve driver', variant: 'destructive' }),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => driversApi.reject(id),
    onSuccess: () => { toast({ title: 'Driver rejected' }); invalidate(); },
    onError: () => toast({ title: 'Failed to reject driver', variant: 'destructive' }),
  });

  const bulkApproveMutation = useMutation({
    mutationFn: () => driversApi.bulkApprove({ driverIds: Array.from(selectedIds) }),
    onSuccess: () => {
      toast({ title: `${selectedIds.size} driver(s) approved` });
      setSelectedIds(new Set());
      invalidate();
    },
    onError: () => toast({ title: 'Bulk approve failed', variant: 'destructive' }),
  });

  const bulkRejectMutation = useMutation({
    mutationFn: () => driversApi.bulkReject({ driverIds: Array.from(selectedIds) }),
    onSuccess: () => {
      toast({ title: `${selectedIds.size} driver(s) rejected` });
      setSelectedIds(new Set());
      invalidate();
    },
    onError: () => toast({ title: 'Bulk reject failed', variant: 'destructive' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateDriverRequest }) =>
      driversApi.update(id, body),
    onSuccess: () => {
      toast({ title: 'Driver updated' });
      setEditDriver(null);
      invalidate();
    },
    onError: () => toast({ title: 'Failed to update driver', variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => driversApi.delete(id),
    onSuccess: () => {
      toast({ title: 'Driver deleted' });
      setDeleteDriver(null);
      invalidate();
    },
    onError: () => toast({ title: 'Failed to delete driver', variant: 'destructive' }),
  });

  const editForm = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
  });

  function openEdit(driver: DriverResponse) {
    editForm.reset({
      firstName: driver.firstName,
      lastName: driver.lastName,
      phoneNumber: driver.phoneNumber ?? '',
      age: driver.age,
      licenseNumber: driver.licenseNumber ?? '',
    });
    setEditDriver(driver);
  }

  function handleEditSubmit(values: EditFormValues) {
    if (!editDriver) return;
    updateMutation.mutate({ id: editDriver.userId, body: values });
  }

  function toggleRow(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (!data) return;
    const allIds = data.content.map((d) => d.userId);
    const allSelected = allIds.every((id) => selectedIds.has(id));
    if (allSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        allIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        allIds.forEach((id) => next.add(id));
        return next;
      });
    }
  }

  const drivers = data?.content ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalElements = data?.totalElements ?? 0;
  const allOnPageSelected =
    drivers.length > 0 && drivers.every((d) => selectedIds.has(d.userId));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Drivers</h1>
          {!isLoading && (
            <p className="text-sm text-muted-foreground">{totalElements} total</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-green-700 border-green-200 hover:bg-green-50"
                onClick={() => bulkApproveMutation.mutate()}
                disabled={bulkApproveMutation.isPending}
              >
                <CheckCheck className="h-4 w-4" />
                Bulk Approve ({selectedIds.size})
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/5"
                onClick={() => bulkRejectMutation.mutate()}
                disabled={bulkRejectMutation.isPending}
              >
                <XCircle className="h-4 w-4" />
                Bulk Reject ({selectedIds.size})
              </Button>
            </>
          )}

          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v as StatusFilter);
              setPage(0);
              setSelectedIds(new Set());
            }}
          >
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : isError ? (
        <p className="text-sm text-destructive">Failed to load drivers.</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={allOnPageSelected}
                    onCheckedChange={toggleAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>License #</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drivers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                    No drivers found.
                  </TableCell>
                </TableRow>
              ) : (
                drivers.map((driver) => (
                  <TableRow key={driver.userId}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(driver.userId)}
                        onCheckedChange={() => toggleRow(driver.userId)}
                        aria-label={`Select ${driver.firstName}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {driver.firstName} {driver.lastName}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{driver.email}</TableCell>
                    <TableCell>{driver.phoneNumber}</TableCell>
                    <TableCell className="font-mono text-sm">{driver.licenseNumber}</TableCell>
                    <TableCell>{statusBadge(driver.driverStatus)}</TableCell>
                    <TableCell>{driver.age}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(driver.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {driver.driverStatus === 'PENDING' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-700 border-green-200 hover:bg-green-50 h-7 px-2 text-xs"
                              onClick={() => approveMutation.mutate(driver.userId)}
                              disabled={approveMutation.isPending}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive border-destructive/30 hover:bg-destructive/5 h-7 px-2 text-xs"
                              onClick={() => rejectMutation.mutate(driver.userId)}
                              disabled={rejectMutation.isPending}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-xs"
                          onClick={() => openEdit(driver)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive border-destructive/30 hover:bg-destructive/5 h-7 px-2 text-xs"
                          onClick={() => setDeleteDriver(driver)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && !isError && totalPages > 0 && (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 0}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages - 1}
            className="gap-1"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editDriver} onOpenChange={(open) => !open && setEditDriver(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Driver</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={editForm.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="licenseNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>License Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditDriver(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Saving...' : 'Save'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteDriver} onOpenChange={(open) => !open && setDeleteDriver(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Driver</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-medium">
                {deleteDriver?.firstName} {deleteDriver?.lastName}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteDriver && deleteMutation.mutate(deleteDriver.userId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
