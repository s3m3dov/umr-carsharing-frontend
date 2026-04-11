import { cn } from '@/lib/utils';

interface BrandIconProps {
  className?: string;
  alt?: string;
}

export default function BrandIcon({ className, alt = 'Kamilli Ride' }: BrandIconProps) {
  return (
    <img
      src="/carsharing-favicon.svg"
      alt={alt}
      className={cn('h-10 w-10 rounded-xl', className)}
    />
  );
}
