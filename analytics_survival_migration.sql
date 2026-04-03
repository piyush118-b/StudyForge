-- ============================================================
-- StudyForge AI — Analytics Survival Migration
-- Run this in: Supabase Dashboard → SQL Editor
--
-- Purpose: Change block_logs and daily_summaries foreign keys 
-- from ON DELETE CASCADE to ON DELETE SET NULL so that deleting 
-- a timetable NEVER erases the user's study history or analytics.
-- ============================================================

-- 1. Fix block_logs
ALTER TABLE public.block_logs
  DROP CONSTRAINT IF EXISTS block_logs_timetable_id_fkey,
  ADD CONSTRAINT block_logs_timetable_id_fkey
    FOREIGN KEY (timetable_id) 
    REFERENCES public.timetables(id) 
    ON DELETE SET NULL;

-- 2. Fix daily_summaries
ALTER TABLE public.daily_summaries
  DROP CONSTRAINT IF EXISTS daily_summaries_timetable_id_fkey,
  ADD CONSTRAINT daily_summaries_timetable_id_fkey
    FOREIGN KEY (timetable_id) 
    REFERENCES public.timetables(id) 
    ON DELETE SET NULL;

-- Verify (should show 'SET NULL' in confdeltype):
-- SELECT conname, confdeltype FROM pg_constraint 
-- WHERE conname IN ('block_logs_timetable_id_fkey', 'daily_summaries_timetable_id_fkey');
