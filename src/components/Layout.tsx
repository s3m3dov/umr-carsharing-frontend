
import { ReactNode, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Car,
  Search,
  Plus,
  Calendar,
  User,
  Star,
  LogOut,
  Menu,
  X,
  Home,
  Navigation,
} from 'lucide-react';
import BrandIcon from '@/components/BrandIcon';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
}

const passengerNav = [
  { name: 'Dashboard', href: '/passenger', icon: Home, end: true },
  { name: 'Find Ride',  href: '/find-rides', icon: Search },
  { name: 'My Rides',  href: '/my-rides',   icon: Calendar },
  { name: 'Reviews',   href: '/reviews',    icon: Star },
  { name: 'Profile',   href: '/profile',    icon: User },
];

const driverNav = [
  { name: 'Dashboard',  href: '/driver',      icon: Home, end: true },
  { name: 'Offer Ride', href: '/offer-ride',  icon: Plus },
  { name: 'My Rides',   href: '/my-rides',    icon: Calendar },
  { name: 'Reviews',    href: '/reviews',     icon: Star },
  { name: 'Vehicles',   href: '/vehicles',    icon: Car },
  { name: 'Track Ride', href: '/track-ride',  icon: Navigation },
  { name: 'Profile',    href: '/profile',     icon: User },
];

export default function Layout({ children }: LayoutProps) {
  const { email, role, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = role === 'DRIVER' ? driverNav : passengerNav;
  const panelLabel = role === 'DRIVER' ? 'Driver Panel' : 'Passenger Panel';

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-50 bg-card border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <BrandIcon className="h-7 w-7 rounded-lg" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground leading-none">
                Kamilli Ride
              </p>
              <p className="text-base font-bold leading-tight">{panelLabel}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Sidebar */}
      <aside className={cn(
        'w-56 shrink-0 flex flex-col border-r bg-card',
        'fixed inset-y-0 left-0 z-40 transition-transform duration-200',
        'lg:static lg:translate-x-0',
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
      )}>
        {/* Brand */}
        <div className="px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <BrandIcon className="h-7 w-7 rounded-lg" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Kamilli Ride
              </p>
              <p className="text-base font-bold">{panelLabel}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {navigation.map(({ name, href, icon: Icon, end }) => (
            <NavLink
              key={href}
              to={href}
              end={end}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {name}
            </NavLink>
          ))}
        </nav>

        {/* User profile */}
        <div className="p-3 border-t">
          <TooltipProvider delayDuration={300}>
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {email ? email[0].toUpperCase() : '?'}
                </AvatarFallback>
              </Avatar>

              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="flex-1 min-w-0 text-xs text-muted-foreground truncate cursor-help">
                    {email}
                  </p>
                </TooltipTrigger>
                <TooltipContent side="top">{email}</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
                    onClick={handleLogout}
                    aria-label="Logout"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Logout</TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 overflow-auto pt-[57px] lg:pt-0">
        {children}
      </main>
    </div>
  );
}
