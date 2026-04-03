-- ================================================
-- SUBSCRIPTIONS TABLE
-- ================================================
create table public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  plan text not null default 'free'
    check (plan in ('free', 'pro', 'pro_yearly')),
  status text not null default 'active'
    check (status in ('active', 'cancelled', 'past_due', 'trialing')),
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  stripe_price_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  trial_end timestamptz,
  ai_calls_used integer default 0,       -- monthly counter
  ai_calls_limit integer default 5,      -- free = 5/month, pro = unlimited
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.subscriptions enable row level security;
create policy "subscriptions_select_own" on public.subscriptions
  for select using (auth.uid() = user_id);
create policy "subscriptions_insert_own" on public.subscriptions
  for insert with check (auth.uid() = user_id);
create policy "subscriptions_update_own" on public.subscriptions
  for update using (auth.uid() = user_id);

-- Auto-create free subscription on signup
create or replace function public.handle_new_subscription()
returns trigger language plpgsql security definer as $$
begin
  insert into public.subscriptions (user_id, plan, status, ai_calls_limit)
  values (new.id, 'free', 'active', 5);
  return new;
end;
$$;
create trigger on_auth_user_subscription
  after insert on auth.users
  for each row execute procedure public.handle_new_subscription();

create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row execute procedure public.handle_updated_at();

-- ================================================
-- COLLABORATION TABLE
-- ================================================
create table public.timetable_collaborators (
  id uuid default uuid_generate_v4() primary key,
  timetable_id uuid references public.timetables(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade,
  invited_email text,                    -- for pending invites
  role text not null default 'viewer'
    check (role in ('owner', 'editor', 'viewer')),
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'rejected')),
  invited_by uuid references auth.users(id),
  invite_token text unique default encode(gen_random_bytes(16), 'hex'),
  accepted_at timestamptz,
  created_at timestamptz default now() not null,
  unique(timetable_id, user_id)
);

create index collab_timetable_idx on public.timetable_collaborators(timetable_id);
create index collab_user_idx on public.timetable_collaborators(user_id);

alter table public.timetable_collaborators enable row level security;
create policy "collab_select" on public.timetable_collaborators
  for select using (
    auth.uid() = user_id OR
    auth.uid() = invited_by OR
    timetable_id in (
      select id from public.timetables where user_id = auth.uid()
    )
  );
create policy "collab_insert_owner" on public.timetable_collaborators
  for insert with check (
    timetable_id in (
      select id from public.timetables where user_id = auth.uid()
    )
  );
create policy "collab_update" on public.timetable_collaborators
  for update using (auth.uid() = user_id OR auth.uid() = invited_by);
create policy "collab_delete_owner" on public.timetable_collaborators
  for delete using (
    auth.uid() = invited_by OR
    timetable_id in (
      select id from public.timetables where user_id = auth.uid()
    )
  );

-- ================================================
-- AI CHAT HISTORY TABLE
-- ================================================
create table public.ai_chat_messages (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  timetable_id uuid references public.timetables(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  tokens_used integer,
  action_applied boolean default false,   -- if AI suggestion was applied
  created_at timestamptz default now() not null
);

create index ai_chat_user_timetable on public.ai_chat_messages(user_id, timetable_id);
alter table public.ai_chat_messages enable row level security;
create policy "ai_chat_own" on public.ai_chat_messages
  for all using (auth.uid() = user_id);

-- ================================================
-- PUSH SUBSCRIPTIONS TABLE
-- ================================================
create table public.push_subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  endpoint text not null unique,
  p256dh text not null,
  auth_key text not null,
  user_agent text,
  is_active boolean default true,
  created_at timestamptz default now() not null,
  last_used_at timestamptz
);

alter table public.push_subscriptions enable row level security;
create policy "push_own" on public.push_subscriptions
  for all using (auth.uid() = user_id);

-- ================================================
-- ACHIEVEMENTS TABLE
-- ================================================
create table public.achievements (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  achievement_key text not null,         -- 'first_timetable', 'streak_7' etc
  achievement_name text not null,
  achievement_description text,
  badge_emoji text,
  unlocked_at timestamptz default now() not null,
  is_seen boolean default false,         -- for notification dot
  unique(user_id, achievement_key)
);

alter table public.achievements enable row level security;
create policy "achievements_own" on public.achievements
  for all using (auth.uid() = user_id);

-- ================================================
-- REFERRALS TABLE
-- ================================================
create table public.referrals (
  id uuid default uuid_generate_v4() primary key,
  referrer_id uuid references auth.users(id) on delete cascade not null,
  referee_id uuid references auth.users(id) on delete cascade,
  referee_email text,
  referral_code text not null unique,
  status text default 'pending'
    check (status in ('pending', 'signed_up', 'converted', 'rewarded')),
  reward_granted boolean default false,
  reward_days integer default 30,        -- free pro days
  signed_up_at timestamptz,
  converted_at timestamptz,
  created_at timestamptz default now() not null
);

alter table public.referrals enable row level security;
create policy "referrals_own" on public.referrals
  for select using (auth.uid() = referrer_id OR auth.uid() = referee_id);
create policy "referrals_insert" on public.referrals
  for insert with check (auth.uid() = referrer_id);

-- ================================================
-- FEEDBACK TABLE
-- ================================================
create table public.feedback (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete set null,
  type text check (type in ('bug', 'feature', 'general', 'praise')),
  rating integer check (rating between 1 and 5),
  message text not null,
  page_url text,
  user_agent text,
  created_at timestamptz default now() not null
);

alter table public.feedback enable row level security;
create policy "feedback_insert" on public.feedback
  for insert with check (true);          -- anyone can submit
create policy "feedback_select_own" on public.feedback
  for select using (auth.uid() = user_id);

-- ================================================
-- USER LIFECYCLE EVENTS TABLE (Critical for analytics)
-- ================================================
create table public.lifecycle_events (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  session_id text,                       -- anonymous session tracking
  event_type text not null,
  event_data jsonb default '{}',         -- arbitrary metadata
  page_path text,
  referrer text,
  device_type text check (device_type in ('mobile', 'tablet', 'desktop')),
  created_at timestamptz default now() not null
);

create index lifecycle_user_event on public.lifecycle_events(user_id, event_type);
create index lifecycle_created_at on public.lifecycle_events(created_at);

alter table public.lifecycle_events enable row level security;
create policy "lifecycle_insert_own" on public.lifecycle_events
  for insert with check (auth.uid() = user_id OR user_id is null);
create policy "lifecycle_select_own" on public.lifecycle_events
  for select using (auth.uid() = user_id);

-- Enable realtime
alter publication supabase_realtime add table public.timetable_collaborators;
alter publication supabase_realtime add table public.achievements;
