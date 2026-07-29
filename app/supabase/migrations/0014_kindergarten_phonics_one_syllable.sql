-- Kindergarten phonics: tối đa 5 từ / câu, mỗi từ 1 âm tiết.
-- Cập nhật cả phonics (mission 2) lẫn speaking_challenge (mission 3) cho đồng bộ.

-- Helper: lấy grade_id của kindergarten
DO $$
DECLARE
  kg_id UUID;
  les_id UUID;
BEGIN
  SELECT id INTO kg_id FROM public.greenleaf_grades WHERE code = 'kindergarten';
  IF kg_id IS NULL THEN RETURN; END IF;

  -- 1. Colors: "Yellow is the sun." → "Bright is the sun."
  SELECT l.id INTO les_id FROM public.greenleaf_lessons l WHERE l.grade_id = kg_id AND l.title = 'Colors';
  IF les_id IS NOT NULL THEN
    UPDATE public.greenleaf_missions SET content = '{"lines":[{"text":"Red is my hat.","imageUrl":"","imageDescription":""},{"text":"Blue is the sky.","imageUrl":"","imageDescription":""},{"text":"Bright is the sun.","imageUrl":"","imageDescription":""},{"text":"Green is the grass.","imageUrl":"","imageDescription":""}]}'::jsonb WHERE lesson_id = les_id AND type = 'phonics';
    UPDATE public.greenleaf_missions SET content = '{"script":"Red is my hat. Blue is the sky. Bright is the sun. Green is the grass."}'::jsonb WHERE lesson_id = les_id AND type = 'speaking_challenge';
  END IF;

  -- 2. Family: sister/brother → 1-syllable lines
  SELECT l.id INTO les_id FROM public.greenleaf_lessons l WHERE l.grade_id = kg_id AND l.title = 'Family';
  IF les_id IS NOT NULL THEN
    UPDATE public.greenleaf_missions SET content = '{"lines":[{"text":"I love my mom.","imageUrl":"","imageDescription":""},{"text":"I love my dad.","imageUrl":"","imageDescription":""},{"text":"Mom hugs me tight.","imageUrl":"","imageDescription":""},{"text":"Dad holds my hand.","imageUrl":"","imageDescription":""}]}'::jsonb WHERE lesson_id = les_id AND type = 'phonics';
    UPDATE public.greenleaf_missions SET content = '{"script":"I love my mom. I love my dad. Mom hugs me tight. Dad holds my hand."}'::jsonb WHERE lesson_id = les_id AND type = 'speaking_challenge';
  END IF;

  -- 3. Food: apple/banana → 1-syllable foods
  SELECT l.id INTO les_id FROM public.greenleaf_lessons l WHERE l.grade_id = kg_id AND l.title = 'Food';
  IF les_id IS NOT NULL THEN
    UPDATE public.greenleaf_missions SET content = '{"lines":[{"text":"I eat my rice.","imageUrl":"","imageDescription":""},{"text":"I drink my milk.","imageUrl":"","imageDescription":""},{"text":"Eggs are so good.","imageUrl":"","imageDescription":""},{"text":"I like warm bread.","imageUrl":"","imageDescription":""}]}'::jsonb WHERE lesson_id = les_id AND type = 'phonics';
    UPDATE public.greenleaf_missions SET content = '{"script":"I eat my rice. I drink my milk. Eggs are so good. I like warm bread."}'::jsonb WHERE lesson_id = les_id AND type = 'speaking_challenge';
  END IF;

  -- 5. Numbers: "Three little bees." → "Three small bees."
  SELECT l.id INTO les_id FROM public.greenleaf_lessons l WHERE l.grade_id = kg_id AND l.title = 'Numbers';
  IF les_id IS NOT NULL THEN
    UPDATE public.greenleaf_missions SET content = '{"lines":[{"text":"One, two, three!","imageUrl":"","imageDescription":""},{"text":"Three small bees.","imageUrl":"","imageDescription":""},{"text":"Four and five.","imageUrl":"","imageDescription":""},{"text":"High five!","imageUrl":"","imageDescription":""}]}'::jsonb WHERE lesson_id = les_id AND type = 'phonics';
    UPDATE public.greenleaf_missions SET content = '{"script":"One, two, three! Three small bees. Four and five. High five!"}'::jsonb WHERE lesson_id = les_id AND type = 'speaking_challenge';
  END IF;

  -- 6. Shapes: circle/triangle → 1-syllable shape words
  SELECT l.id INTO les_id FROM public.greenleaf_lessons l WHERE l.grade_id = kg_id AND l.title = 'Shapes';
  IF les_id IS NOT NULL THEN
    UPDATE public.greenleaf_missions SET content = '{"lines":[{"text":"Draw a big square.","imageUrl":"","imageDescription":""},{"text":"See the bright star.","imageUrl":"","imageDescription":""},{"text":"Make a straight line.","imageUrl":"","imageDescription":""},{"text":"Put a red dot.","imageUrl":"","imageDescription":""}]}'::jsonb WHERE lesson_id = les_id AND type = 'phonics';
    UPDATE public.greenleaf_missions SET content = '{"script":"Draw a big square. See the bright star. Make a straight line. Put a red dot."}'::jsonb WHERE lesson_id = les_id AND type = 'speaking_challenge';
  END IF;

  -- 7. Weather: "around" → "hard"
  SELECT l.id INTO les_id FROM public.greenleaf_lessons l WHERE l.grade_id = kg_id AND l.title = 'Weather';
  IF les_id IS NOT NULL THEN
    UPDATE public.greenleaf_missions SET content = '{"lines":[{"text":"The sun is bright.","imageUrl":"","imageDescription":""},{"text":"The rain falls down.","imageUrl":"","imageDescription":""},{"text":"The cloud is white.","imageUrl":"","imageDescription":""},{"text":"The wind blows hard.","imageUrl":"","imageDescription":""}]}'::jsonb WHERE lesson_id = les_id AND type = 'phonics';
    UPDATE public.greenleaf_missions SET content = '{"script":"The sun is bright. The rain falls down. The cloud is white. The wind blows hard."}'::jsonb WHERE lesson_id = les_id AND type = 'speaking_challenge';
  END IF;

  -- 10. Fruits: oranges/mangoes → 1-syllable fruits
  SELECT l.id INTO les_id FROM public.greenleaf_lessons l WHERE l.grade_id = kg_id AND l.title = 'Fruits';
  IF les_id IS NOT NULL THEN
    UPDATE public.greenleaf_missions SET content = '{"lines":[{"text":"I like red grapes.","imageUrl":"","imageDescription":""},{"text":"I like sweet pears.","imageUrl":"","imageDescription":""},{"text":"Plums are so good.","imageUrl":"","imageDescription":""},{"text":"Peach is so sweet.","imageUrl":"","imageDescription":""}]}'::jsonb WHERE lesson_id = les_id AND type = 'phonics';
    UPDATE public.greenleaf_missions SET content = '{"script":"I like red grapes. I like sweet pears. Plums are so good. Peach is so sweet."}'::jsonb WHERE lesson_id = les_id AND type = 'speaking_challenge';
  END IF;

END $$;
