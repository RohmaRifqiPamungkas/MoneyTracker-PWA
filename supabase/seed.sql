-- ============================================================
-- MoneyTracker — Seed Data
-- Jalankan file ini di: Supabase Dashboard → SQL Editor → New Query
-- PENTING: Jalankan schema.sql terlebih dahulu sebelum file ini!
-- ============================================================

-- ── Bank Accounts ─────────────────────────────────────────────────────────
insert into public.bank_accounts (id, name, bank_name, type, account_number, balance, color, logo, gradient)
values
  ('bca-1',     'BCA Xpresi',       'Bank Central Asia',  'bank',    '5628', 28750000, '#0066B3', '/logos/BCA.png',     array['#0066B3', '#004A82']),
  ('mandiri-1', 'Mandiri Everyday', 'Bank Mandiri',       'bank',    '9142', 12500000, '#1E3A5F', '/logos/Mandiri.png', array['#1E3A5F', '#D4A017']),
  ('gopay-1',   'GoPay',            'GoPay by GoTo',      'ewallet', null,   1250000,  '#00AA13', '/logos/Gopay.png',   array['#00AA13', '#007D0E']),
  ('ovo-1',     'OVO',              'OVO',                'ewallet', null,   850000,   '#4B1C8D', '/logos/Ovo.png',     array['#4B1C8D', '#320D60']),
  ('dana-1',    'DANA',             'DANA Indonesia',     'ewallet', null,   500000,   '#108EE9', '/logos/Dana.png',    array['#108EE9', '#0E7AC9']),
  ('cash-1',    'Uang Tunai',       'Tunai',              'cash',    null,   2000000,  '#10b981', '💵',                array['#10b981', '#059669'])
on conflict (id) do nothing;

-- ── Transactions ──────────────────────────────────────────────────────────
insert into public.transactions (id, name, amount, type, category, date, notes, bank_account_id)
values
  ('1',  'Gaji Bulanan',          15000000, 'income',  'salary',        '2026-06-20', 'Gaji bulan Juni', 'bca-1'),
  ('2',  'Freelance Design',      3500000,  'income',  'freelance',     '2026-06-18', null,              'bca-1'),
  ('3',  'Groceries Superindo',   450000,   'expense', 'food',          '2026-06-18', null,              'gopay-1'),
  ('4',  'Tokopedia - Baju',      320000,   'expense', 'shopping',      '2026-06-17', null,              'gopay-1'),
  ('5',  'Grab - Ojek Online',    45000,    'expense', 'transport',     '2026-06-17', null,              'ovo-1'),
  ('6',  'Netflix',               54000,    'expense', 'entertainment', '2026-06-16', null,              'bca-1'),
  ('7',  'Apotik Kimia Farma',    125000,   'expense', 'health',        '2026-06-15', null,              'dana-1'),
  ('8',  'PLN Token Listrik',     250000,   'expense', 'bills',         '2026-06-15', null,              'gopay-1'),
  ('9',  'Makan Siang – Warteg',  25000,    'expense', 'food',          '2026-06-14', null,              'cash-1'),
  ('10', 'Dividen Saham',         750000,   'income',  'investment',    '2026-06-13', null,              'mandiri-1'),
  ('11', 'Indomaret',             87500,    'expense', 'food',          '2026-06-13', null,              'ovo-1'),
  ('12', 'Top Up GoPay',          500000,   'income',  'other',         '2026-06-12', null,              'bca-1')
on conflict (id) do nothing;

-- ── Budget Items ──────────────────────────────────────────────────────────
insert into public.budget_items (category, label, spent, "limit", color)
values
  ('food',          'Makanan',      2500000, 3000000, '#10b981'),
  ('transport',     'Transportasi', 800000,  1500000, '#6366f1'),
  ('shopping',      'Belanja',      1200000, 2000000, '#f59e0b'),
  ('bills',         'Tagihan',      1500000, 1500000, '#3b82f6'),
  ('entertainment', 'Hiburan',      900000,  1000000, '#ec4899'),
  ('health',        'Kesehatan',    300000,  1000000, '#14b8a6')
on conflict (category) do nothing;

-- ── Savings Goals ─────────────────────────────────────────────────────────
insert into public.savings_goals (id, name, target_amount, current_amount, target_date, emoji)
values
  ('1', 'MacBook Pro M4',       35000000, 18500000, '2026-12-31', '💻'),
  ('2', 'Dana Darurat',         50000000, 38750000, '2026-09-30', '🛡️'),
  ('3', 'Liburan Bali',         8000000,  4200000,  '2026-08-15', '🏖️'),
  ('4', 'Investasi Reksa Dana', 20000000, 12000000, '2026-12-01', '📈')
on conflict (id) do nothing;

-- ── Upcoming Bills ────────────────────────────────────────────────────────
insert into public.upcoming_bills (id, name, amount, due_date, category, emoji)
values
  ('1', 'Indihome Internet', 350000, '2026-06-25', 'bills',         '🌐'),
  ('2', 'Netflix Premium',   54000,  '2026-06-28', 'entertainment', '🎬'),
  ('3', 'PLN Listrik',       450000, '2026-07-01', 'bills',         '⚡'),
  ('4', 'Kartu Telkomsel',   100000, '2026-07-05', 'bills',         '📱'),
  ('5', 'Spotify Premium',   54990,  '2026-07-08', 'entertainment', '🎵'),
  ('6', 'BPJS Kesehatan',    150000, '2026-07-10', 'health',        '🏥')
on conflict (id) do nothing;