import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import BrandIcon from '@/components/BrandIcon';
import ErrorBoundary from '@/components/ErrorBoundary';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  UserCheck,
  Users,
  Car,
  MapPin,
  BookOpen,
  Star,
  BarChart2,
  ScrollText,
  Activity,
  LogOut,
} from 'lucide-react';

const navItems = [
  { to: '/admin',            label: 'Dashboard',   icon: LayoutDashboard, end: true },
  { to: '/admin/drivers',    label: 'Drivers',      icon: UserCheck },
  { to: '/admin/passengers', label: 'Passengers',   icon: Users },
  { to: '/admin/vehicles',   label: 'Vehicles',     icon: Car },
  { to: '/admin/trips',      label: 'Trips',        icon: MapPin },
  { to: '/admin/bookings',   label: 'Bookings',     icon: BookOpen },
  { to: '/admin/reviews',    label: 'Reviews',      icon: Star },
  { to: '/admin/reports',    label: 'Reports',      icon: BarChart2 },
  { to: '/admin/audit-logs', label: 'Audit Logs',   icon: ScrollText },
  { to: '/admin/status',     label: 'Status',       icon: Activity },
];

export default function AdminLayout() {
  const { email, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="w-56 shrink-0 flex flex-col border-r bg-card">
        <div className="px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <BrandIcon className="h-7 w-7 rounded-lg" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Kamilli Ride
              </p>
              <p className="text-base font-bold">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
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
              {label}
            </NavLink>
          ))}
        </nav>

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

      <main className="flex-1 overflow-auto">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
}
