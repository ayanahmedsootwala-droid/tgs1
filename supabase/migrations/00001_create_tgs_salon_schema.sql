-- Table: tgs_settings
CREATE TABLE IF NOT EXISTS tgs_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_name text NOT NULL DEFAULT 'The Grooming Studio TGS',
  tagline text DEFAULT 'Exclusive Men''s Salon & Grooming Lounge',
  phone text DEFAULT '+1 (555) 349-8800',
  email text DEFAULT 'contact@thegroomingstudio.com',
  address text DEFAULT '742 Luxury Boulevard, Suite 100',
  currency_symbol text DEFAULT '$',
  currency_code text DEFAULT 'USD',
  tax_rate numeric NOT NULL DEFAULT 8.0,
  receipt_header text DEFAULT 'The Grooming Studio TGS • Master Barbers & Lounge',
  receipt_footer text DEFAULT 'Thank you for your visit! Follow us @thegroomingstudiotgs',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table: tgs_staff
CREATE TABLE IF NOT EXISTS tgs_staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  role text NOT NULL DEFAULT 'barber',
  commission_rate numeric NOT NULL DEFAULT 20.0,
  base_salary numeric NOT NULL DEFAULT 2200.0,
  specialization text DEFAULT 'Master Barber',
  is_active boolean NOT NULL DEFAULT true,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

-- Table: tgs_services
CREATE TABLE IF NOT EXISTS tgs_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  price numeric NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 30,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Table: tgs_clients
CREATE TABLE IF NOT EXISTS tgs_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  notes text,
  preferred_staff_id uuid REFERENCES tgs_staff(id) ON DELETE SET NULL,
  vip_level text NOT NULL DEFAULT 'Standard',
  total_visits integer NOT NULL DEFAULT 0,
  total_spent numeric NOT NULL DEFAULT 0.0,
  last_visit_date timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Table: tgs_invoices
CREATE TABLE IF NOT EXISTS tgs_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text NOT NULL UNIQUE,
  client_id uuid REFERENCES tgs_clients(id) ON DELETE SET NULL,
  client_name text NOT NULL,
  client_phone text NOT NULL,
  client_email text,
  subtotal numeric NOT NULL DEFAULT 0.0,
  discount_type text NOT NULL DEFAULT 'none',
  discount_value numeric NOT NULL DEFAULT 0.0,
  discount_amount numeric NOT NULL DEFAULT 0.0,
  tax_rate numeric NOT NULL DEFAULT 0.0,
  tax_amount numeric NOT NULL DEFAULT 0.0,
  tip_amount numeric NOT NULL DEFAULT 0.0,
  total_amount numeric NOT NULL DEFAULT 0.0,
  payment_method text NOT NULL DEFAULT 'Cash',
  split_details jsonb,
  status text NOT NULL DEFAULT 'Completed',
  notes text,
  created_by_role text DEFAULT 'manager',
  created_at timestamptz DEFAULT now()
);

-- Table: tgs_invoice_items
CREATE TABLE IF NOT EXISTS tgs_invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES tgs_invoices(id) ON DELETE CASCADE,
  service_id uuid REFERENCES tgs_services(id) ON DELETE SET NULL,
  service_name text NOT NULL,
  category text NOT NULL,
  price numeric NOT NULL,
  staff_id uuid REFERENCES tgs_staff(id) ON DELETE SET NULL,
  staff_name text NOT NULL,
  commission_rate numeric NOT NULL DEFAULT 0.0,
  commission_amount numeric NOT NULL DEFAULT 0.0,
  created_at timestamptz DEFAULT now()
);

-- Table: tgs_expenses
CREATE TABLE IF NOT EXISTS tgs_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL,
  amount numeric NOT NULL,
  payment_mode text NOT NULL DEFAULT 'Cash',
  expense_date date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  receipt_ref text,
  logged_by text DEFAULT 'Manager',
  created_at timestamptz DEFAULT now()
);

-- Table: tgs_cash_registers
CREATE TABLE IF NOT EXISTS tgs_cash_registers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  register_date date NOT NULL DEFAULT CURRENT_DATE,
  opening_cash numeric NOT NULL DEFAULT 200.0,
  cash_sales numeric NOT NULL DEFAULT 0.0,
  card_sales numeric NOT NULL DEFAULT 0.0,
  online_sales numeric NOT NULL DEFAULT 0.0,
  total_sales numeric NOT NULL DEFAULT 0.0,
  cash_expenses numeric NOT NULL DEFAULT 0.0,
  expected_cash numeric NOT NULL DEFAULT 200.0,
  actual_cash numeric NOT NULL DEFAULT 200.0,
  variance numeric NOT NULL DEFAULT 0.0,
  status text NOT NULL DEFAULT 'Closed',
  closed_by text NOT NULL DEFAULT 'Manager',
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Table: tgs_appointments
CREATE TABLE IF NOT EXISTS tgs_appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES tgs_clients(id) ON DELETE SET NULL,
  client_name text NOT NULL,
  client_phone text NOT NULL,
  staff_id uuid REFERENCES tgs_staff(id) ON DELETE SET NULL,
  staff_name text NOT NULL,
  service_id uuid REFERENCES tgs_services(id) ON DELETE SET NULL,
  service_name text NOT NULL,
  appointment_date date NOT NULL DEFAULT CURRENT_DATE,
  start_time text NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 30,
  status text NOT NULL DEFAULT 'Confirmed',
  chair_number integer DEFAULT 1,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE tgs_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tgs_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE tgs_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE tgs_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE tgs_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE tgs_invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tgs_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE tgs_cash_registers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tgs_appointments ENABLE ROW LEVEL SECURITY;

-- Setup full policies for anon & authenticated
DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY['tgs_settings', 'tgs_staff', 'tgs_services', 'tgs_clients', 'tgs_invoices', 'tgs_invoice_items', 'tgs_expenses', 'tgs_cash_registers', 'tgs_appointments'])
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I_anon_sel ON %I;', tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS %I_anon_ins ON %I;', tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS %I_anon_upd ON %I;', tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS %I_anon_del ON %I;', tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS %I_auth_sel ON %I;', tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS %I_auth_ins ON %I;', tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS %I_auth_upd ON %I;', tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS %I_auth_del ON %I;', tbl, tbl);

    EXECUTE format('CREATE POLICY %I_anon_sel ON %I FOR SELECT TO anon USING (true);', tbl, tbl);
    EXECUTE format('CREATE POLICY %I_anon_ins ON %I FOR INSERT TO anon WITH CHECK (true);', tbl, tbl);
    EXECUTE format('CREATE POLICY %I_anon_upd ON %I FOR UPDATE TO anon USING (true) WITH CHECK (true);', tbl, tbl);
    EXECUTE format('CREATE POLICY %I_anon_del ON %I FOR DELETE TO anon USING (true);', tbl, tbl);

    EXECUTE format('CREATE POLICY %I_auth_sel ON %I FOR SELECT TO authenticated USING (true);', tbl, tbl);
    EXECUTE format('CREATE POLICY %I_auth_ins ON %I FOR INSERT TO authenticated WITH CHECK (true);', tbl, tbl);
    EXECUTE format('CREATE POLICY %I_auth_upd ON %I FOR UPDATE TO authenticated USING (true) WITH CHECK (true);', tbl, tbl);
    EXECUTE format('CREATE POLICY %I_auth_del ON %I FOR DELETE TO authenticated USING (true);', tbl, tbl);
  END LOOP;
END $$;
