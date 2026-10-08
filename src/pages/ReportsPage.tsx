import React, { useState, useMemo } from 'react';
import { useSalon } from '@/contexts/SalonContext';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Receipt,
  Users,
  Calendar,
  Download,
  Scissors,
  CreditCard,
  Percent,
  CheckCircle2,
  PieChart,
  Clock,
  Flame,
  Activity,
  ArrowUpRight,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

export const ReportsPage: React.FC = () => {
  const { invoices, expenses, staff, services, currencyFormat, settings, role } = useSalon();

  const [timeRange, setTimeRange] = useState<'all' | 'month' | 'week' | 'today'>('all');

  // Filter items by time range
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      if (inv.status !== 'Completed') return false;
      if (timeRange === 'all') return true;

      const invDate = new Date(inv.created_at);
      if (timeRange === 'today') {
        return inv.created_at.startsWith(todayStr);
      }
      if (timeRange === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return invDate >= weekAgo;
      }
      if (timeRange === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return invDate >= monthAgo;
      }
      return true;
    });
  }, [invoices, timeRange, todayStr]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      if (timeRange === 'all') return true;
      if (timeRange === 'today') return exp.expense_date === todayStr;

      const expDate = new Date(exp.expense_date);
      if (timeRange === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return expDate >= weekAgo;
      }
      if (timeRange === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return expDate >= monthAgo;
      }
      return true;
    });
  }, [expenses, timeRange, todayStr]);

  // Aggregate Metrics
  const grossRevenue = useMemo(() => {
    return filteredInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);
  }, [filteredInvoices]);

  const totalExpenses = useMemo(() => {
    return filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  }, [filteredExpenses]);

  // Staff commissions for this period
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

  // Net Profit
  const netProfit = grossRevenue - totalExpenses - totalCommissions;

  // Payment Breakdown
  const paymentBreakdown = useMemo(() => {
    let cash = 0;
    let card = 0;
    let online = 0;

    for (const inv of filteredInvoices) {
      if (inv.payment_method === 'Cash') cash += inv.total_amount;
      else if (inv.payment_method === 'Card') card += inv.total_amount;
      else if (inv.payment_method === 'Online Transfer') online += inv.total_amount;
      else if (inv.payment_method === 'Split' && inv.split_details) {
        for (const sp of inv.split_details) {
          if (sp.method === 'Cash') cash += sp.amount;
          else if (sp.method === 'Card') card += sp.amount;
          else if (sp.method === 'Online Transfer') online += sp.amount;
        }
      }
    }

    return { cash, card, online };
  }, [filteredInvoices]);

  // Top Selling Services
  const topServices = useMemo(() => {
    const map: Record<string, { name: string; count: number; revenue: number }> = {};
    for (const inv of filteredInvoices) {
      if (inv.items) {
        for (const item of inv.items) {
          if (!map[item.service_name]) {
            map[item.service_name] = { name: item.service_name, count: 0, revenue: 0 };
          }
          map[item.service_name].count += 1;
          map[item.service_name].revenue += item.price;
        }
      }
    }
    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [filteredInvoices]);

  // Staff Performance Ranking
  const staffLeaderboard = useMemo(() => {
    const map: Record<
      string,
      { id: string; name: string; servicesDone: number; revenue: number; commission: number }
    > = {};

    for (const s of staff) {
      map[s.id] = { id: s.id, name: s.name, servicesDone: 0, revenue: 0, commission: 0 };
    }

    for (const inv of filteredInvoices) {
      if (inv.items) {
        for (const item of inv.items) {
          if (item.staff_id && map[item.staff_id]) {
            map[item.staff_id].servicesDone += 1;
            map[item.staff_id].revenue += item.price;
            map[item.staff_id].commission += item.commission_amount;
          }
        }
      }
    }

    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [staff, filteredInvoices]);

  // Hourly Peak Times Heatmap (10:00 AM to 11:00 PM)
  const hourlyData = useMemo(() => {
    const hoursMap: Record<number, { hour: number; label: string; count: number; revenue: number }> = {};
    for (let h = 10; h <= 23; h++) {
      const ampm = h >= 12 ? 'PM' : 'AM';
      const displayHour = h > 12 ? h - 12 : h;
      hoursMap[h] = { hour: h, label: `${displayHour} ${ampm}`, count: 0, revenue: 0 };
    }

    for (const inv of filteredInvoices) {
      const date = new Date(inv.created_at);
      const h = date.getHours();
      if (hoursMap[h]) {
        hoursMap[h].count += 1;
        hoursMap[h].revenue += inv.total_amount;
      }
    }

    const list = Object.values(hoursMap);
    const maxCount = Math.max(...list.map((h) => h.count), 1);
    const peakHour = [...list].sort((a, b) => b.count - a.count)[0];
    return { list, maxCount, peakHour };
  }, [filteredInvoices]);

  // Customer Retention & Repeat Visits
  const retentionTrends = useMemo(() => {
    let repeatClientsCount = 0;
    let newClientsCount = 0;
    const clientVisitMap: Record<string, number> = {};

    for (const inv of filteredInvoices) {
      if (inv.client_phone && inv.client_phone !== 'N/A' && inv.client_phone !== '03000000000') {
        clientVisitMap[inv.client_phone] = (clientVisitMap[inv.client_phone] || 0) + 1;
      }
    }

    const uniqueClients = Object.keys(clientVisitMap).length;
    for (const phone in clientVisitMap) {
      if (clientVisitMap[phone] > 1) {
        repeatClientsCount += 1;
      } else {
        newClientsCount += 1;
      }
    }

    const repeatRate = uniqueClients > 0 ? Math.round((repeatClientsCount / uniqueClients) * 100) : 0;
    return { uniqueClients, repeatClientsCount, newClientsCount, repeatRate };
  }, [filteredInvoices]);

  // Category Profit Margin Analysis
  const categoryMargins = useMemo(() => {
    const map: Record<string, { category: string; count: number; revenue: number; estCostPct: number }> = {
      'Hair & Styling': { category: 'Hair & Styling', count: 0, revenue: 0, estCostPct: 10 },
      'Beard Grooming': { category: 'Beard Grooming', count: 0, revenue: 0, estCostPct: 12 },
      'Skin & Facials': { category: 'Skin & Facials', count: 0, revenue: 0, estCostPct: 22 },
      'Spa & Treatments': { category: 'Spa & Treatments', count: 0, revenue: 0, estCostPct: 18 },
      'Grooming Packages': { category: 'Grooming Packages', count: 0, revenue: 0, estCostPct: 15 },
    };

    for (const inv of filteredInvoices) {
      if (inv.items) {
        for (const it of inv.items) {
          const cat = it.category || 'Hair & Styling';
          if (!map[cat]) {
            map[cat] = { category: cat, count: 0, revenue: 0, estCostPct: 15 };
          }
          map[cat].count += 1;
          map[cat].revenue += it.price;
        }
      }
    }

    return Object.values(map)
      .map((c) => {
        const estConsumables = Math.round(c.revenue * (c.estCostPct / 100));
        const estCommissions = Math.round(c.revenue * 0.35); // average 35% commission
        const grossMargin = c.revenue - estConsumables - estCommissions;
        const marginPct = c.revenue > 0 ? Math.round((grossMargin / c.revenue) * 100) : 0;
        return {
          ...c,
          estConsumables,
          estCommissions,
          grossMargin,
          marginPct,
        };
      })
      .sort((a, b) => b.revenue - a.revenue);
  }, [filteredInvoices]);

  // Day of Week Footfall & Revenue Distribution
  const dayOfWeekStats = useMemo(() => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const map: Record<string, { day: string; count: number; revenue: number }> = {};
    days.forEach((d) => {
      map[d] = { day: d, count: 0, revenue: 0 };
    });

    for (const inv of filteredInvoices) {
      const d = new Date(inv.created_at);
      const dayIndex = d.getDay();
      // map Sunday (0) to index 6, Monday (1) to index 0
      const remappedName = dayIndex === 0 ? 'Sunday' : days[dayIndex - 1];
      if (map[remappedName]) {
        map[remappedName].count += 1;
        map[remappedName].revenue += inv.total_amount;
      }
    }

    const list = days.map((d) => map[d]);
    const maxCount = Math.max(...list.map((d) => d.count), 1);
    const busiestDay = [...list].sort((a, b) => b.revenue - a.revenue)[0];
    return { list, maxCount, busiestDay };
  }, [filteredInvoices]);

  // Executive Velocity Metrics
  const velocityMetrics = useMemo(() => {
    const billCount = filteredInvoices.length;
    const aov = billCount > 0 ? Math.round(grossRevenue / billCount) : 0;
    let totalItems = 0;
    filteredInvoices.forEach((i) => {
      totalItems += i.items?.length || 1;
    });
    const itemsPerBill = billCount > 0 ? (totalItems / billCount).toFixed(1) : '1.0';

    return {
      aov,
      itemsPerBill,
      billCount,
    };
  }, [filteredInvoices, grossRevenue]);

  // Export CSV
  const handleExportCSV = () => {
    const rows = [
      ['Invoice #', 'Date', 'Client', 'Phone', 'Payment Method', 'Subtotal', 'Tax', 'Tip', 'Total'],
      ...filteredInvoices.map((inv) => [
        inv.invoice_number,
        new Date(inv.created_at).toISOString().split('T')[0],
        `"${inv.client_name}"`,
        inv.client_phone,
        inv.payment_method,
        inv.subtotal,
        inv.tax_amount,
        inv.tip_amount,
        inv.total_amount,
      ]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TGS_Sales_Report_${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Sales report exported successfully');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Executive Reports & Analytics
          </h2>
          <p className="text-xs text-muted-foreground">
            Revenue trends, salon net profitability, staff leaderboards, and payment distribution
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={(v: any) => setTimeRange(v)}>
            <SelectTrigger className="w-36 h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All-Time</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
              <SelectItem value="week">Past 7 Days</SelectItem>
              <SelectItem value="today">Today Only</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={handleExportCSV} className="text-xs gap-1.5">
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* P&L Executive Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="flat-surface p-3.5">
          <span className="text-[11px] font-medium text-muted-foreground uppercase">
            Gross Salon Sales
          </span>
          <p className="text-xl font-bold tracking-tight text-foreground mt-1">
            {currencyFormat(grossRevenue)}
          </p>
          <span className="text-[10px] text-muted-foreground">
            {filteredInvoices.length} paid invoices
          </span>
        </Card>

        <Card className="flat-surface p-3.5">
          <span className="text-[11px] font-medium text-muted-foreground uppercase">
            Average Ticket (AOV)
          </span>
          <p className="text-xl font-bold tracking-tight text-primary mt-1">
            {currencyFormat(velocityMetrics.aov)}
          </p>
          <span className="text-[10px] text-muted-foreground">
            {velocityMetrics.itemsPerBill} services per guest
          </span>
        </Card>

        <Card className="flat-surface p-3.5">
          <span className="text-[11px] font-medium text-muted-foreground uppercase">
            Operating Expenses
          </span>
          <p className="text-xl font-bold tracking-tight text-destructive mt-1">
            -{currencyFormat(totalExpenses)}
          </p>
          <span className="text-[10px] text-muted-foreground">
            {filteredExpenses.length} expense entries
          </span>
        </Card>

        <Card className="flat-surface p-3.5">
          <span className="text-[11px] font-medium text-muted-foreground uppercase">
            Staff Commissions
          </span>
          <p className="text-xl font-bold tracking-tight text-muted-foreground mt-1">
            -{currencyFormat(totalCommissions)}
          </p>
          <span className="text-[10px] text-muted-foreground">Accrued to barbers</span>
        </Card>

        <Card className="flat-surface p-3.5">
          <span className="text-[11px] font-medium text-muted-foreground uppercase">
            Estimated Net Profit
          </span>
          <p
            className={`text-xl font-bold tracking-tight mt-1 ${
              netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive'
            }`}
          >
            {currencyFormat(netProfit)}
          </p>
          <span className="text-[10px] text-muted-foreground">Sales - Overheads - Comm.</span>
        </Card>
      </div>

      {/* Second Row: Payment Breakdown & Staff Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Payment Method Breakdown */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="flat-surface">
            <CardHeader className="p-4 pb-2 border-b border-border">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Payment Method Revenue Share
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Cash Payments:</span>
                  <span className="font-mono font-bold text-foreground">
                    {currencyFormat(paymentBreakdown.cash)}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-foreground h-full rounded-full transition-all"
                    style={{
                      width: `${
                        grossRevenue > 0 ? (paymentBreakdown.cash / grossRevenue) * 100 : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Card / POS Terminal:</span>
                  <span className="font-mono font-bold text-foreground">
                    {currencyFormat(paymentBreakdown.card)}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-foreground/70 h-full rounded-full transition-all"
                    style={{
                      width: `${
                        grossRevenue > 0 ? (paymentBreakdown.card / grossRevenue) * 100 : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Online Transfer / UPI:</span>
                  <span className="font-mono font-bold text-foreground">
                    {currencyFormat(paymentBreakdown.online)}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-foreground/40 h-full rounded-full transition-all"
                    style={{
                      width: `${
                        grossRevenue > 0 ? (paymentBreakdown.online / grossRevenue) * 100 : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-border flex justify-between font-bold text-sm text-foreground">
                <span>Total Collected:</span>
                <span className="font-mono">{currencyFormat(grossRevenue)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Top Selling Services List */}
          <Card className="flat-surface">
            <CardHeader className="p-4 pb-2 border-b border-border">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
                <Scissors className="w-4 h-4" />
                Top-Selling Grooming Services
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {topServices.slice(0, 5).map((svc, i) => (
                  <div key={i} className="p-3 text-xs flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center font-bold text-[10px] text-muted-foreground">
                        {i + 1}
                      </span>
                      <div>
                        <p className="font-semibold text-foreground">{svc.name}</p>
                        <p className="text-[11px] text-muted-foreground">{svc.count} ordered</p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-foreground">
                      {currencyFormat(svc.revenue)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (7 cols): Staff Leaderboard Table */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="flat-surface">
            <CardHeader className="p-4 pb-2 border-b border-border flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4" />
                Staff Performance Leaderboard
              </CardTitle>
              <Badge variant="outline" className="text-[10px]">
                Sorted by Revenue
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/40 border-b border-border text-muted-foreground font-semibold">
                    <tr>
                      <th className="py-3 px-4">Rank & Barber</th>
                      <th className="py-3 px-4 text-center">Services Done</th>
                      <th className="py-3 px-4 text-right">Gross Sales</th>
                      <th className="py-3 px-4 text-right">Commission</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {staffLeaderboard.map((member, idx) => (
                      <tr key={member.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-muted-foreground w-4">
                              #{idx + 1}
                            </span>
                            <span className="font-semibold text-foreground">{member.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-medium">
                          {member.servicesDone}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-foreground">
                          {currencyFormat(member.revenue)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-medium text-foreground">
                          {currencyFormat(member.commission)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Row 3: Hourly Peak Heatmap & Repeat Customer Retention Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Peak Hours Hourly Heatmap (7 cols) */}
        <div className="lg:col-span-7">
          <Card className="flat-surface">
            <CardHeader className="p-4 pb-2 border-b border-border flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-500" />
                  Peak Hours &amp; Customer Footfall Heatmap
                </CardTitle>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Hourly client arrivals from 10:00 AM to 11:00 PM
                </p>
              </div>
              {hourlyData.peakHour && (
                <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-700 bg-amber-50/50">
                  Peak: {hourlyData.peakHour.label} ({hourlyData.peakHour.count} visits)
                </Badge>
              )}
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-7 sm:grid-cols-14 gap-1.5 items-end h-32 pt-4">
                {hourlyData.list.map((h) => {
                  const pct = Math.max(8, Math.round((h.count / hourlyData.maxCount) * 100));
                  const isHigh = h.count >= hourlyData.maxCount * 0.7 && h.count > 0;
                  return (
                    <div key={h.hour} className="flex flex-col items-center justify-end h-full gap-1 group">
                      <div className="text-[9px] font-mono text-muted-foreground font-semibold group-hover:text-foreground">
                        {h.count > 0 ? h.count : ''}
                      </div>
                      <div
                        className={`w-full rounded-t transition-all ${
                          isHigh
                            ? 'bg-amber-500 hover:bg-amber-600'
                            : h.count > 0
                            ? 'bg-primary/80 hover:bg-primary'
                            : 'bg-muted/40'
                        }`}
                        style={{ height: `${pct}%` }}
                        title={`${h.label}: ${h.count} bills (${currencyFormat(h.revenue)})`}
                      />
                      <span className="text-[9px] text-muted-foreground font-mono truncate w-full text-center">
                        {h.label.split(' ')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Salon Opens: 10:00 AM</span>
                <span className="font-medium text-foreground">Peak rush hours: 5:00 PM – 9:00 PM</span>
                <span>Day Closes: 11:00 PM</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer Retention & Repeat Ratio (5 cols) */}
        <div className="lg:col-span-5">
          <Card className="flat-surface h-full flex flex-col">
            <CardHeader className="p-4 pb-2 border-b border-border">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                Customer Loyalty &amp; Retention Curve
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-card border rounded-xl">
                  <span className="text-muted-foreground block text-[11px]">Repeat Guest Ratio</span>
                  <span className="text-2xl font-bold text-foreground font-mono mt-0.5 block">
                    {retentionTrends.repeatRate}%
                  </span>
                  <span className="text-[10px] text-emerald-600 mt-0.5 block">
                    {retentionTrends.repeatClientsCount} returning clients
                  </span>
                </div>

                <div className="p-3 bg-card border rounded-xl">
                  <span className="text-muted-foreground block text-[11px]">New Client Acquisition</span>
                  <span className="text-2xl font-bold text-primary font-mono mt-0.5 block">
                    {100 - retentionTrends.repeatRate}%
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-0.5 block">
                    {retentionTrends.newClientsCount} first-time guests
                  </span>
                </div>
              </div>

              {/* Progress visual bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span>Client Retention Index</span>
                  <span className="text-emerald-600 font-mono">{retentionTrends.repeatRate}% Loyal</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3 overflow-hidden flex">
                  <div
                    className="bg-emerald-600 h-full transition-all"
                    style={{ width: `${retentionTrends.repeatRate}%` }}
                    title={`Repeat: ${retentionTrends.repeatRate}%`}
                  />
                  <div
                    className="bg-primary/50 h-full transition-all"
                    style={{ width: `${100 - retentionTrends.repeatRate}%` }}
                    title={`New: ${100 - retentionTrends.repeatRate}%`}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>● Returning Clients ({retentionTrends.repeatClientsCount})</span>
                  <span>● First-time Clients ({retentionTrends.newClientsCount})</span>
                </div>
              </div>

              <div className="p-2.5 bg-muted/40 rounded-xl border text-[11px] text-muted-foreground">
                💡 <strong>Retention Insight:</strong> Salons with &gt;45% repeat rates maintain 3.2x higher owner profit margins without excessive paid ads.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Row 4: Service Category Profit Margins Table */}
      <Card className="flat-surface">
        <CardHeader className="p-4 pb-2 border-b border-border flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              Service Category Profit Margin &amp; Consumables Breakdown
            </CardTitle>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Gross margin after product cost and barber commission by department
            </p>
          </div>
          <Badge variant="outline" className="text-[10px]">
            Unit Economics
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border text-muted-foreground font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Service Category</th>
                  <th className="py-2.5 px-4 text-center">Volume</th>
                  <th className="py-2.5 px-4 text-right">Revenue</th>
                  <th className="py-2.5 px-4 text-right">Est. Consumables</th>
                  <th className="py-2.5 px-4 text-right">Stylist Commission</th>
                  <th className="py-2.5 px-4 text-right">Gross Profit</th>
                  <th className="py-2.5 px-4 text-right font-bold">Margin %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {categoryMargins.map((cat) => (
                  <tr key={cat.category} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4 font-semibold text-foreground">
                      {cat.category}
                    </td>
                    <td className="py-3 px-4 text-center font-mono">
                      {cat.count}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-foreground">
                      {currencyFormat(cat.revenue)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-muted-foreground">
                      -{currencyFormat(cat.estConsumables)} ({cat.estCostPct}%)
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-muted-foreground">
                      -{currencyFormat(cat.estCommissions)} (35%)
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">
                      {currencyFormat(cat.grossMargin)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold">
                      <Badge
                        variant={cat.marginPct >= 50 ? 'default' : 'secondary'}
                        className="text-[10px]"
                      >
                        {cat.marginPct}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
