import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { passengerApi as userApi } from '@/shared/api/passenger-api';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Phone, Building } from 'lucide-react';

export default function Profile() {
  const { userId } = useAuth();

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
      <div className="p-6 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your account information</p>
        </div>

        <Card className="rounded-xl shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg">
              <User className="h-5 w-5" />
              <span>Personal Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {userData && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Full Name</p>
                  <div className="flex items-center space-x-2 p-2 rounded-lg border bg-muted/30">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{userData.fullName}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Email</p>
                  <div className="flex items-center space-x-2 p-2 rounded-lg border bg-muted/30">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{userData.emailId}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Phone Number</p>
                  <div className="flex items-center space-x-2 p-2 rounded-lg border bg-muted/30">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{userData.phoneNumber}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Organization</p>
                  <div className="flex items-center space-x-2 p-2 rounded-lg border bg-muted/30">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{userData.organisationName || 'Not specified'}</span>
                  </div>
                </div>
                {userData.age && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Age</p>
                    <div className="flex items-center space-x-2 p-2 rounded-lg border bg-muted/30">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{userData.age}</span>
                    </div>
                  </div>
                )}
                {userData.empId && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Employee ID</p>
                    <div className="flex items-center space-x-2 p-2 rounded-lg border bg-muted/30">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{userData.empId}</span>
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