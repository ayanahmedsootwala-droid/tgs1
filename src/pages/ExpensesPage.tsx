import React, { useState, useMemo } from 'react';
import { useSalon } from '@/contexts/SalonContext';
import { getLocalDateString } from '@/utils/dateUtils';
import type { ExpenseRecord } from '@/types/salon';
import {
  Receipt,
  Plus,
  Search,
  Calendar,
  Trash2,
  Edit2,
  Banknote,
  FileText,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const ExpensesPage: React.FC = () => {
  const {
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    currencyFormat,
    closingCountdown,
    autoCloseDayNow,
    dailyExpenseQuota,
    updateDailyExpenseQuota,
    remainingExpenseQuota,
    isQuotaExceeded,
    role,
    staffPermissions,
  } = useSalon();

  const isOwner = role === 'owner';
  const canRecordExpense = role === 'owner' || staffPermissions.can_record_expenses;

  const navigate = useNavigate();

  // Search & Filter State (Category and Online mode removed per user requirement)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDateFilter, setSelectedDateFilter] = useState<'all' | 'today' | 'this_month'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseRecord | null>(null);
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null);

  // Quota Edit Modal State for Owner
  const [isQuotaModalOpen, setIsQuotaModalOpen] = useState(false);
  const [newQuotaValue, setNewQuotaValue] = useState(dailyExpenseQuota.toString());

  // Form State (No Category, Cash only)
  const [formTitle, setFormTitle] = useState('');
  const [formAmount, setFormAmount] = useState<string>('');
  const [formDate, setFormDate] = useState<string>(() => getLocalDateString());
  const [formNotes, setFormNotes] = useState('');

  const todayStr = useMemo(() => getLocalDateString(), []);
  const currentMonthStr = useMemo(() => todayStr.slice(0, 7), [todayStr]);

  // Filtered Expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((item) => {
      const matchesSearch =
        !searchQuery.trim() ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      let matchesDate = true;
      const itemDate = item.expense_date || (item.created_at ? getLocalDateString(item.created_at) : '');
      if (selectedDateFilter === 'today') {
        matchesDate = itemDate === todayStr || Boolean(item.created_at && item.created_at.startsWith(todayStr));
      } else if (selectedDateFilter === 'this_month') {
        matchesDate = Boolean(itemDate?.startsWith(currentMonthStr)) || Boolean(item.created_at && item.created_at.startsWith(currentMonthStr));
      }

      return matchesSearch && matchesDate;
    });
  }, [expenses, searchQuery, selectedDateFilter, todayStr, currentMonthStr]);

  // Aggregate stats
  const totalExpenses = useMemo(() => {
    return expenses.reduce((acc, curr) => acc + curr.amount, 0);
  }, [expenses]);

  const todayExpensesTotal = useMemo(() => {
    return expenses
      .filter((e) => e.expense_date === todayStr || e.created_at?.startsWith(todayStr))
      .reduce((acc, curr) => acc + curr.amount, 0);
  }, [expenses, todayStr]);

  const thisMonthExpensesTotal = useMemo(() => {
    return expenses
      .filter((e) => e.expense_date?.startsWith(currentMonthStr) || e.created_at?.startsWith(currentMonthStr))
      .reduce((acc, curr) => acc + curr.amount, 0);
  }, [expenses, currentMonthStr]);

  const handleOpenAdd = () => {
    setEditingExpense(null);
    setFormTitle('');
    setFormAmount('');
    setFormDate(getLocalDateString());
    setFormNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ExpenseRecord) => {
    setEditingExpense(item);
    setFormTitle(item.title);
    setFormAmount(item.amount.toString());
    setFormDate(item.expense_date);
    setFormNotes(item.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      toast.error('Expense title is required');
      return;
    }

    const amt = parseFloat(formAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error('Please enter a valid expense amount in Rupees');
      return;
    }

    // Daily Quota Tracking & Exceeded Calculation
    const currentTodayExpenses = todayExpensesTotal - (editingExpense ? editingExpense.amount : 0);
    const remainingBefore = dailyExpenseQuota - currentTodayExpenses;
    const isExceeded = amt > remainingBefore;
    const excessAmt = isExceeded ? amt - Math.max(0, remainingBefore) : 0;

    if (editingExpense) {
      await updateExpense(editingExpense.id, {
        title: formTitle.trim(),
        category: 'Miscellaneous',
        amount: amt,
        payment_mode: 'Cash',
        expense_date: formDate,
        notes: formNotes.trim() || null,
        is_exceeded_expense: isExceeded,
        exceeded_amount: excessAmt,
      });
    } else {
      await addExpense({
        title: formTitle.trim(),
        category: 'Miscellaneous',
        amount: amt,
        payment_mode: 'Cash',
        expense_date: formDate,
        notes: formNotes.trim() || null,
        is_exceeded_expense: isExceeded,
        exceeded_amount: excessAmt,
      });
    }

    if (isExceeded) {
      toast.warning(
        `Daily Expense Quota exceeded by ${currencyFormat(excessAmt)}! Entry recorded and flagged as extra expense.`
      );
    }

    setIsModalOpen(false);
  };

  const handleDelete = async () => {
    if (deletingExpenseId) {
      await deleteExpense(deletingExpenseId);
      setDeletingExpenseId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Automated 11:59 PM Closing & Register Status Banner */}
      <div className="bg-gradient-to-r from-indigo-500/10 via-primary/10 to-indigo-500/5 border border-indigo-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/20 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-foreground">Automated Daily Register Closing</h2>
              <Badge className="bg-indigo-600 text-white font-mono text-[10px] px-2 py-0">
                11:59 PM Daily
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Countdown: <strong className="text-foreground">{closingCountdown}</strong> • Auto-balances sales against counter cash expenses.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/day-closing')}
            className="text-xs font-semibold rounded-xl gap-1.5 h-9"
          >
            <span>Day Closing Ledger</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="sm"
            onClick={handleOpenAdd}
            className="text-xs font-bold rounded-xl gap-1.5 h-9 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Expense</span>
          </Button>
        </div>
      </div>

      {/* Daily Expense Quota & Financial Tracking Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Daily Expense Quota & Remaining Balance */}
        <Card className={`rounded-2xl border shadow-sm bg-card ${isQuotaExceeded ? 'border-destructive/40 bg-destructive/5' : 'border-border/80'}`}>
          <CardContent className="p-4 flex flex-col justify-between h-full space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Daily Expense Quota</span>
              {isOwner && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setNewQuotaValue(dailyExpenseQuota.toString());
                    setIsQuotaModalOpen(true);
                  }}
                  className="h-6 px-1.5 text-[10px] font-semibold text-primary hover:bg-primary/10 rounded-md"
                >
                  <Edit2 className="w-2.5 h-2.5 mr-1" />
                  Set Limit
                </Button>
              )}
            </div>
            <div>
              <div className="flex items-baseline justify-between">
                <h3 className="text-xl sm:text-2xl font-black text-foreground font-mono">
                  {currencyFormat(dailyExpenseQuota)}
                </h3>
                <span className={`text-xs font-mono font-bold ${isQuotaExceeded ? 'text-destructive' : 'text-emerald-600'}`}>
                  {isQuotaExceeded
                    ? `-${currencyFormat(todayExpensesTotal - dailyExpenseQuota)} Exceeded`
                    : `${currencyFormat(remainingExpenseQuota)} Left`}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {isQuotaExceeded ? '⚠️ Today\'s budget limit exceeded' : 'Remaining balance for today'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Today's Cash Deductions */}
        <Card className="rounded-2xl border-border/80 shadow-sm bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Today&apos;s Cash Expenses</p>
              <h3 className="text-xl sm:text-2xl font-black text-foreground font-mono mt-1">
                {currencyFormat(todayExpensesTotal)}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Deducted from drawer today</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Banknote className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Card 3: This Month's Expenses */}
        <Card className="rounded-2xl border-border/80 shadow-sm bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">This Month&apos;s Expenses</p>
              <h3 className="text-xl sm:text-2xl font-black text-foreground font-mono mt-1">
                {currencyFormat(thisMonthExpensesTotal)}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Current month total</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Card 4: All-Time Recorded */}
        <Card className="rounded-2xl border-border/80 shadow-sm bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">All-Time Recorded</p>
              <h3 className="text-xl sm:text-2xl font-black text-foreground font-mono mt-1">
                {currencyFormat(totalExpenses)}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">{expenses.length} entries on record</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expense Entries Table with Date Filtering & Search */}
      <Card className="rounded-2xl border-border/80 shadow-sm bg-card">
        <CardHeader className="p-4 pb-3 border-b border-border/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold">Counter Expense Logs</CardTitle>
            <CardDescription className="text-xs">
              All daily operational outlays paid from the salon cash drawer
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search descriptions or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9 text-xs rounded-xl"
              />
            </div>

            <div className="flex items-center rounded-xl border border-border/70 p-0.5 bg-muted/30">
              <button
                type="button"
                onClick={() => setSelectedDateFilter('all')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  selectedDateFilter === 'all' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setSelectedDateFilter('today')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  selectedDateFilter === 'today' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setSelectedDateFilter('this_month')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  selectedDateFilter === 'this_month' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                }`}
              >
                This Month
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="w-full max-w-full overflow-x-auto bg-card rounded-b-2xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/40 text-muted-foreground border-b border-border/60 font-semibold">
                <tr>
                  <th className="py-3 px-4 whitespace-nowrap">Date</th>
                  <th className="py-3 px-4 whitespace-nowrap">Description / Purpose</th>
                  <th className="py-3 px-4 whitespace-nowrap">Payment Mode</th>
                  <th className="py-3 px-4 whitespace-nowrap">Additional Notes</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">Amount in PKR</th>
                  <th className="py-3 px-4 text-center whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted-foreground text-xs">
                      <Receipt className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      No expenses found matching the selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4 font-mono text-muted-foreground whitespace-nowrap">
                        {item.expense_date}
                      </td>
                      <td className="py-3 px-4 font-bold text-foreground whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span>{item.title}</span>
                          {item.is_exceeded_expense && (
                            <Badge variant="destructive" className="text-[9px] font-bold px-1.5 py-0">
                              ⚠️ Extra / Quota Exceeded (+{currencyFormat(item.exceeded_amount || 0)})
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <Badge variant="outline" className="font-mono text-[10px] font-bold">
                          Cash Drawer
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground whitespace-nowrap max-w-[200px] truncate">
                        {item.notes || '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-foreground text-xs whitespace-nowrap">
                        {currencyFormat(item.amount)}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          {role === 'owner' ? (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenEdit(item)}
                                className="h-7 w-7 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg"
                                title="Owner Edit Expense"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeletingExpenseId(item.id)}
                                className="h-7 w-7 text-muted-foreground hover:text-destructive rounded-lg"
                                title="Owner Delete Expense"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </>
                          ) : (
                            <span className="text-[10px] text-muted-foreground font-medium px-2 py-0.5 rounded bg-muted/40">
                              Locked (Owner Only)
                            </span>
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

      {/* Add / Edit Expense Modal (Streamlined: No Category, Cash only) */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Receipt className="w-4 h-4 text-primary" />
              {editingExpense ? 'Edit Counter Expense' : 'Log Counter Cash Expense'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Quickly record operational expenses paid directly from the salon counter drawer.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-3.5 py-1">
            {/* Daily Expense Quota & Balance Left Indicator */}
            <div className="p-3 rounded-xl border border-border/60 bg-muted/20 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Daily Expense Limit:</span>
                <span className="font-mono font-bold text-foreground">{currencyFormat(dailyExpenseQuota)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Already Spent Today:</span>
                <span className="font-mono font-bold text-amber-600">
                  {currencyFormat(todayExpensesTotal - (editingExpense ? editingExpense.amount : 0))}
                </span>
              </div>
              <div className="flex justify-between border-t border-border/40 pt-1">
                <span className="text-muted-foreground font-semibold">Today&apos;s Balance Left:</span>
                <span className={`font-mono font-bold ${dailyExpenseQuota - (todayExpensesTotal - (editingExpense ? editingExpense.amount : 0)) <= 0 ? 'text-destructive' : 'text-emerald-600'}`}>
                  {currencyFormat(Math.max(0, dailyExpenseQuota - (todayExpensesTotal - (editingExpense ? editingExpense.amount : 0))))}
                </span>
              </div>
            </div>

            {/* Quota Exceeded Live Warning Banner */}
            {parseFloat(formAmount) > (dailyExpenseQuota - (todayExpensesTotal - (editingExpense ? editingExpense.amount : 0))) && (
              <div className="p-2.5 rounded-xl border border-destructive/40 bg-destructive/10 text-destructive text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <span>⚠️ Exceeds Today&apos;s Daily Quota</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  This expense of {currencyFormat(parseFloat(formAmount) || 0)} exceeds the remaining daily balance by{' '}
                  <strong>
                    {currencyFormat((parseFloat(formAmount) || 0) - Math.max(0, dailyExpenseQuota - (todayExpensesTotal - (editingExpense ? editingExpense.amount : 0))))}
                  </strong>
                  . It will be recorded and flagged as an Extra / Exceeded Expense.
                </p>
              </div>
            )}

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Expense Title / Description *</Label>
              <Input
                placeholder="e.g. Refreshments, salon blade box, water dispenser..."
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="text-xs rounded-xl"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Amount in PKR (Rs.) *</Label>
                <Input
                  type="number"
                  placeholder="e.g. 750"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  className="text-xs font-mono font-bold rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Expense Date *</Label>
                <Input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="text-xs font-mono rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Additional Notes (Optional)</Label>
              <Input
                placeholder="e.g. Paid to courier boy / vendor receipt #..."
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                className="text-xs rounded-xl"
              />
            </div>

            <div className="p-3 bg-muted/40 rounded-xl border border-border/60 text-xs text-muted-foreground flex items-center justify-between">
              <span>Payment Mode:</span>
              <Badge variant="outline" className="font-mono text-xs font-bold">
                Cash Drawer
              </Badge>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="text-xs rounded-xl"
              >
                Cancel
              </Button>
              <Button type="submit" className="text-xs font-bold rounded-xl">
                {editingExpense ? 'Save Changes' : 'Log Cash Expense'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={!!deletingExpenseId} onOpenChange={() => setDeletingExpenseId(null)}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-md rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold">Delete Expense Record?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              This will remove the expense entry and adjust the net closing ledger balance accordingly.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl font-bold">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Owner Daily Expense Quota Limit Dialog */}
      {isQuotaModalOpen && (
        <Dialog open={isQuotaModalOpen} onOpenChange={setIsQuotaModalOpen}>
          <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold">
                <Banknote className="w-4 h-4 text-primary" />
                Owner Daily Expense Limit &amp; Quota
              </DialogTitle>
              <DialogDescription className="text-xs">
                Set the maximum daily cash budget allowance for counter expenses.
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const qVal = parseFloat(newQuotaValue);
                if (isNaN(qVal) || qVal < 0) {
                  toast.error('Please enter a valid quota amount');
                  return;
                }
                await updateDailyExpenseQuota(qVal);
                setIsQuotaModalOpen(false);
                toast.success(`Daily expense quota updated to ${currencyFormat(qVal)}`);
              }}
              className="space-y-3.5 py-1 text-xs"
            >
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Daily Expense Quota (PKR Rs.) *</Label>
                <Input
                  type="number"
                  min={0}
                  value={newQuotaValue}
                  onChange={(e) => setNewQuotaValue(e.target.value)}
                  className="text-xs font-mono font-bold rounded-xl"
                  required
                />
                <p className="text-[10px] text-muted-foreground">
                  Any counter expenses logged after this limit is exhausted will be recorded and flagged as Extra Exceeded Expenses.
                </p>
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsQuotaModalOpen(false)}
                  className="text-xs rounded-xl"
                >
                  Cancel
                </Button>
                <Button type="submit" className="text-xs font-bold rounded-xl">
                  Save Daily Quota
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
