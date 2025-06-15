
-- Create profiles table to store user profile info
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  avatar text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Automatically create a profile when a new user signs up
create or replace function public.handle_new_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, avatar)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', 'New User'),
    new.email,
    null
  );
  return new;
end;
$$;

create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute procedure public.handle_new_profile();

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Policy: Each user can select their own profile
create policy "Users can view their profile"
  on public.profiles
  for select
  using (auth.uid() = id);

-- Policy: Each user can update their own profile
create policy "Users can update their profile"
  on public.profiles
  for update
  using (auth.uid() = id);

-- Policy: Only allow insert by trigger function
create policy "No direct inserts"
  on public.profiles
  for insert to public
  with check (false);
