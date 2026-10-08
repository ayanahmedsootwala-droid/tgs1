import React, { useState } from 'react';
import { useSalon } from '@/contexts/SalonContext';
import {
  Settings,
  Shield,
  Receipt,
  RotateCcw,
  Save,
  CheckCircle2,
  DollarSign,
  Percent,
  Sliders,
  Lock,
  UserCheck,
  Key,
  MessageCircle,
  Clock,
  Sparkles,
  Smartphone,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import type { RolePermissions, UserAccount } from '@/types/salon';

export const SettingsPage: React.FC = () => {
  const {
    settings,
    updateSettings,
    role,
    permissions,
    updatePermissions,
    staffPermissions,
    updateStaffPermissions,
    dailyExpenseQuota,
    updateDailyExpenseQuota,
    currencyFormat,
    currentUser,
    userAccounts,
    resetDemoData,
    sendWhatsAppMessage,
    generateWhatsAppClosingReport,
  } = useSalon();

  const isOwner = role === 'owner';

  // Settings Form State
  const [salonName, setSalonName] = useState(settings.salon_name);
  const [tagline, setTagline] = useState(settings.tagline);
  const [phone, setPhone] = useState(settings.phone);
  const [email, setEmail] = useState(settings.email);
  const [address, setAddress] = useState(settings.address);
  const [currencySymbol, setCurrencySymbol] = useState(settings.currency_symbol);
  const [currencyCode, setCurrencyCode] = useState(settings.currency_code);
  const [taxRate, setTaxRate] = useState<number>(settings.tax_rate);
  const [receiptHeader, setReceiptHeader] = useState(settings.receipt_header);
  const [receiptFooter, setReceiptFooter] = useState(settings.receipt_footer);

  // WhatsApp & Automation Settings
  const [ownerWhatsApp, setOwnerWhatsApp] = useState(settings.owner_whatsapp || '03001234567');
  const [autoClosingTime, setAutoClosingTime] = useState(settings.auto_day_closing_time || '23:59');

  const [isSaving, setIsSaving] = useState(false);

  // Strict Owner Access Guard: Manager and Staff cannot view or edit settings & branding
  if (role !== 'owner') {
    return (
      <div className="p-8 text-center space-y-4 max-w-md mx-auto my-12 bg-card border border-destructive/30 rounded-3xl shadow-sm">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center font-bold">
          <Shield className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-black text-destructive">Owner Access Required</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Salon Settings, Branding Customizations, WhatsApp Automation, and Security Rules are restricted exclusively to the Salon Owner.
        </p>
        <Button onClick={() => window.location.href = '/'} variant="outline" className="rounded-xl text-xs font-bold">
          Return to Billing POS
        </Button>
      </div>
    );
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateSettings({
      salon_name: salonName.trim(),
      tagline: tagline.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      currency_symbol: currencySymbol.trim(),
      currency_code: currencyCode.trim(),
      tax_rate: Number(taxRate),
      receipt_header: receiptHeader.trim(),
      receipt_footer: receiptFooter.trim(),
      owner_whatsapp: ownerWhatsApp.trim(),
      auto_day_closing_time: autoClosingTime.trim(),
    });
    setIsSaving(false);
  };

  const handleTestWhatsAppReport = () => {
    const report = generateWhatsAppClosingReport();
    sendWhatsAppMessage(ownerWhatsApp, report);
    toast.success('Triggering test WhatsApp closing summary report...');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Salon Profile &amp; Owner Customizations
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure &quot;The Grooming Studio TGS&quot; business details, WhatsApp automation templates, 11:59 PM auto-closing, and permission matrix.
          </p>
        </div>
      </div>

      {/* WhatsApp Automation Suite for Owner */}
      <Card className="rounded-2xl border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-sm">
        <CardHeader className="p-4 pb-2 border-b border-emerald-500/20 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              WhatsApp Automation Suite
            </CardTitle>
            <CardDescription className="text-xs">
              Automated daily revenue closing summary sent to owner, customer booking reminders, and loyalty alerts.
            </CardDescription>
          </div>
          <Badge className="bg-emerald-600 text-white text-[10px] px-2 py-0.5">
            Active Integration
          </Badge>
        </CardHeader>

        <CardContent className="p-4 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Owner WhatsApp Mobile Number (Receives Daily Financial Reports) *</Label>
              <Input
                value={ownerWhatsApp}
                onChange={(e) => setOwnerWhatsApp(e.target.value)}
                placeholder="03001234567"
                className="text-xs font-mono font-bold rounded-xl"
              />
              <p className="text-[10px] text-muted-foreground">
                Pakistan format: 11 digits starting with 03.
              </p>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Scheduled Automatic Day Closing Time</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="time"
                  value={autoClosingTime}
                  onChange={(e) => setAutoClosingTime(e.target.value)}
                  className="text-xs font-mono font-bold rounded-xl w-36"
                />
                <Badge variant="outline" className="text-[10px] border-primary/40 text-primary font-mono">
                  11:59 PM Daily Standard
                </Badge>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Automatic register lock and audit archive happens every night.
              </p>
            </div>
          </div>

          <div className="p-3 bg-card border border-border/70 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="font-bold text-foreground block">Test Daily Closing WhatsApp Dispatch</span>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Previews today&apos;s net revenue, cash collected, counter expenses, and active barbers summary formatted for WhatsApp.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTestWhatsAppReport}
              className="rounded-xl border-emerald-500/40 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-300 gap-1.5 h-8 font-semibold shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Test Send to Owner</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Role Access Matrix (Owner Controlled) */}
      <Card className="rounded-2xl border-border/80 shadow-sm bg-card">
        <CardHeader className="p-4 pb-2 border-b border-border/60">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Role Access &amp; Permissions Matrix (Owner Control)
          </CardTitle>
          <CardDescription className="text-xs">
            Manage granular privileges between Owner, Floor Manager, and Staff roles.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="divide-y divide-border/60 text-xs">
            {/* Allow Quick Walk-In Client on POS */}
            <div className="py-2.5 flex items-center justify-between">
              <div>
                <div className="font-semibold text-foreground flex items-center gap-2">
                  <span>Allow Quick Walk-In Client on POS</span>
                  <Badge variant="outline" className="text-[10px] text-amber-700 border-amber-400 bg-amber-50/50">
                    Owner Control
                  </Badge>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  When enabled, cashiers see a 1-tap &ldquo;⚡ Quick Walk-In&rdquo; button. When disabled, staff must search or register a customer before checking out.
                </div>
              </div>
              <Switch
                checked={settings.allow_quick_walkin ?? false}
                onCheckedChange={(checked) => updateSettings({ allow_quick_walkin: checked })}
              />
            </div>

            {/* Can Manage Expenses */}
            <div className="py-2.5 flex items-center justify-between">
              <div>
                <div className="font-semibold text-foreground">Manager Can Log &amp; Manage Expenses</div>
                <div className="text-[11px] text-muted-foreground">Allows Manager to record petty cash vouchers and operational bills.</div>
              </div>
              <Switch
                checked={permissions.can_manage_expenses}
                onCheckedChange={(checked) => updatePermissions({ can_manage_expenses: checked })}
              />
            </div>

            {/* Can Manage Staff */}
            <div className="py-2.5 flex items-center justify-between">
              <div>
                <div className="font-semibold text-foreground">Manager Can View Staff, Barbers &amp; Commissions</div>
                <div className="text-[11px] text-muted-foreground">Allows Manager to view CNIC records, commission payouts and print pay slips.</div>
              </div>
              <Switch
                checked={permissions.can_manage_staff}
                onCheckedChange={(checked) => updatePermissions({ can_manage_staff: checked })}
              />
            </div>

            {/* Can Manage Day Closing */}
            <div className="py-2.5 flex items-center justify-between">
              <div>
                <div className="font-semibold text-foreground">Manager Can Perform Day Closing</div>
                <div className="text-[11px] text-muted-foreground">Allows Manager to audit cash drawer and finalize end-of-shift registers.</div>
              </div>
              <Switch
                checked={permissions.can_manage_day_closing}
                onCheckedChange={(checked) => updatePermissions({ can_manage_day_closing: checked })}
              />
            </div>

            {/* Can Manage Loyalty */}
            <div className="py-2.5 flex items-center justify-between">
              <div>
                <div className="font-semibold text-foreground">Manager Can Access Customer Loyalty Programs</div>
                <div className="text-[11px] text-muted-foreground">Allows Manager to inspect 5-visit milestone eligibility and apply rewards.</div>
              </div>
              <Switch
                checked={permissions.can_manage_loyalty}
                onCheckedChange={(checked) => updatePermissions({ can_manage_loyalty: checked })}
              />
            </div>

            {/* Reports Restricted to Owner */}
            <div className="py-2.5 flex items-center justify-between">
              <div>
                <div className="font-semibold text-foreground">Reports &amp; Analytics Restricted to Owner</div>
                <div className="text-[11px] text-muted-foreground">Keeps financial P&amp;L, salon margins, and gross profit visible exclusively to Owner.</div>
              </div>
              <Badge variant="secondary" className="text-[10px]">
                Owner Only
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Granular Staff & Management Permission Toggles (Owner Controlled) */}
      <Card className="rounded-2xl border-border/80 shadow-sm bg-card">
        <CardHeader className="p-4 pb-2 border-b border-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm font-bold">Granular Staff &amp; Management Permission Toggles</CardTitle>
            </div>
            <Badge variant="outline" className="text-[10px] text-primary border-primary/40 font-mono">
              👑 Owner Exclusive Control
            </Badge>
          </div>
          <CardDescription className="text-xs">
            Individually permit or restrict operations for Staff &amp; Management terminal accounts.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="divide-y divide-border/60 text-xs">
            {/* Toggle: Discounts */}
            <div className="py-2.5 flex items-center justify-between">
              <div>
                <div className="font-semibold text-foreground">Staff Can Apply Checkout Discounts</div>
                <div className="text-[11px] text-muted-foreground">Allows staff &amp; managers to give custom PKR discounts on POS bills.</div>
              </div>
              <Switch
                disabled={!isOwner}
                checked={staffPermissions.can_give_discounts}
                onCheckedChange={(checked) => updateStaffPermissions({ can_give_discounts: checked })}
              />
            </div>

            {/* Toggle: Expense Recording */}
            <div className="py-2.5 flex items-center justify-between">
              <div>
                <div className="font-semibold text-foreground">Staff Can Record Counter Expenses</div>
                <div className="text-[11px] text-muted-foreground">Allows non-owner roles to log petty cash expenses from drawer.</div>
              </div>
              <Switch
                disabled={!isOwner}
                checked={staffPermissions.can_record_expenses}
                onCheckedChange={(checked) => updateStaffPermissions({ can_record_expenses: checked })}
              />
            </div>

            {/* Toggle: Owner Ledger View */}
            <div className="py-2.5 flex items-center justify-between">
              <div>
                <div className="font-semibold text-foreground">Staff Can Access Owner Financial Ledger</div>
                <div className="text-[11px] text-muted-foreground">When disabled, Owner Ledger &amp; Profit Targets are strictly hidden from staff.</div>
              </div>
              <Switch
                disabled={!isOwner}
                checked={staffPermissions.can_view_owner_ledger}
                onCheckedChange={(checked) => updateStaffPermissions({ can_view_owner_ledger: checked })}
              />
            </div>

            {/* Toggle: Void Invoices */}
            <div className="py-2.5 flex items-center justify-between">
              <div>
                <div className="font-semibold text-foreground">Staff Can Void / Cancel Completed Invoices</div>
                <div className="text-[11px] text-muted-foreground">Allows non-owner roles to cancel completed receipts in sales reports.</div>
              </div>
              <Switch
                disabled={!isOwner}
                checked={staffPermissions.can_void_invoices}
                onCheckedChange={(checked) => updateStaffPermissions({ can_void_invoices: checked })}
              />
            </div>

            {/* Toggle: View Daily Sync & Reports */}
            <div className="py-2.5 flex items-center justify-between">
              <div>
                <div className="font-semibold text-foreground">Staff Can View Daily Sync &amp; Performance Reports</div>
                <div className="text-[11px] text-muted-foreground">Enables staff access to Daily Sync revenue breakdowns and barber reports.</div>
              </div>
              <Switch
                disabled={!isOwner}
                checked={staffPermissions.can_view_reports}
                onCheckedChange={(checked) => updateStaffPermissions({ can_view_reports: checked })}
              />
            </div>

            {/* Toggle: Edit Clients */}
            <div className="py-2.5 flex items-center justify-between">
              <div>
                <div className="font-semibold text-foreground">Staff Can Edit Customer Records &amp; CRM Profiles</div>
                <div className="text-[11px] text-muted-foreground">Allows modifying customer names, phone numbers, and notes.</div>
              </div>
              <Switch
                disabled={!isOwner}
                checked={staffPermissions.can_edit_clients}
                onCheckedChange={(checked) => updateStaffPermissions({ can_edit_clients: checked })}
              />
            </div>

            {/* Toggle: Adjust Digital Stamps */}
            <div className="py-2.5 flex items-center justify-between">
              <div>
                <div className="font-semibold text-foreground">Staff Can Add &amp; Adjust Digital Stamp Cards</div>
                <div className="text-[11px] text-muted-foreground">Allows staff to punch customer 5-visit cards and award facial rewards.</div>
              </div>
              <Switch
                disabled={!isOwner}
                checked={staffPermissions.can_adjust_stamps}
                onCheckedChange={(checked) => updateStaffPermissions({ can_adjust_stamps: checked })}
              />
            </div>

            {/* Toggle: Manual Day Closing */}
            <div className="py-2.5 flex items-center justify-between">
              <div>
                <div className="font-semibold text-foreground">Staff Can Perform Manual Day Closing Overrides</div>
                <div className="text-[11px] text-muted-foreground">When disabled, staff must rely exclusively on automated 11:59 PM closing.</div>
              </div>
              <Switch
                disabled={!isOwner}
                checked={staffPermissions.can_manual_close_day}
                onCheckedChange={(checked) => updateStaffPermissions({ can_manual_close_day: checked })}
              />
            </div>
          </div>

          {/* Daily Expense Quota Quick Setting */}
          <div className="p-3 bg-muted/30 border border-border/70 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-foreground block">Daily Expense Quota Budget (PKR)</span>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Maximum allowed counter cash outlays per day before extra expense flags trigger.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                disabled={!isOwner}
                value={dailyExpenseQuota}
                onChange={(e) => updateDailyExpenseQuota(Math.max(0, parseFloat(e.target.value) || 0))}
                className="h-8 w-28 text-xs font-mono font-bold rounded-xl"
              />
              <span className="font-mono text-xs font-bold text-muted-foreground">PKR</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terminal User Accounts & Credentials */}
      <Card className="rounded-2xl border-border/80 shadow-sm bg-card">
        <CardHeader className="p-4 pb-2 border-b border-border/60">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Key className="w-4 h-4 text-primary" />
            Terminal User Accounts &amp; Credentials
          </CardTitle>
          <CardDescription className="text-xs">
            Individual private credentials configured for salon login portal.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {userAccounts.map((acc: UserAccount) => (
              <div key={acc.id} className="p-3 border border-border/60 rounded-xl bg-muted/20 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">{acc.name}</span>
                  <Badge variant={acc.role === 'owner' ? 'default' : 'secondary'} className="text-[10px] uppercase">
                    {acc.role}
                  </Badge>
                </div>
                <div className="font-mono text-[11px] text-muted-foreground">
                  Email: <span className="text-foreground">{acc.email}</span>
                </div>
                <div className="font-mono text-[11px] text-muted-foreground">
                  Password: <span className="text-foreground">••••••••</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Salon Profile Form */}
      <form onSubmit={handleSaveSettings} className="space-y-4">
        <Card className="rounded-2xl border-border/80 shadow-sm bg-card">
          <CardHeader className="p-4 pb-2 border-b border-border/60">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Receipt className="w-4 h-4 text-primary" />
              Business Profile &amp; Receipts (Pakistan Localization)
            </CardTitle>
          </CardHeader>

          <CardContent className="p-4 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Salon Name *</Label>
                <Input
                  value={salonName}
                  onChange={(e) => setSalonName(e.target.value)}
                  className="text-xs rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Tagline / Subtitle</Label>
                <Input
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="text-xs rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Contact Phone (Pakistan)</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Official Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-xs rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Salon Address</Label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="text-xs rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Currency Symbol *</Label>
                <Input
                  value={currencySymbol}
                  onChange={(e) => setCurrencySymbol(e.target.value)}
                  placeholder="Rs."
                  className="text-xs rounded-xl font-bold font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Currency Code *</Label>
                <Input
                  value={currencyCode}
                  onChange={(e) => setCurrencyCode(e.target.value)}
                  placeholder="PKR"
                  className="text-xs rounded-xl font-bold font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Sales Tax Rate (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  className="text-xs rounded-xl font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Thermal Receipt Footer Note</Label>
              <Input
                value={receiptFooter}
                onChange={(e) => setReceiptFooter(e.target.value)}
                className="text-xs rounded-xl"
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isSaving} className="gap-2 rounded-xl text-xs font-bold h-10 px-5 shadow-sm">
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Preferences'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};
