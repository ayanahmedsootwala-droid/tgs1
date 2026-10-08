import React, { useState, useMemo } from 'react';
import { useSalon } from '@/contexts/SalonContext';
import type { StaffMember, Invoice } from '@/types/salon';
import { getLocalDateString, formatDateTime } from '@/utils/dateUtils';
import {
  Calculator,
  User,
  Calendar,
  Percent,
  Banknote,
  Printer,
  MessageCircle,
  FileText,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  Gift,
  AlertCircle,
  Award,
  Users,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

export const StaffCommissionCalculator: React.FC = () => {
  const {
    staff,
    invoices,
    currencyFormat,
    settings,
    role,
    calculateStaffPayout,
    sendWhatsAppMessage,
  } = useSalon();

  // Filters
  const [selectedStaffId, setSelectedStaffId] = useState<string>('all');
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month' | 'all'>('month');

  // Manual Adjustments per calculation
  const [bonusAmount, setBonusAmount] = useState<string>('0');
  const [deductionsAmount, setDeductionsAmount] = useState<string>('0');
  const [customRateOverride, setCustomRateOverride] = useState<string>(''); // Owner can override rate

  const todayStr = useMemo(() => getLocalDateString(), []);

  // Filtered Invoices in Range
  const periodInvoices = useMemo(() => {
    const now = new Date();
    return invoices.filter((inv) => {
      if (inv.status !== 'Completed') return false;
      if (timeframe === 'all') return true;

      const invDateStr = inv.created_at ? getLocalDateString(inv.created_at) : '';
      if (timeframe === 'today') {
        return invDateStr === todayStr;
      }
      if (timeframe === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        const weekAgoStr = getLocalDateString(weekAgo);
        return invDateStr >= weekAgoStr;
      }
      if (timeframe === 'month') {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthStartStr = getLocalDateString(monthStart);
        return invDateStr >= monthStartStr;
      }
      return true;
    });
  }, [invoices, timeframe, todayStr]);

  // Aggregate Stats by Staff
  const staffPayrollList = useMemo(() => {
    return staff.map((member) => {
      let serviceCount = 0;
      let totalServiceRevenue = 0;
      let calculatedCommission = 0;
      let tipsEarned = 0;

      // Extract all services attributed to this staff member
      for (const inv of periodInvoices) {
        if (inv.items) {
          const staffItems = inv.items.filter((it) => it.staff_id === member.id);
          for (const it of staffItems) {
            serviceCount += 1;
            totalServiceRevenue += it.price;
            // Check if owner custom rate override applies to this member
            if (customRateOverride && selectedStaffId === member.id && !isNaN(Number(customRateOverride))) {
              calculatedCommission += Math.round((it.price * Number(customRateOverride)) / 100);
            } else {
              calculatedCommission += it.commission_amount || 0;
            }
          }
        }
      }

      const payoutDetails = calculateStaffPayout(member, totalServiceRevenue);
      const effectiveCommission =
        customRateOverride && selectedStaffId === member.id && !isNaN(Number(customRateOverride))
          ? calculatedCommission
          : payoutDetails.commission || calculatedCommission;

      const baseSalary = member.pay_type === 'commission_only' ? 0 : Number(member.base_salary) || 0;
      const stationFee = Number(member.station_fee) || 0;

      const bonus = selectedStaffId === member.id ? Number(bonusAmount) || 0 : 0;
      const deductions = selectedStaffId === member.id ? Number(deductionsAmount) || 0 : 0;

      const netPayable = Math.max(
        0,
        baseSalary + effectiveCommission + tipsEarned + bonus - deductions - stationFee
      );

      return {
        member,
        serviceCount,
        totalServiceRevenue,
        baseSalary,
        commission: effectiveCommission,
        stationFee,
        tipsEarned,
        bonus,
        deductions,
        netPayable,
        modelDescription: payoutDetails.description,
      };
    });
  }, [
    staff,
    periodInvoices,
    calculateStaffPayout,
    customRateOverride,
    selectedStaffId,
    bonusAmount,
    deductionsAmount,
  ]);

  // Selected single staff details (if one selected)
  const selectedPayroll = useMemo(() => {
    if (selectedStaffId === 'all') return null;
    return staffPayrollList.find((s) => s.member.id === selectedStaffId) || null;
  }, [staffPayrollList, selectedStaffId]);

  // Overall Salon Payroll Total
  const totalPayrollLiability = useMemo(() => {
    return staffPayrollList.reduce((sum, s) => sum + s.netPayable, 0);
  }, [staffPayrollList]);

  const totalServicesDelivered = useMemo(() => {
    return staffPayrollList.reduce((sum, s) => sum + s.serviceCount, 0);
  }, [staffPayrollList]);

  const totalServiceSales = useMemo(() => {
    return staffPayrollList.reduce((sum, s) => sum + s.totalServiceRevenue, 0);
  }, [staffPayrollList]);

  // Print Payslip
  const handlePrintSlip = () => {
    window.print();
  };

  // Dispatch Pay Slip to Staff WhatsApp
  const handleSendWhatsAppSlip = (s: typeof staffPayrollList[0]) => {
    const slipText =
      settings.whatsapp_templates?.staff_commission_slip ||
      `✂️ *TGS Official Pay Slip*\nStylist: ${s.member.name}\nRole: ${s.member.role}\nPeriod: ${timeframe.toUpperCase()}\n\n• Services Completed: ${s.serviceCount}\n• Gross Service Revenue: Rs. ${s.totalServiceRevenue.toLocaleString()}\n• Base Salary: Rs. ${s.baseSalary.toLocaleString()}\n• Commission Earned: Rs. ${s.commission.toLocaleString()}\n• Performance Bonus: Rs. ${s.bonus.toLocaleString()}\n• Deductions/Station Fee: Rs. ${(s.deductions + s.stationFee).toLocaleString()}\n\n*Net Payable: Rs. ${s.netPayable.toLocaleString()}*\n\n_Generated by The Grooming Studio TGS POS_`;

    sendWhatsAppMessage(s.member.phone, slipText);
    toast.success(`WhatsApp pay slip opened for ${s.member.name}`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary" />
              Commission &amp; Staff Salary Calculator
            </h2>
            <Badge variant="outline" className="text-xs border-primary/30 text-primary">
              PKR Payroll Engine
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Audit barber commissions, chair rental shares, overtime tips, and net payouts with instant payslip generation.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Staff Filter */}
          <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
            <SelectTrigger className="w-44 h-9 text-xs rounded-xl bg-card border">
              <SelectValue placeholder="All Stylists & Barbers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">👥 All Staff Members</SelectItem>
              {staff.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name} ({m.role})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Timeframe Filter */}
          <Select value={timeframe} onValueChange={(v: any) => setTimeframe(v)}>
            <SelectTrigger className="w-32 h-9 text-xs rounded-xl bg-card border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">Past 7 Days</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="all">All-Time</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={handlePrintSlip}
            className="h-9 px-3 text-xs gap-1.5 rounded-xl border bg-card"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </Button>
        </div>
      </div>

      {/* Aggregate KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border shadow-none p-3.5">
          <div className="text-[11px] font-medium text-muted-foreground uppercase flex items-center justify-between">
            <span>Total Payroll Payable</span>
            <Banknote className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-600 mt-1">
            {currencyFormat(totalPayrollLiability)}
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Across {staffPayrollList.length} staff records ({timeframe})
          </p>
        </Card>

        <Card className="border shadow-none p-3.5">
          <div className="text-[11px] font-medium text-muted-foreground uppercase flex items-center justify-between">
            <span>Staff Service Revenue</span>
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <div className="text-xl font-bold text-foreground mt-1">
            {currencyFormat(totalServiceSales)}
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Gross service turnover generated
          </p>
        </Card>

        <Card className="border shadow-none p-3.5">
          <div className="text-[11px] font-medium text-muted-foreground uppercase flex items-center justify-between">
            <span>Total Services Done</span>
            <Award className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-blue-600 mt-1">
            {totalServicesDelivered} jobs
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Client appointments &amp; walk-ins
          </p>
        </Card>

        <Card className="border shadow-none p-3.5">
          <div className="text-[11px] font-medium text-muted-foreground uppercase flex items-center justify-between">
            <span>Effective Labor Ratio</span>
            <Percent className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl font-bold text-purple-600 mt-1">
            {totalServiceSales > 0 ? ((totalPayrollLiability / totalServiceSales) * 100).toFixed(1) : 0}%
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Payroll as % of service revenue
          </p>
        </Card>
      </div>

      {/* Single Staff Focused Calculator Card (When single staff selected) */}
      {selectedPayroll && (
        <Card className="border shadow-sm bg-gradient-to-br from-card to-muted/20 rounded-2xl">
          <CardHeader className="p-4 pb-2 border-b">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  Itemized Payroll Statement: {selectedPayroll.member.name}
                  <Badge variant="secondary" className="text-[10px] capitalize">
                    {selectedPayroll.member.role.replace('_', ' ')}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs">
                  CNIC: {selectedPayroll.member.cnic} • Contact: {selectedPayroll.member.phone} • Specialization: {selectedPayroll.member.specialization}
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => handleSendWhatsAppSlip(selectedPayroll)}
                  className="gap-1.5 h-8 px-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Send WhatsApp Slip</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handlePrintSlip}
                  className="gap-1.5 h-8 px-3 text-xs rounded-xl"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 space-y-4">
            {/* Owner Adjustment Inputs */}
            {role === 'owner' && (
              <div className="p-3 bg-muted/40 rounded-xl border border-border/60 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <Label className="text-[11px] font-semibold text-foreground">
                    Custom Commission % Override
                  </Label>
                  <Input
                    type="number"
                    placeholder={`Default: ${selectedPayroll.member.commission_rate}%`}
                    value={customRateOverride}
                    onChange={(e) => setCustomRateOverride(e.target.value)}
                    className="h-8 text-xs mt-1"
                  />
                  <span className="text-[10px] text-muted-foreground">Owner rate override</span>
                </div>

                <div>
                  <Label className="text-[11px] font-semibold text-foreground">
                    Performance Bonus (PKR)
                  </Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={bonusAmount}
                    onChange={(e) => setBonusAmount(e.target.value)}
                    className="h-8 text-xs mt-1"
                  />
                  <span className="text-[10px] text-muted-foreground">Festive or target bonus</span>
                </div>

                <div>
                  <Label className="text-[11px] font-semibold text-foreground">
                    Deductions / Product Cost (PKR)
                  </Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={deductionsAmount}
                    onChange={(e) => setDeductionsAmount(e.target.value)}
                    className="h-8 text-xs mt-1"
                  />
                  <span className="text-[10px] text-muted-foreground">Advance salary or damages</span>
                </div>
              </div>
            )}

            {/* Calculations Breakdown Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-card border rounded-xl">
                <span className="text-muted-foreground block text-[11px]">Base Salary</span>
                <span className="text-base font-bold text-foreground font-mono">
                  {currencyFormat(selectedPayroll.baseSalary)}
                </span>
                <span className="text-[10px] text-muted-foreground block capitalize mt-0.5">
                  {selectedPayroll.member.pay_type.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="p-3 bg-card border rounded-xl">
                <span className="text-muted-foreground block text-[11px]">Commission Earned</span>
                <span className="text-base font-bold text-emerald-600 font-mono">
                  {currencyFormat(selectedPayroll.commission)}
                </span>
                <span className="text-[10px] text-muted-foreground block mt-0.5">
                  From {selectedPayroll.serviceCount} services ({currencyFormat(selectedPayroll.totalServiceRevenue)})
                </span>
              </div>

              <div className="p-3 bg-card border rounded-xl">
                <span className="text-muted-foreground block text-[11px]">Adjustments &amp; Bonus</span>
                <span className="text-base font-bold text-amber-600 font-mono">
                  +{currencyFormat(selectedPayroll.bonus)} / -{currencyFormat(selectedPayroll.deductions + selectedPayroll.stationFee)}
                </span>
                <span className="text-[10px] text-muted-foreground block mt-0.5">
                  Bonus minus deductions
                </span>
              </div>

              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                <span className="text-emerald-700 dark:text-emerald-300 font-bold block text-[11px]">
                  Total Net Payable
                </span>
                <span className="text-xl font-bold text-emerald-700 dark:text-emerald-300 font-mono">
                  {currencyFormat(selectedPayroll.netPayable)}
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5">
                  Ready for disbursement
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Staff All-Members Detailed Payroll Roster Table */}
      <Card className="border shadow-none">
        <CardHeader className="p-4 pb-2 border-b">
          <CardTitle className="text-sm font-bold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Staff Commission &amp; Salary Ledger ({timeframe.toUpperCase()})
            </span>
            <span className="text-xs font-mono font-normal text-muted-foreground">
              {staffPayrollList.length} Active Stylists
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs divide-y divide-border/60">
              <thead className="bg-muted/50 text-muted-foreground font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Stylist / Barber</th>
                  <th className="py-2.5 px-3">Model</th>
                  <th className="py-2.5 px-3 text-right">Jobs Done</th>
                  <th className="py-2.5 px-3 text-right">Service Sales</th>
                  <th className="py-2.5 px-3 text-right">Base Pay</th>
                  <th className="py-2.5 px-3 text-right">Commission</th>
                  <th className="py-2.5 px-3 text-right font-bold text-emerald-600">Net Payable</th>
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {staffPayrollList.map((item) => (
                  <tr key={item.member.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-foreground">{item.member.name}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        {item.member.phone} • {item.member.role}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {item.member.pay_type.replace(/_/g, ' ')}
                      </Badge>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        {item.member.commission_rate}% rate
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-semibold">
                      {item.serviceCount}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-semibold">
                      {currencyFormat(item.totalServiceRevenue)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-muted-foreground">
                      {currencyFormat(item.baseSalary)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-emerald-600 font-semibold">
                      {currencyFormat(item.commission)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-sm text-emerald-700 dark:text-emerald-300">
                      {currencyFormat(item.netPayable)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedStaffId(item.member.id)}
                          className="h-7 px-2 text-[11px] gap-1 hover:bg-primary/10 hover:text-primary"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Audit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSendWhatsAppSlip(item)}
                          className="h-7 px-2 text-[11px] text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </Button>
                      </div>
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
