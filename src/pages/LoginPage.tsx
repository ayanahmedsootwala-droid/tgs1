import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSalon } from '@/contexts/SalonContext';
import {
  Lock,
  Mail,
  UserPlus,
  LogIn,
  Scissors,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  User,
  Phone,
  CreditCard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export const LoginPage: React.FC = () => {
  const { login, registerUser, settings } = useSalon();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');

  // Sign In State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Register State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCnic, setRegCnic] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [regErrorMsg, setRegErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg('Please enter both email address and password');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    const res = await login(email, password);
    setIsSubmitting(false);

    if (res.success) {
      if (res.status === 'pending_approval') {
        navigate('/welcome-pending');
      } else {
        navigate('/');
      }
    } else {
      setErrorMsg(res.error || 'Authentication failed. Please check your credentials.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setRegErrorMsg('Name, email, and password are required');
      return;
    }

    if (regPassword.length < 6) {
      setRegErrorMsg('Password must be at least 6 characters');
      return;
    }

    setIsRegistering(true);
    setRegErrorMsg('');

    const res = await registerUser(regName, regEmail, regPassword, regPhone, regCnic);
    setIsRegistering(false);

    if (res.success) {
      navigate('/welcome-pending');
    } else {
      setRegErrorMsg(res.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Salon Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded border bg-card text-foreground">
            <Scissors className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            {settings.salon_name || 'The Grooming Studio TGS'}
          </h1>
          <p className="text-xs text-muted-foreground">
            Private Staff & Management Access Portal (Pakistan)
          </p>
        </div>

        {/* Authentication Card */}
        <Card className="border shadow-none">
          <CardHeader className="space-y-1 pb-3 pt-5">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-9 p-0.5 bg-muted/50 border">
                <TabsTrigger value="signin" className="text-xs font-semibold gap-1.5 data-[state=active]:bg-background">
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="register" className="text-xs font-semibold gap-1.5 data-[state=active]:bg-background">
                  <UserPlus className="w-3.5 h-3.5" />
                  Register Staff
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>

          <CardContent className="pt-2 pb-6">
            {activeTab === 'signin' ? (
              <form onSubmit={handleLogin} className="space-y-3.5">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-semibold">Sign In to Your Workspace</CardTitle>
                  <CardDescription className="text-xs">
                    Enter your individual email and password.
                  </CardDescription>
                </div>

                {errorMsg && (
                  <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded p-2 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-medium">
                    Registered Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@tgs.pk"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9 text-xs h-9"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9 pr-9 text-xs h-9"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full text-xs font-bold h-9 mt-2"
                >
                  {isSubmitting ? 'Verifying Credentials...' : 'Sign In'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-3">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-semibold">Staff Registration</CardTitle>
                  <CardDescription className="text-xs">
                    Create your account. The Owner will review and assign your role.
                  </CardDescription>
                </div>

                {regErrorMsg && (
                  <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded p-2 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{regErrorMsg}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <Label className="text-xs">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="e.g. Tariq Mehmood"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="pl-9 text-xs h-9"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Email Address *</Label>
                  <div className="relative">
                    <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="tariq@tgs.pk"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="pl-9 text-xs h-9"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        placeholder="0300-1234567"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        className="pl-8 text-xs h-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">CNIC (National ID)</Label>
                    <div className="relative">
                      <CreditCard className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        placeholder="42101-1234567-1"
                        value={regCnic}
                        onChange={(e) => setRegCnic(e.target.value)}
                        className="pl-8 text-xs h-9 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Create Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="Minimum 6 characters"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="pl-9 text-xs h-9"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isRegistering}
                  className="w-full text-xs font-bold h-9 mt-2"
                >
                  {isRegistering ? 'Submitting Registration...' : 'Submit Registration Request'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="text-center text-[11px] text-muted-foreground">
          Protected internal system for The Grooming Studio. Access restricted to authorized personnel.
        </div>
      </div>
    </div>
  );
};
