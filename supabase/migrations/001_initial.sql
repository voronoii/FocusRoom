-- Enable RLS
alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;

-- Profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  display_name text not null,
  avatar_seed text not null default gen_random_uuid()::text,
  is_guest boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view all profiles" on public.profiles
  for select using (true);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Sessions table
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  task_name text not null,
  duration_minutes integer not null check (duration_minutes in (25, 50, 90)),
  started_at timestamptz not null default now(),
  status text not null default 'active' check (status in ('active', 'completed', 'timeout')),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.sessions enable row level security;

create policy "Users can view own sessions" on public.sessions
  for select using (auth.uid() = user_id);

create policy "Users can insert own sessions" on public.sessions
  for insert with check (auth.uid() = user_id);

create policy "Users can update own sessions" on public.sessions
  for update using (auth.uid() = user_id);

-- Index for active session lookup
create index idx_sessions_active on public.sessions (user_id, status) where status = 'active';
create index idx_sessions_history on public.sessions (user_id, started_at desc);

-- Function to create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  animal_names text[] := array['여우', '곰', '개구리', '올빼미', '고양이', '판다', '토끼', '나비', '강아지', '펭귄', '코알라', '다람쥐'];
  random_name text;
begin
  random_name := animal_names[1 + floor(random() * array_length(animal_names, 1))::int]
    || ' #' || floor(random() * 9000 + 1000)::int;

  insert into public.profiles (id, email, display_name, is_guest)
  values (
    new.id,
    new.email,
    random_name,
    new.email is null
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
