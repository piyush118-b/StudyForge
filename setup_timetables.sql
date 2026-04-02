-- ============================================================
-- EXTEND timetables table
-- ============================================================
alter table public.timetables 
  add column if not exists is_active boolean default false,
  add column if not exists activated_at timestamptz,
  add column if not exists semester_start date,
  add column if not exists semester_end date,
  add column if not exists total_blocks integer default 0,
  add column if not exists color_tag text default '#6366f1';

-- Only one timetable can be active per user at a time
-- Enforced in application logic (not DB constraint)

-- ============================================================
-- DAILY TRACKING TABLE
-- ============================================================
-- This is the heart of the tracking system.
-- One row per block per day per user.
create table public.block_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  timetable_id uuid references public.timetables(id) on delete cascade not null,
  
  -- Block identity (from the timetable grid)
  block_id text not null,           -- the block's id in the grid JSON
  subject text not null,
  block_type text,                  -- Lecture, Lab, Revision, etc.
  day_of_week text not null,        -- 'Monday', 'Tuesday', etc.
  scheduled_date date not null,     -- actual calendar date (e.g. 2024-03-18)
  scheduled_start time not null,    -- '09:00'
  scheduled_end time not null,      -- '10:30'
  scheduled_hours numeric(4,2) not null,
  
  -- Completion status
  status text not null default 'pending'
    check (status in ('pending', 'completed', 'partial', 'skipped')),
  
  -- For partial completion
  actual_hours numeric(4,2) default 0,
  partial_percentage integer default 0 
    check (partial_percentage between 0 and 100),
  
  -- For skipped
  skip_reason text,                 -- 'tired','distracted','emergency','other'
  skip_note text,                   -- free text reason
  
  -- Quality tracking
  focus_rating integer              -- 1-5 stars, how focused was the session
    check (focus_rating between 1 and 5),
  energy_level text                 -- 'high','medium','low' (how they felt)
    check (energy_level in ('high', 'medium', 'low')),
  notes text,                       -- any notes about this session
  
  -- Timestamps
  marked_at timestamptz,            -- when they marked it
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  
  -- Unique: one log per block per date
  unique(user_id, block_id, scheduled_date)
);

create index block_logs_user_date on public.block_logs(user_id, scheduled_date);
create index block_logs_timetable on public.block_logs(timetable_id);
create index block_logs_subject on public.block_logs(user_id, subject);

alter table public.block_logs enable row level security;
create policy "block_logs_own" on public.block_logs
  for all using (auth.uid() = user_id);

-- Wait, creating a trigger might fail if the function doesn't exist.
-- Assuming `handle_updated_at` exists from earlier config. If it fails, the user will see it.
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'block_logs_updated_at' AND tgrelid = 'public.block_logs'::regclass) THEN
    CREATE TRIGGER block_logs_updated_at
      BEFORE UPDATE ON public.block_logs
      FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Ignore missing handle_updated_at for now if we can't create it
END $$;

-- ============================================================
-- DAILY SUMMARY TABLE (pre-computed for fast dashboard loading)
-- ============================================================
create table public.daily_summaries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  timetable_id uuid references public.timetables(id) on delete cascade not null,
  date date not null,
  
  -- Counts
  total_blocks integer default 0,
  completed_blocks integer default 0,
  partial_blocks integer default 0,
  skipped_blocks integer default 0,
  pending_blocks integer default 0,
  
  -- Hours
  scheduled_hours numeric(5,2) default 0,
  completed_hours numeric(5,2) default 0,
  partial_hours numeric(5,2) default 0,
  
  -- Scores
  completion_rate numeric(5,2) default 0,  -- 0-100
  focus_avg numeric(3,2),                   -- avg focus rating
  
  -- Per-subject breakdown (JSON)
  subject_breakdown jsonb default '[]',
  -- [{ subject, scheduled, completed, status }]
  
  unique(user_id, date, timetable_id),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.daily_summaries enable row level security;
create policy "daily_summaries_own" on public.daily_summaries
  for all using (auth.uid() = user_id);

-- Enable realtime
alter publication supabase_realtime add table public.block_logs;
alter publication supabase_realtime add table public.daily_summaries;
