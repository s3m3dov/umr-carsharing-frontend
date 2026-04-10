import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/shared/api/client';
import { ROUTES } from '@/shared/api/service-routes';
import { ApiError } from '@/shared/api/error-parser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Car, AlertTriangle } from 'lucide-react';

interface LoginResponse {
  token: string;
  email: string;
  role: string;
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Consume the flash message set by the 401 handler before the hard redirect.
  const [notice] = useState<string | null>(() => {
    const msg = sessionStorage.getItem('login_notice');
    sessionStorage.removeItem('login_notice');
    return msg;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await apiClient.post<LoginResponse>(ROUTES.auth.login, {
        email,
        password,
      });
      login(data.token, data.role, data.email);
      if (data.role === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else if (data.role === 'DRIVER') {
        navigate('/driver', { replace: true });
      } else if (data.role === 'PASSENGER') {
        navigate('/passenger', { replace: true });
      } else {
        navigate('/forbidden', {
          state: { message: 'Only PASSENGER, DRIVER, and ADMIN roles are supported.' },
          replace: true,
        });
      }
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Failed to connect to server.';
      toast({ title: 'Login failed', description: message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 p-6">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Car className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-foreground">Welcome back</h2>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to your account</p>
        </div>

        {notice && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{notice}</AlertDescription>
          </Alert>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1"
              placeholder="Enter your password"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
