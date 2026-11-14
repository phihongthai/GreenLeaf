-- Unscramble hints: an emoji alone is not enough to know the word (👫 is "parents"?). Each item gets a
-- Vietnamese meaning and a short English clue, shown under the picture. The clues never contain the answer.
UPDATE public.greenleaf_tasks t
SET content = jsonb_set(
  t.content,
  '{items}',
  (
    SELECT jsonb_agg(i || jsonb_build_object('hint', h.hints -> (i ->> 'key')) ORDER BY ord)
    FROM jsonb_array_elements(t.content -> 'items') WITH ORDINALITY AS x(i, ord)
  )
)
FROM (
  SELECT '{
    "father":      {"vi": "bố",            "en": "the man parent"},
    "mother":      {"vi": "mẹ",            "en": "the woman parent"},
    "brother":     {"vi": "anh / em trai", "en": "a boy in your family, same parents as you"},
    "sister":      {"vi": "chị / em gái",  "en": "a girl in your family, same parents as you"},
    "grandfather": {"vi": "ông",           "en": "your parent''s father"},
    "grandmother": {"vi": "bà",            "en": "your parent''s mother"},
    "family":      {"vi": "gia đình",      "en": "people who live together and love each other"},
    "parents":     {"vi": "bố mẹ",         "en": "your mom and dad"},
    "house":       {"vi": "ngôi nhà",      "en": "a building where people live"},
    "backyard":    {"vi": "sân sau",       "en": "the garden behind a house"},
    "apartment":   {"vi": "căn hộ",        "en": "a home in a big building"},
    "grandparents":{"vi": "ông bà",        "en": "your grandfather and grandmother"},
    "chore":       {"vi": "việc nhà",      "en": "a job at home, like cleaning"},
    "tent":        {"vi": "cái lều",       "en": "a small cloth house for camping"},
    "evening":     {"vi": "buổi tối",      "en": "the time of day after the afternoon"}
  }'::jsonb AS hints
) h
WHERE t.task_type = 'unscramble'
  AND t.content -> 'items' IS NOT NULL;
