import React, { useState, useMemo } from 'react';
import { useSalon } from '@/contexts/SalonContext';
import type { StaffMember, UserAccount, SalonRole, UserStatus, StaffPayType } from '@/types/salon';
import {
  UserCheck,
  Plus,
  Search,
  Phone,
  Mail,
  Shield,
  Edit2,
  Trash2,
  DollarSign,
  Printer,
  FileText,
  CreditCard,
  Percent,
  CheckCircle2,
  Briefcase,
  Users,
  ShieldCheck,
  Lock,
  Clock,
  Sliders,
  AlertCircle,
  Eye,
  EyeOff,
  UserPlus,
  Check,
  X,
  Calculator,
} from 'lucide-react';
import { StaffCommissionCalculator } from '@/components/staff/StaffCommissionCalculator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export const StaffPage: React.FC = () => {
  const {
    staff,
    addStaff,
    updateStaff,
    deleteStaff,
    userAccounts,
    pendingUsersCount,
    approveUser,
    updateUser,
    deleteUser,
    roleNavTabs,
    updateRoleNavTab,
    invoices,
    currencyFormat,
    role,
    settings,
    currentUser,
    calculateStaffPayout,
  } = useSalon();

  const [activeMainTab, setActiveMainTab] = useState<'staff' | 'calculator' | 'users' | 'nav_tabs'>('staff');

  // Staff Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Staff Modal States
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [deletingStaffId, setDeletingStaffId] = useState<string | null>(null);

  // Pay Slip Modal
  const [selectedStaffForSlip, setSelectedStaffForSlip] = useState<StaffMember | null>(null);
  const [isSlipModalOpen, setIsSlipModalOpen] = useState(false);

  // Staff Form State (4-Tier Compensation Model)
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [cnic, setCnic] = useState('');
  const [staffRole, setStaffRole] = useState<StaffMember['role']>('barber');
  const [payType, setPayType] = useState<StaffPayType>('commission_only');
  const [commissionRate, setCommissionRate] = useState<string>('30');
  const [baseSalary, setBaseSalary] = useState<string>('25000');
  const [partnershipPercentage, setPartnershipPercentage] = useState<string>('60');
  const [stationFee, setStationFee] = useState<string>('0');
  const [specialization, setSpecialization] = useState('Haircut & Beard Styling');
  const [isActive, setIsActive] = useState(true);

  // User Accounts State (Owner Feature)
  const [userSearch, setUserSearch] = useState('');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userCnic, setUserCnic] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userRoleValue, setUserRoleValue] = useState<SalonRole>('worker');
  const [userStatusValue, setUserStatusValue] = useState<UserStatus>('approved');

  // Quick Approval Modal
  const [approvingUser, setApprovingUser] = useState<UserAccount | null>(null);
  const [assignedRole, setAssignedRole] = useState<SalonRole>('worker');

  // Password visibility map for Owner view
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  // Staff Performance Profile View Modal
  const [viewingStaffProfile, setViewingStaffProfile] = useState<StaffMember | null>(null);

  // Calculate commissions earned from invoices
  const staffCommissionStats = useMemo(() => {
    const stats: Record<string, { totalSales: number; totalCommission: number; serviceCount: number }> = {};

    staff.forEach((s) => {
      stats[s.id] = { totalSales: 0, totalCommission: 0, serviceCount: 0 };
    });

    invoices.forEach((inv) => {
      if (inv.status === 'Completed' && inv.items) {
        inv.items.forEach((item) => {
          if (item.staff_id && stats[item.staff_id]) {
            stats[item.staff_id].totalSales += item.price;
            stats[item.staff_id].totalCommission += item.commission_amount;
            stats[item.staff_id].serviceCount += 1;
          }
        });
      }
    });

    return stats;
  }, [staff, invoices]);

  // Filter staff
  const filteredStaff = useMemo(() => {
    return staff.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.phone.includes(searchQuery) ||
        (s.cnic && s.cnic.includes(searchQuery)) ||
        (s.specialization && s.specialization.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesRole = roleFilter === 'all' || s.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [staff, searchQuery, roleFilter]);

  // Filter User Accounts
  const filteredUsers = useMemo(() => {
    const q = userSearch.toLowerCase().trim();
    return userAccounts.filter((u) => {
      return !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.phone && u.phone.includes(q)) || (u.cnic && u.cnic.includes(q));
    });
  }, [userAccounts, userSearch]);

  const handleOpenAddStaff = () => {
    setEditingStaff(null);
    setName('');
    setPhone('');
    setEmail('');
    setCnic('');
    setStaffRole('barber');
    setPayType('commission_only');
    setCommissionRate('30');
    setBaseSalary('0');
    setPartnershipPercentage('60');
    setStationFee('0');
    setSpecialization('Haircut & Beard Styling');
    setIsActive(true);
    setIsStaffModalOpen(true);
  };

  const handleOpenEditStaff = (member: StaffMember) => {
    setEditingStaff(member);
    setName(member.name);
    setPhone(member.phone);
    setEmail(member.email || '');
    setCnic(member.cnic || '');
    setStaffRole(member.role);
    setPayType(member.pay_type || (member.base_salary > 0 && member.commission_rate > 0 ? 'salary_plus_commission' : member.base_salary > 0 ? 'salary_only' : 'commission_only'));
    setCommissionRate(member.commission_rate.toString());
    setBaseSalary(member.base_salary.toString());
    setPartnershipPercentage((member.partnership_percentage || 60).toString());
    setStationFee((member.station_fee || 0).toString());
    setSpecialization(member.specialization);
    setIsActive(member.is_active);
    setIsStaffModalOpen(true);
  };

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Staff member name is required');
      return;
    }

    if (!phone.trim()) {
      toast.error('Phone number is required');
      return;
    }

    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || null,
      cnic: cnic.trim() || '42101-0000000-1',
      role: staffRole,
      pay_type: payType,
      commission_rate: (payType === 'commission_only' || payType === 'salary_plus_commission') ? parseFloat(commissionRate) || 0 : 0,
      base_salary: (payType === 'salary_only' || payType === 'salary_plus_commission') ? parseFloat(baseSalary) || 0 : 0,
      partnership_percentage: payType === 'individual_partnership' ? parseFloat(partnershipPercentage) || 0 : 0,
      station_fee: payType === 'individual_partnership' ? parseFloat(stationFee) || 0 : 0,
      specialization: specialization.trim() || 'Barbering',
      is_active: isActive,
    };

    if (editingStaff) {
      await updateStaff(editingStaff.id, payload);
    } else {
      await addStaff(payload);
    }

    setIsStaffModalOpen(false);
  };

  const handleConfirmDeleteStaff = async () => {
    if (deletingStaffId) {
      await deleteStaff(deletingStaffId);
      setDeletingStaffId(null);
    }
  };

  // User Accounts Handlers (Owner)
  const handleOpenAddUser = () => {
    setEditingUser(null);
    setUserName('');
    setUserEmail('');
    setUserPhone('');
    setUserCnic('');
    setUserPassword('');
    setUserRoleValue('worker');
    setUserStatusValue('approved');
    setIsUserModalOpen(true);
  };

  const handleOpenEditUser = (user: UserAccount) => {
    setEditingUser(user);
    setUserName(user.name);
    setUserEmail(user.email);
    setUserPhone(user.phone || '');
    setUserCnic(user.cnic || '');
    setUserPassword('');
    setUserRoleValue(user.role);
    setUserStatusValue(user.status);
    setIsUserModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userEmail.trim()) {
      toast.error('Name and Email are required');
      return;
    }

    if (!editingUser && !userPassword) {
      toast.error('Password is required for new accounts');
      return;
    }

    if (editingUser) {
      await updateUser(editingUser.id, {
        name: userName.trim(),
        email: userEmail.trim().toLowerCase(),
        phone: userPhone.trim() || undefined,
        cnic: userCnic.trim() || undefined,
        role: userRoleValue,
        status: userStatusValue,
        password: userPassword ? userPassword : undefined,
      });
    } else {
      // Create user directly
      await updateUser(`usr-${Date.now()}`, {
        name: userName.trim(),
        email: userEmail.trim().toLowerCase(),
        phone: userPhone.trim() || undefined,
        cnic: userCnic.trim() || undefined,
        role: userRoleValue,
        status: userStatusValue,
        password: userPassword,
      });
    }

    setIsUserModalOpen(false);
  };

  const handleConfirmDeleteUser = async () => {
    if (deletingUserId) {
      await deleteUser(deletingUserId);
      setDeletingUserId(null);
    }
  };

  const handleQuickApprove = async () => {
    if (approvingUser) {
      await approveUser(approvingUser.id, assignedRole, 'approved');
      setApprovingUser(null);
    }
  };

  // Nav Tabs configuration matrix list
  const availableTabs = [
    { id: 'billing', label: 'POS & Billing (Checkouts & Invoicing)' },
    { id: 'attendance', label: 'Staff Attendance & Auto Salary (Clock-in Terminal)' },
    { id: 'daily-reports', label: 'Daily Sync Report (Sales & Expenses side-by-side)' },
    { id: 'expenses', label: 'Expense Tracker (Operational Expenses)' },
    { id: 'day-closing', label: 'Day Closing & Cash Drawer Audit' },
    { id: 'clients', label: 'Client Directory CRM & Spreadsheets' },
    { id: 'loyalty', label: 'Customer Loyalty Programs & Rewards' },
    { id: 'marketing', label: 'Marketing & WhatsApp Broadcasts' },
    { id: 'appointments', label: 'Chairs & Queue Station' },
    { id: 'staff', label: 'Staff & Commission Dashboard' },
    { id: 'services', label: 'Services Catalog & Category Manager' },
    { id: 'notes', label: 'My Notes (Owner Confidential Vault)' },
    { id: 'settings', label: 'Settings & Salon Info' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Staff & Access Control Management</h1>
            {pendingUsersCount > 0 && role === 'owner' && (
              <Badge variant="destructive" className="font-semibold text-xs">
                {pendingUsersCount} Pending Approval
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage Pakistani barbers team, biometric CNIC records, commission payouts, and user access permissions.
          </p>
        </div>

        {activeMainTab === 'staff' && (
          <Button onClick={handleOpenAddStaff} className="text-xs font-semibold gap-1.5 h-9">
            <Plus className="w-4 h-4" />
            Add Staff Member
          </Button>
        )}

        {activeMainTab === 'users' && role === 'owner' && (
          <Button onClick={handleOpenAddUser} className="text-xs font-semibold gap-1.5 h-9">
            <UserPlus className="w-4 h-4" />
            Create User Account
          </Button>
        )}
      </div>

      {/* Main Mode Tabs with Smooth Horizontal Scrolling */}
      <Tabs value={activeMainTab} onValueChange={(v) => setActiveMainTab(v as any)} className="w-full">
        <div className="w-full max-w-full overflow-x-auto scrollbar-thin pb-1">
          <TabsList className="w-auto inline-flex whitespace-nowrap bg-muted/40 border border-border/80 p-1.5 rounded-2xl gap-1">
            <TabsTrigger value="staff" className="text-xs font-semibold gap-1.5 rounded-xl px-3 py-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>Barbers &amp; Stylists ({staff.length})</span>
            </TabsTrigger>

            <TabsTrigger value="calculator" className="text-xs font-semibold gap-1.5 rounded-xl px-3 py-1.5">
              <Calculator className="w-3.5 h-3.5" />
              <span>Commission &amp; Salary Calculator</span>
            </TabsTrigger>

            {role === 'owner' && (
              <TabsTrigger value="users" className="text-xs font-semibold gap-1.5 relative rounded-xl px-3 py-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>User Accounts &amp; Approvals</span>
                {pendingUsersCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-destructive inline-block ml-1" />
                )}
              </TabsTrigger>
            )}

            {role === 'owner' && (
              <TabsTrigger value="nav_tabs" className="text-xs font-semibold gap-1.5 rounded-xl px-3 py-1.5">
                <Sliders className="w-3.5 h-3.5" />
                <span>Role Navigation Tabs Customizer</span>
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        {/* TAB 1: BARBERS & STYLISTS */}
        <TabsContent value="staff" className="space-y-4 mt-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="border p-3.5 shadow-none">
              <div className="text-[11px] font-medium text-muted-foreground uppercase">Active Staff</div>
              <div className="text-2xl font-bold text-foreground mt-0.5">
                {staff.filter((s) => s.is_active).length}
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">Total on duty</p>
            </Card>

            <Card className="border p-3.5 shadow-none">
              <div className="text-[11px] font-medium text-muted-foreground uppercase">Total Commissions Earned</div>
              <div className="text-2xl font-bold text-emerald-600 mt-0.5">
                {currencyFormat(
                  Object.values(staffCommissionStats).reduce((sum, s) => sum + s.totalCommission, 0)
                )}
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">Calculated across completed bills</p>
            </Card>

            <Card className="border p-3.5 shadow-none">
              <div className="text-[11px] font-medium text-muted-foreground uppercase">Services Delivered</div>
              <div className="text-2xl font-bold text-foreground mt-0.5">
                {Object.values(staffCommissionStats).reduce((sum, s) => sum + s.serviceCount, 0)}
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">Total service jobs recorded</p>
            </Card>

            <Card className="border p-3.5 shadow-none">
              <div className="text-[11px] font-medium text-muted-foreground uppercase">Average Commission Rate</div>
              <div className="text-2xl font-bold text-foreground mt-0.5">
                {staff.length ? Math.round(staff.reduce((sum, s) => sum + s.commission_rate, 0) / staff.length) : 0}%
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">Per-service earnings share</p>
            </Card>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-3 rounded border">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search by name, CNIC, phone, or specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-xs h-9"
              />
            </div>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-44 text-xs h-9">
                <SelectValue placeholder="Filter by Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="barber">Barber</SelectItem>
                <SelectItem value="senior_barber">Senior Barber</SelectItem>
                <SelectItem value="stylist">Stylist</SelectItem>
                <SelectItem value="therapist">Therapist</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="owner">Owner</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Staff Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStaff.map((member) => {
              const stats = staffCommissionStats[member.id] || { totalSales: 0, totalCommission: 0, serviceCount: 0 };
              return (
                <Card key={member.id} className="border shadow-none hover:border-foreground/30 transition-colors">
                  <CardHeader className="p-4 pb-2 border-b flex flex-row items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base font-bold">{member.name}</CardTitle>
                        {!member.is_active && (
                          <Badge variant="outline" className="text-[9px] border-destructive text-destructive">
                            Inactive
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-xs capitalize flex items-center gap-1.5 mt-0.5">
                        <Badge variant="secondary" className="text-[10px] uppercase font-mono">
                          {member.role.replace('_', ' ')}
                        </Badge>
                        <span>•</span>
                        <span>{member.specialization}</span>
                      </CardDescription>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewingStaffProfile(member)}
                        className="h-7 px-2 text-[11px] font-semibold text-primary hover:bg-primary/10 gap-1"
                        title="View Individual Staff Performance Profile"
                      >
                        <UserCheck className="w-3 h-3" />
                        Profile
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEditStaff(member)}
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      {role === 'owner' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingStaffId(member.id)}
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 space-y-3 text-xs">
                    {/* 4-Tier Compensation Model Badge */}
                    <div className="p-2 rounded bg-muted/40 border border-border space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Pay Model:</span>
                        <Badge
                          variant={
                            member.pay_type === 'individual_partnership'
                              ? 'default'
                              : member.pay_type === 'salary_plus_commission'
                              ? 'secondary'
                              : 'outline'
                          }
                          className="text-[10px] font-bold"
                        >
                          {member.pay_type === 'individual_partnership'
                            ? `Partnership (${member.partnership_percentage || 60}%)`
                            : member.pay_type === 'salary_only'
                            ? 'Base Salary Only'
                            : member.pay_type === 'salary_plus_commission'
                            ? `Hybrid (${member.commission_rate}% + Base)`
                            : `Commission Only (${member.commission_rate}%)`}
                        </Badge>
                      </div>

                      <div className="text-[11px] text-muted-foreground">
                        {member.pay_type === 'individual_partnership' && (
                          <span>Receives {member.partnership_percentage || 60}% share on own work only{member.station_fee ? ` (Rs. ${member.station_fee} station fee)` : ''}</span>
                        )}
                        {member.pay_type === 'salary_only' && (
                          <span>Fixed salary: {currencyFormat(member.base_salary)} (0% commission)</span>
                        )}
                        {member.pay_type === 'salary_plus_commission' && (
                          <span>Salary: {currencyFormat(member.base_salary)} + {member.commission_rate}% commission on services</span>
                        )}
                        {(!member.pay_type || member.pay_type === 'commission_only') && (
                          <span>Pure commission: {member.commission_rate}% on all services performed</span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1 text-muted-foreground">
                      <div className="flex items-center justify-between">
                        <span>Phone:</span>
                        <span className="font-mono text-foreground font-medium">{member.phone}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>CNIC:</span>
                        <span className="font-mono text-foreground font-semibold">{member.cnic}</span>
                      </div>
                    </div>

                    {/* Performance & Payout Metrics */}
                    {(() => {
                      const payout = calculateStaffPayout(member, stats.totalSales);
                      return (
                        <div className="p-2.5 rounded border bg-muted/20 space-y-1">
                          <div className="flex items-center justify-between font-medium">
                            <span className="text-muted-foreground">Completed Jobs:</span>
                            <span className="font-bold">{stats.serviceCount} services</span>
                          </div>
                          <div className="flex items-center justify-between font-medium">
                            <span className="text-muted-foreground">Service Revenue:</span>
                            <span className="font-mono text-foreground">{currencyFormat(stats.totalSales)}</span>
                          </div>
                          <div className="flex items-center justify-between font-semibold border-t pt-1">
                            <span className="text-primary font-bold">Month Take-Home:</span>
                            <span className="font-mono text-primary font-bold text-sm">
                              {currencyFormat(payout.totalPayout)}
                            </span>
                          </div>
                        </div>
                      );
                    })()}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedStaffForSlip(member);
                        setIsSlipModalOpen(true);
                      }}
                      className="w-full text-xs h-8 gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Generate Salary Slip
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* TAB 2: COMMISSION & SALARY CALCULATOR */}
        <TabsContent value="calculator" className="space-y-4 mt-4">
          <StaffCommissionCalculator />
        </TabsContent>

        {/* TAB 2: USER ACCOUNTS & APPROVALS (OWNER ONLY) */}
        {role === 'owner' && (
          <TabsContent value="users" className="space-y-4 mt-4">
            {/* Pending Approvals Banner */}
            {pendingUsersCount > 0 && (
              <div className="p-4 rounded border border-amber-500/40 bg-amber-50/50 dark:bg-amber-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                      {pendingUsersCount} Staff Registration{pendingUsersCount > 1 ? 's' : ''} Awaiting Approval
                    </h3>
                    <p className="text-xs text-amber-800 dark:text-amber-300">
                      Review employee details, national ID (CNIC), and grant appropriate workspace roles (Manager, Worker, Cashier).
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* User Search */}
            <div className="flex items-center justify-between gap-3 bg-card p-3 rounded border">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search user accounts by name, email, phone, or CNIC..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-8 text-xs h-9"
                />
              </div>

              <div className="text-xs text-muted-foreground">
                Total Accounts: <span className="font-bold text-foreground">{userAccounts.length}</span>
              </div>
            </div>

            {/* Users Table */}
            <Card className="border shadow-none">
              <CardContent className="p-0">
                <div className="w-full max-w-full overflow-x-auto bg-card">
                  <table className="w-full text-left text-xs [&>div]:max-w-full">
                    <thead className="bg-muted/40 border-b text-muted-foreground font-medium">
                      <tr>
                        <th className="py-2.5 px-3 whitespace-nowrap">User Name & Email</th>
                        <th className="py-2.5 px-3 whitespace-nowrap">Contact & CNIC</th>
                        <th className="py-2.5 px-3 whitespace-nowrap">Current Role</th>
                        <th className="py-2.5 px-3 whitespace-nowrap">Password (Owner View)</th>
                        <th className="py-2.5 px-3 whitespace-nowrap">Status</th>
                        <th className="py-2.5 px-3 whitespace-nowrap text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-muted-foreground">
                            No user accounts match your search query.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => {
                          const isPwVisible = !!visiblePasswords[u.id];
                          const pwd = u.password_hash || (u.role === 'owner' ? 'admin123' : 'manager123');
                          return (
                          <tr key={u.id} className="hover:bg-muted/30">
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <div className="font-semibold text-foreground flex items-center gap-1.5">
                                {u.name}
                                {u.role === 'owner' && (
                                  <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                                )}
                              </div>
                              <div className="text-[11px] text-muted-foreground font-mono">{u.email}</div>
                            </td>

                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <div className="font-mono text-foreground">{u.phone || '-'}</div>
                              <div className="text-[10px] text-muted-foreground font-mono">{u.cnic || '-'}</div>
                            </td>

                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <Badge
                                variant={u.role === 'owner' ? 'default' : 'secondary'}
                                className="uppercase font-mono text-[10px] font-bold"
                              >
                                {u.role}
                              </Badge>
                            </td>

                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <div className="flex items-center gap-1.5 bg-muted/40 px-2 py-1 rounded w-fit border font-mono text-[11px]">
                                <span>{isPwVisible ? pwd : '••••••••'}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  type="button"
                                  onClick={() => togglePasswordVisibility(u.id)}
                                  className="h-5 w-5 text-muted-foreground hover:text-foreground"
                                  title={isPwVisible ? 'Hide password' : 'View password'}
                                >
                                  {isPwVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                </Button>
                              </div>
                            </td>

                            <td className="py-2.5 px-3 whitespace-nowrap">
                              {u.status === 'pending_approval' ? (
                                <Badge variant="outline" className="border-amber-500/50 text-amber-600 bg-amber-50/50 text-[10px] uppercase font-bold animate-pulse">
                                  Pending Review
                                </Badge>
                              ) : u.status === 'approved' ? (
                                <Badge variant="outline" className="border-emerald-500/50 text-emerald-600 bg-emerald-50/50 text-[10px] uppercase font-bold">
                                  Approved
                                </Badge>
                              ) : (
                                <Badge variant="destructive" className="text-[10px] uppercase font-bold">
                                  {u.status}
                                </Badge>
                              )}
                            </td>

                            <td className="py-2.5 px-3 whitespace-nowrap text-right space-x-1">
                              {u.status === 'pending_approval' && (
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => {
                                    setApprovingUser(u);
                                    setAssignedRole('worker');
                                  }}
                                  className="h-7 px-2 text-[11px] font-bold gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                  <Check className="w-3 h-3" />
                                  Approve & Assign Role
                                </Button>
                              )}

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenEditUser(u)}
                                className="h-7 px-2 text-[11px] gap-1"
                              >
                                <Edit2 className="w-3 h-3" />
                                Edit Account
                              </Button>

                              {u.role !== 'owner' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setDeletingUserId(u.id)}
                                  className="h-7 px-2 text-[11px] text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      }))
                    }
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* TAB 3: ROLE NAVIGATION TABS CUSTOMIZER (OWNER ONLY) */}
        {role === 'owner' && (
          <TabsContent value="nav_tabs" className="space-y-4 mt-4">
            <Card className="border shadow-none">
              <CardHeader className="p-4 pb-2 border-b">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-primary" />
                  Navigation Tabs Visibility Matrix
                </CardTitle>
                <CardDescription className="text-xs">
                  Configure exactly which menu tabs and workspace modules are visible for Managers, Workers (Barbers), and Cashiers. Changes take effect instantly.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-4 space-y-6">
                {/* 3 Columns: Manager, Worker, Cashier */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* MANAGER COLUMN */}
                  <div className="space-y-3 p-3.5 rounded border bg-card">
                    <div className="flex items-center justify-between border-b pb-2">
                      <div>
                        <h4 className="font-bold text-sm text-foreground">Floor Manager</h4>
                        <p className="text-[11px] text-muted-foreground">Store supervisor access</p>
                      </div>
                      <Badge variant="secondary" className="uppercase font-mono text-[10px]">
                        Manager
                      </Badge>
                    </div>

                    <div className="space-y-2 pt-1">
                      {availableTabs.map((tab) => {
                        const rule = roleNavTabs.find((r) => r.role === 'manager' && r.tab_id === tab.id);
                        const isEnabled = rule !== undefined ? rule.is_enabled : true;
                        return (
                          <div key={tab.id} className="flex items-center justify-between text-xs py-1 border-b last:border-b-0 border-border/50">
                            <span className="font-medium pr-2 text-foreground">{tab.label.split('(')[0]}</span>
                            <Switch
                              checked={isEnabled}
                              onCheckedChange={(val) => updateRoleNavTab('manager', tab.id, val)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* WORKER / BARBER COLUMN */}
                  <div className="space-y-3 p-3.5 rounded border bg-card">
                    <div className="flex items-center justify-between border-b pb-2">
                      <div>
                        <h4 className="font-bold text-sm text-foreground">Worker / Barber</h4>
                        <p className="text-[11px] text-muted-foreground">Barber chair & commissions</p>
                      </div>
                      <Badge variant="outline" className="uppercase font-mono text-[10px]">
                        Worker
                      </Badge>
                    </div>

                    <div className="space-y-2 pt-1">
                      {availableTabs.map((tab) => {
                        const rule = roleNavTabs.find((r) => r.role === 'worker' && r.tab_id === tab.id);
                        const isEnabled = rule !== undefined ? rule.is_enabled : (tab.id === 'appointments' || tab.id === 'staff');
                        return (
                          <div key={tab.id} className="flex items-center justify-between text-xs py-1 border-b last:border-b-0 border-border/50">
                            <span className="font-medium pr-2 text-foreground">{tab.label.split('(')[0]}</span>
                            <Switch
                              checked={isEnabled}
                              onCheckedChange={(val) => updateRoleNavTab('worker', tab.id, val)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* CASHIER COLUMN */}
                  <div className="space-y-3 p-3.5 rounded border bg-card">
                    <div className="flex items-center justify-between border-b pb-2">
                      <div>
                        <h4 className="font-bold text-sm text-foreground">Cashier</h4>
                        <p className="text-[11px] text-muted-foreground">Billing & drawer reconciliation</p>
                      </div>
                      <Badge variant="outline" className="uppercase font-mono text-[10px]">
                        Cashier
                      </Badge>
                    </div>

                    <div className="space-y-2 pt-1">
                      {availableTabs.map((tab) => {
                        const rule = roleNavTabs.find((r) => r.role === 'cashier' && r.tab_id === tab.id);
                        const isEnabled = rule !== undefined ? rule.is_enabled : (tab.id === 'billing' || tab.id === 'daily-reports' || tab.id === 'day-closing' || tab.id === 'expenses');
                        return (
                          <div key={tab.id} className="flex items-center justify-between text-xs py-1 border-b last:border-b-0 border-border/50">
                            <span className="font-medium pr-2 text-foreground">{tab.label.split('(')[0]}</span>
                            <Switch
                              checked={isEnabled}
                              onCheckedChange={(val) => updateRoleNavTab('cashier', tab.id, val)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Staff Add / Edit Modal */}
      <Dialog open={isStaffModalOpen} onOpenChange={setIsStaffModalOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingStaff ? 'Edit Barber Profile' : 'Add New Staff Member'}</DialogTitle>
            <DialogDescription className="text-xs">
              Pakistani National Identity Card (CNIC) is required for staff verification.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveStaff} className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <Label className="text-xs">Full Name *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Tariq Mehmood"
                required
                className="h-8 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Phone Number *</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0300-1234567"
                  required
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">CNIC (National ID) *</Label>
                <Input
                  value={cnic}
                  onChange={(e) => setCnic(e.target.value)}
                  placeholder="42101-1234567-1"
                  required
                  className="h-8 text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Role</Label>
                <Select value={staffRole} onValueChange={(v) => setStaffRole(v as any)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="barber">Barber</SelectItem>
                    <SelectItem value="senior_barber">Senior Barber</SelectItem>
                    <SelectItem value="stylist">Stylist</SelectItem>
                    <SelectItem value="therapist">Therapist</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Specialization</Label>
                <Input
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  placeholder="Fade cuts, Beard grooming"
                  className="h-8 text-xs"
                />
              </div>
            </div>

            {/* 4-Tier Compensation Model Engine */}
            <div className="space-y-2 p-3 rounded-md border bg-muted/20">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold">Compensation & Pay Structure *</Label>
                  <Badge variant="outline" className="text-[10px] font-mono">4 Flexible Tiers</Badge>
                </div>
                <Select value={payType} onValueChange={(v) => setPayType(v as StaffPayType)}>
                  <SelectTrigger className="h-8 text-xs font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="commission_only">1. Commission Only (%)</SelectItem>
                    <SelectItem value="salary_only">2. Base Salary Only (Fixed Monthly)</SelectItem>
                    <SelectItem value="individual_partnership">3. Individual Chair Share / Partnership (% on Own Work)</SelectItem>
                    <SelectItem value="salary_plus_commission">4. Hybrid: Base Salary + Commission (%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Conditional Inputs Based on Pay Type */}
              {payType === 'commission_only' && (
                <div className="space-y-1 pt-1">
                  <Label className="text-xs">Commission Rate (%) *</Label>
                  <Input
                    type="number"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                    placeholder="30"
                    className="h-8 text-xs font-mono"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Barber earns {commissionRate || 0}% of all completed service revenues. No fixed base salary.
                  </p>
                </div>
              )}

              {payType === 'salary_only' && (
                <div className="space-y-1 pt-1">
                  <Label className="text-xs">Monthly Base Salary (Rs.) *</Label>
                  <Input
                    type="number"
                    value={baseSalary}
                    onChange={(e) => setBaseSalary(e.target.value)}
                    placeholder="35000"
                    className="h-8 text-xs font-mono"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Fixed monthly payroll salary of {currencyFormat(Number(baseSalary) || 0)}. 0% commission.
                  </p>
                </div>
              )}

              {payType === 'individual_partnership' && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="space-y-1">
                    <Label className="text-xs">Partnership Share (% of Own Work) *</Label>
                    <Input
                      type="number"
                      value={partnershipPercentage}
                      onChange={(e) => setPartnershipPercentage(e.target.value)}
                      placeholder="60"
                      className="h-8 text-xs font-mono"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Barber takes {partnershipPercentage || 60}% of services performed by them.
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Monthly Chair / Booth Fee (Rs.)</Label>
                    <Input
                      type="number"
                      value={stationFee}
                      onChange={(e) => setStationFee(e.target.value)}
                      placeholder="0"
                      className="h-8 text-xs font-mono"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Deducted from monthly earnings for chair rental (optional).
                    </p>
                  </div>
                </div>
              )}

              {payType === 'salary_plus_commission' && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="space-y-1">
                    <Label className="text-xs">Base Salary (Rs.) *</Label>
                    <Input
                      type="number"
                      value={baseSalary}
                      onChange={(e) => setBaseSalary(e.target.value)}
                      placeholder="25000"
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Commission Rate (%) *</Label>
                    <Input
                      type="number"
                      value={commissionRate}
                      onChange={(e) => setCommissionRate(e.target.value)}
                      placeholder="15"
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                  <p className="col-span-2 text-[10px] text-muted-foreground">
                    Guaranteed {currencyFormat(Number(baseSalary) || 0)} base salary plus {commissionRate || 0}% extra commission on all service sales.
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-2 rounded border bg-muted/20">
              <span className="font-medium">Active Status</span>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsStaffModalOpen(false)} className="text-xs h-8">
                Cancel
              </Button>
              <Button type="submit" className="text-xs h-8 font-bold">
                Save Staff Profile
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* User Account Add / Edit Modal (Owner) */}
      <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit User Credentials & Role' : 'Create User Account'}</DialogTitle>
            <DialogDescription className="text-xs">
              Owner control to edit staff credentials, update roles, or change passwords.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveUser} className="space-y-3 text-xs">
            <div className="space-y-1">
              <Label className="text-xs">User Full Name *</Label>
              <Input
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Staff Member Name"
                required
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Email Address *</Label>
              <Input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="staff@tgs.pk"
                required
                className="h-8 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Phone Number</Label>
                <Input
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  placeholder="0300-1234567"
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">CNIC</Label>
                <Input
                  value={userCnic}
                  onChange={(e) => setUserCnic(e.target.value)}
                  placeholder="42101-1234567-1"
                  className="h-8 text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Assigned Role</Label>
                <Select value={userRoleValue} onValueChange={(v) => setUserRoleValue(v as any)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">Owner</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="worker">Worker / Barber</SelectItem>
                    <SelectItem value="cashier">Cashier</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Account Status</Label>
                <Select value={userStatusValue} onValueChange={(v) => setUserStatusValue(v as any)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending_approval">Pending Approval</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-xs">
                  {editingUser ? 'Account Password' : 'Account Password *'}
                </Label>
                {editingUser && (
                  <span className="text-[10px] text-muted-foreground font-mono">
                    Current: {editingUser.password_hash || (editingUser.role === 'owner' ? 'admin123' : 'manager123')}
                  </span>
                )}
              </div>
              <Input
                type="text"
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
                placeholder={editingUser ? `Type new password (current: ${editingUser.password_hash || 'admin123'})` : 'Minimum 6 characters'}
                className="h-8 text-xs font-mono"
              />
              {editingUser && (
                <p className="text-[10px] text-muted-foreground">
                  Leave unchanged or type a new password. The owner can view and change all staff passwords at any time.
                </p>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsUserModalOpen(false)} className="text-xs h-8">
                Cancel
              </Button>
              <Button type="submit" className="text-xs h-8 font-bold">
                Save User Account
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Quick Approval Modal */}
      <Dialog open={!!approvingUser} onOpenChange={(open) => !open && setApprovingUser(null)}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
          <DialogHeader>
            <DialogTitle>Approve Staff Registration</DialogTitle>
            <DialogDescription className="text-xs">
              Approve registration for {approvingUser?.name} and assign their workspace role.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded border bg-muted/20 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-semibold text-foreground">{approvingUser?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-mono text-foreground">{approvingUser?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone:</span>
                <span className="font-mono text-foreground">{approvingUser?.phone || 'Not provided'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">CNIC:</span>
                <span className="font-mono text-foreground">{approvingUser?.cnic || 'Not provided'}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Assign Role & Tab Access</Label>
              <Select value={assignedRole} onValueChange={(v) => setAssignedRole(v as any)}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manager">Floor Manager (Reports, Billing, Expenses, Day Closing)</SelectItem>
                  <SelectItem value="worker">Worker / Barber (Queue, My Commissions)</SelectItem>
                  <SelectItem value="cashier">Cashier (Billing, Day Closing, Expenses)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                if (approvingUser) {
                  approveUser(approvingUser.id, 'worker', 'rejected');
                  setApprovingUser(null);
                }
              }}
              className="text-xs h-8 text-destructive"
            >
              Reject
            </Button>
            <Button
              onClick={handleQuickApprove}
              className="text-xs h-8 font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Approve & Grant Access
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Salary Slip Print Modal */}
      <Dialog open={isSlipModalOpen} onOpenChange={setIsSlipModalOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
          <DialogHeader>
            <DialogTitle>Monthly Commission & Salary Statement</DialogTitle>
          </DialogHeader>

          {selectedStaffForSlip && (() => {
            const slipSales = staffCommissionStats[selectedStaffForSlip.id]?.totalSales || 0;
            const slipServices = staffCommissionStats[selectedStaffForSlip.id]?.serviceCount || 0;
            const payout = calculateStaffPayout(selectedStaffForSlip, slipSales);

            return (
              <div className="space-y-4 p-4 border rounded bg-card text-xs" id="printable-payslip">
                <div className="text-center pb-3 border-b space-y-0.5">
                  <h3 className="font-bold text-sm">{settings.salon_name}</h3>
                  <p className="text-[11px] text-muted-foreground">Staff Earnings & Commission Record</p>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {new Date().toLocaleString('en-PK', { month: 'long', year: 'numeric' })}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Staff Name:</span>
                    <span className="font-bold">{selectedStaffForSlip.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CNIC:</span>
                    <span className="font-mono">{selectedStaffForSlip.cnic}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Role:</span>
                    <span className="capitalize">{selectedStaffForSlip.role.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Compensation Model:</span>
                    <Badge variant="outline" className="text-[10px] font-bold">
                      {selectedStaffForSlip.pay_type === 'individual_partnership'
                        ? `Chair Partnership (${selectedStaffForSlip.partnership_percentage || 60}% on own work)`
                        : selectedStaffForSlip.pay_type === 'salary_only'
                        ? 'Base Salary Only'
                        : selectedStaffForSlip.pay_type === 'salary_plus_commission'
                        ? `Hybrid (${selectedStaffForSlip.commission_rate}% + Base)`
                        : `Commission Only (${selectedStaffForSlip.commission_rate}%)`}
                    </Badge>
                  </div>
                </div>

                <div className="p-3 rounded border bg-muted/20 space-y-2">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Individual Services Delivered:</span>
                    <span className="font-mono font-medium">{slipServices} jobs ({currencyFormat(slipSales)})</span>
                  </div>

                  {payout.baseSalary > 0 && (
                    <div className="flex justify-between font-medium">
                      <span>Monthly Base Salary:</span>
                      <span className="font-mono">{currencyFormat(payout.baseSalary)}</span>
                    </div>
                  )}

                  {payout.commission > 0 && (
                    <div className="flex justify-between font-medium">
                      <span>
                        {selectedStaffForSlip.pay_type === 'individual_partnership'
                          ? `Partnership Work Share (${selectedStaffForSlip.partnership_percentage || 60}%):`
                          : `Commissions Earned (${selectedStaffForSlip.commission_rate}%):`}
                      </span>
                      <span className="font-mono text-emerald-600 font-bold">
                        {currencyFormat(payout.commission)}
                      </span>
                    </div>
                  )}

                  {payout.stationFee > 0 && (
                    <div className="flex justify-between font-medium text-rose-600">
                      <span>Monthly Chair Rental / Station Fee:</span>
                      <span className="font-mono font-bold">-{currencyFormat(payout.stationFee)}</span>
                    </div>
                  )}

                  <div className="flex justify-between font-bold border-t pt-2 text-sm">
                    <span>Net Monthly Take-Home:</span>
                    <span className="font-mono text-primary font-bold text-base">
                      {currencyFormat(payout.totalPayout)}
                    </span>
                  </div>
                </div>

                <div className="text-[10px] text-muted-foreground text-center">
                  System generated by TGS Salon OS. Authorized by {currentUser?.name || 'Salon Management'} ({role === 'owner' ? 'Owner' : 'Manager'}).
                </div>
              </div>
            );
          })()}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSlipModalOpen(false)} className="text-xs h-8">
              Close
            </Button>
            <Button onClick={() => window.print()} className="text-xs h-8 gap-1 font-bold">
              <Printer className="w-3.5 h-3.5" />
              Print Slip
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Staff Confirmation */}
      <AlertDialog open={!!deletingStaffId} onOpenChange={(open) => !open && setDeletingStaffId(null)}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Staff Member?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              This will remove the staff member from the salon team. Historical bills and service records will remain intact.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs h-8">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDeleteStaff} className="text-xs h-8 bg-destructive text-destructive-foreground">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Staff Performance Profile Modal */}
      <Dialog open={!!viewingStaffProfile} onOpenChange={(open) => !open && setViewingStaffProfile(null)}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Staff Performance Profile</span>
              {viewingStaffProfile && (
                <Badge variant={viewingStaffProfile.is_active ? 'default' : 'secondary'} className="text-[10px]">
                  {viewingStaffProfile.is_active ? 'Active on Duty' : 'Off Duty'}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Individual staff performance, service specialization, and commission summary.
            </DialogDescription>
          </DialogHeader>

          {viewingStaffProfile && (
            <div className="space-y-3.5 text-xs">
              <div className="p-3 rounded border bg-card space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-base text-foreground">{viewingStaffProfile.name}</span>
                  <Badge variant="outline" className="uppercase font-mono text-[10px]">
                    {viewingStaffProfile.role.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="text-muted-foreground flex items-center gap-2">
                  <span>Specialization:</span>
                  <span className="font-semibold text-foreground">{viewingStaffProfile.specialization}</span>
                </div>
                <div className="text-muted-foreground flex items-center justify-between font-mono pt-1 text-[11px]">
                  <span>Phone: {viewingStaffProfile.phone}</span>
                  <span>CNIC: {viewingStaffProfile.cnic}</span>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded border bg-muted/20 text-center">
                  <div className="text-[10px] text-muted-foreground uppercase">Services Delivered</div>
                  <div className="text-lg font-bold text-foreground mt-0.5 font-mono">
                    {staffCommissionStats[viewingStaffProfile.id]?.serviceCount || 0}
                  </div>
                </div>

                <div className="p-2.5 rounded border bg-muted/20 text-center">
                  <div className="text-[10px] text-muted-foreground uppercase">Revenue Generated</div>
                  <div className="text-sm font-bold text-emerald-600 mt-1 font-mono">
                    {currencyFormat(staffCommissionStats[viewingStaffProfile.id]?.totalSales || 0)}
                  </div>
                </div>

                <div className="p-2.5 rounded border bg-muted/20 text-center">
                  <div className="text-[10px] text-muted-foreground uppercase">Commission Earned</div>
                  <div className="text-sm font-bold text-primary mt-1 font-mono">
                    {currencyFormat(staffCommissionStats[viewingStaffProfile.id]?.totalCommission || 0)}
                  </div>
                </div>
              </div>

              {(() => {
                const profileSales = staffCommissionStats[viewingStaffProfile.id]?.totalSales || 0;
                const payout = calculateStaffPayout(viewingStaffProfile, profileSales);

                return (
                  <div className="p-3 rounded border bg-muted/20 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Compensation Model:</span>
                      <Badge variant="outline" className="font-bold text-[10px]">
                        {viewingStaffProfile.pay_type === 'individual_partnership'
                          ? `Partnership (${viewingStaffProfile.partnership_percentage || 60}% on own work)`
                          : viewingStaffProfile.pay_type === 'salary_only'
                          ? 'Base Salary Only'
                          : viewingStaffProfile.pay_type === 'salary_plus_commission'
                          ? `Hybrid (${viewingStaffProfile.commission_rate}% + Base)`
                          : `Commission Only (${viewingStaffProfile.commission_rate}%)`}
                      </Badge>
                    </div>

                    {payout.baseSalary > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Monthly Base Salary:</span>
                        <span className="font-mono font-bold">{currencyFormat(payout.baseSalary)}</span>
                      </div>
                    )}

                    {payout.commission > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          {viewingStaffProfile.pay_type === 'individual_partnership' ? 'Partnership Earnings:' : 'Commission Earned:'}
                        </span>
                        <span className="font-mono font-bold text-emerald-600">{currencyFormat(payout.commission)}</span>
                      </div>
                    )}

                    {payout.stationFee > 0 && (
                      <div className="flex justify-between text-rose-600">
                        <span>Station Fee Deduction:</span>
                        <span className="font-mono font-bold">-{currencyFormat(payout.stationFee)}</span>
                      </div>
                    )}

                    <div className="flex justify-between border-t pt-2 font-bold">
                      <span>Total Current Month Take-Home:</span>
                      <span className="font-mono text-primary text-sm font-bold">
                        {currencyFormat(payout.totalPayout)}
                      </span>
                    </div>
                  </div>
                );
              })()}

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedStaffForSlip(viewingStaffProfile);
                    setIsSlipModalOpen(true);
                  }}
                  className="text-xs h-8 gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Pay Slip
                </Button>
                <Button
                  onClick={() => {
                    const target = viewingStaffProfile;
                    setViewingStaffProfile(null);
                    handleOpenEditStaff(target);
                  }}
                  className="text-xs h-8 font-bold"
                >
                  Edit Profile
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation */}
      <AlertDialog open={!!deletingUserId} onOpenChange={(open) => !open && setDeletingUserId(null)}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User Account?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              This will permanently revoke login credentials and system access for this user.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs h-8">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDeleteUser} className="text-xs h-8 bg-destructive text-destructive-foreground">
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
