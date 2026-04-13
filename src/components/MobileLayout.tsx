
import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import BrandIcon from '@/components/BrandIcon';
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

interface MobileLayoutProps {
  children: ReactNode;
}

export default function MobileLayout({ children }: MobileLayoutProps) {
  const { email, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'Find Ride', href: '/find-rides', icon: Search },
    { name: 'Offer Ride', href: '/offer-ride', icon: Plus },
    { name: 'My Rides', href: '/my-rides', icon: Calendar },
    { name: 'Vehicles', href: '/vehicles', icon: Car },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      {/* Mobile Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BrandIcon className="h-10 w-10 shadow-lg" />
            <div>
              <h1 className="text-xl font-bold text-primary">Kamilli Ride</h1>
              <p className="text-xs text-muted-foreground">Share every journey</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="hover:bg-primary/10 rounded-xl"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 top-[73px]">
          <div className="bg-white/95 backdrop-blur-sm w-full h-full pt-6">
            <nav className="px-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`
                      flex items-center space-x-4 px-4 py-4 rounded-xl text-base font-medium transition-all duration-200
                      ${isActive 
                        ? 'bg-primary text-primary-foreground shadow-lg' 
                        : 'text-foreground hover:bg-muted/50 active:bg-muted'
                      }
                    `}
                  >
                    <Icon className="h-6 w-6" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User Profile in Menu */}
            <div className="px-4 mt-8">
              <TooltipProvider>
                <Card className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground text-lg font-bold">
                      {email?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                    <div className="flex-1 min-w-0">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <p className="text-base font-semibold text-foreground truncate cursor-help">
                              {email || 'User'}
                            </p>
                          </TooltipTrigger>
                          <TooltipContent side="top">{email || 'User'}</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <p className="text-sm text-muted-foreground truncate cursor-help">
                              {email || ''}
                            </p>
                          </TooltipTrigger>
                          <TooltipContent side="top">{email || ''}</TooltipContent>
                        </Tooltip>
                      </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleLogout}
                  className="w-full border-primary/20 hover:bg-primary/10 hover:border-primary/30 py-3"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Logout
                </Button>
                </Card>
              </TooltipProvider>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="px-4 py-6 pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-border/50 px-4 py-2 z-30">
        <div className="flex justify-around items-center">
          {navigation.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  flex flex-col items-center space-y-1 py-2 px-3 rounded-lg transition-all duration-200
                  ${isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                  }
                `}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : ''}`} />
                <span className="text-xs font-medium">{item.name.split(' ')[0]}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
