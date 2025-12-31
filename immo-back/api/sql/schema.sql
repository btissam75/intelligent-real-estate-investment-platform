create schema if not exists immo;

create table if not exists immo.users(
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text,
  full_name text,
  role text default 'user',
  is_verified boolean default false,
  created_at timestamptz default now()
);

create table if not exists immo.investments(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references immo.users(id),
  property_id text not null,
  amount numeric not null,
  currency text not null,
  units int,
  wallet_address text not null,
  order_message text not null,
  order_sig text not null,
  status text not null, -- pending_funds | funds_received | confirmed | failed
  pay_tx text,
  created_at timestamptz default now()
);

create table if not exists immo.nfts(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references immo.users(id),
  wallet_address text not null,
  token_id text, -- si tu veux stocker le vrai id retourné (si tu l’as)
  contract_address text not null,
  property_id text not null,
  metadata_uri text not null,
  pdf_ipfs text,
  pdf_sha256 text,
  category text,
  units int,
  tx_hash text,
  created_at timestamptz default now()
);
