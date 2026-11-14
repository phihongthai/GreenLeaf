-- ─────────────────────────────────────────────────────────────
-- Migration 0024: Unit → Mission → Act → Task (Sample Unit, CTO Alignment 31/10/2026)
--
-- A separate, extensible content model next to the legacy Kindergarten
-- lesson/mission tables (those stay untouched).
--   Unit      one themed unit of a programme (6 Missions)
--   Mission   one 90-minute classroom session; the student does its Acts/Tasks at home
--   Act       group of Tasks
--   Task      one activity; `task_type` is free text validated by the app (no CHECK), so new
--             task types need no migration. Sample types: pronunciation, unscramble, reading_choice.
--
-- Rules from the doc enforced in SQL:
--   * no pass/fail: a Task is complete when every item has been handled
--   * every completed Task grants exactly 1 Leaf, once (greenleaf_complete_task)
--   * Pronunciation: max 3 recordings per item; Unscramble/Reading: 1 answer per item
--   * correct answers live in greenleaf_task_answers (teacher-only RLS), never in task content
-- ─────────────────────────────────────────────────────────────

-- ── Classes ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.greenleaf_classes (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  code       text NOT NULL UNIQUE,
  grade_id   uuid REFERENCES public.greenleaf_grades(id) ON DELETE SET NULL,
  created_by uuid REFERENCES public.greenleaf_profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.greenleaf_profiles
  ADD COLUMN IF NOT EXISTS class_id uuid REFERENCES public.greenleaf_classes(id) ON DELETE SET NULL;

-- ── Content ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.greenleaf_units (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grade_id    uuid NOT NULL REFERENCES public.greenleaf_grades(id) ON DELETE CASCADE,
  program     text NOT NULL DEFAULT 'Primary Path 1',
  order_index integer NOT NULL DEFAULT 1,
  title       text NOT NULL,
  UNIQUE (grade_id, program, order_index)
);

CREATE TABLE IF NOT EXISTS public.greenleaf_unit_missions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id       uuid NOT NULL REFERENCES public.greenleaf_units(id) ON DELETE CASCADE,
  order_index   integer NOT NULL,
  title         text NOT NULL,
  book_sections text,
  -- Default for every class; a row in greenleaf_class_mission_access overrides it per class.
  is_unlocked   boolean NOT NULL DEFAULT false,
  UNIQUE (unit_id, order_index)
);

CREATE TABLE IF NOT EXISTS public.greenleaf_acts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id  uuid NOT NULL REFERENCES public.greenleaf_unit_missions(id) ON DELETE CASCADE,
  order_index integer NOT NULL,
  title       text NOT NULL,
  UNIQUE (mission_id, order_index)
);

CREATE TABLE IF NOT EXISTS public.greenleaf_tasks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  act_id      uuid NOT NULL REFERENCES public.greenleaf_acts(id) ON DELETE CASCADE,
  order_index integer NOT NULL,
  task_type   text NOT NULL,
  title       text NOT NULL,
  instruction text,
  content     jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (act_id, order_index)
);

CREATE TABLE IF NOT EXISTS public.greenleaf_task_answers (
  task_id  uuid NOT NULL REFERENCES public.greenleaf_tasks(id) ON DELETE CASCADE,
  item_key text NOT NULL,
  answer   jsonb NOT NULL,
  PRIMARY KEY (task_id, item_key)
);

CREATE TABLE IF NOT EXISTS public.greenleaf_class_mission_access (
  class_id   uuid NOT NULL REFERENCES public.greenleaf_classes(id) ON DELETE CASCADE,
  mission_id uuid NOT NULL REFERENCES public.greenleaf_unit_missions(id) ON DELETE CASCADE,
  unlocked   boolean NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (class_id, mission_id)
);

-- ── Student data ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.greenleaf_task_results (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id     uuid NOT NULL REFERENCES public.greenleaf_profiles(id) ON DELETE CASCADE,
  task_id        uuid NOT NULL REFERENCES public.greenleaf_tasks(id) ON DELETE CASCADE,
  item_key       text NOT NULL,
  attempt_no     integer NOT NULL,
  student_answer jsonb,
  correct_answer jsonb,
  is_correct     boolean,
  score          numeric,
  created_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, task_id, item_key, attempt_no)
);
CREATE INDEX IF NOT EXISTS greenleaf_task_results_student_idx
  ON public.greenleaf_task_results (student_id, task_id);

CREATE TABLE IF NOT EXISTS public.greenleaf_task_progress (
  student_id   uuid NOT NULL REFERENCES public.greenleaf_profiles(id) ON DELETE CASCADE,
  task_id      uuid NOT NULL REFERENCES public.greenleaf_tasks(id) ON DELETE CASCADE,
  status       text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  leaf_awarded boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  updated_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (student_id, task_id)
);

ALTER TABLE public.greenleaf_reward_events
  ADD COLUMN IF NOT EXISTS task_id uuid REFERENCES public.greenleaf_tasks(id) ON DELETE SET NULL;
ALTER TABLE public.greenleaf_reward_events DROP CONSTRAINT IF EXISTS greenleaf_reward_events_type_check;
ALTER TABLE public.greenleaf_reward_events
  ADD CONSTRAINT greenleaf_reward_events_type_check
  CHECK (type IN ('mission_complete', 'perfect_score', 'streak_7', 'bonus_3missions', 'mystery_box_redeem', 'task_complete'));

-- ── RLS ──────────────────────────────────────────────────────
ALTER TABLE public.greenleaf_classes              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.greenleaf_units                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.greenleaf_unit_missions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.greenleaf_acts                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.greenleaf_tasks                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.greenleaf_task_answers         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.greenleaf_class_mission_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.greenleaf_task_results         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.greenleaf_task_progress        ENABLE ROW LEVEL SECURITY;

CREATE POLICY greenleaf_classes_select ON public.greenleaf_classes FOR SELECT TO authenticated USING (true);
CREATE POLICY greenleaf_classes_write_teacher ON public.greenleaf_classes FOR ALL
  USING (public.greenleaf_my_role() = 'teacher') WITH CHECK (public.greenleaf_my_role() = 'teacher');

CREATE POLICY greenleaf_units_select ON public.greenleaf_units FOR SELECT TO authenticated USING (true);
CREATE POLICY greenleaf_units_write_teacher ON public.greenleaf_units FOR ALL
  USING (public.greenleaf_my_role() = 'teacher') WITH CHECK (public.greenleaf_my_role() = 'teacher');

CREATE POLICY greenleaf_unit_missions_select ON public.greenleaf_unit_missions FOR SELECT TO authenticated USING (true);
CREATE POLICY greenleaf_unit_missions_write_teacher ON public.greenleaf_unit_missions FOR ALL
  USING (public.greenleaf_my_role() = 'teacher') WITH CHECK (public.greenleaf_my_role() = 'teacher');

CREATE POLICY greenleaf_acts_select ON public.greenleaf_acts FOR SELECT TO authenticated USING (true);
CREATE POLICY greenleaf_acts_write_teacher ON public.greenleaf_acts FOR ALL
  USING (public.greenleaf_my_role() = 'teacher') WITH CHECK (public.greenleaf_my_role() = 'teacher');

CREATE POLICY greenleaf_tasks_select ON public.greenleaf_tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY greenleaf_tasks_write_teacher ON public.greenleaf_tasks FOR ALL
  USING (public.greenleaf_my_role() = 'teacher') WITH CHECK (public.greenleaf_my_role() = 'teacher');

-- Answers: teachers only. Students never read them; the server (service role) grades.
CREATE POLICY greenleaf_task_answers_teacher ON public.greenleaf_task_answers FOR ALL
  USING (public.greenleaf_my_role() = 'teacher') WITH CHECK (public.greenleaf_my_role() = 'teacher');

CREATE POLICY greenleaf_class_mission_access_select ON public.greenleaf_class_mission_access FOR SELECT TO authenticated USING (true);
CREATE POLICY greenleaf_class_mission_access_write_teacher ON public.greenleaf_class_mission_access FOR ALL
  USING (public.greenleaf_my_role() = 'teacher') WITH CHECK (public.greenleaf_my_role() = 'teacher');

-- Results/progress: written only through the SECURITY DEFINER functions below (service role).
CREATE POLICY greenleaf_task_results_select ON public.greenleaf_task_results FOR SELECT
  USING (
    student_id = auth.uid()
    OR public.greenleaf_my_role() = 'teacher'
    OR EXISTS (SELECT 1 FROM public.greenleaf_profiles p WHERE p.id = student_id AND p.parent_id = auth.uid())
  );
CREATE POLICY greenleaf_task_progress_select ON public.greenleaf_task_progress FOR SELECT
  USING (
    student_id = auth.uid()
    OR public.greenleaf_my_role() = 'teacher'
    OR EXISTS (SELECT 1 FROM public.greenleaf_profiles p WHERE p.id = student_id AND p.parent_id = auth.uid())
  );

-- ── Functions (service_role only) ────────────────────────────

-- Records one item result. max_attempts = 1 for Unscramble/Reading, 3 for Pronunciation.
-- Returns the attempt number, or 0 when the item has no attempts left.
CREATE OR REPLACE FUNCTION public.greenleaf_submit_task_item(
  p_student_id     uuid,
  p_task_id        uuid,
  p_item_key       text,
  p_max_attempts   integer,
  p_student_answer jsonb,
  p_correct_answer jsonb,
  p_is_correct     boolean,
  p_score          numeric
)
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_attempt integer;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext(p_student_id::text || ':' || p_task_id::text || ':' || p_item_key));

  SELECT COALESCE(MAX(attempt_no), 0) + 1 INTO v_attempt
    FROM public.greenleaf_task_results
   WHERE student_id = p_student_id AND task_id = p_task_id AND item_key = p_item_key;

  IF v_attempt > p_max_attempts THEN
    RETURN 0;
  END IF;

  INSERT INTO public.greenleaf_task_results
    (student_id, task_id, item_key, attempt_no, student_answer, correct_answer, is_correct, score)
  VALUES
    (p_student_id, p_task_id, p_item_key, v_attempt, p_student_answer, p_correct_answer, p_is_correct, p_score);

  INSERT INTO public.greenleaf_task_progress (student_id, task_id)
  VALUES (p_student_id, p_task_id)
  ON CONFLICT (student_id, task_id) DO UPDATE SET updated_at = now();

  RETURN v_attempt;
END;
$$;

-- Completes a Task once every item has at least one result (no score threshold) and grants
-- exactly 1 Leaf, once. Returns true only on the call that granted the Leaf.
CREATE OR REPLACE FUNCTION public.greenleaf_complete_task(
  p_student_id  uuid,
  p_task_id     uuid,
  p_total_items integer
)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_done    integer;
  v_awarded boolean;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext(p_student_id::text || ':' || p_task_id::text));

  SELECT COUNT(DISTINCT item_key) INTO v_done
    FROM public.greenleaf_task_results
   WHERE student_id = p_student_id AND task_id = p_task_id;

  IF v_done < p_total_items THEN
    RETURN false;
  END IF;

  SELECT leaf_awarded INTO v_awarded
    FROM public.greenleaf_task_progress
   WHERE student_id = p_student_id AND task_id = p_task_id;

  IF COALESCE(v_awarded, false) THEN
    RETURN false;
  END IF;

  INSERT INTO public.greenleaf_task_progress (student_id, task_id, status, leaf_awarded, completed_at)
  VALUES (p_student_id, p_task_id, 'completed', true, now())
  ON CONFLICT (student_id, task_id) DO UPDATE
    SET status = 'completed', leaf_awarded = true, completed_at = now(), updated_at = now();

  INSERT INTO public.greenleaf_rewards (student_id, leaf_count, streak_days)
  VALUES (p_student_id, 1, 0)
  ON CONFLICT (student_id) DO UPDATE SET leaf_count = greenleaf_rewards.leaf_count + 1;

  INSERT INTO public.greenleaf_reward_events (student_id, type, leaf_delta, task_id)
  VALUES (p_student_id, 'task_complete', 1, p_task_id);

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.greenleaf_submit_task_item(uuid, uuid, text, integer, jsonb, jsonb, boolean, numeric) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.greenleaf_complete_task(uuid, uuid, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.greenleaf_submit_task_item(uuid, uuid, text, integer, jsonb, jsonb, boolean, numeric) TO service_role;
GRANT EXECUTE ON FUNCTION public.greenleaf_complete_task(uuid, uuid, integer) TO service_role;

-- Students may update their own profile row (greenleaf_profiles_update_own); keep them from
-- moving themselves into another class, which would change which Missions are open to them.
CREATE OR REPLACE FUNCTION public.greenleaf_guard_class_id()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.class_id IS DISTINCT FROM OLD.class_id
     AND auth.uid() IS NOT NULL
     AND public.greenleaf_my_role() NOT IN ('teacher', 'admin') THEN
    NEW.class_id := OLD.class_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS greenleaf_guard_class_id ON public.greenleaf_profiles;
CREATE TRIGGER greenleaf_guard_class_id
  BEFORE UPDATE ON public.greenleaf_profiles
  FOR EACH ROW EXECUTE FUNCTION public.greenleaf_guard_class_id();

-- ── Sample data: Unit 1 "What is a family?", Mission 1 ───────
-- Attached to the Kids 1 grade. Mission 1 open, Missions 2–6 locked until the teacher opens them.
-- NOTE: Act 2 reading text and the vocabulary pictures (emoji) are DRAFT placeholders written to
-- match the answer key in the doc (1-B, 2-A, 3-C, 4-B, 5-A, 6-C). Replace with the official
-- sample content file / illustrations before use with students.
DO $$
DECLARE
  v_grade   uuid;
  v_unit    uuid;
  v_m1      uuid;
  v_act1    uuid;
  v_act2    uuid;
  v_t1      uuid;
  v_t2      uuid;
  v_t3      uuid;
  v_words   text[] := ARRAY['father','mother','brother','sister','grandfather','grandmother','family',
                            'parents','house','backyard','apartment','grandparents','chore','tent','evening'];
  v_emoji   text[] := ARRAY['👨','👩','👦','👧','👴','👵','👨‍👩‍👧‍👦','👫','🏠','🌳','🏢','👴👵','🧹','⛺','🌆'];
  v_titles  text[] := ARRAY['Vocabulary & Reading 1','Grammar 1 & Writing','Reading & Grammar 2',
                            'Oracy, Listening & Big Challenge','Phonics & Speaking Mission','Unit Review & Exam Format'];
  v_books   text[] := ARRAY['Unit Opener; Key Words 1 & 2; Nonfiction Reading; Explore the Text',
                            'Grammar 1; Writing','Fiction Reading; Grammar in Context',
                            'Oracy; Listening; Family Photo Album','Phonics; Speaking Mission',
                            'Ôn tập và làm quen dạng đề'];
  v_pron    jsonb := '[]'::jsonb;
  v_scr     jsonb := '[]'::jsonb;
  v_letters text[];
  v_shuffled text;
  v_i       integer;
  v_tries   integer;
BEGIN
  SELECT id INTO v_grade FROM public.greenleaf_grades WHERE code = 'kids1';
  IF v_grade IS NULL OR EXISTS (SELECT 1 FROM public.greenleaf_units WHERE grade_id = v_grade AND order_index = 1) THEN
    RETURN;
  END IF;

  INSERT INTO public.greenleaf_units (grade_id, program, order_index, title)
  VALUES (v_grade, 'Primary Path 1', 1, 'Unit 1: What is a family?') RETURNING id INTO v_unit;

  FOR v_i IN 1..6 LOOP
    INSERT INTO public.greenleaf_unit_missions (unit_id, order_index, title, book_sections, is_unlocked)
    VALUES (v_unit, v_i, v_titles[v_i], v_books[v_i], v_i = 1);
  END LOOP;
  SELECT id INTO v_m1 FROM public.greenleaf_unit_missions WHERE unit_id = v_unit AND order_index = 1;

  INSERT INTO public.greenleaf_acts (mission_id, order_index, title) VALUES (v_m1, 1, 'Vocabulary') RETURNING id INTO v_act1;
  INSERT INTO public.greenleaf_acts (mission_id, order_index, title) VALUES (v_m1, 2, 'Reading')    RETURNING id INTO v_act2;

  FOR v_i IN 1..15 LOOP
    v_pron := v_pron || jsonb_build_object('key', v_words[v_i], 'word', v_words[v_i], 'emoji', v_emoji[v_i]);

    -- Unscramble: shuffle the letters until the result differs from the word.
    v_tries := 0;
    LOOP
      SELECT array_agg(ch ORDER BY random()) INTO v_letters
        FROM regexp_split_to_table(v_words[v_i], '') AS ch;
      v_shuffled := array_to_string(v_letters, '');
      v_tries := v_tries + 1;
      EXIT WHEN v_shuffled <> v_words[v_i] OR v_tries > 50;
    END LOOP;
    v_scr := v_scr || jsonb_build_object('key', v_words[v_i], 'letters', to_jsonb(v_letters), 'emoji', v_emoji[v_i]);
  END LOOP;

  INSERT INTO public.greenleaf_tasks (act_id, order_index, task_type, title, instruction, content)
  VALUES (v_act1, 1, 'pronunciation', 'Listen and say',
          'Listen to the word. Tap the microphone and say it. You can try up to 3 times.',
          jsonb_build_object('items', v_pron, 'maxAttempts', 3))
  RETURNING id INTO v_t1;

  INSERT INTO public.greenleaf_tasks (act_id, order_index, task_type, title, instruction, content)
  VALUES (v_act1, 2, 'unscramble', 'Unscramble',
          'Put the letters in the correct order to make a word.',
          jsonb_build_object('items', v_scr))
  RETURNING id INTO v_t2;

  FOR v_i IN 1..15 LOOP
    INSERT INTO public.greenleaf_task_answers (task_id, item_key, answer)
    VALUES (v_t2, v_words[v_i], to_jsonb(v_words[v_i]));
  END LOOP;

  INSERT INTO public.greenleaf_tasks (act_id, order_index, task_type, title, instruction, content)
  VALUES (v_act2, 1, 'reading_choice', 'Different Families, Different Homes',
          'Read the sentences. Choose A (Ben), B (Mia), or C (Temu).',
          jsonb_build_object(
            'passages', jsonb_build_array(
              jsonb_build_object('id','A','name','Ben','text','My name is Ben. I live in a big house with my father, my mother and my sister. Our house has a backyard. On Saturday evening, my father and I sleep in a tent in the backyard.'),
              jsonb_build_object('id','B','name','Mia','text','I am Mia. I live in an apartment with my parents and my brother. My grandparents come to see us on Sunday. We eat lunch together.'),
              jsonb_build_object('id','C','name','Temu','text','My name is Temu. I have a big family. My grandfather and my grandmother live with us. After school, I do a chore for my mother. I like to help her.')
            ),
            'questions', jsonb_build_array(
              jsonb_build_object('key','q1','text','Who lives in an apartment?'),
              jsonb_build_object('key','q2','text','Who sleeps in a tent?'),
              jsonb_build_object('key','q3','text','Who lives with a grandfather and a grandmother?'),
              jsonb_build_object('key','q4','text','Who has a brother?'),
              jsonb_build_object('key','q5','text','Who has a house with a backyard?'),
              jsonb_build_object('key','q6','text','Who does a chore after school?')
            )))
  RETURNING id INTO v_t3;

  INSERT INTO public.greenleaf_task_answers (task_id, item_key, answer) VALUES
    (v_t3, 'q1', '"B"'), (v_t3, 'q2', '"A"'), (v_t3, 'q3', '"C"'),
    (v_t3, 'q4', '"B"'), (v_t3, 'q5', '"A"'), (v_t3, 'q6', '"C"');
END $$;
