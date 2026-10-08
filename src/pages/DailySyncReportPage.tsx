import React, { useState, useMemo } from 'react';
import { useSalon } from '@/contexts/SalonContext';
import { maskClientPhone } from '@/utils/phoneMask';
import { getLocalDateString } from '@/utils/dateUtils';
import type { Invoice, InvoiceItem, ExpenseRecord, PaymentMethod } from '@/types/salon';
import {
  ArrowRightLeft,
  Calendar,
  CircleDollarSign,
  Receipt,
  Scissors,
  User,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Printer,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Edit2,
  Save,
  AlertTriangle,
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
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export const DailySyncReportPage: React.FC = () => {
  const { invoices, expenses, currencyFormat, settings, role, staff, updateInvoice, updateExpense } = useSalon();

  const [selectedDate, setSelectedDate] = useState<string>(() => getLocalDateString());
  const [salesSearch, setSalesSearch] = useState('');
  const [expenseSearch, setExpenseSearch] = useState('');
  const [selectedInvoiceForReceipt, setSelectedInvoiceForReceipt] = useState<Invoice | null>(null);

  // Owner Transaction Edit State
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [editInvClientName, setEditInvClientName] = useState('');
  const [editInvClientPhone, setEditInvClientPhone] = useState('');
  const [editInvTotalAmount, setEditInvTotalAmount] = useState<number>(0);
  const [editInvDiscountAmount, setEditInvDiscountAmount] = useState<number>(0);
  const [editInvPaymentMethod, setEditInvPaymentMethod] = useState<PaymentMethod>('Cash');
  const [editInvNotes, setEditInvNotes] = useState('');
  const [isSavingInv, setIsSavingInv] = useState(false);

  // Owner Expense Edit State
  const [editingExpense, setEditingExpense] = useState<ExpenseRecord | null>(null);
  const [editExpTitle, setEditExpTitle] = useState('');
  const [editExpAmount, setEditExpAmount] = useState<number>(0);
  const [editExpCategory, setEditExpCategory] = useState('');
  const [editExpPaymentMode, setEditExpPaymentMode] = useState<'Cash' | 'Online Transfer' | 'Bank Card'>('Cash');
  const [editExpDate, setEditExpDate] = useState('');
  const [editExpNotes, setEditExpNotes] = useState('');
  const [isSavingExp, setIsSavingExp] = useState(false);

  const handleOpenEditInvoice = (inv: Invoice) => {
    if (role !== 'owner') {
      toast.error('Only the Salon Owner can edit past transactions.');
      return;
    }
    setEditingInvoice(inv);
    setEditInvClientName(inv.client_name);
    setEditInvClientPhone(inv.client_phone);
    setEditInvTotalAmount(inv.total_amount);
    setEditInvDiscountAmount(inv.discount_amount || 0);
    setEditInvPaymentMethod(inv.payment_method);
    setEditInvNotes(inv.notes || '');
  };

  const handleSaveInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInvoice) return;
    if (role !== 'owner') {
      toast.error('Only the Salon Owner can edit past transactions.');
      return;
    }
    setIsSavingInv(true);
    try {
      await updateInvoice(editingInvoice.id, {
        client_name: editInvClientName.trim() || 'Walk-in Guest',
        client_phone: editInvClientPhone.trim() || 'N/A',
        total_amount: Number(editInvTotalAmount) || 0,
        discount_amount: Number(editInvDiscountAmount) || 0,
        payment_method: editInvPaymentMethod,
        notes: editInvNotes.trim() ? `${editInvNotes.trim()} [Owner Edited]` : null,
      });
      setEditingInvoice(null);
    } catch (err: any) {
      toast.error('Failed to update transaction');
    } finally {
      setIsSavingInv(false);
    }
  };

  const handleOpenEditExpense = (exp: ExpenseRecord) => {
    if (role !== 'owner') {
      toast.error('Only the Salon Owner can edit past expenses.');
      return;
    }
    setEditingExpense(exp);
    setEditExpTitle(exp.title);
    setEditExpAmount(exp.amount);
    setEditExpCategory(exp.category);
    setEditExpPaymentMode((exp.payment_mode as any) || 'Cash');
    setEditExpDate(exp.expense_date);
    setEditExpNotes(exp.notes || '');
  };

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense) return;
    if (role !== 'owner') {
      toast.error('Only the Salon Owner can edit past expenses.');
      return;
    }
    setIsSavingExp(true);
    try {
      await updateExpense(editingExpense.id, {
        title: editExpTitle.trim(),
        amount: Number(editExpAmount) || 0,
        category: editExpCategory.trim() || 'General',
        payment_mode: editExpPaymentMode,
        expense_date: editExpDate,
        notes: editExpNotes.trim() ? `${editExpNotes.trim()} [Owner Edited]` : null,
      });
      toast.success('Expense record updated successfully');
      setEditingExpense(null);
    } catch (err: any) {
      toast.error('Failed to update expense');
    } finally {
      setIsSavingExp(false);
    }
  };

  // Fallback resolver for barber name if item.staff_name was blank
  const getBarberName = (it: { staff_name?: string | null; staff_id?: string | null }) => {
    if (it.staff_name && it.staff_name.trim() && it.staff_name !== 'Unassigned') return it.staff_name;
    if (it.staff_id) {
      const found = staff.find((m) => m.id === it.staff_id);
      if (found) return found.name;
    }
    return staff[0]?.name || 'Senior Barber';
  };

  // Safe line item display helper
  const getDisplayItems = (inv: Invoice) => {
    if (inv.items && inv.items.length > 0) return inv.items;
    if (inv.notes && inv.notes.includes('Breakdown:')) {
      const parts = inv.notes.split('Breakdown:')[1].split('|')[0].trim();
      const splitted = parts.split('+').map((s: string) => s.trim());
      if (splitted.length > 0) {
        return splitted.map((str: string, idx: number) => {
          const namePart = str.split('(')[0]?.trim() || 'Service';
          const barberPart = str.includes('(') ? str.split('(')[1]?.split('-')[0]?.trim() : (staff[0]?.name || 'Senior Barber');
          return {
            id: `temp-${idx}`,
            invoice_id: inv.id,
            service_id: null,
            service_name: namePart,
            category: 'Grooming',
            price: Math.round(inv.total_amount / splitted.length),
            staff_id: null,
            staff_name: barberPart,
            commission_rate: 0,
            commission_amount: 0,
          };
        });
      }
    }
    return [{
      id: 'temp-0',
      invoice_id: inv.id,
      service_id: null,
      service_name: 'Haircut & Styling',
      category: 'Grooming',
      price: inv.total_amount,
      staff_id: null,
      staff_name: staff[0]?.name || 'Senior Barber',
      commission_rate: 0,
      commission_amount: 0,
    }];
  };

  // Selected date's invoices
  const dayInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const isCompleted = inv.status === 'Completed';
      if (!isCompleted) return false;
      const invDate = inv.created_at ? getLocalDateString(inv.created_at) : '';
      const matchDate = invDate === selectedDate || inv.created_at.startsWith(selectedDate);
      const q = salesSearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        inv.client_name.toLowerCase().includes(q) ||
        inv.client_phone.includes(q) ||
        inv.invoice_number.toLowerCase().includes(q) ||
        inv.items.some((it) => it.service_name.toLowerCase().includes(q) || it.staff_name?.toLowerCase().includes(q));

      return matchDate && matchSearch;
    });
  }, [invoices, selectedDate, salesSearch]);

  // Selected date's expenses
  const dayExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      const expDate = exp.expense_date || (exp.created_at ? getLocalDateString(exp.created_at) : '');
      const matchDate = expDate === selectedDate || (exp.created_at && exp.created_at.startsWith(selectedDate));
      const q = expenseSearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        exp.title.toLowerCase().includes(q) ||
        exp.category.toLowerCase().includes(q) ||
        (exp.vendor && exp.vendor.toLowerCase().includes(q));

      return matchDate && matchSearch;
    });
  }, [expenses, selectedDate, expenseSearch]);

  // Financial summary
  const totalSalesRevenue = useMemo(() => {
    return dayInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);
  }, [dayInvoices]);

  const totalSalesDiscounts = useMemo(() => {
    return dayInvoices.reduce(
      (sum, inv) => sum + (inv.discount_amount || 0) + (inv.loyalty_reward_discount || 0),
      0
    );
  }, [dayInvoices]);

  const totalDayExpenses = useMemo(() => {
    return dayExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  }, [dayExpenses]);

  const netDayProfit = totalSalesRevenue - totalDayExpenses;

  // Breakdown of sales by payment mode
  const salesByPayment = useMemo(() => {
    let cash = 0;
    let card = 0;
    let online = 0;

    for (const inv of dayInvoices) {
      if (inv.payment_method === 'Cash') cash += inv.total_amount;
      else if (inv.payment_method === 'Card') card += inv.total_amount;
      else if (inv.payment_method === 'Online Transfer') online += inv.total_amount;
      else if (inv.payment_method === 'Split' && inv.split_details) {
        for (const s of inv.split_details) {
          if (s.method === 'Cash') cash += s.amount;
          else if (s.method === 'Card') card += s.amount;
          else if (s.method === 'Online Transfer') online += s.amount;
        }
      }
    }
    return { cash, card, online };
  }, [dayInvoices]);

  const cashExpenses = useMemo(() => {
    return dayExpenses
      .filter((e) => e.payment_mode === 'Cash')
      .reduce((sum, e) => sum + e.amount, 0);
  }, [dayExpenses]);

  const netCashInDrawer = salesByPayment.cash - cashExpenses;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Daily Synchronized Sales & Expense Report</h1>
            <Badge variant="outline" className="border-primary/40 text-primary">
              Live Two-Way Audit
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Side-by-side synchronized evaluation of customer sales receipts and operating expenditures.
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 bg-card p-1.5 rounded border">
          <Calendar className="w-4 h-4 text-muted-foreground ml-1" />
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-36 h-8 text-xs font-semibold"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedDate(getLocalDateString())}
            className="text-xs h-8 px-2 font-medium"
          >
            Today ({getLocalDateString().slice(5)})
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="text-xs h-8 gap-1"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Report
          </Button>
        </div>
      </div>

      {/* Synchronized Financial Performance Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="border p-3.5 shadow-none">
          <div className="text-[11px] font-medium text-muted-foreground uppercase">Total Sales Revenue</div>
          <div className="text-xl font-bold text-emerald-600 mt-0.5">
            {currencyFormat(totalSalesRevenue)}
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">{dayInvoices.length} transactions cleared</p>
        </Card>

        <Card className="border p-3.5 shadow-none">
          <div className="text-[11px] font-medium text-muted-foreground uppercase">Discounts & Rewards</div>
          <div className="text-xl font-bold text-amber-600 mt-0.5">
            {currencyFormat(totalSalesDiscounts)}
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">Promo & loyalty deductions</p>
        </Card>

        <Card className="border p-3.5 shadow-none">
          <div className="text-[11px] font-medium text-muted-foreground uppercase">Operating Expenses</div>
          <div className="text-xl font-bold text-destructive mt-0.5">
            {currencyFormat(totalDayExpenses)}
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">{dayExpenses.length} expense items</p>
        </Card>

        <Card className="border p-3.5 shadow-none">
          <div className="text-[11px] font-medium text-muted-foreground uppercase">Net Daily Profit</div>
          <div className={`text-xl font-bold mt-0.5 ${netDayProfit >= 0 ? 'text-primary' : 'text-destructive'}`}>
            {currencyFormat(netDayProfit)}
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">Revenue minus Expenses</p>
        </Card>

        <Card className="border p-3.5 shadow-none col-span-2 md:col-span-1">
          <div className="text-[11px] font-medium text-muted-foreground uppercase">Net Cash in Drawer</div>
          <div className="text-xl font-bold text-foreground mt-0.5">
            {currencyFormat(netCashInDrawer)}
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Cash in: {currencyFormat(salesByPayment.cash)} | Out: {currencyFormat(cashExpenses)}
          </p>
        </Card>
      </div>

      {/* Side-by-Side Synchronized Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: SALES LOG (col-span-7) */}
        <div className="lg:col-span-7 space-y-3">
          <Card className="border shadow-none">
            <CardHeader className="p-3.5 pb-2.5 border-b flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  Sales History for {selectedDate}
                </CardTitle>
                <CardDescription className="text-xs">
                  Full details with customer name, number, services rendered, barber, and discounts.
                </CardDescription>
              </div>
              <Badge variant="secondary" className="font-mono text-xs">
                {dayInvoices.length} Bills
              </Badge>
            </CardHeader>

            {/* Search Filter for Sales */}
            <div className="p-2.5 border-b bg-muted/20">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Filter sales by customer name, phone, service, or barber..."
                  value={salesSearch}
                  onChange={(e) => setSalesSearch(e.target.value)}
                  className="pl-8 text-xs h-8 bg-background"
                />
              </div>
            </div>

            <CardContent className="p-0">
              <div className="w-full max-w-full overflow-x-auto bg-card max-h-[580px] overflow-y-auto">
                <table className="w-full text-left text-xs [&>div]:max-w-full">
                  <thead className="bg-muted/40 border-b text-muted-foreground sticky top-0 z-10 font-medium">
                    <tr>
                      <th className="py-2.5 px-3 whitespace-nowrap">Time & Bill #</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Customer & Phone</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Services & Barber</th>
                      <th className="py-2.5 px-3 whitespace-nowrap text-right">Discount</th>
                      <th className="py-2.5 px-3 whitespace-nowrap text-right">Net Amount</th>
                      <th className="py-2.5 px-3 whitespace-nowrap text-center">Payment</th>
                      <th className="py-2.5 px-3 whitespace-nowrap text-center">Voucher &amp; Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {dayInvoices.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-muted-foreground">
                          No sales transactions logged for {selectedDate}.
                        </td>
                      </tr>
                    ) : (
                      dayInvoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-muted/30">
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <div className="font-mono font-bold text-foreground">
                              {new Date(inv.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </div>
                            <div className="text-[10px] text-muted-foreground font-mono">
                              {inv.invoice_number}
                            </div>
                          </td>

                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <div className="font-semibold text-foreground">{inv.client_name}</div>
                            <div className="text-[10px] text-muted-foreground font-mono">
                              {role === 'owner' ? inv.client_phone : maskClientPhone(inv.client_phone, role)}
                            </div>
                          </td>

                          <td className="py-2.5 px-3 min-w-[220px]">
                            <div className="space-y-1">
                              {getDisplayItems(inv).map((it: any, idx: number) => (
                                <div key={idx} className="text-xs flex flex-wrap items-center gap-1.5 py-0.5">
                                  <span className="font-semibold text-foreground">{it.service_name}</span>
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                                    ✂️ {getBarberName(it)}
                                  </span>
                                  <span className="text-[10px] font-mono text-muted-foreground">
                                    • {currencyFormat(it.price)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </td>

                          <td className="py-2.5 px-3 whitespace-nowrap text-right">
                            {inv.discount_amount > 0 || (inv.loyalty_reward_discount && inv.loyalty_reward_discount > 0) ? (
                              <span className="text-amber-600 font-semibold">
                                -{currencyFormat((inv.discount_amount || 0) + (inv.loyalty_reward_discount || 0))}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>

                          <td className="py-2.5 px-3 whitespace-nowrap text-right font-bold text-foreground">
                            {currencyFormat(inv.total_amount)}
                          </td>

                          <td className="py-2.5 px-3 whitespace-nowrap text-center">
                            <Badge variant="outline" className="text-[10px] font-mono">
                              {inv.payment_method}
                            </Badge>
                          </td>

                          <td className="py-2.5 px-3 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedInvoiceForReceipt(inv)}
                                className="h-7 px-2 text-[11px] font-semibold gap-1 rounded-lg border-primary/30 text-primary hover:bg-primary/10"
                                title="View Thermal Receipt"
                              >
                                <Receipt className="w-3.5 h-3.5" />
                                <span>Receipt</span>
                              </Button>

                              {role === 'owner' && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleOpenEditInvoice(inv)}
                                  className="h-7 px-2 text-[11px] font-semibold gap-1 rounded-lg text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-amber-300/60"
                                  title="Owner Edit Transaction"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                  <span>Edit</span>
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: EXPENSES LOG (col-span-5) */}
        <div className="lg:col-span-5 space-y-3">
          <Card className="border shadow-none">
            <CardHeader className="p-3.5 pb-2.5 border-b flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-destructive" />
                  Expenses Log for {selectedDate}
                </CardTitle>
                <CardDescription className="text-xs">
                  Itemized vendor payouts, utility bills, and tea/refreshment expenses.
                </CardDescription>
              </div>
              <Badge variant="secondary" className="font-mono text-xs">
                {dayExpenses.length} Records
              </Badge>
            </CardHeader>

            {/* Search Filter for Expenses */}
            <div className="p-2.5 border-b bg-muted/20">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Filter expenses by title, category, or vendor..."
                  value={expenseSearch}
                  onChange={(e) => setExpenseSearch(e.target.value)}
                  className="pl-8 text-xs h-8 bg-background"
                />
              </div>
            </div>

            <CardContent className="p-0">
              <div className="w-full max-w-full overflow-x-auto bg-card max-h-[580px] overflow-y-auto">
                <table className="w-full text-left text-xs [&>div]:max-w-full">
                  <thead className="bg-muted/40 border-b text-muted-foreground sticky top-0 z-10 font-medium">
                    <tr>
                      <th className="py-2.5 px-3 whitespace-nowrap">Expense Item</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Category & Vendor</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Mode</th>
                      <th className="py-2.5 px-3 whitespace-nowrap text-right">Amount (Rs.)</th>
                      <th className="py-2.5 px-3 whitespace-nowrap text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {dayExpenses.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-muted-foreground">
                          No expenses recorded on {selectedDate}.
                        </td>
                      </tr>
                    ) : (
                      dayExpenses.map((exp) => (
                        <tr key={exp.id} className="hover:bg-muted/30">
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-foreground">{exp.title}</div>
                            {exp.notes && (
                              <div className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                                {exp.notes}
                              </div>
                            )}
                          </td>

                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <div className="font-medium text-foreground">{exp.category}</div>
                            <div className="text-[10px] text-muted-foreground">
                              {exp.vendor || 'Direct Store Purchase'}
                            </div>
                          </td>

                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <Badge
                              variant="outline"
                              className={`text-[9px] ${
                                exp.payment_mode === 'Cash'
                                  ? 'border-amber-500/40 text-amber-700 bg-amber-50/50'
                                  : 'text-muted-foreground'
                              }`}
                            >
                              {exp.payment_mode}
                            </Badge>
                          </td>

                          <td className="py-2.5 px-3 whitespace-nowrap text-right font-bold text-destructive">
                            {currencyFormat(exp.amount)}
                          </td>

                          <td className="py-2.5 px-3 whitespace-nowrap text-center">
                            {role === 'owner' ? (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleOpenEditExpense(exp)}
                                className="h-7 px-2 text-[11px] font-semibold gap-1 rounded-lg text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-amber-300/60"
                                title="Owner Edit Expense"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </Button>
                            ) : (
                              <span className="text-[10px] text-muted-foreground">-</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Accounting Receipt-Style Breakdown & On-Demand Voucher Modal */}
      {selectedInvoiceForReceipt && (
        <Dialog open={!!selectedInvoiceForReceipt} onOpenChange={(open) => !open && setSelectedInvoiceForReceipt(null)}>
          <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold">
                <Receipt className="w-4 h-4 text-primary" />
                Accounting Receipt & Service Breakdown
              </DialogTitle>
              <DialogDescription className="text-xs font-mono">
                Receipt Reference: #{selectedInvoiceForReceipt.invoice_number}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3.5 py-1 text-xs">
              <div className="p-3 rounded-xl border border-border/60 bg-muted/20 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date & Time:</span>
                  <span className="font-mono font-medium text-foreground">
                    {new Date(selectedInvoiceForReceipt.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer:</span>
                  <span className="font-bold text-foreground">
                    {selectedInvoiceForReceipt.client_name} ({role === 'owner' ? selectedInvoiceForReceipt.client_phone : maskClientPhone(selectedInvoiceForReceipt.client_phone, role)})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method:</span>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {selectedInvoiceForReceipt.payment_method}
                  </Badge>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="font-bold text-foreground block">Services & Barber Attribution:</span>
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {getDisplayItems(selectedInvoiceForReceipt).map((it: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-card border border-border/60">
                      <div>
                        <div className="font-semibold text-foreground">{it.service_name}</div>
                        <div className="text-[11px] text-primary font-bold flex items-center gap-1 mt-0.5">
                          <Scissors className="w-3 h-3" />
                          Barber: {getBarberName(it)}
                        </div>
                      </div>
                      <span className="font-mono font-bold text-foreground">
                        {currencyFormat(it.price)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl border border-border/60 bg-muted/30 space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gross Services Subtotal:</span>
                  <span className="font-mono font-semibold">{currencyFormat(selectedInvoiceForReceipt.subtotal)}</span>
                </div>
                {selectedInvoiceForReceipt.discount_amount > 0 && (
                  <div className="flex justify-between text-amber-600">
                    <span>Discount Deducted:</span>
                    <span className="font-mono font-semibold">-{currencyFormat(selectedInvoiceForReceipt.discount_amount)}</span>
                  </div>
                )}
                {role === 'owner' && selectedInvoiceForReceipt.loyalty_reward_discount && selectedInvoiceForReceipt.loyalty_reward_discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Loyalty Reward Deducted:</span>
                    <span className="font-mono font-semibold">-{currencyFormat(selectedInvoiceForReceipt.loyalty_reward_discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm text-foreground pt-1.5 border-t border-border/40">
                  <span>Net Total Settled:</span>
                  <span className="font-mono text-primary font-black">{currencyFormat(selectedInvoiceForReceipt.total_amount)}</span>
                </div>
              </div>

              <DialogFooter className="pt-2 flex sm:justify-between gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedInvoiceForReceipt(null)}
                  className="text-xs rounded-xl"
                >
                  Close
                </Button>
                <Button
                  type="button"
                  onClick={() => window.print()}
                  className="text-xs font-bold rounded-xl gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Accounting Receipt
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Owner-Only Edit Past Transaction Modal */}
      {editingInvoice && (
        <Dialog open={!!editingInvoice} onOpenChange={(open) => !open && setEditingInvoice(null)}>
          <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold text-amber-600">
                <Edit2 className="w-4 h-4" />
                Edit Transaction #{editingInvoice.invoice_number} (Owner Only)
              </DialogTitle>
              <DialogDescription className="text-xs">
                Modify transaction details, client identity, settled amounts, or payment mode.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveInvoice} className="space-y-3.5 py-1 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Client Name</Label>
                  <Input
                    value={editInvClientName}
                    onChange={(e) => setEditInvClientName(e.target.value)}
                    className="h-8 text-xs rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Client Phone</Label>
                  <Input
                    value={editInvClientPhone}
                    onChange={(e) => setEditInvClientPhone(e.target.value)}
                    className="h-8 text-xs rounded-xl font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Net Total (PKR) *</Label>
                  <Input
                    type="number"
                    min="0"
                    value={editInvTotalAmount}
                    onChange={(e) => setEditInvTotalAmount(Number(e.target.value) || 0)}
                    className="h-8 text-xs rounded-xl font-mono font-bold"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Discount (PKR)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={editInvDiscountAmount}
                    onChange={(e) => setEditInvDiscountAmount(Number(e.target.value) || 0)}
                    className="h-8 text-xs rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Payment Mode</Label>
                <select
                  value={editInvPaymentMethod}
                  onChange={(e) => setEditInvPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full h-8 px-2.5 text-xs rounded-xl border border-border bg-background"
                >
                  <option value="Cash">Cash</option>
                  <option value="Online Transfer">Online Transfer (JazzCash / EasyPaisa / Bank)</option>
                  <option value="Card">Card</option>
                  <option value="Split">Split</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Audit Notes / Reason</Label>
                <Textarea
                  value={editInvNotes}
                  onChange={(e) => setEditInvNotes(e.target.value)}
                  placeholder="e.g. Corrected cash amount entered mistakenly by cashier"
                  rows={2}
                  className="text-xs rounded-xl"
                />
              </div>

              <DialogFooter className="gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingInvoice(null)}
                  className="text-xs rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSavingInv}
                  className="text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-700 text-white gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isSavingInv ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Owner-Only Edit Past Expense Modal */}
      {editingExpense && (
        <Dialog open={!!editingExpense} onOpenChange={(open) => !open && setEditingExpense(null)}>
          <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold text-amber-600">
                <Edit2 className="w-4 h-4" />
                Edit Past Expense (Owner Only)
              </DialogTitle>
              <DialogDescription className="text-xs">
                Adjust expense amount, category, or payment source.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveExpense} className="space-y-3.5 py-1 text-xs">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Expense Title / Description *</Label>
                <Input
                  value={editExpTitle}
                  onChange={(e) => setEditExpTitle(e.target.value)}
                  className="h-8 text-xs rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Amount (PKR) *</Label>
                  <Input
                    type="number"
                    min="1"
                    value={editExpAmount}
                    onChange={(e) => setEditExpAmount(Number(e.target.value) || 0)}
                    className="h-8 text-xs rounded-xl font-mono font-bold"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Date</Label>
                  <Input
                    type="date"
                    value={editExpDate}
                    onChange={(e) => setEditExpDate(e.target.value)}
                    className="h-8 text-xs rounded-xl font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Category</Label>
                  <Input
                    value={editExpCategory}
                    onChange={(e) => setEditExpCategory(e.target.value)}
                    className="h-8 text-xs rounded-xl"
                    placeholder="e.g. Tea/Refreshment, Fuel"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Payment Source</Label>
                  <select
                    value={editExpPaymentMode}
                    onChange={(e) => setEditExpPaymentMode(e.target.value as any)}
                    className="w-full h-8 px-2.5 text-xs rounded-xl border border-border bg-background"
                  >
                    <option value="Cash">Cash Drawer</option>
                    <option value="Online Transfer">Online Transfer / JazzCash / EasyPaisa / Bank</option>
                    <option value="Bank Card">Bank Card</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Notes / Reason</Label>
                <Textarea
                  value={editExpNotes}
                  onChange={(e) => setEditExpNotes(e.target.value)}
                  placeholder="e.g. Corrected fuel invoice bill"
                  rows={2}
                  className="text-xs rounded-xl"
                />
              </div>

              <DialogFooter className="gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingExpense(null)}
                  className="text-xs rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSavingExp}
                  className="text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-700 text-white gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isSavingExp ? 'Saving...' : 'Save Expense'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
