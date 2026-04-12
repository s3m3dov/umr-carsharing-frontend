import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { passengersApi } from '@/shared/api/admin-api';
import type { PassengerResponse, UpdatePassengerRequest } from '@/admin/types';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
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
import { useToast } from '@/hooks/use-toast';
import { getBackendErrorMessage } from '@/shared/api/error-toast';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TableSkeleton } from '@/admin/shared';

const PAGE_SIZE = 20;

const editSchema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  phoneNumber: z.string().optional(),
  age: z.coerce.number().int().min(1).max(120).optional(),
});

type EditFormValues = z.infer<typeof editSchema>;

export default function AdminPassengers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(0);
  const [editPassenger, setEditPassenger] = useState<PassengerResponse | null>(null);
  const [deletePassenger, setDeletePassenger] = useState<PassengerResponse | null>(null);

  const queryKey = ['admin-passengers', { page }] as const;

  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn: () => passengersApi.list({ page, size: PAGE_SIZE }),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-passengers'] });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdatePassengerRequest }) =>
      passengersApi.update(id, body),
    onSuccess: () => {
      toast({ title: 'Passenger updated' });
      setEditPassenger(null);
      invalidate();
    },
    onError: (error) => {
      const message = getBackendErrorMessage(error, 'Failed to update passenger');
      toast({ title: 'Failed to update passenger', description: message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => passengersApi.delete(id),
    onSuccess: () => {
      toast({ title: 'Passenger deleted' });
      setDeletePassenger(null);
      invalidate();
    },
    onError: (error) => {
      const message = getBackendErrorMessage(error, 'Failed to delete passenger');
      toast({ title: 'Failed to delete passenger', description: message, variant: 'destructive' });
    },
  });

  const editForm = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
  });

  function openEdit(passenger: PassengerResponse) {
    editForm.reset({
      firstName: passenger.firstName,
      lastName: passenger.lastName,
      phoneNumber: passenger.phoneNumber ?? '',
      age: passenger.age,
    });
    setEditPassenger(passenger);
  }

  function handleEditSubmit(values: EditFormValues) {
    if (!editPassenger) return;
    updateMutation.mutate({ id: editPassenger.userId, body: values });
  }

  const passengers = data?.content ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalElements = data?.totalElements ?? 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Passengers</h1>
          {!isLoading && (
            <p className="text-sm text-muted-foreground">{totalElements} total</p>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          {isLoading ? (
            <TableSkeleton columns={6} />
          ) : isError ? (
            <TableBody>
              <TableRow>
                <TableCell colSpan={6} className="text-center text-destructive py-8">
                  Failed to load passengers.
                </TableCell>
              </TableRow>
            </TableBody>
          ) : (
            <TableBody>
              {passengers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No passengers found.
                  </TableCell>
                </TableRow>
              ) : (
                passengers.map((passenger) => (
                  <TableRow key={passenger.userId}>
                    <TableCell className="font-medium">
                      {passenger.firstName} {passenger.lastName}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{passenger.email}</TableCell>
                    <TableCell>{passenger.phoneNumber}</TableCell>
                    <TableCell>{passenger.age}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {passenger.createdAt ? new Date(passenger.createdAt).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-xs"
                          onClick={() => openEdit(passenger)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive border-destructive/30 hover:bg-destructive/5 h-7 px-2 text-xs"
                          onClick={() => setDeletePassenger(passenger)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          )}
        </Table>
      </div>

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
      <Dialog open={!!editPassenger} onOpenChange={(open) => !open && setEditPassenger(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Passenger</DialogTitle>
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
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditPassenger(null)}
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
      <AlertDialog
        open={!!deletePassenger}
        onOpenChange={(open) => !open && setDeletePassenger(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Passenger</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-medium">
                {deletePassenger?.firstName} {deletePassenger?.lastName}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deletePassenger && deleteMutation.mutate(deletePassenger.userId)}
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
