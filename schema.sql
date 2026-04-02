-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  college text,
  branch text,
  semester text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- TIMETABLES table
create table public.timetables (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null default 'My Timetable',
  description text,
  tldraw_document jsonb,           -- full snapshot (or custom editor snapshot)
  grid_data jsonb,                 -- original Phase 1 grid JSON
  onboarding_data jsonb,           -- full Phase 1 form answers
  theme text default 'dark-academia',
  is_public boolean default false,
  share_token text unique default encode(gen_random_bytes(12), 'hex'),
  preview_image_url text,          -- base64 or storage URL
  total_weekly_hours integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- STUDY_SESSIONS table (for streak + stats tracking)
create table public.study_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  timetable_id uuid references public.timetables(id) on delete set null,
  date date not null default current_date,
  hours_studied numeric(4,2) default 0,
  subjects_covered text[],
  notes text,
  created_at timestamptz default now()
);

-- STICKERS table (user's saved sticker placements)
create table public.stickers (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  timetable_id uuid references public.timetables(id) on delete cascade,
  emoji text,
  label text,
  x numeric,
  y numeric
);

-- ROW LEVEL SECURITY
alter table public.profiles enable row level security;
alter table public.timetables enable row level security;
alter table public.study_sessions enable row level security;
alter table public.stickers enable row level security;

-- RLS Policies: profiles
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- RLS Policies: timetables
create policy "Users can CRUD own timetables"
  on public.timetables for all using (auth.uid() = user_id);
create policy "Public timetables are viewable by anyone"
  on public.timetables for select using (is_public = true);

-- RLS Policies: study_sessions
create policy "Users can CRUD own sessions"
  on public.study_sessions for all using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at_timetables
  before update on public.timetables
  for each row execute procedure public.handle_updated_at();

-- Storage bucket for preview images
insert into storage.buckets (id, name, public) 
values ('timetable-previews', 'timetable-previews', true) on conflict do nothing;

create policy "Anyone can view preview images"
  on storage.objects for select using (bucket_id = 'timetable-previews');
create policy "Authenticated users can upload previews"
  on storage.objects for insert 
  with check (bucket_id = 'timetable-previews' and auth.role() = 'authenticated');
