import React, { useState, useMemo } from 'react';
import { useSalon } from '@/contexts/SalonContext';
import { StaffAttendanceRecord, AttendanceStatus, StaffMember, LatePenaltyRuleConfig } from '@/types/salon';
import {
  Clock,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  DollarSign,
  Calculator,
  Plus,
  Trash2,
  Edit2,
  FileSpreadsheet,
  MessageCircle,
  TrendingDown,
  ShieldAlert,
  ChevronRight,
  Sparkles,
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
import { toast } from 'sonner';

export const StaffAttendancePage: React.FC = () => {
  const {
    role,
    staff,
    attendanceRecords,
    clockInStaff,
    clockOutStaff,
    logStaffAttendance,
    updateStaffAttendance,
    deleteStaffAttendance,
    toggleAttendanceWaiver,
    updateLatePenaltyConfig,
    latePenaltyConfig,
    calculateMonthlyAttendanceSalary,
    currencyFormat,
    sendWhatsAppMessage,
    settings,
  } = useSalon();

  const [activeTab, setActiveTab] = useState<'roster' | 'logs' | 'calculator'>('roster');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [staffFilter, setStaffFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Manual Attendance Modal
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState<StaffAttendanceRecord | null>(null);
  const [formStaffId, setFormStaffId] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formClockIn, setFormClockIn] = useState('10:30');
  const [formClockOut, setFormClockOut] = useState('21:30');
  const [formStatus, setFormStatus] = useState<AttendanceStatus>('Present');
  const [formLateMinutes, setFormLateMinutes] = useState(0);
  const [formOvertimeHours, setFormOvertimeHours] = useState(0);
  const [formNotes, setFormNotes] = useState('');
  const [formIsPaidOff, setFormIsPaidOff] = useState(false);
  const [formWaivedReason, setFormWaivedReason] = useState('');

  // Owner Late Penalty Configuration Modal
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [ruleGraceMins, setRuleGraceMins] = useState(latePenaltyConfig?.grace_period_minutes ?? 15);
  const [ruleMode, setRuleMode] = useState(latePenaltyConfig?.penalty_mode ?? 'per_minute');
  const [ruleRatePerMin, setRuleRatePerMin] = useState(latePenaltyConfig?.penalty_rate_per_minute ?? 20);
  const [ruleFlatPenalty, setRuleFlatPenalty] = useState(latePenaltyConfig?.flat_penalty_per_late ?? 250);
  const [ruleThresholdMins, setRuleThresholdMins] = useState(latePenaltyConfig?.threshold_minutes_for_half_day ?? 45);

  // Today's attendance mapping
  const todayStr = new Date().toISOString().split('T')[0];

  const todayStaffStatus = useMemo(() => {
    return staff.map((s) => {
      const rec = attendanceRecords.find(
        (a) => a.staff_id === s.id && a.attendance_date === todayStr
      );
      return {
        staff: s,
        record: rec || null,
        isClockedIn: Boolean(rec && rec.clock_in && !rec.clock_out),
        isClockedOut: Boolean(rec && rec.clock_out),
      };
    });
  }, [staff, attendanceRecords, todayStr]);

  // Filtered log table
  const filteredLogs = useMemo(() => {
    return attendanceRecords.filter((rec) => {
      const matchStaff = staffFilter === 'all' || rec.staff_id === staffFilter;
      const matchStatus = statusFilter === 'all' || rec.status === statusFilter;
      const matchDate = !selectedDate || rec.attendance_date === selectedDate;
      return matchStaff && matchStatus && matchDate;
    });
  }, [attendanceRecords, staffFilter, statusFilter, selectedDate]);

  // Monthly Attendance Payroll Calculation
  const monthlyCalculations = useMemo(() => {
    return staff.map((s) => calculateMonthlyAttendanceSalary(s, selectedMonth));
  }, [staff, selectedMonth, calculateMonthlyAttendanceSalary]);

  const totalMonthlyPayroll = useMemo(() => {
    return monthlyCalculations.reduce((sum, item) => sum + item.netPayout, 0);
  }, [monthlyCalculations]);

  const handleOpenNewAttendance = () => {
    if (role !== 'owner') {
      toast.error('Security Restriction: Manual attendance logging is restricted to the Salon Owner only.');
      return;
    }
    setEditingAttendance(null);
    setFormStaffId(staff[0]?.id || '');
    setFormDate(todayStr);
    setFormClockIn('10:30');
    setFormClockOut('21:30');
    setFormStatus('Present');
    setFormLateMinutes(0);
    setFormOvertimeHours(0);
    setFormNotes('');
    setFormIsPaidOff(false);
    setFormWaivedReason('');
    setIsLogModalOpen(true);
  };

  const handleOpenEditAttendance = (rec: StaffAttendanceRecord) => {
    if (role !== 'owner') {
      toast.error('Security Restriction: Manual attendance editing is restricted to the Salon Owner only.');
      return;
    }
    setEditingAttendance(rec);
    setFormStaffId(rec.staff_id);
    setFormDate(rec.attendance_date);
    setFormClockIn(rec.clock_in || '10:30');
    setFormClockOut(rec.clock_out || '21:30');
    setFormStatus(rec.status);
    setFormLateMinutes(rec.late_minutes || 0);
    setFormOvertimeHours(rec.overtime_hours || 0);
    setFormNotes(rec.notes || '');
    setFormIsPaidOff(Boolean(rec.is_paid_off));
    setFormWaivedReason(rec.waived_reason || '');
    setIsLogModalOpen(true);
  };

  const handleSubmitAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (role !== 'owner') {
      toast.error('Security Restriction: Only the Salon Owner can save manual attendance edits.');
      return;
    }

    const targetStaff = staff.find((s) => s.id === formStaffId);
    if (!targetStaff) {
      toast.error('Select a staff member');
      return;
    }

    if (editingAttendance) {
      await updateStaffAttendance(editingAttendance.id, {
        staff_id: targetStaff.id,
        staff_name: targetStaff.name,
        attendance_date: formDate,
        clock_in: formStatus === 'Absent' ? null : formClockIn,
        clock_out: formStatus === 'Absent' ? null : formClockOut,
        status: formStatus,
        late_minutes: Number(formLateMinutes) || 0,
        overtime_hours: Number(formOvertimeHours) || 0,
        is_paid_off: formIsPaidOff,
        waived_by: formIsPaidOff ? 'Owner' : null,
        waived_reason: formIsPaidOff ? (formWaivedReason || 'Waived by Owner') : null,
        notes: formNotes || undefined,
      });
    } else {
      await logStaffAttendance({
        staff_id: targetStaff.id,
        staff_name: targetStaff.name,
        attendance_date: formDate,
        clock_in: formStatus === 'Absent' ? null : formClockIn,
        clock_out: formStatus === 'Absent' ? null : formClockOut,
        status: formStatus,
        late_minutes: Number(formLateMinutes) || 0,
        overtime_hours: Number(formOvertimeHours) || 0,
        is_paid_off: formIsPaidOff,
        waived_by: formIsPaidOff ? 'Owner' : null,
        waived_reason: formIsPaidOff ? (formWaivedReason || 'Waived by Owner') : null,
        notes: formNotes || undefined,
      });
    }

    setIsLogModalOpen(false);
  };

  const handleSaveLateRules = async (e: React.FormEvent) => {
    e.preventDefault();
    if (role !== 'owner') {
      toast.error('Only the Salon Owner can change payroll late penalty rules.');
      return;
    }

    await updateLatePenaltyConfig({
      grace_period_minutes: Number(ruleGraceMins) || 0,
      penalty_mode: ruleMode,
      penalty_rate_per_minute: Number(ruleRatePerMin) || 0,
      flat_penalty_per_late: Number(ruleFlatPenalty) || 0,
      threshold_minutes_for_half_day: Number(ruleThresholdMins) || 45,
    });
    setIsRuleModalOpen(false);
  };

  const handleSendWhatsAppSlip = (calc: ReturnType<typeof calculateMonthlyAttendanceSalary>) => {
    const target = staff.find((s) => s.id === calc.staffId);
    if (!target || !target.phone) {
      toast.error('No valid phone number for this staff member');
      return;
    }

    const text = `💈 *${settings.salon_name || 'The Grooming Studio TGS'} — Attendance & Salary Slip*
Month: ${selectedMonth}
Stylist: ${calc.staffName}
Pay Type: ${calc.payType.replace(/_/g, ' ').toUpperCase()}

📅 *Attendance Summary (26 Days Std):*
• Days Present: ${calc.daysPresent}
• Days Late: ${calc.daysLate} (Penalty: Rs. ${calc.latePenaltyDeduction})
• Days Absent: ${calc.daysAbsent}
• Adjusted Base Salary: Rs. ${calc.attendanceAdjustedBase.toLocaleString()}

✂️ *Commissions & Revenue:*
• Commissions / Share: Rs. ${(calc.commissionEarned + calc.chairShare).toLocaleString()}
${calc.stationFee ? `• Station Chair Fee Deducted: Rs. ${calc.stationFee.toLocaleString()}` : ''}

*NET PAYOUT: Rs. ${calc.netPayout.toLocaleString()}*
_Calculated & approved by Salon Management._`;

    sendWhatsAppMessage(target.phone, text);
    toast.success(`Launching WhatsApp slip for ${target.name}...`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 sm:p-6 rounded-2xl border border-border shadow-sm">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              Staff Attendance &amp; Auto Salary
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
            Live clock-in terminal, late arrival tracking, and automatic attendance-adjusted payroll calculation with WhatsApp slips.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {role === 'owner' ? (
            <Button onClick={handleOpenNewAttendance} className="gap-2 rounded-xl font-bold shadow-md shadow-primary/20">
              <Plus className="w-4 h-4" /> Log Attendance (Owner)
            </Button>
          ) : (
            <Badge variant="outline" className="text-xs text-muted-foreground border-muted-foreground/30 py-1.5 px-3">
              Manual Edit: Owner Only
            </Badge>
          )}
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="flex items-center gap-2 border-b pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('roster')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'roster'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-muted/60 text-muted-foreground hover:text-foreground'
          }`}
        >
          <Clock className="w-3.5 h-3.5" /> Today&apos;s Live Terminal
        </button>
        <button
          onClick={() => setActiveTab('calculator')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'calculator'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-muted/60 text-muted-foreground hover:text-foreground'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" /> Auto Salary Calculator
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'logs'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-muted/60 text-muted-foreground hover:text-foreground'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" /> Attendance History
        </button>
      </div>

      {/* TAB 1: Today's Live Clock-In Terminal */}
      {activeTab === 'roster' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Today: {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
            <Badge variant="outline" className="text-[11px] font-mono">
              Staff Active: {todayStaffStatus.filter((s) => s.isClockedIn).length}/{staff.length}
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {todayStaffStatus.map(({ staff: s, record: rec, isClockedIn, isClockedOut }) => (
              <Card key={s.id} className="relative overflow-hidden border-border/80 bg-card hover:border-primary/50 transition-all flex flex-col justify-between">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                        {s.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-sm text-foreground truncate">{s.name}</h3>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.role}</p>
                      </div>
                    </div>

                    <Badge
                      variant={
                        isClockedIn
                          ? rec?.status === 'Late'
                            ? 'destructive'
                            : 'default'
                          : isClockedOut
                          ? 'secondary'
                          : 'outline'
                      }
                      className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase"
                    >
                      {isClockedIn
                        ? rec?.status === 'Late'
                          ? `Late (${rec.late_minutes}m)`
                          : 'On Duty'
                        : isClockedOut
                        ? 'Completed'
                        : 'Not Checked In'}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-4 pt-2 space-y-3">
                  <div className="bg-muted/40 p-2.5 rounded-xl space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Clock In:</span>
                      <span className="font-semibold">{rec?.clock_in || '— : —'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Clock Out:</span>
                      <span className="font-semibold">{rec?.clock_out || '— : —'}</span>
                    </div>
                    {rec?.late_minutes ? (
                      <div className="flex justify-between text-destructive">
                        <span>Late Arrival:</span>
                        <span className="font-bold">{rec.late_minutes} mins</span>
                      </div>
                    ) : null}
                    {rec?.overtime_hours ? (
                      <div className="flex justify-between text-emerald-600">
                        <span>Overtime:</span>
                        <span className="font-bold">+{rec.overtime_hours} hrs</span>
                      </div>
                    ) : null}
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Button
                      size="sm"
                      variant={isClockedIn ? 'secondary' : 'default'}
                      disabled={isClockedIn || isClockedOut}
                      onClick={() => clockInStaff(s.id, s.name)}
                      className="rounded-xl text-xs font-bold"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      {isClockedIn ? 'Clocked In' : 'Clock In'}
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!isClockedIn || isClockedOut}
                      onClick={() => clockOutStaff(s.id)}
                      className="rounded-xl text-xs font-bold"
                    >
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      {isClockedOut ? 'Clocked Out' : 'Clock Out'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Auto Salary & Attendance-Adjusted Payroll Calculator */}
      {activeTab === 'calculator' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-4 rounded-2xl border">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Calculator className="w-4 h-4 text-primary" /> Monthly Auto-Payroll Engine
              </h3>
              <p className="text-xs text-muted-foreground">
                Working all days of the month (no standard day off). Base daily wage = Base Salary ÷ days in that month ({new Date(parseInt(selectedMonth.split('-')[0]), parseInt(selectedMonth.split('-')[1]), 0).getDate()} days in {selectedMonth}). Owner-customizable late rules and penalty waivers.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {role === 'owner' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setRuleGraceMins(latePenaltyConfig?.grace_period_minutes ?? 15);
                    setRuleMode(latePenaltyConfig?.penalty_mode ?? 'per_minute');
                    setRuleRatePerMin(latePenaltyConfig?.penalty_rate_per_minute ?? 20);
                    setRuleFlatPenalty(latePenaltyConfig?.flat_penalty_per_late ?? 250);
                    setRuleThresholdMins(latePenaltyConfig?.threshold_minutes_for_half_day ?? 45);
                    setIsRuleModalOpen(true);
                  }}
                  className="h-9 text-xs rounded-xl border-amber-500/40 text-amber-700 bg-amber-50/60 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 gap-1.5 font-bold"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Late Penalty Rules (Owner)</span>
                </Button>
              )}

              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-muted-foreground">Month:</label>
                <Input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-36 h-9 text-xs rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Aggregate Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Card className="p-4 bg-primary/5 border-primary/20">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Total Net Payroll ({selectedMonth})
              </span>
              <div className="text-xl sm:text-2xl font-black text-primary mt-1">
                {currencyFormat(totalMonthlyPayroll)}
              </div>
            </Card>

            <Card className="p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Staff Members Included
              </span>
              <div className="text-xl sm:text-2xl font-black text-foreground mt-1">
                {monthlyCalculations.length} Stylists
              </div>
            </Card>

            <Card className="p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Total Late Penalties Deducted
              </span>
              <div className="text-xl sm:text-2xl font-black text-destructive mt-1">
                {currencyFormat(
                  monthlyCalculations.reduce((sum, c) => sum + c.latePenaltyDeduction, 0)
                )}
              </div>
            </Card>
          </div>

          {/* Calculator Table (Responsive overflow container) */}
          <Card className="overflow-hidden border-border/80">
            <div className="w-full max-w-full overflow-x-auto bg-card">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b bg-muted/50 text-muted-foreground uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3 whitespace-nowrap">Staff Member</th>
                    <th className="py-3 px-3 whitespace-nowrap">Pay Model</th>
                    <th className="py-3 px-3 whitespace-nowrap">Base Salary</th>
                    <th className="py-3 px-3 whitespace-nowrap">Days in Month / Daily Wage</th>
                    <th className="py-3 px-3 whitespace-nowrap text-center">P / L / A (Days)</th>
                    <th className="py-3 px-3 whitespace-nowrap">Late Deductions</th>
                    <th className="py-3 px-3 whitespace-nowrap">Adjusted Base</th>
                    <th className="py-3 px-3 whitespace-nowrap">Commissions / Share</th>
                    <th className="py-3 px-3 whitespace-nowrap font-bold text-foreground">Net Payable Payout</th>
                    <th className="py-3 px-3 whitespace-nowrap text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {monthlyCalculations.map((calc) => (
                    <tr key={calc.staffId} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-3 whitespace-nowrap font-bold text-foreground">
                        {calc.staffName}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <Badge variant="outline" className="text-[10px] uppercase font-mono">
                          {calc.payType.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap font-mono">
                        {calc.baseSalary ? currencyFormat(calc.baseSalary) : '—'}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap font-mono text-muted-foreground">
                        {calc.totalWorkingDays} days ({currencyFormat(calc.perDayRate)}/day)
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-center font-mono">
                        <span className="text-emerald-600 font-bold">{calc.daysPresent}P</span> /{' '}
                        <span className="text-amber-500 font-bold" title={`${calc.waivedLateCount} waived by owner`}>
                          {calc.daysLate}L {calc.waivedLateCount > 0 ? `(${calc.waivedLateCount}W)` : ''}
                        </span> /{' '}
                        <span className="text-destructive font-bold">{calc.daysAbsent}A</span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap font-mono text-destructive">
                        {calc.latePenaltyDeduction > 0 ? `-${currencyFormat(calc.latePenaltyDeduction)}` : 'Rs. 0'}
                        {calc.waivedLateCount > 0 && (
                          <span className="block text-[10px] text-emerald-600 font-semibold">
                            ({calc.waivedLateCount} Waived)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap font-mono font-medium">
                        {calc.attendanceAdjustedBase > 0 ? currencyFormat(calc.attendanceAdjustedBase) : '—'}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap font-mono text-emerald-600 font-semibold">
                        +{currencyFormat(calc.commissionEarned + calc.chairShare)}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap font-mono font-black text-sm text-primary">
                        {currencyFormat(calc.netPayout)}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSendWhatsAppSlip(calc)}
                          className="h-7 px-2.5 rounded-xl text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-xs font-semibold"
                        >
                          <MessageCircle className="w-3.5 h-3.5 mr-1" /> Slip
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: Attendance History & Search */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-3.5 rounded-2xl border">
            <div className="flex flex-wrap items-center gap-2">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-36 h-8 text-xs rounded-xl"
              />

              <select
                value={staffFilter}
                onChange={(e) => setStaffFilter(e.target.value)}
                className="h-8 text-xs rounded-xl border border-input bg-background px-2"
              >
                <option value="all">All Stylists</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-8 text-xs rounded-xl border border-input bg-background px-2"
              >
                <option value="all">All Statuses</option>
                <option value="Present">Present</option>
                <option value="Late">Late</option>
                <option value="Half Day">Half Day</option>
                <option value="Absent">Absent</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>

            <Badge variant="outline" className="text-xs font-mono self-start sm:self-center">
              {filteredLogs.length} Records Found
            </Badge>
          </div>

          <Card className="overflow-hidden border-border/80">
            <div className="w-full max-w-full overflow-x-auto bg-card">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b bg-muted/50 text-muted-foreground uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3 whitespace-nowrap">Date</th>
                    <th className="py-3 px-3 whitespace-nowrap">Staff Name</th>
                    <th className="py-3 px-3 whitespace-nowrap">Status</th>
                    <th className="py-3 px-3 whitespace-nowrap font-mono">Clock In</th>
                    <th className="py-3 px-3 whitespace-nowrap font-mono">Clock Out</th>
                    <th className="py-3 px-3 whitespace-nowrap">Late Mins</th>
                    <th className="py-3 px-3 whitespace-nowrap">Penalty Status</th>
                    <th className="py-3 px-3 whitespace-nowrap">Overtime</th>
                    <th className="py-3 px-3 whitespace-nowrap">Notes</th>
                    <th className="py-3 px-3 whitespace-nowrap text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((rec) => (
                      <tr key={rec.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-3 whitespace-nowrap font-mono">{rec.attendance_date}</td>
                        <td className="py-3 px-3 whitespace-nowrap font-bold text-foreground">
                          {rec.staff_name}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <Badge
                            variant={
                              rec.status === 'Present'
                                ? 'default'
                                : rec.status === 'Late'
                                ? 'destructive'
                                : 'secondary'
                            }
                            className="text-[10px] font-bold uppercase"
                          >
                            {rec.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap font-mono">{rec.clock_in || '—'}</td>
                        <td className="py-3 px-3 whitespace-nowrap font-mono">{rec.clock_out || '—'}</td>
                        <td className="py-3 px-3 whitespace-nowrap font-mono">
                          {rec.late_minutes ? `${rec.late_minutes}m` : '0m'}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          {rec.status === 'Late' ? (
                            rec.is_paid_off ? (
                              <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5">
                                ✓ Paid Off / Waived
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="border-amber-500/60 text-amber-600 text-[9px] font-bold px-2 py-0.5">
                                Penalty Active
                              </Badge>
                            )
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap font-mono">
                          {rec.overtime_hours ? `+${rec.overtime_hours}h` : '0h'}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap text-muted-foreground truncate max-w-[150px]">
                          {rec.notes || rec.waived_reason || '—'}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap text-right">
                          {role === 'owner' ? (
                            <div className="flex items-center justify-end gap-1">
                              {rec.status === 'Late' && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => toggleAttendanceWaiver(rec.id, !rec.is_paid_off)}
                                  title={rec.is_paid_off ? 'Reinstate late penalty' : 'Waive late penalty (Paid Off)'}
                                  className={`h-7 px-2 text-[10px] font-bold rounded-lg ${
                                    rec.is_paid_off
                                      ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                                      : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                                  }`}
                                >
                                  {rec.is_paid_off ? 'Reinstate' : 'Waive'}
                                </Button>
                              )}
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleOpenEditAttendance(rec)}
                                title="Edit Attendance (Owner Only)"
                                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => {
                                  if (confirm(`Remove attendance record for ${rec.staff_name}?`)) {
                                    deleteStaffAttendance(rec.id);
                                  }
                                }}
                                title="Delete Record (Owner Only)"
                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-muted-foreground italic">Owner Only</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-muted-foreground">
                        No attendance records found for selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Manual Attendance Entry Modal */}
      <Dialog open={isLogModalOpen} onOpenChange={setIsLogModalOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md rounded-2xl max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              {editingAttendance ? 'Edit Attendance Record' : 'Log Staff Attendance'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Record manual check-ins, leaves, late arrivals, or half-days.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitAttendance} className="space-y-3.5 py-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Select Stylist *</label>
              <select
                value={formStaffId}
                onChange={(e) => setFormStaffId(e.target.value)}
                required
                className="w-full h-9 text-xs rounded-xl border border-input bg-background px-2"
              >
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold">Date</label>
                <Input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  required
                  className="h-9 text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold">Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as AttendanceStatus)}
                  className="w-full h-9 text-xs rounded-xl border border-input bg-background px-2"
                >
                  <option value="Present">Present (Full Day)</option>
                  <option value="Late">Late Arrival</option>
                  <option value="Half Day">Half Day</option>
                  <option value="Absent">Absent</option>
                  <option value="On Leave">Approved Leave</option>
                </select>
              </div>
            </div>

            {formStatus !== 'Absent' && formStatus !== 'On Leave' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Clock In Time</label>
                    <Input
                      type="time"
                      value={formClockIn}
                      onChange={(e) => setFormClockIn(e.target.value)}
                      className="h-9 text-xs rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Clock Out Time</label>
                    <Input
                      type="time"
                      value={formClockOut}
                      onChange={(e) => setFormClockOut(e.target.value)}
                      className="h-9 text-xs rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Late Minutes</label>
                    <Input
                      type="number"
                      min={0}
                      value={formLateMinutes}
                      onChange={(e) => setFormLateMinutes(Number(e.target.value))}
                      className="h-9 text-xs rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Overtime Hours</label>
                    <Input
                      type="number"
                      min={0}
                      step={0.5}
                      value={formOvertimeHours}
                      onChange={(e) => setFormOvertimeHours(Number(e.target.value))}
                      className="h-9 text-xs rounded-xl"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold">Notes / Reason</label>
              <Input
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="e.g. Traffic on Shahrah-e-Faisal, Doctor appointment"
                className="h-9 text-xs rounded-xl"
              />
            </div>

            {role === 'owner' && (
              <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <label htmlFor="is_paid_off_chk" className="text-xs font-bold text-foreground cursor-pointer block">
                      Mark Late Penalty as Paid Off / Waived
                    </label>
                    <span className="text-[10px] text-muted-foreground">
                      Owner waiver: 0 PKR will be deducted from base salary
                    </span>
                  </div>
                  <input
                    id="is_paid_off_chk"
                    type="checkbox"
                    checked={formIsPaidOff}
                    onChange={(e) => setFormIsPaidOff(e.target.checked)}
                    className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                  />
                </div>
                {formIsPaidOff && (
                  <Input
                    value={formWaivedReason}
                    onChange={(e) => setFormWaivedReason(e.target.value)}
                    placeholder="Waiver reason (e.g. Approved emergency, Heavy rain)"
                    className="h-8 text-xs bg-background"
                  />
                )}
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t">
              <Button type="button" variant="outline" onClick={() => setIsLogModalOpen(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button type="submit" className="rounded-xl font-bold">
                {editingAttendance ? 'Update Record' : 'Save Attendance'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Owner Late Penalty Rule Settings Dialog */}
      <Dialog open={isRuleModalOpen} onOpenChange={setIsRuleModalOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md rounded-2xl max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Owner Late Penalty Rules Engine
            </DialogTitle>
            <DialogDescription className="text-xs">
              Configure how stylist late arrivals are calculated and deducted from monthly payroll.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveLateRules} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Penalty Calculation Method</label>
              <select
                value={ruleMode}
                onChange={(e) => setRuleMode(e.target.value as LatePenaltyRuleConfig['penalty_mode'])}
                className="w-full h-9 text-xs rounded-xl border border-input bg-background px-2"
              >
                <option value="per_minute">Per Minute Late (Beyond Grace Threshold)</option>
                <option value="flat_per_late">Flat Fine Per Late Day</option>
                <option value="half_day_after_threshold">Half Day Salary Deduction After Threshold</option>
                <option value="three_lates_one_day">3 Late Days = 1 Full Day Salary Deducted</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold">Grace Period (Minutes)</label>
                <Input
                  type="number"
                  min={0}
                  value={ruleGraceMins}
                  onChange={(e) => setRuleGraceMins(Number(e.target.value))}
                  className="h-9 text-xs rounded-xl"
                  placeholder="e.g. 15"
                />
              </div>

              {ruleMode === 'per_minute' && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Rate Per Minute (PKR)</label>
                  <Input
                    type="number"
                    min={0}
                    value={ruleRatePerMin}
                    onChange={(e) => setRuleRatePerMin(Number(e.target.value))}
                    className="h-9 text-xs rounded-xl"
                    placeholder="e.g. 20"
                  />
                </div>
              )}

              {(ruleMode === 'flat_per_late' || ruleMode === 'half_day_after_threshold') && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Flat Penalty / Base Fine (PKR)</label>
                  <Input
                    type="number"
                    min={0}
                    value={ruleFlatPenalty}
                    onChange={(e) => setRuleFlatPenalty(Number(e.target.value))}
                    className="h-9 text-xs rounded-xl"
                    placeholder="e.g. 250"
                  />
                </div>
              )}

              {ruleMode === 'half_day_after_threshold' && (
                <div className="space-y-1 col-span-2">
                  <label className="text-xs font-semibold">Half-Day Threshold (Minutes)</label>
                  <Input
                    type="number"
                    min={0}
                    value={ruleThresholdMins}
                    onChange={(e) => setRuleThresholdMins(Number(e.target.value))}
                    className="h-9 text-xs rounded-xl"
                    placeholder="e.g. 45"
                  />
                  <span className="text-[10px] text-muted-foreground">
                    Late beyond this converts to half-day wage deduction; otherwise flat fine applies.
                  </span>
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-muted/60 border text-[11px] text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">💡 Auto-Payroll Policy:</p>
              <p>• Stylists work continuous calendar days (no fixed days off).</p>
              <p>• Base Daily Rate = Base Monthly Salary ÷ Days in Calendar Month.</p>
              <p>• The Owner can waive any late fine or mark it as Paid Off at any time.</p>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t">
              <Button type="button" variant="outline" onClick={() => setIsRuleModalOpen(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button type="submit" className="rounded-xl font-bold bg-amber-600 hover:bg-amber-700 text-white">
                Save Rule Configuration
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
