import type { ReactNode } from 'react';
import { SalonLayout } from '@/components/layouts/SalonLayout';
import { POSPage } from '@/pages/POSPage';
import { AppointmentsPage } from '@/pages/AppointmentsPage';
import { ClientsPage } from '@/pages/ClientsPage';
import { ServicesPage } from '@/pages/ServicesPage';
import { StaffPage } from '@/pages/StaffPage';
import { ExpensesPage } from '@/pages/ExpensesPage';
import { DayClosingPage } from '@/pages/DayClosingPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { LoyaltyPage } from '@/pages/LoyaltyPage';
import { LoginPage } from '@/pages/LoginPage';
import { PendingApprovalPage } from '@/pages/PendingApprovalPage';
import { DailySyncReportPage } from '@/pages/DailySyncReportPage';
import { MarketingPage } from '@/pages/MarketingPage';
import { LedgerPage } from '@/pages/LedgerPage';
import { OwnerNotesPage } from '@/pages/OwnerNotesPage';
import { StaffAttendancePage } from '@/pages/StaffAttendancePage';
import { SourceCodeExportPage } from '@/pages/SourceCodeExportPage';
import { SalonKnowledgeVaultPage } from '@/pages/SalonKnowledgeVaultPage';

export interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
  public?: boolean;
}

export const routes: RouteConfig[] = [
  {
    name: 'Private Auth Portal',
    path: '/login',
    element: <LoginPage />,
    public: true,
  },
  {
    name: 'Pending Approval Welcome',
    path: '/welcome-pending',
    element: <PendingApprovalPage />,
    public: true,
  },
  {
    name: 'POS & Billing',
    path: '/',
    element: (
      <SalonLayout>
        <POSPage />
      </SalonLayout>
    ),
    public: true,
  },
  {
    name: 'Daily Synchronized Sales & Expense Report',
    path: '/daily-reports',
    element: (
      <SalonLayout>
        <DailySyncReportPage />
      </SalonLayout>
    ),
    public: true,
  },
  {
    name: 'Marketing & Campaigns',
    path: '/marketing',
    element: (
      <SalonLayout>
        <MarketingPage />
      </SalonLayout>
    ),
    public: true,
  },
  {
    name: 'Customer Loyalty Programs',
    path: '/loyalty',
    element: (
      <SalonLayout>
        <LoyaltyPage />
      </SalonLayout>
    ),
    public: true,
  },
  {
    name: 'Appointments & Chairs',
    path: '/appointments',
    element: (
      <SalonLayout>
        <AppointmentsPage />
      </SalonLayout>
    ),
    public: true,
  },
  {
    name: 'Client Directory (CRM)',
    path: '/clients',
    element: (
      <SalonLayout>
        <ClientsPage />
      </SalonLayout>
    ),
    public: true,
  },
  {
    name: 'Services & Categories',
    path: '/services',
    element: (
      <SalonLayout>
        <ServicesPage />
      </SalonLayout>
    ),
    public: true,
  },
  {
    name: 'Staff & Payroll',
    path: '/staff',
    element: (
      <SalonLayout>
        <StaffPage />
      </SalonLayout>
    ),
    public: true,
  },
  {
    name: 'Expense Tracker',
    path: '/expenses',
    element: (
      <SalonLayout>
        <ExpensesPage />
      </SalonLayout>
    ),
    public: true,
  },
  {
    name: 'Day Closing & Register',
    path: '/day-closing',
    element: (
      <SalonLayout>
        <DayClosingPage />
      </SalonLayout>
    ),
    public: true,
  },
  {
    name: 'Reports & Analytics',
    path: '/reports',
    element: (
      <SalonLayout>
        <ReportsPage />
      </SalonLayout>
    ),
    public: true,
  },
  {
    name: 'Owner Financial Ledger & Profit Engine',
    path: '/ledger',
    element: (
      <SalonLayout>
        <LedgerPage />
      </SalonLayout>
    ),
    public: true,
  },
  {
    name: 'Owner Private Notes & Checklists',
    path: '/notes',
    element: (
      <SalonLayout>
        <OwnerNotesPage />
      </SalonLayout>
    ),
    public: true,
  },
  {
    name: 'Staff Attendance & Auto Salary',
    path: '/attendance',
    element: (
      <SalonLayout>
        <StaffAttendancePage />
      </SalonLayout>
    ),
    public: true,
  },
  {
    name: 'Owner Source Code Export',
    path: '/source-export',
    element: (
      <SalonLayout>
        <SourceCodeExportPage />
      </SalonLayout>
    ),
    public: true,
  },
  {
    name: 'Pakistan Salon Pro Playbook',
    path: '/knowledge-vault',
    element: (
      <SalonLayout>
        <SalonKnowledgeVaultPage />
      </SalonLayout>
    ),
    public: true,
  },
  {
    name: 'Settings & Customization',
    path: '/settings',
    element: (
      <SalonLayout>
        <SettingsPage />
      </SalonLayout>
    ),
    public: true,
  },
];
