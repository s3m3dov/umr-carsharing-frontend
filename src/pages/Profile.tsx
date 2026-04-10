
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { passengerApi as userApi } from '@/shared/api/passenger-api';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Phone, Building } from 'lucide-react';

export default function Profile() {
  const { userId } = useAuth();
  const { toast } = useToast();

  const { data: userInfo, isLoading } = useQuery({
    queryKey: ['userInfo', userId],
    queryFn: () => userApi.getProfile(userId!),
    enabled: !!userId,
  });

  const userData = userInfo;

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">Loading profile...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">Manage your account information</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Personal Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {userData && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Full Name</Label>
                  <div className="flex items-center space-x-2 p-2 border rounded">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{userData.fullName}</span>
                  </div>
                </div>
                <div>
                  <Label>Email</Label>
                  <div className="flex items-center space-x-2 p-2 border rounded">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{userData.emailId}</span>
                  </div>
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <div className="flex items-center space-x-2 p-2 border rounded">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{userData.phoneNumber}</span>
                  </div>
                </div>
                <div>
                  <Label>Organization</Label>
                  <div className="flex items-center space-x-2 p-2 border rounded">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span>{userData.organisationName || 'Not specified'}</span>
                  </div>
                </div>
                {userData.age && (
                  <div>
                    <Label>Age</Label>
                    <div className="flex items-center space-x-2 p-2 border rounded">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{userData.age}</span>
                    </div>
                  </div>
                )}
                {userData.empId && (
                  <div>
                    <Label>Employee ID</Label>
                    <div className="flex items-center space-x-2 p-2 border rounded">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{userData.empId}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
