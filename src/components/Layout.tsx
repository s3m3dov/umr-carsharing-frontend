
import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  LogOut,
  Menu,
  X,
  Home,
  Navigation
} from 'lucide-react';
import { useState } from 'react';
import BrandIcon from '@/components/BrandIcon';

interface LayoutProps {
  children: ReactNode;
}

const passengerNav = [
  { name: 'Dashboard', href: '/passenger', icon: Home },
  { name: 'Find Ride',  href: '/find-rides', icon: Search },
  { name: 'My Rides',  href: '/my-rides',   icon: Calendar },
  { name: 'Profile',   href: '/profile',    icon: User },
];

const driverNav = [
  { name: 'Dashboard',  href: '/driver',              icon: Home },
  { name: 'Offer Ride', href: '/offer-ride',   icon: Plus },
  { name: 'My Rides',   href: '/my-rides',     icon: Calendar },
  { name: 'Vehicles',   href: '/vehicles',     icon: Car },
  { name: 'Track Ride', href: '/track-ride',   icon: Navigation },
  { name: 'Profile',    href: '/profile',      icon: User },
];

export default function Layout({ children }: LayoutProps) {
  const { email, role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = role === 'DRIVER' ? driverNav : passengerNav;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white/95 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-2">
            <BrandIcon className="h-8 w-8 rounded-lg" />
            <h1 className="text-xl font-bold text-primary">
              {role === 'DRIVER' ? 'Driver Panel' : 'Passenger Panel'}
            </h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="hover:bg-primary/10"
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={`
          ${isMobileMenuOpen ? 'block' : 'hidden'} lg:block
          w-72 min-h-screen bg-white/80 backdrop-blur-sm border-r border-border/50
          fixed lg:static inset-y-0 left-0 z-40
        `}>
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-6 border-b border-border/50 hidden lg:block">
              <div className="flex items-center space-x-3">
                <BrandIcon className="h-10 w-10" />
                <div>
                  <h1 className="text-2xl font-bold text-primary">Kamilli Ride</h1>
                  <p className="text-xs text-muted-foreground">
                    {role === 'DRIVER' ? 'Driver Panel' : 'Passenger Panel'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      group flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                      ${isActive 
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:shadow-md'
                      }
                    `}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? 'text-primary-foreground' : 'group-hover:text-primary'} transition-colors`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User Profile */}
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
          </div>
        </div>

        {/* Mobile menu overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Main content */}
        <div className="flex-1 lg:ml-0">
          <main className="p-6 max-w-7xl mx-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
