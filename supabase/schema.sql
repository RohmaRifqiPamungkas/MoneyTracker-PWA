-- ============================================================
-- MoneyTracker — Supabase Schema
-- Jalankan file ini di: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ── Bank Accounts ─────────────────────────────────────────────────────────
create table if not exists public.bank_accounts (
  id             text        primary key,
  name           text        not null,
  bank_name      text        not null,
  type           text        not null check (type in ('bank', 'ewallet', 'cash')),
  account_number text,
  balance        numeric     not null default 0,
  color          text        not null default '#10b981',
  logo           text        not null default '💳',
  gradient       text[]      not null default array['#10b981', '#059669'],
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ── Transactions ──────────────────────────────────────────────────────────
create table if not exists public.transactions (
  id              text        primary key,
  name            text        not null,
  amount          numeric     not null check (amount > 0),
  type            text        not null check (type in ('income', 'expense')),
  category        text        not null,
  date            date        not null,
  notes           text,
  bank_account_id text        not null references public.bank_accounts(id) on delete cascade,
  created_at      timestamptz not null default now()
);

-- ── Budget Items ──────────────────────────────────────────────────────────
create table if not exists public.budget_items (
  id         text        primary key default gen_random_uuid()::text,
  category   text        not null unique,
  label      text        not null,
  spent      numeric     not null default 0,
  "limit"    numeric     not null,
  color      text        not null default '#10b981',
  created_at timestamptz not null default now()
);

-- ── Savings Goals ─────────────────────────────────────────────────────────
create table if not exists public.savings_goals (
  id             text        primary key,
  name           text        not null,
  target_amount  numeric     not null check (target_amount > 0),
  current_amount numeric     not null default 0,
  target_date    date        not null,
  emoji          text        not null default '🎯',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ── Upcoming Bills ────────────────────────────────────────────────────────
create table if not exists public.upcoming_bills (
  id         text        primary key,
  name       text        not null,
  amount     numeric     not null check (amount > 0),
  due_date   date        not null,
  category   text        not null,
  emoji      text        not null default '📄',
  created_at timestamptz not null default now()
);

-- ── Indexes (untuk performa query) ────────────────────────────────────────
create index if not exists idx_transactions_date           on public.transactions(date desc);
create index if not exists idx_transactions_type           on public.transactions(type);
create index if not exists idx_transactions_bank_account   on public.transactions(bank_account_id);
create index if not exists idx_upcoming_bills_due_date     on public.upcoming_bills(due_date asc);
create index if not exists idx_savings_goals_target_date   on public.savings_goals(target_date asc);

-- ── Row Level Security ────────────────────────────────────────────────────
-- Karena kita belum pakai Auth, kita buat policy open dulu (anon bisa baca/tulis).
-- CATATAN: Ganti policy ini dengan user-scoped policy setelah Auth diaktifkan.

alter table public.bank_accounts  enable row level security;
alter table public.transactions    enable row level security;
alter table public.budget_items    enable row level security;
alter table public.savings_goals   enable row level security;
alter table public.upcoming_bills  enable row level security;

-- Policy: izinkan semua operasi untuk anon key (single-user mode)
drop policy if exists "allow_all_bank_accounts" on public.bank_accounts;
create policy "allow_all_bank_accounts"  on public.bank_accounts  for all using (true) with check (true);

drop policy if exists "allow_all_transactions" on public.transactions;
create policy "allow_all_transactions"   on public.transactions    for all using (true) with check (true);

drop policy if exists "allow_all_budget_items" on public.budget_items;
create policy "allow_all_budget_items"   on public.budget_items    for all using (true) with check (true);

drop policy if exists "allow_all_savings_goals" on public.savings_goals;
create policy "allow_all_savings_goals"  on public.savings_goals   for all using (true) with check (true);

drop policy if exists "allow_all_upcoming_bills" on public.upcoming_bills;
create policy "allow_all_upcoming_bills" on public.upcoming_bills  for all using (true) with check (true);
