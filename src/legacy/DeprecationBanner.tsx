import type { ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

type BannerVariant = 'deprecated' | 'unavailable';

const MESSAGES: Record<BannerVariant, string> = {
  deprecated:   'This screen is deprecated and will be removed in the next release.',
  unavailable:  'This screen is unavailable and will be removed in the next release.',
};

interface DeprecationBannerProps {
  children: ReactNode;
  /**
   * 'deprecated'  — screen still works, flagged for removal.
   * 'unavailable' — screen is non-functional (confirmed via R0-VERIFY audit).
   * Defaults to 'deprecated' until the R0-VERIFY legacy audit is complete.
   */
  variant?: BannerVariant;
}

export function DeprecationBanner({ children, variant = 'deprecated' }: DeprecationBannerProps) {
  return (
    <>
      <div className="flex items-center gap-2 bg-amber-50 border-b border-amber-200 px-4 py-2 text-sm text-amber-800">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        {MESSAGES[variant]}
      </div>
      {children}
    </>
  );
}
