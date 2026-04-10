import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsApi } from '@/shared/api/admin-api';
import type { BookingResponse, BookingStatus, UpdateBookingRequest } from '@/admin/types';
import { useToast } from '@/hooks/use-toast';
import { getBackendErrorMessage } from '@/shared/api/error-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { TableSkeleton } from '@/admin/shared';

const BOOKING_STATUSES: BookingStatus[] = [
  'REQUESTED',
  'REJECTED',
  'CONFIRMED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
];

const PAGE_SIZE = 20;

function bookingStatusBadge(status: BookingStatus) {
  switch (status) {
    case 'REQUESTED':
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100">
          {status}
        </Badge>
      );
    case 'CONFIRMED':
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">
          {status}
        </Badge>
      );
    case 'IN_PROGRESS':
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100">
          {status}
        </Badge>
      );
    case 'COMPLETED':
      return (
        <Badge className="bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-100">
          {status}
        </Badge>
      );
    case 'CANCELLED':
    case 'REJECTED':
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-100">
          {status}
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

interface UpdateDialogProps {
  booking: BookingResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function UpdateBookingDialog({ booking, open, onOpenChange }: UpdateDialogProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [status, setStatus] = useState<BookingStatus>(booking.status);
  const [seats, setSeats] = useState<string>(String(booking.requestedSeats));

  const mutation = useMutation({
    mutationFn: (body: UpdateBookingRequest) => bookingsApi.update(booking.bookingId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] });
      toast({ title: 'Booking updated successfully.' });
      onOpenChange(false);
    },
    onError: (error) => {
      const message = getBackendErrorMessage(error, 'Failed to update booking.');
      toast({ title: 'Failed to update booking.', description: message, variant: 'destructive' });
    },
  });

  const handleSubmit = () => {
    const parsedSeats = parseInt(seats, 10);
    const body: UpdateBookingRequest = {};
    if (status !== booking.status) body.status = status;
    if (!isNaN(parsedSeats) && parsedSeats !== booking.requestedSeats) {
      body.requestedSeats = parsedSeats;
    }
    if (!body.status && !body.requestedSeats) {
      onOpenChange(false);
      return;
    }
    mutation.mutate(body);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Booking</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="booking-status">Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as BookingStatus)}>
              <SelectTrigger id="booking-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BOOKING_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="booking-seats">Requested Seats (1–8)</Label>
            <Input
              id="booking-seats"
              type="number"
              min={1}
              max={8}
              value={seats}
              onChange={(e) => setSeats(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving…' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminBookings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [editingBooking, setEditingBooking] = useState<BookingResponse | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'bookings', page],
    queryFn: () => bookingsApi.list({ page, size: PAGE_SIZE }),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => bookingsApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] });
      toast({ title: 'Booking cancelled successfully.' });
    },
    onError: (error) => {
      const message = getBackendErrorMessage(error, 'Failed to cancel booking.');
      toast({ title: 'Failed to cancel booking.', description: message, variant: 'destructive' });
    },
  });

  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  return (
    <TooltipProvider>
      <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bookings</h1>
          {data && (
            <p className="text-sm text-muted-foreground">
              {totalElements} booking{totalElements !== 1 ? 's' : ''} total
            </p>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking ID</TableHead>
              <TableHead>Passenger ID</TableHead>
              <TableHead>Trip ID</TableHead>
              <TableHead>Vehicle #</TableHead>
              <TableHead>Seats</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Ride Time</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          {isLoading ? (
            <TableSkeleton columns={10} />
          ) : isError ? (
            <TableBody>
              <TableRow>
                <TableCell colSpan={10} className="text-center text-destructive py-8">
                  Failed to load bookings.
                </TableCell>
              </TableRow>
            </TableBody>
          ) : (
            <TableBody>
              {data!.content.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                    No bookings found.
                  </TableCell>
                </TableRow>
              )}
              {data!.content.map((booking) => {
                const isFinal =
                  booking.status === 'CANCELLED' || booking.status === 'COMPLETED';
                return (
                  <TableRow key={booking.bookingId}>
                    <TableCell className="font-mono text-xs">
                        <Tooltip>
                          <TooltipTrigger asChild>
                          <span className="cursor-pointer">{booking.bookingId.slice(0, 8)}...</span>
                          </TooltipTrigger>
                          <TooltipContent>{booking.bookingId}</TooltipContent>
                        </Tooltip>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                        <Tooltip>
                          <TooltipTrigger asChild>
                          <span className="cursor-pointer">{booking.passengerId.slice(0, 8)}...</span>
                          </TooltipTrigger>
                          <TooltipContent>{booking.passengerId}</TooltipContent>
                        </Tooltip>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                        <Tooltip>
                          <TooltipTrigger asChild>
                          <span className="cursor-pointer">{booking.tripId.slice(0, 8)}...</span>
                          </TooltipTrigger>
                          <TooltipContent>{booking.tripId}</TooltipContent>
                        </Tooltip>
                    </TableCell>
                    <TableCell className="text-sm">{booking.vehicleNumber}</TableCell>
                    <TableCell className="text-sm">{booking.requestedSeats}</TableCell>
                    <TableCell>{bookingStatusBadge(booking.status)}</TableCell>
                    <TableCell className="text-sm tabular-nums">
                      €{booking.estimatedPrice.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(booking.rideStartTimeUTC).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingBooking(booking)}
                        >
                          Update
                        </Button>
                        {!isFinal && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={cancelMutation.isPending}
                              >
                                Cancel
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to cancel booking{' '}
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="font-mono cursor-pointer">
                                        {booking.bookingId.slice(0, 8)}...
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent>{booking.bookingId}</TooltipContent>
                                  </Tooltip>
                                  ? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Keep</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => cancelMutation.mutate(booking.bookingId)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Cancel Booking
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          )}
        </Table>
      </div>

      {/* Pagination */}
      {data && totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                aria-disabled={page === 0}
                className={page === 0 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
            <PaginationItem>
              <span className="px-4 py-2 text-sm">
                Page {page + 1} of {totalPages}
              </span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                aria-disabled={page >= totalPages - 1}
                className={
                  page >= totalPages - 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Update Dialog */}
      {editingBooking && (
        <UpdateBookingDialog
          booking={editingBooking}
          open={!!editingBooking}
          onOpenChange={(open) => {
            if (!open) setEditingBooking(null);
          }}
        />
      )}
      </div>
    </TooltipProvider>
  );
}
