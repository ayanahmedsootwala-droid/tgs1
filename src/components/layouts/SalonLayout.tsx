import React, { useState, useEffect, useMemo, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useSalon } from '@/contexts/SalonContext';
import { maskClientPhone } from '@/utils/phoneMask';
import {
  CreditCard,
  Users,
  Scissors,
  UserCheck,
  Receipt,
  CircleDollarSign,
  BarChart3,
  Settings,
  CalendarCheck2,
  Menu,
  LogOut,
  ChevronDown,
  UserCog,
  ShieldCheck,
  Briefcase,
  Bell,
  Megaphone,
  ArrowRightLeft,
  BookOpen,
  FileArchive,
  Search,
  Wifi,
  WifiOff,
  Clock,
  Sparkles,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Copy,
  KeyRound,
  StickyNote,
  GraduationCap,
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface SalonLayoutProps {
  children: React.ReactNode;
}

export const SalonLayout: React.FC<SalonLayoutProps> = ({ children }) => {
  const {
    currentUser,
    role,
    logout,
    pendingUsersCount,
    isTabVisibleForCurrentRole,
    settings,
    updateUser,
    isOnline,
    offlineQueueCount,
    syncOfflineQueue,
    closingCountdown,
    sendWhatsAppMessage,
    generateWhatsAppClosingReport,
    clients,
    invoices,
    services,
    staff,
    userAccounts,
    login,
  } = useSalon();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('tgs_sidebar_expanded');
      return saved ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [headerSearch, setHeaderSearch] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Search Results
  const searchResults = useMemo(() => {
    const q = headerSearch.trim().toLowerCase();
    if (!q) return { clients: [], invoices: [], services: [], total: 0 };
    const matchedClients = clients
      .filter((c) => c.name.toLowerCase().includes(q) || c.phone.includes(q) || (c.email && c.email.toLowerCase().includes(q)))
      .slice(0, 4);
    const matchedInvoices = invoices
      .filter((inv) => inv.invoice_number.toLowerCase().includes(q) || inv.client_name.toLowerCase().includes(q))
      .slice(0, 3);
    const matchedServices = services
      .filter((s) => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q))
      .slice(0, 3);
    return {
      clients: matchedClients,
      invoices: matchedInvoices,
      services: matchedServices,
      total: matchedClients.length + matchedInvoices.length + matchedServices.length,
    };
  }, [headerSearch, clients, invoices, services]);

  // Click outside listener for search dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // WhatsApp Closing Modal State
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [whatsAppReportText, setWhatsAppReportText] = useState('');
  const [whatsAppReportType, setWhatsAppReportType] = useState<'closing' | 'staff' | 'loyalty'>('closing');
  const [selectedStaffReportId, setSelectedStaffReportId] = useState<string>('');
  const [selectedClientReportPhone, setSelectedClientReportPhone] = useState<string>('');

  // Profile Edit Modal State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profilePassword, setProfilePassword] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setProfileName(currentUser.name);
      setProfileEmail(currentUser.email);
      setProfilePhone(currentUser.phone || '');
    }
  }, [currentUser]);

  const toggleSidebar = () => {
    setSidebarExpanded((prev) => {
      const next = !prev;
      localStorage.setItem('tgs_sidebar_expanded', JSON.stringify(next));
      return next;
    });
  };

  const handleOpenProfileModal = () => {
    if (currentUser) {
      setProfileName(currentUser.name);
      setProfileEmail(currentUser.email);
      setProfilePhone(currentUser.phone || '');
      setProfilePassword('');
      setIsProfileModalOpen(true);
    }
  };

  const generateStaffReportText = (staffId: string) => {
    const member = staff.find((s) => s.id === staffId) || staff[0];
    if (!member) return '';
    const completedBills = invoices.filter((inv) => inv.status === 'Completed');
    let serviceCount = 0;
    let totalTurnover = 0;
    let totalComm = 0;

    for (const inv of completedBills) {
      if (inv.items) {
        for (const it of inv.items) {
          if (it.staff_id === member.id) {
            serviceCount += 1;
            totalTurnover += it.price;
            totalComm += it.commission_amount || 0;
          }
        }
      }
    }

    const baseSal = Number(member.base_salary) || 0;
    const net = baseSal + totalComm;

    return `✂️ *TGS Stylist Shift & Commission Slip*\nStylist: ${member.name} (${member.role})\nSpecialization: ${member.specialization || 'Master Barber'}\nDate: ${formattedTodayDate}\n\n• Completed Services: ${serviceCount}\n• Gross Service Revenue: Rs. ${totalTurnover.toLocaleString()}\n• Base Salary: Rs. ${baseSal.toLocaleString()}\n• Commission Rate: ${member.commission_rate}%\n• Commission Earned: Rs. ${totalComm.toLocaleString()}\n\n*Net Payable: Rs. ${net.toLocaleString()}*\n\n_Thank you for your dedication to customer grooming excellence!_`;
  };

  const generateLoyaltyReportText = (clientPhone: string) => {
    const client = clients.find((c) => c.phone === clientPhone) || clients[0];
    if (!client) return '';
    if (role !== 'owner') {
      return `💈 *The Grooming Studio (TGS)*\nDear ${client.name},\nThank you for choosing TGS for your premium grooming.\n\nBook your next haircut or hot towel therapy session:\n📍 DHA Phase 6, Karachi\n📲 WhatsApp: ${settings.owner_whatsapp || '+92 300 1234567'}`;
    }
    return `💈 *The Grooming Studio (TGS) - VIP Loyalty Rewards*\nDear ${client.name},\n\nThank you for choosing TGS for your premium grooming. Here is your current membership status:\n\n✨ Total Visits: ${client.total_visits}\n✂️ Loyalty Punch Card: ${client.punch_card_stamps || 0}/5 Stamps\n🎁 Free Perks Available: ${client.loyalty_free_facials_available || 0} Complimentary Facials\n💳 Wallet Credit: Rs. ${(client.wallet_balance || 0).toLocaleString()}\n\nBook your next haircut or hot towel therapy session:\n📍 DHA Phase 6, Karachi\n📲 WhatsApp: ${settings.owner_whatsapp || '+92 300 1234567'}`;
  };

  const handleOpenWhatsAppModal = (type: 'closing' | 'staff' | 'loyalty' = 'closing') => {
    if (type === 'loyalty' && role !== 'owner') {
      type = 'closing';
    }
    setWhatsAppReportType(type);
    if (type === 'closing') {
      const report = generateWhatsAppClosingReport();
      setWhatsAppReportText(report);
    } else if (type === 'staff') {
      const staffId = selectedStaffReportId || staff[0]?.id || '';
      setSelectedStaffReportId(staffId);
      setWhatsAppReportText(generateStaffReportText(staffId));
    } else {
      const clientPhone = selectedClientReportPhone || clients[0]?.phone || '';
      setSelectedClientReportPhone(clientPhone);
      setWhatsAppReportText(generateLoyaltyReportText(clientPhone));
    }
    setIsWhatsAppModalOpen(true);
  };

  const handleSendWhatsApp = () => {
    let targetPhone = settings.owner_whatsapp || '03001234567';
    if (whatsAppReportType === 'staff') {
      const member = staff.find((s) => s.id === selectedStaffReportId);
      if (member?.phone) targetPhone = member.phone;
    } else if (whatsAppReportType === 'loyalty') {
      if (selectedClientReportPhone) targetPhone = selectedClientReportPhone;
    }
    sendWhatsAppMessage(targetPhone, whatsAppReportText);
    toast.success(`Opening WhatsApp for ${targetPhone}...`);
    setIsWhatsAppModalOpen(false);
  };

  const handleCopyReport = () => {
    navigator.clipboard.writeText(whatsAppReportText);
    toast.success('Report text copied to clipboard!');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!profileName.trim()) {
      toast.error('Display Name cannot be empty');
      return;
    }
    setIsSavingProfile(true);
    try {
      const updates: any = {
        name: profileName.trim(),
        email: profileEmail.trim(),
        phone: profilePhone.trim() || undefined,
      };
      if (profilePassword.trim()) {
        updates.password = profilePassword.trim();
      }
      const success = await updateUser(currentUser.id, updates);
      if (success) {
        toast.success('Your profile name and credentials updated everywhere!');
        setIsProfileModalOpen(false);
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Redirect to login if not authenticated
  if (!currentUser) {
    navigate('/login');
    return null;
  }

  // If user is pending approval, redirect to welcome pending page
  if (currentUser.status === 'pending_approval' && location.pathname !== '/welcome-pending') {
    navigate('/welcome-pending');
    return null;
  }

  // Navigation items filtered dynamically per Owner's role tab configuration
  const allNavItems = [
    {
      tabId: 'billing',
      title: 'POS & Billing',
      path: '/',
      icon: CreditCard,
      description: 'Quick checkouts & custom bills',
    },
    {
      tabId: 'daily-reports',
      title: 'Daily Sync Report',
      path: '/daily-reports',
      icon: ArrowRightLeft,
      description: 'Side-by-side sales & expenses',
    },
    {
      tabId: 'expenses',
      title: 'Expense Tracker',
      path: '/expenses',
      icon: Receipt,
      description: 'Record operating expenses',
    },
    {
      tabId: 'day-closing',
      title: 'Day Closing & Register',
      path: '/day-closing',
      icon: CircleDollarSign,
      description: 'Daily cash reconciliation in Rs.',
    },
    {
      tabId: 'clients',
      title: 'Client Directory (CRM)',
      path: '/clients',
      icon: Users,
      description: 'Customer profiles & directory',
      badge: undefined,
    },
    {
      tabId: 'loyalty',
      title: 'Customer Loyalty & Rewards',
      path: '/loyalty',
      icon: Sparkles,
      description: 'Free facial, punch card & rewards',
    },
    {
      tabId: 'marketing',
      title: 'Marketing & Campaigns',
      path: '/marketing',
      icon: Megaphone,
      description: 'WhatsApp & promo blasts',
    },
    {
      tabId: 'attendance',
      title: 'Staff Attendance',
      path: '/attendance',
      icon: Clock,
      description: 'Clock-in/out, late tracking & auto salary',
      badge: 'Live',
    },
    {
      tabId: 'appointments',
      title: 'Chairs & Queue',
      path: '/appointments',
      icon: CalendarCheck2,
      description: 'Live workstation queue',
    },
    {
      tabId: 'staff',
      title: role === 'owner' ? 'Staff & User Access' : 'Staff & Commissions',
      path: '/staff',
      icon: UserCheck,
      description: role === 'owner' ? 'Users, CNIC & tab customizer' : 'Barbers & commissions',
      badge: role === 'owner' && pendingUsersCount > 0 ? `${pendingUsersCount} Pending` : undefined,
    },
    {
      tabId: 'services',
      title: 'Services & Categories',
      path: '/services',
      icon: Scissors,
      description: 'Categories & pinned services',
    },
    {
      tabId: 'reports',
      title: 'Analytics & Trends',
      path: '/reports',
      icon: BarChart3,
      description: 'Revenue & staff leaderboards',
    },
    {
      tabId: 'ledger',
      title: 'Owner Ledger & Target',
      path: '/ledger',
      icon: BookOpen,
      description: 'Rent, profit engine & balances',
      badge: role === 'owner' ? 'Owner Only' : undefined,
    },
    {
      tabId: 'knowledge-vault',
      title: 'Salon Pro Playbook',
      path: '/knowledge-vault',
      icon: GraduationCap,
      description: 'Pakistan salon strategies, staff & operations',
      badge: role === 'owner' ? '👑 Owner' : undefined,
    },
    {
      tabId: 'notes',
      title: 'My Notes',
      path: '/notes',
      icon: StickyNote,
      description: 'Private owner checklists & targets',
      badge: role === 'owner' ? 'Owner' : undefined,
    },
    {
      tabId: 'source-export',
      title: 'Source Code v15 Export',
      path: '/source-export',
      icon: FileArchive,
      description: 'Complete codebase bundle v15',
      badge: 'v15',
    },
    {
      tabId: 'settings',
      title: 'Owner Settings & Config',
      path: '/settings',
      icon: Settings,
      description: 'Salon preferences, WhatsApp & auto-closing',
    },
  ];

  // Filter items based on current role's enabled tabs
  const visibleNavItems = allNavItems.filter((item) => isTabVisibleForCurrentRole(item.tabId));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Formatted current date e.g. "Today, Mon 06 Oct"
  const formattedTodayDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  }).format(new Date());

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground antialiased selection:bg-primary/20">
      {/* Desktop App Dock / Rail Sidebar */}
      <aside
        className={`hidden md:flex flex-col shrink-0 border-r border-border/80 bg-card/90 backdrop-blur transition-all duration-300 ease-in-out z-20 ${
          sidebarExpanded ? 'w-64' : 'w-20'
        }`}
      >
        {/* Dock Top Brand / Wave Logo */}
        <div className="h-16 px-4 border-b border-border/70 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {/* Sleek Spiral Emblem matching reference */}
            <div
              className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-indigo-500 text-primary-foreground flex items-center justify-center font-black text-sm tracking-widest shadow-md shadow-primary/25 shrink-0 cursor-pointer"
              onClick={() => navigate('/')}
              title="The Grooming Studio CRM"
            >
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 1 0 10 10" />
                <path d="M12 6a6 6 0 1 0 6 6" />
                <path d="M12 10a2 2 0 1 0 2 2" />
              </svg>
            </div>
            {sidebarExpanded && (
              <div className="min-w-0 animate-in fade-in duration-200">
                <h1 className="text-sm font-black tracking-tight text-foreground truncate">
                  {settings.salon_name || 'The Grooming Studio'}
                </h1>
                <p className="text-[10px] font-medium text-muted-foreground truncate uppercase tracking-wider">
                  Salon CRM • PKR (Rs.)
                </p>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            title={sidebarExpanded ? 'Collapse to icon dock' : 'Expand sidebar'}
            className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground shrink-0"
          >
            {sidebarExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </Button>
        </div>

        {/* Current User Session Card */}
        {sidebarExpanded ? (
          <div className="p-3 mx-3 mt-3 rounded-2xl bg-muted/40 border border-border/60">
            <div className="flex items-center justify-between text-xs">
              <button
                onClick={handleOpenProfileModal}
                title="Edit my profile"
                className="flex items-center gap-2 min-w-0 text-left group"
              >
                <div className="w-7 h-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-foreground text-xs truncate block group-hover:underline">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    {role}
                  </span>
                </div>
              </button>
              <Badge
                variant={role === 'owner' ? 'default' : 'secondary'}
                className="text-[9px] uppercase px-1.5 py-0 h-4 font-mono font-bold"
              >
                {role}
              </Badge>
            </div>
          </div>
        ) : (
          <div className="py-2 flex justify-center">
            <button
              onClick={handleOpenProfileModal}
              title={`Logged in as ${currentUser.name} (${role})`}
              className="w-10 h-10 rounded-2xl bg-muted/70 text-foreground flex items-center justify-center font-bold text-xs hover:ring-2 hover:ring-primary/40 transition-all"
            >
              {currentUser.name.charAt(0)}
            </button>
          </div>
        )}

        {/* Dock Navigation Items with Active Rounded Pills */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1.5 scrollbar-thin">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                title={!sidebarExpanded ? item.title : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 font-bold'
                    : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                } ${!sidebarExpanded ? 'justify-center px-0' : ''}`}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
                  }`}
                />
                {sidebarExpanded && (
                  <span className="flex-1 truncate tracking-tight">{item.title}</span>
                )}
                {sidebarExpanded && item.badge && (
                  <Badge
                    variant={item.badge.includes('Pending') ? 'destructive' : 'outline'}
                    className="text-[9px] px-1.5 py-0 h-4 border-muted-foreground/30 font-bold shrink-0"
                  >
                    {item.badge}
                  </Badge>
                )}
                {!sidebarExpanded && item.badge && (
                  <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-destructive ring-2 ring-card" />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Dock Footer */}
        <div className="p-3 border-t border-border/70 bg-card/60 space-y-2">
          {sidebarExpanded ? (
            <div className="space-y-2">
              <button
                onClick={() => handleOpenWhatsAppModal('closing')}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp Closing Report</span>
              </button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-center gap-2 text-xs h-9 rounded-xl text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out ({currentUser.name.split(' ')[0]})</span>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleOpenWhatsAppModal('closing')}
                title="Send WhatsApp Day Closing Report"
                className="h-10 w-10 rounded-2xl text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
              >
                <MessageCircle className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                title="Sign Out"
                className="h-10 w-10 rounded-2xl text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 overflow-x-hidden flex flex-col bg-background">
        {/* Top Header Bar matching reference image layout */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border/70 bg-background/90 backdrop-blur-md px-3 md:px-6">
          {/* Left: Mobile Drawer Trigger + Search Pill Bar */}
          <div className="flex items-center gap-2.5 flex-1 max-w-md min-w-0">
            {/* Mobile Drawer */}
            <div className="md:hidden">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Open navigation drawer</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-0 flex flex-col">
                  <SheetHeader className="p-4 border-b">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-indigo-500 text-white flex items-center justify-center font-black text-xs shadow">
                        TGS
                      </div>
                      <SheetTitle className="text-sm font-bold text-left">
                        {settings.salon_name || 'The Grooming Studio'}
                      </SheetTitle>
                    </div>
                  </SheetHeader>

                  <div className="p-3 bg-muted/30 border-b flex items-center justify-between text-xs">
                    <span className="font-semibold truncate">{currentUser.name}</span>
                    <Badge variant={role === 'owner' ? 'default' : 'secondary'} className="text-[9px] uppercase font-bold">
                      {role}
                    </Badge>
                  </div>

                  <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                    {visibleNavItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path;
                      return (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                            isActive
                              ? 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          }`}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          <span className="flex-1 truncate">{item.title}</span>
                          {item.badge && (
                            <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">
                              {item.badge}
                            </Badge>
                          )}
                        </NavLink>
                      );
                    })}
                  </nav>

                  <div className="p-3 border-t space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleOpenWhatsAppModal();
                      }}
                      className="w-full text-xs justify-center gap-2 text-emerald-600 border-emerald-300"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      WhatsApp Closing Report
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-xs justify-center gap-2 text-destructive"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Pill Search Field (matches reference image top bar) */}
            <div ref={searchContainerRef} className="relative flex-1 min-w-0">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search CRM clients, bills, staff..."
                value={headerSearch}
                onChange={(e) => {
                  setHeaderSearch(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && headerSearch.trim()) {
                    setIsSearchOpen(false);
                    navigate(`/clients?q=${encodeURIComponent(headerSearch.trim())}`);
                  }
                }}
                className="w-full pl-9 pr-8 py-1.5 h-9 rounded-full bg-muted/50 border border-border/70 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
              {headerSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setHeaderSearch('');
                    setIsSearchOpen(false);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
                >
                  ✕
                </button>
              )}

              {/* Global Search Results Dropdown */}
              {isSearchOpen && headerSearch.trim().length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border/80 rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-border/60 text-xs max-h-96 overflow-y-auto">
                  {searchResults.total === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      No matching clients, invoices, or services found for &ldquo;{headerSearch}&rdquo;.
                      <button
                        type="button"
                        onClick={() => {
                          setIsSearchOpen(false);
                          navigate(`/clients?q=${encodeURIComponent(headerSearch.trim())}`);
                        }}
                        className="block mx-auto mt-2 text-primary font-semibold hover:underline"
                      >
                        Search Client Directory &rarr;
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Clients Section */}
                      {searchResults.clients.length > 0 && (
                        <div className="p-2">
                          <div className="px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            Clients ({searchResults.clients.length})
                          </div>
                          {searchResults.clients.map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                setIsSearchOpen(false);
                                setHeaderSearch('');
                                navigate(`/clients?q=${encodeURIComponent(c.name)}`);
                              }}
                              className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-muted/60 transition-colors flex items-center justify-between group"
                            >
                              <div>
                                <div className="font-semibold text-foreground group-hover:text-primary">
                                  {c.name}
                                </div>
                                <div className="text-[10px] text-muted-foreground font-mono">
                                  {role === 'owner' ? c.phone : maskClientPhone(c.phone, role)} {c.email && `• ${c.email}`}
                                </div>
                              </div>
                              <span className="text-[10px] font-mono text-muted-foreground">
                                {c.total_visits} visits
                              </span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Invoices Section */}
                      {searchResults.invoices.length > 0 && (
                        <div className="p-2">
                          <div className="px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            Bills & Invoices ({searchResults.invoices.length})
                          </div>
                          {searchResults.invoices.map((inv) => (
                            <button
                              key={inv.id}
                              type="button"
                              onClick={() => {
                                setIsSearchOpen(false);
                                setHeaderSearch('');
                                navigate('/daily-reports');
                              }}
                              className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-muted/60 transition-colors flex items-center justify-between group"
                            >
                              <div>
                                <div className="font-semibold text-foreground font-mono group-hover:text-primary">
                                  {inv.invoice_number}
                                </div>
                                <div className="text-[10px] text-muted-foreground">
                                  {inv.client_name} • {new Date(inv.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                              <span className="text-[11px] font-bold font-mono text-emerald-600">
                                Rs. {inv.total_amount.toLocaleString()}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Services Section */}
                      {searchResults.services.length > 0 && (
                        <div className="p-2">
                          <div className="px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            Services ({searchResults.services.length})
                          </div>
                          {searchResults.services.map((s) => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => {
                                setIsSearchOpen(false);
                                setHeaderSearch('');
                                navigate('/pos');
                              }}
                              className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-muted/60 transition-colors flex items-center justify-between group"
                            >
                              <div>
                                <div className="font-semibold text-foreground group-hover:text-primary">
                                  {s.name}
                                </div>
                                <div className="text-[10px] text-muted-foreground">
                                  {s.category} • {s.duration_minutes || 30} mins
                                </div>
                              </div>
                              <span className="text-[11px] font-bold font-mono text-foreground">
                                Rs. {s.price.toLocaleString()}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}

                      <div className="p-2 text-center bg-muted/20">
                        <button
                          type="button"
                          onClick={() => {
                            setIsSearchOpen(false);
                            navigate(`/clients?q=${encodeURIComponent(headerSearch.trim())}`);
                          }}
                          className="text-xs text-primary font-semibold hover:underline"
                        >
                          View all results in Client Directory &rarr;
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Header Status Bar: Date, Auto-Closing Timer, Offline/Online Sync Badge, Profile */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Live Date Pill (matches reference image: Today, Mon 22 Nov) */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-muted/60 border border-border/60 text-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span>{formattedTodayDate}</span>
            </div>

            {/* 11:59 PM Auto Closing Countdown Badge */}
            <div
              title="Automatic daily cash register closing at 11:59 PM"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-50/90 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800"
            >
              <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>{closingCountdown}</span>
            </div>

            {/* Offline-First Resilience Sync Pill */}
            {isOnline ? (
              <div
                title="Connected to cloud database. Changes automatically synced."
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="hidden sm:inline">Cloud Sync</span>
              </div>
            ) : (
              <button
                onClick={syncOfflineQueue}
                title="Operating offline. Click to retry syncing with database."
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-300 hover:bg-amber-100 transition-colors animate-pulse"
              >
                <WifiOff className="w-3.5 h-3.5" />
                <span>Offline ({offlineQueueCount})</span>
              </button>
            )}

            {/* WhatsApp Daily Closing Report Quick Launch */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleOpenWhatsAppModal('closing')}
              title="Open Daily WhatsApp Closing Report Summary"
              className="h-9 w-9 rounded-full border-emerald-500/30 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40"
            >
              <MessageCircle className="w-4 h-4" />
            </Button>

            {/* Owner Pending Approvals Alert Bell */}
            {role === 'owner' && pendingUsersCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/staff')}
                className="h-9 gap-1.5 px-2.5 rounded-full text-xs border-amber-500/50 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300"
              >
                <Bell className="w-3.5 h-3.5 animate-bounce text-amber-600" />
                <span className="font-bold">{pendingUsersCount}</span>
              </Button>
            )}

            {/* Settings Quick Icon - OWNER ONLY */}
            {role === 'owner' && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/settings')}
                title="Salon Settings & Configuration"
                className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
              >
                <Settings className="w-4 h-4" />
              </Button>
            )}

            {/* User Profile Avatar Pill Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-2 p-1 pl-2 rounded-full border border-border/80 hover:bg-muted/50 transition-colors focus:outline-none"
                  title="Profile Menu"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-primary to-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-sm">
                    {currentUser.name.charAt(0)}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground mr-1" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60 text-xs rounded-2xl shadow-xl">
                <DropdownMenuLabel className="font-normal p-3">
                  <div className="flex flex-col space-y-1">
                    <p className="text-xs font-bold leading-none">{currentUser.name}</p>
                    <p className="text-[11px] text-muted-foreground leading-none">{currentUser.email}</p>
                    <Badge variant={role === 'owner' ? 'default' : 'secondary'} className="text-[10px] w-fit mt-1.5 uppercase font-bold">
                      {role === 'owner' ? 'Owner Access' : `${role.toUpperCase()} Workspace`}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={handleOpenProfileModal} className="gap-2.5 cursor-pointer font-medium py-2">
                  <UserCog className="w-4 h-4 text-primary" />
                  <span>Edit Profile & Password</span>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => handleOpenWhatsAppModal('closing')} className="gap-2.5 cursor-pointer font-medium py-2 text-emerald-600">
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Closing Report</span>
                </DropdownMenuItem>

                {role === 'owner' && (
                  <DropdownMenuItem onClick={() => navigate('/settings')} className="gap-2.5 cursor-pointer font-medium py-2">
                    <Settings className="w-4 h-4 text-muted-foreground" />
                    <span>Salon Settings & Branding</span>
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={handleLogout} className="gap-2.5 cursor-pointer py-2 text-destructive focus:text-destructive">
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out ({currentUser.name.split(' ')[0]})</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content with bottom padding for mobile app dock */}
        <main className="flex-1 p-3 sm:p-5 md:p-6 pb-24 md:pb-8">
          {children}
        </main>

        {/* Mobile Floating Bottom App Dock (Matches app CRM experience) */}
        <div className="md:hidden fixed bottom-3 inset-x-3 z-40 bg-card/95 backdrop-blur-xl border border-border/80 rounded-2xl shadow-2xl flex items-center justify-around py-2 px-1">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
                isActive ? 'text-primary font-bold scale-105' : 'text-muted-foreground hover:text-foreground'
              }`
            }
          >
            <CreditCard className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">Billing</span>
          </NavLink>

          <NavLink
            to="/daily-reports"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
                isActive ? 'text-primary font-bold scale-105' : 'text-muted-foreground hover:text-foreground'
              }`
            }
          >
            <ArrowRightLeft className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">Daily Sync</span>
          </NavLink>

          <NavLink
            to="/expenses"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
                isActive ? 'text-primary font-bold scale-105' : 'text-muted-foreground hover:text-foreground'
              }`
            }
          >
            <Receipt className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">Expenses</span>
          </NavLink>

          <NavLink
            to="/clients"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
                isActive ? 'text-primary font-bold scale-105' : 'text-muted-foreground hover:text-foreground'
              }`
            }
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">Clients</span>
          </NavLink>

          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-muted-foreground hover:text-foreground"
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">More</span>
          </button>
        </div>
      </div>

      {/* WhatsApp Multi-Report Dialog */}
      <Dialog open={isWhatsAppModalOpen} onOpenChange={setIsWhatsAppModalOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <MessageCircle className="w-5 h-5 text-emerald-500" />
              WhatsApp Business Reports &amp; Slips
            </DialogTitle>
            <DialogDescription className="text-xs">
              Instant Pakistani Rupee reports formatted for WhatsApp with one-tap dispatch.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-1">
            {/* Report Type Selector Pills */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-muted/60 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setWhatsAppReportType('closing');
                  setWhatsAppReportText(generateWhatsAppClosingReport());
                }}
                className={`py-1.5 px-2 text-center text-xs font-semibold rounded-lg transition-all ${
                  whatsAppReportType === 'closing'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Owner Day Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setWhatsAppReportType('staff');
                  const sId = selectedStaffReportId || staff[0]?.id || '';
                  setSelectedStaffReportId(sId);
                  setWhatsAppReportText(generateStaffReportText(sId));
                }}
                className={`py-1.5 px-2 text-center text-xs font-semibold rounded-lg transition-all ${
                  whatsAppReportType === 'staff'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Staff Slip
              </button>
              {role === 'owner' && (
                <button
                  type="button"
                  onClick={() => {
                    setWhatsAppReportType('loyalty');
                    const ph = selectedClientReportPhone || clients[0]?.phone || '';
                    setSelectedClientReportPhone(ph);
                    setWhatsAppReportText(generateLoyaltyReportText(ph));
                  }}
                  className={`py-1.5 px-2 text-center text-xs font-semibold rounded-lg transition-all ${
                    whatsAppReportType === 'loyalty'
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Client Loyalty
                </button>
              )}
            </div>

            {/* Contextual dropdowns based on report type */}
            {whatsAppReportType === 'staff' && (
              <div className="space-y-1">
                <Label className="text-xs font-medium">Select Staff Member</Label>
                <select
                  value={selectedStaffReportId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedStaffReportId(id);
                    setWhatsAppReportText(generateStaffReportText(id));
                  }}
                  className="w-full h-8 text-xs rounded-xl border border-input bg-background px-2"
                >
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.role}) - {s.phone || 'No phone'}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {whatsAppReportType === 'loyalty' && (
              <div className="space-y-1">
                <Label className="text-xs font-medium">Select Client</Label>
                <select
                  value={selectedClientReportPhone}
                  onChange={(e) => {
                    const ph = e.target.value;
                    setSelectedClientReportPhone(ph);
                    setWhatsAppReportText(generateLoyaltyReportText(ph));
                  }}
                  className="w-full h-8 text-xs rounded-xl border border-input bg-background px-2"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.phone}>
                      {c.name} ({c.phone}) - {c.total_visits} visits
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Message Preview</Label>
                <Button variant="ghost" size="sm" onClick={handleCopyReport} className="h-7 text-[11px] gap-1 text-primary">
                  <Copy className="w-3 h-3" />
                  Copy Text
                </Button>
              </div>
              <Textarea
                rows={7}
                value={whatsAppReportText}
                onChange={(e) => setWhatsAppReportText(e.target.value)}
                className="font-mono text-xs rounded-xl"
              />
            </div>

            <div className="p-2.5 bg-muted/40 rounded-xl border border-border/60 text-xs flex items-center justify-between">
              <span className="font-semibold text-foreground">Target Recipient:</span>
              <span className="font-mono text-muted-foreground font-medium">
                {whatsAppReportType === 'closing'
                  ? settings.owner_whatsapp || '03001234567'
                  : whatsAppReportType === 'staff'
                  ? staff.find((s) => s.id === selectedStaffReportId)?.phone || 'Staff Phone'
                  : selectedClientReportPhone || 'Client Phone'}
              </span>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsWhatsAppModalOpen(false)} className="rounded-xl">
              Close
            </Button>
            <Button onClick={handleSendWhatsApp} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 rounded-xl">
              <MessageCircle className="w-4 h-4" />
              Launch WhatsApp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit My Profile & Display Name Dialog */}
      <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <UserCog className="w-4 h-4 text-primary" />
              My Profile & Credentials
            </DialogTitle>
            <DialogDescription className="text-xs">
              Update your personal display name, email, and password. Changes reflect immediately across headers, assignments, and reports.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveProfile} className="space-y-3.5 py-1">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Full Display Name *</Label>
              <Input
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="e.g. Master Barber Tariq"
                className="text-xs rounded-xl"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Login Email *</Label>
              <Input
                type="email"
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
                placeholder="e.g. owner@tgs.pk"
                className="text-xs rounded-xl"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Phone Number (Optional)</Label>
              <Input
                value={profilePhone}
                onChange={(e) => setProfilePhone(e.target.value)}
                placeholder="03001234567"
                className="text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Change Password (leave blank to keep current)</Label>
              <Input
                type="password"
                value={profilePassword}
                onChange={(e) => setProfilePassword(e.target.value)}
                placeholder="New password (min 6 characters)"
                className="text-xs rounded-xl"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsProfileModalOpen(false)}
                className="text-xs rounded-xl"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSavingProfile} className="text-xs font-semibold rounded-xl">
                {isSavingProfile ? 'Saving...' : 'Save Profile'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
