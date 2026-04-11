import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ButtonProps } from '@/components/ui/button';
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

interface ConfirmOptions {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Variant applied to the confirm button. Defaults to 'destructive'. */
  confirmVariant?: ButtonProps['variant'];
}

interface ActionButtonProps {
  label: string;
  icon?: LucideIcon;
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
  disabled?: boolean;
  onClick: () => void;
  /** When provided, wraps the button in an AlertDialog confirmation. */
  confirm?: ConfirmOptions;
  className?: string;
}

export function ActionButton({
  label,
  icon: Icon,
  variant = 'outline',
  size = 'sm',
  disabled,
  onClick,
  confirm,
  className,
}: ActionButtonProps) {
  const button = (
    <Button variant={variant} size={size} disabled={disabled} onClick={confirm ? undefined : onClick} className={className}>
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {label}
    </Button>
  );

  if (!confirm) return button;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{button}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{confirm.title}</AlertDialogTitle>
          <AlertDialogDescription>{confirm.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{confirm.cancelLabel ?? 'Cancel'}</AlertDialogCancel>
          <AlertDialogAction onClick={onClick}>{confirm.confirmLabel ?? 'Confirm'}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
