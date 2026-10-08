import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSalon } from '@/contexts/SalonContext';
import type { ClientRecord, Invoice } from '@/types/salon';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  Calendar,
  Gift,
  Clock,
  Download,
  Filter,
  Scissors,
  CheckCircle2,
  Trash2,
  Edit2,
  Table as TableIcon,
  LayoutGrid,
  FileSpreadsheet,
  Award,
  ChevronRight,
  TrendingUp,
  MessageCircle,
  ShieldCheck,
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { maskClientPhone } from '@/utils/phoneMask';

export const ClientsPage: React.FC = () => {
  const { clients, addClient, updateClient, deleteClient, invoices, currencyFormat, role, settings, sendWhatsAppMessage } = useSalon();
  const [searchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'spreadsheet'>('spreadsheet');

  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  // Client Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientRecord | null>(null);
  const [selectedClientDetail, setSelectedClientDetail] = useState<ClientRecord | null>(null);

  // Form State with Compulsory 11-digit starting with '03' (no prefill)
  const [name, setName] = useState('');
  const [phone, setPhone] = useState(''); // Entire 11-digit number entered by user
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [tagInput, setTagInput] = useState('Regular');

  // Filtered Clients
  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.notes && c.notes.toLowerCase().includes(q));

      const matchTag =
        selectedTag === 'all' ||
        (selectedTag === 'vip' && (c.tags?.includes('VIP') || c.total_spent > 10000)) ||
        (selectedTag === 'free_facial' && c.loyalty_free_facials_available > 0);

      return matchSearch && matchTag;
    });
  }, [clients, searchQuery, selectedTag]);

  // Export to CSV (Spreadsheet Excel View)
  const handleExportCSV = () => {
    const headers = [
      'Client ID',
      'Name',
      'Phone',
      'Email',
      'Total Visits',
      'Total Spent (PKR)',
      'Free Facials Available',
      'Last Visit Date',
      'Loyalty Punch Count',
      'Notes',
    ];

    const rows = filteredClients.map((c) => [
      c.id,
      `"${c.name.replace(/"/g, '""')}"`,
      role === 'owner' ? c.phone : maskClientPhone(c.phone, role),
      c.email ? `"${c.email.replace(/"/g, '""')}"` : '',
      c.total_visits,
      c.total_spent,
      role === 'owner' ? c.loyalty_free_facials_available : '"[Protected]"',
      c.last_visit_date || '',
      role === 'owner' ? c.loyalty_visits_count : '"[Protected]"',
      c.notes ? `"${c.notes.replace(/"/g, '""')}"` : '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TGS_Client_Directory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Spreadsheet exported to CSV successfully');
  };

  const handleOpenAdd = () => {
    if (role !== 'owner') {
      toast.error('Client Directory is Read-Only for non-owners (Anti-Theft Protection).');
      return;
    }
    setEditingClient(null);
    setName('');
    setPhone('');
    setEmail('');
    setNotes('');
    setTagInput('Regular');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: ClientRecord) => {
    if (role !== 'owner') {
      toast.error('Client editing is restricted to the Owner (Anti-Theft Protection).');
      return;
    }
    setEditingClient(c);
    setName(c.name);
    setPhone(c.phone);
    setEmail(c.email || '');
    setNotes(c.notes || '');
    setTagInput((c.tags || ['Regular'])[0] || 'Regular');
    setIsModalOpen(true);
  };

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Client name is required');
      return;
    }

    const clean = phone.replace(/\D/g, '');
    if (!clean.startsWith('03')) {
      toast.error("Phone number must start with '03' (e.g. 03001234567)");
      return;
    }
    if (clean.length !== 11) {
      toast.error("Phone number must be exactly 11 digits (e.g. 03001234567)");
      return;
    }

    if (editingClient) {
      await updateClient(editingClient.id, {
        name: name.trim(),
        phone: clean,
        email: email.trim() || null,
        notes: notes.trim() || null,
        tags: [tagInput.trim() || 'Regular'],
      });
    } else {
      await addClient({
        name: name.trim(),
        phone: clean,
        email: email.trim() || null,
        notes: notes.trim() || null,
        preferred_staff_id: null,
        preferred_staff_name: null,
        tags: [tagInput.trim() || 'Regular'],
      });
    }

    setIsModalOpen(false);
  };

  // Helper to extract service & barber items from invoice or fallback notes
  const getDisplayItems = (inv: Invoice) => {
    if (inv.items && inv.items.length > 0) return inv.items;
    if (inv.notes && inv.notes.includes('Breakdown:')) {
      const parts = inv.notes.split('Breakdown:')[1].split('|')[0].trim();
      const splitted = parts.split('+').map((s) => s.trim());
      if (splitted.length > 0) {
        return splitted.map((str, idx) => {
          const namePart = str.split('(')[0]?.trim() || 'Salon Service';
          const barberPart = str.includes('(') ? str.split('(')[1]?.split('-')[0]?.trim() : 'Senior Barber';
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
        service_name: 'Haircut & Styling',
        category: 'Grooming',
        price: inv.total_amount,
        staff_id: null,
        staff_name: 'Senior Barber',
        commission_rate: 0,
        commission_amount: 0,
      },
    ];
  };

  // Find all historical service visits and timestamps for a specific client
  const clientVisits = useMemo(() => {
    if (!selectedClientDetail) return [];
    return invoices
      .filter((inv) => inv.client_id === selectedClientDetail.id || inv.client_phone === selectedClientDetail.phone)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [invoices, selectedClientDetail]);

  const handleSendWhatsAppPromo = (c: ClientRecord) => {
    const text = `Dear ${c.name}, thank you for choosing The Grooming Studio (TGS)! You currently have ${c.loyalty_visits_count}/5 visits on your facial loyalty card. Visit us soon for your signature haircut & grooming!`;
    sendWhatsAppMessage(c.phone, text);
    toast.success(`Opening WhatsApp for ${c.name}...`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header (Clean view without Privacy Masked tag) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Client Directory &amp; CRM</h1>
            <Badge variant="outline" className="border-primary/40 text-primary">
              Spreadsheet &amp; History
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Full customer directory with complete visit timestamps, service histories, loyalty points, and Excel spreadsheet export.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle View Mode */}
          <div className="flex items-center border border-border/80 rounded-xl p-0.5 bg-card">
            <Button
              variant={viewMode === 'spreadsheet' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('spreadsheet')}
              className="text-xs h-8 gap-1.5 px-2.5 font-semibold rounded-lg"
            >
              <TableIcon className="w-3.5 h-3.5" />
              Spreadsheet View
            </Button>
            <Button
              variant={viewMode === 'cards' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('cards')}
              className="text-xs h-8 gap-1.5 px-2.5 font-semibold rounded-lg"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Profile Cards
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="text-xs h-9 gap-1.5 font-semibold rounded-xl"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </Button>

          {role === 'owner' ? (
            <Button onClick={handleOpenAdd} className="text-xs font-bold gap-1.5 h-9 rounded-xl shadow-sm">
              <Plus className="w-4 h-4" />
              Add Customer
            </Button>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 h-9 rounded-xl bg-amber-50 text-amber-800 border border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 text-xs font-semibold select-none">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>Anti-Theft Active (Read-Only)</span>
            </div>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border border-border/80 p-3.5 rounded-2xl bg-card shadow-sm">
          <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Registered Clients</div>
          <div className="text-2xl font-black text-foreground mt-0.5 font-mono">{clients.length}</div>
          <p className="text-[10px] text-muted-foreground mt-0.5">Active customer profiles</p>
        </Card>

        <Card className="border border-border/80 p-3.5 rounded-2xl bg-card shadow-sm">
          <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Customer Value</div>
          <div className="text-2xl font-black text-emerald-600 mt-0.5 font-mono">
            {currencyFormat(clients.reduce((acc, c) => acc + c.total_spent, 0))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">Cumulative lifetime spend</p>
        </Card>

        <Card className="border border-border/80 p-3.5 rounded-2xl bg-card shadow-sm">
          <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Free Facials Earned</div>
          <div className="text-2xl font-black text-primary mt-0.5 font-mono">
            {clients.reduce((acc, c) => acc + c.loyalty_free_facials_available, 0)}
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">Punch card rewards ready</p>
        </Card>

        <Card className="border border-border/80 p-3.5 rounded-2xl bg-card shadow-sm">
          <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Top Spenders (Rs. 10k+)</div>
          <div className="text-2xl font-black text-amber-600 mt-0.5 font-mono">
            {clients.filter((c) => c.total_spent > 10000).length}
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">High-frequency patrons</p>
        </Card>
      </div>

      {/* Search and Filter Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by client name, mobile phone (03...), email, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9 text-xs rounded-xl"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          <div className="flex items-center rounded-xl border border-border/70 p-0.5 bg-muted/30 text-xs">
            <button
              onClick={() => setSelectedTag('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                selectedTag === 'all' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              All Clients ({clients.length})
            </button>
            <button
              onClick={() => setSelectedTag('vip')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                selectedTag === 'vip' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              Top Spenders
            </button>
            <button
              onClick={() => setSelectedTag('free_facial')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                selectedTag === 'free_facial' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              Free Facial Ready
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: SPREADSHEET EXCEL TABLE VIEW */}
      {viewMode === 'spreadsheet' && (
        <Card className="rounded-2xl border-border/80 shadow-sm bg-card">
          <CardHeader className="p-4 pb-2 border-b border-border/60 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                Customer Master Spreadsheet
              </CardTitle>
              <CardDescription className="text-xs">
                Direct tabular grid of all customers with service histories and contact channels
              </CardDescription>
            </div>
            <span className="text-xs font-mono text-muted-foreground">
              {filteredClients.length} rows loaded
            </span>
          </CardHeader>
          <CardContent className="p-0">
            <div className="w-full max-w-full overflow-x-auto bg-card rounded-b-2xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/40 text-muted-foreground border-b border-border/60 font-semibold">
                  <tr>
                    <th className="py-3 px-4 whitespace-nowrap">Customer Name</th>
                    <th className="py-3 px-4 whitespace-nowrap">Phone Number</th>
                    <th className="py-3 px-4 whitespace-nowrap">Visits</th>
                    <th className="py-3 px-4 text-right whitespace-nowrap">Lifetime Spend</th>
                    <th className="py-3 px-4 whitespace-nowrap">Punch Progress</th>
                    <th className="py-3 px-4 whitespace-nowrap">Reward Status</th>
                    <th className="py-3 px-4 whitespace-nowrap">Last Visit</th>
                    <th className="py-3 px-4 text-center whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredClients.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-muted-foreground text-xs">
                        <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        No clients found matching the search query.
                      </td>
                    </tr>
                  ) : (
                    filteredClients.map((client) => (
                      <tr key={client.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-4 font-bold text-foreground whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setSelectedClientDetail(client)}
                            className="hover:underline hover:text-primary text-left font-bold"
                          >
                            {client.name}
                          </button>
                          {client.total_spent > 10000 && (
                            <Badge variant="outline" className="ml-1.5 text-[9px] border-amber-500/50 text-amber-600 font-bold">
                              Top Spender
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono whitespace-nowrap text-foreground font-medium">
                          {role === 'owner' ? client.phone : maskClientPhone(client.phone, role)}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap font-mono">{client.total_visits}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 whitespace-nowrap">
                          {currencyFormat(client.total_spent)}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-mono font-bold">{client.loyalty_visits_count}/5</span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {client.loyalty_free_facials_available > 0 ? (
                            <Badge className="bg-emerald-600 text-white font-bold text-[10px]">
                              {client.loyalty_free_facials_available} Free Facial
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-[11px]">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono text-muted-foreground whitespace-nowrap">
                          {client.last_visit_date || 'No recent visit'}
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            {role === 'owner' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleSendWhatsAppPromo(client)}
                                title="Send WhatsApp Message"
                                className="h-7 w-7 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setSelectedClientDetail(client)}
                              title="View Visit History"
                              className="h-7 w-7 text-primary rounded-lg"
                            >
                              <Clock className="w-3.5 h-3.5" />
                            </Button>
                            {role === 'owner' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenEdit(client)}
                                title="Edit Client"
                                className="h-7 w-7 text-muted-foreground hover:text-foreground rounded-lg"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
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
      )}

      {/* VIEW 2: PROFILE CARDS VIEW */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <Card
              key={client.id}
              className="rounded-2xl border-border/80 shadow-sm hover:shadow-md transition-all cursor-pointer bg-card flex flex-col justify-between"
              onClick={() => setSelectedClientDetail(client)}
            >
              <CardHeader className="p-4 pb-2 border-b border-border/60 flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                    {client.name}
                    {client.total_spent > 10000 && (
                      <Badge variant="outline" className="text-[9px] border-amber-500/50 text-amber-600 font-bold">
                        Top Spender
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="text-xs font-mono mt-1 text-foreground">
                    {role === 'owner' ? client.phone : maskClientPhone(client.phone, role)}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenEdit(client);
                  }}
                  className="h-7 w-7 text-muted-foreground hover:text-foreground rounded-lg"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </Button>
              </CardHeader>

              <CardContent className="p-4 space-y-3 flex-1 flex flex-col justify-between text-xs">
                <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                  <div>
                    <span>Visits: </span>
                    <strong className="text-foreground font-mono">{client.total_visits}</strong>
                  </div>
                  <div>
                    <span>Total Spent: </span>
                    <strong className="text-emerald-600 font-mono">{currencyFormat(client.total_spent)}</strong>
                  </div>
                </div>

                {/* 5-Visit Facial Tracker */}
                <div className="p-2.5 rounded-xl border border-border/60 bg-muted/20 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-medium">
                    <span>5-Visit Facial Milestone:</span>
                    <span className="font-bold text-foreground font-mono">{client.loyalty_visits_count} / 5</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-primary h-full transition-all"
                      style={{ width: `${Math.min(100, (client.loyalty_visits_count / 5) * 100)}%` }}
                    />
                  </div>
                </div>

                {client.notes && (
                  <p className="text-[11px] text-muted-foreground italic truncate">&ldquo;{client.notes}&rdquo;</p>
                )}

                <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/40">
                  <span>Last Visit: {client.last_visit_date || 'No recent visit'}</span>
                  <span className="text-primary font-bold">Inspect Profile &rarr;</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Client Detail Timeline Dialog */}
      <Dialog open={!!selectedClientDetail} onOpenChange={(open) => !open && setSelectedClientDetail(null)}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl">
          {selectedClientDetail && (
            <>
              <DialogHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <DialogTitle className="text-lg font-bold flex items-center gap-2">
                      {selectedClientDetail.name}
                      {selectedClientDetail.loyalty_free_facials_available > 0 && (
                        <Badge className="bg-emerald-600 text-white text-xs font-bold">
                          Free Facial Ready
                        </Badge>
                      )}
                      {selectedClientDetail.total_spent > 10000 && (
                        <Badge variant="outline" className="text-[10px] border-amber-500/50 text-amber-600 font-bold">
                          Top Spender
                        </Badge>
                      )}
                    </DialogTitle>
                    <DialogDescription className="text-xs font-mono mt-0.5">
                      Phone: {role === 'owner' ? selectedClientDetail.phone : maskClientPhone(selectedClientDetail.phone, role)} {selectedClientDetail.email && `• ${selectedClientDetail.email}`}
                    </DialogDescription>
                  </div>

                  {role === 'owner' && (
                    <Button
                      size="sm"
                      onClick={() => {
                        const cleanPhone = selectedClientDetail.phone.replace(/[^0-9]/g, '');
                        const formattedPhone = cleanPhone.startsWith('92') ? cleanPhone : '92' + cleanPhone.replace(/^0/, '');
                        const msg = `Salam ${selectedClientDetail.name}! Greetings from ${settings.salon_name || 'The Grooming Studio'}. How can we assist you with your grooming appointment today?`;
                        window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`, '_blank');
                      }}
                      className="h-8 px-3 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white gap-1 self-start sm:self-auto"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      Chat on WhatsApp
                    </Button>
                  )}
                </div>
              </DialogHeader>

              <div className="space-y-4 text-xs pt-2">
                {/* Stats Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 p-3 rounded-xl border border-border/60 bg-muted/20">
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase">Total Invoiced</div>
                    <div className="text-base font-bold text-emerald-600 font-mono mt-0.5">
                      {currencyFormat(selectedClientDetail.total_spent)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase">Completed Visits</div>
                    <div className="text-base font-bold text-foreground font-mono mt-0.5">
                      {selectedClientDetail.total_visits}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase">Avg Ticket (AOV)</div>
                    <div className="text-base font-bold text-primary font-mono mt-0.5">
                      {currencyFormat(
                        selectedClientDetail.total_visits > 0
                          ? Math.round(selectedClientDetail.total_spent / selectedClientDetail.total_visits)
                          : 0
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase">Punch Card</div>
                    <div className="text-base font-bold text-foreground font-mono mt-0.5">
                      {selectedClientDetail.loyalty_visits_count} / 5
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase">Free Rewards</div>
                    <div className="text-base font-bold text-emerald-600 font-mono mt-0.5">
                      {selectedClientDetail.loyalty_free_facials_available} Ready
                    </div>
                  </div>
                </div>

                {/* Visit History Log */}
                <div className="space-y-2">
                  <h4 className="font-bold text-foreground text-xs flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    Visit &amp; Service History ({clientVisits.length} recorded bills)
                  </h4>

                  {clientVisits.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground rounded-xl border border-dashed">
                      No invoices recorded for this client yet.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                      {clientVisits.map((inv) => (
                        <div key={inv.id} className="p-3 rounded-xl border border-border/60 bg-card space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-semibold">
                            <span className="font-mono text-primary font-bold">{inv.invoice_number}</span>
                            <span className="text-muted-foreground text-[11px] font-mono">
                              {new Date(inv.created_at).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}{' '}
                              •{' '}
                              {new Date(inv.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true,
                              })}
                            </span>
                          </div>

                          <div className="space-y-1.5 pt-1">
                            {getDisplayItems(inv).map((it, idx) => (
                              <div key={idx} className="flex items-center justify-between text-[11px] p-1.5 rounded-lg bg-muted/30">
                                <span className="font-medium text-foreground flex items-center gap-2">
                                  <span>{it.service_name}</span>
                                  <span className="text-[10px] font-bold text-primary px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 flex items-center gap-1">
                                    <Scissors className="w-2.5 h-2.5" />
                                    <span>{it.staff_name && it.staff_name !== 'Unassigned' ? it.staff_name : 'Senior Barber'}</span>
                                  </span>
                                </span>
                                <span className="font-mono font-bold">{currencyFormat(it.price)}</span>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t text-[11px] font-semibold">
                            <span className="text-muted-foreground text-[10px]">
                              {inv.payment_method} • {inv.discount_amount > 0 ? `Discount: -${currencyFormat(inv.discount_amount)}` : 'No Discount'}
                            </span>
                            <span className="text-foreground font-bold">
                              Paid: <span className="text-primary font-mono">{currencyFormat(inv.total_amount)}</span>
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedClientDetail(null)} className="text-xs h-8 rounded-xl">
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add / Edit Client Modal with Compulsory 11-Digit '03' Validation */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              {editingClient ? 'Edit Client Record' : 'Register New Client'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Client phone number is strictly compulsory 11 digits starting with 03.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveClient} className="space-y-3.5 text-xs py-1">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Client Full Name *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Asad Siddiqui"
                className="text-xs rounded-xl"
                required
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Mobile Phone (Compulsory 11 Digits starting with 03) *</Label>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {phone.replace(/\D/g, '').length}/11 digits
                </span>
              </div>
              <Input
                type="tel"
                maxLength={11}
                placeholder="03XXXXXXXXX (Enter entire 11 digits)"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                className="text-xs font-mono font-bold rounded-xl"
                required
              />
              <p className="text-[10px] text-muted-foreground">
                Enter full 11-digit number starting with <strong className="text-foreground">03</strong> (e.g. 03001234567).
              </p>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Email Address (Optional)</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@example.com"
                className="text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Client Classification / Tag</Label>
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Regular, VIP, Corporate..."
                className="text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Styling Notes &amp; Grooming Preferences</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Low fade with textured top, sensitive skin, prefers green tea..."
                rows={2}
                className="text-xs rounded-xl"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="text-xs rounded-xl">
                Cancel
              </Button>
              <Button type="submit" className="text-xs font-bold rounded-xl">
                {editingClient ? 'Update Client' : 'Create Customer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
