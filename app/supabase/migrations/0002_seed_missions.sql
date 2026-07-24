-- Seed nội dung Mission 1-3 cho 4 cấp độ, đúng nguyên văn Phụ lục MVP 2 - Nội dung 4 cấp độ Demo.

-- ─────────────────────────────────────────────────────────────
-- Kindergarten — Animals / Phonics /a/
-- ─────────────────────────────────────────────────────────────
INSERT INTO public.greenleaf_missions (grade_id, type, order_index, title, content)
SELECT id, 'words_explorer', 1, 'Words Explorer: Animals', '{
  "topic": "Animals",
  "words": [
    {"word": "cat", "imageUrl": "/images/kindergarten/cat.png"},
    {"word": "dog", "imageUrl": "/images/kindergarten/dog.png"},
    {"word": "bird", "imageUrl": "/images/kindergarten/bird.png"},
    {"word": "rat", "imageUrl": "/images/kindergarten/rat.png"},
    {"word": "lizard", "imageUrl": "/images/kindergarten/lizard.png"}
  ]
}'::jsonb
FROM public.greenleaf_grades WHERE code = 'kindergarten'
ON CONFLICT (grade_id, order_index) DO NOTHING;

INSERT INTO public.greenleaf_missions (grade_id, type, order_index, title, content)
SELECT id, 'phonics', 2, 'Phonics /a/', '{
  "highlight": "a",
  "lines": ["Pat has a cat", "The cat has a hat", "Pat taps the cat", "Ha ha ha (laugh)"]
}'::jsonb
FROM public.greenleaf_grades WHERE code = 'kindergarten'
ON CONFLICT (grade_id, order_index) DO NOTHING;

INSERT INTO public.greenleaf_missions (grade_id, type, order_index, title, content)
SELECT id, 'speaking_challenge', 3, 'Speaking Challenge', '{
  "script": "Pat has a cat. The cat has a hat. Pat taps the cat. Ha ha ha!"
}'::jsonb
FROM public.greenleaf_grades WHERE code = 'kindergarten'
ON CONFLICT (grade_id, order_index) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- Kids 1 — Toys / Phonics i_e /ai/
-- ─────────────────────────────────────────────────────────────
INSERT INTO public.greenleaf_missions (grade_id, type, order_index, title, content)
SELECT id, 'words_explorer', 1, 'Words Explorer: Toys', '{
  "topic": "Toys",
  "words": [
    {"word": "car", "imageUrl": "/images/kids1/car.png"},
    {"word": "train", "imageUrl": "/images/kids1/train.png"},
    {"word": "robot", "imageUrl": "/images/kids1/robot.png"},
    {"word": "bike", "imageUrl": "/images/kids1/bike.png"},
    {"word": "kite", "imageUrl": "/images/kids1/kite.png"}
  ]
}'::jsonb
FROM public.greenleaf_grades WHERE code = 'kids1'
ON CONFLICT (grade_id, order_index) DO NOTHING;

INSERT INTO public.greenleaf_missions (grade_id, type, order_index, title, content)
SELECT id, 'phonics', 2, 'Phonics i_e /ai/', '{
  "highlight": "i_e",
  "lines": ["Fly, fly, kite!", "Ride, ride, bike!", "Smile, smile, smile!", "What a happy sight!"]
}'::jsonb
FROM public.greenleaf_grades WHERE code = 'kids1'
ON CONFLICT (grade_id, order_index) DO NOTHING;

INSERT INTO public.greenleaf_missions (grade_id, type, order_index, title, content)
SELECT id, 'speaking_challenge', 3, 'Speaking Challenge', '{
  "script": "Fly, fly, kite! Ride, ride, bike! Smile, smile, smile! What a happy sight!"
}'::jsonb
FROM public.greenleaf_grades WHERE code = 'kids1'
ON CONFLICT (grade_id, order_index) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- Kids 2 — Places / Phonics /a/
-- ─────────────────────────────────────────────────────────────
INSERT INTO public.greenleaf_missions (grade_id, type, order_index, title, content)
SELECT id, 'words_explorer', 1, 'Words Explorer: Places', '{
  "topic": "Places",
  "words": [
    {"word": "cinema", "imageUrl": "/images/kids2/cinema.png"},
    {"word": "post office", "imageUrl": "/images/kids2/post-office.png"},
    {"word": "supermarket", "imageUrl": "/images/kids2/supermarket.png"},
    {"word": "police station", "imageUrl": "/images/kids2/police-station.png"},
    {"word": "swimming pool", "imageUrl": "/images/kids2/swimming-pool.png"}
  ]
}'::jsonb
FROM public.greenleaf_grades WHERE code = 'kids2'
ON CONFLICT (grade_id, order_index) DO NOTHING;

INSERT INTO public.greenleaf_missions (grade_id, type, order_index, title, content)
SELECT id, 'phonics', 2, 'Phonics /a/', '{
  "highlight": "a",
  "lines": ["Post office, post office, post my letter.", "Police station, keep us better.", "Supermarket, buy some pears.", "Swimming pool, see you there!"]
}'::jsonb
FROM public.greenleaf_grades WHERE code = 'kids2'
ON CONFLICT (grade_id, order_index) DO NOTHING;

INSERT INTO public.greenleaf_missions (grade_id, type, order_index, title, content)
SELECT id, 'speaking_challenge', 3, 'Speaking Challenge', '{
  "script": "Post office, post office, post my letter. Police station, keep us better. Supermarket, buy some pears. Swimming pool, see you there!"
}'::jsonb
FROM public.greenleaf_grades WHERE code = 'kids2'
ON CONFLICT (grade_id, order_index) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- Teens — City Life / Sentence Builder
-- ─────────────────────────────────────────────────────────────
INSERT INTO public.greenleaf_missions (grade_id, type, order_index, title, content)
SELECT id, 'words_explorer', 1, 'Words Explorer: City Life', '{
  "topic": "City Life",
  "words": [
    {"word": "downtown", "imageUrl": "/images/teens/downtown.png"},
    {"word": "public transport", "imageUrl": "/images/teens/public-transport.png"},
    {"word": "traffic congestion", "imageUrl": "/images/teens/traffic-congestion.png"},
    {"word": "rush hour", "imageUrl": "/images/teens/rush-hour.png"},
    {"word": "concrete jungle", "imageUrl": "/images/teens/concrete-jungle.png"}
  ]
}'::jsonb
FROM public.greenleaf_grades WHERE code = 'teens'
ON CONFLICT (grade_id, order_index) DO NOTHING;

INSERT INTO public.greenleaf_missions (grade_id, type, order_index, title, content)
SELECT id, 'phonics', 2, 'Sentence Builder', '{
  "lines": [
    "Living in a downtown isn'"'"'t always easy.",
    "First, the living cost is very high.",
    "Second, there is usually traffic congestion in rush hour.",
    "Moreover, much of the urban landscape is turned into concrete jungle.",
    "These drawbacks make the city life less appealing nowadays."
  ]
}'::jsonb
FROM public.greenleaf_grades WHERE code = 'teens'
ON CONFLICT (grade_id, order_index) DO NOTHING;

INSERT INTO public.greenleaf_missions (grade_id, type, order_index, title, content)
SELECT id, 'speaking_challenge', 3, 'Speaking Challenge', '{
  "prompt": "Talk about the disadvantages of the city life.",
  "script": "Living in a downtown isn'"'"'t always easy. First, the living cost is very high. Second, there is usually traffic congestion in rush hour. Moreover, much of the urban landscape is turned into concrete jungle. These drawbacks make the city life less appealing nowadays."
}'::jsonb
FROM public.greenleaf_grades WHERE code = 'teens'
ON CONFLICT (grade_id, order_index) DO NOTHING;
