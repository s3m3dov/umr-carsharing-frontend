import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehiclesApi, driversApi, passengersApi } from '@/shared/api/admin-api';
import type {
  AdminVehicleResponse,
  RegisterVehicleRequest,
  UpdateVehicleRequest,
  DriverResponse,
  PassengerResponse,
} from '@/admin/types';
import { VehicleType } from '@/admin/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { getBackendErrorMessage } from '@/shared/api/error-toast';
import { Check, ChevronsUpDown, PlusCircle, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { TableSkeleton } from '@/admin/shared';

const PAGE_SIZE = 20;

const VEHICLE_TYPES = [
  VehicleType.SEDAN,
  VehicleType.SUV,
  VehicleType.MINIVAN,
  VehicleType.HATCHBACK,
] as const;

const USER_PAGE_SIZE = 100;

type OwnerOption = {
  userId: string;
  fullName: string;
  email: string;
};

function formatOwnerName(firstName: string, lastName: string) {
  const name = `${firstName} ${lastName}`.trim();
  return name || 'Unnamed user';
}

function truncate(str: string, len = 8) {
  if (str.length <= len) return str;
  return str.slice(0, len) + '…';
}

// ─── Register Dialog ─────────────────────────────────────────────────────────

interface RegisterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: RegisterVehicleRequest) => void;
  isPending: boolean;
  owners: OwnerOption[];
  ownersLoading: boolean;
}

function RegisterDialog({
  open,
  onOpenChange,
  onSubmit,
  isPending,
  owners,
  ownersLoading,
}: RegisterDialogProps) {
  const [ownerPickerOpen, setOwnerPickerOpen] = useState(false);
  const [form, setForm] = useState<RegisterVehicleRequest>({
    userId: '',
    vehicleName: '',
    vehicleNumber: '',
    vehicleType: VehicleType.SEDAN,
    vehicleColor: '',
    seatingCapacity: '',
  });

  useEffect(() => {
    if (open) {
      setForm({ userId: '', vehicleName: '', vehicleNumber: '', vehicleType: VehicleType.SEDAN, vehicleColor: '', seatingCapacity: '' });
    }
  }, [open]);

  useEffect(() => {
    if (!open || form.userId || owners.length === 0) return;
    setForm((prev) => ({ ...prev, userId: owners[0].userId }));
  }, [open, owners, form.userId]);

  function handleChange(field: keyof RegisterVehicleRequest, value: string) {
    if (field === 'vehicleType') {
      setForm((prev) => ({ ...prev, vehicleType: value as VehicleType }));
      return;
    }
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.userId) return;
    onSubmit(form);
  }

  const selectedOwner = owners.find((owner) => owner.userId === form.userId);
  const selectedOwnerIdentifier = selectedOwner?.email || selectedOwner?.userId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Register Vehicle</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reg-userId">Owner ID *</Label>
            <Popover open={ownerPickerOpen} onOpenChange={setOwnerPickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  id="reg-userId"
                  type="button"
                  variant="outline"
                  role="combobox"
                  aria-expanded={ownerPickerOpen}
                  className="w-full justify-between font-normal"
                  disabled={ownersLoading || owners.length === 0}
                >
                  <span className="min-w-0 truncate text-left">
                    {selectedOwner
                      ? selectedOwnerIdentifier
                      : ownersLoading
                        ? 'Loading users...'
                        : owners.length === 0
                          ? 'No users found'
                          : 'Select user UUID'}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search by UUID or name..." />
                  <CommandList>
                    <CommandEmpty>No users found.</CommandEmpty>
                    <CommandGroup>
                      {owners.map((owner) => (
                        <CommandItem
                          key={owner.userId}
                          value={`${owner.fullName} ${owner.email} ${owner.userId}`}
                          className="items-start py-2"
                          onSelect={() => {
                            handleChange('userId', owner.userId);
                            setOwnerPickerOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              form.userId === owner.userId ? 'opacity-100' : 'opacity-0',
                            )}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm">{owner.fullName}</p>
                            <p className="truncate text-xs text-muted-foreground">{owner.email || owner.userId}</p>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {!form.userId && !ownersLoading && owners.length > 0 && (
              <p className="text-xs text-destructive">Owner selection is required.</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-vehicleName">Vehicle Name *</Label>
            <Input
              id="reg-vehicleName"
              value={form.vehicleName}
              onChange={(e) => handleChange('vehicleName', e.target.value)}
              placeholder="e.g. Toyota Camry"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-vehicleNumber">Vehicle Number *</Label>
            <Input
              id="reg-vehicleNumber"
              value={form.vehicleNumber}
              onChange={(e) => handleChange('vehicleNumber', e.target.value)}
              placeholder="e.g. ABC-1234"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-vehicleType">Vehicle Type</Label>
            <Select
              value={form.vehicleType}
              onValueChange={(v) => handleChange('vehicleType', v)}
            >
              <SelectTrigger id="reg-vehicleType">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {VEHICLE_TYPES.map((t) => (
                  <SelectItem key={t} value={t} className="capitalize">
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-vehicleColor">Color</Label>
            <Input
              id="reg-vehicleColor"
              value={form.vehicleColor ?? ''}
              onChange={(e) => handleChange('vehicleColor', e.target.value)}
              placeholder="e.g. White"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-seatingCapacity">Seats</Label>
            <Input
              id="reg-seatingCapacity"
              value={form.seatingCapacity ?? ''}
              onChange={(e) => handleChange('seatingCapacity', e.target.value)}
              placeholder="e.g. 5"
              type="number"
              min={1}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Registering…' : 'Register'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit Dialog ──────────────────────────────────────────────────────────────

interface EditDialogProps {
  vehicle: AdminVehicleResponse | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (id: string, data: UpdateVehicleRequest) => void;
  isPending: boolean;
}

function EditDialog({ vehicle, onOpenChange, onSubmit, isPending }: EditDialogProps) {
  const [form, setForm] = useState<UpdateVehicleRequest>({
    vehicleName: vehicle?.vehicleName ?? '',
    vehicleType: vehicle?.vehicleType ?? VehicleType.SEDAN,
    vehicleColor: vehicle?.vehicleColor ?? '',
    seatingCapacity: vehicle?.seatingCapacity ?? '',
  });

  useEffect(() => {
    if (vehicle) {
      setForm({
        vehicleName: vehicle.vehicleName,
        vehicleType: vehicle.vehicleType,
        vehicleColor: vehicle.vehicleColor,
        seatingCapacity: vehicle.seatingCapacity,
      });
    }
  }, [vehicle]);

  function handleChange(field: keyof UpdateVehicleRequest, value: string) {
    if (field === 'vehicleType') {
      setForm((prev) => ({ ...prev, vehicleType: value as VehicleType }));
      return;
    }
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (vehicle) onSubmit(vehicle.id, form);
  }

  return (
    <Dialog open={!!vehicle} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Vehicle</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-vehicleName">Vehicle Name</Label>
            <Input
              id="edit-vehicleName"
              value={form.vehicleName ?? ''}
              onChange={(e) => handleChange('vehicleName', e.target.value)}
              placeholder="e.g. Toyota Camry"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-vehicleType">Vehicle Type</Label>
            <Select
              value={form.vehicleType ?? VehicleType.SEDAN}
              onValueChange={(v) => handleChange('vehicleType', v)}
            >
              <SelectTrigger id="edit-vehicleType">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {VEHICLE_TYPES.map((t) => (
                  <SelectItem key={t} value={t} className="capitalize">
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-vehicleColor">Color</Label>
            <Input
              id="edit-vehicleColor"
              value={form.vehicleColor ?? ''}
              onChange={(e) => handleChange('vehicleColor', e.target.value)}
              placeholder="e.g. White"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-seatingCapacity">Seats</Label>
            <Input
              id="edit-seatingCapacity"
              value={form.seatingCapacity ?? ''}
              onChange={(e) => handleChange('seatingCapacity', e.target.value)}
              placeholder="e.g. 5"
              type="number"
              min={1}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving…' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminVehicles() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(0);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [editVehicle, setEditVehicle] = useState<AdminVehicleResponse | null>(null);
  const [deleteVehicle, setDeleteVehicle] = useState<AdminVehicleResponse | null>(null);

  // ── Query ──────────────────────────────────────────────────────────────────

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'vehicles', page],
    queryFn: () => vehiclesApi.list({ page, size: PAGE_SIZE }),
  });

  const { data: driversPage, isLoading: loadingDrivers } = useQuery({
    queryKey: ['admin', 'drivers', 'owners'],
    queryFn: () => driversApi.list({ page: 0, size: USER_PAGE_SIZE }),
  });

  const ownerOptions: OwnerOption[] = [
    ...((driversPage?.content ?? []).map((driver: DriverResponse) => ({
      userId: driver.userId,
      fullName: formatOwnerName(driver.firstName, driver.lastName),
      email: driver.email,
    }))),
  ];

  const ownersLoading = loadingDrivers;

  // ── Mutations ──────────────────────────────────────────────────────────────

  const createMutation = useMutation({
    mutationFn: (body: RegisterVehicleRequest) => vehiclesApi.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'vehicles'] });
      setRegisterOpen(false);
      toast({ title: 'Vehicle registered successfully.' });
    },
    onError: (error) => {
      const message = getBackendErrorMessage(error, 'Failed to register vehicle.');
      toast({ title: 'Failed to register vehicle.', description: message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateVehicleRequest }) =>
      vehiclesApi.update(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'vehicles'] });
      setEditVehicle(null);
      toast({ title: 'Vehicle updated successfully.' });
    },
    onError: (error) => {
      const message = getBackendErrorMessage(error, 'Failed to update vehicle.');
      toast({ title: 'Failed to update vehicle.', description: message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => vehiclesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'vehicles'] });
      setDeleteVehicle(null);
      toast({ title: 'Vehicle deleted successfully.' });
    },
    onError: (error) => {
      const message = getBackendErrorMessage(error, 'Failed to delete vehicle.');
      toast({ title: 'Failed to delete vehicle.', description: message, variant: 'destructive' });
    },
  });

  // ── Render ─────────────────────────────────────────────────────────────────

  const totalPages = data?.totalPages ?? 1;
  const totalElements = data?.totalElements ?? 0;

  return (
    <TooltipProvider>
      <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Vehicles</h1>
          {data && (
            <p className="text-sm text-muted-foreground">
              {totalElements} vehicle{totalElements !== 1 ? 's' : ''} registered
            </p>
          )}
        </div>
        <Button onClick={() => setRegisterOpen(true)} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Register Vehicle
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            All Vehicles
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle #</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Seats</TableHead>
                <TableHead>Owner ID</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            {isLoading ? (
              <TableSkeleton columns={8} />
            ) : isError ? (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-destructive py-8">
                    Failed to load vehicles.
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : (
              <TableBody>
                {data?.content.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No vehicles found.
                    </TableCell>
                  </TableRow>
                )}
                {data?.content.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-mono text-sm font-medium">
                      {vehicle.vehicleNumber}
                    </TableCell>
                    <TableCell>{vehicle.vehicleName}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {vehicle.vehicleType}
                      </Badge>
                    </TableCell>
                    <TableCell>{vehicle.vehicleColor || '—'}</TableCell>
                    <TableCell>{vehicle.seatingCapacity || '—'}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-help">{truncate(vehicle.userId, 8)}</span>
                        </TooltipTrigger>
                        <TooltipContent>{vehicle.userId}</TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(vehicle.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditVehicle(vehicle)}
                          className="gap-1"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteVehicle(vehicle)}
                          className="gap-1 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </Button>
                      </div>
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
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
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
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="gap-1"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Register Dialog */}
      <RegisterDialog
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        onSubmit={(data) => createMutation.mutate(data)}
        isPending={createMutation.isPending}
        owners={ownerOptions}
        ownersLoading={ownersLoading}
      />

      {/* Edit Dialog */}
      <EditDialog
        vehicle={editVehicle}
        onOpenChange={(open) => { if (!open) setEditVehicle(null); }}
        onSubmit={(id, body) => updateMutation.mutate({ id, body })}
        isPending={updateMutation.isPending}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteVehicle}
        onOpenChange={(open) => { if (!open) setDeleteVehicle(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Vehicle</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-semibold">{deleteVehicle?.vehicleName}</span> (
              {deleteVehicle?.vehicleNumber})? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteVehicle && deleteMutation.mutate(deleteVehicle.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </TooltipProvider>
  );
}
