
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '@/shared/api/client';
import { ROUTES } from '@/shared/api/service-routes';
import { getBackendErrorMessage } from '@/shared/api/error-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import BrandIcon from '@/components/BrandIcon';

type SignupRole = 'DRIVER' | 'PASSENGER';

export default function Signup() {
  const [formData, setFormData] = useState({
    fullName: '',
    emailId: '',
    phoneNumber: '',
    password: '',
    age: 0,
    organisationName: '',
    role: '' as SignupRole | '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'age' ? parseInt(value) || 0 : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.role) {
      toast({
        title: 'Role required',
        description: 'Please choose Driver or Passenger to continue.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      await apiClient.post<void>(ROUTES.auth.signup, formData);
      navigate('/login');
      toast({
        title: 'Account created!',
        description: 'Your account has been created successfully. Please log in.',
      });
    } catch (err) {
      const message = getBackendErrorMessage(err, 'Failed to connect to server.');
      toast({ title: 'Signup failed', description: message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12">
      <div className="w-full max-w-md space-y-8 p-6">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <BrandIcon className="h-12 w-12 rounded-2xl" />
          </div>
          <h2 className="text-3xl font-bold text-foreground">Create your Kamili Ride account</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign up as a passenger or a driver
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="role">User Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value: SignupRole) => setFormData((prev) => ({ ...prev, role: value }))}
            >
              <SelectTrigger id="role" className="mt-1" aria-label="User role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PASSENGER">Passenger</SelectItem>
                <SelectItem value="DRIVER">Driver</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="mt-1"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <Label htmlFor="emailId">Email</Label>
            <Input
              id="emailId"
              name="emailId"
              type="email"
              value={formData.emailId}
              onChange={handleChange}
              required
              className="mt-1"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="mt-1"
              placeholder="Enter your password"
            />
          </div>

          <div>
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              className="mt-1"
              placeholder="Enter your phone number"
            />
          </div>

          <div>
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              name="age"
              type="number"
              value={formData.age || ''}
              onChange={handleChange}
              className="mt-1"
              placeholder="Enter your age"
              min="1"
            />
          </div>

          <div>
            <Label htmlFor="organisationName">Organization (Optional)</Label>
            <Input
              id="organisationName"
              name="organisationName"
              type="text"
              value={formData.organisationName}
              onChange={handleChange}
              className="mt-1"
              placeholder="Your organization"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
