-- 1. Update tgs_staff: add cnic column if not exists
ALTER TABLE tgs_staff ADD COLUMN IF NOT EXISTS cnic text;

-- 2. Update tgs_services: make duration_minutes optional with default 0
ALTER TABLE tgs_services ALTER COLUMN duration_minutes DROP NOT NULL;
ALTER TABLE tgs_services ALTER COLUMN duration_minutes SET DEFAULT 0;

-- 3. Update tgs_clients: add loyalty fields
ALTER TABLE tgs_clients ADD COLUMN IF NOT EXISTS loyalty_visits_count integer DEFAULT 0;
ALTER TABLE tgs_clients ADD COLUMN IF NOT EXISTS loyalty_free_facials_available integer DEFAULT 0;
ALTER TABLE tgs_clients ADD COLUMN IF NOT EXISTS total_rewards_claimed integer DEFAULT 0;

-- 4. Create loyalty programs table
CREATE TABLE IF NOT EXISTS tgs_loyalty_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  reward_name text NOT NULL,
  reward_value numeric NOT NULL DEFAULT 0,
  required_visits integer NOT NULL DEFAULT 5,
  min_spend_per_visit numeric NOT NULL DEFAULT 500,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- RLS for tgs_loyalty_programs
ALTER TABLE tgs_loyalty_programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tgs_loyalty_programs_anon_sel" ON tgs_loyalty_programs FOR SELECT TO anon USING (true);
CREATE POLICY "tgs_loyalty_programs_anon_ins" ON tgs_loyalty_programs FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "tgs_loyalty_programs_anon_upd" ON tgs_loyalty_programs FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "tgs_loyalty_programs_anon_del" ON tgs_loyalty_programs FOR DELETE TO anon USING (true);

CREATE POLICY "tgs_loyalty_programs_auth_sel" ON tgs_loyalty_programs FOR SELECT TO authenticated USING (true);
CREATE POLICY "tgs_loyalty_programs_auth_ins" ON tgs_loyalty_programs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "tgs_loyalty_programs_auth_upd" ON tgs_loyalty_programs FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "tgs_loyalty_programs_auth_del" ON tgs_loyalty_programs FOR DELETE TO authenticated USING (true);

-- 5. Update settings to Pakistan Rupee
UPDATE tgs_settings 
SET currency_symbol = 'Rs.', 
    currency_code = 'PKR',
    receipt_header = 'The Grooming Studio TGS - Premium Men Salon, Pakistan',
    receipt_footer = 'Thank you for visiting TGS! For appointments call +92 300 1234567';

-- 6. Insert default loyalty programs if empty
INSERT INTO tgs_loyalty_programs (title, description, reward_name, reward_value, required_visits, min_spend_per_visit, is_active)
VALUES 
  ('5-Visit Facial Reward', 'Get a Free Facial worth Rs. 2,500 on completion of 5 visits having services over Rs. 500 each visit.', 'Free Facial', 2500, 5, 500, true),
  ('3-Visit Beard Grooming', 'Get a Free Beard Grooming worth Rs. 500 after every 3 haircut visits.', 'Free Beard Trim', 500, 3, 500, true),
  ('Milestone Spend Bonus', 'Flat Rs. 500 instant discount upon reaching Rs. 10,000 lifetime spend.', 'Spend Milestone Rs. 500', 500, 1, 0, false)
ON CONFLICT DO NOTHING;

-- 7. Replace default services with exact user requested list and prices
DELETE FROM tgs_services;
INSERT INTO tgs_services (name, category, price, is_active, duration_minutes, description) VALUES
  ('Haircut', 'Haircut & Styling', 1000, true, 0, 'Precision cut & style by master barber'),
  ('Beard', 'Beard & Shave', 500, true, 0, 'Sharp beard trimming, shaping & line up'),
  ('Face Cleansing Scrub Cleanser Face Mask', 'Facial & Skin', 1500, true, 0, 'Deep pore cleansing, exfoliating scrub & soothing mask'),
  ('Head And Shoulder Massage (Male)', 'Spa & Massage', 1000, true, 0, 'Relaxing tension release head & shoulder massage for male'),
  ('Head And Shoulder Massage (Female)', 'Spa & Massage', 1500, true, 0, 'Tension relief head & shoulder massage for female'),
  ('Foot Massage (Male)', 'Spa & Massage', 700, true, 0, 'Acupressure foot reflexology massage for male'),
  ('Foot Massage (Female)', 'Spa & Massage', 1000, true, 0, 'Acupressure foot reflexology massage for female'),
  ('Mani Pedi', 'Spa & Massage', 2500, true, 0, 'Complete luxury manicure and pedicure treatment'),
  ('Hair Dye', 'Hair Treatment', 2000, true, 0, 'Full hair organic black/natural color dye'),
  ('Beard Dye', 'Hair Treatment', 1000, true, 0, 'Beard coloring & grey coverage'),
  ('Whitening Facial', 'Facial & Skin', 5000, true, 0, 'Premium skin lightening, deep glow and rejuvenating facial'),
  ('Personalized Facial', 'Facial & Skin', 4000, true, 0, 'Customized facial according to skin type & condition'),
  ('Hair Treatment', 'Hair Treatment', 3000, true, 0, 'Keratin & protein nourishing deep hair therapy'),
  ('Hair Styling', 'Haircut & Styling', 500, true, 0, 'Wash, blowdry and premium pomade styling'),
  ('Face Wax', 'Facial & Skin', 1500, true, 0, 'Full face gentle waxing and soothing lotion'),
  ('Cheek Wax', 'Facial & Skin', 300, true, 0, 'Cheek line clean waxing'),
  ('Nose Wax', 'Facial & Skin', 200, true, 0, 'Nostril hair waxing'),
  ('Ear Wax', 'Facial & Skin', 300, true, 0, 'Outer ear hair waxing'),
  ('Face Threading', 'Facial & Skin', 500, true, 0, 'Clean face threading and eyebrow shaping'),
  ('Cheek Threading', 'Facial & Skin', 200, true, 0, 'Cheek contour threading');

-- 8. Update initial staff with Pakistani CNIC numbers
UPDATE tgs_staff SET cnic = '42101-3849201-3' WHERE phone = '+92 300 1234567';
UPDATE tgs_staff SET cnic = '42201-9482710-5' WHERE phone = '+92 301 2345678';
UPDATE tgs_staff SET cnic = '42301-1928374-7' WHERE phone = '+92 302 3456789';
UPDATE tgs_staff SET cnic = '42401-5647382-9' WHERE phone = '+92 303 4567890';
