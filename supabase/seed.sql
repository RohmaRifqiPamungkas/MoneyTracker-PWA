-- ============================================================
-- MoneyTracker - Seed Data untuk 1 user Supabase Auth
-- Jalankan schema.sql terlebih dahulu.
--
-- Ganti nilai seed_user_id di bawah dengan UUID user dari:
-- Supabase Dashboard -> Authentication -> Users.
-- ============================================================

do $$
declare
  seed_user_id uuid := '00000000-0000-0000-0000-000000000000';
begin
  if seed_user_id = '00000000-0000-0000-0000-000000000000' then
    raise exception 'Ganti seed_user_id dengan UUID user Supabase Auth terlebih dahulu.';
  end if;

  insert into public.bank_accounts (id, user_id, name, bank_name, type, account_number, balance, color, logo, gradient)
  values
    (seed_user_id::text || '-bca-1',     seed_user_id, 'BCA Xpresi',       'Bank Central Asia',  'bank',    '5628', 28750000, '#0066B3', '/logos/BCA.png',     array['#0066B3', '#004A82']),
    (seed_user_id::text || '-mandiri-1', seed_user_id, 'Mandiri Everyday', 'Bank Mandiri',       'bank',    '9142', 12500000, '#1E3A5F', '/logos/Mandiri.png', array['#1E3A5F', '#D4A017']),
    (seed_user_id::text || '-gopay-1',   seed_user_id, 'GoPay',            'GoPay by GoTo',      'ewallet', null,   1250000,  '#00AA13', '/logos/Gopay.png',   array['#00AA13', '#007D0E']),
    (seed_user_id::text || '-ovo-1',     seed_user_id, 'OVO',              'OVO',                'ewallet', null,   850000,   '#4B1C8D', '/logos/Ovo.png',     array['#4B1C8D', '#320D60']),
    (seed_user_id::text || '-dana-1',    seed_user_id, 'DANA',             'DANA Indonesia',     'ewallet', null,   500000,   '#108EE9', '/logos/Dana.png',    array['#108EE9', '#0E7AC9']),
    (seed_user_id::text || '-cash-1',    seed_user_id, 'Uang Tunai',       'Tunai',              'cash',    null,   2000000,  '#10b981', '💵',                array['#10b981', '#059669'])
  on conflict (id) do nothing;

  insert into public.categories (id, user_id, slug, name, type, emoji, color, is_system)
  values
    (seed_user_id::text || '-cat-salary',        seed_user_id, 'salary',        'Gaji',         'income',  '💰', '#10b981', true),
    (seed_user_id::text || '-cat-freelance',     seed_user_id, 'freelance',     'Freelance',    'income',  '💼', '#8b5cf6', true),
    (seed_user_id::text || '-cat-investment',    seed_user_id, 'investment',    'Investasi',    'income',  '📈', '#06b6d4', true),
    (seed_user_id::text || '-cat-income-other',  seed_user_id, 'other',         'Lainnya',      'income',  '📦', '#94a3b8', true),
    (seed_user_id::text || '-cat-food',          seed_user_id, 'food',          'Makanan',      'expense', '🍔', '#10b981', true),
    (seed_user_id::text || '-cat-transport',     seed_user_id, 'transport',     'Transportasi', 'expense', '🚗', '#6366f1', true),
    (seed_user_id::text || '-cat-shopping',      seed_user_id, 'shopping',      'Belanja',      'expense', '🛍️', '#f59e0b', true),
    (seed_user_id::text || '-cat-bills',         seed_user_id, 'bills',         'Tagihan',      'expense', '📄', '#3b82f6', true),
    (seed_user_id::text || '-cat-entertainment', seed_user_id, 'entertainment', 'Hiburan',      'expense', '🎮', '#ec4899', true),
    (seed_user_id::text || '-cat-health',        seed_user_id, 'health',        'Kesehatan',    'expense', '💊', '#14b8a6', true),
    (seed_user_id::text || '-cat-expense-other', seed_user_id, 'other',         'Lainnya',      'expense', '📦', '#94a3b8', true)
  on conflict (user_id, type, slug) do nothing;

  insert into public.transactions (id, user_id, name, amount, type, category, date, notes, bank_account_id)
  values
    (seed_user_id::text || '-tx-1',  seed_user_id, 'Gaji Bulanan',          15000000, 'income',  'salary',        '2026-06-20', 'Gaji bulan Juni', seed_user_id::text || '-bca-1'),
    (seed_user_id::text || '-tx-2',  seed_user_id, 'Freelance Design',      3500000,  'income',  'freelance',     '2026-06-18', null,              seed_user_id::text || '-bca-1'),
    (seed_user_id::text || '-tx-3',  seed_user_id, 'Groceries Superindo',   450000,   'expense', 'food',          '2026-06-18', null,              seed_user_id::text || '-gopay-1'),
    (seed_user_id::text || '-tx-4',  seed_user_id, 'Tokopedia - Baju',      320000,   'expense', 'shopping',      '2026-06-17', null,              seed_user_id::text || '-gopay-1'),
    (seed_user_id::text || '-tx-5',  seed_user_id, 'Grab - Ojek Online',    45000,    'expense', 'transport',     '2026-06-17', null,              seed_user_id::text || '-ovo-1'),
    (seed_user_id::text || '-tx-6',  seed_user_id, 'Netflix',               54000,    'expense', 'entertainment', '2026-06-16', null,              seed_user_id::text || '-bca-1'),
    (seed_user_id::text || '-tx-7',  seed_user_id, 'Apotik Kimia Farma',    125000,   'expense', 'health',        '2026-06-15', null,              seed_user_id::text || '-dana-1'),
    (seed_user_id::text || '-tx-8',  seed_user_id, 'PLN Token Listrik',     250000,   'expense', 'bills',         '2026-06-15', null,              seed_user_id::text || '-gopay-1'),
    (seed_user_id::text || '-tx-9',  seed_user_id, 'Makan Siang - Warteg',  25000,    'expense', 'food',          '2026-06-14', null,              seed_user_id::text || '-cash-1'),
    (seed_user_id::text || '-tx-10', seed_user_id, 'Dividen Saham',         750000,   'income',  'investment',    '2026-06-13', null,              seed_user_id::text || '-mandiri-1'),
    (seed_user_id::text || '-tx-11', seed_user_id, 'Indomaret',             87500,    'expense', 'food',          '2026-06-13', null,              seed_user_id::text || '-ovo-1'),
    (seed_user_id::text || '-tx-12', seed_user_id, 'Top Up GoPay',          500000,   'income',  'other',         '2026-06-12', null,              seed_user_id::text || '-bca-1')
  on conflict (id) do nothing;

  insert into public.budget_items (id, user_id, category, label, spent, "limit", color)
  values
    (seed_user_id::text || '-budget-food',          seed_user_id, 'food',          'Makanan',      2500000, 3000000, '#10b981'),
    (seed_user_id::text || '-budget-transport',     seed_user_id, 'transport',     'Transportasi', 800000,  1500000, '#6366f1'),
    (seed_user_id::text || '-budget-shopping',      seed_user_id, 'shopping',      'Belanja',      1200000, 2000000, '#f59e0b'),
    (seed_user_id::text || '-budget-bills',         seed_user_id, 'bills',         'Tagihan',      1500000, 1500000, '#3b82f6'),
    (seed_user_id::text || '-budget-entertainment', seed_user_id, 'entertainment', 'Hiburan',      900000,  1000000, '#ec4899'),
    (seed_user_id::text || '-budget-health',        seed_user_id, 'health',        'Kesehatan',    300000,  1000000, '#14b8a6')
  on conflict (user_id, category) do nothing;

  insert into public.savings_goals (id, user_id, name, target_amount, current_amount, target_date, emoji)
  values
    (seed_user_id::text || '-goal-1', seed_user_id, 'MacBook Pro M4',       35000000, 18500000, '2026-12-31', '💻'),
    (seed_user_id::text || '-goal-2', seed_user_id, 'Dana Darurat',         50000000, 38750000, '2026-09-30', '🛡️'),
    (seed_user_id::text || '-goal-3', seed_user_id, 'Liburan Bali',         8000000,  4200000,  '2026-08-15', '🏖️'),
    (seed_user_id::text || '-goal-4', seed_user_id, 'Investasi Reksa Dana', 20000000, 12000000, '2026-12-01', '📈')
  on conflict (id) do nothing;

  insert into public.upcoming_bills (id, user_id, name, amount, due_date, category, emoji)
  values
    (seed_user_id::text || '-bill-1', seed_user_id, 'Indihome Internet', 350000, '2026-06-25', 'bills',         '🌐'),
    (seed_user_id::text || '-bill-2', seed_user_id, 'Netflix Premium',   54000,  '2026-06-28', 'entertainment', '🎬'),
    (seed_user_id::text || '-bill-3', seed_user_id, 'PLN Listrik',       450000, '2026-07-01', 'bills',         '⚡'),
    (seed_user_id::text || '-bill-4', seed_user_id, 'Kartu Telkomsel',   100000, '2026-07-05', 'bills',         '📱'),
    (seed_user_id::text || '-bill-5', seed_user_id, 'Spotify Premium',   54990,  '2026-07-08', 'entertainment', '🎵'),
    (seed_user_id::text || '-bill-6', seed_user_id, 'BPJS Kesehatan',    150000, '2026-07-10', 'health',        '🏥')
  on conflict (id) do nothing;
end $$;
