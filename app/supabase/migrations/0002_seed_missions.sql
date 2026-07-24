-- Seed nội dung Mission 1-3 cho 4 cấp độ, đúng nguyên văn Phụ lục MVP 2 - Nội dung 4 cấp độ Demo.
-- Dùng dollar-quoting ($json$...$json$) thay vì '...' cho JSON literal để không phải escape
-- dấu nháy đơn trong câu tiếng Anh (VD "isn't") — tránh lỗi khi paste qua SQL editor.

-- ─────────────────────────────────────────────────────────────
-- Kindergarten — Animals / Phonics /a/
-- ─────────────────────────────────────────────────────────────
INSERT INTO public.greenleaf_missions (grade_id, type, order_index, title, content)
SELECT id, 'words_explorer', 1, 'Words Explorer: Animals', $json${
  "topic": "Animals",
  "words": [
    {"word": "cat", "imageUrl": "/images/kindergarten/cat.png"},
    {"word": "dog", "imageUrl": "/images/kindergarten/dog.png"},
    {"word": "bird", "imageUrl": "/images/kindergarten/bird.png"},
    {"word": "rat", "imageUrl": "/images/kindergarten/rat.png"},
    {"word": "lizard", "imageUrl": "/images/kindergarten/lizard.png"}
  ]
}$json$::jsonb
FROM public.greenleaf_grades WHERE code = 'kindergarten'
ON CONFLICT (grade_id, order_index) DO NOTHING;

INSERT INTO public.greenleaf_missions (grade_id, type, order_index, title, content)
SELECT id, 'phonics', 2, 'Phonics /a/', $json${
  "highlight": "a",
  "lines": ["Pat has a cat", "The cat has a hat", "Pat taps the cat", "Ha ha ha (laugh)"]
}$json$::jsonb
FROM public.greenleaf_grades WHERE code = 'kindergarten'
ON CONFLICT (grade_id, order_index) DO NOTHING;

INSERT INTO public.greenleaf_missions (grade_id, type, order_index, title, content)
SELECT id, 'speaking_challenge', 3, 'Speaking Challenge', $json${
  "script": "Pat has a cat. The cat has a hat. Pat taps the cat. Ha ha ha!"
}$json$::jsonb
FROM public.greenleaf_grades WHERE code = 'kindergarten'
ON CONFLICT (grade_id, order_index) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- Kids 1 — Toys / Phonics i_e /ai/
-- ─────────────────────────────────────────────────────────────
INSERT INTO public.greenleaf_missions (grade_id, type, order_index, title, content)
SELECT id, 'words_explorer', 1, 'Words Explorer: Toys', $json${
  "topic": "Toys",
  "words": [
    {"word": "car", "imageUrl": "/images/kids1/car.png"},
    {"word": "train", "imageUrl": "/images/kids1/train.png"},
    {"word": "robot", "imageUrl": "/images/kids1/robot.png"},
    {"word": "bike", "imageUrl": "/images/kids1/bike.png"},
    {"word": "kite", "imageUrl": "/images/kids1/kite.png"}
  ]
}$json$::jsonb
FROM public.greenleaf_grades WHERE code = 'kids1'
ON CONFLICT (grade_id, order_index) DO NOTHING;

INSERT INTO public.greenleaf_missions (grade_id, type, order_index, title, content)
SELECT id, 'phonics', 2, 'Phonics i_e /ai/', $json${
  "highlight": "i_e",
  "lines": ["Fly, fly, kite!", "Ride, ride, bike!", "Smile, smile, smile!", "What a happy sight!"]
}$json$::jsonb
FROM public.greenleaf_grades WHERE code = 'kids1'
ON CONFLICT (grade_id, order_index) DO NOTHING;

INSERT INTO public.greenleaf_missions (grade_id, type, order_index, title, content)
SELECT id, 'speaking_challenge', 3, 'Speaking Challenge', $json${
  "script": "Fly, fly, kite! Ride, ride, bike! Smile, smile, smile! What a happy sight!"
}$json$::jsonb
FROM public.greenleaf_grades WHERE code = 'kids1'
ON CONFLICT (grade_id, order_index) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- Kids 2 — Places / Phonics /a/
-- ─────────────────────────────────────────────────────────────
INSERT INTO public.greenleaf_missions (grade_id, type, order_index, title, content)
SELECT id, 'words_explorer', 1, 'Words Explorer: Places', $json${
  "topic": "Places",
  "words": [
    {"word": "cinema", "imageUrl": "/images/kids2/cinema.png"},
    {"word": "post office", "imageUrl": "/images/kids2/post-office.png"},
    {"word": "supermarket", "imageUrl": "/images/kids2/supermarket.png"},
    {"word": "police station", "imageUrl": "/images/kids2/police-station.png"},
    {"word": "swimming pool", "imageUrl": "/images/kids2/swimming-pool.png"}
  ]
}$json$::jsonb
FROM public.greenleaf_grades WHERE code = 'kids2'
ON CONFLICT (grade_id, order_index) DO NOTHING;

INSERT INTO public.greenleaf_missions (grade_id, type, order_index, title, content)
SELECT id, 'phonics', 2, 'Phonics /a/', $json${
  "highlight": "a",
  "lines": ["Post office, post office, post my letter.", "Police station, keep us better.", "Supermarket, buy some pears.", "Swimming pool, see you there!"]
}$json$::jsonb
FROM public.greenleaf_grades WHERE code = 'kids2'
ON CONFLICT (grade_id, order_index) DO NOTHING;

INSERT INTO public.greenleaf_missions (grade_id, type, order_index, title, content)
SELECT id, 'speaking_challenge', 3, 'Speaking Challenge', $json${
  "script": "Post office, post office, post my letter. Police station, keep us better. Supermarket, buy some pears. Swimming pool, see you there!"
}$json$::jsonb
FROM public.greenleaf_grades WHERE code = 'kids2'
ON CONFLICT (grade_id, order_index) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- Teens — City Life / Sentence Builder
-- ─────────────────────────────────────────────────────────────
INSERT INTO public.greenleaf_missions (grade_id, type, order_index, title, content)
SELECT id, 'words_explorer', 1, 'Words Explorer: City Life', $json${
  "topic": "City Life",
  "words": [
    {"word": "downtown", "imageUrl": "/images/teens/downtown.png"},
    {"word": "public transport", "imageUrl": "/images/teens/public-transport.png"},
    {"word": "traffic congestion", "imageUrl": "/images/teens/traffic-congestion.png"},
    {"word": "rush hour", "imageUrl": "/images/teens/rush-hour.png"},
    {"word": "concrete jungle", "imageUrl": "/images/teens/concrete-jungle.png"}
  ]
}$json$::jsonb
FROM public.greenleaf_grades WHERE code = 'teens'
ON CONFLICT (grade_id, order_index) DO NOTHING;

INSERT INTO public.greenleaf_missions (grade_id, type, order_index, title, content)
SELECT id, 'phonics', 2, 'Sentence Builder', $json${
  "lines": [
    "Living in a downtown isn't always easy.",
    "First, the living cost is very high.",
    "Second, there is usually traffic congestion in rush hour.",
    "Moreover, much of the urban landscape is turned into concrete jungle.",
    "These drawbacks make the city life less appealing nowadays."
  ]
}$json$::jsonb
FROM public.greenleaf_grades WHERE code = 'teens'
ON CONFLICT (grade_id, order_index) DO NOTHING;

INSERT INTO public.greenleaf_missions (grade_id, type, order_index, title, content)
SELECT id, 'speaking_challenge', 3, 'Speaking Challenge', $json${
  "prompt": "Talk about the disadvantages of the city life.",
  "script": "Living in a downtown isn't always easy. First, the living cost is very high. Second, there is usually traffic congestion in rush hour. Moreover, much of the urban landscape is turned into concrete jungle. These drawbacks make the city life less appealing nowadays."
}$json$::jsonb
FROM public.greenleaf_grades WHERE code = 'teens'
ON CONFLICT (grade_id, order_index) DO NOTHING;
