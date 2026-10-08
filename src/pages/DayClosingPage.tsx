import React, { useState, useMemo } from 'react';
import { useSalon } from '@/contexts/SalonContext';
import { getLocalDateString } from '@/utils/dateUtils';
import {
  CircleDollarSign,
  Lock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Printer,
  History,
  Banknote,
  Smartphone,
  Receipt,
  FileCheck2,
  Clock,
  MessageCircle,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import type { DayClosingRecord } from '@/types/salon';
import { toast } from 'sonner';

export const DayClosingPage: React.FC = () => {
  const {
    invoices,
    expenses,
    cashRegisters,
    closeDayRegister,
    currencyFormat,
    settings,
    currentUser,
    role,
    closingCountdown,
    autoCloseDayNow,
    sendWhatsAppMessage,
    generateWhatsAppClosingReport,
  } = useSalon();

  const isOwner = role === 'owner';

  const todayStr = useMemo(() => getLocalDateString(), []);

  // Form Inputs for Day Closing (Default opening cash in PKR: Rs. 5,000)
  const [openingCash, setOpeningCash] = useState<number>(5000);
  const [actualCountedCash, setActualCountedCash] = useState<number>(5000);
  const [closingNotes, setClosingNotes] = useState('');
  const [closedByName, setClosedByName] = useState(currentUser?.name || 'Floor Manager');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pakistani Currency Note Denomination Counter
  const [notes5000, setNotes5000] = useState<number>(0);
  const [notes1000, setNotes1000] = useState<number>(0);
  const [notes500, setNotes500] = useState<number>(0);
  const [notes100, setNotes100] = useState<number>(0);
  const [notes50, setNotes50] = useState<number>(0);
  const [coinsAndTens, setCoinsAndTens] = useState<number>(0);
  const [isDenominationModalOpen, setIsDenominationModalOpen] = useState(false);

  // Selected historic register for printing
  const [selectedRegisterForPrint, setSelectedRegisterForPrint] = useState<DayClosingRecord | null>(null);

  // Today's completed Invoices
  const todayInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const invDate = inv.created_at ? getLocalDateString(inv.created_at) : '';
      return (invDate === todayStr || inv.created_at.startsWith(todayStr)) && inv.status === 'Completed';
    });
  }, [invoices, todayStr]);

  // Today's Sales breakdown (Cash, Online Transfer, and Total)
  const salesBreakdown = useMemo(() => {
    let cash = 0;
    let online = 0;

    for (const inv of todayInvoices) {
      if (inv.payment_method === 'Cash') {
        cash += inv.total_amount;
      } else if (inv.payment_method === 'Online Transfer') {
        online += inv.total_amount;
      } else if (inv.payment_method === 'Split' && inv.split_details) {
        for (const s of inv.split_details) {
          if (s.method === 'Cash') cash += s.amount;
          else if (s.method === 'Online Transfer') online += s.amount;
        }
      }
    }

    const total = cash + online;
    return { cash, online, total };
  }, [todayInvoices]);

  // Today's cash expenses paid out of drawer
  const todayCashExpenses = useMemo(() => {
    return expenses
      .filter((exp) => {
        const expDate = exp.expense_date || (exp.created_at ? getLocalDateString(exp.created_at) : '');
        return (expDate === todayStr || (exp.created_at && exp.created_at.startsWith(todayStr))) && exp.payment_mode === 'Cash';
      })
      .reduce((sum, exp) => sum + exp.amount, 0);
  }, [expenses, todayStr]);

  // Expected Cash in Drawer at close: Opening Cash + Cash Sales - Cash Expenses
  const expectedDrawerCash = openingCash + salesBreakdown.cash - todayCashExpenses;

  // Discrepancy / Variance
  const cashDiscrepancy = actualCountedCash - expectedDrawerCash;

  // Check if today already has a closed register
  const todayClosedRecord = useMemo(() => {
    return cashRegisters.find((r) => r.closing_date === todayStr);
  }, [cashRegisters, todayStr]);

  const handleCloseRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    await closeDayRegister(
      Number(openingCash),
      Number(actualCountedCash),
      closingNotes.trim() || 'Manual shift register close',
      closedByName.trim() || currentUser?.name || 'Manager'
    );

    setIsSubmitting(false);
  };

  const handleTriggerAutoCloseNow = async () => {
    setIsSubmitting(true);
    await autoCloseDayNow();
    setIsSubmitting(false);
  };

  const handleSendWhatsAppSummary = () => {
    const report = generateWhatsAppClosingReport();
    const phone = settings.owner_whatsapp || '03001234567';
    sendWhatsAppMessage(phone, report);
    toast.success('Opening WhatsApp with day closing report summary...');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Day Closing & Register Reconciliation</h1>
            <Badge variant="outline" className="border-primary/40 text-primary">
              PKR Cash Audit
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Audit today&apos;s physical drawer cash against recorded POS receipts and petty cash expenses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSendWhatsAppSummary}
            className="text-xs font-semibold rounded-xl border-emerald-500/40 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-300 gap-1.5 h-9"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Send Report via WhatsApp</span>
          </Button>
          <Badge variant="secondary" className="text-xs px-2.5 py-1.5 flex items-center gap-1.5 font-mono rounded-xl">
            <Calendar className="w-3.5 h-3.5" />
            {todayStr}
          </Badge>
        </div>
      </div>

      {/* Automated 11:59 PM Closing Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-primary/10 to-indigo-500/5 border border-indigo-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/20 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground text-sm">Automated 11:59 PM Daily Closing Engine</span>
              <Badge className="bg-indigo-600 text-white text-[10px] px-2 py-0 font-mono">
                Active
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Timer countdown: <strong className="text-foreground">{closingCountdown}</strong>. Automatically archives sales and cash balances daily at 11:59 PM.
            </p>
          </div>
        </div>

        {isOwner && !todayClosedRecord && (
          <Button
            size="sm"
            onClick={handleTriggerAutoCloseNow}
            disabled={isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl gap-1.5 h-9 shrink-0 shadow-sm"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Closing...' : 'Close Register Now (Early Close)'}</span>
          </Button>
        )}
      </div>

      {/* Today's Closing Status Alert */}
      {todayClosedRecord ? (
        <Card className="rounded-2xl border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-sm">
          <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <div className="font-bold text-emerald-900 dark:text-emerald-100 text-sm">
                  Register for Today ({todayStr}) is Officially Closed &amp; Locked
                </div>
                <div className="text-xs text-emerald-700 dark:text-emerald-300">
                  Closed by <span className="font-bold">{todayClosedRecord.closed_by}</span> • Counted Cash: {currencyFormat(todayClosedRecord.actual_cash_counted)} • Variance: {currencyFormat(todayClosedRecord.variance)}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedRegisterForPrint(todayClosedRecord)}
              className="gap-1.5 text-xs rounded-xl border-emerald-300 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-700 dark:text-emerald-200"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Closing Voucher
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-2xl border-amber-500/30 bg-amber-50/40 dark:bg-amber-950/20 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="text-xs text-amber-800 dark:text-amber-200">
              <span className="font-bold">Register is OPEN for transactions.</span> Daily transactions will automatically be locked at 11:59 PM or when you perform shift close below.
            </div>
          </CardContent>
        </Card>
      )}

      {/* Shift Revenue Breakdown KPI Cards (Cash, Online Transfer, Total) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="rounded-2xl border-border/80 shadow-sm p-4 bg-card">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cash Sales Today</div>
          <div className="text-xl sm:text-2xl font-black text-foreground font-mono mt-1">
            {currencyFormat(salesBreakdown.cash)}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Physical cash collected at counter</p>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-sm p-4 bg-card">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Online / Bank Transfers</div>
          <div className="text-xl sm:text-2xl font-black text-foreground font-mono mt-1">
            {currencyFormat(salesBreakdown.online)}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Direct bank, Easypaisa, Raast, JazzCash</p>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-sm p-4 bg-card">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Day Revenue</div>
          <div className="text-xl sm:text-2xl font-black text-primary font-mono mt-1">
            {currencyFormat(salesBreakdown.total)}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">{todayInvoices.length} invoices completed</p>
        </Card>
      </div>

      {/* Cash Drawer Reconciliation Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-4">
          <Card className="rounded-2xl border-border/80 shadow-sm bg-card">
            <CardHeader className="p-4 pb-3 border-b border-border/60">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <CircleDollarSign className="w-5 h-5 text-primary" />
                Physical Drawer Reconciliation
              </CardTitle>
              <CardDescription className="text-xs">
                Compare actual physical banknotes in counter drawer against calculated net cash.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
              <form onSubmit={handleCloseRegister} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Opening Float Cash: Owner only can edit; Staff/Management have fixed standard */}
                  {isOwner ? (
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Opening Float Cash (Rs.) *</Label>
                      <Input
                        type="number"
                        min="0"
                        value={openingCash}
                        onChange={(e) => setOpeningCash(Number(e.target.value))}
                        className="text-xs font-mono font-bold rounded-xl"
                        required
                      />
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Opening Float Standard</Label>
                      <div className="h-9 px-3 flex items-center justify-between font-mono font-bold text-xs bg-muted/30 border border-border/60 rounded-xl text-muted-foreground">
                        <span>{currencyFormat(openingCash)}</span>
                        <Badge variant="outline" className="text-[9px]">Standard Float</Badge>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold">Counted Cash in Drawer (Rs.) *</Label>
                      <button
                        type="button"
                        onClick={() => setIsDenominationModalOpen(true)}
                        className="text-[11px] text-primary hover:underline font-semibold"
                      >
                        Calculator
                      </button>
                    </div>
                    <Input
                      type="number"
                      min="0"
                      value={actualCountedCash}
                      onChange={(e) => setActualCountedCash(Number(e.target.value))}
                      className="text-xs font-mono font-bold rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div className="p-3.5 bg-muted/40 rounded-2xl border border-border/60 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Opening Float:</span>
                    <span className="font-mono font-bold">{currencyFormat(openingCash)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">+ Cash Sales Collected:</span>
                    <span className="font-mono font-bold text-emerald-600">+{currencyFormat(salesBreakdown.cash)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">- Counter Cash Expenses:</span>
                    <span className="font-mono font-bold text-destructive">-{currencyFormat(todayCashExpenses)}</span>
                  </div>
                  <div className="border-t border-border/60 pt-2 flex justify-between font-bold text-sm">
                    <span>Expected Cash in Drawer:</span>
                    <span className="font-mono text-primary">{currencyFormat(expectedDrawerCash)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm">
                    <span>Physical Cash Counted:</span>
                    <span className="font-mono">{currencyFormat(actualCountedCash)}</span>
                  </div>
                  <div className="border-t border-border/60 pt-2 flex justify-between font-bold text-sm">
                    <span>Variance / Discrepancy:</span>
                    <span
                      className={`font-mono ${
                        cashDiscrepancy === 0
                          ? 'text-emerald-600'
                          : cashDiscrepancy > 0
                          ? 'text-blue-600'
                          : 'text-destructive'
                      }`}
                    >
                      {cashDiscrepancy > 0 ? `+${currencyFormat(cashDiscrepancy)} (Surplus)` : cashDiscrepancy < 0 ? `${currencyFormat(cashDiscrepancy)} (Shortage)` : 'Exact Rs. 0 Balanced'}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Closing Remarks &amp; Discrepancy Explanation</Label>
                  <Textarea
                    placeholder="e.g. Counter balanced, minor Rs. 50 difference due to loose change..."
                    value={closingNotes}
                    onChange={(e) => setClosingNotes(e.target.value)}
                    rows={3}
                    className="text-xs rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Closed By Staff Name</Label>
                  <Input
                    value={closedByName}
                    onChange={(e) => setClosedByName(e.target.value)}
                    className="text-xs rounded-xl"
                    required
                  />
                </div>

                {isOwner ? (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full text-xs font-bold rounded-xl h-10 shadow-sm"
                  >
                    <Lock className="w-3.5 h-3.5 mr-2" />
                    {isSubmitting ? 'Locking Register...' : 'Save & Close Day Register'}
                  </Button>
                ) : (
                  <div className="p-3.5 rounded-2xl border border-indigo-500/30 bg-indigo-50/40 dark:bg-indigo-950/20 text-center space-y-1">
                    <div className="font-bold text-xs text-foreground flex items-center justify-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>Automated 11:59 PM Closing Active</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Manual day closing and register locking is reserved for Owner. System will automatically archive and balance the day at 11:59 PM.
                    </p>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Historic Closings History */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="rounded-2xl border-border/80 shadow-sm bg-card">
            <CardHeader className="p-4 pb-3 border-b border-border/60">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <History className="w-4 h-4 text-primary" />
                Previous Day Closing Records
              </CardTitle>
              <CardDescription className="text-xs">
                Historical archived registers and audit logs
              </CardDescription>
            </CardHeader>

            <CardContent className="p-3 space-y-2 max-h-[500px] overflow-y-auto scrollbar-thin">
              {cashRegisters.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-xs">
                  <FileCheck2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  No day closing records archived yet.
                </div>
              ) : (
                cashRegisters.map((reg) => (
                  <div
                    key={reg.id}
                    className="p-3 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground font-mono">{reg.closing_date}</span>
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {reg.closed_by}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground pt-1">
                      <div>
                        <span>Total Revenue: </span>
                        <strong className="text-foreground font-mono">{currencyFormat(reg.total_cash_sales + reg.total_online_sales)}</strong>
                      </div>
                      <div>
                        <span>Expenses: </span>
                        <strong className="text-foreground font-mono">{currencyFormat(reg.total_cash_expenses)}</strong>
                      </div>
                      <div>
                        <span>Counted Cash: </span>
                        <strong className="text-foreground font-mono">{currencyFormat(reg.actual_cash_counted)}</strong>
                      </div>
                      <div>
                        <span>Variance: </span>
                        <strong className={`font-mono font-bold ${reg.variance === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {currencyFormat(reg.variance)}
                        </strong>
                      </div>
                    </div>

                    <div className="pt-1.5 border-t border-border/40 flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedRegisterForPrint(reg)}
                        className="h-6 text-[10px] gap-1 px-2 text-primary rounded-lg"
                      >
                        <Printer className="w-3 h-3" />
                        Print Voucher
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Pakistani Currency Denomination Calculator Modal */}
      <Dialog open={isDenominationModalOpen} onOpenChange={setIsDenominationModalOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Banknote className="w-5 h-5 text-emerald-600" />
              Pakistani Rupee (PKR) Note Counter
            </DialogTitle>
            <DialogDescription className="text-xs">
              Count each denomination of currency notes physically present in the cash drawer.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-1 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded-xl border bg-muted/20">
                <Label className="text-[11px] font-bold">Rs. 5,000 Notes</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    type="number"
                    min="0"
                    value={notes5000 || ''}
                    onChange={(e) => setNotes5000(Number(e.target.value))}
                    placeholder="Count"
                    className="h-7 text-xs rounded-lg"
                  />
                  <span className="font-mono text-muted-foreground w-16 text-right">
                    {currencyFormat((notes5000 || 0) * 5000)}
                  </span>
                </div>
              </div>

              <div className="p-2 rounded-xl border bg-muted/20">
                <Label className="text-[11px] font-bold">Rs. 1,000 Notes</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    type="number"
                    min="0"
                    value={notes1000 || ''}
                    onChange={(e) => setNotes1000(Number(e.target.value))}
                    placeholder="Count"
                    className="h-7 text-xs rounded-lg"
                  />
                  <span className="font-mono text-muted-foreground w-16 text-right">
                    {currencyFormat((notes1000 || 0) * 1000)}
                  </span>
                </div>
              </div>

              <div className="p-2 rounded-xl border bg-muted/20">
                <Label className="text-[11px] font-bold">Rs. 500 Notes</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    type="number"
                    min="0"
                    value={notes500 || ''}
                    onChange={(e) => setNotes500(Number(e.target.value))}
                    placeholder="Count"
                    className="h-7 text-xs rounded-lg"
                  />
                  <span className="font-mono text-muted-foreground w-16 text-right">
                    {currencyFormat((notes500 || 0) * 500)}
                  </span>
                </div>
              </div>

              <div className="p-2 rounded-xl border bg-muted/20">
                <Label className="text-[11px] font-bold">Rs. 100 Notes</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    type="number"
                    min="0"
                    value={notes100 || ''}
                    onChange={(e) => setNotes100(Number(e.target.value))}
                    placeholder="Count"
                    className="h-7 text-xs rounded-lg"
                  />
                  <span className="font-mono text-muted-foreground w-16 text-right">
                    {currencyFormat((notes100 || 0) * 100)}
                  </span>
                </div>
              </div>

              <div className="p-2 rounded-xl border bg-muted/20">
                <Label className="text-[11px] font-bold">Rs. 50 Notes</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    type="number"
                    min="0"
                    value={notes50 || ''}
                    onChange={(e) => setNotes50(Number(e.target.value))}
                    placeholder="Count"
                    className="h-7 text-xs rounded-lg"
                  />
                  <span className="font-mono text-muted-foreground w-16 text-right">
                    {currencyFormat((notes50 || 0) * 50)}
                  </span>
                </div>
              </div>

              <div className="p-2 rounded-xl border bg-muted/20">
                <Label className="text-[11px] font-bold">Coins &amp; Tens (Rs.)</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    type="number"
                    min="0"
                    value={coinsAndTens || ''}
                    onChange={(e) => setCoinsAndTens(Number(e.target.value))}
                    placeholder="Amount"
                    className="h-7 text-xs rounded-lg"
                  />
                  <span className="font-mono text-muted-foreground w-16 text-right">
                    {currencyFormat(coinsAndTens || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Total Calculated from Notes */}
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-between text-xs">
              <span className="font-bold text-foreground">Total Counted Value:</span>
              <span className="text-base font-black text-primary font-mono">
                {currencyFormat(
                  (notes5000 || 0) * 5000 +
                    (notes1000 || 0) * 1000 +
                    (notes500 || 0) * 500 +
                    (notes100 || 0) * 100 +
                    (notes50 || 0) * 50 +
                    (coinsAndTens || 0)
                )}
              </span>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDenominationModalOpen(false)}
              className="text-xs rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                const total =
                  (notes5000 || 0) * 5000 +
                  (notes1000 || 0) * 1000 +
                  (notes500 || 0) * 500 +
                  (notes100 || 0) * 100 +
                  (notes50 || 0) * 50 +
                  (coinsAndTens || 0);
                setActualCountedCash(total);
                setIsDenominationModalOpen(false);
                toast.success(`Drawer counted cash set to ${currencyFormat(total)}`);
              }}
              className="text-xs font-bold rounded-xl"
            >
              Apply to Cash in Drawer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
