import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSalon } from '@/contexts/SalonContext';
import {
  Clock,
  ShieldAlert,
  Scissors,
  UserCheck,
  CheckCircle2,
  Phone,
  Mail,
  LogOut,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const PendingApprovalPage: React.FC = () => {
  const { currentUser, logout, settings } = useSalon();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Salon Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded border bg-card text-foreground">
            <Scissors className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            {settings.salon_name || 'The Grooming Studio TGS'}
          </h1>
          <p className="text-xs text-muted-foreground">
            Staff Access & Registration Gateway
          </p>
        </div>

        {/* Status Card */}
        <Card className="border shadow-none">
          <CardHeader className="text-center pb-4 pt-6 space-y-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <CardTitle className="text-lg font-bold text-foreground">
              Welcome, {currentUser?.name || 'Staff Member'}!
            </CardTitle>
            <CardDescription className="text-xs max-w-sm mx-auto text-muted-foreground">
              Your account registration has been submitted successfully and is currently awaiting administrative approval.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-2 text-xs">
            {/* Account Details Box */}
            <div className="p-3.5 rounded border bg-muted/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Account Status:</span>
                <Badge variant="outline" className="border-amber-500/40 text-amber-600 bg-amber-50/50 dark:bg-amber-950/20 text-[10px] uppercase font-bold">
                  Pending Owner Approval
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Registered Email:</span>
                <span className="font-mono font-medium text-foreground">{currentUser?.email}</span>
              </div>
              {currentUser?.phone && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Phone Number:</span>
                  <span className="font-mono text-foreground">{currentUser.phone}</span>
                </div>
              )}
              {currentUser?.cnic && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">National ID (CNIC):</span>
                  <span className="font-mono text-foreground">{currentUser.cnic}</span>
                </div>
              )}
            </div>

            {/* Instruction Steps */}
            <div className="space-y-2 border-t pt-4">
              <h4 className="font-semibold text-foreground text-xs">What happens next?</h4>
              <ul className="space-y-1.5 text-muted-foreground text-[11px]">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">1.</span>
                  <span>A real-time notification has been sent to the Salon Owner dashboard.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">2.</span>
                  <span>The Owner will review your registration details and assign your role (Manager, Barber/Worker, or Cashier).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">3.</span>
                  <span>Once approved, sign back in with your credentials to access your designated tabs.</span>
                </li>
              </ul>
            </div>

            {/* Salon Contact */}
            <div className="p-3 rounded border bg-card text-[11px] text-muted-foreground flex items-center justify-between">
              <div>
                <span className="font-semibold text-foreground">Need urgent assistance?</span>
                <p>Contact salon management directly.</p>
              </div>
              <div className="flex items-center gap-1 font-mono text-foreground font-semibold">
                <Phone className="w-3.5 h-3.5 text-primary" />
                {settings.phone || '+92 300 1234567'}
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full text-xs gap-1.5 h-9"
              >
                <LogOut className="w-3.5 h-3.5" />
                Log Out & Return to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
