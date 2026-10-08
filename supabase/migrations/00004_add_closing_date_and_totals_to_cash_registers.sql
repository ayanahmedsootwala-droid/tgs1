ALTER TABLE tgs_cash_registers 
  ADD COLUMN IF NOT EXISTS closing_date date,
  ADD COLUMN IF NOT EXISTS total_cash_sales numeric DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS total_card_sales numeric DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS total_online_sales numeric DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS total_cash_expenses numeric DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS expected_cash_in_drawer numeric DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS actual_cash_counted numeric DEFAULT 0.0;

-- Backfill closing_date from register_date if any rows exist
UPDATE tgs_cash_registers 
SET closing_date = register_date 
WHERE closing_date IS NULL AND register_date IS NOT NULL;

-- Backfill other columns
UPDATE tgs_cash_registers 
SET 
  total_cash_sales = COALESCE(total_cash_sales, cash_sales, 0.0),
  total_card_sales = COALESCE(total_card_sales, card_sales, 0.0),
  total_online_sales = COALESCE(total_online_sales, online_sales, 0.0),
  total_cash_expenses = COALESCE(total_cash_expenses, cash_expenses, 0.0),
  expected_cash_in_drawer = COALESCE(expected_cash_in_drawer, expected_cash, 0.0),
  actual_cash_counted = COALESCE(actual_cash_counted, actual_cash, 0.0);

-- Create a unique constraint on closing_date for upsert support
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tgs_cash_registers_closing_date_key'
  ) THEN
    ALTER TABLE tgs_cash_registers ADD CONSTRAINT tgs_cash_registers_closing_date_key UNIQUE (closing_date);
  END IF;
END $$;
