-- 1. Create tgs_users table for individual accounts, registration & approval workflow
CREATE TABLE IF NOT EXISTS public.tgs_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  phone TEXT,
  cnic TEXT,
  role TEXT NOT NULL DEFAULT 'worker' CHECK (role IN ('owner', 'manager', 'worker', 'cashier')),
  status TEXT NOT NULL DEFAULT 'pending_approval' CHECK (status IN ('pending_approval', 'approved', 'rejected', 'suspended')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed initial Owner and Manager
INSERT INTO public.tgs_users (name, email, password_hash, phone, cnic, role, status)
VALUES 
  ('Farhan Malik (Owner)', 'owner@tgs.pk', 'admin123', '+92 300 8271920', '42101-1234567-1', 'owner', 'approved'),
  ('Bilal Ahmed (Floor Manager)', 'manager@tgs.pk', 'manager123', '+92 301 9283746', '42101-2345678-2', 'manager', 'approved')
ON CONFLICT (email) DO UPDATE 
SET role = EXCLUDED.role, status = EXCLUDED.status;

-- 2. Add is_pinned to tgs_services if not exists, and pin Haircut and Beard
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tgs_services' AND column_name = 'is_pinned') THEN
    ALTER TABLE public.tgs_services ADD COLUMN is_pinned BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

UPDATE public.tgs_services SET is_pinned = TRUE WHERE name ILIKE '%haircut%' OR name ILIKE '%beard%';

-- 3. Create Service Categories table
CREATE TABLE IF NOT EXISTS public.tgs_service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO public.tgs_service_categories (name, description, display_order)
VALUES 
  ('Hair & Styling', 'Haircuts, hair treatments, dyes, and styling', 1),
  ('Beard & Mustache', 'Beard trimming, shaping, styling, and beard dye', 2),
  ('Facials & Skin Care', 'Whitening facials, scrubs, masks, and cleansing', 3),
  ('Massage & Therapy', 'Head, shoulder, and foot relaxation massage', 4),
  ('Grooming & Waxing', 'Face, cheek, ear, nose waxing, and threading', 5),
  ('Mani & Pedi', 'Hand and foot manicure pedicure grooming', 6)
ON CONFLICT (name) DO NOTHING;

-- 4. Create Marketing Campaigns table
CREATE TABLE IF NOT EXISTS public.tgs_marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  discount_code TEXT,
  discount_type TEXT DEFAULT 'percentage', -- 'percentage' or 'fixed'
  discount_value NUMERIC DEFAULT 10,
  target_audience TEXT DEFAULT 'all', -- 'all', 'inactive_30d', 'inactive_60d', 'top_spenders', 'vip'
  message_template TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  sent_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO public.tgs_marketing_campaigns (title, description, discount_code, discount_type, discount_value, target_audience, message_template, is_active)
VALUES 
  ('Weekend Grooming Refresh', 'Exclusive 15% discount on Haircut + Beard Combo', 'WEEKEND15', 'percentage', 15, 'all', 'Salam! Enjoy our Weekend Grooming Refresh at The Grooming Studio. Get 15% OFF on Haircut & Beard Grooming with code WEEKEND15. Book your slot today: +92 300 8271920.', TRUE),
  ('We Miss You - Comeback Treat', 'Special Rs. 500 discount for clients returning after 30 days', 'MISSU500', 'fixed', 500, 'inactive_30d', 'Salam! We miss seeing you at The Grooming Studio TGS. Here is a special Rs. 500 grooming voucher code MISSU500 on any service over Rs. 1500. Reply to reserve your chair!', TRUE),
  ('Eid & Festive VIP Package', '20% off comprehensive Whitening Facial & Mani-Pedi', 'EIDVIP', 'percentage', 20, 'top_spenders', 'Salam VIP! Upgrade your grooming game this festive season at TGS. Enjoy 20% OFF our Whitening Facial & Mani-Pedi with code EIDVIP. Valid this week only.', TRUE)
ON CONFLICT DO NOTHING;

-- 5. Create Role Navigation Tabs visibility configuration
CREATE TABLE IF NOT EXISTS public.tgs_role_nav_tabs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL,
  tab_id TEXT NOT NULL,
  tab_name TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT TRUE,
  UNIQUE(role, tab_id)
);

-- Seed default tabs for manager, worker, and cashier
INSERT INTO public.tgs_role_nav_tabs (role, tab_id, tab_name, is_enabled)
VALUES
  -- Manager tabs
  ('manager', 'billing', 'Billing / POS', TRUE),
  ('manager', 'daily-reports', 'Daily Sync Report', TRUE),
  ('manager', 'expenses', 'Expenses', TRUE),
  ('manager', 'day-closing', 'Day Closing', TRUE),
  ('manager', 'clients', 'Client Directory', TRUE),
  ('manager', 'loyalty', 'Customer Loyalty', TRUE),
  ('manager', 'staff', 'Staff & Payroll', TRUE),
  ('manager', 'services', 'Services Catalog', FALSE),
  ('manager', 'marketing', 'Marketing Campaigns', TRUE),
  ('manager', 'settings', 'Settings', FALSE),
  -- Worker tabs
  ('worker', 'appointments', 'Chairs & Queue', TRUE),
  ('worker', 'staff', 'My Commissions', TRUE),
  ('worker', 'billing', 'Billing / POS', FALSE),
  ('worker', 'daily-reports', 'Daily Sync Report', FALSE),
  ('worker', 'expenses', 'Expenses', FALSE),
  ('worker', 'day-closing', 'Day Closing', FALSE),
  ('worker', 'clients', 'Client Directory', FALSE),
  ('worker', 'loyalty', 'Customer Loyalty', FALSE),
  ('worker', 'marketing', 'Marketing Campaigns', FALSE),
  ('worker', 'settings', 'Settings', FALSE),
  -- Cashier tabs
  ('cashier', 'billing', 'Billing / POS', TRUE),
  ('cashier', 'daily-reports', 'Daily Sync Report', TRUE),
  ('cashier', 'expenses', 'Quick Expenses', TRUE),
  ('cashier', 'day-closing', 'Day Closing', TRUE),
  ('cashier', 'clients', 'Client Directory', TRUE),
  ('cashier', 'loyalty', 'Customer Loyalty', TRUE),
  ('cashier', 'staff', 'Staff', FALSE),
  ('cashier', 'services', 'Services', FALSE),
  ('cashier', 'marketing', 'Marketing', FALSE),
  ('cashier', 'settings', 'Settings', FALSE)
ON CONFLICT (role, tab_id) DO NOTHING;

-- 6. RLS Policies
ALTER TABLE public.tgs_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tgs_service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tgs_marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tgs_role_nav_tabs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public full access to tgs_users" ON public.tgs_users;
CREATE POLICY "Public full access to tgs_users" ON public.tgs_users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access to tgs_service_categories" ON public.tgs_service_categories;
CREATE POLICY "Public full access to tgs_service_categories" ON public.tgs_service_categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access to tgs_marketing_campaigns" ON public.tgs_marketing_campaigns;
CREATE POLICY "Public full access to tgs_marketing_campaigns" ON public.tgs_marketing_campaigns FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access to tgs_role_nav_tabs" ON public.tgs_role_nav_tabs;
CREATE POLICY "Public full access to tgs_role_nav_tabs" ON public.tgs_role_nav_tabs FOR ALL USING (true) WITH CHECK (true);
