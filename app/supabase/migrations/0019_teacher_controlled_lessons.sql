-- ─────────────────────────────────────────────────────────────
-- Migration 0019: Teacher-controlled progression
-- Adds is_unlocked to greenleaf_lessons so teachers/admins control
-- which lessons are open for learners instead of auto-unlocking.
-- ─────────────────────────────────────────────────────────────

ALTER TABLE public.greenleaf_lessons
ADD COLUMN IF NOT EXISTS is_unlocked BOOLEAN NOT NULL DEFAULT FALSE;

-- By default: unlock the first lesson (order_index = 1) for each grade.
-- All future lessons (order_index >= 2) remain locked until teacher explicitly unlocks.
UPDATE public.greenleaf_lessons
SET is_unlocked = TRUE
WHERE order_index = 1;
