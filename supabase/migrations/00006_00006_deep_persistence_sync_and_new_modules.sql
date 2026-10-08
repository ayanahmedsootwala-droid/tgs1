-- 1. First drop foreign key from items to invoices
ALTER TABLE tgs_invoice_items DROP CONSTRAINT IF EXISTS tgs_invoice_items_invoice_id_fkey;
ALTER TABLE tgs_invoice_items DROP CONSTRAINT IF EXISTS tgs_invoice_items_service_id_fkey;
ALTER TABLE tgs_invoice_items DROP CONSTRAINT IF EXISTS tgs_invoice_items_staff_id_fkey;

-- 2. Drop foreign key from invoices to clients
ALTER TABLE tgs_invoices DROP CONSTRAINT IF EXISTS tgs_invoices_client_id_fkey;

-- 3. Now alter column types on tgs_invoices
ALTER TABLE tgs_invoices ALTER COLUMN client_id TYPE text USING client_id::text;
ALTER TABLE tgs_invoices ALTER COLUMN id TYPE text USING id::text;
ALTER TABLE tgs_invoices ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

-- Add all loyalty & wallet & discount fields to tgs_invoices
ALTER TABLE tgs_invoices 
  ADD COLUMN IF NOT EXISTS loyalty_reward_applied text,
  ADD COLUMN IF NOT EXISTS loyalty_reward_discount numeric DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS client_wallet_deducted numeric DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS points_redeemed integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS points_discount_amount numeric DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS referral_code_used text,
  ADD COLUMN IF NOT EXISTS vip_tier_discount_amount numeric DEFAULT 0.0;

-- 4. Alter column types on tgs_invoice_items
ALTER TABLE tgs_invoice_items ALTER COLUMN id TYPE text USING id::text;
ALTER TABLE tgs_invoice_items ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE tgs_invoice_items ALTER COLUMN invoice_id TYPE text USING invoice_id::text;
ALTER TABLE tgs_invoice_items ALTER COLUMN service_id TYPE text USING service_id::text;
ALTER TABLE tgs_invoice_items ALTER COLUMN staff_id TYPE text USING staff_id::text;

-- 5. Alter id on tgs_expenses
ALTER TABLE tgs_expenses ALTER COLUMN id TYPE text USING id::text;
ALTER TABLE tgs_expenses ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

-- 6. Clients: add points_balance, vip_tier, and loyalty expansions
ALTER TABLE tgs_clients
  ADD COLUMN IF NOT EXISTS points_balance integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS vip_tier text DEFAULT 'Bronze',
  ADD COLUMN IF NOT EXISTS referral_code text,
  ADD COLUMN IF NOT EXISTS referred_by text,
  ADD COLUMN IF NOT EXISTS birthday date,
  ADD COLUMN IF NOT EXISTS anniversary date;

-- 7. Create Owner Notes table
CREATE TABLE IF NOT EXISTS public.tgs_owner_notes (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL DEFAULT 'Operations',
  is_pinned boolean DEFAULT false,
  checklist_items jsonb DEFAULT '[]'::jsonb,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 8. Create Staff Attendance table
CREATE TABLE IF NOT EXISTS public.tgs_staff_attendance (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  staff_id text NOT NULL,
  staff_name text NOT NULL,
  attendance_date date NOT NULL DEFAULT CURRENT_DATE,
  clock_in timestamptz,
  clock_out timestamptz,
  status text NOT NULL DEFAULT 'Present',
  late_minutes integer DEFAULT 0,
  overtime_hours numeric DEFAULT 0.0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Unique constraint for staff attendance per day
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tgs_staff_attendance_staff_date_key'
  ) THEN
    ALTER TABLE tgs_staff_attendance ADD CONSTRAINT tgs_staff_attendance_staff_date_key UNIQUE (staff_id, attendance_date);
  END IF;
END $$;

-- 9. Add allow_staff_attendance and allow_quick_walkin to tgs_settings
ALTER TABLE tgs_settings
  ADD COLUMN IF NOT EXISTS allow_quick_walkin boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS allow_staff_attendance boolean DEFAULT true;

-- 10. Enable RLS and setup permissive policies
ALTER TABLE public.tgs_owner_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tgs_staff_attendance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public full access to tgs_owner_notes" ON public.tgs_owner_notes;
CREATE POLICY "Public full access to tgs_owner_notes" ON public.tgs_owner_notes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access to tgs_staff_attendance" ON public.tgs_staff_attendance;
CREATE POLICY "Public full access to tgs_staff_attendance" ON public.tgs_staff_attendance FOR ALL USING (true) WITH CHECK (true);

-- 11. Add realtime publication for all operational tables
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE tgs_invoices;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE tgs_invoice_items;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE tgs_expenses;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE tgs_clients;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE tgs_owner_notes;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE tgs_staff_attendance;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
