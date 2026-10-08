import React, { useState, useMemo } from 'react';
import { useSalon } from '@/contexts/SalonContext';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  PieChart,
  BarChart3,
  Users,
  Target,
  FileText,
  Printer,
  Download,
  Receipt,
  Scissors,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Building2,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Sliders,
  Coins,
  Plus,
  Trash2,
  Hammer,
} from 'lucide-react';
import { getLocalDateString } from '@/utils/dateUtils';
import type { Invoice } from '@/types/salon';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

export const LedgerPage: React.FC = () => {
  const {
    invoices,
    expenses,
    staff,
    currencyFormat,
    settings,
    updateSettings,
    role,
    calculateStaffPayout,
  } = useSalon();

  // Date Range Presets
  const todayStr = useMemo(() => getLocalDateString(), []);
  const [dateRangePreset, setDateRangePreset] = useState<'today' | 'week' | 'month' | 'custom'>('month');
  
  // Selected Invoice for Accounting Receipt modal
  const [selectedInvoiceForReceipt, setSelectedInvoiceForReceipt] = useState<Invoice | null>(null);

  // Fallback resolver for barber name
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
    return [
      {
        id: 'temp-0',
        invoice_id: inv.id,
        service_id: null,
        service_name: 'Haircut & Grooming',
        category: 'Grooming',
        price: inv.total_amount,
        staff_id: null,
        staff_name: staff[0]?.name || 'Senior Barber',
        commission_rate: 0,
        commission_amount: 0,
      },
    ];
  };
  
  // Custom Date Range
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1); // 1st of current month
    return getLocalDateString(d);
  });
  const [endDate, setEndDate] = useState(() => getLocalDateString());

  // Profitability Target Parameters (Pakistani Salon Standards) - Persistent
  const [monthlyRent, setMonthlyRent] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('tgs_target_rent');
      if (saved) return Number(saved);
      if (settings.owner_financial_targets?.monthly_rent_target) {
        return settings.owner_financial_targets.monthly_rent_target;
      }
    } catch {}
    return 85000;
  });

  const [monthlyUtilities, setMonthlyUtilities] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('tgs_target_utilities');
      if (saved) return Number(saved);
      if (settings.owner_financial_targets?.monthly_electricity_target) {
        return settings.owner_financial_targets.monthly_electricity_target;
      }
    } catch {}
    return 45000;
  });

  const [monthlyMiscFixed, setMonthlyMiscFixed] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('tgs_target_misc');
      if (saved) return Number(saved);
      if (settings.owner_financial_targets?.monthly_utilities_target) {
        return settings.owner_financial_targets.monthly_utilities_target;
      }
    } catch {}
    return 20000;
  });

  const [monthlyTargetProfit, setMonthlyTargetProfit] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('tgs_target_profit');
      if (saved) return Number(saved);
      if (settings.owner_financial_targets?.monthly_net_profit_target) {
        return settings.owner_financial_targets.monthly_net_profit_target;
      }
    } catch {}
    return 150000;
  });

  const [operatingDays, setOperatingDays] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('tgs_target_operating_days');
      if (saved) return Number(saved);
    } catch {}
    return 30;
  });

  const [isTargetSettingsOpen, setIsTargetSettingsOpen] = useState(false);

  // Capital Expenditure (CapEx) Tracking State - Persistent in localStorage
  const [capexList, setCapexList] = useState<Array<{
    id: string;
    title: string;
    amount: number;
    date: string;
    vendor?: string;
    category: 'Equipment' | 'Furniture' | 'Renovation' | 'Power/Generator' | 'Tools';
    notes?: string;
  }>>(() => {
    try {
      const saved = localStorage.getItem('tgs_capex_records');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'capex-1',
        title: 'Master Hydraulic Styling Chairs (2 Units)',
        amount: 140000,
        date: '2026-08-15',
        vendor: 'Salon Equipment Traders Karachi',
        category: 'Furniture',
        notes: 'Heavy duty chrome base reclining chairs with 3-year warranty',
      },
      {
        id: 'capex-2',
        title: 'Gree 2.0-Ton Inverter Air Conditioner',
        amount: 185000,
        date: '2026-08-20',
        vendor: 'DHA Electronics Karachi',
        category: 'Equipment',
        notes: 'Low electricity consumption inverter unit for main floor',
      },
      {
        id: 'capex-3',
        title: 'Pure Sine Wave UPS Inverter + 200Ah Dry Batteries',
        amount: 95000,
        date: '2026-09-02',
        vendor: 'PowerTech Solar & UPS',
        category: 'Power/Generator',
        notes: 'Zero downtime during load shedding for lighting and clippers',
      },
    ];
  });

  const [isAddCapexOpen, setIsAddCapexOpen] = useState(false);
  const [capexTitle, setCapexTitle] = useState('');
  const [capexAmount, setCapexAmount] = useState('');
  const [capexDate, setCapexDate] = useState(() => getLocalDateString());
  const [capexCategory, setCapexCategory] = useState<'Equipment' | 'Furniture' | 'Renovation' | 'Power/Generator' | 'Tools'>('Equipment');
  const [capexVendor, setCapexVendor] = useState('');
  const [capexNotes, setCapexNotes] = useState('');

  const handleSaveCapex = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(capexAmount);
    if (!capexTitle.trim() || isNaN(amt) || amt <= 0) {
      toast.error('Enter a valid CapEx title and amount in PKR');
      return;
    }

    const newRecord = {
      id: `capex-${Date.now()}`,
      title: capexTitle.trim(),
      amount: amt,
      date: capexDate || getLocalDateString(),
      category: capexCategory,
      vendor: capexVendor.trim() || undefined,
      notes: capexNotes.trim() || undefined,
    };

    const updated = [newRecord, ...capexList];
    setCapexList(updated);
    try {
      localStorage.setItem('tgs_capex_records', JSON.stringify(updated));
    } catch {}

    toast.success(`CapEx asset "${newRecord.title}" of ${currencyFormat(amt)} logged`);
    setIsAddCapexOpen(false);
    setCapexTitle('');
    setCapexAmount('');
    setCapexVendor('');
    setCapexNotes('');
  };

  const handleDeleteCapex = (id: string) => {
    const updated = capexList.filter((c) => c.id !== id);
    setCapexList(updated);
    try {
      localStorage.setItem('tgs_capex_records', JSON.stringify(updated));
    } catch {}
    toast.success('CapEx record deleted');
  };

  const totalCapexAmount = useMemo(() => {
    return capexList.reduce((sum, c) => sum + c.amount, 0);
  }, [capexList]);

  // Permanently save financial targets to localStorage and context settings
  const handleSaveTargets = () => {
    try {
      localStorage.setItem('tgs_target_rent', String(monthlyRent));
      localStorage.setItem('tgs_target_utilities', String(monthlyUtilities));
      localStorage.setItem('tgs_target_misc', String(monthlyMiscFixed));
      localStorage.setItem('tgs_target_profit', String(monthlyTargetProfit));
      localStorage.setItem('tgs_target_operating_days', String(operatingDays));
    } catch {}
    updateSettings({
      owner_financial_targets: {
        monthly_rent_target: monthlyRent,
        monthly_electricity_target: monthlyUtilities,
        monthly_utilities_target: monthlyMiscFixed,
        monthly_net_profit_target: monthlyTargetProfit,
        daily_sales_target: Math.round((monthlyRent + monthlyUtilities + monthlyMiscFixed + monthlyTargetProfit) / (operatingDays || 30)),
      },
    });
    setIsTargetSettingsOpen(false);
    toast.success('Owner financial targets permanently saved & locked');
  };

  // Apply preset dates
  const handlePresetChange = (preset: 'today' | 'week' | 'month' | 'custom') => {
    setDateRangePreset(preset);
    const now = new Date();

    if (preset === 'today') {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === 'week') {
      const past7 = new Date();
      past7.setDate(past7.getDate() - 7);
      setStartDate(past7.toISOString().split('T')[0]);
      setEndDate(todayStr);
    } else if (preset === 'month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      setStartDate(firstDay.toISOString().split('T')[0]);
      setEndDate(todayStr);
    }
  };

  // Filtered Invoices in selected date range
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const invDate = inv.created_at.split('T')[0];
      return invDate >= startDate && invDate <= endDate && inv.status === 'Completed';
    });
  }, [invoices, startDate, endDate]);

  // Filtered Expenses in selected date range
  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      return exp.expense_date >= startDate && exp.expense_date <= endDate;
    });
  }, [expenses, startDate, endDate]);

  // Financial Metrics Calculation
  const totalRevenue = useMemo(() => {
    return filteredInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);
  }, [filteredInvoices]);

  const totalDiscountsGiven = useMemo(() => {
    return filteredInvoices.reduce((sum, inv) => sum + (inv.discount_amount || 0), 0);
  }, [filteredInvoices]);

  const totalOperatingExpenses = useMemo(() => {
    return filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  }, [filteredExpenses]);

  // Total commissions earned on completed invoices in range
  const totalCommissions = useMemo(() => {
    let commSum = 0;
    for (const inv of filteredInvoices) {
      if (inv.items) {
        for (const item of inv.items) {
          commSum += item.commission_amount || 0;
        }
      }
    }
    return commSum;
  }, [filteredInvoices]);

  // Total base staff salaries (prorated for days in range)
  const rangeDaysCount = useMemo(() => {
    const s = new Date(startDate).getTime();
    const e = new Date(endDate).getTime();
    const diff = Math.max(1, Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1);
    return diff;
  }, [startDate, endDate]);

  const totalMonthlyBaseSalaries = useMemo(() => {
    return staff.filter((s) => s.is_active).reduce((sum, s) => sum + s.base_salary, 0);
  }, [staff]);

  const proratedBaseSalaries = useMemo(() => {
    return Math.round((totalMonthlyBaseSalaries / 30) * rangeDaysCount);
  }, [totalMonthlyBaseSalaries, rangeDaysCount]);

  // Prorated fixed burden (rent + utilities + misc)
  const proratedRent = useMemo(() => {
    return Math.round((monthlyRent / operatingDays) * rangeDaysCount);
  }, [monthlyRent, operatingDays, rangeDaysCount]);

  const proratedUtilities = useMemo(() => {
    return Math.round((monthlyUtilities / operatingDays) * rangeDaysCount);
  }, [monthlyUtilities, operatingDays, rangeDaysCount]);

  const proratedMiscFixed = useMemo(() => {
    return Math.round((monthlyMiscFixed / operatingDays) * rangeDaysCount);
  }, [monthlyMiscFixed, operatingDays, rangeDaysCount]);

  const totalCost = totalOperatingExpenses + totalCommissions + proratedBaseSalaries + proratedRent + proratedUtilities + proratedMiscFixed;
  const netProfit = totalRevenue - totalCost;
  const profitMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

  // Payment Mode & Drawer Reconciliation (Cash vs Online vs Wallet)
  const paymentReconciliation = useMemo(() => {
    let cashSales = 0;
    let onlineSales = 0;
    let walletSales = 0;

    filteredInvoices.forEach((inv) => {
      const total = Number(inv.total_amount) || 0;
      const walletUsed = Number(inv.client_wallet_deducted) || 0;
      walletSales += walletUsed;

      if (inv.payment_method === 'Cash') {
        cashSales += total;
      } else if (inv.payment_method === 'Online Transfer' || inv.payment_method === 'Card') {
        onlineSales += total;
      } else if (inv.payment_method === 'Split' && inv.split_details) {
        inv.split_details.forEach((sp) => {
          if (sp.method === 'Cash') cashSales += sp.amount;
          else onlineSales += sp.amount;
        });
      } else {
        cashSales += total;
      }
    });

    let cashExpenses = 0;
    let onlineExpenses = 0;
    filteredExpenses.forEach((exp) => {
      const amt = Number(exp.amount) || 0;
      if (exp.payment_mode === 'Cash') {
        cashExpenses += amt;
      } else {
        onlineExpenses += amt;
      }
    });

    const netCashInDrawer = cashSales - cashExpenses;
    const netOnlineFunds = onlineSales - onlineExpenses;

    return {
      cashSales,
      onlineSales,
      walletSales,
      cashExpenses,
      onlineExpenses,
      netCashInDrawer,
      netOnlineFunds,
    };
  }, [filteredInvoices, filteredExpenses]);

  // Daily Revenue Target Model
  const dailyRentBurden = Math.round(monthlyRent / operatingDays);
  const dailyUtilityBurden = Math.round(monthlyUtilities / operatingDays);
  const dailyMiscBurden = Math.round(monthlyMiscFixed / operatingDays);
  const dailyBaseSalaryBurden = Math.round(totalMonthlyBaseSalaries / operatingDays);
  const dailyFixedTotal = dailyRentBurden + dailyUtilityBurden + dailyMiscBurden + dailyBaseSalaryBurden;

  // Break-even daily revenue needed
  const dailyBreakEvenRevenue = dailyFixedTotal;
  // Daily target to achieve target monthly profit
  const dailyProfitTarget = Math.round(monthlyTargetProfit / operatingDays);
  const dailyRequiredRevenue = dailyBreakEvenRevenue + dailyProfitTarget;

  // Today's actual revenue
  const todayInvoices = useMemo(() => {
    return invoices.filter((i) => i.created_at.startsWith(todayStr) && i.status === 'Completed');
  }, [invoices, todayStr]);

  const todayRevenue = useMemo(() => {
    return todayInvoices.reduce((sum, i) => sum + i.total_amount, 0);
  }, [todayInvoices]);

  const todayTargetProgress = Math.min(100, Math.round((todayRevenue / (dailyRequiredRevenue || 1)) * 100));

  // Average bill size
  const averageTicketSize = useMemo(() => {
    if (invoices.length === 0) return 1200;
    const completed = invoices.filter((i) => i.status === 'Completed');
    if (!completed.length) return 1200;
    return Math.round(completed.reduce((s, i) => s + i.total_amount, 0) / completed.length);
  }, [invoices]);

  const requiredDailyBills = Math.ceil(dailyRequiredRevenue / (averageTicketSize || 1000));
  const billsTodayCount = todayInvoices.length;

  // Staff Performance in selected range with 4-Tier compensation calculation
  const staffPerformance = useMemo(() => {
    const stats: Record<
      string,
      {
        member: (typeof staff)[0];
        name: string;
        role: string;
        serviceCount: number;
        revenueGenerated: number;
      }
    > = {};

    staff.forEach((s) => {
      stats[s.id] = {
        member: s,
        name: s.name,
        role: s.role,
        serviceCount: 0,
        revenueGenerated: 0,
      };
    });

    filteredInvoices.forEach((inv) => {
      if (inv.items) {
        inv.items.forEach((item) => {
          if (item.staff_id && stats[item.staff_id]) {
            stats[item.staff_id].serviceCount += 1;
            stats[item.staff_id].revenueGenerated += item.price;
          }
        });
      }
    });

    return Object.values(stats).sort((a, b) => b.revenueGenerated - a.revenueGenerated);
  }, [staff, filteredInvoices]);

  // Combined Ledger Entries (Credits = Invoices, Debits = Expenses)
  const ledgerEntries = useMemo(() => {
    const entries: {
      id: string;
      date: string;
      type: 'credit' | 'debit';
      category: string;
      reference: string;
      description: string;
      amount: number;
      rawInvoice?: Invoice;
    }[] = [];

    filteredInvoices.forEach((inv) => {
      const timeStr = new Date(inv.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
      const itemsList = getDisplayItems(inv);
      const serviceSummary = itemsList.map((it: any) => `${it.service_name} (✂️ ${getBarberName(it)})`).join(' + ');

      entries.push({
        id: inv.id,
        date: `${inv.created_at.split('T')[0]} ${timeStr}`,
        type: 'credit',
        category: 'Client Service Bill',
        reference: inv.invoice_number,
        description: `${inv.client_name} • ${serviceSummary} [${inv.payment_method}]`,
        amount: inv.total_amount,
        rawInvoice: inv,
      });
    });

    filteredExpenses.forEach((exp) => {
      entries.push({
        id: exp.id,
        date: exp.expense_date,
        type: 'debit',
        category: exp.category,
        reference: `EXP-${exp.id.slice(-6)}`,
        description: `${exp.title} • Vendor: ${exp.vendor || 'Counter'} (${exp.payment_mode})${exp.is_exceeded_expense ? ' [QUOTA EXCEEDED]' : ''}`,
        amount: exp.amount,
      });
    });

    return entries.sort((a, b) => b.date.localeCompare(a.date));
  }, [filteredInvoices, filteredExpenses, staff]);

  // Export Ledger
  const handleExportLedger = () => {
    const headers = ['Date', 'Type', 'Category', 'Reference #', 'Description', 'Amount (PKR)'];
    const rows = ledgerEntries.map((e) => [
      e.date,
      e.type === 'credit' ? 'REVENUE (Credit)' : 'EXPENSE (Debit)',
      `"${e.category}"`,
      `"${e.reference}"`,
      `"${e.description.replace(/"/g, '""')}"`,
      e.type === 'credit' ? e.amount : -e.amount,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TGS_Financial_Ledger_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Ledger exported to CSV successfully');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Owner Financial Ledger & Profit Target</h1>
            <Badge variant="outline" className="border-primary/40 text-primary gap-1">
              👑 Owner Exclusive
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time balance sheets, rent & utility burdens, break-even targets, and staff earnings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsTargetSettingsOpen(true)}
            className="text-xs h-9 gap-1.5 font-semibold"
          >
            <Sliders className="w-3.5 h-3.5" />
            Target & Rent Config
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportLedger}
            className="text-xs h-9 gap-1.5 font-semibold"
          >
            <Download className="w-3.5 h-3.5" />
            Export Ledger
          </Button>
        </div>
      </div>

      {/* Date Range Selector Toolbar */}
      <Card className="border shadow-none bg-card p-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-muted-foreground mr-1">Period:</span>
            <Button
              variant={dateRangePreset === 'today' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handlePresetChange('today')}
              className="h-8 text-xs font-semibold"
            >
              Today
            </Button>
            <Button
              variant={dateRangePreset === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handlePresetChange('week')}
              className="h-8 text-xs font-semibold"
            >
              Last 7 Days
            </Button>
            <Button
              variant={dateRangePreset === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handlePresetChange('month')}
              className="h-8 text-xs font-semibold"
            >
              Month to Date
            </Button>
            <Button
              variant={dateRangePreset === 'custom' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDateRangePreset('custom')}
              className="h-8 text-xs font-semibold"
            >
              Custom Range
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground text-[11px]">From:</span>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setDateRangePreset('custom');
                }}
                className="h-8 text-xs w-36 font-mono"
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground text-[11px]">To:</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setDateRangePreset('custom');
                }}
                className="h-8 text-xs w-36 font-mono"
              />
            </div>
            <Badge variant="secondary" className="font-mono text-[10px]">
              {rangeDaysCount} day{rangeDaysCount === 1 ? '' : 's'}
            </Badge>
          </div>
        </div>
      </Card>

      {/* DAILY TARGET & PROFITABILITY PROGRESS BAR */}
      <Card className="border shadow-none bg-gradient-to-r from-muted/30 to-background border-primary/30 p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm flex items-center gap-1.5 text-foreground">
                <Target className="w-4 h-4 text-primary" />
                Today's Revenue Target Progress ({todayStr})
              </span>
              <Badge
                variant={todayRevenue >= dailyRequiredRevenue ? 'default' : 'secondary'}
                className="font-bold text-[10px]"
              >
                {todayRevenue >= dailyRequiredRevenue
                  ? '🎉 Profitable Target Achieved'
                  : todayRevenue >= dailyBreakEvenRevenue
                  ? '⚡ Break-Even Crossed (Generating Profit)'
                  : '⏳ Covering Daily Overheads'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Daily target factors rent (Rs. {dailyRentBurden}/day), utilities (Rs. {dailyUtilityBurden}/day), wages & target profit.
            </p>
          </div>

          <div className="text-left md:text-right">
            <div className="text-xs text-muted-foreground">Today's Revenue vs Required Target:</div>
            <div className="text-xl font-bold font-mono text-emerald-600">
              {currencyFormat(todayRevenue)}{' '}
              <span className="text-xs font-normal text-muted-foreground">
                / {currencyFormat(dailyRequiredRevenue)} target
              </span>
            </div>
          </div>
        </div>

        <div className="mt-3 space-y-1.5">
          <div className="flex justify-between text-xs font-mono">
            <span>{todayTargetProgress}% of Target</span>
            <span>
              Bills Today: <strong className="text-foreground">{billsTodayCount}</strong> /{' '}
              {requiredDailyBills} needed
            </span>
          </div>
          <Progress value={todayTargetProgress} className="h-2" />
        </div>
      </Card>

      {/* FINANCIAL LEDGER OVERVIEW CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border p-3.5 shadow-none bg-card">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground uppercase">Billed Revenue</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 mt-1">
            {currencyFormat(totalRevenue)}
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {filteredInvoices.length} invoices ({currencyFormat(totalDiscountsGiven)} discounts applied)
          </p>
        </Card>

        <Card className="border p-3.5 shadow-none bg-card">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground uppercase">Operating Expenses</span>
            <ArrowDownRight className="w-4 h-4 text-destructive" />
          </div>
          <div className="text-2xl font-bold font-mono text-foreground mt-1">
            {currencyFormat(totalOperatingExpenses)}
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {filteredExpenses.length} operational expense logs
          </p>
        </Card>

        <Card className="border p-3.5 shadow-none bg-card">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground uppercase">Staff Pay & Commissions</span>
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-bold font-mono text-foreground mt-1">
            {currencyFormat(totalCommissions + proratedBaseSalaries)}
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Commissions: {currencyFormat(totalCommissions)} • Wages: {currencyFormat(proratedBaseSalaries)}
          </p>
        </Card>

        <Card className={`border p-3.5 shadow-none ${netProfit >= 0 ? 'bg-emerald-50/20 border-emerald-500/30' : 'bg-red-50/20 border-red-500/30'}`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground uppercase">Net Salon Profit</span>
            <Badge variant={netProfit >= 0 ? 'default' : 'destructive'} className="text-[10px] font-mono">
              {profitMargin}% Margin
            </Badge>
          </div>
          <div className={`text-2xl font-bold font-mono mt-1 ${netProfit >= 0 ? 'text-emerald-600' : 'text-destructive'}`}>
            {currencyFormat(netProfit)}
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            After rent ({currencyFormat(proratedRent)}), utilities & all costs
          </p>
        </Card>
      </div>

      {/* DRAWER & PAYMENT RECONCILIATION SUMMARY */}
      <Card className="border border-border/80 shadow-none bg-muted/20 p-4 rounded-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-border/60">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Receipt className="w-4 h-4 text-primary" />
              Cash Drawer &amp; Payment Channel Reconciliation
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live audit of physical cash collections vs counter petty expenses and bank transfers for {startDate} to {endDate}.
            </p>
          </div>
          <Badge variant="outline" className="text-[11px] font-mono self-start md:self-auto border-emerald-500/40 text-emerald-700 bg-emerald-50/50">
            Cash Drawer Balance: {currencyFormat(paymentReconciliation.netCashInDrawer)}
          </Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3">
          <div className="p-2.5 rounded-xl border border-border/60 bg-card">
            <span className="text-[10px] font-medium text-muted-foreground uppercase block">Cash Sales Collected</span>
            <span className="text-base font-bold font-mono text-emerald-600 block mt-0.5">
              +{currencyFormat(paymentReconciliation.cashSales)}
            </span>
            <span className="text-[10px] text-muted-foreground">In-salon cash drawer</span>
          </div>

          <div className="p-2.5 rounded-xl border border-border/60 bg-card">
            <span className="text-[10px] font-medium text-muted-foreground uppercase block">Cash Expenses Paid</span>
            <span className="text-base font-bold font-mono text-destructive block mt-0.5">
              -{currencyFormat(paymentReconciliation.cashExpenses)}
            </span>
            <span className="text-[10px] text-muted-foreground">Counter petty cash out</span>
          </div>

          <div className="p-2.5 rounded-xl border border-border/60 bg-card">
            <span className="text-[10px] font-medium text-muted-foreground uppercase block">Online / Bank Sales</span>
            <span className="text-base font-bold font-mono text-blue-600 block mt-0.5">
              +{currencyFormat(paymentReconciliation.onlineSales)}
            </span>
            <span className="text-[10px] text-muted-foreground">Direct account deposits</span>
          </div>

          <div className="p-2.5 rounded-xl border border-border/60 bg-card">
            <span className="text-[10px] font-medium text-muted-foreground uppercase block">Net Bank Balance Change</span>
            <span className="text-base font-bold font-mono text-foreground block mt-0.5">
              {currencyFormat(paymentReconciliation.netOnlineFunds)}
            </span>
            <span className="text-[10px] text-muted-foreground">Online sales less online exp</span>
          </div>
        </div>
      </Card>

      {/* TABS: TRANSACTION LEDGER, STAFF PERFORMANCE, AND TARGET SIMULATOR */}
      <Tabs defaultValue="ledger" className="w-full">
        <div className="w-full max-w-full overflow-x-auto scrollbar-thin pb-1">
          <TabsList className="bg-muted/40 border p-1 inline-flex w-max min-w-full sm:w-auto">
            <TabsTrigger value="ledger" className="text-xs font-semibold gap-1.5 whitespace-nowrap">
              <FileText className="w-3.5 h-3.5" />
              Consolidated Ledger ({ledgerEntries.length} entries)
            </TabsTrigger>
            <TabsTrigger value="capex" className="text-xs font-semibold gap-1.5 whitespace-nowrap">
              <Coins className="w-3.5 h-3.5" />
              CapEx &amp; Assets ({capexList.length})
            </TabsTrigger>
            <TabsTrigger value="runway" className="text-xs font-semibold gap-1.5 whitespace-nowrap">
              <TrendingUp className="w-3.5 h-3.5" />
              Profit Runway &amp; Break-Even
            </TabsTrigger>
            <TabsTrigger value="staff_reports" className="text-xs font-semibold gap-1.5 whitespace-nowrap">
              <Users className="w-3.5 h-3.5" />
              Individual Staff Reports ({staffPerformance.length})
            </TabsTrigger>
            <TabsTrigger value="breakdown" className="text-xs font-semibold gap-1.5 whitespace-nowrap">
              <BarChart3 className="w-3.5 h-3.5" />
              Cost Burden Breakdown
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TAB 1: CONSOLIDATED LEDGER TABLE */}
        <TabsContent value="ledger" className="space-y-4 mt-4">
          <Card className="border shadow-none">
            <CardHeader className="p-3.5 pb-2 border-b flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold">Chronological Transaction Ledger</CardTitle>
                <CardDescription className="text-xs">
                  Showing all sales credits and expense debits from {startDate} to {endDate}.
                </CardDescription>
              </div>
              <Badge variant="outline" className="font-mono text-[10px]">
                Audited PKR
              </Badge>
            </CardHeader>

            <CardContent className="p-0">
              <div className="w-full max-w-full overflow-x-auto bg-card">
                <table className="w-full text-left text-xs [&>div]:max-w-full">
                  <thead className="bg-muted/40 border-b text-muted-foreground font-medium">
                    <tr>
                      <th className="py-2.5 px-3 whitespace-nowrap">Date</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Type</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Reference #</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Category</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Description & Barber Breakdown</th>
                      <th className="py-2.5 px-3 whitespace-nowrap text-right">Credit (Sales)</th>
                      <th className="py-2.5 px-3 whitespace-nowrap text-right">Debit (Expense)</th>
                      <th className="py-2.5 px-3 whitespace-nowrap text-center">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {ledgerEntries.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-muted-foreground">
                          No transactions found for the selected date range.
                        </td>
                      </tr>
                    ) : (
                      ledgerEntries.map((e) => (
                        <tr key={e.id} className="hover:bg-muted/30">
                          <td className="py-2 px-3 whitespace-nowrap font-mono text-muted-foreground">
                            {e.date}
                          </td>
                          <td className="py-2 px-3 whitespace-nowrap">
                            <Badge
                              variant={e.type === 'credit' ? 'outline' : 'secondary'}
                              className={`text-[9px] font-bold ${
                                e.type === 'credit'
                                  ? 'border-emerald-500/50 text-emerald-600 bg-emerald-50/30'
                                  : 'text-muted-foreground'
                              }`}
                            >
                              {e.type === 'credit' ? '+ CREDIT' : '- DEBIT'}
                            </Badge>
                          </td>
                          <td className="py-2 px-3 whitespace-nowrap font-mono font-bold text-foreground">
                            {e.reference}
                          </td>
                          <td className="py-2 px-3 whitespace-nowrap text-muted-foreground">
                            {e.category}
                          </td>
                          <td className="py-2 px-3 max-w-sm truncate text-foreground font-medium">
                            {e.description}
                          </td>
                          <td className="py-2 px-3 whitespace-nowrap text-right font-mono font-bold text-emerald-600">
                            {e.type === 'credit' ? currencyFormat(e.amount) : '-'}
                          </td>
                          <td className="py-2 px-3 whitespace-nowrap text-right font-mono font-bold text-destructive">
                            {e.type === 'debit' ? currencyFormat(e.amount) : '-'}
                          </td>
                          <td className="py-2 px-3 whitespace-nowrap text-center">
                            {e.rawInvoice ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedInvoiceForReceipt(e.rawInvoice || null)}
                                className="h-6 px-2 text-[10px] font-semibold gap-1 rounded-md border-primary/30 text-primary hover:bg-primary/10"
                              >
                                <Receipt className="w-3 h-3" />
                                <span>Receipt</span>
                              </Button>
                            ) : (
                              <span className="text-muted-foreground text-[10px]">-</span>
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
        </TabsContent>

        {/* TAB 2: INDIVIDUAL STAFF PERFORMANCE & COMMISSIONS */}
        <TabsContent value="staff_reports" className="space-y-4 mt-4">
          <Card className="border shadow-none">
            <CardHeader className="p-3.5 pb-2 border-b flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold">Barber & Staff Performance Leaderboard</CardTitle>
                <CardDescription className="text-xs">
                  Services completed, revenue brought in, commissions owed, and salon net return.
                </CardDescription>
              </div>
              <Badge variant="outline" className="font-mono text-xs">
                {rangeDaysCount} Days Evaluated
              </Badge>
            </CardHeader>

            <CardContent className="p-0">
              <div className="w-full max-w-full overflow-x-auto bg-card">
                <table className="w-full text-left text-xs [&>div]:max-w-full">
                  <thead className="bg-muted/40 border-b text-muted-foreground font-medium">
                    <tr>
                      <th className="py-2.5 px-3 whitespace-nowrap">Staff Name & Role</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Pay Model</th>
                      <th className="py-2.5 px-3 whitespace-nowrap text-center">Services Delivered</th>
                      <th className="py-2.5 px-3 whitespace-nowrap text-right">Revenue Generated</th>
                      <th className="py-2.5 px-3 whitespace-nowrap text-right">Staff Payout Owed</th>
                      <th className="py-2.5 px-3 whitespace-nowrap text-right">Salon Net Return</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {staffPerformance.map((s) => {
                      const payout = calculateStaffPayout(s.member, s.revenueGenerated);
                      const salonYield = s.revenueGenerated - payout.totalPayout;
                      return (
                        <tr key={s.name} className="hover:bg-muted/30">
                          <td className="py-2.5 px-3 whitespace-nowrap font-medium text-foreground">
                            <div className="font-bold">{s.name}</div>
                            <div className="text-[10px] text-muted-foreground uppercase font-mono">
                              {s.role.replace('_', ' ')}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <Badge variant="outline" className="text-[10px] font-bold">
                              {s.member.pay_type === 'individual_partnership'
                                ? `Partnership (${s.member.partnership_percentage || 60}%)`
                                : s.member.pay_type === 'salary_only'
                                ? 'Base Salary'
                                : s.member.pay_type === 'salary_plus_commission'
                                ? `Hybrid (${s.member.commission_rate}% + Base)`
                                : `Commission (${s.member.commission_rate}%)`}
                            </Badge>
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap text-center font-mono font-bold">
                            {s.serviceCount}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap text-right font-mono font-bold text-emerald-600">
                            {currencyFormat(s.revenueGenerated)}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap text-right font-mono font-bold text-primary">
                            {currencyFormat(payout.totalPayout)}
                          </td>
                          <td className={`py-2.5 px-3 whitespace-nowrap text-right font-mono font-bold ${salonYield >= 0 ? 'text-emerald-600' : 'text-destructive'}`}>
                            {currencyFormat(salonYield)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: COST BURDEN BREAKDOWN */}
        <TabsContent value="breakdown" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border shadow-none p-4 space-y-3">
              <h3 className="font-bold text-sm">Monthly Fixed Overheads (Burden Model)</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Shop Rent (Monthly):</span>
                  <span className="font-mono font-bold">{currencyFormat(monthlyRent)}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Utilities (Electricity, Water):</span>
                  <span className="font-mono font-bold">{currencyFormat(monthlyUtilities)}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Refreshments & Misc Fixed:</span>
                  <span className="font-mono font-bold">{currencyFormat(monthlyMiscFixed)}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Staff Monthly Base Wages:</span>
                  <span className="font-mono font-bold">{currencyFormat(totalMonthlyBaseSalaries)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-t font-bold text-foreground">
                  <span>Total Monthly Overhead:</span>
                  <span className="font-mono text-primary">
                    {currencyFormat(monthlyRent + monthlyUtilities + monthlyMiscFixed + totalMonthlyBaseSalaries)}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="border shadow-none p-4 space-y-3">
              <h3 className="font-bold text-sm">Daily Break-Even & Profit Blueprint</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Daily Fixed Cost Burden:</span>
                  <span className="font-mono font-bold text-destructive">{currencyFormat(dailyBreakEvenRevenue)}/day</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Target Daily Profit Contribution:</span>
                  <span className="font-mono font-bold text-emerald-600">{currencyFormat(dailyProfitTarget)}/day</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Required Daily Gross Revenue:</span>
                  <span className="font-mono font-bold text-primary">{currencyFormat(dailyRequiredRevenue)}/day</span>
                </div>
                <div className="flex justify-between py-1.5 border-t font-bold text-foreground">
                  <span>Estimated Daily Customers Needed:</span>
                  <span className="font-mono text-foreground text-sm">
                    {requiredDailyBills} bills/day (at avg {currencyFormat(averageTicketSize)})
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* TAB: CAPEX & FIXED ASSETS */}
        <TabsContent value="capex" className="space-y-4 mt-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-card p-4 rounded-xl border">
            <div>
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Coins className="w-4 h-4 text-primary" />
                Capital Expenditure (CapEx) &amp; Salon Fixed Assets
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Track long-term capital investments like barber chairs, air conditioners, solar inverters, and renovation.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setIsAddCapexOpen(true)}
              className="gap-1.5 h-8 text-xs font-semibold rounded-xl"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Capital Asset</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Card className="border p-3.5 shadow-none">
              <span className="text-[11px] font-medium text-muted-foreground uppercase">Total CapEx Deployed</span>
              <div className="text-2xl font-bold font-mono text-primary mt-1">
                {currencyFormat(totalCapexAmount)}
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">{capexList.length} fixed asset records</p>
            </Card>

            <Card className="border p-3.5 shadow-none">
              <span className="text-[11px] font-medium text-muted-foreground uppercase">Est. Monthly Depreciation (36-mo)</span>
              <div className="text-2xl font-bold font-mono text-amber-600 mt-1">
                {currencyFormat(Math.round(totalCapexAmount / 36))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">Straight-line asset write-down/mo</p>
            </Card>

            <Card className="border p-3.5 shadow-none">
              <span className="text-[11px] font-medium text-muted-foreground uppercase">CapEx Recovery Runway</span>
              <div className="text-2xl font-bold font-mono text-emerald-600 mt-1">
                {monthlyTargetProfit > 0 ? (totalCapexAmount / monthlyTargetProfit).toFixed(1) : '0'} Months
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">At target monthly net profit</p>
            </Card>
          </div>

          <Card className="border shadow-none">
            <CardContent className="p-0">
              <div className="w-full max-w-full overflow-x-auto bg-card">
                <table className="w-full text-left text-xs [&>div]:max-w-full">
                  <thead className="bg-muted/40 border-b text-muted-foreground font-medium">
                    <tr>
                      <th className="py-2.5 px-3 whitespace-nowrap">Asset Name</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Category</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Date Purchased</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Vendor</th>
                      <th className="py-2.5 px-3 whitespace-nowrap text-right">Investment Amount</th>
                      <th className="py-2.5 px-3 whitespace-nowrap text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {capexList.map((asset) => (
                      <tr key={asset.id} className="hover:bg-muted/30">
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <div className="font-semibold text-foreground">{asset.title}</div>
                          {asset.notes && <div className="text-[10px] text-muted-foreground">{asset.notes}</div>}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <Badge variant="outline" className="text-[10px]">{asset.category}</Badge>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap font-mono">{asset.date}</td>
                        <td className="py-2.5 px-3 whitespace-nowrap text-muted-foreground">{asset.vendor || '-'}</td>
                        <td className="py-2.5 px-3 whitespace-nowrap text-right font-mono font-bold text-foreground">
                          {currencyFormat(asset.amount)}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteCapex(asset.id)}
                            className="h-7 w-7 text-destructive hover:bg-destructive/10"
                            title="Delete Asset Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: PROFIT RUNWAY & BREAK-EVEN ANALYTICS */}
        <TabsContent value="runway" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border shadow-none p-4 space-y-3">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Salon Cash Runway &amp; Daily Burn Rate
              </h3>
              <p className="text-xs text-muted-foreground">
                Evaluates your cash cushion against operational fixed burn rate under varying occupancy scenarios.
              </p>
              <div className="space-y-2 text-xs pt-2">
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Daily Fixed Burn Rate:</span>
                  <span className="font-mono font-bold text-destructive">
                    {currencyFormat(dailyBreakEvenRevenue)} / day
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Average Daily Inflow (Selected Period):</span>
                  <span className="font-mono font-bold text-foreground">
                    {currencyFormat(rangeDaysCount > 0 ? Math.round(totalRevenue / rangeDaysCount) : 0)} / day
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Net Cashflow Velocity:</span>
                  <span className={`font-mono font-bold ${netProfit >= 0 ? 'text-emerald-600' : 'text-destructive'}`}>
                    {rangeDaysCount > 0 ? currencyFormat(Math.round(netProfit / rangeDaysCount)) : 0} / day
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-t font-bold text-foreground">
                  <span>Operating Survival Runway:</span>
                  <Badge variant="outline" className="text-xs text-emerald-600 font-mono">
                    Positive Net Surplus
                  </Badge>
                </div>
              </div>
            </Card>

            <Card className="border shadow-none p-4 space-y-3">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                Owner Profit Distribution Blueprint
              </h3>
              <p className="text-xs text-muted-foreground">
                Calculates sustainable owner dividends after deducting re-investment and contingency reserves.
              </p>
              <div className="space-y-2 text-xs pt-2">
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Gross Operating Profit:</span>
                  <span className="font-mono font-bold text-foreground">{currencyFormat(Math.max(0, netProfit))}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Emergency Reserve (15%):</span>
                  <span className="font-mono font-bold text-muted-foreground">
                    -{currencyFormat(Math.round(Math.max(0, netProfit) * 0.15))}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">CapEx Maintenance Buffer (10%):</span>
                  <span className="font-mono font-bold text-muted-foreground">
                    -{currencyFormat(Math.round(Math.max(0, netProfit) * 0.10))}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-t font-bold text-foreground">
                  <span>Recommended Owner Dividend:</span>
                  <span className="font-mono text-emerald-600 font-bold text-sm">
                    {currencyFormat(Math.round(Math.max(0, netProfit) * 0.75))}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add CapEx Asset Modal */}
      <Dialog open={isAddCapexOpen} onOpenChange={setIsAddCapexOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
          <DialogHeader>
            <DialogTitle>Log Capital Expenditure (CapEx)</DialogTitle>
            <DialogDescription className="text-xs">
              Record fixed salon asset investments (chairs, air conditioners, UPS inverters, interior fixtures).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveCapex} className="space-y-3 text-xs">
            <div className="space-y-1">
              <Label className="text-xs">Asset Name / Title</Label>
              <Input
                value={capexTitle}
                onChange={(e) => setCapexTitle(e.target.value)}
                placeholder="e.g. Master Hydraulic Styling Chair"
                required
                className="h-8 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Amount (PKR)</Label>
                <Input
                  type="number"
                  value={capexAmount}
                  onChange={(e) => setCapexAmount(e.target.value)}
                  placeholder="70000"
                  required
                  className="h-8 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Purchase Date</Label>
                <Input
                  type="date"
                  value={capexDate}
                  onChange={(e) => setCapexDate(e.target.value)}
                  required
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Category</Label>
                <select
                  value={capexCategory}
                  onChange={(e: any) => setCapexCategory(e.target.value)}
                  className="w-full h-8 text-xs rounded-md border border-input bg-background px-2"
                >
                  <option value="Equipment">Equipment</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Renovation">Renovation</option>
                  <option value="Power/Generator">Power/Generator</option>
                  <option value="Tools">Tools</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Vendor / Supplier</Label>
                <Input
                  value={capexVendor}
                  onChange={(e) => setCapexVendor(e.target.value)}
                  placeholder="e.g. DHA Electronics"
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Notes / Warranty Details</Label>
              <Input
                value={capexNotes}
                onChange={(e) => setCapexNotes(e.target.value)}
                placeholder="e.g. 3 years motor warranty"
                className="h-8 text-xs"
              />
            </div>

            <DialogFooter>
              <Button type="submit" className="text-xs h-8 font-bold">
                Save CapEx Asset
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={isTargetSettingsOpen} onOpenChange={setIsTargetSettingsOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
          <DialogHeader>
            <DialogTitle>Configure Rent & Profit Target Engine</DialogTitle>
            <DialogDescription className="text-xs">
              Set fixed monthly operational liabilities to automatically evaluate daily targets.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <Label className="text-xs">Monthly Shop Rent (Rs.)</Label>
              <Input
                type="number"
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(Number(e.target.value))}
                placeholder="85000"
                className="h-8 text-xs font-mono"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Monthly Electricity & Utilities (Rs.)</Label>
              <Input
                type="number"
                value={monthlyUtilities}
                onChange={(e) => setMonthlyUtilities(Number(e.target.value))}
                placeholder="45000"
                className="h-8 text-xs font-mono"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Tea, Water & Misc Monthly Overheads (Rs.)</Label>
              <Input
                type="number"
                value={monthlyMiscFixed}
                onChange={(e) => setMonthlyMiscFixed(Number(e.target.value))}
                placeholder="20000"
                className="h-8 text-xs font-mono"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Target Monthly Profit (Rs.)</Label>
              <Input
                type="number"
                value={monthlyTargetProfit}
                onChange={(e) => setMonthlyTargetProfit(Number(e.target.value))}
                placeholder="150000"
                className="h-8 text-xs font-mono"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Operating Days per Month</Label>
              <Input
                type="number"
                value={operatingDays}
                onChange={(e) => setOperatingDays(Number(e.target.value))}
                placeholder="30"
                className="h-8 text-xs font-mono"
              />
            </div>

            <DialogFooter>
              <Button onClick={handleSaveTargets} className="text-xs h-8 font-bold">
                Save &amp; Lock Target Model
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Accounting Receipt-Style Breakdown & On-Demand Voucher Modal for Ledger */}
      {selectedInvoiceForReceipt && (
        <Dialog open={!!selectedInvoiceForReceipt} onOpenChange={(open) => !open && setSelectedInvoiceForReceipt(null)}>
          <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold">
                <Receipt className="w-4 h-4 text-primary" />
                Accounting Receipt & Service Breakdown
              </DialogTitle>
              <DialogDescription className="text-xs font-mono">
                Bill Reference: #{selectedInvoiceForReceipt.invoice_number}
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
                    {selectedInvoiceForReceipt.client_name} ({selectedInvoiceForReceipt.client_phone})
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
    </div>
  );
};
