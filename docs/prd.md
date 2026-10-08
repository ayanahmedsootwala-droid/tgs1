# Requirements Document

## 1. Application Overview

- **Application Name**: The Grooming Studio TGS - Salon Management System (v15)
- **Application Description**: A mobile-responsive salon operating, POS, and CRM web application localized for Pakistan (PKR / Rs.) for The Grooming Studio TGS. The system incorporates database anti-theft protection, real-time date handling, granular role permissions, a seamless offline-resilient POS checkout engine, an attendance-adjusted auto-payroll calculator, persistent owner financial ledger configurations (revenue targets and rent persistence), owner-exclusive past transaction and expense modification tools, an expanded Pakistan Salon Knowledge Library (Pro Playbook with exact numbers and financial blueprints), and version 15 source code export capabilities (tgs_salon_source_code_v15.zip and tgs_salon_source_code.zip).

## 2. User & Usage Scenarios

- **Target Users**:
  - **Salon Owner**: Complete administrative authority over system settings, branding, Quick Walk-In visibility toggle, granular role permissions, staff attendance and late penalty waivers, auto-payroll rules, client data masking overrides, business intelligence, ledger rent/target configurations, full past transaction and expense editing, exclusive Pakistan Salon Knowledge Library, and v15 source code package downloads.
  - **Salon Manager**: Operational supervisor managing daily POS billing, client CRM profiles (subject to anti-theft communication restrictions), staff attendance logging, daily expense logging within budget quotas, and marketing templates.
  - **Cashier / Billing Staff**: Front-desk operators processing POS invoices, looking up receipt references, logging petty cash expenses within quota, and printing standard customer slips without client loyalty metadata.
  - **Worker / Barber / Stylist**: Service provider clocking attendance, viewing assigned service attribution, tips, and individual daily commission breakdowns.

- **Core Scenarios**:
  - **Offline POS Billing & Resilience**: Staff continue creating POS invoices and printing receipts without network connectivity. Offline transactions are stored locally without crashing or runtime errors and automatically sync when connectivity is restored.
  - **Strict Owner-Only Settings & Configuration**: Managers and staff have no access or navigation entry points to settings, branding, or feature toggles. Direct URL access to settings is strictly blocked for non-owner roles.
  - **Persistent Owner Ledger Target & Rent Configuration**: The Owner enters monthly target revenue and fixed shop rent values, which persist permanently across page reloads and sessions without auto-resetting or being overwritten.
  - **Owner Transaction & Expense Editing**: The Owner modifies historical sales invoices (amounts, payment methods, line items, assigned staff, dates, notes) and historical expense entries (categories, amounts, notes, dates) directly from the ledger and history views.
  - **Owner Pro Playbook Reference**: The Owner accesses comprehensive localized operational strategies with exact financial models, setup costings, high-profit service packages, Karigar retention structures, power backup sizing, and wholesale sourcing blueprints.
  - **Streamlined POS Checkout Flow**: Cashiers select services from the categorized catalog, search or add a client, and complete line-item billing attribution with split or single PKR payment methods.
  - **Anti-Theft CRM & Report Security**: Non-owner roles cannot initiate direct WhatsApp chats from the CRM, view masked client phone digits, or see loyalty stamp metrics on generated reports and customer slips.

## 3. Page Structure & Functional Specifications

### Page Structure Tree

- The Grooming Studio TGS (v15)
  - Authentication & Security
    - Login Screen (Email & Password)
    - Sign Up / Registration Page
    - Pending Approval Screen
  - Global Layout & Navigation Shell
    - Dynamic Header (Real-Time Date Indicator, Online/Offline Status Indicator, User Role Badge)
    - Mobile-Optimized Navigation Dock (Settings Icon Exclusively Rendered for Owner)
  - POS / Billing & Lookup
    - Categorized Service Catalog & Fast Pinned Services
    - Client Selector & Search Bar (Includes Quick Add '+' Client Modal; Conditional Quick Walk-In Button)
    - Active Invoice & Billing Summary (Line-Item Barber Attribution, PKR Split/Single Payment, Checkout Action)
    - Receipt Reference Quick Lookup Search Bar
    - Itemized Receipt Modal & Slip Print Generator
  - Offline PWA & Sync Queue Hub
    - Offline Storage Engine & Transaction Queue
    - Sync Status Indicator & Conflict-Free Queue Flusher
  - Daily Sync Report & Automated Day Closing
    - Accounting Receipt-Style Sales Feed (Services Paired with Assigned Barbers)
    - 11:59 PM Auto-Closing Timer & Daily Snapshot Archive
    - WhatsApp Business Report Generator (Loyalty Metadata Excluded for Non-Owners)
  - Client Directory CRM & Punch Card Studio
    - Client Directory (Middle 5 Digits Masked for Non-Owners, WhatsApp Action Disabled for Non-Owners)
    - Client Profile & Visit History Modal
    - Digital Stamp Card Management Hub (1 Stamp / Day Rule, Owner Stamp Adjustment Tools)
    - Client Add / Edit Modal
  - Marketing & Campaigns Hub (Owner & Manager)
    - Client Segmentation Filters
    - WhatsApp Campaign Template Selector
    - Broadcast Activity Log
  - Real-Time Sales & Expense Tracker
    - Dynamic Date Selector & Sales Stream
    - Daily Expense Quota Tracker (Daily Limit, Remaining Quota, Exceeded Expense Flag)
    - Petty Cash Expense Logger
  - Staff Attendance
    - Staff Clock-In / Clock-Out Interface
    - Daily Attendance Sheet & Monthly Logs
    - Owner Manual Attendance Editor (Status, Clock In/Out Times, Late Minutes, Penalty Waived Toggle)
  - Staff Commission & Salary Calculator (Owner & Manager)
    - Monthly Auto-Payroll Engine (Base Salary / Exact Days of Month, Late Penalty Deductions)
    - Owner Late Penalty Configuration Tool (Thresholds, Deduction Formulas, Waive Toggles)
    - Commission Rate Override Tool (Owner Only)
    - Printable & WhatsApp-Shareable Pay Slip Generator
  - Business Analytics & Business Intelligence (Owner Only)
    - Revenue Trends & Average Order Value Tracker
    - Peak Hours Heatmap Matrix
    - Barber Contribution & Service Margins
  - Owner Financial Ledger & CapEx Hub (Owner Only)
    - Persistent Target Revenue & Shop Rent Settings Module
    - Transaction History Editor (Owner-Only Edit Modal for Past Invoices & Items)
    - Expense History Editor (Owner-Only Edit Modal for Past Petty Cash & Operational Entries)
    - Cash vs Online Reconciliation Summary
    - Consolidated Net Profit & Operational Expense Ledger
    - Capital Expenditure (CapEx) Logger
  - Pakistan Salon Knowledge Library / Pro Playbook (Owner Only)
    - Clients & High-Profit Packages Module (Acquisition Costs, Retention, Pakistani Wedding Packages PKR 8,000-25,000, Eid Rush Protocol, VIP Membership Tiers)
    - Staff & Financial Compensation Module (50/50 vs 60/40 Commission vs Fixed + 20% Models, Karigar Retention Blueprints, Background Verification, Tip Pooling Systems)
    - Management, Space & Infrastructure Module (Location Benchmarks PKR 50k-250k Rent, Load Shedding & 5-15 KVA Generator/Solar Sizing, RO Water Sizing, Station Spacing)
    - Product & Merchandise Sourcing Module (Shah Alam Lahore & Bolton Market Karachi Sourcing, Counterfeit Identification Tests, 60-70% Retail Markup Models)
    - Marketing, Deals & Pricing Module (PKR 15,000-30,000 Local Meta/TikTok Ad Blueprints, Jummah Packages, WhatsApp Automation, Groom/Bridal Packages)
  - Owner Settings & Configuration (Owner Only - Route Guarded)
    - Quick Walk-In Feature Toggle (Global Visibility Control)
    - Salon Identity & Branding Settings (Salon Name, Contact, Logo, Slip Footer)
    - Granular Role Permission Toggles
    - Anti-Theft Protection Controls
    - Feature Access & Attendance Rule Toggles
  - Source Code Export (Owner Only)
    - Version 15 Package Downloader (tgs_salon_source_code_v15.zip and tgs_salon_source_code.zip)

### Functional Specifications

#### 3.1 Strict Owner-Only Settings & Profile Customizations
- **Navigation Dock & Header**: The Settings icon/link is rendered exclusively for the Owner role. For all non-owner roles (Managers, Cashiers, Staff), the icon and link are completely omitted from the DOM and navigation tree.
- **Route Protection**: Direct access to `/settings` or any salon profile/customization route by non-owner roles is intercepted and redirected to the dashboard.
- **Branding & Profile Customization**: Only the Owner can modify salon name, contact details, currency, receipt footers, and system configurations.

#### 3.2 Persistent Owner Ledger Target & Rent Configuration
- **Target & Rent Inputs**: The Owner Financial Ledger provides explicit input fields for Monthly Revenue Target (PKR) and Monthly Shop Rent (PKR).
- **Data Persistence**: Configured target and rent values are saved to backend persistent storage and do not reset or get overwritten during page reloads, session updates, or day-end closings.

#### 3.3 Past Transaction & Expense Editing (Owner Exclusive)
- **Past Transaction Modification**: The Owner can open any historical transaction record and edit transaction amount, payment breakdown (Cash, Card, Online Transfer), line-item services, assigned staff/barber, date/time stamp, and invoice notes.
- **Past Expense Modification**: The Owner can open any historical expense entry and modify expense category, amount, payment source, date/time stamp, and description notes.
- **Audit & Recalculation**: Modifying historical sales or expenses automatically recalculates daily revenue totals, commission splits, and net profit ledger balances.

#### 3.4 Robust Offline POS Billing & Exception Handling
- **Exception-Free Rendering**: Core layout and dashboard views initialize with zero unexpected rendering errors or crash dialogs.
- **Offline Checkout Engine**: The POS checkout pipeline executes fully in offline state. Cashiers can select services, assign staff, apply discounts, select payment types, finalize invoices, and print receipts without runtime exceptions.
- **Local Queue & Auto-Sync**: Invoices created offline are written to persistent local storage with temporary identifiers and synchronized to the central database as soon as connectivity is re-established.

#### 3.5 Expanded Pakistan Salon Pro Knowledge Library (Owner Playbook)
- **Exclusive Access**: Accessible solely to the Owner account.
- **In-Depth Modules with Exact Financials & Blueprints**:
  1. **Clients & High-Profit Service Packages**: Complete blueprints for Wedding Groom Packages (Basic Groom PKR 8,000, Royal Groom PKR 15,000, Ultra VIP Groom PKR 25,000 including HydraFacial, beard styling, hair spa, and mani-pedi); Eid rush appointment time-slot management; client acquisition cost (CAC) targeting PKR 300-600 per new client; loyalty tiers (Silver, Gold, Black Card).
  2. **Staff & Compensation Blueprints**: Comparative models for 50/50 commission (barber brings tools), 60/40 salon-heavy commission (salon provides all consumables), and Base Salary (PKR 30,000 - 45,000) + 15-20% service commission; Karigar retention protocols with Eid bonuses and emergency micro-loan funds; transparent tip distribution boxes.
  3. **Management, Space & Utility Sizing**: Commercial rental benchmarks across Tier-1/Tier-2 Pakistani locations (PKR 50,000 - 250,000/month); power backup blueprints detailing 5 KVA - 15 KVA silent diesel/petrol generator configurations, 5 kW hybrid solar systems with lithium/tubular batteries for load shedding resilience; 500 GPD RO water filtration setups for hair wash basins; ergonomic 4.5-foot station spacing.
  4. **Product Sourcing & Wholesale Hubs**: Direct wholesale sourcing guides for Shah Alam Market (Lahore) and Bolton Market (Karachi); counterfeit verification checklist (batch code check, hologram verification, consistency and fragrance checks); 60-70% retail product markup strategy on professional grooming waxes, serums, and beard oils.
  5. **Marketing, Deals & Pricing Strategy**: Meta and TikTok ad campaign formulas allocating PKR 15,000 - 30,000 monthly with hyperlocal 3-5 km radius targeting; Jummah / Friday discount deals; automated WhatsApp appointment reminders; seasonal corporate grooming tie-ups.

#### 3.6 Version 15 Packaging & Export
- **Source Code Export**: The Owner Source Code Export section provides active download triggers for `tgs_salon_source_code_v15.zip` and `tgs_salon_source_code.zip`.
- **Version Uniformity**: All UI badges, metadata labels, and system references reflect Version 15.

## 4. Business Rules & Core Logic

1. **Owner Settings Exclusivity Rule**: Settings UI elements, links, and route handlers are strictly accessible by the Owner role. Navigation links are hidden from non-owners.
2. **Ledger Configuration Persistence Rule**: Shop Rent and Monthly Target values saved by the Owner are locked in persistent storage and cannot be overwritten by automated routines or page refreshes.
3. **Owner-Only Transaction Edit Rule**: Only authenticated Owner accounts have permission to edit existing transaction records and historical expense entries. Non-owner accounts only have view/create permissions.
4. **Offline POS Execution Rule**: POS checkout actions, slip rendering, and receipt print jobs must execute completely in an offline environment without generating network error modals.
5. **Quick Walk-In Visibility Rule**: When Quick Walk-In is toggled off in Owner Settings, the Walk-In button is hidden from POS across all active sessions.
6. **Monthly Auto-Payroll Computation**:
   - `Daily Salary Rate = Base Salary / Total Calendar Days in Active Month`
   - `Net Monthly Salary = (Present Days * Daily Salary Rate) + Commissions + Tips - Active Late Penalties`
7. **Late Penalty Calculation**:
   - Applied when `Late Minutes > Grace Period` and `Waiver Status = False`.
   - If marked as `Waived / Paid Off` by Owner, late penalty deduction equals 0.
8. **Daily Stamp Cap**: Maximum 1 loyalty stamp per registered client per calendar day.
9. **Daily Expense Budget Limit**:
   - `Remaining Quota = Daily Expense Budget - Total Standard Daily Expenses Logged`
   - Expenses exceeding budget are logged with an `Exceeded Expense` tag.
10. **Receipt Reference Format**: Structured as `TGS-YYMMDD-XXXX` upon checkout completion.

## 5. Exceptions & Edge Cases

| Scenario | Trigger / Condition | System Behavior |
|---|---|---|
| Non-Owner Navigates to `/settings` | Manager or Staff attempts direct URL entry or deep link to settings | System denies access and redirects user to main dashboard |
| Offline POS Checkout | User completes invoice while device has no internet access | Invoice is saved locally to offline queue, receipt prints normally, and transaction is marked for auto-sync without UI crashes |
| Target & Rent Update | Owner enters new monthly target or rent in financial ledger | System saves values to persistent storage immediately, retaining values across sessions and system restarts |
| Owner Modifies Past Transaction | Owner updates historical invoice payment method or line items | System updates the transaction record, recalculates daily sales totals and barber commission allocations |
| Owner Modifies Past Expense | Owner updates past petty cash or operational expense record | System updates expense entry and updates net profit ledger balances |
| Network Reconnection After Offline Sales | Device regains internet access after processing offline invoices | System automatically synchronizes queued sales to central database without creating duplicates |
| Non-Owner Opens Knowledge Playbook | Manager or Staff attempts to view Owner Pro Playbook | Navigation item is hidden and route access is blocked |
| Non-Owner Attempts Client WhatsApp Messaging | Non-owner user attempts to initiate WhatsApp chat from CRM | Feature button is hidden and action is blocked |

## 6. Acceptance Criteria

1. The web application renders cleanly on all main screens without displaying unhandled error dialogs or crash screens.
2. The navigation dock and header display no settings icons or configuration links for Manager, Cashier, or Staff roles.
3. Direct URL access to `/settings` or salon customization views by non-owner roles is blocked and redirected.
4. POS checkout, line-item attribution, split/single PKR payment, and receipt printing function without errors in offline mode.
5. Revenue Target and Shop Rent configurations entered by the Owner in the Financial Ledger persist reliably across reloads and day-end cycles.
6. The Owner role can successfully edit past transaction records (amount, items, staff attribution, payment mode, date) and past expense records with automatic ledger recalculation.
7. The Pakistan Salon Knowledge Library contains full detailed blueprints with exact numbers for service packages, compensation models, generator/solar sizing, wholesale markets, and marketing ad budgets.
8. Non-owner accounts cannot send WhatsApp messages from CRM, view unmasked phone numbers, or see loyalty stamp metrics on generated reports.
9. Monthly payroll accurately divides base salary by the exact number of calendar days in the selected month and applies late penalties unless waived by the Owner.
10. The Owner Source Code Export tab provides functional download triggers for `tgs_salon_source_code_v15.zip` and `tgs_salon_source_code.zip` with v15 version badges.

## 7. Out of Scope (Current MVP)

1. Public customer self-booking online web portal.
2. Automated bank clearing house (ACH) direct payment gateway integrations.
3. Biometric physical fingerprint hardware integrations.
4. Multi-branch cross-warehouse supply chain freight management.