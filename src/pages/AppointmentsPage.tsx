import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSalon } from '@/contexts/SalonContext';
import type { AppointmentRecord, AppointmentStatus } from '@/types/salon';
import {
  CalendarCheck2,
  Plus,
  Clock,
  User,
  Scissors,
  CheckCircle2,
  Trash2,
  Edit2,
  CreditCard,
  Armchair,
  Search,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export const AppointmentsPage: React.FC = () => {
  const {
    appointments,
    staff,
    services,
    clients,
    addAppointment,
    updateAppointmentStatus,
    updateAppointment,
    deleteAppointment,
    role,
  } = useSalon();
  const navigate = useNavigate();

  const [dateFilter, setDateFilter] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppt, setEditingAppt] = useState<AppointmentRecord | null>(null);
  const [deletingApptId, setDeletingApptId] = useState<string | null>(null);

  // Form State
  const [formClientName, setFormClientName] = useState('');
  const [formClientPhone, setFormClientPhone] = useState('');
  const [formStaffId, setFormStaffId] = useState<string>('none');
  const [formServiceId, setFormServiceId] = useState<string>('none');
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formTime, setFormTime] = useState('11:00 AM');
  const [formDuration, setFormDuration] = useState<number>(30);
  const [formChair, setFormChair] = useState<number>(1);
  const [formStatus, setFormStatus] = useState<AppointmentStatus>('Confirmed');
  const [formNotes, setFormNotes] = useState('');

  // Visible appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter((a) => {
      const matchesDate = !dateFilter || a.appointment_date === dateFilter;
      const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        a.client_name.toLowerCase().includes(q) ||
        a.client_phone.includes(q) ||
        a.service_name.toLowerCase().includes(q) ||
        a.staff_name.toLowerCase().includes(q);

      return matchesDate && matchesStatus && matchesSearch;
    });
  }, [appointments, dateFilter, statusFilter, searchQuery]);

  // Live Chairs Board (Chairs 1, 2, 3, 4)
  const chairOccupancy = useMemo(() => {
    const chairs: Record<number, AppointmentRecord | null> = {
      1: null,
      2: null,
      3: null,
      4: null,
    };

    const inChairAppts = appointments.filter(
      (a) => a.appointment_date === dateFilter && a.status === 'In-Service'
    );

    for (const appt of inChairAppts) {
      if (appt.chair_number && chairs[appt.chair_number] === null) {
        chairs[appt.chair_number] = appt;
      } else if (appt.chair_number && chairs[appt.chair_number]) {
        chairs[appt.chair_number] = appt;
      }
    }

    return chairs;
  }, [appointments, dateFilter]);

  const handleOpenAdd = () => {
    setEditingAppt(null);
    setFormClientName('');
    setFormClientPhone('');
    setFormStaffId(staff[0]?.id || 'none');
    setFormServiceId(services[0]?.id || 'none');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormTime('12:00 PM');
    setFormDuration(30);
    setFormChair(1);
    setFormStatus('Confirmed');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (appt: AppointmentRecord) => {
    setEditingAppt(appt);
    setFormClientName(appt.client_name);
    setFormClientPhone(appt.client_phone);
    setFormStaffId(appt.staff_id || 'none');
    setFormServiceId(appt.service_id || 'none');
    setFormDate(appt.appointment_date);
    setFormTime(appt.appointment_time);
    setFormDuration(appt.duration_minutes || 30);
    setFormChair(appt.chair_number || 1);
    setFormStatus(appt.status);
    setFormNotes(appt.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formClientName.trim() || !formClientPhone.trim()) {
      toast.error('Client name and phone number are required');
      return;
    }

    const selectedStaff = staff.find((s) => s.id === formStaffId);
    const selectedService = services.find((s) => s.id === formServiceId);

    if (editingAppt) {
      await updateAppointment(editingAppt.id, {
        client_name: formClientName.trim(),
        client_phone: formClientPhone.trim(),
        staff_id: formStaffId === 'none' ? '' : formStaffId,
        staff_name: selectedStaff?.name || 'Unassigned',
        service_id: formServiceId === 'none' ? '' : formServiceId,
        service_name: selectedService?.name || 'Custom Grooming',
        appointment_date: formDate,
        appointment_time: formTime,
        chair_number: Number(formChair),
        duration_minutes: Number(formDuration),
        status: formStatus,
        notes: formNotes.trim() || null,
      });
    } else {
      await addAppointment({
        client_name: formClientName.trim(),
        client_phone: formClientPhone.trim(),
        staff_id: formStaffId === 'none' ? '' : formStaffId,
        staff_name: selectedStaff?.name || 'Unassigned',
        service_id: formServiceId === 'none' ? '' : formServiceId,
        service_name: selectedService?.name || 'Custom Grooming',
        appointment_date: formDate,
        appointment_time: formTime,
        chair_number: Number(formChair),
        duration_minutes: Number(formDuration),
        status: formStatus,
        notes: formNotes.trim() || null,
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = async () => {
    if (deletingApptId) {
      await deleteAppointment(deletingApptId);
      setDeletingApptId(null);
    }
  };

  const handleStatusChange = async (id: string, newStatus: AppointmentStatus) => {
    await updateAppointmentStatus(id, newStatus);
  };

  const statusBadgeStyle: Record<AppointmentStatus, string> = {
    Scheduled: 'bg-muted text-muted-foreground border-border',
    Confirmed: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
    'In-Service': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-semibold animate-pulse',
    Completed: 'bg-primary/10 text-primary border-primary/30',
    Cancelled: 'bg-destructive/10 text-destructive border-destructive/30',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Chairs & Live Queue Schedule</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage salon workstation chairs, customer queue, and bookings.
          </p>
        </div>

        <Button onClick={handleOpenAdd} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" />
          Book Appointment
        </Button>
      </div>

      {/* Live Barber Workstation Chairs (Chairs 1-4) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground flex items-center gap-1.5">
            <Armchair className="w-4 h-4 text-primary" />
            Live Barber Workstation Chairs
          </h2>
          <span className="text-xs text-muted-foreground">Showing status for {dateFilter}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((chairNum) => {
            const occupant = chairOccupancy[chairNum];
            return (
              <Card
                key={chairNum}
                className={`p-3.5 rounded border transition-colors ${
                  occupant ? 'border-emerald-500/50 bg-emerald-50/20' : 'border-border bg-card'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Chair #{chairNum}
                  </span>
                  <Badge
                    variant={occupant ? 'default' : 'secondary'}
                    className={`text-[9px] ${
                      occupant ? 'bg-emerald-600 text-white font-semibold' : 'text-muted-foreground'
                    }`}
                  >
                    {occupant ? 'In-Service' : 'Available'}
                  </Badge>
                </div>

                {occupant ? (
                  <div className="mt-2.5 space-y-1">
                    <div className="font-semibold text-sm text-foreground truncate">
                      {occupant.client_name}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Scissors className="w-3 h-3 text-primary" />
                      <span className="truncate">{occupant.service_name}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground flex items-center justify-between pt-1 border-t">
                      <span>Barber: {occupant.staff_name}</span>
                      <span className="font-mono">{occupant.appointment_time}</span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 text-center py-2 text-muted-foreground">
                    <p className="text-xs font-medium">Ready for walk-in</p>
                    <p className="text-[10px]">No active service in this chair</p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Filter and Date Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search appointment by Client, Barber, or Service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-36 text-xs h-9"
          />

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 text-xs h-9">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="text-xs">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Scheduled">Scheduled</SelectItem>
              <SelectItem value="Confirmed">Confirmed</SelectItem>
              <SelectItem value="In-Service">In-Service</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Appointment Queue List */}
      <Card className="border shadow-sm">
        <CardContent className="p-0">
          <div className="w-full max-w-full overflow-x-auto bg-card">
            <table className="w-full text-left text-xs [&>div]:max-w-full">
              <thead className="bg-muted/50 border-b text-muted-foreground font-medium">
                <tr>
                  <th className="py-3 px-4 whitespace-nowrap">Time & Chair</th>
                  <th className="py-3 px-4 whitespace-nowrap">Client</th>
                  <th className="py-3 px-4 whitespace-nowrap">Service</th>
                  <th className="py-3 px-4 whitespace-nowrap">Assigned Barber</th>
                  <th className="py-3 px-4 whitespace-nowrap">Status</th>
                  <th className="py-3 px-4 whitespace-nowrap text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      No appointments found for this date.
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((appt) => (
                    <tr key={appt.id} className="hover:bg-muted/30">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-semibold text-foreground">{appt.appointment_time}</div>
                        <div className="text-[10px] text-muted-foreground">
                          Chair #{appt.chair_number || 1}
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-semibold text-foreground">{appt.client_name}</div>
                        <div className="font-mono text-[11px] text-muted-foreground">
                          {appt.client_phone}
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap font-medium text-foreground">
                        {appt.service_name}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-muted-foreground">
                        {appt.staff_name}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <Select
                          value={appt.status}
                          onValueChange={(val) =>
                            handleStatusChange(appt.id, val as AppointmentStatus)
                          }
                        >
                          <SelectTrigger className={`h-6 text-[10px] w-28 ${statusBadgeStyle[appt.status]}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="text-xs">
                            <SelectItem value="Scheduled">Scheduled</SelectItem>
                            <SelectItem value="Confirmed">Confirmed</SelectItem>
                            <SelectItem value="In-Service">In-Service</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(appt)}
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingApptId(appt.id)}
                            className="h-7 w-7 text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
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

      {/* Add / Edit Appointment Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingAppt ? 'Edit Appointment' : 'Book New Client Appointment'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-3.5 py-2">
            <div className="space-y-1">
              <Label className="text-xs">Customer Name *</Label>
              <Input
                placeholder="e.g. Asad Umar"
                value={formClientName}
                onChange={(e) => setFormClientName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Phone Number *</Label>
              <Input
                placeholder="e.g. +92 300 1234567"
                value={formClientPhone}
                onChange={(e) => setFormClientPhone(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Grooming Service</Label>
                <Select value={formServiceId} onValueChange={setFormServiceId}>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Select Service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services
                      .filter((s) => s.is_active)
                      .map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name} (Rs. {s.price})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Barber / Stylist</Label>
                <Select value={formStaffId} onValueChange={setFormStaffId}>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Assign Staff" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff
                      .filter((s) => s.is_active)
                      .map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Date</Label>
                <Input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Time Slot</Label>
                <Input
                  placeholder="e.g. 03:30 PM"
                  value={formTime}
                  onChange={(e) => setFormTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Chair Station</Label>
                <Select
                  value={formChair.toString()}
                  onValueChange={(val) => setFormChair(Number(val))}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Chair #1</SelectItem>
                    <SelectItem value="2">Chair #2</SelectItem>
                    <SelectItem value="3">Chair #3</SelectItem>
                    <SelectItem value="4">Chair #4</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Status</Label>
                <Select
                  value={formStatus}
                  onValueChange={(val) => setFormStatus(val as AppointmentStatus)}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="Confirmed">Confirmed</SelectItem>
                    <SelectItem value="In-Service">In-Service</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Notes / Requests</Label>
              <Input
                placeholder="e.g. Client requested hot towel massage beforehand"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingAppt ? 'Update Booking' : 'Confirm Booking'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingApptId}
        onOpenChange={(open) => !open && setDeletingApptId(null)}
      >
        <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel and Remove Booking?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Are you sure you want to cancel this appointment?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Cancel Appointment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
