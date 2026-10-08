ALTER TABLE tgs_staff
  ADD COLUMN IF NOT EXISTS pay_type text DEFAULT 'commission_only',
  ADD COLUMN IF NOT EXISTS partnership_percentage numeric DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS station_fee numeric DEFAULT 0.0;

ALTER TABLE tgs_clients
  ADD COLUMN IF NOT EXISTS wallet_balance numeric DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS punch_card_stamps integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS vip_station_pass_active boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS duo_referrals_count integer DEFAULT 0;
