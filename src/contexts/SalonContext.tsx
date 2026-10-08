import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/db/supabase';
import type {
  SalonSettings,
  StaffMember,
  SalonService,
  ClientRecord,
  Invoice,
  InvoiceItem,
  ExpenseRecord,
  DayClosingRecord,
  SalonAppointment,
  SalonChair,
  SalonRole,
  UserAccount,
  UserStatus,
  RolePermissions,
  RoleNavTab,
  LoyaltyProgram,
  ServiceCategoryRecord,
  MarketingCampaign,
  StaffPayType,
  OwnerNote,
  AttendanceStatus,
  StaffAttendanceRecord,
  AttendanceSalaryCalculation,
  StampHistoryRecord,
  StaffPermissionsConfig,
  LatePenaltyRuleConfig,
} from '@/types/salon';
import { toast } from 'sonner';

export const DEFAULT_ACCOUNTS: UserAccount[] = [
  {
    id: 'a19bf7f6-941f-4cfd-b41a-71d27f387968',
    name: 'Salon Owner',
    email: 'owner@tgs.pk',
    role: 'owner',
    status: 'approved',
    phone: '+92 300 8271920',
    cnic: '42101-1234567-1',
    password_hash: 'admin123',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: '4462ad92-fa50-4045-af06-c5f0035ed172',
    name: 'Floor Manager',
    email: 'manager@tgs.pk',
    role: 'manager',
    status: 'approved',
    phone: '+92 301 9283746',
    cnic: '42101-2345678-2',
    password_hash: 'manager123',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
  },
];

export const DEFAULT_STAFF: StaffMember[] = [
  {
    id: 'staff-1',
    name: 'Tariq Mehmood',
    phone: '+92 300 8765432',
    email: 'tariq@tgs.pk',
    cnic: '42101-9876543-1',
    role: 'senior_barber',
    pay_type: 'individual_partnership',
    base_salary: 0,
    commission_rate: 60,
    partnership_percentage: 60,
    station_fee: 3000,
    specialization: 'Master Scissor Cuts & Beard Sculpting',
    is_active: true,
  },
  {
    id: 'staff-2',
    name: 'Hamza Ali',
    phone: '+92 321 7654321',
    email: 'hamza@tgs.pk',
    cnic: '42101-8765432-2',
    role: 'barber',
    pay_type: 'commission_only',
    base_salary: 0,
    commission_rate: 30,
    partnership_percentage: 0,
    station_fee: 0,
    specialization: 'Skin Fades & Hot Towel Shave',
    is_active: true,
  },
  {
    id: 'staff-3',
    name: 'Kamran Shah',
    phone: '+92 333 6543210',
    email: 'kamran@tgs.pk',
    cnic: '42101-7654321-3',
    role: 'stylist',
    pay_type: 'salary_plus_commission',
    base_salary: 28000,
    commission_rate: 15,
    partnership_percentage: 0,
    station_fee: 0,
    specialization: 'Hair Keratin & Protein Therapies',
    is_active: true,
  },
  {
    id: 'staff-4',
    name: 'Bilal Ahmed',
    phone: '+92 301 9283746',
    email: 'bilal@tgs.pk',
    cnic: '42101-2345678-2',
    role: 'manager',
    pay_type: 'salary_only',
    base_salary: 45000,
    commission_rate: 0,
    partnership_percentage: 0,
    station_fee: 0,
    specialization: 'Salon Operations & Front Desk',
    is_active: true,
  },
  {
    id: 'staff-5',
    name: 'Zeeshan Butt',
    phone: '+92 345 5432109',
    email: 'zeeshan@tgs.pk',
    cnic: '42101-6543210-4',
    role: 'barber',
    pay_type: 'individual_partnership',
    base_salary: 0,
    commission_rate: 70,
    partnership_percentage: 70,
    station_fee: 5000,
    specialization: 'Grooming & Groom Wedding Styling',
    is_active: true,
  },
];

export const DEFAULT_PERMISSIONS: Record<SalonRole, RolePermissions> = {
  owner: {
    can_manage_billing: true,
    can_manage_expenses: true,
    can_manage_staff: true,
    can_manage_payroll: true,
    can_manage_day_closing: true,
    can_view_clients: true,
    can_edit_clients: true,
    can_manage_services: true,
    can_view_reports: true,
    can_edit_settings: true,
    can_manage_loyalty: true,
    can_manage_roles: true,
    can_manage_marketing: true,
  },
  manager: {
    can_manage_billing: true,
    can_manage_expenses: true,
    can_manage_staff: true,
    can_manage_payroll: true,
    can_manage_day_closing: true,
    can_view_clients: true,
    can_edit_clients: false, // Manager can view clients but cannot edit/delete
    can_manage_services: false,
    can_view_reports: true, // Side-by-side daily sales & expense report
    can_edit_settings: false,
    can_manage_loyalty: true,
    can_manage_roles: false,
    can_manage_marketing: true,
  },
  worker: {
    can_manage_billing: false,
    can_manage_expenses: false,
    can_manage_staff: false,
    can_manage_payroll: false,
    can_manage_day_closing: false,
    can_view_clients: false,
    can_edit_clients: false,
    can_manage_services: false,
    can_view_reports: false,
    can_edit_settings: false,
    can_manage_loyalty: false,
    can_manage_roles: false,
    can_manage_marketing: false,
  },
  cashier: {
    can_manage_billing: true,
    can_manage_expenses: true,
    can_manage_staff: false,
    can_manage_payroll: false,
    can_manage_day_closing: true,
    can_view_clients: true,
    can_edit_clients: true,
    can_manage_services: false,
    can_view_reports: true,
    can_edit_settings: false,
    can_manage_loyalty: true,
    can_manage_roles: false,
    can_manage_marketing: false,
  },
};

export const DEFAULT_ROLE_NAV_TABS: RoleNavTab[] = [
  // Manager
  { role: 'manager', tab_id: 'billing', tab_name: 'Billing / POS', is_enabled: true },
  { role: 'manager', tab_id: 'daily-reports', tab_name: 'Daily Sync Report', is_enabled: true },
  { role: 'manager', tab_id: 'attendance', tab_name: 'Staff Attendance', is_enabled: true },
  { role: 'manager', tab_id: 'expenses', tab_name: 'Expenses', is_enabled: true },
  { role: 'manager', tab_id: 'day-closing', tab_name: 'Day Closing', is_enabled: true },
  { role: 'manager', tab_id: 'clients', tab_name: 'Client Directory', is_enabled: true },
  { role: 'manager', tab_id: 'loyalty', tab_name: 'Customer Loyalty', is_enabled: true },
  { role: 'manager', tab_id: 'staff', tab_name: 'Staff & Payroll', is_enabled: true },
  { role: 'manager', tab_id: 'marketing', tab_name: 'Marketing Campaigns', is_enabled: true },
  { role: 'manager', tab_id: 'appointments', tab_name: 'Chairs & Queue', is_enabled: true },
  { role: 'manager', tab_id: 'services', tab_name: 'Services Catalog', is_enabled: false },
  { role: 'manager', tab_id: 'notes', tab_name: 'My Notes', is_enabled: false },
  { role: 'manager', tab_id: 'settings', tab_name: 'Settings', is_enabled: false },
  { role: 'manager', tab_id: 'ledger', tab_name: 'Owner Ledger & Target', is_enabled: false },
  { role: 'manager', tab_id: 'knowledge-vault', tab_name: 'Salon Pro Playbook', is_enabled: false },
  { role: 'manager', tab_id: 'source-export', tab_name: 'Source Code ZIP', is_enabled: false },
  // Worker
  { role: 'worker', tab_id: 'attendance', tab_name: 'My Attendance', is_enabled: true },
  { role: 'worker', tab_id: 'appointments', tab_name: 'Chairs & Queue', is_enabled: true },
  { role: 'worker', tab_id: 'staff', tab_name: 'My Commissions', is_enabled: true },
  { role: 'worker', tab_id: 'billing', tab_name: 'Billing / POS', is_enabled: false },
  { role: 'worker', tab_id: 'daily-reports', tab_name: 'Daily Sync Report', is_enabled: false },
  { role: 'worker', tab_id: 'expenses', tab_name: 'Expenses', is_enabled: false },
  { role: 'worker', tab_id: 'day-closing', tab_name: 'Day Closing', is_enabled: false },
  { role: 'worker', tab_id: 'clients', tab_name: 'Client Directory', is_enabled: false },
  { role: 'worker', tab_id: 'loyalty', tab_name: 'Customer Loyalty', is_enabled: false },
  { role: 'worker', tab_id: 'marketing', tab_name: 'Marketing Campaigns', is_enabled: false },
  { role: 'worker', tab_id: 'services', tab_name: 'Services Catalog', is_enabled: false },
  { role: 'worker', tab_id: 'notes', tab_name: 'My Notes', is_enabled: false },
  { role: 'worker', tab_id: 'settings', tab_name: 'Settings', is_enabled: false },
  { role: 'worker', tab_id: 'ledger', tab_name: 'Owner Ledger & Target', is_enabled: false },
  { role: 'worker', tab_id: 'knowledge-vault', tab_name: 'Salon Pro Playbook', is_enabled: false },
  { role: 'worker', tab_id: 'source-export', tab_name: 'Source Code ZIP', is_enabled: false },
  // Cashier
  { role: 'cashier', tab_id: 'billing', tab_name: 'Billing / POS', is_enabled: true },
  { role: 'cashier', tab_id: 'daily-reports', tab_name: 'Daily Sync Report', is_enabled: true },
  { role: 'cashier', tab_id: 'attendance', tab_name: 'Staff Attendance', is_enabled: true },
  { role: 'cashier', tab_id: 'expenses', tab_name: 'Quick Expenses', is_enabled: true },
  { role: 'cashier', tab_id: 'day-closing', tab_name: 'Day Closing', is_enabled: true },
  { role: 'cashier', tab_id: 'clients', tab_name: 'Client Directory', is_enabled: true },
  { role: 'cashier', tab_id: 'loyalty', tab_name: 'Customer Loyalty', is_enabled: true },
  { role: 'cashier', tab_id: 'appointments', tab_name: 'Chairs & Queue', is_enabled: false },
  { role: 'cashier', tab_id: 'staff', tab_name: 'Staff & Payroll', is_enabled: false },
  { role: 'cashier', tab_id: 'marketing', tab_name: 'Marketing Campaigns', is_enabled: false },
  { role: 'cashier', tab_id: 'services', tab_name: 'Services Catalog', is_enabled: false },
  { role: 'cashier', tab_id: 'notes', tab_name: 'My Notes', is_enabled: false },
  { role: 'cashier', tab_id: 'settings', tab_name: 'Settings', is_enabled: false },
  { role: 'cashier', tab_id: 'ledger', tab_name: 'Owner Ledger & Target', is_enabled: false },
  { role: 'cashier', tab_id: 'knowledge-vault', tab_name: 'Salon Pro Playbook', is_enabled: false },
  { role: 'cashier', tab_id: 'source-export', tab_name: 'Source Code ZIP', is_enabled: false },
];

interface SalonContextType {
  currentUser: UserAccount | null;
  userAccounts: UserAccount[];
  pendingUsersCount: number;
  role: SalonRole;
  permissions: RolePermissions;
  allPermissions: Record<SalonRole, RolePermissions>;
  updatePermissions: (newPerms: Partial<RolePermissions>) => void;
  updateRolePermissions: (role: SalonRole, newPerms: Partial<RolePermissions>) => void;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string; status?: UserStatus }>;
  registerUser: (name: string, email: string, password: string, phone?: string, cnic?: string) => Promise<{ success: boolean; error?: string }>;
  approveUser: (userId: string, role: SalonRole, status: UserStatus) => Promise<boolean>;
  updateUser: (userId: string, updates: Partial<UserAccount> & { password?: string }) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;
  logout: () => void;
  
  // Navigation Tabs by Role
  roleNavTabs: RoleNavTab[];
  updateRoleNavTab: (role: SalonRole, tabId: string, isEnabled: boolean) => Promise<boolean>;
  isTabVisibleForCurrentRole: (tabId: string) => boolean;
  
  // Settings
  settings: SalonSettings;
  updateSettings: (newSettings: Partial<SalonSettings>) => Promise<boolean>;
  
  // Staff CRUD
  staff: StaffMember[];
  addStaff: (member: Omit<StaffMember, 'id' | 'created_at'>) => Promise<StaffMember | null>;
  updateStaff: (id: string, updates: Partial<StaffMember>) => Promise<boolean>;
  deleteStaff: (id: string) => Promise<boolean>;
  calculateStaffPayout: (staff: StaffMember, serviceRevenue: number) => {
    payType: StaffPayType;
    baseSalary: number;
    commission: number;
    chairShare: number;
    stationFee: number;
    totalPayout: number;
    description: string;
  };
  
  // Advanced Retention & Wallet Helpers
  updateClientWallet: (clientId: string, deltaAmount: number) => Promise<boolean>;

  // Daily Expense Quota & Financial Safeguards
  dailyExpenseQuota: number;
  updateDailyExpenseQuota: (quota: number) => Promise<void>;
  remainingExpenseQuota: number;
  isQuotaExceeded: boolean;

  // Granular Staff & Management Permissions
  staffPermissions: StaffPermissionsConfig;
  updateStaffPermissions: (updates: Partial<StaffPermissionsConfig>) => Promise<void>;

  // Services & Categories CRUD
  services: SalonService[];
  serviceCategories: ServiceCategoryRecord[];
  addCategory: (name: string, description?: string) => Promise<ServiceCategoryRecord | null>;
  updateCategory: (id: string, name: string, description?: string) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<boolean>;
  addService: (service: Omit<SalonService, 'id' | 'created_at'>) => Promise<SalonService | null>;
  updateService: (id: string, updates: Partial<SalonService>) => Promise<boolean>;
  deleteService: (id: string) => Promise<boolean>;
  togglePinService: (id: string, isPinned: boolean) => Promise<boolean>;
  
  // Marketing Campaigns
  marketingCampaigns: MarketingCampaign[];
  addCampaign: (campaign: Omit<MarketingCampaign, 'id' | 'sent_count' | 'created_at'>) => Promise<MarketingCampaign | null>;
  updateCampaign: (id: string, updates: Partial<MarketingCampaign>) => Promise<boolean>;
  deleteCampaign: (id: string) => Promise<boolean>;
  trackCampaignSend: (id: string) => Promise<void>;
  
  // Client CRM CRUD
  clients: ClientRecord[];
  addClient: (client: Omit<ClientRecord, 'id' | 'total_visits' | 'total_spent' | 'created_at' | 'loyalty_visits_count' | 'loyalty_free_facials_available' | 'total_rewards_claimed'>) => Promise<ClientRecord | null>;
  updateClient: (id: string, updates: Partial<ClientRecord>) => Promise<boolean>;
  deleteClient: (id: string) => Promise<boolean>;
  addClientPunchStamp: (clientId: string) => Promise<{ newStamps: number; rewardEarned: boolean; alreadyStampedToday?: boolean }>;
  editClientPunchStamps: (clientId: string, newStamps: number, notes?: string) => Promise<boolean>;
  removeClientPunchStamp: (clientId: string, notes?: string) => Promise<boolean>;
  redeemClientPunchReward: (clientId: string) => Promise<boolean>;
  
  // Loyalty Programs
  loyaltyPrograms: LoyaltyProgram[];
  toggleLoyaltyProgram: (id: string, is_active: boolean) => Promise<boolean>;
  updateLoyaltyProgram: (id: string, updates: Partial<LoyaltyProgram>) => Promise<boolean>;
  addLoyaltyProgram: (program: Omit<LoyaltyProgram, 'id' | 'created_at'>) => Promise<LoyaltyProgram | null>;
  deleteLoyaltyProgram: (id: string) => Promise<boolean>;
  
  // POS & Invoices
  invoices: Invoice[];
  createInvoice: (
    invoiceData: Omit<Invoice, 'id' | 'invoice_number' | 'created_at' | 'items'>,
    items: Omit<InvoiceItem, 'id' | 'invoice_id'>[]
  ) => Promise<Invoice | null>;
  updateInvoice: (id: string, updates: Partial<Invoice>) => Promise<boolean>;
  refundInvoice: (id: string) => Promise<boolean>;
  deleteInvoice: (id: string) => Promise<boolean>;
  
  // Expenses CRUD
  expenses: ExpenseRecord[];
  addExpense: (expense: Omit<ExpenseRecord, 'id' | 'created_at'>) => Promise<ExpenseRecord | null>;
  updateExpense: (id: string, updates: Partial<ExpenseRecord>) => Promise<boolean>;
  deleteExpense: (id: string) => Promise<boolean>;
  
  // Day Closing & Cash Registers
  cashRegisters: DayClosingRecord[];
  closeDayRegister: (
    openingCash: number,
    actualCash: number,
    notes: string,
    closedBy: string
  ) => Promise<DayClosingRecord | null>;
  
  // Appointments & Live Chair Queue
  appointments: SalonAppointment[];
  addAppointment: (appt: Omit<SalonAppointment, 'id' | 'created_at'>) => Promise<SalonAppointment | null>;
  updateAppointmentStatus: (id: string, status: SalonAppointment['status']) => Promise<boolean>;
  updateAppointment: (id: string, updates: Partial<SalonAppointment>) => Promise<boolean>;
  deleteAppointment: (id: string) => Promise<boolean>;
  chairs: SalonChair[];
  updateChair: (chairId: number, updates: Partial<SalonChair>) => void;
  
  // Offline Resilience
  isOnline: boolean;
  offlineQueueCount: number;
  syncOfflineQueue: () => Promise<void>;
  
  // Automated 11:59 PM Day Closing
  closingCountdown: string;
  autoCloseDayNow: () => Promise<DayClosingRecord | null>;
  
  // WhatsApp Automation
  sendWhatsAppMessage: (phone: string, text: string) => void;
  generateWhatsAppClosingReport: () => string;

  // Owner Notes
  ownerNotes: OwnerNote[];
  addOwnerNote: (note: Omit<OwnerNote, 'id' | 'created_at' | 'updated_at'>) => Promise<OwnerNote | null>;
  updateOwnerNote: (id: string, updates: Partial<OwnerNote>) => Promise<boolean>;
  deleteOwnerNote: (id: string) => Promise<boolean>;

  // Staff Attendance & Auto Salary
  attendanceRecords: StaffAttendanceRecord[];
  clockInStaff: (staffId: string, staffName: string) => Promise<StaffAttendanceRecord | null>;
  clockOutStaff: (staffId: string) => Promise<boolean>;
  logStaffAttendance: (record: Omit<StaffAttendanceRecord, 'id' | 'created_at' | 'updated_at'>) => Promise<StaffAttendanceRecord | null>;
  updateStaffAttendance: (id: string, updates: Partial<StaffAttendanceRecord>) => Promise<boolean>;
  deleteStaffAttendance: (id: string) => Promise<boolean>;
  toggleAttendanceWaiver: (attendanceId: string, isPaidOff: boolean, reason?: string) => Promise<boolean>;
  updateLatePenaltyConfig: (config: Partial<LatePenaltyRuleConfig>) => Promise<void>;
  latePenaltyConfig: LatePenaltyRuleConfig;
  calculateMonthlyAttendanceSalary: (staffMember: StaffMember, monthStr?: string) => AttendanceSalaryCalculation;

  // Utilities
  refreshAll: () => Promise<void>;
  isLoading: boolean;
  currencyFormat: (amount: number) => string;
  resetDemoData: () => Promise<void>;
}

export const DEFAULT_SERVICES: SalonService[] = [
  { id: 'srv-1', name: 'Master Barber Haircut & Wash', category: 'Hair & Styling', price: 900, duration_minutes: 35, is_active: true, is_pinned: true, description: 'Precision scissor cut, taper fade, scalp massage wash & blow dry' },
  { id: 'srv-2', name: 'Royal Hot Towel Beard Shave & Shape', category: 'Beard & Shave', price: 600, duration_minutes: 25, is_active: true, is_pinned: true, description: 'Charcoal pre-shave oil, straight razor shave, iced toner' },
  { id: 'srv-3', name: 'Signature Haircut + Beard Combo', category: 'Hair & Styling', price: 1400, duration_minutes: 50, is_active: true, is_pinned: true, description: 'Complete gentleman makeover with styling and beard grooming' },
  { id: 'srv-4', name: 'Charcoal Blackhead Peel & Steam', category: 'Facial & Skin', price: 1200, duration_minutes: 30, is_active: true, is_pinned: true, description: 'Ultrasonic steam, comedone extraction, tea tree mask' },
  { id: 'srv-5', name: 'Herbal Whitening Glow Facial', category: 'Facial & Skin', price: 2500, duration_minutes: 45, is_active: true, is_pinned: true, description: 'Dermacos botanical extracts, skin polish, fruit glow treatment' },
  { id: 'srv-6', name: 'Keratin Protein Hair Smoothing', category: 'Hair Treatments', price: 6500, duration_minutes: 90, is_active: true, is_pinned: false, description: 'Brazilian keratin therapy to eliminate frizz and strengthen hair' },
  { id: 'srv-7', name: 'Scalp Anti-Dandruff Deep Therapy', category: 'Hair Treatments', price: 1800, duration_minutes: 40, is_active: true, is_pinned: false, description: 'Zinc pyrithione serum massage with infrared heat therapy' },
  { id: 'srv-8', name: 'Men Express Manicure & Pedicure', category: 'Spa & Relaxation', price: 2200, duration_minutes: 45, is_active: true, is_pinned: false, description: 'Exfoliating foot soak, nail shaping, dead skin buffing' },
  { id: 'srv-9', name: 'Royal Groom Day Package', category: 'Wedding & Groom', price: 9500, duration_minutes: 120, is_active: true, is_pinned: true, description: 'Signature haircut, beard design, glow facial, mani-pedi & hair spa' },
  { id: 'srv-10', name: 'Beard Trimming & Lineup', category: 'Beard & Shave', price: 400, duration_minutes: 15, is_active: true, is_pinned: false, description: 'Quick electric clipper fade & cheek razor sharpness' },
  { id: 'srv-11', name: 'Head & Shoulder Herbal Oil Massage', category: 'Spa & Relaxation', price: 800, duration_minutes: 20, is_active: true, is_pinned: false, description: 'Almond & mustard warm oil invigorating tension relief' },
  { id: 'srv-12', name: 'Ammonia-Free Beard / Hair Color', category: 'Hair & Styling', price: 1500, duration_minutes: 30, is_active: true, is_pinned: false, description: 'Natural black or dark brown grey coverage without staining' },
];

export const DEFAULT_CLIENTS: ClientRecord[] = [
  {
    id: 'cli-1',
    name: 'Hamza Farooq',
    phone: '03001234567',
    email: 'hamza.f@gmail.com',
    notes: 'Prefers low skin fade and mild mint aftershave.',
    preferred_staff_name: 'Zeeshan Ali',
    loyalty_visits_count: 4,
    loyalty_free_facials_available: 1,
    total_rewards_claimed: 1,
    wallet_balance: 1500,
    punch_card_stamps: 4,
    vip_station_pass_active: true,
    total_visits: 14,
    total_spent: 24500,
    tags: ['VIP', 'Regular'],
    created_at: new Date(Date.now() - 3600000 * 24 * 60).toISOString(),
  },
  {
    id: 'cli-2',
    name: 'Usman Tariq',
    phone: '03219876543',
    email: 'usman.t@yahoo.com',
    notes: 'Wedding booked next month, requested groom trial.',
    preferred_staff_name: 'Farhan Akhtar',
    loyalty_visits_count: 2,
    loyalty_free_facials_available: 0,
    total_rewards_claimed: 0,
    wallet_balance: 500,
    punch_card_stamps: 2,
    vip_station_pass_active: false,
    total_visits: 7,
    total_spent: 11200,
    tags: ['Groom', 'Regular'],
    created_at: new Date(Date.now() - 3600000 * 24 * 35).toISOString(),
  },
  {
    id: 'cli-3',
    name: 'Ali Raza',
    phone: '03455554321',
    email: 'aliraza.pk@outlook.com',
    notes: 'Beard trimming every Friday before Jummah.',
    preferred_staff_name: 'Zeeshan Ali',
    loyalty_visits_count: 5,
    loyalty_free_facials_available: 1,
    total_rewards_claimed: 0,
    wallet_balance: 0,
    punch_card_stamps: 5,
    vip_station_pass_active: false,
    total_visits: 9,
    total_spent: 9800,
    tags: ['Regular'],
    created_at: new Date(Date.now() - 3600000 * 24 * 40).toISOString(),
  },
  {
    id: 'cli-4',
    name: 'Saad Mehmood',
    phone: '03124443322',
    email: 'saad.m@gmail.com',
    notes: 'Sensitive skin, no alcohol aftershave.',
    preferred_staff_name: 'Kamran Shah',
    loyalty_visits_count: 1,
    loyalty_free_facials_available: 0,
    total_rewards_claimed: 0,
    wallet_balance: 0,
    punch_card_stamps: 1,
    vip_station_pass_active: false,
    total_visits: 3,
    total_spent: 4200,
    tags: ['Regular'],
    created_at: new Date(Date.now() - 3600000 * 24 * 15).toISOString(),
  },
];

const defaultSettings: SalonSettings = {
  id: 'tgs-setting-1',
  salon_name: 'The Grooming Studio TGS',
  tagline: 'Premium Men Salon & Grooming Lounge',
  phone: '+92 300 1234567',
  email: 'info@tgs.pk',
  address: 'Plot 14-C, Main Commercial Street, Phase 6, DHA, Karachi, Pakistan',
  currency_symbol: 'Rs.',
  currency_code: 'PKR',
  tax_rate: 0,
  receipt_header: 'The Grooming Studio TGS - Premium Men Salon',
  receipt_footer: 'Thank you for choosing TGS! Visit us again soon. Contact: +92 300 1234567',
  owner_whatsapp: '+92 300 8271920',
  auto_day_closing_enabled: true,
  auto_day_closing_time: '23:59',
  allow_quick_walkin: false,
  allow_staff_attendance: true,
  daily_expense_quota: 5000,
  late_penalty_config: {
    grace_period_minutes: 15,
    penalty_mode: 'per_minute',
    penalty_rate_per_minute: 20,
    flat_penalty_per_late: 250,
    threshold_minutes_for_half_day: 45,
  },
  staff_permissions: {
    allow_price_override: false,
    allow_manual_discount: true,
    allow_expense_logging: true,
    allow_view_all_commissions: false,
    require_pin_for_void: true,
    allow_client_editing: true,
    allow_void_invoices: false,
    allow_reports_viewing: true,
    allow_ledger_access: false,
  },
  owner_financial_targets: {
    monthly_rent_target: 120000,
    monthly_electricity_target: 45000,
    monthly_utilities_target: 20000,
    daily_sales_target: 25000,
    monthly_net_profit_target: 250000,
  },
  whatsapp_templates: {
    booking_reminder: 'Salam {client_name}! Your grooming appointment at The Grooming Studio TGS is scheduled for {time} with {staff_name}. We look forward to welcoming you!',
    thank_you: 'Dear {client_name}, thank you for visiting The Grooming Studio TGS today! Your bill was Rs. {amount}. We hope you loved your styling. See you on your next visit!',
    punch_milestone: '🎉 Congratulations {client_name}! You completed {stamps}/5 visits at The Grooming Studio TGS. You have unlocked a Complimentary Beard Trim / Express Facial on your next visit!',
    closing_report: '💈 *TGS Daily Closing Report ({date})*\nTotal Bills: {total_bills}\nGross Sales: Rs. {gross_sales}\nCash in Drawer: Rs. {cash_sales}\nOnline Transfers: Rs. {online_sales}\nExpenses Paid: Rs. {expenses}\n*Net Closing Balance: Rs. {net_cash}*\nClosed By: {closed_by}',
    staff_commission_slip: '✂️ *TGS Staff Commission Slip*\nStylist: {staff_name}\nDate: {date}\nServices: {service_count}\nTotal Service Sales: Rs. {sales}\nBase Salary: Rs. {base_salary}\nCommission Earned: Rs. {commission}\nTips: Rs. {tips}\n*Net Payable: Rs. {net_payable}*',
  },
};

const initialChairs: SalonChair[] = [
  { id: 1, name: 'Chair #1 (Master Station)', status: 'Available' },
  { id: 2, name: 'Chair #2 (Styling Station)', status: 'Available' },
  { id: 3, name: 'Chair #3 (Grooming Station)', status: 'Available' },
  { id: 4, name: 'Chair #4 (VIP Lounge)', status: 'Available' },
];

const SalonContext = createContext<SalonContextType | undefined>(undefined);

export const SalonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth state
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem('tgs_auth_user');
      if (saved) return JSON.parse(saved);
    } catch {}
    // Default logged in user as Owner initially
    return DEFAULT_ACCOUNTS[0];
  });

  const [userAccounts, setUserAccounts] = useState<UserAccount[]>(DEFAULT_ACCOUNTS);

  const [allPermissions, setAllPermissions] = useState<Record<SalonRole, RolePermissions>>(() => {
    try {
      const saved = localStorage.getItem('tgs_role_permissions');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_PERMISSIONS;
  });

  const [roleNavTabs, setRoleNavTabs] = useState<RoleNavTab[]>(DEFAULT_ROLE_NAV_TABS);
  const [serviceCategories, setServiceCategories] = useState<ServiceCategoryRecord[]>([]);
  const [marketingCampaigns, setMarketingCampaigns] = useState<MarketingCampaign[]>([]);

  const [settings, setSettings] = useState<SalonSettings>(() => {
    try {
      const saved = localStorage.getItem('tgs_salon_settings');
      if (saved) {
        return { ...defaultSettings, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn(e);
    }
    return defaultSettings;
  });
  const [staff, setStaff] = useState<StaffMember[]>(() => {
    try {
      const s = localStorage.getItem('tgs_cached_staff');
      if (s) return JSON.parse(s);
    } catch {}
    return DEFAULT_STAFF;
  });
  const [services, setServices] = useState<SalonService[]>(() => {
    try {
      const s = localStorage.getItem('tgs_cached_services');
      if (s) {
        const parsed = JSON.parse(s);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_SERVICES;
  });
  const [clients, setClients] = useState<ClientRecord[]>(() => {
    try {
      const s = localStorage.getItem('tgs_cached_clients');
      if (s) {
        const parsed = JSON.parse(s);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_CLIENTS;
  });
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    try {
      const s = localStorage.getItem('tgs_cached_invoices');
      if (s) return JSON.parse(s);
    } catch {}
    return [];
  });
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() => {
    try {
      const s = localStorage.getItem('tgs_cached_expenses');
      if (s) return JSON.parse(s);
    } catch {}
    return [];
  });
  const [ownerNotes, setOwnerNotes] = useState<OwnerNote[]>(() => {
    try {
      const s = localStorage.getItem('tgs_cached_owner_notes');
      if (s) return JSON.parse(s);
    } catch {}
    return [
      {
        id: 'note-1',
        title: 'Ramadan & Eid Operating Hours & Staff Scheduling',
        content: 'Plan 2-shift schedule during last 10 days of Ramadan. Ensure station prep for midnight rushes. Order additional beard oils, whitening facial kits, and disposable aprons.',
        category: 'Operations',
        is_pinned: true,
        checklist_items: [
          { id: 'chk-1', text: 'Confirm midnight shifts with Ali and Zeeshan', is_completed: true },
          { id: 'chk-2', text: 'Stock up 50 units Whitening Facial kits', is_completed: true },
          { id: 'chk-3', text: 'Verify generator backup diesel tank level', is_completed: false },
          { id: 'chk-4', text: 'Print Eid VIP Gift vouchers', is_completed: false },
        ],
        tags: ['Ramadan', 'Scheduling', 'Eid Rush'],
        created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
      },
      {
        id: 'note-2',
        title: 'Karachi Commercial Area Rent & Utility Allocation',
        content: 'Monthly commercial shop lease renewal discussion. Target net margin 35% after all staff commissions and utility expenses.',
        category: 'Financial',
        is_pinned: false,
        checklist_items: [
          { id: 'chk-5', text: 'Review K-Electric commercial tariff bill', is_completed: false },
          { id: 'chk-6', text: 'Set aside Rs. 150,000 reserve for lease advance', is_completed: true },
        ],
        tags: ['Finance', 'Rent', 'Targets'],
        created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
      },
    ];
  });
  const [attendanceRecords, setAttendanceRecords] = useState<StaffAttendanceRecord[]>(() => {
    try {
      const s = localStorage.getItem('tgs_cached_attendance');
      if (s) return JSON.parse(s);
    } catch {}
    return [];
  });
  const [cashRegisters, setCashRegisters] = useState<DayClosingRecord[]>([]);
  const [appointments, setAppointments] = useState<SalonAppointment[]>([]);
  const [loyaltyPrograms, setLoyaltyPrograms] = useState<LoyaltyProgram[]>([]);
  const [chairs, setChairs] = useState<SalonChair[]>(() => {
    try {
      const saved = localStorage.getItem('tgs_chairs_queue');
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialChairs;
  });
  const [isLoading, setIsLoading] = useState(true);

  // Daily Expense Quota State (PKR)
  const [dailyExpenseQuota, setDailyExpenseQuota] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('tgs_daily_expense_quota');
      if (saved) return Number(saved);
    } catch {}
    return settings.daily_expense_quota || 5000;
  });

  // Granular Staff & Management Permissions State
  const [staffPermissions, setStaffPermissions] = useState<StaffPermissionsConfig>(() => {
    try {
      const saved = localStorage.getItem('tgs_staff_permissions');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      can_give_discounts: true,
      can_record_expenses: true,
      can_view_owner_ledger: false,
      can_void_invoices: false,
      can_view_reports: true,
      can_edit_clients: true,
      can_adjust_stamps: true,
      can_manual_close_day: false,
    };
  });

  const updateDailyExpenseQuota = async (quota: number) => {
    setDailyExpenseQuota(quota);
    try {
      localStorage.setItem('tgs_daily_expense_quota', quota.toString());
      await updateSettings({ daily_expense_quota: quota });
    } catch (e) {
      console.warn(e);
    }
  };

  const updateStaffPermissions = async (updates: Partial<StaffPermissionsConfig>) => {
    const next = { ...staffPermissions, ...updates };
    setStaffPermissions(next);
    try {
      localStorage.setItem('tgs_staff_permissions', JSON.stringify(next));
    } catch (e) {
      console.warn(e);
    }
  };

  const todayStrForQuota = new Date().toISOString().split('T')[0];
  const todayExpenseSum = expenses
    .filter((e) => e.expense_date === todayStrForQuota)
    .reduce((sum, e) => sum + (e.amount || 0), 0);
  const remainingExpenseQuota = Math.max(0, dailyExpenseQuota - todayExpenseSum);
  const isQuotaExceeded = todayExpenseSum > dailyExpenseQuota;

  // Offline Resilience & Autosave
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [offlineQueue, setOfflineQueue] = useState<Array<any>>(() => {
    try {
      const q = localStorage.getItem('tgs_offline_sync_queue');
      return q ? JSON.parse(q) : [];
    } catch {
      return [];
    }
  });

  const offlineQueueCount = offlineQueue.length;

  const saveOfflineQueue = (newQueue: any[]) => {
    setOfflineQueue(newQueue);
    try {
      localStorage.setItem('tgs_offline_sync_queue', JSON.stringify(newQueue));
    } catch (e) {
      console.warn('Could not save offline queue:', e);
    }
  };

  const syncOfflineQueue = async () => {
    if (offlineQueue.length === 0) return;
    const currentQ = [...offlineQueue];
    let syncedCount = 0;
    for (const item of currentQ) {
      try {
        if (item.type === 'invoice') {
          await supabase.from('tgs_invoices').insert([item.data]);
          if (item.items && item.items.length > 0) {
            await supabase.from('tgs_invoice_items').insert(item.items);
          }
          syncedCount++;
        } else if (item.type === 'expense') {
          await supabase.from('tgs_expenses').insert([item.data]);
          syncedCount++;
        } else if (item.type === 'client') {
          await supabase.from('tgs_clients').insert([item.data]);
          syncedCount++;
        } else if (item.type === 'note') {
          await supabase.from('tgs_owner_notes').insert([item.data]);
          syncedCount++;
        } else if (item.type === 'attendance') {
          await supabase.from('tgs_staff_attendance').insert([item.data]);
          syncedCount++;
        }
      } catch (err) {
        console.warn('Sync queued item error:', err);
      }
    }
    saveOfflineQueue([]);
    if (syncedCount > 0) {
      toast.success(`Online sync complete: ${syncedCount} offline records pushed to cloud!`);
    }
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Internet restored! Syncing offline autosaved records...');
      syncOfflineQueue();
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('Offline mode activated: Actions are safely autosaved locally and will sync when reconnected.');
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [offlineQueue]);

  // Automated 11:59 PM Day Closing
  const [closingCountdown, setClosingCountdown] = useState<string>('11:59 PM Auto-Close');

  const autoCloseDayNow = async (): Promise<DayClosingRecord | null> => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayInvoices = invoices.filter(
      (inv) => inv.created_at.startsWith(todayStr) && inv.status === 'Completed'
    );
    let cashSales = 0;
    let onlineSales = 0;
    for (const inv of todayInvoices) {
      if (inv.payment_method === 'Cash') cashSales += inv.total_amount;
      else if (inv.payment_method === 'Online Transfer') onlineSales += inv.total_amount;
      else if (inv.payment_method === 'Split' && Array.isArray(inv.split_details)) {
        for (const sp of inv.split_details) {
          if (sp.method === 'Cash') cashSales += sp.amount;
          else if (sp.method === 'Online Transfer') onlineSales += sp.amount;
        }
      }
    }

    const todayExpenses = expenses.filter(
      (exp) => exp.expense_date === todayStr || exp.created_at?.startsWith(todayStr)
    );
    const totalExpenses = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
    const expectedCash = Math.max(0, cashSales - totalExpenses);

    const record: DayClosingRecord = {
      id: `closing-${Date.now()}`,
      closing_date: todayStr,
      opening_cash: 0,
      total_cash_sales: cashSales,
      total_card_sales: 0,
      total_online_sales: onlineSales,
      total_cash_expenses: totalExpenses,
      expected_cash_in_drawer: expectedCash,
      actual_cash_counted: expectedCash,
      variance: 0,
      notes: 'Automatic 11:59 PM Daily Closing Snapshot',
      closed_by: 'Automated 11:59 PM Engine',
      created_at: new Date().toISOString(),
    };

    try {
      await supabase.from('tgs_cash_registers').insert([record]);
    } catch (e) {
      console.warn('Auto day closing DB error:', e);
    }
    setCashRegisters((prev) => [record, ...prev]);
    toast.success('🌙 Daily register closed and locked at 11:59 PM.');
    return record;
  };

  useEffect(() => {
    const checkTimer = () => {
      const now = new Date();
      const target = new Date();
      target.setHours(23, 59, 0, 0);
      const diff = target.getTime() - now.getTime();
      if (diff <= 0) {
        setClosingCountdown('Auto-Closed (11:59 PM)');
      } else {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setClosingCountdown(`${h}h ${m}m until 11:59 PM`);
      }

      if (now.getHours() === 23 && now.getMinutes() >= 59) {
        const todayStr = now.toISOString().split('T')[0];
        const alreadyClosed = cashRegisters.some((r) => r.closing_date === todayStr);
        if (!alreadyClosed) {
          autoCloseDayNow();
        }
      }
    };

    checkTimer();
    const interval = setInterval(checkTimer, 30000);
    return () => clearInterval(interval);
  }, [cashRegisters, invoices, expenses]);

  // WhatsApp Automation Helper
  const sendWhatsAppMessage = (phone: string, text: string) => {
    let clean = phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('03')) clean = '92' + clean.slice(1);
    else if (!clean.startsWith('92') && clean.length === 10) clean = '92' + clean;
    const url = `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const generateWhatsAppClosingReport = (): string => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayInvoices = invoices.filter(
      (inv) => inv.created_at.startsWith(todayStr) && inv.status === 'Completed'
    );
    const grossSales = todayInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);
    let cashSales = 0;
    let onlineSales = 0;
    for (const inv of todayInvoices) {
      if (inv.payment_method === 'Cash') cashSales += inv.total_amount;
      else if (inv.payment_method === 'Online Transfer') onlineSales += inv.total_amount;
      else if (inv.payment_method === 'Split' && Array.isArray(inv.split_details)) {
        for (const sp of inv.split_details) {
          if (sp.method === 'Cash') cashSales += sp.amount;
          else if (sp.method === 'Online Transfer') onlineSales += sp.amount;
        }
      }
    }
    const todayExpenses = expenses.filter(
      (exp) => exp.expense_date === todayStr || exp.created_at?.startsWith(todayStr)
    );
    const totalExpenses = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
    const netCash = Math.max(0, cashSales - totalExpenses);

    const template = settings.whatsapp_templates?.closing_report ||
      '💈 *TGS Daily Closing Report ({date})*\nTotal Bills: {total_bills}\nGross Sales: Rs. {gross_sales}\nCash in Drawer: Rs. {cash_sales}\nOnline Transfers: Rs. {online_sales}\nExpenses Paid: Rs. {expenses}\n*Net Closing Balance: Rs. {net_cash}*\nClosed By: {closed_by}';

    return template
      .replace('{date}', todayStr)
      .replace('{total_bills}', String(todayInvoices.length))
      .replace('{gross_sales}', grossSales.toLocaleString())
      .replace('{cash_sales}', cashSales.toLocaleString())
      .replace('{online_sales}', onlineSales.toLocaleString())
      .replace('{expenses}', totalExpenses.toLocaleString())
      .replace('{net_cash}', netCash.toLocaleString())
      .replace('{closed_by}', currentUser?.name || 'Manager');
  };

  const role: SalonRole = currentUser?.role || 'owner';
  const permissions: RolePermissions = allPermissions[role] || DEFAULT_PERMISSIONS[role];

  const pendingUsersCount = userAccounts.filter((u) => u.status === 'pending_approval').length;

  // Persist auth user
  const saveCurrentUser = (user: UserAccount | null) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem('tgs_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('tgs_auth_user');
    }
  };

  // Helper currency formatter for Pakistan
  const currencyFormat = useCallback((amount: number) => {
    const safeAmount = Number(amount) || 0;
    return `Rs. ${safeAmount.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;
  }, []);

  // Fetch Users with active session synchronization
  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.from('tgs_users').select('*').order('created_at', { ascending: false });
      if (!error && Array.isArray(data) && data.length > 0) {
        const mappedUsers: UserAccount[] = data.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: (u.role || 'worker') as SalonRole,
          status: (u.status || 'pending_approval') as UserStatus,
          phone: u.phone,
          cnic: u.cnic,
          password_hash: u.password_hash,
          created_at: u.created_at,
        }));
        setUserAccounts(mappedUsers);

        // Keep active session user in sync with updated database record
        setCurrentUser((curr) => {
          if (!curr) return curr;
          const match = mappedUsers.find((u) => u.id === curr.id || u.email.toLowerCase() === curr.email.toLowerCase());
          if (match) {
            const updated = { ...curr, ...match };
            localStorage.setItem('tgs_auth_user', JSON.stringify(updated));
            return updated;
          }
          return curr;
        });
      }
    } catch (e) {
      console.warn('Could not fetch tgs_users:', e);
    }
  };

  // Fetch Service Categories
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from('tgs_service_categories').select('*').order('display_order', { ascending: true });
      if (!error && Array.isArray(data) && data.length > 0) {
        setServiceCategories(data);
      } else {
        setServiceCategories([
          { id: 'cat-1', name: 'Hair & Styling', description: 'Haircuts, hair treatments, styling' },
          { id: 'cat-2', name: 'Beard & Mustache', description: 'Trims, styling, and beard dye' },
          { id: 'cat-3', name: 'Facials & Skin Care', description: 'Whitening facials, scrubs, cleansers' },
          { id: 'cat-4', name: 'Massage & Therapy', description: 'Head, shoulder, and foot massage' },
          { id: 'cat-5', name: 'Grooming & Waxing', description: 'Waxing and threading' },
          { id: 'cat-6', name: 'Mani & Pedi', description: 'Manicure and pedicure' },
        ]);
      }
    } catch (e) {
      console.warn(e);
    }
  };

  // Fetch Marketing Campaigns
  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase.from('tgs_marketing_campaigns').select('*').order('created_at', { ascending: false });
      if (!error && Array.isArray(data) && data.length > 0) {
        setMarketingCampaigns(data);
      }
    } catch (e) {
      console.warn(e);
    }
  };

  // Fetch Role Nav Tabs
  const fetchRoleNavTabs = async () => {
    try {
      const { data, error } = await supabase.from('tgs_role_nav_tabs').select('*');
      if (!error && Array.isArray(data) && data.length > 0) {
        setRoleNavTabs(data as RoleNavTab[]);
      }
    } catch (e) {
      console.warn(e);
    }
  };

  // Login handler
  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string; status?: UserStatus }> => {
    const cleanEmail = email.trim().toLowerCase();
    
    // Check in live state or fallback
    const found = userAccounts.find(
      (acc) => acc.email.toLowerCase() === cleanEmail && (acc.password_hash === pass || acc.password_hash === undefined)
    ) || DEFAULT_ACCOUNTS.find(
      (acc) => acc.email.toLowerCase() === cleanEmail && acc.password_hash === pass
    );

    if (!found) {
      return { success: false, error: 'Invalid email or password. Please verify your credentials or register.' };
    }

    if (found.status === 'rejected' || found.status === 'suspended') {
      return { success: false, error: `Your account is currently ${found.status}. Please contact the salon owner.` };
    }

    saveCurrentUser(found);

    if (found.status === 'pending_approval') {
      toast.info('Account is pending verification by the salon owner.');
      return { success: true, status: 'pending_approval' };
    }

    toast.success(`Welcome back, ${found.name}! Signed in as ${found.role.toUpperCase()}`);
    return { success: true, status: 'approved' };
  };

  // Register New User
  const registerUser = async (
    name: string,
    email: string,
    password: string,
    phone?: string,
    cnic?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const existing = userAccounts.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return { success: false, error: 'An account with this email address already exists. Please sign in.' };
    }

    try {
      const { data, error } = await supabase
        .from('tgs_users')
        .insert({
          name: name.trim(),
          email: cleanEmail,
          password_hash: password,
          phone: phone?.trim() || null,
          cnic: cnic?.trim() || null,
          role: 'worker',
          status: 'pending_approval',
        })
        .select()
        .single();

      if (error) {
        console.warn('DB register error:', error);
      }

      const newUser: UserAccount = data
        ? {
            id: data.id,
            name: data.name,
            email: data.email,
            role: data.role as SalonRole,
            status: data.status as UserStatus,
            phone: data.phone,
            cnic: data.cnic,
            password_hash: data.password_hash,
            created_at: data.created_at,
          }
        : {
            id: `usr-${Date.now()}`,
            name: name.trim(),
            email: cleanEmail,
            role: 'worker',
            status: 'pending_approval',
            phone: phone?.trim(),
            cnic: cnic?.trim(),
            password_hash: password,
            created_at: new Date().toISOString(),
          };

      setUserAccounts((prev) => [newUser, ...prev]);
      saveCurrentUser(newUser);
      toast.success('Registration submitted! Your account is now pending Owner approval.');
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Failed to complete registration' };
    }
  };

  // Approve User by Owner
  const approveUser = async (userId: string, targetRole: SalonRole, targetStatus: UserStatus): Promise<boolean> => {
    try {
      await supabase
        .from('tgs_users')
        .update({ role: targetRole, status: targetStatus, updated_at: new Date().toISOString() })
        .eq('id', userId);
    } catch (e) {
      console.warn(e);
    }

    setUserAccounts((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: targetRole, status: targetStatus } : u))
    );

    // If current user was approved
    if (currentUser?.id === userId) {
      const updated = { ...currentUser, role: targetRole, status: targetStatus };
      saveCurrentUser(updated);
    }

    toast.success(`User role updated to ${targetRole.toUpperCase()} with status "${targetStatus}"`);
    return true;
  };

  // Update User Details with live active user sync & staff name propagation
  const updateUser = async (
    userId: string,
    updates: Partial<UserAccount> & { password?: string }
  ): Promise<boolean> => {
    const payload: any = { ...updates, updated_at: new Date().toISOString() };
    if (updates.password && updates.password.trim().length > 0) {
      payload.password_hash = updates.password.trim();
      delete payload.password;
    }

    try {
      await supabase.from('tgs_users').update(payload).eq('id', userId);
    } catch (e) {
      console.warn('DB user update error:', e);
    }

    const updatedHash = payload.password_hash;
    setUserAccounts((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          return {
            ...u,
            ...updates,
            password_hash: updatedHash !== undefined ? updatedHash : u.password_hash,
          };
        }
        return u;
      })
    );

    // If currently logged-in user is updated, immediately update active session
    if (currentUser && (currentUser.id === userId || currentUser.email === updates.email)) {
      const updatedUser: UserAccount = {
        ...currentUser,
        ...updates,
        id: currentUser.id,
        name: updates.name ?? currentUser.name,
        email: updates.email ?? currentUser.email,
        role: updates.role ?? currentUser.role,
        status: updates.status ?? currentUser.status,
        password_hash: updatedHash !== undefined ? updatedHash : currentUser.password_hash,
      };
      saveCurrentUser(updatedUser);
    }

    // If username changed, also sync in staff table and invoices display if matched
    if (updates.name) {
      setStaff((prev) =>
        prev.map((s) => (s.email === updates.email || s.phone === updates.phone ? { ...s, name: updates.name! } : s))
      );
    }

    toast.success('User credentials and role updated successfully');
    return true;
  };

  // Delete User
  const deleteUser = async (userId: string): Promise<boolean> => {
    try {
      await supabase.from('tgs_users').delete().eq('id', userId);
    } catch (e) {
      console.warn(e);
    }

    setUserAccounts((prev) => prev.filter((u) => u.id !== userId));
    toast.success('User account deleted');
    return true;
  };

  // Logout handler
  const logout = () => {
    saveCurrentUser(null);
    toast.info('You have been signed out.');
  };

  // Role Tab Visibility
  const updateRoleNavTab = async (targetRole: SalonRole, tabId: string, isEnabled: boolean): Promise<boolean> => {
    try {
      await supabase
        .from('tgs_role_nav_tabs')
        .upsert(
          { role: targetRole, tab_id: tabId, tab_name: tabId, is_enabled: isEnabled },
          { onConflict: 'role,tab_id' }
        );
    } catch (e) {
      console.warn(e);
    }

    setRoleNavTabs((prev) => {
      const existing = prev.find((t) => t.role === targetRole && t.tab_id === tabId);
      if (existing) {
        return prev.map((t) =>
          t.role === targetRole && t.tab_id === tabId ? { ...t, is_enabled: isEnabled } : t
        );
      }
      return [...prev, { role: targetRole, tab_id: tabId, tab_name: tabId, is_enabled: isEnabled }];
    });

    toast.success(`Navigation tab "${tabId}" updated for ${targetRole.toUpperCase()}`);
    return true;
  };

  const isTabVisibleForCurrentRole = (tabId: string): boolean => {
    if (role === 'owner') return true; // Owner always sees all tabs
    // STRICT OWNER-ONLY TABS:
    if (
      tabId === 'settings' ||
      tabId === 'notes' ||
      tabId === 'source-export' ||
      tabId === 'knowledge-vault' ||
      tabId === 'ledger'
    ) {
      return false; // Non-owners never see these
    }
    if (tabId === 'attendance') {
      if (settings.allow_staff_attendance === false) return false;
    }
    const tabRule = roleNavTabs.find((t) => t.role === role && t.tab_id === tabId);
    if (!tabRule) {
      // Default fallback
      const defaultRule = DEFAULT_ROLE_NAV_TABS.find((t) => t.role === role && t.tab_id === tabId);
      return defaultRule ? defaultRule.is_enabled : false;
    }
    return tabRule.is_enabled;
  };

  // Role Permissions
  const updateRolePermissions = (targetRole: SalonRole, newPerms: Partial<RolePermissions>) => {
    setAllPermissions((prev) => {
      const updated = {
        ...prev,
        [targetRole]: {
          ...prev[targetRole],
          ...newPerms,
        },
      };
      localStorage.setItem('tgs_role_permissions', JSON.stringify(updated));
      return updated;
    });
    toast.success(`Permissions updated for ${targetRole.toUpperCase()}`);
  };

  // Sync chairs to storage
  const updateChair = (chairId: number, updates: Partial<SalonChair>) => {
    setChairs((prev) => {
      const updated = prev.map((c) => (c.id === chairId ? { ...c, ...updates } : c));
      localStorage.setItem('tgs_chairs_queue', JSON.stringify(updated));
      return updated;
    });
  };

  // Service Categories CRUD
  const addCategory = async (name: string, description?: string): Promise<ServiceCategoryRecord | null> => {
    try {
      const { data, error } = await supabase
        .from('tgs_service_categories')
        .insert({ name: name.trim(), description: description?.trim() || null })
        .select()
        .single();

      if (!error && data) {
        setServiceCategories((prev) => [...prev, data]);
        toast.success(`Category "${name}" created`);
        return data;
      }
    } catch (e) {
      console.warn(e);
    }

    const localCat: ServiceCategoryRecord = {
      id: `cat-${Date.now()}`,
      name: name.trim(),
      description: description?.trim() || null,
    };
    setServiceCategories((prev) => [...prev, localCat]);
    toast.success(`Category "${name}" added`);
    return localCat;
  };

  const updateCategory = async (id: string, name: string, description?: string): Promise<boolean> => {
    try {
      await supabase
        .from('tgs_service_categories')
        .update({ name: name.trim(), description: description?.trim() || null })
        .eq('id', id);
    } catch (e) {
      console.warn(e);
    }
    setServiceCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name: name.trim(), description: description?.trim() || null } : c))
    );
    toast.success('Category updated');
    return true;
  };

  const deleteCategory = async (id: string): Promise<boolean> => {
    try {
      await supabase.from('tgs_service_categories').delete().eq('id', id);
    } catch (e) {
      console.warn(e);
    }
    setServiceCategories((prev) => prev.filter((c) => c.id !== id));
    toast.success('Category removed');
    return true;
  };

  // Pin / Unpin Service
  const togglePinService = async (serviceId: string, isPinned: boolean): Promise<boolean> => {
    try {
      await supabase.from('tgs_services').update({ is_pinned: isPinned }).eq('id', serviceId);
    } catch (e) {
      console.warn(e);
    }
    setServices((prev) =>
      prev.map((s) => (s.id === serviceId ? { ...s, is_pinned: isPinned } : s))
    );
    toast.success(isPinned ? 'Service pinned to top of POS' : 'Service unpinned');
    return true;
  };

  // Marketing Campaigns CRUD
  const addCampaign = async (
    campaign: Omit<MarketingCampaign, 'id' | 'sent_count' | 'created_at'>
  ): Promise<MarketingCampaign | null> => {
    try {
      const { data, error } = await supabase
        .from('tgs_marketing_campaigns')
        .insert(campaign)
        .select()
        .single();

      if (!error && data) {
        setMarketingCampaigns((prev) => [data, ...prev]);
        toast.success(`Campaign "${campaign.title}" launched`);
        return data;
      }
    } catch (e) {
      console.warn(e);
    }

    const localCamp: MarketingCampaign = {
      ...campaign,
      id: `camp-${Date.now()}`,
      sent_count: 0,
      created_at: new Date().toISOString(),
    };
    setMarketingCampaigns((prev) => [localCamp, ...prev]);
    toast.success(`Campaign "${campaign.title}" created`);
    return localCamp;
  };

  const updateCampaign = async (id: string, updates: Partial<MarketingCampaign>): Promise<boolean> => {
    try {
      await supabase.from('tgs_marketing_campaigns').update(updates).eq('id', id);
    } catch (e) {
      console.warn(e);
    }
    setMarketingCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    toast.success('Campaign updated');
    return true;
  };

  const deleteCampaign = async (id: string): Promise<boolean> => {
    try {
      await supabase.from('tgs_marketing_campaigns').delete().eq('id', id);
    } catch (e) {
      console.warn(e);
    }
    setMarketingCampaigns((prev) => prev.filter((c) => c.id !== id));
    toast.success('Campaign deleted');
    return true;
  };

  const trackCampaignSend = async (id: string) => {
    const target = marketingCampaigns.find((c) => c.id === id);
    if (!target) return;
    const newCount = (target.sent_count || 0) + 1;
    try {
      await supabase.from('tgs_marketing_campaigns').update({ sent_count: newCount }).eq('id', id);
    } catch (e) {
      console.warn(e);
    }
    setMarketingCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, sent_count: newCount } : c))
    );
  };

  // Fetch Settings
  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.from('tgs_settings').select('*').limit(1).single();
      if (!error && data) {
        setSettings((prev) => {
          const next: SalonSettings = {
            ...defaultSettings,
            ...prev,
            ...data,
            id: data.id || prev.id || defaultSettings.id,
            salon_name: data.salon_name || prev.salon_name || defaultSettings.salon_name,
            tagline: data.tagline ?? prev.tagline ?? defaultSettings.tagline,
            phone: data.phone ?? prev.phone ?? defaultSettings.phone,
            email: data.email ?? prev.email ?? defaultSettings.email,
            address: data.address ?? prev.address ?? defaultSettings.address,
            currency_symbol: data.currency_symbol || prev.currency_symbol || 'Rs.',
            currency_code: data.currency_code || prev.currency_code || 'PKR',
            tax_rate: data.tax_rate !== undefined ? Number(data.tax_rate) : prev.tax_rate,
            receipt_header: data.receipt_header ?? prev.receipt_header ?? defaultSettings.receipt_header,
            receipt_footer: data.receipt_footer ?? prev.receipt_footer ?? defaultSettings.receipt_footer,
            owner_whatsapp: data.owner_whatsapp || prev.owner_whatsapp || '03001234567',
            auto_day_closing_time: data.auto_day_closing_time || prev.auto_day_closing_time || '23:59',
            allow_quick_walkin: data.allow_quick_walkin !== undefined ? Boolean(data.allow_quick_walkin) : (prev.allow_quick_walkin !== undefined ? prev.allow_quick_walkin : defaultSettings.allow_quick_walkin),
            daily_expense_quota: data.daily_expense_quota !== undefined ? Number(data.daily_expense_quota) : (prev.daily_expense_quota || defaultSettings.daily_expense_quota),
            // Ensure owner_financial_targets are preserved completely
            owner_financial_targets: {
              ...defaultSettings.owner_financial_targets,
              ...(prev.owner_financial_targets || {}),
              ...(data.owner_financial_targets || {}),
            },
            late_penalty_config: {
              ...defaultSettings.late_penalty_config,
              ...(prev.late_penalty_config || {}),
              ...(data.late_penalty_config || {}),
            },
            staff_permissions: {
              ...defaultSettings.staff_permissions,
              ...(prev.staff_permissions || {}),
              ...(data.staff_permissions || {}),
            },
            whatsapp_templates: {
              ...defaultSettings.whatsapp_templates,
              ...(prev.whatsapp_templates || {}),
              ...(data.whatsapp_templates || {}),
            },
          };
          try {
            localStorage.setItem('tgs_salon_settings', JSON.stringify(next));
          } catch (e) {
            console.warn(e);
          }
          return next;
        });
      }
    } catch (e) {
      console.warn('Using existing cached settings:', e);
    }
  };

  // Fetch Staff
  const fetchStaff = async () => {
    try {
      const { data, error } = await supabase.from('tgs_staff').select('*').order('created_at', { ascending: true });
      if (!error && Array.isArray(data) && data.length > 0) {
        setStaff(
          data.map((d) => ({
            id: d.id,
            name: d.name,
            phone: d.phone,
            email: d.email,
            cnic: d.cnic || '42101-0000000-1',
            role: d.role,
            pay_type: (d.pay_type || (d.base_salary > 0 && d.commission_rate > 0 ? 'salary_plus_commission' : d.base_salary > 0 ? 'salary_only' : 'commission_only')) as StaffPayType,
            commission_rate: Number(d.commission_rate) || 0,
            base_salary: Number(d.base_salary) || 0,
            partnership_percentage: d.partnership_percentage !== undefined && d.partnership_percentage !== null ? Number(d.partnership_percentage) : Number(d.commission_rate) || 0,
            station_fee: Number(d.station_fee) || 0,
            specialization: d.specialization || 'Barbering & Grooming',
            is_active: d.is_active !== false,
            avatar_url: d.avatar_url,
            created_at: d.created_at,
          }))
        );
      } else {
        setStaff(DEFAULT_STAFF);
      }
    } catch (e) {
      console.warn('Using fallback staff:', e);
      setStaff(DEFAULT_STAFF);
    }
  };

  // Fetch Services
  const fetchServices = async () => {
    try {
      const { data, error } = await supabase.from('tgs_services').select('*').order('is_pinned', { ascending: false });
      if (!error && Array.isArray(data)) {
        setServices(
          data.map((d) => ({
            id: d.id,
            name: d.name,
            category: d.category || 'Haircut & Styling',
            price: Number(d.price) || 0,
            duration_minutes: d.duration_minutes ? Number(d.duration_minutes) : undefined,
            description: d.description,
            is_active: d.is_active !== false,
            is_pinned: d.is_pinned === true,
            created_at: d.created_at,
          }))
        );
      }
    } catch (e) {
      console.warn('Using fallback services:', e);
    }
  };

  // Fetch Clients
  const fetchClients = async () => {
    try {
      const { data, error } = await supabase.from('tgs_clients').select('*').order('created_at', { ascending: false });
      if (!error && Array.isArray(data)) {
        setClients(
          data.map((d) => ({
            id: d.id,
            name: d.name,
            phone: d.phone,
            email: d.email,
            notes: d.notes,
            preferred_staff_id: d.preferred_staff_id,
            preferred_staff_name: d.preferred_staff_name,
            loyalty_visits_count: Number(d.loyalty_visits_count) || 0,
            loyalty_free_facials_available: Number(d.loyalty_free_facials_available) || 0,
            total_rewards_claimed: Number(d.total_rewards_claimed) || 0,
            wallet_balance: Number(d.wallet_balance) || (Number(d.total_spent) > 15000 ? 1200 : 0),
            punch_card_stamps: Number(d.punch_card_stamps) || (Number(d.loyalty_visits_count) % 5 || 0),
            vip_station_pass_active: d.vip_station_pass_active === true || Number(d.total_spent) >= 20000,
            duo_referrals_count: Number(d.duo_referrals_count) || 0,
            total_visits: Number(d.total_visits) || 0,
            total_spent: Number(d.total_spent) || 0,
            last_visit_date: d.last_visit_date,
            created_at: d.created_at,
            tags: d.tags || (Number(d.total_spent) > 10000 ? ['VIP', 'Regular'] : ['Regular']),
          }))
        );
      }
    } catch (e) {
      console.warn('Using fallback clients:', e);
    }
  };

  // Fetch Loyalty Programs (High-Impact Salon Retention Strategies)
  const fetchLoyaltyPrograms = async () => {
    try {
      const { data, error } = await supabase.from('tgs_loyalty_programs').select('*').order('created_at', { ascending: true });
      if (!error && Array.isArray(data) && data.length > 0) {
        setLoyaltyPrograms(
          data
            .filter((d) => d.program_type !== 'wallet_booster' && !d.title?.includes('Prepaid Grooming Club'))
            .map((d) => ({
              id: d.id,
              title: d.title,
              description: d.description,
              reward_name: d.reward_name,
              reward_value: Number(d.reward_value) || 1200,
              required_visits: Number(d.required_visits) || 5,
              min_spend_per_visit: Number(d.min_spend_per_visit) || 500,
              program_type: d.program_type || 'milestone_visits',
              bonus_rate: Number(d.bonus_rate) || 20,
              is_active: d.is_active !== false,
              created_at: d.created_at,
            }))
        );
      } else {
        setLoyaltyPrograms([
          {
            id: 'retention-prog-1',
            title: 'Digital Grooming Punch Card (5th Haircut Free Perk)',
            description: 'Every 5th haircut earns a complimentary Beard Sculpting & Hot Towel Treatment (Rs. 1,200 value). Automatically increments on qualifying visits.',
            reward_name: 'Free Beard Sculpting & Hot Towel',
            reward_value: 1200,
            required_visits: 5,
            min_spend_per_visit: 500,
            program_type: 'milestone_visits',
            is_active: true,
          },
          {
            id: 'retention-prog-3',
            title: 'Friday Duo / Wingman Referral Discount (20% OFF)',
            description: 'Bring a friend, brother, or colleague on Friday for grooming, and both receive 20% off comprehensive styling packages.',
            reward_name: '20% Paired Styling Discount',
            reward_value: 800,
            required_visits: 1,
            min_spend_per_visit: 1000,
            program_type: 'duo_referral',
            bonus_rate: 20,
            is_active: true,
          },
          {
            id: 'retention-prog-4',
            title: 'Off-Peak Happy Hours Accelerator (Tue & Wed 2 PM – 5 PM)',
            description: 'Complimentary Charcoal Detan Facial Mask or Organic Scalp Massage with any haircut during slow afternoon hours.',
            reward_name: 'Complimentary Charcoal Detan Mask',
            reward_value: 700,
            required_visits: 1,
            min_spend_per_visit: 700,
            program_type: 'offpeak_happy_hour',
            is_active: true,
          },
          {
            id: 'retention-prog-5',
            title: 'Retail Grooming Product Bundle Booster',
            description: 'Spend Rs. 3,500 on grooming services and receive a Premium Matte Styling Wax or Beard Oil at 50% discount.',
            reward_name: '50% OFF Styling Wax / Beard Oil',
            reward_value: 650,
            required_visits: 1,
            min_spend_per_visit: 3500,
            program_type: 'product_bundle',
            is_active: true,
          },
          {
            id: 'retention-prog-6',
            title: 'VIP Executive Station Pass',
            description: 'Reserved master chair booking with priority zero-wait styling, complimentary barista espresso, and private styling booth access.',
            reward_name: 'VIP Chair & Beverage Privilege',
            reward_value: 1500,
            required_visits: 8,
            min_spend_per_visit: 2000,
            program_type: 'vip_station_pass',
            is_active: true,
          },
        ]);
      }
    } catch (e) {
      console.warn('Fallback loyalty:', e);
    }
  };

  // Fetch Invoices
  const fetchInvoices = async () => {
    try {
      const { data: invData, error: invErr } = await supabase
        .from('tgs_invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (!invErr && Array.isArray(invData)) {
        const { data: itemsData } = await supabase.from('tgs_invoice_items').select('*');
        const itemsByInv: Record<string, InvoiceItem[]> = {};

        if (Array.isArray(itemsData)) {
          for (const it of itemsData) {
            if (!itemsByInv[it.invoice_id]) itemsByInv[it.invoice_id] = [];
            itemsByInv[it.invoice_id].push({
              id: it.id,
              service_id: it.service_id,
              service_name: it.service_name,
              category: it.category || 'Grooming',
              price: Number(it.price) || 0,
              original_price: it.original_price ? Number(it.original_price) : undefined,
              staff_id: it.staff_id,
              staff_name: it.staff_name,
              commission_rate: Number(it.commission_rate) || 0,
              commission_amount: Number(it.commission_amount) || 0,
            });
          }
        }

        const dbInvoices: Invoice[] = invData.map((d) => ({
          id: d.id,
          invoice_number: d.invoice_number,
          client_id: d.client_id,
          client_name: d.client_name,
          client_phone: d.client_phone,
          client_email: d.client_email,
          subtotal: Number(d.subtotal) || 0,
          discount_type: d.discount_type || 'none',
          discount_value: Number(d.discount_value) || 0,
          discount_amount: Number(d.discount_amount) || 0,
          loyalty_reward_applied: d.loyalty_reward_applied,
          loyalty_reward_discount: Number(d.loyalty_reward_discount) || 0,
          points_redeemed: Number(d.points_redeemed) || 0,
          points_discount_amount: Number(d.points_discount_amount) || 0,
          client_wallet_deducted: Number(d.client_wallet_deducted) || 0,
          vip_tier_discount_amount: Number(d.vip_tier_discount_amount) || 0,
          referral_code_used: d.referral_code_used,
          tax_rate: Number(d.tax_rate) || 0,
          tax_amount: Number(d.tax_amount) || 0,
          tip_amount: Number(d.tip_amount) || 0,
          total_amount: Number(d.total_amount) || 0,
          payment_method: d.payment_method || 'Cash',
          split_details: d.split_details,
          status: d.status || 'Completed',
          notes: d.notes,
          created_by_role: d.created_by_role || 'Staff',
          created_at: d.created_at,
          items: itemsByInv[d.id] || [],
        }));

        setInvoices((prev) => {
          const map = new Map<string, Invoice>();
          for (const inv of dbInvoices) {
            // CRITICAL FIX: If local invoice has items with barber names, and DB invoice items is empty, preserve local items!
            const local = prev.find((p) => (p.invoice_number || p.id) === (inv.invoice_number || inv.id));
            if (local && local.items && local.items.length > 0 && (!inv.items || inv.items.length === 0)) {
              inv.items = local.items;
            }
            map.set(inv.invoice_number || inv.id, inv);
          }
          for (const localInv of prev) {
            const key = localInv.invoice_number || localInv.id;
            if (!map.has(key)) {
              map.set(key, localInv);
            }
          }
          const merged = Array.from(map.values()).sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          try {
            localStorage.setItem('tgs_cached_invoices', JSON.stringify(merged));
          } catch (e) {
            console.warn(e);
          }
          return merged;
        });
      }
    } catch (e) {
      console.warn('Using fallback invoices:', e);
    }
  };

  // Fetch Expenses
  const fetchExpenses = async () => {
    try {
      const { data, error } = await supabase.from('tgs_expenses').select('*').order('expense_date', { ascending: false });
      if (!error && Array.isArray(data)) {
        const dbExpenses: ExpenseRecord[] = data.map((d) => ({
          id: d.id,
          title: d.title,
          category: d.category,
          amount: Number(d.amount) || 0,
          payment_mode: d.payment_mode || 'Cash',
          expense_date: d.expense_date,
          vendor: d.vendor,
          notes: d.notes,
          receipt_ref: d.receipt_ref,
          logged_by: d.logged_by,
          created_at: d.created_at,
        }));

        setExpenses((prev) => {
          const map = new Map<string, ExpenseRecord>();
          for (const exp of dbExpenses) {
            map.set(exp.id, exp);
          }
          for (const localExp of prev) {
            if (!map.has(localExp.id)) {
              map.set(localExp.id, localExp);
            }
          }
          const merged = Array.from(map.values()).sort(
            (a, b) => new Date(b.created_at || b.expense_date).getTime() - new Date(a.created_at || a.expense_date).getTime()
          );
          try {
            localStorage.setItem('tgs_cached_expenses', JSON.stringify(merged));
          } catch (e) {
            console.warn(e);
          }
          return merged;
        });
      }
    } catch (e) {
      console.warn('Using fallback expenses:', e);
    }
  };

  // Fetch Owner Notes
  const fetchOwnerNotes = async () => {
    try {
      const { data, error } = await supabase.from('tgs_owner_notes').select('*').order('created_at', { ascending: false });
      if (!error && Array.isArray(data)) {
        const dbNotes: OwnerNote[] = data.map((d) => ({
          id: d.id,
          title: d.title,
          content: d.content,
          category: d.category || 'General',
          is_pinned: Boolean(d.is_pinned),
          checklist_items: Array.isArray(d.checklist_items) ? d.checklist_items : [],
          tags: Array.isArray(d.tags) ? d.tags : [],
          created_at: d.created_at,
          updated_at: d.updated_at,
        }));
        setOwnerNotes((prev) => {
          const map = new Map<string, OwnerNote>();
          for (const n of dbNotes) map.set(n.id, n);
          for (const loc of prev) {
            if (!map.has(loc.id)) map.set(loc.id, loc);
          }
          const merged = Array.from(map.values());
          try {
            localStorage.setItem('tgs_cached_owner_notes', JSON.stringify(merged));
          } catch (e) {
            console.warn(e);
          }
          return merged;
        });
      }
    } catch (e) {
      console.warn('Using fallback notes:', e);
    }
  };

  // Fetch Attendance Records
  const fetchAttendanceRecords = async () => {
    try {
      const { data, error } = await supabase.from('tgs_staff_attendance').select('*').order('attendance_date', { ascending: false });
      if (!error && Array.isArray(data)) {
        const dbAttendance: StaffAttendanceRecord[] = data.map((d) => ({
          id: d.id,
          staff_id: d.staff_id,
          staff_name: d.staff_name,
          attendance_date: d.attendance_date,
          clock_in: d.clock_in,
          clock_out: d.clock_out,
          status: d.status || 'Present',
          late_minutes: Number(d.late_minutes) || 0,
          overtime_hours: Number(d.overtime_hours) || 0,
          notes: d.notes,
          created_at: d.created_at,
          updated_at: d.updated_at,
        }));
        setAttendanceRecords((prev) => {
          const map = new Map<string, StaffAttendanceRecord>();
          for (const att of dbAttendance) map.set(att.id, att);
          for (const loc of prev) {
            if (!map.has(loc.id)) map.set(loc.id, loc);
          }
          const merged = Array.from(map.values());
          try {
            localStorage.setItem('tgs_cached_attendance', JSON.stringify(merged));
          } catch (e) {
            console.warn(e);
          }
          return merged;
        });
      }
    } catch (e) {
      console.warn('Using fallback attendance:', e);
    }
  };

  // Fetch Cash Registers
  const fetchCashRegisters = async () => {
    try {
      const { data, error } = await supabase.from('tgs_cash_registers').select('*').order('closing_date', { ascending: false });
      if (!error && Array.isArray(data)) {
        setCashRegisters(
          data.map((d) => ({
            id: d.id,
            closing_date: d.closing_date || d.register_date || d.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
            opening_cash: Number(d.opening_cash) || 0,
            total_cash_sales: Number(d.total_cash_sales ?? d.cash_sales) || 0,
            total_card_sales: Number(d.total_card_sales ?? d.card_sales) || 0,
            total_online_sales: Number(d.total_online_sales ?? d.online_sales) || 0,
            total_cash_expenses: Number(d.total_cash_expenses ?? d.cash_expenses) || 0,
            expected_cash_in_drawer: Number(d.expected_cash_in_drawer ?? d.expected_cash) || 0,
            actual_cash_counted: Number(d.actual_cash_counted ?? d.actual_cash) || 0,
            variance: Number(d.variance) || 0,
            notes: d.notes,
            closed_by: d.closed_by,
            created_at: d.created_at,
          }))
        );
      }
    } catch (e) {
      console.warn('Using fallback cash registers:', e);
    }
  };

  // Fetch Appointments
  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase.from('tgs_appointments').select('*').order('appointment_date', { ascending: false });
      if (!error && Array.isArray(data)) {
        setAppointments(
          data.map((d) => ({
            id: d.id,
            client_name: d.client_name,
            client_phone: d.client_phone,
            client_email: d.client_email,
            service_id: d.service_id,
            service_name: d.service_name,
            staff_id: d.staff_id,
            staff_name: d.staff_name,
            appointment_date: d.appointment_date,
            appointment_time: d.appointment_time,
            chair_number: d.chair_number ? Number(d.chair_number) : undefined,
            duration_minutes: d.duration_minutes ? Number(d.duration_minutes) : undefined,
            status: d.status,
            notes: d.notes,
            created_at: d.created_at,
          }))
        );
      }
    } catch (e) {
      console.warn('Using fallback appointments:', e);
    }
  };

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    await Promise.allSettled([
      fetchUsers(),
      fetchSettings(),
      fetchStaff(),
      fetchServices(),
      fetchCategories(),
      fetchClients(),
      fetchLoyaltyPrograms(),
      fetchInvoices(),
      fetchExpenses(),
      fetchCashRegisters(),
      fetchAppointments(),
      fetchRoleNavTabs(),
      fetchCampaigns(),
      fetchOwnerNotes(),
      fetchAttendanceRecords(),
    ]);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refreshAll();

    // Cross-tab and multi-device Realtime synchronization
    let broadcast: BroadcastChannel | null = null;
    try {
      broadcast = new BroadcastChannel('tgs_realtime_events');
      broadcast.onmessage = (event) => {
        if (
          event.data?.type === 'SYNC_ALL' ||
          event.data?.type === 'INVOICE_CREATED' ||
          event.data?.type === 'EXPENSE_CREATED' ||
          event.data?.type === 'NOTES_UPDATED' ||
          event.data?.type === 'ATTENDANCE_UPDATED'
        ) {
          refreshAll();
        }
      };
    } catch (e) {
      console.warn(e);
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'tgs_realtime_ping') {
        refreshAll();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Supabase Realtime Channel for live entries across all users
    const channel = supabase
      .channel('tgs_live_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tgs_invoices' }, () => {
        fetchInvoices();
        fetchClients();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tgs_expenses' }, () => {
        fetchExpenses();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tgs_clients' }, () => {
        fetchClients();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tgs_cash_registers' }, () => {
        fetchCashRegisters();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tgs_settings' }, () => {
        fetchSettings();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tgs_owner_notes' }, () => {
        fetchOwnerNotes();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tgs_staff_attendance' }, () => {
        fetchAttendanceRecords();
      })
      .subscribe();

    return () => {
      if (broadcast) broadcast.close();
      window.removeEventListener('storage', handleStorageChange);
      supabase.removeChannel(channel);
    };
  }, [refreshAll]);

  // Broadcast realtime event helper
  const notifyRealtimeChange = (eventType: string) => {
    try {
      const bc = new BroadcastChannel('tgs_realtime_events');
      bc.postMessage({ type: eventType, timestamp: Date.now() });
      bc.close();
    } catch (e) {
      console.warn(e);
    }
    try {
      localStorage.setItem('tgs_realtime_ping', `${eventType}_${Date.now()}`);
    } catch (e) {
      console.warn(e);
    }
  };

  // Update Settings with instant local + cloud persistence
  const updateSettings = async (newSettings: Partial<SalonSettings>): Promise<boolean> => {
    try {
      const merged = { ...settings, ...newSettings };
      setSettings(merged);
      try {
        localStorage.setItem('tgs_salon_settings', JSON.stringify(merged));
      } catch (e) {
        console.warn(e);
      }
      try {
        await supabase.from('tgs_settings').update(newSettings).eq('id', settings.id);
      } catch (e) {
        console.warn('Supabase settings update skipped:', e);
      }
      notifyRealtimeChange('SETTINGS_UPDATED');
      toast.success('Salon settings updated successfully');
      return true;
    } catch (e) {
      toast.error('Failed to update settings');
      return false;
    }
  };

  // Staff CRUD with 4-Tier Compensation Models
  const addStaff = async (member: Omit<StaffMember, 'id' | 'created_at'>): Promise<StaffMember | null> => {
    const payload = {
      ...member,
      pay_type: member.pay_type || 'commission_only',
      partnership_percentage: member.partnership_percentage !== undefined ? Number(member.partnership_percentage) : Number(member.commission_rate) || 0,
      station_fee: Number(member.station_fee) || 0,
    };

    try {
      const { data, error } = await supabase.from('tgs_staff').insert([payload]).select().single();
      if (!error && data) {
        const newStaff: StaffMember = {
          ...payload,
          id: data.id,
          created_at: data.created_at,
        };
        setStaff((prev) => [...prev, newStaff]);
        toast.success(`Staff member ${member.name} registered`);
        return newStaff;
      }
    } catch (e) {
      console.warn(e);
    }

    const fallbackStaff: StaffMember = {
      ...payload,
      id: `staff-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setStaff((prev) => [...prev, fallbackStaff]);
    toast.success(`Staff member ${member.name} registered`);
    return fallbackStaff;
  };

  const updateStaff = async (id: string, updates: Partial<StaffMember>): Promise<boolean> => {
    try {
      await supabase.from('tgs_staff').update(updates).eq('id', id);
    } catch (e) {
      console.warn(e);
    }
    setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    toast.success('Staff profile updated');
    return true;
  };

  const deleteStaff = async (id: string): Promise<boolean> => {
    try {
      await supabase.from('tgs_staff').delete().eq('id', id);
    } catch (e) {
      console.warn(e);
    }
    setStaff((prev) => prev.filter((s) => s.id !== id));
    toast.success('Staff member removed');
    return true;
  };

  // 4-Tier Staff Compensation Payout Engine
  const calculateStaffPayout = useCallback((staffMember: StaffMember, serviceRevenue: number) => {
    const payType = staffMember.pay_type || (staffMember.base_salary > 0 && staffMember.commission_rate > 0 ? 'salary_plus_commission' : staffMember.base_salary > 0 ? 'salary_only' : 'commission_only');
    
    let baseSalary = 0;
    let commission = 0;
    let chairShare = 0;
    let stationFee = 0;
    let totalPayout = 0;
    let description = '';

    switch (payType) {
      case 'salary_only':
        baseSalary = Number(staffMember.base_salary) || 0;
        totalPayout = baseSalary;
        description = `Fixed Base Salary: Rs. ${baseSalary.toLocaleString()}`;
        break;

      case 'commission_only':
        const commRate = Number(staffMember.commission_rate) || 0;
        commission = Math.round(serviceRevenue * (commRate / 100));
        totalPayout = commission;
        description = `${commRate}% Commission on own services (Rs. ${serviceRevenue.toLocaleString()})`;
        break;

      case 'individual_partnership':
        const partnerPct = Number(staffMember.partnership_percentage) || Number(staffMember.commission_rate) || 50;
        stationFee = Number(staffMember.station_fee) || 0;
        chairShare = Math.round(serviceRevenue * (partnerPct / 100));
        totalPayout = Math.max(0, chairShare - stationFee);
        description = `${partnerPct}% Partnership on own work (Rs. ${serviceRevenue.toLocaleString()})${stationFee > 0 ? ` minus Rs. ${stationFee.toLocaleString()} station fee` : ''}`;
        break;

      case 'salary_plus_commission':
        baseSalary = Number(staffMember.base_salary) || 0;
        const cRate = Number(staffMember.commission_rate) || 0;
        commission = Math.round(serviceRevenue * (cRate / 100));
        totalPayout = baseSalary + commission;
        description = `Base Salary Rs. ${baseSalary.toLocaleString()} + ${cRate}% Commission (Rs. ${commission.toLocaleString()})`;
        break;
    }

    return {
      payType,
      baseSalary,
      commission,
      chairShare,
      stationFee,
      totalPayout,
      description,
    };
  }, []);

  // Retention & Wallet Engine Helpers
  const updateClientWallet = async (clientId: string, deltaAmount: number): Promise<boolean> => {
    const target = clients.find((c) => c.id === clientId);
    if (!target) return false;
    const newBal = Math.max(0, (target.wallet_balance || 0) + deltaAmount);
    try {
      await supabase.from('tgs_clients').update({ wallet_balance: newBal }).eq('id', clientId);
    } catch (e) {
      console.warn(e);
    }
    setClients((prev) => prev.map((c) => (c.id === clientId ? { ...c, wallet_balance: newBal } : c)));
    toast.success(`Client wallet balance updated: Rs. ${newBal.toLocaleString()}`);
    return true;
  };

  const addClientPunchStamp = async (
    clientId: string
  ): Promise<{ newStamps: number; rewardEarned: boolean; alreadyStampedToday?: boolean }> => {
    const target = clients.find((c) => c.id === clientId);
    if (!target) return { newStamps: 0, rewardEarned: false };

    const todayStr = new Date().toISOString().split('T')[0];
    // Enforce 1 stamp per client per calendar day
    if (target.last_stamped_date === todayStr && role !== 'owner') {
      toast.warning(`Client ${target.name} has already received a loyalty stamp today (${todayStr}). Maximum 1 stamp per day allowed.`);
      return { newStamps: target.punch_card_stamps || 0, rewardEarned: false, alreadyStampedToday: true };
    }

    const current = target.punch_card_stamps || 0;
    const nextStamps = current + 1;
    let rewardEarned = false;
    let finalStamps = nextStamps;
    let freeAvailable = target.loyalty_free_facials_available || 0;

    if (nextStamps >= 5) {
      rewardEarned = true;
      finalStamps = 0; // reset punch card
      freeAvailable += 1;
      toast.success(`🎉 5th Haircut milestone achieved! Free grooming perk earned for ${target.name}!`);
    } else {
      toast.info(`Punch card stamped for ${target.name} (${finalStamps}/5 stamps completed)`);
    }

    const stampLog: StampHistoryRecord = {
      id: `stamp-${Date.now()}`,
      client_id: clientId,
      client_name: target.name,
      date: todayStr,
      timestamp: new Date().toISOString(),
      action: rewardEarned ? 'reward_unlocked' : 'stamp_added',
      stamps_count: finalStamps,
      notes: rewardEarned ? '5th visit milestone completed - 1 Free Facial unlocked' : `Stamp #${finalStamps}/5 awarded`,
      performed_by: currentUser?.name || role || 'Cashier',
    };

    const updatedHistory = [stampLog, ...(target.stamp_history || [])];

    try {
      await supabase.from('tgs_clients').update({
        punch_card_stamps: finalStamps,
        loyalty_free_facials_available: freeAvailable,
      }).eq('id', clientId);
    } catch (e) {
      console.warn(e);
    }

    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId
          ? {
              ...c,
              punch_card_stamps: finalStamps,
              loyalty_free_facials_available: freeAvailable,
              last_stamped_date: todayStr,
              stamp_history: updatedHistory,
            }
          : c
      )
    );
    return { newStamps: finalStamps, rewardEarned };
  };

  // Owner Edit Client Punch Stamps
  const editClientPunchStamps = async (
    clientId: string,
    newStamps: number,
    notes?: string
  ): Promise<boolean> => {
    const target = clients.find((c) => c.id === clientId);
    if (!target) return false;
    const clamped = Math.max(0, Math.min(5, newStamps));
    const todayStr = new Date().toISOString().split('T')[0];

    const stampLog: StampHistoryRecord = {
      id: `stamp-${Date.now()}`,
      client_id: clientId,
      client_name: target.name,
      date: todayStr,
      timestamp: new Date().toISOString(),
      action: 'stamp_edited',
      stamps_count: clamped,
      notes: notes || `Owner adjusted stamps from ${target.punch_card_stamps || 0} to ${clamped}`,
      performed_by: currentUser?.name || 'Owner',
    };

    const updatedHistory = [stampLog, ...(target.stamp_history || [])];

    try {
      await supabase.from('tgs_clients').update({
        punch_card_stamps: clamped,
      }).eq('id', clientId);
    } catch (e) {
      console.warn(e);
    }

    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId
          ? {
              ...c,
              punch_card_stamps: clamped,
              stamp_history: updatedHistory,
            }
          : c
      )
    );
    toast.success(`Updated ${target.name}'s stamps to ${clamped}/5`);
    return true;
  };

  // Owner Remove 1 Client Punch Stamp
  const removeClientPunchStamp = async (
    clientId: string,
    notes?: string
  ): Promise<boolean> => {
    const target = clients.find((c) => c.id === clientId);
    if (!target) return false;
    const current = target.punch_card_stamps || 0;
    const nextStamps = Math.max(0, current - 1);
    const todayStr = new Date().toISOString().split('T')[0];

    const stampLog: StampHistoryRecord = {
      id: `stamp-${Date.now()}`,
      client_id: clientId,
      client_name: target.name,
      date: todayStr,
      timestamp: new Date().toISOString(),
      action: 'stamp_removed',
      stamps_count: nextStamps,
      notes: notes || `Owner removed 1 stamp (adjusted to ${nextStamps}/5)`,
      performed_by: currentUser?.name || 'Owner',
    };

    const updatedHistory = [stampLog, ...(target.stamp_history || [])];

    try {
      await supabase.from('tgs_clients').update({
        punch_card_stamps: nextStamps,
      }).eq('id', clientId);
    } catch (e) {
      console.warn(e);
    }

    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId
          ? {
              ...c,
              punch_card_stamps: nextStamps,
              stamp_history: updatedHistory,
            }
          : c
      )
    );
    toast.info(`Removed 1 stamp from ${target.name} (${nextStamps}/5 remaining)`);
    return true;
  };

  const redeemClientPunchReward = async (clientId: string): Promise<boolean> => {
    const target = clients.find((c) => c.id === clientId);
    if (!target || (target.loyalty_free_facials_available || 0) <= 0) {
      toast.error('No free reward available to redeem');
      return false;
    }
    const nextFree = target.loyalty_free_facials_available - 1;
    const nextClaimed = (target.total_rewards_claimed || 0) + 1;
    const todayStr = new Date().toISOString().split('T')[0];

    const stampLog: StampHistoryRecord = {
      id: `stamp-${Date.now()}`,
      client_id: clientId,
      client_name: target.name,
      date: todayStr,
      timestamp: new Date().toISOString(),
      action: 'reward_redeemed',
      stamps_count: target.punch_card_stamps || 0,
      notes: 'Redeemed Complimentary Facial (Rs. 2,500 value)',
      performed_by: currentUser?.name || role || 'Cashier',
    };

    const updatedHistory = [stampLog, ...(target.stamp_history || [])];

    try {
      await supabase.from('tgs_clients').update({
        loyalty_free_facials_available: nextFree,
        total_rewards_claimed: nextClaimed,
      }).eq('id', clientId);
    } catch (e) {
      console.warn(e);
    }

    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId
          ? {
              ...c,
              loyalty_free_facials_available: nextFree,
              total_rewards_claimed: nextClaimed,
              stamp_history: updatedHistory,
            }
          : c
      )
    );
    toast.success(`Reward redeemed for ${target.name}! Remaining perks: ${nextFree}`);
    return true;
  };

  // Services CRUD
  const addService = async (service: Omit<SalonService, 'id' | 'created_at'>): Promise<SalonService | null> => {
    try {
      const { data, error } = await supabase.from('tgs_services').insert([service]).select().single();
      if (!error && data) {
        const newService: SalonService = {
          ...service,
          id: data.id,
          created_at: data.created_at,
        };
        setServices((prev) => [...prev, newService]);
        toast.success(`Service "${service.name}" added to catalog`);
        return newService;
      }
    } catch (e) {
      console.warn(e);
    }

    const fallback: SalonService = {
      ...service,
      id: `srv-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setServices((prev) => [...prev, fallback]);
    toast.success(`Service "${service.name}" added to catalog`);
    return fallback;
  };

  const updateService = async (id: string, updates: Partial<SalonService>): Promise<boolean> => {
    try {
      await supabase.from('tgs_services').update(updates).eq('id', id);
    } catch (e) {
      console.warn(e);
    }
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    toast.success('Service updated');
    return true;
  };

  const deleteService = async (id: string): Promise<boolean> => {
    try {
      await supabase.from('tgs_services').delete().eq('id', id);
    } catch (e) {
      console.warn(e);
    }
    setServices((prev) => prev.filter((s) => s.id !== id));
    toast.success('Service removed from catalog');
    return true;
  };

  // Client CRUD
  const addClient = async (
    client: Omit<ClientRecord, 'id' | 'total_visits' | 'total_spent' | 'created_at' | 'loyalty_visits_count' | 'loyalty_free_facials_available' | 'total_rewards_claimed'>
  ): Promise<ClientRecord | null> => {
    const payload = {
      ...client,
      total_visits: 0,
      total_spent: 0,
      loyalty_visits_count: 0,
      loyalty_free_facials_available: 0,
      total_rewards_claimed: 0,
    };

    try {
      const { data, error } = await supabase.from('tgs_clients').insert([payload]).select().single();
      if (!error && data) {
        const newClient: ClientRecord = {
          ...payload,
          id: data.id,
          created_at: data.created_at,
          tags: ['New Client'],
          points_balance: 0,
        };
        setClients((prev) => [newClient, ...prev]);
        toast.success(`Client ${client.name} registered`);
        return newClient;
      }
    } catch (e) {
      console.warn(e);
    }

    const fallback: ClientRecord = {
      ...payload,
      id: `client-${Date.now()}`,
      created_at: new Date().toISOString(),
      tags: ['New Client'],
      points_balance: 0,
    };

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      saveOfflineQueue([
        ...offlineQueue,
        {
          type: 'client',
          data: fallback,
          timestamp: new Date().toISOString(),
        },
      ]);
      toast.info('Client autosaved locally in offline queue.');
    }

    setClients((prev) => [fallback, ...prev]);
    toast.success(`Client ${client.name} registered`);
    return fallback;
  };

  const updateClient = async (id: string, updates: Partial<ClientRecord>): Promise<boolean> => {
    try {
      await supabase.from('tgs_clients').update(updates).eq('id', id);
    } catch (e) {
      console.warn(e);
    }
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    toast.success('Client record updated');
    return true;
  };

  const deleteClient = async (id: string): Promise<boolean> => {
    try {
      await supabase.from('tgs_clients').delete().eq('id', id);
    } catch (e) {
      console.warn(e);
    }
    setClients((prev) => prev.filter((c) => c.id !== id));
    toast.success('Client deleted');
    return true;
  };

  // Loyalty Programs
  const toggleLoyaltyProgram = async (id: string, is_active: boolean): Promise<boolean> => {
    try {
      await supabase.from('tgs_loyalty_programs').update({ is_active }).eq('id', id);
    } catch (e) {
      console.warn(e);
    }
    setLoyaltyPrograms((prev) => prev.map((p) => (p.id === id ? { ...p, is_active } : p)));
    toast.success(is_active ? 'Loyalty program activated' : 'Loyalty program paused');
    return true;
  };

  const updateLoyaltyProgram = async (id: string, updates: Partial<LoyaltyProgram>): Promise<boolean> => {
    try {
      await supabase.from('tgs_loyalty_programs').update(updates).eq('id', id);
    } catch (e) {
      console.warn(e);
    }
    setLoyaltyPrograms((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    toast.success('Loyalty program rules updated');
    return true;
  };

  const addLoyaltyProgram = async (
    program: Omit<LoyaltyProgram, 'id' | 'created_at'>
  ): Promise<LoyaltyProgram | null> => {
    try {
      const { data, error } = await supabase.from('tgs_loyalty_programs').insert([program]).select().single();
      if (!error && data) {
        setLoyaltyPrograms((prev) => [...prev, data]);
        toast.success(`Loyalty program "${program.title}" created`);
        return data;
      }
    } catch (e) {
      console.warn(e);
    }

    const fallback: LoyaltyProgram = {
      ...program,
      id: `loyalty-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setLoyaltyPrograms((prev) => [...prev, fallback]);
    toast.success(`Loyalty program "${program.title}" created`);
    return fallback;
  };

  const deleteLoyaltyProgram = async (id: string): Promise<boolean> => {
    try {
      await supabase.from('tgs_loyalty_programs').delete().eq('id', id);
    } catch (e) {
      console.warn(e);
    }
    setLoyaltyPrograms((prev) => prev.filter((p) => p.id !== id));
    toast.success('Loyalty program deleted');
    return true;
  };

  // POS Invoice Creation
  const createInvoice = async (
    invoiceData: Omit<Invoice, 'id' | 'invoice_number' | 'created_at' | 'items'>,
    items: Omit<InvoiceItem, 'id' | 'invoice_id'>[]
  ): Promise<Invoice | null> => {
    const today = new Date();
    const dateCode = today.toISOString().slice(2, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const invoiceNumber = `TGS-${dateCode}-${randomSuffix}`;
    const invoiceId = `inv-${Date.now()}`;
    const todayIso = today.toISOString();

    const dbPayload = {
      id: invoiceId,
      invoice_number: invoiceNumber,
      client_id: invoiceData.client_id || null,
      client_name: invoiceData.client_name || 'Walk-in Guest',
      client_phone: invoiceData.client_phone || 'N/A',
      client_email: invoiceData.client_email || null,
      subtotal: Number(invoiceData.subtotal) || 0,
      discount_type: invoiceData.discount_type || 'none',
      discount_value: Number(invoiceData.discount_value) || 0,
      discount_amount: Number(invoiceData.discount_amount) || 0,
      loyalty_reward_applied: invoiceData.loyalty_reward_applied || null,
      loyalty_reward_discount: Number(invoiceData.loyalty_reward_discount) || 0,
      points_redeemed: Number(invoiceData.points_redeemed) || 0,
      points_discount_amount: Number(invoiceData.points_discount_amount) || 0,
      client_wallet_deducted: Number(invoiceData.client_wallet_deducted) || 0,
      vip_tier_discount_amount: Number(invoiceData.vip_tier_discount_amount) || 0,
      referral_code_used: invoiceData.referral_code_used || null,
      tax_rate: Number(invoiceData.tax_rate) || 0,
      tax_amount: Number(invoiceData.tax_amount) || 0,
      tip_amount: Number(invoiceData.tip_amount) || 0,
      total_amount: Number(invoiceData.total_amount) || 0,
      payment_method: invoiceData.payment_method || 'Cash',
      split_details: invoiceData.split_details || null,
      status: 'Completed' as const,
      notes: invoiceData.notes || null,
      created_by_role: invoiceData.created_by_role || role || 'Staff',
      created_at: todayIso,
    };

    const itemRows = items.map((it, idx) => ({
      id: `item-${Date.now()}-${idx}`,
      invoice_id: invoiceId,
      service_id: it.service_id || null,
      service_name: it.service_name,
      category: it.category || 'Grooming',
      price: Number(it.price) || 0,
      original_price: it.original_price ? Number(it.original_price) : Number(it.price),
      staff_id: it.staff_id || null,
      staff_name: it.staff_name || 'Staff Member',
      commission_rate: Number(it.commission_rate) || 0,
      commission_amount: Number(it.commission_amount) || 0,
    }));

    const fullInvoice: Invoice = {
      ...dbPayload,
      items: itemRows,
    };

    // 1. Immediately update React state & localStorage
    setInvoices((prev) => {
      const updated = [fullInvoice, ...prev];
      try {
        localStorage.setItem('tgs_cached_invoices', JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });

    // 2. Offline queue or direct DB insert with automatic offline fallback
    const isActuallyOffline = (typeof navigator !== 'undefined' && !navigator.onLine);

    if (isActuallyOffline) {
      saveOfflineQueue([
        ...offlineQueue,
        {
          type: 'invoice',
          data: dbPayload,
          items: itemRows,
          timestamp: todayIso,
        },
      ]);
      toast.info('Offline Mode: Bill #' + invoiceNumber + ' saved to local queue. Will sync automatically.');
    } else {
      try {
        const { error: invErr } = await supabase.from('tgs_invoices').insert([dbPayload]);
        if (invErr) {
          console.warn('Supabase invoice insert failed, falling back to offline queue:', invErr);
          saveOfflineQueue([
            ...offlineQueue,
            {
              type: 'invoice',
              data: dbPayload,
              items: itemRows,
              timestamp: todayIso,
            },
          ]);
          toast.info('Network unreachable. Bill saved locally in offline queue.');
        } else {
          const { error: itErr } = await supabase.from('tgs_invoice_items').insert(itemRows);
          if (itErr) console.warn('Supabase items insert error:', itErr);
        }
      } catch (e) {
        console.warn('DB invoice error, queuing offline:', e);
        saveOfflineQueue([
          ...offlineQueue,
          {
            type: 'invoice',
            data: dbPayload,
            items: itemRows,
            timestamp: todayIso,
          },
        ]);
        toast.info('Network issue detected. Bill saved locally in offline queue.');
      }
    }

    // 3. Update Client Loyalty & Metrics if client selected
    if (invoiceData.client_id) {
      const targetClient = clients.find((c) => c.id === invoiceData.client_id);
      if (targetClient) {
        const isQualifyingVisit = Number(invoiceData.subtotal) >= 500;
        let newVisitsCount = (targetClient.loyalty_visits_count || 0) + (isQualifyingVisit ? 1 : 0);
        let newFreeFacials = targetClient.loyalty_free_facials_available || 0;
        let claimedCount = targetClient.total_rewards_claimed || 0;

        // If loyalty facial reward was redeemed on this bill
        if (invoiceData.loyalty_reward_applied && invoiceData.loyalty_reward_applied.includes('Facial')) {
          newFreeFacials = Math.max(0, newFreeFacials - 1);
          claimedCount += 1;
        }

        // Automatic 5 visits unlock
        if (newVisitsCount >= 5) {
          newFreeFacials += 1;
          newVisitsCount = 0; // Reset counter for next 5 visits
          toast.success(`🎉 Congratulations! ${targetClient.name} earned 1 FREE Whitening Facial (Rs. 2,500 value)!`);
        }

        // Deduct wallet if used
        const walletDeducted = Number(invoiceData.client_wallet_deducted) || 0;
        const currentWallet = targetClient.wallet_balance || 0;
        const newWalletBalance = Math.max(0, currentWallet - walletDeducted);

        const newTotalSpent = (Number(targetClient.total_spent) || 0) + Number(invoiceData.total_amount);
        const newTotalVisits = (Number(targetClient.total_visits) || 0) + 1;

        const clientUpdates: Partial<ClientRecord> = {
          total_visits: newTotalVisits,
          total_spent: newTotalSpent,
          last_visit_date: todayIso.split('T')[0],
          loyalty_visits_count: newVisitsCount,
          loyalty_free_facials_available: newFreeFacials,
          total_rewards_claimed: claimedCount,
          wallet_balance: newWalletBalance,
        };

        await updateClient(targetClient.id, clientUpdates);
      }
    }

    notifyRealtimeChange('INVOICE_CREATED');
    toast.success(`Bill ${invoiceNumber} created and saved!`);
    return fullInvoice;
  };

  const refundInvoice = async (id: string): Promise<boolean> => {
    try {
      await supabase.from('tgs_invoices').update({ status: 'Refunded' }).eq('id', id);
    } catch (e) {
      console.warn(e);
    }
    setInvoices((prev) => prev.map((inv) => (inv.id === id ? { ...inv, status: 'Refunded' } : inv)));
    notifyRealtimeChange('INVOICE_REFUNDED');
    toast.success('Invoice marked as refunded');
    return true;
  };

  const updateInvoice = async (id: string, updates: Partial<Invoice>): Promise<boolean> => {
    setInvoices((prev) => {
      const updated = prev.map((inv) => (inv.id === id ? { ...inv, ...updates } : inv));
      try {
        localStorage.setItem('tgs_cached_invoices', JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });

    try {
      await supabase.from('tgs_invoices').update(updates).eq('id', id);
    } catch (e) {
      console.warn('Supabase invoice update skipped, cached locally:', e);
    }
    notifyRealtimeChange('INVOICE_UPDATED');
    toast.success('Transaction record updated successfully');
    return true;
  };

  const deleteInvoice = async (id: string): Promise<boolean> => {
    try {
      await supabase.from('tgs_invoices').delete().eq('id', id);
    } catch (e) {
      console.warn(e);
    }
    setInvoices((prev) => prev.filter((inv) => inv.id !== id));
    notifyRealtimeChange('INVOICE_DELETED');
    toast.success('Invoice deleted');
    return true;
  };

  // Expenses CRUD
  const addExpense = async (expense: Omit<ExpenseRecord, 'id' | 'created_at'>): Promise<ExpenseRecord | null> => {
    const expenseId = `exp-${Date.now()}`;
    const todayIso = new Date().toISOString();
    const todayStr = todayIso.split('T')[0];

    const expenseRecord: ExpenseRecord = {
      ...expense,
      id: expenseId,
      amount: Number(expense.amount) || 0,
      category: expense.category || 'General Cash Counter Expense',
      payment_mode: expense.payment_mode || 'Cash',
      expense_date: expense.expense_date || todayStr,
      logged_by: expense.logged_by || currentUser?.name || 'Manager',
      created_at: todayIso,
    };

    setExpenses((prev) => {
      const updated = [expenseRecord, ...prev];
      try {
        localStorage.setItem('tgs_cached_expenses', JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      saveOfflineQueue([
        ...offlineQueue,
        {
          type: 'expense',
          data: expenseRecord,
          timestamp: todayIso,
        },
      ]);
      notifyRealtimeChange('EXPENSE_CREATED');
      toast.info(`Offline: Expense of ${currencyFormat(expense.amount)} saved locally`);
      return expenseRecord;
    }

    try {
      const { data, error } = await supabase.from('tgs_expenses').insert([expenseRecord]).select().single();
      if (!error && data) {
        setExpenses((prev) => {
          const updated = prev.map((e) => (e.id === expenseId ? data : e));
          try {
            localStorage.setItem('tgs_cached_expenses', JSON.stringify(updated));
          } catch (err) {
            console.warn(err);
          }
          return updated;
        });
        notifyRealtimeChange('EXPENSE_CREATED');
        toast.success(`Expense of ${currencyFormat(expense.amount)} logged & synced`);
        return data;
      }
    } catch (e) {
      console.warn('DB expense error:', e);
    }

    notifyRealtimeChange('EXPENSE_CREATED');
    toast.success(`Expense of ${currencyFormat(expense.amount)} logged`);
    return expenseRecord;
  };

  const updateExpense = async (id: string, updates: Partial<ExpenseRecord>): Promise<boolean> => {
    setExpenses((prev) => {
      const updated = prev.map((e) => (e.id === id ? { ...e, ...updates } : e));
      try {
        localStorage.setItem('tgs_cached_expenses', JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });

    try {
      await supabase.from('tgs_expenses').update(updates).eq('id', id);
    } catch (e) {
      console.warn(e);
    }
    notifyRealtimeChange('EXPENSE_UPDATED');
    toast.success('Expense record updated');
    return true;
  };

  const deleteExpense = async (id: string): Promise<boolean> => {
    setExpenses((prev) => {
      const updated = prev.filter((e) => e.id !== id);
      try {
        localStorage.setItem('tgs_cached_expenses', JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });

    try {
      await supabase.from('tgs_expenses').delete().eq('id', id);
    } catch (e) {
      console.warn(e);
    }
    notifyRealtimeChange('EXPENSE_DELETED');
    toast.success('Expense deleted');
    return true;
  };

  // Owner Notes CRUD
  const addOwnerNote = async (
    note: Omit<OwnerNote, 'id' | 'created_at' | 'updated_at'>
  ): Promise<OwnerNote | null> => {
    const noteId = `note-${Date.now()}`;
    const nowIso = new Date().toISOString();
    const newNote: OwnerNote = {
      ...note,
      id: noteId,
      created_at: nowIso,
      updated_at: nowIso,
    };

    setOwnerNotes((prev) => {
      const updated = [newNote, ...prev];
      try {
        localStorage.setItem('tgs_cached_owner_notes', JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      saveOfflineQueue([
        ...offlineQueue,
        { type: 'note', data: newNote, timestamp: nowIso },
      ]);
      toast.info('Note saved locally in offline queue.');
      return newNote;
    }

    try {
      const { data, error } = await supabase.from('tgs_owner_notes').insert([newNote]).select().single();
      if (!error && data) {
        notifyRealtimeChange('NOTES_UPDATED');
        toast.success(`Note "${newNote.title}" saved & synced!`);
        return data;
      }
    } catch (e) {
      console.warn('DB note insert error:', e);
    }

    notifyRealtimeChange('NOTES_UPDATED');
    toast.success(`Note "${newNote.title}" saved!`);
    return newNote;
  };

  const updateOwnerNote = async (id: string, updates: Partial<OwnerNote>): Promise<boolean> => {
    const nowIso = new Date().toISOString();
    const cleanUpdates = { ...updates, updated_at: nowIso };

    setOwnerNotes((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, ...cleanUpdates } : n));
      try {
        localStorage.setItem('tgs_cached_owner_notes', JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });

    try {
      await supabase.from('tgs_owner_notes').update(cleanUpdates).eq('id', id);
    } catch (e) {
      console.warn('DB note update error:', e);
    }

    notifyRealtimeChange('NOTES_UPDATED');
    toast.success('Note updated');
    return true;
  };

  const deleteOwnerNote = async (id: string): Promise<boolean> => {
    setOwnerNotes((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      try {
        localStorage.setItem('tgs_cached_owner_notes', JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });

    try {
      await supabase.from('tgs_owner_notes').delete().eq('id', id);
    } catch (e) {
      console.warn('DB note delete error:', e);
    }

    notifyRealtimeChange('NOTES_UPDATED');
    toast.success('Note deleted');
    return true;
  };

  // Staff Attendance CRUD
  const clockInStaff = async (staffId: string, staffName: string): Promise<StaffAttendanceRecord | null> => {
    const todayStr = new Date().toISOString().split('T')[0];
    const nowTimeStr = new Date().toTimeString().slice(0, 5); // "10:15"

    const existing = attendanceRecords.find(
      (a) => a.staff_id === staffId && a.attendance_date === todayStr
    );
    if (existing && existing.clock_in) {
      toast.info(`${staffName} is already clocked in today at ${existing.clock_in}`);
      return existing;
    }

    const [hours, minutes] = nowTimeStr.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    const expectedMinutes = 10 * 60 + 45; // 10:45 AM threshold
    const lateMins = Math.max(0, totalMinutes - expectedMinutes);
    const status: AttendanceStatus = lateMins > 0 ? 'Late' : 'Present';

    const recordId = existing?.id || `att-${Date.now()}`;
    const nowIso = new Date().toISOString();

    const record: StaffAttendanceRecord = {
      id: recordId,
      staff_id: staffId,
      staff_name: staffName,
      attendance_date: todayStr,
      clock_in: nowTimeStr,
      clock_out: null,
      status,
      late_minutes: lateMins,
      overtime_hours: 0,
      notes: lateMins > 0 ? `Late arrival by ${lateMins} mins` : 'On-time check-in',
      created_at: nowIso,
      updated_at: nowIso,
    };

    setAttendanceRecords((prev) => {
      const filtered = prev.filter((a) => a.id !== recordId);
      const updated = [record, ...filtered];
      try {
        localStorage.setItem('tgs_cached_attendance', JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });

    try {
      if (existing) {
        await supabase.from('tgs_staff_attendance').update(record).eq('id', recordId);
      } else {
        await supabase.from('tgs_staff_attendance').insert([record]);
      }
    } catch (e) {
      console.warn('DB attendance error:', e);
    }

    notifyRealtimeChange('ATTENDANCE_UPDATED');
    toast.success(`Clocked in: ${staffName} at ${nowTimeStr} (${status})`);
    return record;
  };

  const clockOutStaff = async (staffId: string): Promise<boolean> => {
    const todayStr = new Date().toISOString().split('T')[0];
    const nowTimeStr = new Date().toTimeString().slice(0, 5); // "20:30"
    const record = attendanceRecords.find(
      (a) => a.staff_id === staffId && a.attendance_date === todayStr
    );
    if (!record) {
      toast.error('No clock-in record found for today.');
      return false;
    }

    const [hours, minutes] = nowTimeStr.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    const shiftEndMinutes = 22 * 60; // 10:00 PM
    const overtimeHours = Math.max(0, Math.round(((totalMinutes - shiftEndMinutes) / 60) * 10) / 10);

    const updates = {
      clock_out: nowTimeStr,
      overtime_hours: overtimeHours,
      updated_at: new Date().toISOString(),
    };

    return updateStaffAttendance(record.id, updates);
  };

  const logStaffAttendance = async (
    record: Omit<StaffAttendanceRecord, 'id' | 'created_at' | 'updated_at'>
  ): Promise<StaffAttendanceRecord | null> => {
    const id = `att-${Date.now()}`;
    const nowIso = new Date().toISOString();
    const fullRecord: StaffAttendanceRecord = {
      ...record,
      id,
      created_at: nowIso,
      updated_at: nowIso,
    };

    setAttendanceRecords((prev) => {
      const updated = [fullRecord, ...prev];
      try {
        localStorage.setItem('tgs_cached_attendance', JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });

    try {
      await supabase.from('tgs_staff_attendance').insert([fullRecord]);
    } catch (e) {
      console.warn('DB attendance insert error:', e);
    }

    notifyRealtimeChange('ATTENDANCE_UPDATED');
    toast.success(`Attendance marked for ${record.staff_name}`);
    return fullRecord;
  };

  const updateStaffAttendance = async (id: string, updates: Partial<StaffAttendanceRecord>): Promise<boolean> => {
    const nowIso = new Date().toISOString();
    const cleanUpdates = { ...updates, updated_at: nowIso };

    setAttendanceRecords((prev) => {
      const updated = prev.map((a) => (a.id === id ? { ...a, ...cleanUpdates } : a));
      try {
        localStorage.setItem('tgs_cached_attendance', JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });

    try {
      await supabase.from('tgs_staff_attendance').update(cleanUpdates).eq('id', id);
    } catch (e) {
      console.warn('DB attendance update error:', e);
    }

    notifyRealtimeChange('ATTENDANCE_UPDATED');
    toast.success('Attendance record updated');
    return true;
  };

  const deleteStaffAttendance = async (id: string): Promise<boolean> => {
    setAttendanceRecords((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      try {
        localStorage.setItem('tgs_cached_attendance', JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });

    try {
      await supabase.from('tgs_staff_attendance').delete().eq('id', id);
    } catch (e) {
      console.warn('DB attendance delete error:', e);
    }

    notifyRealtimeChange('ATTENDANCE_UPDATED');
    toast.success('Attendance record removed');
    return true;
  };

  // Toggle Attendance Penalty Waiver (Paid Off / Waived by Owner)
  const toggleAttendanceWaiver = async (
    attendanceId: string,
    isPaidOff: boolean,
    reason?: string
  ): Promise<boolean> => {
    if (role !== 'owner') {
      toast.error('Security Restriction: Only the Salon Owner can waive late penalties.');
      return false;
    }

    setAttendanceRecords((prev) => {
      const updated = prev.map((a) => {
        if (a.id === attendanceId) {
          return {
            ...a,
            is_paid_off: isPaidOff,
            waived_by: isPaidOff ? (currentUser?.name || 'Owner') : null,
            waived_reason: isPaidOff ? (reason || 'Waived by Owner') : null,
            updated_at: new Date().toISOString(),
          };
        }
        return a;
      });
      try {
        localStorage.setItem('tgs_cached_attendance', JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });

    try {
      await supabase
        .from('tgs_staff_attendance')
        .update({
          is_paid_off: isPaidOff,
          waived_by: isPaidOff ? (currentUser?.name || 'Owner') : null,
          waived_reason: isPaidOff ? (reason || 'Waived by Owner') : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', attendanceId);
    } catch (e) {
      console.warn('DB attendance waiver update error:', e);
    }

    notifyRealtimeChange('ATTENDANCE_UPDATED');
    toast.success(isPaidOff ? 'Late penalty marked as Paid Off / Waived by Owner' : 'Late penalty reinstated');
    return true;
  };

  // Update Late Penalty Configuration (Owner Only)
  const updateLatePenaltyConfig = async (configUpdates: Partial<LatePenaltyRuleConfig>): Promise<void> => {
    if (role !== 'owner') {
      toast.error('Security Restriction: Only the Salon Owner can modify late penalty rules.');
      return;
    }

    const currentConfig = settings.late_penalty_config || {
      grace_period_minutes: 15,
      penalty_mode: 'per_minute',
      penalty_rate_per_minute: 20,
      flat_penalty_per_late: 250,
      threshold_minutes_for_half_day: 45,
    };

    const newConfig: LatePenaltyRuleConfig = {
      ...currentConfig,
      ...configUpdates,
    };

    await updateSettings({
      late_penalty_config: newConfig,
    });

    toast.success('Owner Late Penalty rules updated successfully');
  };

  // Auto Salary Calculator with Attendance adjustments
  const calculateMonthlyAttendanceSalary = (
    staffMember: StaffMember,
    monthStr?: string
  ): AttendanceSalaryCalculation => {
    const targetMonth = monthStr || new Date().toISOString().slice(0, 7);
    const [yearStr, monthStrPart] = targetMonth.split('-');
    const year = parseInt(yearStr, 10) || new Date().getFullYear();
    const month = parseInt(monthStrPart, 10) || (new Date().getMonth() + 1);

    // Continuous Calendar Days in this exact calendar month (working all days, no day off)
    const totalWorkingDaysInMonth = new Date(year, month, 0).getDate() || 30;

    const staffRecords = attendanceRecords.filter(
      (a) => a.staff_id === staffMember.id && a.attendance_date.startsWith(targetMonth)
    );

    const daysPresent = staffRecords.filter((a) => a.status === 'Present').length;
    const daysLate = staffRecords.filter((a) => a.status === 'Late').length;
    const daysHalfDay = staffRecords.filter((a) => a.status === 'Half Day').length;
    const daysAbsent = staffRecords.filter((a) => a.status === 'Absent').length;

    const baseMonthlySalary = Number(staffMember.base_salary) || 0;
    // Base salary divided by exact number of calendar days in that month
    const perDayRate = totalWorkingDaysInMonth > 0 ? baseMonthlySalary / totalWorkingDaysInMonth : 0;

    // Owner Configurable Late Penalty Rule Engine
    const lateConfig: LatePenaltyRuleConfig = settings.late_penalty_config || {
      grace_period_minutes: 15,
      penalty_mode: 'per_minute',
      penalty_rate_per_minute: 20,
      flat_penalty_per_late: 250,
      threshold_minutes_for_half_day: 45,
    };

    let waivedLateCount = 0;
    let unwaivedLateCount = 0;
    let latePenaltyDeduction = 0;

    const lateRecords = staffRecords.filter((a) => a.status === 'Late');
    for (const rec of lateRecords) {
      if (rec.is_paid_off) {
        waivedLateCount++;
      } else {
        unwaivedLateCount++;
        const lateMins = Number(rec.late_minutes) || 0;

        if (lateConfig.penalty_mode === 'per_minute') {
          const chargeableMins = Math.max(0, lateMins - (Number(lateConfig.grace_period_minutes) || 0));
          latePenaltyDeduction += chargeableMins * (Number(lateConfig.penalty_rate_per_minute) || 20);
        } else if (lateConfig.penalty_mode === 'flat_per_late') {
          latePenaltyDeduction += Number(lateConfig.flat_penalty_per_late) || 250;
        } else if (lateConfig.penalty_mode === 'half_day_after_threshold') {
          if (lateMins > (Number(lateConfig.threshold_minutes_for_half_day) || 45)) {
            latePenaltyDeduction += Math.round(perDayRate * 0.5);
          } else {
            latePenaltyDeduction += Number(lateConfig.flat_penalty_per_late) || 250;
          }
        }
      }
    }

    if (lateConfig.penalty_mode === 'three_lates_one_day') {
      const daysDeducted = Math.floor(unwaivedLateCount / 3);
      latePenaltyDeduction = Math.round(daysDeducted * perDayRate);
    }

    // Base salary adjustment:
    // Full base if present on all days, minus absent/half-day proration and late penalties
    let attendanceAdjustedBase = baseMonthlySalary;
    if (staffMember.pay_type === 'salary_only' || staffMember.pay_type === 'salary_plus_commission') {
      const absentDeduction = daysAbsent * perDayRate;
      const halfDayDeduction = daysHalfDay * 0.5 * perDayRate;
      attendanceAdjustedBase = Math.max(
        0,
        Math.round(baseMonthlySalary - absentDeduction - halfDayDeduction - latePenaltyDeduction)
      );
    } else {
      attendanceAdjustedBase = 0;
    }

    const staffInvoices = invoices.filter(
      (inv) => inv.created_at.startsWith(targetMonth) && inv.status === 'Completed'
    );
    let totalServiceRevenue = 0;
    let commissionEarned = 0;

    for (const inv of staffInvoices) {
      for (const it of inv.items) {
        if (it.staff_id === staffMember.id || it.staff_name === staffMember.name) {
          totalServiceRevenue += Number(it.price) || 0;
          if (it.commission_amount) {
            commissionEarned += Number(it.commission_amount) || 0;
          } else {
            const rate = Number(staffMember.commission_rate) || 0;
            commissionEarned += (Number(it.price) * rate) / 100;
          }
        }
      }
    }

    let chairShare = 0;
    let stationFee = Number(staffMember.station_fee) || 0;
    if (staffMember.pay_type === 'individual_partnership') {
      const shareRate = Number(staffMember.partnership_percentage) || 50;
      chairShare = (totalServiceRevenue * shareRate) / 100;
    }

    let netPayout = 0;
    if (staffMember.pay_type === 'salary_only') {
      netPayout = attendanceAdjustedBase;
    } else if (staffMember.pay_type === 'commission_only') {
      netPayout = Math.max(0, commissionEarned - latePenaltyDeduction);
    } else if (staffMember.pay_type === 'salary_plus_commission') {
      netPayout = attendanceAdjustedBase + commissionEarned;
    } else if (staffMember.pay_type === 'individual_partnership') {
      netPayout = Math.max(0, chairShare - stationFee - latePenaltyDeduction);
    }

    return {
      staffId: staffMember.id,
      staffName: staffMember.name,
      payType: staffMember.pay_type,
      baseSalary: baseMonthlySalary,
      daysPresent,
      daysLate,
      daysHalfDay,
      daysAbsent,
      totalWorkingDays: totalWorkingDaysInMonth,
      perDayRate: Math.round(perDayRate),
      waivedLateCount,
      unwaivedLateCount,
      latePenaltyDeduction: Math.round(latePenaltyDeduction),
      attendanceAdjustedBase,
      commissionEarned: Math.round(commissionEarned),
      chairShare: Math.round(chairShare),
      stationFee,
      netPayout: Math.round(netPayout),
    };
  };

  // Day Closing & Drawer Reconciliation
  const closeDayRegister = async (
    openingCash: number,
    actualCash: number,
    notes: string,
    closedBy: string
  ): Promise<DayClosingRecord | null> => {
    const todayStr = new Date().toISOString().split('T')[0];

    const todayInvoices = invoices.filter(
      (inv) => inv.created_at.startsWith(todayStr) && inv.status === 'Completed'
    );

    let cashSales = 0;
    let cardSales = 0;
    let onlineSales = 0;

    for (const inv of todayInvoices) {
      if (inv.payment_method === 'Cash') {
        cashSales += inv.total_amount;
      } else if (inv.payment_method === 'Card') {
        cardSales += inv.total_amount;
      } else if (inv.payment_method === 'Online Transfer') {
        onlineSales += inv.total_amount;
      } else if (inv.payment_method === 'Split' && inv.split_details) {
        for (const s of inv.split_details) {
          if (s.method === 'Cash') cashSales += s.amount;
          else if (s.method === 'Card') cardSales += s.amount;
          else if (s.method === 'Online Transfer') onlineSales += s.amount;
        }
      }
    }

    const cashExpenses = expenses
      .filter((exp) => exp.expense_date === todayStr && exp.payment_mode === 'Cash')
      .reduce((sum, exp) => sum + exp.amount, 0);

    const expectedCash = openingCash + cashSales - cashExpenses;
    const variance = actualCash - expectedCash;

    const recordPayload = {
      closing_date: todayStr,
      register_date: todayStr,
      opening_cash: openingCash,
      cash_sales: cashSales,
      total_cash_sales: cashSales,
      card_sales: cardSales,
      total_card_sales: cardSales,
      online_sales: onlineSales,
      total_online_sales: onlineSales,
      total_sales: cashSales + cardSales + onlineSales,
      cash_expenses: cashExpenses,
      total_cash_expenses: cashExpenses,
      expected_cash: expectedCash,
      expected_cash_in_drawer: expectedCash,
      actual_cash: actualCash,
      actual_cash_counted: actualCash,
      variance: variance,
      notes: notes || null,
      closed_by: closedBy,
      status: 'Closed',
      created_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await supabase
        .from('tgs_cash_registers')
        .upsert(recordPayload, { onConflict: 'closing_date' })
        .select()
        .single();

      if (!error && data) {
        const fullRecord: DayClosingRecord = {
          ...recordPayload,
          id: data.id,
        };
        setCashRegisters((prev) => [fullRecord, ...prev.filter((r) => r.closing_date !== todayStr)]);
        notifyRealtimeChange('DAY_CLOSED');
        toast.success(`Day closing finalized for ${todayStr}. Variance: ${currencyFormat(variance)}`);
        return fullRecord;
      }
    } catch (e) {
      console.warn(e);
    }

    const fallbackRecord: DayClosingRecord = {
      ...recordPayload,
      id: `reg-${Date.now()}`,
    };
    setCashRegisters((prev) => [fallbackRecord, ...prev.filter((r) => r.closing_date !== todayStr)]);
    notifyRealtimeChange('DAY_CLOSED');
    toast.success(`Day closing finalized for ${todayStr}`);
    return fallbackRecord;
  };

  // Appointments CRUD
  const addAppointment = async (
    appt: Omit<SalonAppointment, 'id' | 'created_at'>
  ): Promise<SalonAppointment | null> => {
    try {
      const { data, error } = await supabase.from('tgs_appointments').insert([appt]).select().single();
      if (!error && data) {
        setAppointments((prev) => [data, ...prev]);
        toast.success(`Appointment booked for ${appt.client_name}`);
        return data;
      }
    } catch (e) {
      console.warn(e);
    }

    const fallback: SalonAppointment = {
      ...appt,
      id: `appt-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setAppointments((prev) => [fallback, ...prev]);
    toast.success(`Appointment booked for ${appt.client_name}`);
    return fallback;
  };

  const updateAppointmentStatus = async (id: string, status: SalonAppointment['status']): Promise<boolean> => {
    try {
      await supabase.from('tgs_appointments').update({ status }).eq('id', id);
    } catch (e) {
      console.warn(e);
    }
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    toast.success(`Appointment status updated to ${status}`);
    return true;
  };

  const updateAppointment = async (id: string, updates: Partial<SalonAppointment>): Promise<boolean> => {
    try {
      await supabase.from('tgs_appointments').update(updates).eq('id', id);
    } catch (e) {
      console.warn(e);
    }
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
    toast.success('Appointment updated');
    return true;
  };

  const deleteAppointment = async (id: string): Promise<boolean> => {
    try {
      await supabase.from('tgs_appointments').delete().eq('id', id);
    } catch (e) {
      console.warn(e);
    }
    setAppointments((prev) => prev.filter((a) => a.id !== id));
    toast.success('Appointment cancelled and removed');
    return true;
  };

  const resetDemoData = async () => {
    toast.info('Refreshing all TGS Salon database tables...');
    await refreshAll();
    toast.success('Salon data refreshed with live database');
  };

  return (
    <SalonContext.Provider
      value={{
        currentUser,
        userAccounts,
        pendingUsersCount,
        role,
        permissions,
        allPermissions,
        updatePermissions: (newPerms: Partial<RolePermissions>) => updateRolePermissions('manager', newPerms),
        updateRolePermissions,
        login,
        registerUser,
        approveUser,
        updateUser,
        deleteUser,
        logout,
        roleNavTabs,
        updateRoleNavTab,
        isTabVisibleForCurrentRole,
        settings,
        updateSettings,
        staff,
        addStaff,
        updateStaff,
        deleteStaff,
        calculateStaffPayout,
        updateClientWallet,
        addClientPunchStamp,
        editClientPunchStamps,
        removeClientPunchStamp,
        redeemClientPunchReward,
        services,
        serviceCategories,
        addCategory,
        updateCategory,
        deleteCategory,
        addService,
        updateService,
        deleteService,
        togglePinService,
        marketingCampaigns,
        addCampaign,
        updateCampaign,
        deleteCampaign,
        trackCampaignSend,
        clients,
        addClient,
        updateClient,
        deleteClient,
        loyaltyPrograms,
        toggleLoyaltyProgram,
        updateLoyaltyProgram,
        addLoyaltyProgram,
        deleteLoyaltyProgram,
        invoices,
        createInvoice,
        updateInvoice,
        refundInvoice,
        deleteInvoice,
        expenses,
        addExpense,
        updateExpense,
        deleteExpense,
        dailyExpenseQuota,
        updateDailyExpenseQuota,
        remainingExpenseQuota,
        isQuotaExceeded,
        staffPermissions,
        updateStaffPermissions,
        ownerNotes,
        addOwnerNote,
        updateOwnerNote,
        deleteOwnerNote,
        attendanceRecords,
        clockInStaff,
        clockOutStaff,
        logStaffAttendance,
        updateStaffAttendance,
        deleteStaffAttendance,
        toggleAttendanceWaiver,
        updateLatePenaltyConfig,
        latePenaltyConfig: settings.late_penalty_config || {
          grace_period_minutes: 15,
          penalty_mode: 'per_minute',
          penalty_rate_per_minute: 20,
          flat_penalty_per_late: 250,
          threshold_minutes_for_half_day: 45,
        },
        calculateMonthlyAttendanceSalary,
        cashRegisters,
        closeDayRegister,
        appointments,
        addAppointment,
        updateAppointmentStatus,
        updateAppointment,
        deleteAppointment,
        chairs,
        updateChair,
        isOnline,
        offlineQueueCount,
        syncOfflineQueue,
        closingCountdown,
        autoCloseDayNow,
        sendWhatsAppMessage,
        generateWhatsAppClosingReport,
        refreshAll,
        isLoading,
        currencyFormat,
        resetDemoData,
      }}
    >
      {children}
    </SalonContext.Provider>
  );
};

export const useSalon = () => {
  const context = useContext(SalonContext);
  if (!context) {
    throw new Error('useSalon must be used within a SalonProvider');
  }
  return context;
};
