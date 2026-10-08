import React, { useState, useMemo } from 'react';
import { useSalon } from '@/contexts/SalonContext';
import type { LoyaltyProgram, ClientRecord } from '@/types/salon';
import {
  Sparkles,
  Gift,
  Ticket,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Percent,
  Clock,
  Scissors,
  Users,
  Search,
  MessageCircle,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

export const LoyaltyPage: React.FC = () => {
  const {
    loyaltyPrograms,
    updateLoyaltyProgram,
    clients,
    updateClient,
    addClientPunchStamp,
    removeClientPunchStamp,
    editClientPunchStamps,
    currencyFormat,
    role,
    sendWhatsAppMessage,
  } = useSalon();

  const isOwner = role === 'owner';

  // Tabs: 'programs' | 'punchcards'
  const [activeTab, setActiveTab] = useState<'programs' | 'punchcards'>('programs');

  // Modal State for Program Edit
  const [editingProgram, setEditingProgram] = useState<LoyaltyProgram | null>(null);
  const [progTitle, setProgTitle] = useState('');
  const [progDesc, setProgDesc] = useState('');
  const [progReward, setProgReward] = useState('');
  const [progTerms, setProgTerms] = useState('');
  const [progIsActive, setProgIsActive] = useState(true);
  const [isProgramModalOpen, setIsProgramModalOpen] = useState(false);

  // Punch Card Desk Search
  const [clientSearch, setClientSearch] = useState('');

  // Selected client for owner stamp editing & stamp history
  const [selectedClientForStampEdit, setSelectedClientForStampEdit] = useState<ClientRecord | null>(null);
  const [editStampsValue, setEditStampsValue] = useState<number>(0);
  const [editFacialsValue, setEditFacialsValue] = useState<number>(0);
  const [editReasonText, setEditReasonText] = useState<string>('');

  const [selectedClientForHistory, setSelectedClientForHistory] = useState<ClientRecord | null>(null);

  // Filter clients for punch cards desk
  const filteredClients = useMemo(() => {
    const q = clientSearch.toLowerCase().trim();
    return clients.filter((c) => {
      return (
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q)
      );
    });
  }, [clients, clientSearch]);

  const openEditModal = (prog: LoyaltyProgram) => {
    setEditingProgram(prog);
    setProgTitle(prog.title);
    setProgDesc(prog.description);
    setProgReward(prog.reward_type || prog.reward_name || 'Rs. 2,500 Free Service');
    setProgTerms(prog.terms_conditions || '');
    setProgIsActive(prog.is_active);
    setIsProgramModalOpen(true);
  };

  const handleSaveProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProgram) return;

    await updateLoyaltyProgram(editingProgram.id, {
      title: progTitle.trim(),
      description: progDesc.trim(),
      reward_type: progReward.trim(),
      terms_conditions: progTerms.trim() || undefined,
      is_active: progIsActive,
    });

    setIsProgramModalOpen(false);
  };

  // Add Punch / Stamp via Context (with 1-stamp-per-day enforcement & history log)
  const handleAddPunch = async (client: ClientRecord) => {
    await addClientPunchStamp(client.id);
  };

  // Owner open edit dialog
  const handleOpenEditStampModal = (client: ClientRecord) => {
    setSelectedClientForStampEdit(client);
    setEditStampsValue(client.punch_card_stamps ?? client.loyalty_visits_count ?? 0);
    setEditFacialsValue(client.loyalty_free_facials_available ?? 0);
    setEditReasonText('');
  };

  // Owner save edited stamps
  const handleSaveEditedStamps = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientForStampEdit) return;
    await editClientPunchStamps(
      selectedClientForStampEdit.id,
      Number(editStampsValue),
      editReasonText.trim() || 'Owner Manual Stamp Adjustment'
    );
    setSelectedClientForStampEdit(null);
  };

  // Owner remove one stamp
  const handleRemoveStamp = async (client: ClientRecord) => {
    await removeClientPunchStamp(client.id, 'Removed by Owner request');
  };

  // Send WhatsApp notification for punch card milestone or free facial
  const handleSendWhatsAppNotification = (client: ClientRecord) => {
    let msg = '';
    const stamps = client.punch_card_stamps ?? client.loyalty_visits_count ?? 0;
    if (client.loyalty_free_facials_available > 0) {
      msg = `🎉 Congratulations ${client.name}! You have unlocked a Complimentary Signature Facial (Worth Rs. 2,500) at The Grooming Studio (TGS). Visit us anytime to claim your luxury grooming treat!`;
    } else {
      msg = `Hello ${client.name}! You now have ${stamps}/5 visits on your TGS Digital Punch Card. Complete ${5 - stamps} more visit(s) to claim your FREE Signature Facial!`;
    }
    sendWhatsAppMessage(client.phone, msg);
    toast.success(`Opening WhatsApp for ${client.name}...`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Customer Loyalty &amp; Retention Hub</h1>
            <Badge variant="outline" className="border-primary/40 text-primary">
              Punch Card Rewards
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            5-Visit Facial Punch Card suite and student &amp; corporate loyalty campaigns.
          </p>
        </div>
      </div>

      {/* Smoothly Scrollable Tabs (Prepaid Club Removed) */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <div className="w-full max-w-full overflow-x-auto scrollbar-thin pb-1">
          <TabsList className="w-auto inline-flex whitespace-nowrap bg-muted/40 border border-border/80 p-1.5 rounded-2xl gap-1">
            <TabsTrigger value="programs" className="text-xs font-semibold gap-1.5 rounded-xl px-3 py-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Active Retention Strategies ({loyaltyPrograms.length})</span>
            </TabsTrigger>
            <TabsTrigger value="punchcards" className="text-xs font-semibold gap-1.5 rounded-xl px-3 py-1.5">
              <Ticket className="w-3.5 h-3.5 text-blue-600" />
              <span>Digital Punch Cards &amp; Stamp Desk</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TAB 1: RETENTION PROGRAMS */}
        <TabsContent value="programs" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loyaltyPrograms.map((prog) => (
              <Card key={prog.id} className="rounded-2xl border border-border/80 shadow-sm flex flex-col justify-between bg-card">
                <CardHeader className="p-4 pb-2 border-b border-border/60 flex flex-row items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base font-bold">{prog.title}</CardTitle>
                      <Badge variant={prog.is_active ? 'default' : 'secondary'} className="text-[10px]">
                        {prog.is_active ? 'Active' : 'Paused'}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs mt-1 text-pretty">{prog.description}</CardDescription>
                  </div>

                  {isOwner && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditModal(prog)}
                      className="h-7 w-7 text-muted-foreground hover:text-foreground rounded-lg shrink-0"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </CardHeader>

                <CardContent className="p-4 space-y-3 text-xs flex-1 flex flex-col justify-between">
                  <div className="p-3 bg-primary/5 rounded-xl border border-primary/20 space-y-1">
                    <span className="font-semibold text-primary block text-[11px] uppercase tracking-wider">
                      Client Reward Value
                    </span>
                    <span className="font-bold text-foreground text-xs">{prog.reward_type}</span>
                  </div>

                  {prog.terms_conditions && (
                    <div className="text-[11px] text-muted-foreground">
                      <strong className="text-foreground">Policy:</strong> {prog.terms_conditions}
                    </div>
                  )}

                  <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Program Target</span>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {(prog.program_type || 'milestone_visits').replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* TAB 2: DIGITAL PUNCH CARDS & STAMP DESK */}
        <TabsContent value="punchcards" className="space-y-4 mt-4">
          <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-blue-600" />
                  Client 5-Visit Punch Card Stamp Desk
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Every 5th visit qualifies customer for 1 Complimentary Signature Facial (Worth Rs. 2,500).
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search client by name or phone..."
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  className="pl-8 h-9 text-xs rounded-xl"
                />
              </div>
            </div>

            {/* Client Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredClients.map((client) => {
                const punches = client.loyalty_visits_count || 0;
                const freeFacials = client.loyalty_free_facials_available || 0;

                return (
                  <div
                    key={client.id}
                    className="p-3.5 rounded-2xl border border-border/80 bg-muted/20 hover:bg-muted/40 transition-colors space-y-3 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="font-bold text-foreground block truncate">{client.name}</span>
                        <span className="font-mono text-[11px] text-muted-foreground">{client.phone}</span>
                      </div>
                      {freeFacials > 0 && (
                        <Badge className="bg-emerald-600 text-white font-bold text-[10px] shrink-0">
                          {freeFacials} Free Facial Ready
                        </Badge>
                      )}
                    </div>

                    {/* 5-Stamp Visual Tracker */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground">Stamp Card Progress:</span>
                        <span className="font-bold font-mono text-primary">{punches} / 5</span>
                      </div>

                      <div className="grid grid-cols-5 gap-1.5">
                        {[1, 2, 3, 4, 5].map((step) => {
                          const isStamped = step <= punches;
                          const isFifth = step === 5;

                          return (
                            <div
                              key={step}
                              className={`h-9 rounded-xl border flex flex-col items-center justify-center font-bold text-[10px] transition-all ${
                                isStamped
                                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                  : isFifth
                                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                                  : 'bg-card border-border/80 text-muted-foreground'
                              }`}
                            >
                              {isStamped ? (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              ) : isFifth ? (
                                <Gift className="w-3.5 h-3.5" />
                              ) : (
                                <span>{step}</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 1-Stamp Per Day Status Indicator */}
                    <div className="flex items-center justify-between text-[10px] bg-muted/40 px-2 py-1 rounded-lg">
                      <span className="text-muted-foreground">Today&apos;s Status:</span>
                      {client.last_stamped_date === new Date().toISOString().split('T')[0] ? (
                        <span className="font-bold text-amber-600 dark:text-amber-400">
                          ✓ Stamped Today (1/Day Limit)
                        </span>
                      ) : (
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">
                          Ready for Today&apos;s Stamp
                        </span>
                      )}
                    </div>

                    {/* Actions: Add Stamp + WhatsApp Alert */}
                    <div className="pt-2 border-t border-border/60 flex flex-wrap items-center justify-between gap-1.5">
                      <Button
                        size="sm"
                        onClick={() => handleAddPunch(client)}
                        className="h-8 text-xs font-bold rounded-xl flex-1 gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Stamp</span>
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedClientForHistory(client)}
                        title="View client stamp history and timestamp logs"
                        className="h-8 text-xs font-semibold rounded-xl px-2 border-border"
                      >
                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="hidden sm:inline">History</span>
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendWhatsAppNotification(client)}
                        title="Send WhatsApp update to customer"
                        className="h-8 text-xs font-semibold rounded-xl gap-1 border-emerald-500/40 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-300 px-2"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    {/* Owner-Only Edit & Remove Stamp Controls */}
                    {isOwner && (
                      <div className="pt-1 flex items-center justify-between gap-1.5 border-t border-dashed border-border/50 text-[10px]">
                        <span className="text-muted-foreground font-semibold">👑 Owner:</span>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEditStampModal(client)}
                            className="h-6 px-1.5 text-[10px] text-primary hover:bg-primary/10 rounded-md"
                          >
                            <Edit2 className="w-2.5 h-2.5 mr-1" />
                            Edit Stamps
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveStamp(client)}
                            className="h-6 px-1.5 text-[10px] text-destructive hover:bg-destructive/10 rounded-md"
                          >
                            <Trash2 className="w-2.5 h-2.5 mr-1" />
                            -1 Stamp
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Program Edit Modal */}
      <Dialog open={isProgramModalOpen} onOpenChange={setIsProgramModalOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Edit Loyalty Strategy</DialogTitle>
            <DialogDescription className="text-xs">
              Configure reward perks, milestones, and discount terms.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveProgram} className="space-y-3 text-xs py-1">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Campaign Title *</Label>
              <Input
                value={progTitle}
                onChange={(e) => setProgTitle(e.target.value)}
                className="text-xs rounded-xl"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Reward Value *</Label>
              <Input
                value={progReward}
                onChange={(e) => setProgReward(e.target.value)}
                className="text-xs rounded-xl"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Description</Label>
              <Textarea
                value={progDesc}
                onChange={(e) => setProgDesc(e.target.value)}
                rows={2}
                className="text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Terms &amp; Conditions</Label>
              <Textarea
                value={progTerms}
                onChange={(e) => setProgTerms(e.target.value)}
                rows={2}
                className="text-xs rounded-xl"
              />
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl border bg-muted/20">
              <span className="font-semibold text-xs">Campaign Active</span>
              <Switch checked={progIsActive} onCheckedChange={setProgIsActive} />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsProgramModalOpen(false)} className="text-xs rounded-xl">
                Cancel
              </Button>
              <Button type="submit" className="text-xs font-bold rounded-xl">
                Save Strategy
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Owner Digital Stamp Edit Modal */}
      {selectedClientForStampEdit && (
        <Dialog open={!!selectedClientForStampEdit} onOpenChange={(open) => !open && setSelectedClientForStampEdit(null)}>
          <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold">
                <Ticket className="w-4 h-4 text-primary" />
                Owner Stamp Adjustment
              </DialogTitle>
              <DialogDescription className="text-xs">
                Manually adjust stamp count and reward availability for {selectedClientForStampEdit.name}.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveEditedStamps} className="space-y-3.5 py-1 text-xs">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Punch Card Stamps (0 to 5)</Label>
                <Input
                  type="number"
                  min={0}
                  max={5}
                  value={editStampsValue}
                  onChange={(e) => setEditStampsValue(Math.min(5, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="text-xs font-mono font-bold rounded-xl"
                  required
                />
                <p className="text-[10px] text-muted-foreground">
                  Setting to 5 automatically resets stamps to 0 and credits +1 Free Facial reward.
                </p>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Available Free Signature Facials</Label>
                <Input
                  type="number"
                  min={0}
                  value={editFacialsValue}
                  onChange={(e) => setEditFacialsValue(Math.max(0, parseInt(e.target.value) || 0))}
                  className="text-xs font-mono font-bold rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Reason for Adjustment *</Label>
                <Input
                  placeholder="e.g. Compensation for wait time / Owner loyalty gift"
                  value={editReasonText}
                  onChange={(e) => setEditReasonText(e.target.value)}
                  className="text-xs rounded-xl"
                  required
                />
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedClientForStampEdit(null)}
                  className="text-xs rounded-xl"
                >
                  Cancel
                </Button>
                <Button type="submit" className="text-xs font-bold rounded-xl">
                  Save Stamp Changes
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Client Stamp History Audit Modal */}
      {selectedClientForHistory && (
        <Dialog open={!!selectedClientForHistory} onOpenChange={(open) => !open && setSelectedClientForHistory(null)}>
          <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold">
                <Clock className="w-4 h-4 text-primary" />
                Stamp History &amp; Audit Log
              </DialogTitle>
              <DialogDescription className="text-xs font-semibold">
                Customer: {selectedClientForHistory.name} ({selectedClientForHistory.phone})
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-1 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-muted/30 rounded-xl border border-border/60">
                <div>
                  <span className="text-[10px] text-muted-foreground block">Current Stamps:</span>
                  <span className="font-mono font-bold text-sm text-primary">
                    {selectedClientForHistory.punch_card_stamps ?? selectedClientForHistory.loyalty_visits_count ?? 0} / 5
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-muted-foreground block">Free Facials Unlocked:</span>
                  <span className="font-mono font-bold text-sm text-emerald-600">
                    {selectedClientForHistory.loyalty_free_facials_available ?? 0}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="font-bold text-foreground block">Stamp Activity Log (Timestamped):</span>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {selectedClientForHistory.stamp_history && selectedClientForHistory.stamp_history.length > 0 ? (
                    selectedClientForHistory.stamp_history.map((record) => (
                      <div key={record.id} className="p-2.5 rounded-xl border border-border/60 bg-card space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-foreground flex items-center gap-1">
                            <Ticket className="w-3 h-3 text-primary" />
                            {record.action}
                          </span>
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {new Date(record.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                          <span>
                            Progress: {record.previous_stamps !== undefined ? `${record.previous_stamps} → ` : ''}<strong className="text-foreground">{record.new_stamps ?? record.stamps_count}</strong>/5 stamps
                          </span>
                          <Badge variant="outline" className="text-[9px] uppercase font-mono">
                            {record.performed_by}
                          </Badge>
                        </div>
                        {record.notes && (
                          <p className="text-[10px] text-muted-foreground italic border-t border-border/30 pt-1 mt-1">
                            &ldquo;{record.notes}&rdquo;
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-muted-foreground">
                      No timestamped history logs recorded yet for this client.
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedClientForHistory(null)}
                  className="text-xs rounded-xl w-full"
                >
                  Close History
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
