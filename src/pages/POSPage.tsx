import React, { useState, useMemo } from 'react';
import { useSalon } from '@/contexts/SalonContext';
import { maskClientPhone } from '@/utils/phoneMask';
import { getLocalDateString } from '@/utils/dateUtils';
import type {
  SalonService,
  ClientRecord,
  Invoice,
  InvoiceItem,
  StaffMember,
  PaymentMethod,
  SplitPaymentDetail,
} from '@/types/salon';
import {
  Search,
  User,
  UserPlus,
  Plus,
  Minus,
  Trash2,
  Receipt,
  Scissors,
  Check,
  Tag,
  CreditCard,
  Banknote,
  Smartphone,
  ChevronDown,
  Gift,
  HelpCircle,
  FileText,
  Clock,
  Printer,
  Sparkles,
  Edit3,
  X,
  Save,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ReceiptModal } from '@/components/pos/ReceiptModal';
import { toast } from 'sonner';

interface CartItem {
  id: string; // unique cart row id
  service: SalonService;
  customPrice: number; // allows inline price customization per bill
  staffId: string;
  staffName: string;
  commissionRate: number;
}

export const POSPage: React.FC = () => {
  const {
    services,
    clients,
    staff,
    settings,
    createInvoice,
    addClient,
    addExpense,
    currencyFormat,
    currentUser,
    role,
    serviceCategories,
    invoices,
    expenses,
    addClientPunchStamp,
  } = useSalon();

  // Selected Client
  const [selectedClient, setSelectedClient] = useState<ClientRecord | null>(null);
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);

  // Quick Client Creation Modal
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState(''); // Compulsory 11 digits starting with 03 (no prefill)
  const [newClientEmail, setNewClientEmail] = useState(''); // Optional email field
  const [newClientNotes, setNewClientNotes] = useState('');

  // Quick Counter Expense Log Modal (Streamlined: No Category, Cash only)
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState<string>('');
  const [expenseNotes, setExpenseNotes] = useState('');

  // Service Catalog Filters
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogCategory, setCatalogCategory] = useState<string>('all');

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);

  // Editing custom price inline
  const [editingCartItemId, setEditingCartItemId] = useState<string | null>(null);
  const [tempEditPrice, setTempEditPrice] = useState<string>('');

  // Checkout Calculations
  const [discountType, setDiscountType] = useState<'none' | 'percentage' | 'fixed'>('none');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [loyaltyDiscountApplied, setLoyaltyDiscountApplied] = useState(false);
  const [tipAmount, setTipAmount] = useState<number>(0);

  // Allowed Payment Methods: Cash, Online Transfer, Split
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Online Transfer' | 'Split'>('Cash');
  const [invoiceNotes, setInvoiceNotes] = useState('');

  // Split payment state (Cash + Online Transfer only)
  const [splitCash, setSplitCash] = useState<number>(0);
  const [splitOnline, setSplitOnline] = useState<number>(0);

  // Extended Prepaid Wallet state
  const [walletAmountToDeduct, setWalletAmountToDeduct] = useState<number>(0);
  const [referralCodeInput, setReferralCodeInput] = useState<string>('');

  // Receipt Modal State
  const [completedInvoice, setCompletedInvoice] = useState<Invoice | null>(null);
  const [lastSavedInvoice, setLastSavedInvoice] = useState<Invoice | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Primary Assigned Barber for the whole bill
  const [selectedBillBarberId, setSelectedBillBarberId] = useState<string>('');

  // Quick Receipt Reference Lookup state (e.g. TGS-261007-7504)
  const [receiptLookupQuery, setReceiptLookupQuery] = useState('');
  const [matchedReceipt, setMatchedReceipt] = useState<Invoice | null>(null);
  const [isReceiptLookupModalOpen, setIsReceiptLookupModalOpen] = useState(false);

  // Filter clients by search query (name or phone)
  const filteredClients = useMemo(() => {
    if (!clientSearchQuery.trim()) return [];
    const q = clientSearchQuery.toLowerCase().trim();
    return clients
      .filter((c) => c.name.toLowerCase().includes(q) || c.phone.includes(q))
      .slice(0, 8);
  }, [clients, clientSearchQuery]);

  // Filter catalog services
  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      if (!s.is_active) return false;
      const matchesCat = catalogCategory === 'all' || s.category === catalogCategory;
      const matchesSearch = s.name.toLowerCase().includes(catalogSearch.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [services, catalogCategory, catalogSearch]);

  // Helper to determine accurate commission/share rate based on staff model
  const getStaffEffectiveRate = (staffMember: StaffMember | null | undefined): number => {
    if (!staffMember) return 0;
    if (staffMember.pay_type === 'individual_partnership') {
      return staffMember.partnership_percentage || 60;
    }
    if (staffMember.pay_type === 'salary_only') {
      return 0;
    }
    return staffMember.commission_rate || 0;
  };

  // Primary Assigned Barber Handler
  const handleSelectBillBarber = (staffId: string) => {
    setSelectedBillBarberId(staffId);
    if (!staffId) return;
    const selectedStaff = staff.find((s) => s.id === staffId);
    if (!selectedStaff) return;
    const effectiveRate = getStaffEffectiveRate(selectedStaff);
    setCart((prev) =>
      prev.map((item) => ({
        ...item,
        staffId: selectedStaff.id,
        staffName: selectedStaff.name,
        commissionRate: effectiveRate,
      }))
    );
    toast.info(`Assigned ${selectedStaff.name} to all bill services`);
  };

  // Cart actions
  const addToCart = (service: SalonService) => {
    const assignedStaff = selectedBillBarberId
      ? staff.find((s) => s.id === selectedBillBarberId)
      : staff.length > 0
      ? staff[0]
      : null;
    const effectiveRate = getStaffEffectiveRate(assignedStaff);
    const newItem: CartItem = {
      id: crypto.randomUUID(),
      service,
      customPrice: service.price, // defaults to catalog price in PKR
      staffId: assignedStaff ? assignedStaff.id : '',
      staffName: assignedStaff ? assignedStaff.name : 'Unassigned',
      commissionRate: effectiveRate,
    };
    setCart((prev) => [...prev, newItem]);
    toast.success(`Added ${service.name} (${currencyFormat(service.price)}) • Barber: ${newItem.staffName}`);
  };

  const removeFromCart = (rowId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== rowId));
  };

  const updateCartItemStaff = (rowId: string, staffId: string) => {
    const selectedStaff = staff.find((s) => s.id === staffId);
    const effectiveRate = getStaffEffectiveRate(selectedStaff);
    setCart((prev) =>
      prev.map((item) =>
        item.id === rowId
          ? {
              ...item,
              staffId: selectedStaff ? selectedStaff.id : '',
              staffName: selectedStaff ? selectedStaff.name : 'Unassigned',
              commissionRate: effectiveRate,
            }
          : item
      )
    );
  };

  // Inline custom price editing
  const startEditingPrice = (item: CartItem) => {
    setEditingCartItemId(item.id);
    setTempEditPrice(item.customPrice.toString());
  };

  const saveCustomPrice = (rowId: string) => {
    const parsed = parseFloat(tempEditPrice);
    if (!isNaN(parsed) && parsed >= 0) {
      setCart((prev) =>
        prev.map((item) =>
          item.id === rowId ? { ...item, customPrice: parsed } : item
        )
      );
      toast.success(`Price updated to ${currencyFormat(parsed)}`);
    }
    setEditingCartItemId(null);
  };

  const clearCart = () => {
    setCart([]);
    setSelectedBillBarberId('');
    setDiscountType('none');
    setDiscountValue(0);
    setLoyaltyDiscountApplied(false);
    setTipAmount(0);
    setPaymentMethod('Cash');
    setSplitCash(0);
    setSplitOnline(0);
    setInvoiceNotes('');
  };

  const handleReceiptLookup = (ref: string) => {
    setReceiptLookupQuery(ref);
    if (!ref.trim()) {
      setMatchedReceipt(null);
      return;
    }
    const cleanRef = ref.trim().toUpperCase();
    const found = invoices.find(
      (inv: Invoice) =>
        inv.invoice_number.toUpperCase().includes(cleanRef) ||
        inv.id.toUpperCase() === cleanRef
    );
    if (found) {
      setMatchedReceipt(found);
      setIsReceiptLookupModalOpen(true);
    } else {
      setMatchedReceipt(null);
    }
  };

  // Check customer loyalty reward eligibility
  const clientHasFreeFacial = selectedClient && selectedClient.loyalty_free_facials_available > 0;

  // Total Calculations
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.customPrice, 0);
  }, [cart]);

  // Regular discount
  const standardDiscountAmount = useMemo(() => {
    if (discountType === 'percentage') {
      return (subtotal * Math.min(100, Math.max(0, discountValue))) / 100;
    }
    if (discountType === 'fixed') {
      return Math.min(subtotal, Math.max(0, discountValue));
    }
    return 0;
  }, [subtotal, discountType, discountValue]);

  // Loyalty reward discount (Free Facial worth Rs. 2,500)
  const loyaltyDiscountAmount = loyaltyDiscountApplied ? 2500 : 0;

  const totalDiscountAmount = Math.min(
    subtotal,
    standardDiscountAmount + loyaltyDiscountAmount
  );

  const discountedSubtotal = Math.max(0, subtotal - totalDiscountAmount);
  const taxRate = settings.tax_rate || 0;
  const taxAmount = (discountedSubtotal * taxRate) / 100;
  const totalBeforeWallet = Math.max(0, discountedSubtotal + taxAmount + (tipAmount || 0));

  // Wallet deduction
  const effectiveWalletDeducted = useMemo(() => {
    if (!selectedClient) return 0;
    const maxWallet = Math.min(selectedClient.wallet_balance || 0, totalBeforeWallet);
    return Math.min(walletAmountToDeduct, maxWallet);
  }, [selectedClient, walletAmountToDeduct, totalBeforeWallet]);

  const finalTotal = Math.max(0, totalBeforeWallet - effectiveWalletDeducted);

  // Split payment balance check
  const splitTotal = splitCash + splitOnline;
  const splitDiff = finalTotal - splitTotal;

  // Handle Select Existing Client
  const handleSelectClient = (client: ClientRecord) => {
    setSelectedClient(client);
    setClientSearchQuery('');
    setIsClientDropdownOpen(false);
    toast.success(`Client ${client.name} selected for bill`);
  };

  // Open Quick Client Modal with prefilled search query
  const handleOpenQuickClientModal = () => {
    setIsClientDropdownOpen(false);
    setNewClientName(clientSearchQuery.replace(/\d/g, '').trim() || '');
    const digits = clientSearchQuery.replace(/\D/g, '');
    setNewClientPhone(digits.slice(0, 11));
    setNewClientEmail('');
    setNewClientNotes('');
    setIsNewClientModalOpen(true);
  };

  // Handle Quick Client Create with Compulsory 11-Digit '03' Validation
  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) {
      toast.error('Customer name is required');
      return;
    }

    const clean = newClientPhone.replace(/\D/g, '');
    if (!clean.startsWith('03')) {
      toast.error("Client phone number must start with '03' (e.g. 03001234567)");
      return;
    }
    if (clean.length !== 11) {
      toast.error("Client phone number must be exactly 11 digits (e.g. 03001234567)");
      return;
    }

    const created = await addClient({
      name: newClientName.trim(),
      phone: clean,
      email: newClientEmail.trim() || null,
      notes: newClientNotes.trim() || null,
    });

    if (created) {
      setSelectedClient(created);
      setIsNewClientModalOpen(false);
      setNewClientName('');
      setNewClientPhone('');
      setNewClientEmail('');
      setNewClientNotes('');
      setClientSearchQuery('');
    }
  };

  // Handle Quick Expense Log (Streamlined with Daily Expense Quota limit checking)
  const handleQuickExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseTitle.trim() || !expenseAmount) {
      toast.error('Please enter expense description and amount');
      return;
    }
    const amt = parseFloat(expenseAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error('Enter a valid expense amount in Rupees');
      return;
    }

    const todayStr = getLocalDateString();
    const todayExpensesTotal = expenses
      .filter((exp: any) => exp.expense_date === todayStr || exp.created_at?.startsWith(todayStr))
      .reduce((sum: number, exp: any) => sum + exp.amount, 0);
    const dailyQuota = settings.daily_expense_quota ?? 5000;
    const remainingBefore = Math.max(0, dailyQuota - todayExpensesTotal);
    const isExceeded = amt > remainingBefore;
    const excessAmt = isExceeded ? amt - remainingBefore : 0;

    await addExpense({
      title: expenseTitle.trim(),
      category: 'Miscellaneous',
      amount: amt,
      payment_mode: 'Cash',
      expense_date: todayStr,
      notes: expenseNotes.trim()
        ? `${expenseNotes.trim()}${isExceeded ? ` [OVER-QUOTA: Exceeded by Rs. ${excessAmt}]` : ''}`
        : isExceeded
        ? `[OVER-QUOTA: Exceeded daily limit by Rs. ${excessAmt}]`
        : null,
      is_exceeded_expense: isExceeded,
      quota_excess_amount: excessAmt,
    });

    if (isExceeded) {
      toast.warning(`⚠️ Expense of Rs. ${amt} exceeded today's remaining quota by Rs. ${excessAmt}. Logged as Exceeded Expense.`);
    } else {
      toast.success(`Expense of Rs. ${amt} recorded. Remaining quota: Rs. ${remainingBefore - amt}`);
    }

    setIsExpenseModalOpen(false);
    setExpenseTitle('');
    setExpenseAmount('');
    setExpenseNotes('');
  };

  // Handle Checkout (Entry saving by default; side print action opens receipt)
  const handleCheckout = async (shouldPrintReceipt: boolean = false) => {
    if (cart.length === 0) {
      toast.error('Cart is empty. Please add at least one service.');
      return;
    }

    if (!settings.allow_quick_walkin && !selectedClient) {
      toast.error(
        'Owner Policy: Customer selection is required. Please search or add a customer with verified 11-digit mobile number before completing checkout.'
      );
      return;
    }

    if (paymentMethod === 'Split' && Math.abs(splitDiff) > 0.01) {
      toast.error(
        `Split amounts (${currencyFormat(splitTotal)}) do not match final total (${currencyFormat(
          finalTotal
        )}). Difference: ${currencyFormat(Math.abs(splitDiff))}`
      );
      return;
    }

    setIsSubmitting(true);

    const splitDetails: SplitPaymentDetail[] =
      paymentMethod === 'Split'
        ? [
            { method: 'Cash' as const, amount: Number(splitCash || 0) },
            { method: 'Online Transfer' as const, amount: Number(splitOnline || 0) },
          ].filter((s) => s.amount > 0)
        : [];

    // Proportionally attribute discount to each item
    const discountRatio = subtotal > 0 ? (subtotal - totalDiscountAmount) / subtotal : 1;

    const invoiceItems: Omit<InvoiceItem, 'id' | 'invoice_id'>[] = cart.map((item) => {
      const discountedItemPrice = item.customPrice * discountRatio;
      const commissionAmount = Number(((discountedItemPrice * item.commissionRate) / 100).toFixed(0));

      const fallbackStaff = staff.length > 0 ? staff[0] : null;
      const assignedStaff = item.staffId ? staff.find((s) => s.id === item.staffId) : (selectedBillBarberId ? staff.find((s) => s.id === selectedBillBarberId) : fallbackStaff);
      const staffName = item.staffName && item.staffName !== 'Unassigned'
        ? item.staffName
        : (assignedStaff?.name || 'Staff Member');
      const staffId = item.staffId || assignedStaff?.id || null;

      return {
        service_id: item.service.id,
        service_name: item.service.name,
        category: item.service.category,
        price: item.customPrice,
        staff_id: staffId,
        staff_name: staffName,
        commission_rate: item.commissionRate || (assignedStaff ? getStaffEffectiveRate(assignedStaff) : 0),
        commission_amount: commissionAmount,
      };
    });

    // Detailed service breakdown string for receipt & accounting backup
    const serviceBreakdownSummary = invoiceItems
      .map((it) => `${it.service_name} (${it.staff_name} - ${currencyFormat(it.price)})`)
      .join(' + ');

    const notesSummary = [
      invoiceNotes.trim(),
      `Breakdown: ${serviceBreakdownSummary}`,
      loyaltyDiscountApplied ? 'Loyalty Free Facial worth Rs. 2,500 applied' : null,
    ]
      .filter(Boolean)
      .join(' | ');

    const newInvoice = await createInvoice(
      {
        client_id: selectedClient ? selectedClient.id : null,
        client_name: selectedClient ? selectedClient.name : 'Walk-in Guest',
        client_phone: selectedClient ? selectedClient.phone : 'N/A',
        client_email: selectedClient ? selectedClient.email : null,
        subtotal,
        discount_type: discountType,
        discount_value: discountValue,
        discount_amount: totalDiscountAmount,
        loyalty_reward_applied: loyaltyDiscountApplied ? 'Free Facial (Rs. 2,500)' : null,
        loyalty_reward_discount: loyaltyDiscountAmount,
        client_wallet_deducted: effectiveWalletDeducted,
        referral_code_used: referralCodeInput.trim() || null,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        tip_amount: tipAmount || 0,
        total_amount: finalTotal,
        payment_method: paymentMethod as PaymentMethod,
        split_details: splitDetails.length > 0 ? splitDetails : null,
        status: 'Completed',
        notes: notesSummary || null,
        created_by_role: role,
      },
      invoiceItems
    );

    // Enforce 1 digital stamp per calendar day for the client
    if (selectedClient && selectedClient.id !== 'client-walkin') {
      const todayDateStr = getLocalDateString();
      if (selectedClient.last_stamped_date !== todayDateStr) {
        await addClientPunchStamp(selectedClient.id);
      } else {
        toast.info(`ℹ️ Stamp note: ${selectedClient.name} already received today's loyalty stamp.`);
      }
    }

    setIsSubmitting(false);

    if (newInvoice) {
      setLastSavedInvoice(newInvoice);
      if (shouldPrintReceipt) {
        setCompletedInvoice(newInvoice);
        setIsReceiptModalOpen(true);
      }
      clearCart();
      setSelectedClient(null);
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Top Header & Quick Reference / Expense Actions */}
      <div className="bg-card border border-border/80 rounded-2xl p-3 sm:p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-foreground flex items-center gap-2">
              Billing Terminal &amp; POS
            </h1>
            <p className="text-[11px] text-muted-foreground">
              Fast 3-Step Checkout: 1. Select Services ➔ 2. Select Client Profile ➔ 3. Process Payment &amp; Print Receipt
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Receipt Reference Number Lookup (e.g. TGS-261007-7504) */}
          <div className="relative min-w-[190px] sm:min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Lookup Receipt # (e.g. TGS-...)"
              value={receiptLookupQuery}
              onChange={(e) => handleReceiptLookup(e.target.value)}
              className="pl-8 h-9 text-xs rounded-xl bg-background border-border/80 font-mono"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpenseModalOpen(true)}
            className="gap-1.5 h-9 px-3 text-xs font-semibold rounded-xl border-border/80 bg-background hover:bg-muted/60"
          >
            <Receipt className="w-3.5 h-3.5 text-foreground" />
            <span>Counter Expense</span>
          </Button>

          {/* Quick Print of Last Saved Bill on demand */}
          {lastSavedInvoice && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCompletedInvoice(lastSavedInvoice);
                setIsReceiptModalOpen(true);
              }}
              title="Print receipt for the most recent completed bill"
              className="gap-1.5 h-9 px-3 text-xs font-semibold rounded-xl border-emerald-500/40 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-300"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Last Bill ({lastSavedInvoice.invoice_number.slice(-4)})</span>
            </Button>
          )}
        </div>
      </div>

      {/* WORKFLOW STEP 1: Choose Services from Catalogue */}
      <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border/60">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-primary text-primary-foreground text-xs font-black flex items-center justify-center shrink-0">
              1
            </span>
            <div>
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Scissors className="w-4 h-4 text-primary" />
                Step 1: Choose Services from Catalogue
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Select grooming, haircut, beard, facial, and styling treatments for this session.
              </p>
            </div>
          </div>
          {cart.length > 0 && (
            <Badge className="bg-primary/10 text-primary border border-primary/30 font-bold self-start sm:self-auto text-xs">
              {cart.length} service{cart.length > 1 ? 's' : ''} in bill
            </Badge>
          )}
        </div>

        {/* Pinned Core Services for Instant 1-Click Add */}
        {services.some((s) => s.is_pinned && s.is_active) && (
          <div className="p-3 rounded-2xl border border-primary/20 bg-primary/5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <Scissors className="w-3.5 h-3.5 text-primary" />
                Fast 1-Click Add (Haircut &amp; Beard)
              </span>
              <Badge variant="outline" className="text-[10px] font-mono border-primary/40 text-primary">
                Pinned Core
              </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {services
                .filter((s) => s.is_pinned && s.is_active)
                .map((pinnedSvc) => (
                  <button
                    key={pinnedSvc.id}
                    type="button"
                    onClick={() => addToCart(pinnedSvc)}
                    className="h-11 flex items-center justify-between px-3 text-xs bg-card hover:bg-primary/10 border border-border/80 hover:border-primary/40 rounded-xl transition-all shadow-sm text-left"
                  >
                    <span className="font-bold truncate text-foreground text-xs">{pinnedSvc.name}</span>
                    <span className="font-mono font-black text-primary ml-1 shrink-0 text-xs">
                      {currencyFormat(pinnedSvc.price)}
                    </span>
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* Search & Category Filter Bar */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search catalog services..."
              value={catalogSearch}
              onChange={(e) => setCatalogSearch(e.target.value)}
              className="pl-8 h-9 text-xs rounded-xl bg-background"
            />
          </div>

          <Select value={catalogCategory} onValueChange={setCatalogCategory}>
            <SelectTrigger className="w-[160px] h-9 text-xs rounded-xl bg-background">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="rounded-xl text-xs">
              <SelectItem value="all">All Categories</SelectItem>
              {serviceCategories.map((c) => (
                <SelectItem key={c.id} value={c.name}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Catalog Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              onClick={() => addToCart(service)}
              className="p-3 rounded-2xl border border-border/70 bg-card hover:border-primary/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-2 group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                    {service.name}
                  </h4>
                  <p className="text-[11px] text-muted-foreground truncate">{service.category}</p>
                </div>
                <span className="font-mono font-black text-xs text-foreground bg-muted/60 px-2 py-0.5 rounded-lg shrink-0">
                  {currencyFormat(service.price)}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/40">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {service.duration_minutes} mins
                </span>
                <span className="font-semibold text-primary group-hover:underline flex items-center gap-0.5">
                  <Plus className="w-3 h-3" /> Add
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* WORKFLOW STEP 2: Choose Customer (Search Bar with '+' Button Under Services & Over Active Invoice) */}
      <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border/60">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-primary text-primary-foreground text-xs font-black flex items-center justify-center shrink-0">
              2
            </span>
            <div>
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                Step 2: Choose Customer (Search Name or Phone, or Quick &apos;+&apos; Register)
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Enter client name or phone number with &apos;+&apos; feature to link client profile and loyalty punches.
              </p>
            </div>
          </div>

          {/* Quick Walk-In Guest button (Strictly honors Owner Settings toggle) */}
          {Boolean(settings.allow_quick_walkin) && (!selectedClient || selectedClient.id !== 'client-walkin') && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedClient({
                  id: 'client-walkin',
                  name: 'Walk-In Guest',
                  phone: '03000000000',
                  total_visits: 1,
                  loyalty_visits_count: 0,
                  loyalty_free_facials_available: 0,
                  total_rewards_claimed: 0,
                  total_spent: 0,
                  wallet_balance: 0,
                  punch_card_stamps: 0,
                });
                toast.info('Quick Walk-In Guest selected for checkout');
              }}
              className="gap-1.5 h-8 px-3 text-xs font-bold rounded-xl border-amber-500/40 text-amber-700 bg-amber-50/60 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 self-start sm:self-auto"
            >
              <User className="w-3.5 h-3.5" />
              <span>⚡ Quick Walk-In</span>
            </Button>
          )}
        </div>

        {/* Inline Customer Lookup with Built-in '+' Quick Add Button */}
        <div className="relative w-full">
          {selectedClient ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-primary/10 border border-primary/30 gap-2">
              <div className="flex flex-wrap items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
                <span className="font-bold text-foreground text-xs truncate">
                  {selectedClient.name}
                </span>
                <span className="font-mono text-[11px] text-muted-foreground shrink-0">
                  ({role === 'owner' ? selectedClient.phone : maskClientPhone(selectedClient.phone, role)})
                </span>
                {selectedClient.tags?.includes('VIP') && (
                  <Badge variant="outline" className="text-[9px] border-amber-500/50 text-amber-600 font-bold">
                    VIP
                  </Badge>
                )}
                <Badge className="bg-primary/20 hover:bg-primary/20 text-primary border-primary/30 font-mono text-[10px] font-bold">
                  {selectedClient.total_visits} Total Visits
                </Badge>
                <Badge variant="outline" className="text-[10px] font-mono font-semibold">
                  Punch: {selectedClient.loyalty_visits_count}/5
                </Badge>
                {selectedClient.loyalty_free_facials_available > 0 ? (
                  <Badge className="bg-emerald-600 text-white font-bold text-[10px] animate-pulse">
                    🎉 {selectedClient.loyalty_free_facials_available} Free Facial Ready!
                  </Badge>
                ) : (
                  <span className="text-[10px] text-muted-foreground font-medium">
                    (Needs {5 - (selectedClient.loyalty_visits_count % 5)} more visits for Free Facial)
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedClient(null)}
                className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:text-destructive self-end sm:self-auto shrink-0"
                title="Remove client from bill"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          ) : (
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Enter client name or phone (03...) to lookup customer..."
                value={clientSearchQuery}
                onChange={(e) => {
                  setClientSearchQuery(e.target.value);
                  setIsClientDropdownOpen(true);
                }}
                onFocus={() => setIsClientDropdownOpen(true)}
                className="pl-9 pr-12 h-11 text-xs rounded-xl bg-background border-border/80"
              />
              {/* '+' button directly inside the field to add new customer immediately */}
              <button
                type="button"
                onClick={handleOpenQuickClientModal}
                title="Add new customer directly"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
              </button>

              {/* Inline Search Dropdown Results */}
              {isClientDropdownOpen && clientSearchQuery.trim() && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-card border border-border/80 rounded-2xl shadow-xl z-50 overflow-hidden text-xs divide-y divide-border/60">
                  {filteredClients.length > 0 ? (
                    filteredClients.map((client) => (
                      <button
                        key={client.id}
                        type="button"
                        onClick={() => handleSelectClient(client)}
                        className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-muted/60 transition-colors"
                      >
                        <div className="min-w-0">
                          <span className="font-bold text-foreground block truncate">{client.name}</span>
                          <span className="text-[11px] font-mono text-muted-foreground">
                            {role === 'owner' ? client.phone : maskClientPhone(client.phone, role)}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] text-muted-foreground block">{client.total_visits} visits</span>
                          {client.loyalty_free_facials_available > 0 && (
                            <Badge className="bg-emerald-600 text-white text-[9px] px-1 py-0">
                              Free Facial
                            </Badge>
                          )}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-3 text-center space-y-2">
                      <p className="text-muted-foreground text-[11px]">
                        No client found for &ldquo;{clientSearchQuery}&rdquo;
                      </p>
                      <Button
                        size="sm"
                        onClick={handleOpenQuickClientModal}
                        className="gap-1.5 h-8 text-xs rounded-xl w-full"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Quick Add New Customer
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Selected Client Loyalty Reward Eligibility Banner */}
        {selectedClient && clientHasFreeFacial && (
          <div className="bg-emerald-50/70 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 rounded-2xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-bold text-emerald-800 dark:text-emerald-200">
                {selectedClient.name} has {selectedClient.loyalty_free_facials_available} Complimentary Facial Reward (Rs. 2,500 value)!
              </span>
            </div>
            <Button
              size="sm"
              onClick={() => {
                setLoyaltyDiscountApplied(!loyaltyDiscountApplied);
                if (!loyaltyDiscountApplied) {
                  toast.success('Free Facial reward worth Rs. 2,500 applied to this bill!');
                }
              }}
              className={`h-8 text-xs font-bold rounded-xl gap-1.5 ${
                loyaltyDiscountApplied ? 'bg-emerald-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              {loyaltyDiscountApplied ? 'Reward Applied (-Rs. 2,500)' : 'Apply to Bill'}
            </Button>
          </div>
        )}
      </div>

      {/* WORKFLOW STEP 3: Final Invoice Billing Entry */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <span className="w-6 h-6 rounded-lg bg-primary text-primary-foreground text-xs font-black flex items-center justify-center shrink-0">
            3
          </span>
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Receipt className="w-4 h-4 text-primary" />
            Step 3: Final Invoice Billing Entry &amp; Checkout
          </h2>
        </div>

        {/* Active Cart & Entry Saving */}
        <div className="w-full">
          <Card className="rounded-2xl border-border/80 shadow-sm flex flex-col h-full bg-card">
            <CardHeader className="p-3.5 pb-2 border-b border-border/60 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-primary" />
                  Active Invoice ({cart.length})
                </CardTitle>
                <CardDescription className="text-[11px]">
                  Accounting entries saved directly
                </CardDescription>
              </div>

              {cart.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearCart}
                  className="h-7 text-[11px] text-muted-foreground hover:text-destructive px-2 rounded-lg"
                >
                  Clear All
                </Button>
              )}
            </CardHeader>

            {/* Primary Barber Assignment for Current Bill */}
            <div className="px-3.5 py-2 bg-muted/20 border-b border-border/40">
              <div className="flex items-center gap-2">
                <Scissors className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="text-xs font-semibold text-foreground whitespace-nowrap">
                  Barber:
                </span>
                <select
                  value={selectedBillBarberId}
                  onChange={(e) => handleSelectBillBarber(e.target.value)}
                  className="flex-1 text-xs bg-card border border-border/80 rounded-xl px-2.5 py-1.5 text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">-- Assign Barber for this Bill --</option>
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.pay_type === 'individual_partnership' ? `${s.partnership_percentage || 60}% Share` : `${s.commission_rate}% Comm`})
                    </option>
                  ))}
                </select>
              </div>
              {selectedBillBarberId && (
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                  ✓ All bill services assigned to {staff.find((s) => s.id === selectedBillBarberId)?.name}.
                </p>
              )}
            </div>

            <CardContent className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
              {/* Cart Items List */}
              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1 flex-1 scrollbar-thin">
                {cart.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">
                    <Scissors className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-xs font-semibold">No services in cart</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Click services from the left catalog to add to bill.
                    </p>
                  </div>
                ) : (
                  cart.map((item, index) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/40 space-y-1.5 text-xs transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <span className="font-bold text-foreground truncate block">
                            {index + 1}. {item.service.name}
                          </span>
                          {/* Barber Attribution selector */}
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[10px] text-muted-foreground shrink-0">Staff:</span>
                            <select
                              value={item.staffId}
                              onChange={(e) => updateCartItemStaff(item.id, e.target.value)}
                              className="text-[11px] bg-card border border-border/70 rounded-lg px-2 py-0.5 text-foreground max-w-[150px] font-medium"
                            >
                              <option value="">Unassigned</option>
                              {staff.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.name} ({s.pay_type === 'individual_partnership' ? `${s.partnership_percentage || 60}%` : `${s.commission_rate}%`})
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Inline Customizable Price */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {editingCartItemId === item.id ? (
                            <div className="flex items-center gap-1">
                              <Input
                                type="number"
                                value={tempEditPrice}
                                onChange={(e) => setTempEditPrice(e.target.value)}
                                className="w-20 h-7 text-xs font-bold rounded-lg"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') saveCustomPrice(item.id);
                                }}
                              />
                              <Button
                                size="sm"
                                className="h-7 px-2 text-[10px] rounded-lg"
                                onClick={() => saveCustomPrice(item.id)}
                              >
                                Done
                              </Button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => startEditingPrice(item)}
                              title="Click to customize price"
                              className="font-mono font-bold text-foreground text-xs hover:text-primary flex items-center gap-1 border-b border-dashed border-primary/50"
                            >
                              {currencyFormat(item.customPrice)}
                              <Edit3 className="w-3 h-3 text-muted-foreground" />
                            </button>
                          )}

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFromCart(item.id)}
                            className="h-6 w-6 text-muted-foreground hover:text-destructive rounded-lg"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Cart Summary & Checkout Calculations */}
              {cart.length > 0 && (
                <div className="border-t border-border/60 pt-3 space-y-2.5 text-xs">
                  {/* Subtotal */}
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="font-mono font-bold text-foreground">{currencyFormat(subtotal)}</span>
                  </div>

                  {/* Discount Controls */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">Discount</span>
                    <div className="flex items-center gap-1.5">
                      <select
                        value={discountType}
                        onChange={(e) => setDiscountType(e.target.value as any)}
                        className="text-[11px] bg-card border border-border/70 rounded-lg px-2 py-0.5 text-foreground"
                      >
                        <option value="none">None</option>
                        <option value="percentage">% Off</option>
                        <option value="fixed">Fixed Rs.</option>
                      </select>
                      {discountType !== 'none' && (
                        <Input
                          type="number"
                          min="0"
                          value={discountValue}
                          onChange={(e) => setDiscountValue(Number(e.target.value))}
                          className="w-16 h-7 text-xs text-right rounded-lg"
                        />
                      )}
                    </div>
                  </div>

                  {/* Customer Prepaid Wallet Integration */}
                  {selectedClient && (selectedClient.wallet_balance || 0) > 0 && (
                    <div className="p-2.5 rounded-xl border border-primary/20 bg-primary/5 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-semibold block text-foreground">Prepaid Wallet Credit</span>
                          <span className="text-[10px] text-emerald-600 font-mono font-bold">
                            Balance: {currencyFormat(selectedClient.wallet_balance || 0)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            min="0"
                            max={selectedClient.wallet_balance || 0}
                            value={walletAmountToDeduct || ''}
                            onChange={(e) => setWalletAmountToDeduct(Number(e.target.value))}
                            placeholder="0"
                            className="w-16 h-7 text-xs text-right rounded-lg"
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => setWalletAmountToDeduct(Math.min(selectedClient.wallet_balance || 0, totalBeforeWallet))}
                            className="h-7 text-[10px] px-1.5 rounded-lg"
                          >
                            Max
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {totalDiscountAmount > 0 && (
                    <div className="flex items-center justify-between text-emerald-600 font-bold">
                      <span>Total Savings & Discounts</span>
                      <span>-{currencyFormat(totalDiscountAmount)}</span>
                    </div>
                  )}
                  {effectiveWalletDeducted > 0 && (
                    <div className="flex items-center justify-between text-indigo-600 font-bold">
                      <span>Prepaid Wallet Deducted</span>
                      <span>-{currencyFormat(effectiveWalletDeducted)}</span>
                    </div>
                  )}

                  {/* Optional Additional Billing Notes */}
                  <div className="space-y-1 pt-1">
                    <Label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      Billing Notes (Optional)
                    </Label>
                    <Input
                      placeholder="e.g. Special cut, client request, counter remarks..."
                      value={invoiceNotes}
                      onChange={(e) => setInvoiceNotes(e.target.value)}
                      className="h-8 text-xs rounded-xl"
                    />
                  </div>

                  {/* Payment Method Selector: Cash, Online Transfer, Split ONLY (No Wallet, No Card) */}
                  <div className="space-y-1.5 pt-1">
                    <Label className="text-[11px] font-semibold text-muted-foreground">Payment Mode</Label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(['Cash', 'Online Transfer', 'Split'] as const).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setPaymentMethod(mode)}
                          className={`h-9 px-2 text-xs font-bold rounded-xl border transition-all ${
                            paymentMethod === mode
                              ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                              : 'bg-card border-border/80 text-muted-foreground hover:bg-muted/50'
                          }`}
                        >
                          {mode === 'Online Transfer' ? 'Online' : mode}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Split Details Input if Split is selected */}
                  {paymentMethod === 'Split' && (
                    <div className="p-2.5 rounded-xl border border-border/80 bg-muted/30 space-y-2">
                      <div className="flex items-center justify-between font-semibold text-foreground text-[11px]">
                        <span>Split Breakdown (Cash + Online):</span>
                        {Math.abs(splitDiff) > 0.01 && (
                          <span className="text-destructive font-mono font-bold text-[10px]">
                            Remaining: {currencyFormat(splitDiff)}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-muted-foreground block mb-0.5">Cash (Rs.)</label>
                          <Input
                            type="number"
                            value={splitCash || ''}
                            onChange={(e) => setSplitCash(Number(e.target.value))}
                            placeholder="0"
                            className="h-7 text-xs rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-muted-foreground block mb-0.5">Online (Rs.)</label>
                          <Input
                            type="number"
                            value={splitOnline || ''}
                            onChange={(e) => setSplitOnline(Number(e.target.value))}
                            placeholder="0"
                            className="h-7 text-xs rounded-lg"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Net Amount & Dual Action Buttons (Save Entry vs Side Print Receipt) */}
                  <div className="pt-2 border-t border-border/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase">Net Total Payable</div>
                      <div className="text-xl font-black text-primary font-mono">
                        {currencyFormat(finalTotal)}
                      </div>
                    </div>

                    {/* Dual Action: Primary Pure Entry Saving + Side Print Receipt Button */}
                    <div className="flex items-center gap-2 pt-1">
                      {/* Primary Button: Pure Accounting Entry Saving (No Auto-Print) */}
                      <Button
                        size="lg"
                        onClick={() => handleCheckout(false)}
                        disabled={isSubmitting || (paymentMethod === 'Split' && Math.abs(splitDiff) > 0.01)}
                        className="flex-1 font-bold gap-2 h-11 rounded-xl shadow-md"
                      >
                        <Save className="w-4 h-4" />
                        <span>{isSubmitting ? 'Saving...' : `Save Entry (${currencyFormat(finalTotal)})`}</span>
                      </Button>

                      {/* Side Option: Print Receipt for customers who explicitly request one */}
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={() => handleCheckout(true)}
                        disabled={isSubmitting || (paymentMethod === 'Split' && Math.abs(splitDiff) > 0.01)}
                        title="Save entry AND print thermal receipt"
                        className="h-11 px-3.5 rounded-xl border-border/80 text-primary hover:bg-muted/60"
                      >
                        <Printer className="w-4 h-4 text-primary" />
                        <span className="hidden sm:inline text-xs font-semibold">Print</span>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Add Client Modal with Compulsory 11-Digit Starting with '03' */}
      <Dialog open={isNewClientModalOpen} onOpenChange={setIsNewClientModalOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <UserPlus className="w-4 h-4 text-primary" />
              Register New Customer
            </DialogTitle>
            <DialogDescription className="text-xs">
              Phone number is strictly compulsory 11 digits starting with 03.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateClient} className="space-y-3.5 py-1">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Customer Full Name *</Label>
              <Input
                placeholder="e.g. Tariq Mehmood"
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
                className="text-xs rounded-xl"
                required
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Mobile Phone (Compulsory 11 Digits starting with 03) *</Label>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {newClientPhone.replace(/\D/g, '').length}/11 digits
                </span>
              </div>
              <Input
                type="tel"
                maxLength={11}
                placeholder="03XXXXXXXXX (Enter full 11 digits)"
                value={newClientPhone}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '');
                  setNewClientPhone(digits.slice(0, 11));
                }}
                className="text-xs font-mono font-bold rounded-xl"
                required
              />
              <p className="text-[10px] text-muted-foreground">
                Enter entire 11 digits starting with <strong className="text-foreground">03</strong> (e.g. 03001234567).
              </p>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Email Address (Optional)</Label>
              <Input
                type="email"
                placeholder="e.g. customer@example.com"
                value={newClientEmail}
                onChange={(e) => setNewClientEmail(e.target.value)}
                className="text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Notes / Grooming Preferences (Optional)</Label>
              <Input
                placeholder="e.g. Prefers scissor cut, sensitive skin"
                value={newClientNotes}
                onChange={(e) => setNewClientNotes(e.target.value)}
                className="text-xs rounded-xl"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsNewClientModalOpen(false)}
                className="text-xs rounded-xl"
              >
                Cancel
              </Button>
              <Button type="submit" className="text-xs font-bold rounded-xl">
                Add &amp; Select Customer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Quick Counter Expense Modal (No Category, Cash only) */}
      <Dialog open={isExpenseModalOpen} onOpenChange={setIsExpenseModalOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Receipt className="w-4 h-4 text-primary" />
              Log Counter Cash Expense
            </DialogTitle>
            <DialogDescription className="text-xs">
              Quickly record cash spent from the counter drawer. Automatically reflected in day closing.
            </DialogDescription>
          </DialogHeader>

          {/* Daily Expense Quota Indicator & Alert */}
          {(() => {
            const todayStr = getLocalDateString();
            const todayExpensesTotal = expenses
              .filter((exp: any) => exp.expense_date === todayStr || exp.created_at?.startsWith(todayStr))
              .reduce((sum: number, exp: any) => sum + exp.amount, 0);
            const dailyQuota = settings.daily_expense_quota ?? 5000;
            const remainingQuota = Math.max(0, dailyQuota - todayExpensesTotal);
            const parsedAmt = parseFloat(expenseAmount) || 0;
            const isOver = parsedAmt > remainingQuota;
            const excess = isOver ? parsedAmt - remainingQuota : 0;

            return (
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl border border-border/60 bg-muted/20 text-xs">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Daily Quota</span>
                    <span className="font-mono font-bold text-foreground">{currencyFormat(dailyQuota)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Spent Today</span>
                    <span className="font-mono font-bold text-destructive">{currencyFormat(todayExpensesTotal)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Balance Left</span>
                    <span className={`font-mono font-bold ${remainingQuota > 0 ? 'text-emerald-600' : 'text-destructive'}`}>
                      {currencyFormat(remainingQuota)}
                    </span>
                  </div>
                </div>

                {parsedAmt > 0 && isOver && (
                  <div className="p-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10 text-xs text-amber-700 dark:text-amber-300">
                    <span className="font-bold block">⚠️ Daily Expense Quota Exceeded!</span>
                    <span>
                      This expense will exceed today&apos;s remaining quota by{' '}
                      <strong className="font-mono font-bold">{currencyFormat(excess)}</strong>. It will be recorded and flagged as an extra/exceeded expense for the Owner.
                    </span>
                  </div>
                )}
              </div>
            );
          })()}

          <form onSubmit={handleQuickExpenseSubmit} className="space-y-3.5 py-1">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Expense Description *</Label>
              <Input
                placeholder="e.g. Chai, bottled water, blade packets, cleaning..."
                value={expenseTitle}
                onChange={(e) => setExpenseTitle(e.target.value)}
                className="text-xs rounded-xl"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Amount Paid in PKR (Rs.) *</Label>
              <Input
                type="number"
                placeholder="e.g. 350"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                className="text-xs font-mono font-bold rounded-xl"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Additional Remarks (Optional)</Label>
              <Input
                placeholder="e.g. Paid to courier boy / refreshment vendor"
                value={expenseNotes}
                onChange={(e) => setExpenseNotes(e.target.value)}
                className="text-xs rounded-xl"
              />
            </div>

            <div className="p-2.5 bg-muted/40 rounded-xl border border-border/60 text-[11px] text-muted-foreground flex items-center justify-between">
              <span>Payment Mode:</span>
              <Badge variant="outline" className="font-mono text-xs font-bold">
                Cash Drawer
              </Badge>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsExpenseModalOpen(false)}
                className="text-xs rounded-xl"
              >
                Cancel
              </Button>
              <Button type="submit" className="text-xs font-bold rounded-xl">
                Log Cash Expense
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Quick Receipt Reference Lookup Modal (TGS-261007-7504) */}
      <Dialog open={isReceiptLookupModalOpen} onOpenChange={setIsReceiptLookupModalOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Receipt className="w-4 h-4 text-primary" />
              Receipt Reference Quick Lookup
            </DialogTitle>
            <DialogDescription className="text-xs font-mono">
              Reference: #{matchedReceipt?.invoice_number}
            </DialogDescription>
          </DialogHeader>

          {matchedReceipt && (
            <div className="space-y-3.5 py-1 text-xs">
              <div className="p-3 rounded-xl border border-border/60 bg-muted/20 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date & Time:</span>
                  <span className="font-medium font-mono text-foreground">
                    {new Date(matchedReceipt.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer:</span>
                  <span className="font-bold text-foreground">
                    {matchedReceipt.client_name} ({matchedReceipt.client_phone})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method:</span>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {matchedReceipt.payment_method}
                  </Badge>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="font-bold text-foreground block">Itemized Service Breakdown:</span>
                <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                  {matchedReceipt.items && matchedReceipt.items.length > 0 ? (
                    matchedReceipt.items.map((it, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-card border border-border/60">
                        <div>
                          <div className="font-semibold text-foreground">{it.service_name}</div>
                          <div className="text-[10px] text-primary font-bold flex items-center gap-1">
                            <Scissors className="w-3 h-3" />
                            {it.staff_name || 'Staff Member'}
                          </div>
                        </div>
                        <span className="font-mono font-bold text-foreground">
                          {currencyFormat(it.price)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-2 text-muted-foreground text-center">Grooming Services</div>
                  )}
                </div>
              </div>

              <div className="p-2.5 rounded-xl border border-border/60 bg-muted/30 space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-mono font-semibold">{currencyFormat(matchedReceipt.subtotal)}</span>
                </div>
                {matchedReceipt.discount_amount > 0 && (
                  <div className="flex justify-between text-amber-600">
                    <span>Discount:</span>
                    <span className="font-mono font-semibold">-{currencyFormat(matchedReceipt.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm text-foreground pt-1 border-t border-border/40">
                  <span>Net Total:</span>
                  <span className="font-mono text-primary">{currencyFormat(matchedReceipt.total_amount)}</span>
                </div>
              </div>

              <DialogFooter className="pt-2 flex sm:justify-between gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsReceiptLookupModalOpen(false)}
                  className="text-xs rounded-xl"
                >
                  Close
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setCompletedInvoice(matchedReceipt);
                    setIsReceiptLookupModalOpen(false);
                    setIsReceiptModalOpen(true);
                  }}
                  className="text-xs font-bold rounded-xl gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Receipt Voucher
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* On-Demand Receipt Printing Modal */}
      {completedInvoice && (
        <ReceiptModal
          invoice={completedInvoice}
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
        />
      )}
    </div>
  );
};
