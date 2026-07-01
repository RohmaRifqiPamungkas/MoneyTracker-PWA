-- ============================================================
-- MoneyTracker - Supabase Schema + Auth/RLS
-- Jalankan file ini di: Supabase Dashboard -> SQL Editor -> New Query
-- ============================================================

create extension if not exists "pgcrypto";

-- ── Profiles ─────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text,
  email      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Bank Accounts ────────────────────────────────────────────────────────
create table if not exists public.bank_accounts (
  id             text        primary key,
  user_id        uuid        not null references auth.users(id) on delete cascade,
  name           text        not null,
  bank_name      text        not null,
  type           text        not null check (type in ('bank', 'ewallet', 'cash')),
  account_number text,
  balance        numeric     not null default 0,
  color          text        not null default '#10b981',
  logo           text        not null default '💳',
  gradient       text[]      not null default array['#10b981', '#059669'],
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint bank_accounts_id_user_unique unique (id, user_id)
);

-- ── Transactions ─────────────────────────────────────────────────────────
create table if not exists public.transactions (
  id              text        primary key,
  user_id         uuid        not null references auth.users(id) on delete cascade,
  name            text        not null,
  amount          numeric     not null check (amount > 0),
  type            text        not null check (type in ('income', 'expense')),
  category        text        not null,
  date            date        not null,
  notes           text,
  bank_account_id text        not null,
  created_at      timestamptz not null default now(),
  constraint transactions_bank_account_user_fk
    foreign key (bank_account_id, user_id)
    references public.bank_accounts(id, user_id)
    on delete cascade
);

-- ── Budget Items ─────────────────────────────────────────────────────────
create table if not exists public.budget_items (
  id         text        primary key default gen_random_uuid()::text,
  user_id    uuid        not null references auth.users(id) on delete cascade,
  category   text        not null,
  label      text        not null,
  spent      numeric     not null default 0,
  "limit"    numeric     not null,
  color      text        not null default '#10b981',
  created_at timestamptz not null default now(),
  constraint budget_items_user_category_unique unique (user_id, category)
);

-- ── Savings Goals ────────────────────────────────────────────────────────
create table if not exists public.savings_goals (
  id             text        primary key,
  user_id        uuid        not null references auth.users(id) on delete cascade,
  name           text        not null,
  target_amount  numeric     not null check (target_amount > 0),
  current_amount numeric     not null default 0,
  target_date    date        not null,
  emoji          text        not null default '🎯',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ── Upcoming Bills ───────────────────────────────────────────────────────
create table if not exists public.upcoming_bills (
  id         text        primary key,
  user_id    uuid        not null references auth.users(id) on delete cascade,
  name       text        not null,
  amount     numeric     not null check (amount > 0),
  due_date   date        not null,
  category   text        not null,
  emoji      text        not null default '📄',
  created_at timestamptz not null default now()
);

-- Existing-database migration helpers. These are no-ops on a fresh database.
alter table public.bank_accounts add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.transactions add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.budget_items add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.savings_goals add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.upcoming_bills add column if not exists user_id uuid references auth.users(id) on delete cascade;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'bank_accounts_id_user_unique'
  ) then
    alter table public.bank_accounts
      add constraint bank_accounts_id_user_unique unique (id, user_id);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'transactions_bank_account_user_fk'
  ) then
    alter table public.transactions
      add constraint transactions_bank_account_user_fk
      foreign key (bank_account_id, user_id)
      references public.bank_accounts(id, user_id)
      on delete cascade;
  end if;
end $$;

alter table public.budget_items drop constraint if exists budget_items_category_key;
create unique index if not exists budget_items_user_category_idx
  on public.budget_items(user_id, category);

-- ── Indexes ──────────────────────────────────────────────────────────────
create index if not exists idx_bank_accounts_user        on public.bank_accounts(user_id);
create index if not exists idx_transactions_user_date    on public.transactions(user_id, date desc);
create index if not exists idx_transactions_user_type    on public.transactions(user_id, type);
create index if not exists idx_transactions_bank_account on public.transactions(bank_account_id);
create index if not exists idx_budget_items_user         on public.budget_items(user_id);
create index if not exists idx_savings_goals_user_date   on public.savings_goals(user_id, target_date asc);
create index if not exists idx_upcoming_bills_user_due   on public.upcoming_bills(user_id, due_date asc);

-- ── Updated-at Trigger ───────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists bank_accounts_set_updated_at on public.bank_accounts;
create trigger bank_accounts_set_updated_at
before update on public.bank_accounts
for each row execute function public.set_updated_at();

drop trigger if exists savings_goals_set_updated_at on public.savings_goals;
create trigger savings_goals_set_updated_at
before update on public.savings_goals
for each row execute function public.set_updated_at();

-- ── Starter Data For New Users ───────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do nothing;

  insert into public.bank_accounts (id, user_id, name, bank_name, type, account_number, balance, color, logo, gradient)
  values
    (new.id::text || '-bca-1',     new.id, 'BCA Xpresi',       'Bank Central Asia', 'bank',    '5628', 0, '#0066B3', '/logos/BCA.png',     array['#0066B3', '#004A82']),
    (new.id::text || '-mandiri-1', new.id, 'Mandiri Everyday', 'Bank Mandiri',      'bank',    '9142', 0, '#1E3A5F', '/logos/Mandiri.png', array['#1E3A5F', '#D4A017']),
    (new.id::text || '-gopay-1',   new.id, 'GoPay',            'GoPay by GoTo',     'ewallet', null,   0, '#00AA13', '/logos/Gopay.png',   array['#00AA13', '#007D0E']),
    (new.id::text || '-cash-1',    new.id, 'Uang Tunai',       'Tunai',             'cash',    null,   0, '#10b981', '💵',                array['#10b981', '#059669'])
  on conflict (id) do nothing;

  insert into public.budget_items (id, user_id, category, label, spent, "limit", color)
  values
    (gen_random_uuid()::text, new.id, 'food',          'Makanan',      0, 3000000, '#10b981'),
    (gen_random_uuid()::text, new.id, 'transport',     'Transportasi', 0, 1500000, '#6366f1'),
    (gen_random_uuid()::text, new.id, 'shopping',      'Belanja',      0, 2000000, '#f59e0b'),
    (gen_random_uuid()::text, new.id, 'bills',         'Tagihan',      0, 1500000, '#3b82f6'),
    (gen_random_uuid()::text, new.id, 'entertainment', 'Hiburan',      0, 1000000, '#ec4899'),
    (gen_random_uuid()::text, new.id, 'health',        'Kesehatan',    0, 1000000, '#14b8a6')
  on conflict (user_id, category) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ── Row Level Security ───────────────────────────────────────────────────
alter table public.profiles       enable row level security;
alter table public.bank_accounts  enable row level security;
alter table public.transactions   enable row level security;
alter table public.budget_items   enable row level security;
alter table public.savings_goals  enable row level security;
alter table public.upcoming_bills enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "bank_accounts_own_all" on public.bank_accounts;
create policy "bank_accounts_own_all" on public.bank_accounts
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "transactions_own_all" on public.transactions;
create policy "transactions_own_all" on public.transactions
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "budget_items_own_all" on public.budget_items;
create policy "budget_items_own_all" on public.budget_items
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "savings_goals_own_all" on public.savings_goals;
create policy "savings_goals_own_all" on public.savings_goals
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "upcoming_bills_own_all" on public.upcoming_bills;
create policy "upcoming_bills_own_all" on public.upcoming_bills
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Remove old open policies if this project previously used single-user mode.
drop policy if exists "allow_all_bank_accounts" on public.bank_accounts;
drop policy if exists "allow_all_transactions" on public.transactions;
drop policy if exists "allow_all_budget_items" on public.budget_items;
drop policy if exists "allow_all_savings_goals" on public.savings_goals;
drop policy if exists "allow_all_upcoming_bills" on public.upcoming_bills;
