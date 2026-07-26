-- Thêm 10 bài học (Lesson) mới cho mỗi cấp độ, ngoài bài "Demo" có sẵn.
-- Mỗi Lesson vẫn giữ đúng cấu trúc 3 Mission cố định: Words Explorer, Phonics/Sentence
-- Builder, Speaking Challenge — đúng model đã có từ 0004_lessons.sql.
--
-- Idempotent: mỗi Lesson chỉ được tạo nếu chưa có Lesson cùng tên trong Grade đó (NOT EXISTS),
-- nên chạy lại migration này nhiều lần không bị tạo trùng.

-- ═════════════════════════════════════════════════════════════
-- KINDERGARTEN — 10 bài học mới
-- ═════════════════════════════════════════════════════════════

WITH new_lesson AS (
  INSERT INTO public.greenleaf_lessons (grade_id, title, order_index)
  SELECT g.id, 'Colors', 2 FROM public.greenleaf_grades g
  WHERE g.code = 'kindergarten'
    AND NOT EXISTS (SELECT 1 FROM public.greenleaf_lessons l WHERE l.grade_id = g.id AND l.title = 'Colors')
  RETURNING id
)
INSERT INTO public.greenleaf_missions (lesson_id, type, order_index, title, content)
SELECT id, 'words_explorer', 1, 'Words Explorer: Colors', $json${
  "topic": "Colors",
  "words": [
    {"word": "red", "imageUrl": ""},
    {"word": "blue", "imageUrl": ""},
    {"word": "yellow", "imageUrl": ""},
    {"word": "green", "imageUrl": ""},
    {"word": "pink", "imageUrl": ""}
  ]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'phonics', 2, 'Sentence Practice: Colors', $json${
  "lines": ["Red is my hat.", "Blue is the sky.", "Yellow is the sun.", "Green is the grass."]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'speaking_challenge', 3, 'Speaking Challenge', $json${
  "script": "Red is my hat. Blue is the sky. Yellow is the sun. Green is the grass."
}$json$::jsonb FROM new_lesson;

WITH new_lesson AS (
  INSERT INTO public.greenleaf_lessons (grade_id, title, order_index)
  SELECT g.id, 'Family', 3 FROM public.greenleaf_grades g
  WHERE g.code = 'kindergarten'
    AND NOT EXISTS (SELECT 1 FROM public.greenleaf_lessons l WHERE l.grade_id = g.id AND l.title = 'Family')
  RETURNING id
)
INSERT INTO public.greenleaf_missions (lesson_id, type, order_index, title, content)
SELECT id, 'words_explorer', 1, 'Words Explorer: Family', $json${
  "topic": "Family",
  "words": [
    {"word": "mom", "imageUrl": ""},
    {"word": "dad", "imageUrl": ""},
    {"word": "sister", "imageUrl": ""},
    {"word": "brother", "imageUrl": ""},
    {"word": "baby", "imageUrl": ""}
  ]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'phonics', 2, 'Sentence Practice: Family', $json${
  "lines": ["I love my mom.", "I love my dad.", "I have a sister.", "I have a brother."]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'speaking_challenge', 3, 'Speaking Challenge', $json${
  "script": "I love my mom. I love my dad. I have a sister. I have a brother."
}$json$::jsonb FROM new_lesson;

WITH new_lesson AS (
  INSERT INTO public.greenleaf_lessons (grade_id, title, order_index)
  SELECT g.id, 'Food', 4 FROM public.greenleaf_grades g
  WHERE g.code = 'kindergarten'
    AND NOT EXISTS (SELECT 1 FROM public.greenleaf_lessons l WHERE l.grade_id = g.id AND l.title = 'Food')
  RETURNING id
)
INSERT INTO public.greenleaf_missions (lesson_id, type, order_index, title, content)
SELECT id, 'words_explorer', 1, 'Words Explorer: Food', $json${
  "topic": "Food",
  "words": [
    {"word": "apple", "imageUrl": ""},
    {"word": "banana", "imageUrl": ""},
    {"word": "milk", "imageUrl": ""},
    {"word": "egg", "imageUrl": ""},
    {"word": "bread", "imageUrl": ""}
  ]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'phonics', 2, 'Sentence Practice: Food', $json${
  "lines": ["I eat an apple.", "I eat a banana.", "I drink milk.", "I eat bread."]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'speaking_challenge', 3, 'Speaking Challenge', $json${
  "script": "I eat an apple. I eat a banana. I drink milk. I eat bread."
}$json$::jsonb FROM new_lesson;

WITH new_lesson AS (
  INSERT INTO public.greenleaf_lessons (grade_id, title, order_index)
  SELECT g.id, 'Body Parts', 5 FROM public.greenleaf_grades g
  WHERE g.code = 'kindergarten'
    AND NOT EXISTS (SELECT 1 FROM public.greenleaf_lessons l WHERE l.grade_id = g.id AND l.title = 'Body Parts')
  RETURNING id
)
INSERT INTO public.greenleaf_missions (lesson_id, type, order_index, title, content)
SELECT id, 'words_explorer', 1, 'Words Explorer: Body Parts', $json${
  "topic": "Body Parts",
  "words": [
    {"word": "head", "imageUrl": ""},
    {"word": "hand", "imageUrl": ""},
    {"word": "foot", "imageUrl": ""},
    {"word": "eye", "imageUrl": ""},
    {"word": "nose", "imageUrl": ""}
  ]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'phonics', 2, 'Phonics /h/', $json${
  "highlight": "h",
  "lines": ["Touch your head.", "Touch your hand.", "Touch your foot.", "Touch your nose."]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'speaking_challenge', 3, 'Speaking Challenge', $json${
  "script": "Touch your head. Touch your hand. Touch your foot. Touch your nose."
}$json$::jsonb FROM new_lesson;

WITH new_lesson AS (
  INSERT INTO public.greenleaf_lessons (grade_id, title, order_index)
  SELECT g.id, 'Numbers', 6 FROM public.greenleaf_grades g
  WHERE g.code = 'kindergarten'
    AND NOT EXISTS (SELECT 1 FROM public.greenleaf_lessons l WHERE l.grade_id = g.id AND l.title = 'Numbers')
  RETURNING id
)
INSERT INTO public.greenleaf_missions (lesson_id, type, order_index, title, content)
SELECT id, 'words_explorer', 1, 'Words Explorer: Numbers', $json${
  "topic": "Numbers",
  "words": [
    {"word": "one", "imageUrl": ""},
    {"word": "two", "imageUrl": ""},
    {"word": "three", "imageUrl": ""},
    {"word": "four", "imageUrl": ""},
    {"word": "five", "imageUrl": ""}
  ]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'phonics', 2, 'Sentence Practice: Numbers', $json${
  "lines": ["One, two, three!", "Three little bees.", "Four and five.", "High five!"]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'speaking_challenge', 3, 'Speaking Challenge', $json${
  "script": "One, two, three! Three little bees. Four and five. High five!"
}$json$::jsonb FROM new_lesson;

WITH new_lesson AS (
  INSERT INTO public.greenleaf_lessons (grade_id, title, order_index)
  SELECT g.id, 'Shapes', 7 FROM public.greenleaf_grades g
  WHERE g.code = 'kindergarten'
    AND NOT EXISTS (SELECT 1 FROM public.greenleaf_lessons l WHERE l.grade_id = g.id AND l.title = 'Shapes')
  RETURNING id
)
INSERT INTO public.greenleaf_missions (lesson_id, type, order_index, title, content)
SELECT id, 'words_explorer', 1, 'Words Explorer: Shapes', $json${
  "topic": "Shapes",
  "words": [
    {"word": "circle", "imageUrl": ""},
    {"word": "square", "imageUrl": ""},
    {"word": "triangle", "imageUrl": ""},
    {"word": "star", "imageUrl": ""},
    {"word": "heart", "imageUrl": ""}
  ]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'phonics', 2, 'Sentence Practice: Shapes', $json${
  "lines": ["This is a circle.", "This is a square.", "This is a triangle.", "This is a star."]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'speaking_challenge', 3, 'Speaking Challenge', $json${
  "script": "This is a circle. This is a square. This is a triangle. This is a star."
}$json$::jsonb FROM new_lesson;

WITH new_lesson AS (
  INSERT INTO public.greenleaf_lessons (grade_id, title, order_index)
  SELECT g.id, 'Weather', 8 FROM public.greenleaf_grades g
  WHERE g.code = 'kindergarten'
    AND NOT EXISTS (SELECT 1 FROM public.greenleaf_lessons l WHERE l.grade_id = g.id AND l.title = 'Weather')
  RETURNING id
)
INSERT INTO public.greenleaf_missions (lesson_id, type, order_index, title, content)
SELECT id, 'words_explorer', 1, 'Words Explorer: Weather', $json${
  "topic": "Weather",
  "words": [
    {"word": "sun", "imageUrl": ""},
    {"word": "rain", "imageUrl": ""},
    {"word": "cloud", "imageUrl": ""},
    {"word": "wind", "imageUrl": ""},
    {"word": "snow", "imageUrl": ""}
  ]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'phonics', 2, 'Sentence Practice: Weather', $json${
  "lines": ["The sun is bright.", "The rain falls down.", "The cloud is white.", "The wind blows around."]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'speaking_challenge', 3, 'Speaking Challenge', $json${
  "script": "The sun is bright. The rain falls down. The cloud is white. The wind blows around."
}$json$::jsonb FROM new_lesson;

WITH new_lesson AS (
  INSERT INTO public.greenleaf_lessons (grade_id, title, order_index)
  SELECT g.id, 'Clothes', 9 FROM public.greenleaf_grades g
  WHERE g.code = 'kindergarten'
    AND NOT EXISTS (SELECT 1 FROM public.greenleaf_lessons l WHERE l.grade_id = g.id AND l.title = 'Clothes')
  RETURNING id
)
INSERT INTO public.greenleaf_missions (lesson_id, type, order_index, title, content)
SELECT id, 'words_explorer', 1, 'Words Explorer: Clothes', $json${
  "topic": "Clothes",
  "words": [
    {"word": "hat", "imageUrl": ""},
    {"word": "shoes", "imageUrl": ""},
    {"word": "socks", "imageUrl": ""},
    {"word": "dress", "imageUrl": ""},
    {"word": "coat", "imageUrl": ""}
  ]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'phonics', 2, 'Sentence Practice: Clothes', $json${
  "lines": ["I wear a hat.", "I wear shoes.", "I wear socks.", "I wear a coat."]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'speaking_challenge', 3, 'Speaking Challenge', $json${
  "script": "I wear a hat. I wear shoes. I wear socks. I wear a coat."
}$json$::jsonb FROM new_lesson;

WITH new_lesson AS (
  INSERT INTO public.greenleaf_lessons (grade_id, title, order_index)
  SELECT g.id, 'Farm Animals', 10 FROM public.greenleaf_grades g
  WHERE g.code = 'kindergarten'
    AND NOT EXISTS (SELECT 1 FROM public.greenleaf_lessons l WHERE l.grade_id = g.id AND l.title = 'Farm Animals')
  RETURNING id
)
INSERT INTO public.greenleaf_missions (lesson_id, type, order_index, title, content)
SELECT id, 'words_explorer', 1, 'Words Explorer: Farm Animals', $json${
  "topic": "Farm Animals",
  "words": [
    {"word": "cow", "imageUrl": ""},
    {"word": "pig", "imageUrl": ""},
    {"word": "hen", "imageUrl": ""},
    {"word": "duck", "imageUrl": ""},
    {"word": "sheep", "imageUrl": ""}
  ]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'phonics', 2, 'Sentence Practice: Farm Animals', $json${
  "lines": ["The cow says moo.", "The pig says oink.", "The hen says cluck.", "The duck says quack."]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'speaking_challenge', 3, 'Speaking Challenge', $json${
  "script": "The cow says moo. The pig says oink. The hen says cluck. The duck says quack."
}$json$::jsonb FROM new_lesson;

WITH new_lesson AS (
  INSERT INTO public.greenleaf_lessons (grade_id, title, order_index)
  SELECT g.id, 'Fruits', 11 FROM public.greenleaf_grades g
  WHERE g.code = 'kindergarten'
    AND NOT EXISTS (SELECT 1 FROM public.greenleaf_lessons l WHERE l.grade_id = g.id AND l.title = 'Fruits')
  RETURNING id
)
INSERT INTO public.greenleaf_missions (lesson_id, type, order_index, title, content)
SELECT id, 'words_explorer', 1, 'Words Explorer: Fruits', $json${
  "topic": "Fruits",
  "words": [
    {"word": "orange", "imageUrl": ""},
    {"word": "grape", "imageUrl": ""},
    {"word": "mango", "imageUrl": ""},
    {"word": "pear", "imageUrl": ""},
    {"word": "lemon", "imageUrl": ""}
  ]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'phonics', 2, 'Sentence Practice: Fruits', $json${
  "lines": ["I like oranges.", "I like grapes.", "I like mangoes.", "I like pears."]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'speaking_challenge', 3, 'Speaking Challenge', $json${
  "script": "I like oranges. I like grapes. I like mangoes. I like pears."
}$json$::jsonb FROM new_lesson;

-- ═════════════════════════════════════════════════════════════
-- KIDS 1 — 10 bài học mới
-- ═════════════════════════════════════════════════════════════

WITH new_lesson AS (
  INSERT INTO public.greenleaf_lessons (grade_id, title, order_index)
  SELECT g.id, 'School Things', 2 FROM public.greenleaf_grades g
  WHERE g.code = 'kids1'
    AND NOT EXISTS (SELECT 1 FROM public.greenleaf_lessons l WHERE l.grade_id = g.id AND l.title = 'School Things')
  RETURNING id
)
INSERT INTO public.greenleaf_missions (lesson_id, type, order_index, title, content)
SELECT id, 'words_explorer', 1, 'Words Explorer: School Things', $json${
  "topic": "School Things",
  "words": [
    {"word": "book", "imageUrl": ""},
    {"word": "pen", "imageUrl": ""},
    {"word": "bag", "imageUrl": ""},
    {"word": "ruler", "imageUrl": ""},
    {"word": "eraser", "imageUrl": ""}
  ]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'phonics', 2, 'Sentence Practice: School Things', $json${
  "lines": ["Open your book.", "Take your pen.", "Pack your bag.", "Use your ruler."]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'speaking_challenge', 3, 'Speaking Challenge', $json${
  "script": "Open your book. Take your pen. Pack your bag. Use your ruler."
}$json$::jsonb FROM new_lesson;

WITH new_lesson AS (
  INSERT INTO public.greenleaf_lessons (grade_id, title, order_index)
  SELECT g.id, 'Sports', 3 FROM public.greenleaf_grades g
  WHERE g.code = 'kids1'
    AND NOT EXISTS (SELECT 1 FROM public.greenleaf_lessons l WHERE l.grade_id = g.id AND l.title = 'Sports')
  RETURNING id
)
INSERT INTO public.greenleaf_missions (lesson_id, type, order_index, title, content)
SELECT id, 'words_explorer', 1, 'Words Explorer: Sports', $json${
  "topic": "Sports",
  "words": [
    {"word": "football", "imageUrl": ""},
    {"word": "swimming", "imageUrl": ""},
    {"word": "running", "imageUrl": ""},
    {"word": "jumping", "imageUrl": ""},
    {"word": "tennis", "imageUrl": ""}
  ]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'phonics', 2, 'Sentence Practice: Sports', $json${
  "lines": ["I like football.", "I like swimming.", "I like running.", "I like tennis."]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'speaking_challenge', 3, 'Speaking Challenge', $json${
  "script": "I like football. I like swimming. I like running. I like tennis."
}$json$::jsonb FROM new_lesson;

WITH new_lesson AS (
  INSERT INTO public.greenleaf_lessons (grade_id, title, order_index)
  SELECT g.id, 'Jobs', 4 FROM public.greenleaf_grades g
  WHERE g.code = 'kids1'
    AND NOT EXISTS (SELECT 1 FROM public.greenleaf_lessons l WHERE l.grade_id = g.id AND l.title = 'Jobs')
  RETURNING id
)
INSERT INTO public.greenleaf_missions (lesson_id, type, order_index, title, content)
SELECT id, 'words_explorer', 1, 'Words Explorer: Jobs', $json${
  "topic": "Jobs",
  "words": [
    {"word": "doctor", "imageUrl": ""},
    {"word": "teacher", "imageUrl": ""},
    {"word": "farmer", "imageUrl": ""},
    {"word": "driver", "imageUrl": ""},
    {"word": "chef", "imageUrl": ""}
  ]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'phonics', 2, 'Sentence Practice: Jobs', $json${
  "lines": ["The doctor helps us.", "The teacher teaches us.", "The farmer grows food.", "The chef cooks food."]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'speaking_challenge', 3, 'Speaking Challenge', $json${
  "script": "The doctor helps us. The teacher teaches us. The farmer grows food. The chef cooks food."
}$json$::jsonb FROM new_lesson;

WITH new_lesson AS (
  INSERT INTO public.greenleaf_lessons (grade_id, title, order_index)
  SELECT g.id, 'Pets', 5 FROM public.greenleaf_grades g
  WHERE g.code = 'kids1'
    AND NOT EXISTS (SELECT 1 FROM public.greenleaf_lessons l WHERE l.grade_id = g.id AND l.title = 'Pets')
  RETURNING id
)
INSERT INTO public.greenleaf_missions (lesson_id, type, order_index, title, content)
SELECT id, 'words_explorer', 1, 'Words Explorer: Pets', $json${
  "topic": "Pets",
  "words": [
    {"word": "dog", "imageUrl": ""},
    {"word": "cat", "imageUrl": ""},
    {"word": "fish", "imageUrl": ""},
    {"word": "rabbit", "imageUrl": ""},
    {"word": "hamster", "imageUrl": ""}
  ]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'phonics', 2, 'Sentence Practice: Pets', $json${
  "lines": ["My dog can run.", "My cat can jump.", "My fish can swim.", "My rabbit can hop."]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'speaking_challenge', 3, 'Speaking Challenge', $json${
  "script": "My dog can run. My cat can jump. My fish can swim. My rabbit can hop."
}$json$::jsonb FROM new_lesson;

WITH new_lesson AS (
  INSERT INTO public.greenleaf_lessons (grade_id, title, order_index)
  SELECT g.id, 'Rooms in a House', 6 FROM public.greenleaf_grades g
  WHERE g.code = 'kids1'
    AND NOT EXISTS (SELECT 1 FROM public.greenleaf_lessons l WHERE l.grade_id = g.id AND l.title = 'Rooms in a House')
  RETURNING id
)
INSERT INTO public.greenleaf_missions (lesson_id, type, order_index, title, content)
SELECT id, 'words_explorer', 1, 'Words Explorer: Rooms in a House', $json${
  "topic": "Rooms in a House",
  "words": [
    {"word": "kitchen", "imageUrl": ""},
    {"word": "bedroom", "imageUrl": ""},
    {"word": "bathroom", "imageUrl": ""},
    {"word": "living room", "imageUrl": ""},
    {"word": "garden", "imageUrl": ""}
  ]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'phonics', 2, 'Sentence Practice: Rooms in a House', $json${
  "lines": ["I cook in the kitchen.", "I sleep in the bedroom.", "I wash in the bathroom.", "I play in the garden."]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'speaking_challenge', 3, 'Speaking Challenge', $json${
  "script": "I cook in the kitchen. I sleep in the bedroom. I wash in the bathroom. I play in the garden."
}$json$::jsonb FROM new_lesson;

WITH new_lesson AS (
  INSERT INTO public.greenleaf_lessons (grade_id, title, order_index)
  SELECT g.id, 'Days of the Week', 7 FROM public.greenleaf_grades g
  WHERE g.code = 'kids1'
    AND NOT EXISTS (SELECT 1 FROM public.greenleaf_lessons l WHERE l.grade_id = g.id AND l.title = 'Days of the Week')
  RETURNING id
)
INSERT INTO public.greenleaf_missions (lesson_id, type, order_index, title, content)
SELECT id, 'words_explorer', 1, 'Words Explorer: Days of the Week', $json${
  "topic": "Days of the Week",
  "words": [
    {"word": "Monday", "imageUrl": ""},
    {"word": "Tuesday", "imageUrl": ""},
    {"word": "Wednesday", "imageUrl": ""},
    {"word": "Thursday", "imageUrl": ""},
    {"word": "Friday", "imageUrl": ""}
  ]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'phonics', 2, 'Sentence Practice: Days of the Week', $json${
  "lines": ["Monday, Tuesday, Wednesday too.", "Thursday, Friday, how about you?", "Five days of school,", "Then the weekend, that's the rule!"]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'speaking_challenge', 3, 'Speaking Challenge', $json${
  "script": "Monday, Tuesday, Wednesday too. Thursday, Friday, how about you? Five days of school, then the weekend, that's the rule!"
}$json$::jsonb FROM new_lesson;

WITH new_lesson AS (
  INSERT INTO public.greenleaf_lessons (grade_id, title, order_index)
  SELECT g.id, 'Seasons', 8 FROM public.greenleaf_grades g
  WHERE g.code = 'kids1'
    AND NOT EXISTS (SELECT 1 FROM public.greenleaf_lessons l WHERE l.grade_id = g.id AND l.title = 'Seasons')
  RETURNING id
)
INSERT INTO public.greenleaf_missions (lesson_id, type, order_index, title, content)
SELECT id, 'words_explorer', 1, 'Words Explorer: Seasons', $json${
  "topic": "Seasons",
  "words": [
    {"word": "spring", "imageUrl": ""},
    {"word": "summer", "imageUrl": ""},
    {"word": "autumn", "imageUrl": ""},
    {"word": "winter", "imageUrl": ""},
    {"word": "weather", "imageUrl": ""}
  ]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'phonics', 2, 'Sentence Practice: Seasons', $json${
  "lines": ["Spring is green and new.", "Summer is hot and sunny.", "Autumn leaves fall down.", "Winter is cold and snowy."]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'speaking_challenge', 3, 'Speaking Challenge', $json${
  "script": "Spring is green and new. Summer is hot and sunny. Autumn leaves fall down. Winter is cold and snowy."
}$json$::jsonb FROM new_lesson;

WITH new_lesson AS (
  INSERT INTO public.greenleaf_lessons (grade_id, title, order_index)
  SELECT g.id, 'Transport', 9 FROM public.greenleaf_grades g
  WHERE g.code = 'kids1'
    AND NOT EXISTS (SELECT 1 FROM public.greenleaf_lessons l WHERE l.grade_id = g.id AND l.title = 'Transport')
  RETURNING id
)
INSERT INTO public.greenleaf_missions (lesson_id, type, order_index, title, content)
SELECT id, 'words_explorer', 1, 'Words Explorer: Transport', $json${
  "topic": "Transport",
  "words": [
    {"word": "bus", "imageUrl": ""},
    {"word": "car", "imageUrl": ""},
    {"word": "bike", "imageUrl": ""},
    {"word": "boat", "imageUrl": ""},
    {"word": "plane", "imageUrl": ""}
  ]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'phonics', 2, 'Sentence Practice: Transport', $json${
  "lines": ["I go by bus.", "I go by car.", "I ride my bike.", "I fly on a plane."]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'speaking_challenge', 3, 'Speaking Challenge', $json${
  "script": "I go by bus. I go by car. I ride my bike. I fly on a plane."
}$json$::jsonb FROM new_lesson;

WITH new_lesson AS (
  INSERT INTO public.greenleaf_lessons (grade_id, title, order_index)
  SELECT g.id, 'Feelings', 10 FROM public.greenleaf_grades g
  WHERE g.code = 'kids1'
    AND NOT EXISTS (SELECT 1 FROM public.greenleaf_lessons l WHERE l.grade_id = g.id AND l.title = 'Feelings')
  RETURNING id
)
INSERT INTO public.greenleaf_missions (lesson_id, type, order_index, title, content)
SELECT id, 'words_explorer', 1, 'Words Explorer: Feelings', $json${
  "topic": "Feelings",
  "words": [
    {"word": "happy", "imageUrl": ""},
    {"word": "sad", "imageUrl": ""},
    {"word": "angry", "imageUrl": ""},
    {"word": "tired", "imageUrl": ""},
    {"word": "excited", "imageUrl": ""}
  ]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'phonics', 2, 'Sentence Practice: Feelings', $json${
  "lines": ["I feel happy today.", "Sometimes I feel sad.", "Please don't be angry.", "I am so excited!"]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'speaking_challenge', 3, 'Speaking Challenge', $json${
  "script": "I feel happy today. Sometimes I feel sad. Please don't be angry. I am so excited!"
}$json$::jsonb FROM new_lesson;

WITH new_lesson AS (
  INSERT INTO public.greenleaf_lessons (grade_id, title, order_index)
  SELECT g.id, 'Fruits and Vegetables', 11 FROM public.greenleaf_grades g
  WHERE g.code = 'kids1'
    AND NOT EXISTS (SELECT 1 FROM public.greenleaf_lessons l WHERE l.grade_id = g.id AND l.title = 'Fruits and Vegetables')
  RETURNING id
)
INSERT INTO public.greenleaf_missions (lesson_id, type, order_index, title, content)
SELECT id, 'words_explorer', 1, 'Words Explorer: Fruits and Vegetables', $json${
  "topic": "Fruits and Vegetables",
  "words": [
    {"word": "carrot", "imageUrl": ""},
    {"word": "potato", "imageUrl": ""},
    {"word": "tomato", "imageUrl": ""},
    {"word": "cucumber", "imageUrl": ""},
    {"word": "corn", "imageUrl": ""}
  ]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'phonics', 2, 'Sentence Practice: Fruits and Vegetables', $json${
  "lines": ["Carrots are orange.", "Potatoes are brown.", "Tomatoes are red.", "Corn is yellow."]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'speaking_challenge', 3, 'Speaking Challenge', $json${
  "script": "Carrots are orange. Potatoes are brown. Tomatoes are red. Corn is yellow."
}$json$::jsonb FROM new_lesson;

-- ═════════════════════════════════════════════════════════════
-- KIDS 2 — 10 bài học mới
-- ═════════════════════════════════════════════════════════════

WITH new_lesson AS (
  INSERT INTO public.greenleaf_lessons (grade_id, title, order_index)
  SELECT g.id, 'Free Time Activities', 2 FROM public.greenleaf_grades g
  WHERE g.code = 'kids2'
    AND NOT EXISTS (SELECT 1 FROM public.greenleaf_lessons l WHERE l.grade_id = g.id AND l.title = 'Free Time Activities')
  RETURNING id
)
INSERT INTO public.greenleaf_missions (lesson_id, type, order_index, title, content)
SELECT id, 'words_explorer', 1, 'Words Explorer: Free Time Activities', $json${
  "topic": "Free Time Activities",
  "words": [
    {"word": "reading", "imageUrl": ""},
    {"word": "painting", "imageUrl": ""},
    {"word": "cycling", "imageUrl": ""},
    {"word": "dancing", "imageUrl": ""},
    {"word": "gaming", "imageUrl": ""}
  ]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'phonics', 2, 'Sentence Practice: Free Time Activities', $json${
  "lines": ["I enjoy reading books.", "I enjoy painting pictures.", "I enjoy cycling outside.", "I enjoy dancing to music."]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'speaking_challenge', 3, 'Speaking Challenge', $json${
  "script": "I enjoy reading books. I enjoy painting pictures. I enjoy cycling outside. I enjoy dancing to music."
}$json$::jsonb FROM new_lesson;

WITH new_lesson AS (
  INSERT INTO public.greenleaf_lessons (grade_id, title, order_index)
  SELECT g.id, 'School Subjects', 3 FROM public.greenleaf_grades g
  WHERE g.code = 'kids2'
    AND NOT EXISTS (SELECT 1 FROM public.greenleaf_lessons l WHERE l.grade_id = g.id AND l.title = 'School Subjects')
  RETURNING id
)
INSERT INTO public.greenleaf_missions (lesson_id, type, order_index, title, content)
SELECT id, 'words_explorer', 1, 'Words Explorer: School Subjects', $json${
  "topic": "School Subjects",
  "words": [
    {"word": "Math", "imageUrl": ""},
    {"word": "Science", "imageUrl": ""},
    {"word": "Art", "imageUrl": ""},
    {"word": "Music", "imageUrl": ""},
    {"word": "History", "imageUrl": ""}
  ]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'phonics', 2, 'Sentence Practice: School Subjects', $json${
  "lines": ["I study Math every day.", "I study Science at school.", "I love Art class.", "I love Music class."]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'speaking_challenge', 3, 'Speaking Challenge', $json${
  "script": "I study Math every day. I study Science at school. I love Art class. I love Music class."
}$json$::jsonb FROM new_lesson;

WITH new_lesson AS (
  INSERT INTO public.greenleaf_lessons (grade_id, title, order_index)
  SELECT g.id, 'Nature', 4 FROM public.greenleaf_grades g
  WHERE g.code = 'kids2'
    AND NOT EXISTS (SELECT 1 FROM public.greenleaf_lessons l WHERE l.grade_id = g.id AND l.title = 'Nature')
  RETURNING id
)
INSERT INTO public.greenleaf_missions (lesson_id, type, order_index, title, content)
SELECT id, 'words_explorer', 1, 'Words Explorer: Nature', $json${
  "topic": "Nature",
  "words": [
    {"word": "mountain", "imageUrl": ""},
    {"word": "river", "imageUrl": ""},
    {"word": "forest", "imageUrl": ""},
    {"word": "beach", "imageUrl": ""},
    {"word": "desert", "imageUrl": ""}
  ]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'phonics', 2, 'Sentence Practice: Nature', $json${
  "lines": ["The mountain is very tall.", "The river flows to the sea.", "The forest is full of trees.", "The beach has golden sand."]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'speaking_challenge', 3, 'Speaking Challenge', $json${
  "script": "The mountain is very tall. The river flows to the sea. The forest is full of trees. The beach has golden sand."
}$json$::jsonb FROM new_lesson;

WITH new_lesson AS (
  INSERT INTO public.greenleaf_lessons (grade_id, title, order_index)
  SELECT g.id, 'Health', 5 FROM public.greenleaf_grades g
  WHERE g.code = 'kids2'
    AND NOT EXISTS (SELECT 1 FROM public.greenleaf_lessons l WHERE l.grade_id = g.id AND l.title = 'Health')
  RETURNING id
)
INSERT INTO public.greenleaf_missions (lesson_id, type, order_index, title, content)
SELECT id, 'words_explorer', 1, 'Words Explorer: Health', $json${
  "topic": "Health",
  "words": [
    {"word": "hospital", "imageUrl": ""},
    {"word": "medicine", "imageUrl": ""},
    {"word": "exercise", "imageUrl": ""},
    {"word": "doctor", "imageUrl": ""},
    {"word": "rest", "imageUrl": ""}
  ]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'phonics', 2, 'Sentence Practice: Health', $json${
  "lines": ["Go to the hospital when you are sick.", "Take your medicine on time.", "Exercise keeps you healthy.", "Rest well every night."]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'speaking_challenge', 3, 'Speaking Challenge', $json${
  "script": "Go to the hospital when you are sick. Take your medicine on time. Exercise keeps you healthy. Rest well every night."
}$json$::jsonb FROM new_lesson;

WITH new_lesson AS (
  INSERT INTO public.greenleaf_lessons (grade_id, title, order_index)
  SELECT g.id, 'Technology', 6 FROM public.greenleaf_grades g
  WHERE g.code = 'kids2'
    AND NOT EXISTS (SELECT 1 FROM public.greenleaf_lessons l WHERE l.grade_id = g.id AND l.title = 'Technology')
  RETURNING id
)
INSERT INTO public.greenleaf_missions (lesson_id, type, order_index, title, content)
SELECT id, 'words_explorer', 1, 'Words Explorer: Technology', $json${
  "topic": "Technology",
  "words": [
    {"word": "computer", "imageUrl": ""},
    {"word": "phone", "imageUrl": ""},
    {"word": "internet", "imageUrl": ""},
    {"word": "robot", "imageUrl": ""},
    {"word": "camera", "imageUrl": ""}
  ]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'phonics', 2, 'Sentence Practice: Technology', $json${
  "lines": ["I use a computer for homework.", "I use a phone to call my friends.", "The internet helps us learn.", "Robots can do many jobs."]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'speaking_challenge', 3, 'Speaking Challenge', $json${
  "script": "I use a computer for homework. I use a phone to call my friends. The internet helps us learn. Robots can do many jobs."
}$json$::jsonb FROM new_lesson;

WITH new_lesson AS (
  INSERT INTO public.greenleaf_lessons (grade_id, title, order_index)
  SELECT g.id, 'Festivals', 7 FROM public.greenleaf_grades g
  WHERE g.code = 'kids2'
    AND NOT EXISTS (SELECT 1 FROM public.greenleaf_lessons l WHERE l.grade_id = g.id AND l.title = 'Festivals')
  RETURNING id
)
INSERT INTO public.greenleaf_missions (lesson_id, type, order_index, title, content)
SELECT id, 'words_explorer', 1, 'Words Explorer: Festivals', $json${
  "topic": "Festivals",
  "words": [
    {"word": "Tet", "imageUrl": ""},
    {"word": "Christmas", "imageUrl": ""},
    {"word": "birthday", "imageUrl": ""},
    {"word": "wedding", "imageUrl": ""},
    {"word": "New Year", "imageUrl": ""}
  ]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'phonics', 2, 'Sentence Practice: Festivals', $json${
  "lines": ["Tet is a big festival in Vietnam.", "Christmas is celebrated in December.", "We sing songs on a birthday.", "New Year begins a new start."]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'speaking_challenge', 3, 'Speaking Challenge', $json${
  "script": "Tet is a big festival in Vietnam. Christmas is celebrated in December. We sing songs on a birthday. New Year begins a new start."
}$json$::jsonb FROM new_lesson;

WITH new_lesson AS (
  INSERT INTO public.greenleaf_lessons (grade_id, title, order_index)
  SELECT g.id, 'Zoo Animals', 8 FROM public.greenleaf_grades g
  WHERE g.code = 'kids2'
    AND NOT EXISTS (SELECT 1 FROM public.greenleaf_lessons l WHERE l.grade_id = g.id AND l.title = 'Zoo Animals')
  RETURNING id
)
INSERT INTO public.greenleaf_missions (lesson_id, type, order_index, title, content)
SELECT id, 'words_explorer', 1, 'Words Explorer: Zoo Animals', $json${
  "topic": "Zoo Animals",
  "words": [
    {"word": "lion", "imageUrl": ""},
    {"word": "elephant", "imageUrl": ""},
    {"word": "giraffe", "imageUrl": ""},
    {"word": "monkey", "imageUrl": ""},
    {"word": "tiger", "imageUrl": ""}
  ]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'phonics', 2, 'Sentence Practice: Zoo Animals', $json${
  "lines": ["The lion is the king of the jungle.", "The elephant is very big.", "The giraffe has a long neck.", "The monkey loves to climb."]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'speaking_challenge', 3, 'Speaking Challenge', $json${
  "script": "The lion is the king of the jungle. The elephant is very big. The giraffe has a long neck. The monkey loves to climb."
}$json$::jsonb FROM new_lesson;

WITH new_lesson AS (
  INSERT INTO public.greenleaf_lessons (grade_id, title, order_index)
  SELECT g.id, 'Community Helpers', 9 FROM public.greenleaf_grades g
  WHERE g.code = 'kids2'
    AND NOT EXISTS (SELECT 1 FROM public.greenleaf_lessons l WHERE l.grade_id = g.id AND l.title = 'Community Helpers')
  RETURNING id
)
INSERT INTO public.greenleaf_missions (lesson_id, type, order_index, title, content)
SELECT id, 'words_explorer', 1, 'Words Explorer: Community Helpers', $json${
  "topic": "Community Helpers",
  "words": [
    {"word": "firefighter", "imageUrl": ""},
    {"word": "police officer", "imageUrl": ""},
    {"word": "nurse", "imageUrl": ""},
    {"word": "engineer", "imageUrl": ""},
    {"word": "farmer", "imageUrl": ""}
  ]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'phonics', 2, 'Sentence Practice: Community Helpers', $json${
  "lines": ["The firefighter puts out fires.", "The police officer keeps us safe.", "The nurse takes care of patients.", "The engineer builds new things."]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'speaking_challenge', 3, 'Speaking Challenge', $json${
  "script": "The firefighter puts out fires. The police officer keeps us safe. The nurse takes care of patients. The engineer builds new things."
}$json$::jsonb FROM new_lesson;

WITH new_lesson AS (
  INSERT INTO public.greenleaf_lessons (grade_id, title, order_index)
  SELECT g.id, 'Food and Restaurant', 10 FROM public.greenleaf_grades g
  WHERE g.code = 'kids2'
    AND NOT EXISTS (SELECT 1 FROM public.greenleaf_lessons l WHERE l.grade_id = g.id AND l.title = 'Food and Restaurant')
  RETURNING id
)
INSERT INTO public.greenleaf_missions (lesson_id, type, order_index, title, content)
SELECT id, 'words_explorer', 1, 'Words Explorer: Food and Restaurant', $json${
  "topic": "Food and Restaurant",
  "words": [
    {"word": "menu", "imageUrl": ""},
    {"word": "order", "imageUrl": ""},
    {"word": "waiter", "imageUrl": ""},
    {"word": "bill", "imageUrl": ""},
    {"word": "delicious", "imageUrl": ""}
  ]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'phonics', 2, 'Sentence Practice: Food and Restaurant', $json${
  "lines": ["We look at the menu first.", "We order our food.", "The waiter brings our food.", "The food is delicious!"]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'speaking_challenge', 3, 'Speaking Challenge', $json${
  "script": "We look at the menu first. We order our food. The waiter brings our food. The food is delicious!"
}$json$::jsonb FROM new_lesson;

WITH new_lesson AS (
  INSERT INTO public.greenleaf_lessons (grade_id, title, order_index)
  SELECT g.id, 'Travel', 11 FROM public.greenleaf_grades g
  WHERE g.code = 'kids2'
    AND NOT EXISTS (SELECT 1 FROM public.greenleaf_lessons l WHERE l.grade_id = g.id AND l.title = 'Travel')
  RETURNING id
)
INSERT INTO public.greenleaf_missions (lesson_id, type, order_index, title, content)
SELECT id, 'words_explorer', 1, 'Words Explorer: Travel', $json${
  "topic": "Travel",
  "words": [
    {"word": "airport", "imageUrl": ""},
    {"word": "hotel", "imageUrl": ""},
    {"word": "ticket", "imageUrl": ""},
    {"word": "luggage", "imageUrl": ""},
    {"word": "passport", "imageUrl": ""}
  ]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'phonics', 2, 'Sentence Practice: Travel', $json${
  "lines": ["We arrive at the airport.", "We check into the hotel.", "Don't forget your ticket.", "Pack your luggage carefully."]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'speaking_challenge', 3, 'Speaking Challenge', $json${
  "script": "We arrive at the airport. We check into the hotel. Don't forget your ticket. Pack your luggage carefully."
}$json$::jsonb FROM new_lesson;

-- ═════════════════════════════════════════════════════════════
-- TEENS — 10 bài học mới (dạng đoạn văn + Sentence Builder, giống Demo City Life)
-- ═════════════════════════════════════════════════════════════

WITH new_lesson AS (
  INSERT INTO public.greenleaf_lessons (grade_id, title, order_index)
  SELECT g.id, 'Environment', 2 FROM public.greenleaf_grades g
  WHERE g.code = 'teens'
    AND NOT EXISTS (SELECT 1 FROM public.greenleaf_lessons l WHERE l.grade_id = g.id AND l.title = 'Environment')
  RETURNING id
)
INSERT INTO public.greenleaf_missions (lesson_id, type, order_index, title, content)
SELECT id, 'words_explorer', 1, 'Words Explorer: Environment', $json${
  "topic": "Environment",
  "words": [
    {"word": "pollution", "imageUrl": ""},
    {"word": "recycling", "imageUrl": ""},
    {"word": "climate change", "imageUrl": ""},
    {"word": "deforestation", "imageUrl": ""},
    {"word": "renewable energy", "imageUrl": ""}
  ]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'phonics', 2, 'Sentence Builder', $json${
  "lines": [
    "Environmental problems are getting worse every year.",
    "Pollution from factories and cars harms the air we breathe.",
    "Deforestation destroys the homes of many animals.",
    "Recycling and renewable energy can help protect our planet."
  ]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'speaking_challenge', 3, 'Speaking Challenge', $json${
  "prompt": "Talk about how to protect the environment.",
  "script": "Environmental problems are getting worse every year. Pollution from factories and cars harms the air we breathe. Deforestation destroys the homes of many animals. Recycling and renewable energy can help protect our planet."
}$json$::jsonb FROM new_lesson;

WITH new_lesson AS (
  INSERT INTO public.greenleaf_lessons (grade_id, title, order_index)
  SELECT g.id, 'Technology & Social Media', 3 FROM public.greenleaf_grades g
  WHERE g.code = 'teens'
    AND NOT EXISTS (SELECT 1 FROM public.greenleaf_lessons l WHERE l.grade_id = g.id AND l.title = 'Technology & Social Media')
  RETURNING id
)
INSERT INTO public.greenleaf_missions (lesson_id, type, order_index, title, content)
SELECT id, 'words_explorer', 1, 'Words Explorer: Technology & Social Media', $json${
  "topic": "Technology & Social Media",
  "words": [
    {"word": "smartphone", "imageUrl": ""},
    {"word": "social media", "imageUrl": ""},
    {"word": "addiction", "imageUrl": ""},
    {"word": "privacy", "imageUrl": ""},
    {"word": "connection", "imageUrl": ""}
  ]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'phonics', 2, 'Sentence Builder', $json${
  "lines": [
    "Technology has changed the way teenagers communicate.",
    "Smartphones and social media connect us with friends around the world.",
    "However, too much screen time can lead to addiction.",
    "It is important to balance online life with real life."
  ]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'speaking_challenge', 3, 'Speaking Challenge', $json${
  "prompt": "Talk about the advantages and disadvantages of social media.",
  "script": "Technology has changed the way teenagers communicate. Smartphones and social media connect us with friends around the world. However, too much screen time can lead to addiction. It is important to balance online life with real life."
}$json$::jsonb FROM new_lesson;

WITH new_lesson AS (
  INSERT INTO public.greenleaf_lessons (grade_id, title, order_index)
  SELECT g.id, 'Education', 4 FROM public.greenleaf_grades g
  WHERE g.code = 'teens'
    AND NOT EXISTS (SELECT 1 FROM public.greenleaf_lessons l WHERE l.grade_id = g.id AND l.title = 'Education')
  RETURNING id
)
INSERT INTO public.greenleaf_missions (lesson_id, type, order_index, title, content)
SELECT id, 'words_explorer', 1, 'Words Explorer: Education', $json${
  "topic": "Education",
  "words": [
    {"word": "exam pressure", "imageUrl": ""},
    {"word": "online learning", "imageUrl": ""},
    {"word": "extracurricular activities", "imageUrl": ""},
    {"word": "university", "imageUrl": ""},
    {"word": "skills", "imageUrl": ""}
  ]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'phonics', 2, 'Sentence Builder', $json${
  "lines": [
    "Education plays a very important role in our future.",
    "Many students feel exam pressure every semester.",
    "Online learning gives students more flexibility.",
    "Extracurricular activities help students develop new skills."
  ]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'speaking_challenge', 3, 'Speaking Challenge', $json${
  "prompt": "Talk about the challenges students face at school.",
  "script": "Education plays a very important role in our future. Many students feel exam pressure every semester. Online learning gives students more flexibility. Extracurricular activities help students develop new skills."
}$json$::jsonb FROM new_lesson;

WITH new_lesson AS (
  INSERT INTO public.greenleaf_lessons (grade_id, title, order_index)
  SELECT g.id, 'Health & Lifestyle', 5 FROM public.greenleaf_grades g
  WHERE g.code = 'teens'
    AND NOT EXISTS (SELECT 1 FROM public.greenleaf_lessons l WHERE l.grade_id = g.id AND l.title = 'Health & Lifestyle')
  RETURNING id
)
INSERT INTO public.greenleaf_missions (lesson_id, type, order_index, title, content)
SELECT id, 'words_explorer', 1, 'Words Explorer: Health & Lifestyle', $json${
  "topic": "Health & Lifestyle",
  "words": [
    {"word": "junk food", "imageUrl": ""},
    {"word": "obesity", "imageUrl": ""},
    {"word": "exercise", "imageUrl": ""},
    {"word": "mental health", "imageUrl": ""},
    {"word": "balance", "imageUrl": ""}
  ]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'phonics', 2, 'Sentence Builder', $json${
  "lines": [
    "A healthy lifestyle is important for teenagers.",
    "Eating too much junk food can lead to obesity.",
    "Regular exercise keeps our body strong.",
    "Taking care of our mental health is just as important."
  ]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'speaking_challenge', 3, 'Speaking Challenge', $json${
  "prompt": "Talk about how to live a healthy lifestyle.",
  "script": "A healthy lifestyle is important for teenagers. Eating too much junk food can lead to obesity. Regular exercise keeps our body strong. Taking care of our mental health is just as important."
}$json$::jsonb FROM new_lesson;

WITH new_lesson AS (
  INSERT INTO public.greenleaf_lessons (grade_id, title, order_index)
  SELECT g.id, 'Career Choices', 6 FROM public.greenleaf_grades g
  WHERE g.code = 'teens'
    AND NOT EXISTS (SELECT 1 FROM public.greenleaf_lessons l WHERE l.grade_id = g.id AND l.title = 'Career Choices')
  RETURNING id
)
INSERT INTO public.greenleaf_missions (lesson_id, type, order_index, title, content)
SELECT id, 'words_explorer', 1, 'Words Explorer: Career Choices', $json${
  "topic": "Career Choices",
  "words": [
    {"word": "career choices", "imageUrl": ""},
    {"word": "passion", "imageUrl": ""},
    {"word": "salary", "imageUrl": ""},
    {"word": "job market", "imageUrl": ""},
    {"word": "internship", "imageUrl": ""}
  ]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'phonics', 2, 'Sentence Builder', $json${
  "lines": [
    "Choosing a future career is a big decision for teenagers.",
    "Some people follow their passion, while others think about salary.",
    "The job market is changing quickly because of technology.",
    "Internships help students gain real work experience."
  ]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'speaking_challenge', 3, 'Speaking Challenge', $json${
  "prompt": "Talk about how you plan to choose your future career.",
  "script": "Choosing a future career is a big decision for teenagers. Some people follow their passion, while others think about salary. The job market is changing quickly because of technology. Internships help students gain real work experience."
}$json$::jsonb FROM new_lesson;

WITH new_lesson AS (
  INSERT INTO public.greenleaf_lessons (grade_id, title, order_index)
  SELECT g.id, 'Globalization', 7 FROM public.greenleaf_grades g
  WHERE g.code = 'teens'
    AND NOT EXISTS (SELECT 1 FROM public.greenleaf_lessons l WHERE l.grade_id = g.id AND l.title = 'Globalization')
  RETURNING id
)
INSERT INTO public.greenleaf_missions (lesson_id, type, order_index, title, content)
SELECT id, 'words_explorer', 1, 'Words Explorer: Globalization', $json${
  "topic": "Globalization",
  "words": [
    {"word": "globalization", "imageUrl": ""},
    {"word": "culture", "imageUrl": ""},
    {"word": "language", "imageUrl": ""},
    {"word": "trade", "imageUrl": ""},
    {"word": "technology", "imageUrl": ""}
  ]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'phonics', 2, 'Sentence Builder', $json${
  "lines": [
    "Globalization connects countries around the world.",
    "People can learn about different cultures more easily now.",
    "Learning a new language opens many opportunities.",
    "Trade and technology help countries grow together."
  ]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'speaking_challenge', 3, 'Speaking Challenge', $json${
  "prompt": "Talk about the effects of globalization on your country.",
  "script": "Globalization connects countries around the world. People can learn about different cultures more easily now. Learning a new language opens many opportunities. Trade and technology help countries grow together."
}$json$::jsonb FROM new_lesson;

WITH new_lesson AS (
  INSERT INTO public.greenleaf_lessons (grade_id, title, order_index)
  SELECT g.id, 'Family & Society', 8 FROM public.greenleaf_grades g
  WHERE g.code = 'teens'
    AND NOT EXISTS (SELECT 1 FROM public.greenleaf_lessons l WHERE l.grade_id = g.id AND l.title = 'Family & Society')
  RETURNING id
)
INSERT INTO public.greenleaf_missions (lesson_id, type, order_index, title, content)
SELECT id, 'words_explorer', 1, 'Words Explorer: Family & Society', $json${
  "topic": "Family & Society",
  "words": [
    {"word": "generation gap", "imageUrl": ""},
    {"word": "traditional values", "imageUrl": ""},
    {"word": "modern family", "imageUrl": ""},
    {"word": "communication", "imageUrl": ""},
    {"word": "society", "imageUrl": ""}
  ]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'phonics', 2, 'Sentence Builder', $json${
  "lines": [
    "Family plays a central role in Vietnamese society.",
    "Sometimes there is a generation gap between parents and children.",
    "Traditional values can be different from modern lifestyles.",
    "Good communication helps families understand each other."
  ]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'speaking_challenge', 3, 'Speaking Challenge', $json${
  "prompt": "Talk about the relationship between you and your parents.",
  "script": "Family plays a central role in Vietnamese society. Sometimes there is a generation gap between parents and children. Traditional values can be different from modern lifestyles. Good communication helps families understand each other."
}$json$::jsonb FROM new_lesson;

WITH new_lesson AS (
  INSERT INTO public.greenleaf_lessons (grade_id, title, order_index)
  SELECT g.id, 'Travel & Tourism', 9 FROM public.greenleaf_grades g
  WHERE g.code = 'teens'
    AND NOT EXISTS (SELECT 1 FROM public.greenleaf_lessons l WHERE l.grade_id = g.id AND l.title = 'Travel & Tourism')
  RETURNING id
)
INSERT INTO public.greenleaf_missions (lesson_id, type, order_index, title, content)
SELECT id, 'words_explorer', 1, 'Words Explorer: Travel & Tourism', $json${
  "topic": "Travel & Tourism",
  "words": [
    {"word": "tourism", "imageUrl": ""},
    {"word": "culture", "imageUrl": ""},
    {"word": "environment", "imageUrl": ""},
    {"word": "economy", "imageUrl": ""},
    {"word": "experience", "imageUrl": ""}
  ]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'phonics', 2, 'Sentence Builder', $json${
  "lines": [
    "Tourism is an important industry in many countries.",
    "Traveling helps us learn about different cultures.",
    "However, tourism can also harm the environment if not managed well.",
    "Traveling gives young people valuable life experience."
  ]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'speaking_challenge', 3, 'Speaking Challenge', $json${
  "prompt": "Talk about the benefits and drawbacks of tourism.",
  "script": "Tourism is an important industry in many countries. Traveling helps us learn about different cultures. However, tourism can also harm the environment if not managed well. Traveling gives young people valuable life experience."
}$json$::jsonb FROM new_lesson;

WITH new_lesson AS (
  INSERT INTO public.greenleaf_lessons (grade_id, title, order_index)
  SELECT g.id, 'Volunteering', 10 FROM public.greenleaf_grades g
  WHERE g.code = 'teens'
    AND NOT EXISTS (SELECT 1 FROM public.greenleaf_lessons l WHERE l.grade_id = g.id AND l.title = 'Volunteering')
  RETURNING id
)
INSERT INTO public.greenleaf_missions (lesson_id, type, order_index, title, content)
SELECT id, 'words_explorer', 1, 'Words Explorer: Volunteering', $json${
  "topic": "Volunteering",
  "words": [
    {"word": "volunteering", "imageUrl": ""},
    {"word": "community service", "imageUrl": ""},
    {"word": "benefits", "imageUrl": ""},
    {"word": "teamwork", "imageUrl": ""},
    {"word": "kindness", "imageUrl": ""}
  ]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'phonics', 2, 'Sentence Builder', $json${
  "lines": [
    "Volunteering is a great way to help your community.",
    "Community service teaches students responsibility.",
    "Working in a team helps us build new skills.",
    "Small acts of kindness can make a big difference."
  ]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'speaking_challenge', 3, 'Speaking Challenge', $json${
  "prompt": "Talk about a volunteer activity you would like to join.",
  "script": "Volunteering is a great way to help your community. Community service teaches students responsibility. Working in a team helps us build new skills. Small acts of kindness can make a big difference."
}$json$::jsonb FROM new_lesson;

WITH new_lesson AS (
  INSERT INTO public.greenleaf_lessons (grade_id, title, order_index)
  SELECT g.id, 'Future of Work', 11 FROM public.greenleaf_grades g
  WHERE g.code = 'teens'
    AND NOT EXISTS (SELECT 1 FROM public.greenleaf_lessons l WHERE l.grade_id = g.id AND l.title = 'Future of Work')
  RETURNING id
)
INSERT INTO public.greenleaf_missions (lesson_id, type, order_index, title, content)
SELECT id, 'words_explorer', 1, 'Words Explorer: Future of Work', $json${
  "topic": "Future of Work",
  "words": [
    {"word": "automation", "imageUrl": ""},
    {"word": "artificial intelligence", "imageUrl": ""},
    {"word": "jobs", "imageUrl": ""},
    {"word": "skills", "imageUrl": ""},
    {"word": "adapt", "imageUrl": ""}
  ]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'phonics', 2, 'Sentence Builder', $json${
  "lines": [
    "The future of work is changing fast because of technology.",
    "Automation and artificial intelligence are replacing some jobs.",
    "New jobs will need new skills.",
    "Young people must learn to adapt to these changes."
  ]
}$json$::jsonb FROM new_lesson
UNION ALL
SELECT id, 'speaking_challenge', 3, 'Speaking Challenge', $json${
  "prompt": "Talk about how technology will change jobs in the future.",
  "script": "The future of work is changing fast because of technology. Automation and artificial intelligence are replacing some jobs. New jobs will need new skills. Young people must learn to adapt to these changes."
}$json$::jsonb FROM new_lesson;
