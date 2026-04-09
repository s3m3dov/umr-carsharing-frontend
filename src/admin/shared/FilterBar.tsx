import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface FilterBarProps {
  children: ReactNode;
  /** When provided, renders a "Clear" button that calls this handler */
  onClear?: () => void;
}

/**
 * Horizontal filter bar. Drop Select, Input, or any control as children.
 * The optional onClear button appears at the far right when a handler is provided.
 */
export function FilterBar({ children, onClear }: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {children}
      {onClear && (
        <Button variant="ghost" size="sm" onClick={onClear} className="gap-1 text-muted-foreground">
          <X className="h-3.5 w-3.5" />
          Clear
        </Button>
      )}
    </div>
  );
}
