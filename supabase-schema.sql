-- Clients table
create table clients (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  email text,
  phone text,
  type text check (type in ('personal', 'estate', 'corporate')) default 'personal',
  status text check (status in ('not_started', 'waiting_documents', 'in_progress', 'ready_review', 'complete', 'picked_up')) default 'not_started',
  doc_status text check (doc_status in ('missing', 'partial', 'complete')) default 'missing',
  missing_docs text[] default '{}',
  received_docs text[] default '{}',
  last_contact date,
  notes text,
  bank_info jsonb,
  ssn_last4 text,
  filing_status text,
  address text,
  ein text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Communications table
create table communications (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references clients(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  date date default current_date,
  type text check (type in ('email', 'phone', 'sms', 'portal')) default 'email',
  direction text check (direction in ('inbound', 'outbound')) default 'outbound',
  message text,
  status text default 'delivered',
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table clients enable row level security;
alter table communications enable row level security;

-- Clients: users can only see/modify their own clients
create policy "Users can view own clients" on clients for select using (auth.uid() = user_id);
create policy "Users can insert own clients" on clients for insert with check (auth.uid() = user_id);
create policy "Users can update own clients" on clients for update using (auth.uid() = user_id);
create policy "Users can delete own clients" on clients for delete using (auth.uid() = user_id);

-- Communications: users can only see/modify their own communications
create policy "Users can view own communications" on communications for select using (auth.uid() = user_id);
create policy "Users can insert own communications" on communications for insert with check (auth.uid() = user_id);
create policy "Users can update own communications" on communications for update using (auth.uid() = user_id);
create policy "Users can delete own communications" on communications for delete using (auth.uid() = user_id);

-- Auto-update updated_at on clients
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger clients_updated_at
  before update on clients
  for each row execute function update_updated_at();
