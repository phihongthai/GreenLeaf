-- English immersion (see 87fba74 "i18n: translate entire UI from Vietnamese to English"):
-- app UI/feedback is now English-only, but the `meaning` field on each Words Explorer word
-- was seeded in Vietnamese (0011) and never touched by the UI translation pass since it lives
-- in DB content, not code. Replace with short, simple English definitions instead, so the app
-- is consistently English end-to-end.
--
-- Unlike 0011 (and this migration's first draft), this does NOT jsonb_set the whole `words`
-- array with a hardcoded imageUrl of "" — that would silently wipe out any real imageUrl
-- values already populated by scripts/populate-images.ts in production. Instead, rebuild each
-- word object by merging in only the new `meaning`, leaving every other field (imageUrl, word)
-- untouched. Idempotent — always overwrites `meaning` with the same value.

UPDATE public.greenleaf_missions m
SET content = jsonb_set(
  m.content,
  '{words}',
  (
    SELECT jsonb_agg(
      CASE elem->>'word'
        WHEN 'cat' THEN elem || jsonb_build_object('meaning', 'a small pet animal that says meow')
        WHEN 'dog' THEN elem || jsonb_build_object('meaning', 'a pet animal that says woof')
        WHEN 'bird' THEN elem || jsonb_build_object('meaning', 'an animal that can fly')
        WHEN 'rat' THEN elem || jsonb_build_object('meaning', 'a small animal with a long tail')
        WHEN 'lizard' THEN elem || jsonb_build_object('meaning', 'a small animal with scaly skin')
        ELSE elem
      END
      ORDER BY ord
    )
    FROM jsonb_array_elements(m.content->'words') WITH ORDINALITY AS t(elem, ord)
  )
)
WHERE m.type = 'words_explorer' AND m.content->>'topic' = 'Animals';

UPDATE public.greenleaf_missions m
SET content = jsonb_set(
  m.content,
  '{words}',
  (
    SELECT jsonb_agg(
      CASE elem->>'word'
        WHEN 'car' THEN elem || jsonb_build_object('meaning', 'a vehicle you drive on roads')
        WHEN 'train' THEN elem || jsonb_build_object('meaning', 'a long vehicle that runs on tracks')
        WHEN 'robot' THEN elem || jsonb_build_object('meaning', 'a machine that can move and work')
        WHEN 'bike' THEN elem || jsonb_build_object('meaning', 'a two-wheeled vehicle you pedal')
        WHEN 'kite' THEN elem || jsonb_build_object('meaning', 'a toy that flies in the wind')
        ELSE elem
      END
      ORDER BY ord
    )
    FROM jsonb_array_elements(m.content->'words') WITH ORDINALITY AS t(elem, ord)
  )
)
WHERE m.type = 'words_explorer' AND m.content->>'topic' = 'Toys';

UPDATE public.greenleaf_missions m
SET content = jsonb_set(
  m.content,
  '{words}',
  (
    SELECT jsonb_agg(
      CASE elem->>'word'
        WHEN 'cinema' THEN elem || jsonb_build_object('meaning', 'a place to watch movies')
        WHEN 'post office' THEN elem || jsonb_build_object('meaning', 'a place to send letters and packages')
        WHEN 'supermarket' THEN elem || jsonb_build_object('meaning', 'a big store to buy food')
        WHEN 'police station' THEN elem || jsonb_build_object('meaning', 'a place where police officers work')
        WHEN 'swimming pool' THEN elem || jsonb_build_object('meaning', 'a place to swim')
        ELSE elem
      END
      ORDER BY ord
    )
    FROM jsonb_array_elements(m.content->'words') WITH ORDINALITY AS t(elem, ord)
  )
)
WHERE m.type = 'words_explorer' AND m.content->>'topic' = 'Places';

UPDATE public.greenleaf_missions m
SET content = jsonb_set(
  m.content,
  '{words}',
  (
    SELECT jsonb_agg(
      CASE elem->>'word'
        WHEN 'downtown' THEN elem || jsonb_build_object('meaning', 'the busy center of a city')
        WHEN 'public transport' THEN elem || jsonb_build_object('meaning', 'buses, trains, etc. that everyone can use')
        WHEN 'traffic congestion' THEN elem || jsonb_build_object('meaning', 'too many cars causing delays')
        WHEN 'rush hour' THEN elem || jsonb_build_object('meaning', 'the busiest time for traffic')
        WHEN 'concrete jungle' THEN elem || jsonb_build_object('meaning', 'a crowded city full of buildings')
        ELSE elem
      END
      ORDER BY ord
    )
    FROM jsonb_array_elements(m.content->'words') WITH ORDINALITY AS t(elem, ord)
  )
)
WHERE m.type = 'words_explorer' AND m.content->>'topic' = 'City Life';

UPDATE public.greenleaf_missions m
SET content = jsonb_set(
  m.content,
  '{words}',
  (
    SELECT jsonb_agg(
      CASE elem->>'word'
        WHEN 'red' THEN elem || jsonb_build_object('meaning', 'the color of an apple')
        WHEN 'blue' THEN elem || jsonb_build_object('meaning', 'the color of the sky')
        WHEN 'yellow' THEN elem || jsonb_build_object('meaning', 'the color of the sun')
        WHEN 'green' THEN elem || jsonb_build_object('meaning', 'the color of grass')
        WHEN 'pink' THEN elem || jsonb_build_object('meaning', 'a light red color')
        ELSE elem
      END
      ORDER BY ord
    )
    FROM jsonb_array_elements(m.content->'words') WITH ORDINALITY AS t(elem, ord)
  )
)
WHERE m.type = 'words_explorer' AND m.content->>'topic' = 'Colors';

UPDATE public.greenleaf_missions m
SET content = jsonb_set(
  m.content,
  '{words}',
  (
    SELECT jsonb_agg(
      CASE elem->>'word'
        WHEN 'mom' THEN elem || jsonb_build_object('meaning', 'your female parent')
        WHEN 'dad' THEN elem || jsonb_build_object('meaning', 'your male parent')
        WHEN 'sister' THEN elem || jsonb_build_object('meaning', 'a girl in your family')
        WHEN 'brother' THEN elem || jsonb_build_object('meaning', 'a boy in your family')
        WHEN 'baby' THEN elem || jsonb_build_object('meaning', 'a very young child')
        ELSE elem
      END
      ORDER BY ord
    )
    FROM jsonb_array_elements(m.content->'words') WITH ORDINALITY AS t(elem, ord)
  )
)
WHERE m.type = 'words_explorer' AND m.content->>'topic' = 'Family';

UPDATE public.greenleaf_missions m
SET content = jsonb_set(
  m.content,
  '{words}',
  (
    SELECT jsonb_agg(
      CASE elem->>'word'
        WHEN 'apple' THEN elem || jsonb_build_object('meaning', 'a round, sweet fruit')
        WHEN 'banana' THEN elem || jsonb_build_object('meaning', 'a long yellow fruit')
        WHEN 'milk' THEN elem || jsonb_build_object('meaning', 'a white drink from cows')
        WHEN 'egg' THEN elem || jsonb_build_object('meaning', 'a food that comes from hens')
        WHEN 'bread' THEN elem || jsonb_build_object('meaning', 'a food made from flour')
        ELSE elem
      END
      ORDER BY ord
    )
    FROM jsonb_array_elements(m.content->'words') WITH ORDINALITY AS t(elem, ord)
  )
)
WHERE m.type = 'words_explorer' AND m.content->>'topic' = 'Food';

UPDATE public.greenleaf_missions m
SET content = jsonb_set(
  m.content,
  '{words}',
  (
    SELECT jsonb_agg(
      CASE elem->>'word'
        WHEN 'head' THEN elem || jsonb_build_object('meaning', 'the top part of your body')
        WHEN 'hand' THEN elem || jsonb_build_object('meaning', 'the part you use to hold things')
        WHEN 'foot' THEN elem || jsonb_build_object('meaning', 'the part you walk on')
        WHEN 'eye' THEN elem || jsonb_build_object('meaning', 'the part you see with')
        WHEN 'nose' THEN elem || jsonb_build_object('meaning', 'the part you smell with')
        ELSE elem
      END
      ORDER BY ord
    )
    FROM jsonb_array_elements(m.content->'words') WITH ORDINALITY AS t(elem, ord)
  )
)
WHERE m.type = 'words_explorer' AND m.content->>'topic' = 'Body Parts';

UPDATE public.greenleaf_missions m
SET content = jsonb_set(
  m.content,
  '{words}',
  (
    SELECT jsonb_agg(
      CASE elem->>'word'
        WHEN 'one' THEN elem || jsonb_build_object('meaning', 'the number 1')
        WHEN 'two' THEN elem || jsonb_build_object('meaning', 'the number 2')
        WHEN 'three' THEN elem || jsonb_build_object('meaning', 'the number 3')
        WHEN 'four' THEN elem || jsonb_build_object('meaning', 'the number 4')
        WHEN 'five' THEN elem || jsonb_build_object('meaning', 'the number 5')
        ELSE elem
      END
      ORDER BY ord
    )
    FROM jsonb_array_elements(m.content->'words') WITH ORDINALITY AS t(elem, ord)
  )
)
WHERE m.type = 'words_explorer' AND m.content->>'topic' = 'Numbers';

UPDATE public.greenleaf_missions m
SET content = jsonb_set(
  m.content,
  '{words}',
  (
    SELECT jsonb_agg(
      CASE elem->>'word'
        WHEN 'circle' THEN elem || jsonb_build_object('meaning', 'a round shape')
        WHEN 'square' THEN elem || jsonb_build_object('meaning', 'a shape with 4 equal sides')
        WHEN 'triangle' THEN elem || jsonb_build_object('meaning', 'a shape with 3 sides')
        WHEN 'star' THEN elem || jsonb_build_object('meaning', 'a shape with points, like in the night sky')
        WHEN 'heart' THEN elem || jsonb_build_object('meaning', 'a shape that means love')
        ELSE elem
      END
      ORDER BY ord
    )
    FROM jsonb_array_elements(m.content->'words') WITH ORDINALITY AS t(elem, ord)
  )
)
WHERE m.type = 'words_explorer' AND m.content->>'topic' = 'Shapes';

UPDATE public.greenleaf_missions m
SET content = jsonb_set(
  m.content,
  '{words}',
  (
    SELECT jsonb_agg(
      CASE elem->>'word'
        WHEN 'sun' THEN elem || jsonb_build_object('meaning', 'the bright light in the sky')
        WHEN 'rain' THEN elem || jsonb_build_object('meaning', 'water that falls from clouds')
        WHEN 'cloud' THEN elem || jsonb_build_object('meaning', 'a white shape floating in the sky')
        WHEN 'wind' THEN elem || jsonb_build_object('meaning', 'moving air')
        WHEN 'snow' THEN elem || jsonb_build_object('meaning', 'soft white flakes that fall when it''s cold')
        ELSE elem
      END
      ORDER BY ord
    )
    FROM jsonb_array_elements(m.content->'words') WITH ORDINALITY AS t(elem, ord)
  )
)
WHERE m.type = 'words_explorer' AND m.content->>'topic' = 'Weather';

UPDATE public.greenleaf_missions m
SET content = jsonb_set(
  m.content,
  '{words}',
  (
    SELECT jsonb_agg(
      CASE elem->>'word'
        WHEN 'hat' THEN elem || jsonb_build_object('meaning', 'something you wear on your head')
        WHEN 'shoes' THEN elem || jsonb_build_object('meaning', 'something you wear on your feet')
        WHEN 'socks' THEN elem || jsonb_build_object('meaning', 'soft clothes for your feet')
        WHEN 'dress' THEN elem || jsonb_build_object('meaning', 'clothing girls wear')
        WHEN 'coat' THEN elem || jsonb_build_object('meaning', 'warm clothing for outside')
        ELSE elem
      END
      ORDER BY ord
    )
    FROM jsonb_array_elements(m.content->'words') WITH ORDINALITY AS t(elem, ord)
  )
)
WHERE m.type = 'words_explorer' AND m.content->>'topic' = 'Clothes';

UPDATE public.greenleaf_missions m
SET content = jsonb_set(
  m.content,
  '{words}',
  (
    SELECT jsonb_agg(
      CASE elem->>'word'
        WHEN 'cow' THEN elem || jsonb_build_object('meaning', 'a farm animal that gives milk')
        WHEN 'pig' THEN elem || jsonb_build_object('meaning', 'a farm animal that says oink')
        WHEN 'hen' THEN elem || jsonb_build_object('meaning', 'a female chicken')
        WHEN 'duck' THEN elem || jsonb_build_object('meaning', 'a bird that swims and says quack')
        WHEN 'sheep' THEN elem || jsonb_build_object('meaning', 'a farm animal with wool')
        ELSE elem
      END
      ORDER BY ord
    )
    FROM jsonb_array_elements(m.content->'words') WITH ORDINALITY AS t(elem, ord)
  )
)
WHERE m.type = 'words_explorer' AND m.content->>'topic' = 'Farm Animals';

UPDATE public.greenleaf_missions m
SET content = jsonb_set(
  m.content,
  '{words}',
  (
    SELECT jsonb_agg(
      CASE elem->>'word'
        WHEN 'orange' THEN elem || jsonb_build_object('meaning', 'a round orange fruit')
        WHEN 'grape' THEN elem || jsonb_build_object('meaning', 'a small, round fruit that grows in bunches')
        WHEN 'mango' THEN elem || jsonb_build_object('meaning', 'a sweet, juicy tropical fruit')
        WHEN 'pear' THEN elem || jsonb_build_object('meaning', 'a green or yellow fruit')
        WHEN 'lemon' THEN elem || jsonb_build_object('meaning', 'a sour yellow fruit')
        ELSE elem
      END
      ORDER BY ord
    )
    FROM jsonb_array_elements(m.content->'words') WITH ORDINALITY AS t(elem, ord)
  )
)
WHERE m.type = 'words_explorer' AND m.content->>'topic' = 'Fruits';

UPDATE public.greenleaf_missions m
SET content = jsonb_set(
  m.content,
  '{words}',
  (
    SELECT jsonb_agg(
      CASE elem->>'word'
        WHEN 'book' THEN elem || jsonb_build_object('meaning', 'something you read')
        WHEN 'pen' THEN elem || jsonb_build_object('meaning', 'something you write with')
        WHEN 'bag' THEN elem || jsonb_build_object('meaning', 'something you carry things in')
        WHEN 'ruler' THEN elem || jsonb_build_object('meaning', 'a tool to measure or draw straight lines')
        WHEN 'eraser' THEN elem || jsonb_build_object('meaning', 'something that removes pencil marks')
        ELSE elem
      END
      ORDER BY ord
    )
    FROM jsonb_array_elements(m.content->'words') WITH ORDINALITY AS t(elem, ord)
  )
)
WHERE m.type = 'words_explorer' AND m.content->>'topic' = 'School Things';

UPDATE public.greenleaf_missions m
SET content = jsonb_set(
  m.content,
  '{words}',
  (
    SELECT jsonb_agg(
      CASE elem->>'word'
        WHEN 'football' THEN elem || jsonb_build_object('meaning', 'a sport played by kicking a ball')
        WHEN 'swimming' THEN elem || jsonb_build_object('meaning', 'moving through water')
        WHEN 'running' THEN elem || jsonb_build_object('meaning', 'moving fast on your feet')
        WHEN 'jumping' THEN elem || jsonb_build_object('meaning', 'pushing off the ground into the air')
        WHEN 'tennis' THEN elem || jsonb_build_object('meaning', 'a sport played with rackets and a ball')
        ELSE elem
      END
      ORDER BY ord
    )
    FROM jsonb_array_elements(m.content->'words') WITH ORDINALITY AS t(elem, ord)
  )
)
WHERE m.type = 'words_explorer' AND m.content->>'topic' = 'Sports';

UPDATE public.greenleaf_missions m
SET content = jsonb_set(
  m.content,
  '{words}',
  (
    SELECT jsonb_agg(
      CASE elem->>'word'
        WHEN 'doctor' THEN elem || jsonb_build_object('meaning', 'a person who helps sick people')
        WHEN 'teacher' THEN elem || jsonb_build_object('meaning', 'a person who helps you learn')
        WHEN 'farmer' THEN elem || jsonb_build_object('meaning', 'a person who grows food')
        WHEN 'driver' THEN elem || jsonb_build_object('meaning', 'a person who drives vehicles')
        WHEN 'chef' THEN elem || jsonb_build_object('meaning', 'a person who cooks food')
        ELSE elem
      END
      ORDER BY ord
    )
    FROM jsonb_array_elements(m.content->'words') WITH ORDINALITY AS t(elem, ord)
  )
)
WHERE m.type = 'words_explorer' AND m.content->>'topic' = 'Jobs';

UPDATE public.greenleaf_missions m
SET content = jsonb_set(
  m.content,
  '{words}',
  (
    SELECT jsonb_agg(
      CASE elem->>'word'
        WHEN 'dog' THEN elem || jsonb_build_object('meaning', 'a common pet that barks')
        WHEN 'cat' THEN elem || jsonb_build_object('meaning', 'a common pet that meows')
        WHEN 'fish' THEN elem || jsonb_build_object('meaning', 'a pet that lives in water')
        WHEN 'rabbit' THEN elem || jsonb_build_object('meaning', 'a pet with long ears')
        WHEN 'hamster' THEN elem || jsonb_build_object('meaning', 'a small furry pet')
        ELSE elem
      END
      ORDER BY ord
    )
    FROM jsonb_array_elements(m.content->'words') WITH ORDINALITY AS t(elem, ord)
  )
)
WHERE m.type = 'words_explorer' AND m.content->>'topic' = 'Pets';

UPDATE public.greenleaf_missions m
SET content = jsonb_set(
  m.content,
  '{words}',
  (
    SELECT jsonb_agg(
      CASE elem->>'word'
        WHEN 'kitchen' THEN elem || jsonb_build_object('meaning', 'the room where you cook')
        WHEN 'bedroom' THEN elem || jsonb_build_object('meaning', 'the room where you sleep')
        WHEN 'bathroom' THEN elem || jsonb_build_object('meaning', 'the room where you wash')
        WHEN 'living room' THEN elem || jsonb_build_object('meaning', 'the room where families relax')
        WHEN 'garden' THEN elem || jsonb_build_object('meaning', 'the outdoor area where plants grow')
        ELSE elem
      END
      ORDER BY ord
    )
    FROM jsonb_array_elements(m.content->'words') WITH ORDINALITY AS t(elem, ord)
  )
)
WHERE m.type = 'words_explorer' AND m.content->>'topic' = 'Rooms in a House';

UPDATE public.greenleaf_missions m
SET content = jsonb_set(
  m.content,
  '{words}',
  (
    SELECT jsonb_agg(
      CASE elem->>'word'
        WHEN 'Monday' THEN elem || jsonb_build_object('meaning', 'the first day of the school week')
        WHEN 'Tuesday' THEN elem || jsonb_build_object('meaning', 'the second day of the week')
        WHEN 'Wednesday' THEN elem || jsonb_build_object('meaning', 'the middle day of the week')
        WHEN 'Thursday' THEN elem || jsonb_build_object('meaning', 'the day before Friday')
        WHEN 'Friday' THEN elem || jsonb_build_object('meaning', 'the last school day of the week')
        ELSE elem
      END
      ORDER BY ord
    )
    FROM jsonb_array_elements(m.content->'words') WITH ORDINALITY AS t(elem, ord)
  )
)
WHERE m.type = 'words_explorer' AND m.content->>'topic' = 'Days of the Week';

UPDATE public.greenleaf_missions m
SET content = jsonb_set(
  m.content,
  '{words}',
  (
    SELECT jsonb_agg(
      CASE elem->>'word'
        WHEN 'spring' THEN elem || jsonb_build_object('meaning', 'the season when flowers bloom')
        WHEN 'summer' THEN elem || jsonb_build_object('meaning', 'the hottest season')
        WHEN 'autumn' THEN elem || jsonb_build_object('meaning', 'the season when leaves fall')
        WHEN 'winter' THEN elem || jsonb_build_object('meaning', 'the coldest season')
        WHEN 'weather' THEN elem || jsonb_build_object('meaning', 'what it''s like outside, like sunny or rainy')
        ELSE elem
      END
      ORDER BY ord
    )
    FROM jsonb_array_elements(m.content->'words') WITH ORDINALITY AS t(elem, ord)
  )
)
WHERE m.type = 'words_explorer' AND m.content->>'topic' = 'Seasons';

UPDATE public.greenleaf_missions m
SET content = jsonb_set(
  m.content,
  '{words}',
  (
    SELECT jsonb_agg(
      CASE elem->>'word'
        WHEN 'bus' THEN elem || jsonb_build_object('meaning', 'a big vehicle for many passengers')
        WHEN 'car' THEN elem || jsonb_build_object('meaning', 'a small vehicle for a few people')
        WHEN 'bike' THEN elem || jsonb_build_object('meaning', 'a vehicle with two wheels')
        WHEN 'boat' THEN elem || jsonb_build_object('meaning', 'a vehicle that travels on water')
        WHEN 'plane' THEN elem || jsonb_build_object('meaning', 'a vehicle that flies in the sky')
        ELSE elem
      END
      ORDER BY ord
    )
    FROM jsonb_array_elements(m.content->'words') WITH ORDINALITY AS t(elem, ord)
  )
)
WHERE m.type = 'words_explorer' AND m.content->>'topic' = 'Transport';

UPDATE public.greenleaf_missions m
SET content = jsonb_set(
  m.content,
  '{words}',
  (
    SELECT jsonb_agg(
      CASE elem->>'word'
        WHEN 'happy' THEN elem || jsonb_build_object('meaning', 'feeling good and cheerful')
        WHEN 'sad' THEN elem || jsonb_build_object('meaning', 'feeling unhappy')
        WHEN 'angry' THEN elem || jsonb_build_object('meaning', 'feeling upset or mad')
        WHEN 'tired' THEN elem || jsonb_build_object('meaning', 'needing rest or sleep')
        WHEN 'excited' THEN elem || jsonb_build_object('meaning', 'feeling very happy about something')
        ELSE elem
      END
      ORDER BY ord
    )
    FROM jsonb_array_elements(m.content->'words') WITH ORDINALITY AS t(elem, ord)
  )
)
WHERE m.type = 'words_explorer' AND m.content->>'topic' = 'Feelings';

UPDATE public.greenleaf_missions m
SET content = jsonb_set(
  m.content,
  '{words}',
  (
    SELECT jsonb_agg(
      CASE elem->>'word'
        WHEN 'carrot' THEN elem || jsonb_build_object('meaning', 'an orange vegetable')
        WHEN 'potato' THEN elem || jsonb_build_object('meaning', 'a brown vegetable that grows underground')
        WHEN 'tomato' THEN elem || jsonb_build_object('meaning', 'a red, round vegetable')
        WHEN 'cucumber' THEN elem || jsonb_build_object('meaning', 'a long green vegetable')
        WHEN 'corn' THEN elem || jsonb_build_object('meaning', 'a yellow vegetable with small kernels')
        ELSE elem
      END
      ORDER BY ord
    )
    FROM jsonb_array_elements(m.content->'words') WITH ORDINALITY AS t(elem, ord)
  )
)
WHERE m.type = 'words_explorer' AND m.content->>'topic' = 'Fruits and Vegetables';

UPDATE public.greenleaf_missions m
SET content = jsonb_set(
  m.content,
  '{words}',
  (
    SELECT jsonb_agg(
      CASE elem->>'word'
        WHEN 'reading' THEN elem || jsonb_build_object('meaning', 'looking at and understanding words')
        WHEN 'painting' THEN elem || jsonb_build_object('meaning', 'creating pictures with paint')
        WHEN 'cycling' THEN elem || jsonb_build_object('meaning', 'riding a bike')
        WHEN 'dancing' THEN elem || jsonb_build_object('meaning', 'moving your body to music')
        WHEN 'gaming' THEN elem || jsonb_build_object('meaning', 'playing video games')
        ELSE elem
      END
      ORDER BY ord
    )
    FROM jsonb_array_elements(m.content->'words') WITH ORDINALITY AS t(elem, ord)
  )
)
WHERE m.type = 'words_explorer' AND m.content->>'topic' = 'Free Time Activities';

UPDATE public.greenleaf_missions m
SET content = jsonb_set(
  m.content,
  '{words}',
  (
    SELECT jsonb_agg(
      CASE elem->>'word'
        WHEN 'Math' THEN elem || jsonb_build_object('meaning', 'the subject about numbers')
        WHEN 'Science' THEN elem || jsonb_build_object('meaning', 'the subject about how things work')
        WHEN 'Art' THEN elem || jsonb_build_object('meaning', 'the subject about drawing and creating')
        WHEN 'Music' THEN elem || jsonb_build_object('meaning', 'the subject about songs and sounds')
        WHEN 'History' THEN elem || jsonb_build_object('meaning', 'the subject about the past')
        ELSE elem
      END
      ORDER BY ord
    )
    FROM jsonb_array_elements(m.content->'words') WITH ORDINALITY AS t(elem, ord)
  )
)
WHERE m.type = 'words_explorer' AND m.content->>'topic' = 'School Subjects';

UPDATE public.greenleaf_missions m
SET content = jsonb_set(
  m.content,
  '{words}',
  (
    SELECT jsonb_agg(
      CASE elem->>'word'
        WHEN 'mountain' THEN elem || jsonb_build_object('meaning', 'a very tall landform')
        WHEN 'river' THEN elem || jsonb_build_object('meaning', 'a long stream of flowing water')
        WHEN 'forest' THEN elem || jsonb_build_object('meaning', 'a large area full of trees')
        WHEN 'beach' THEN elem || jsonb_build_object('meaning', 'the sandy area next to the sea')
        WHEN 'desert' THEN elem || jsonb_build_object('meaning', 'a dry area with very little rain')
        ELSE elem
      END
      ORDER BY ord
    )
    FROM jsonb_array_elements(m.content->'words') WITH ORDINALITY AS t(elem, ord)
  )
)
WHERE m.type = 'words_explorer' AND m.content->>'topic' = 'Nature';

UPDATE public.greenleaf_missions m
SET content = jsonb_set(
  m.content,
  '{words}',
  (
    SELECT jsonb_agg(
      CASE elem->>'word'
        WHEN 'hospital' THEN elem || jsonb_build_object('meaning', 'a place where sick people are treated')
        WHEN 'medicine' THEN elem || jsonb_build_object('meaning', 'something you take to feel better')
        WHEN 'exercise' THEN elem || jsonb_build_object('meaning', 'physical activity to stay fit')
        WHEN 'doctor' THEN elem || jsonb_build_object('meaning', 'a person who treats sick people')
        WHEN 'rest' THEN elem || jsonb_build_object('meaning', 'relaxing to recover energy')
        ELSE elem
      END
      ORDER BY ord
    )
    FROM jsonb_array_elements(m.content->'words') WITH ORDINALITY AS t(elem, ord)
  )
)
WHERE m.type = 'words_explorer' AND m.content->>'topic' = 'Health';

UPDATE public.greenleaf_missions m
SET content = jsonb_set(
  m.content,
  '{words}',
  (
    SELECT jsonb_agg(
      CASE elem->>'word'
        WHEN 'computer' THEN elem || jsonb_build_object('meaning', 'a machine for work and information')
        WHEN 'phone' THEN elem || jsonb_build_object('meaning', 'a device for calling and messaging')
        WHEN 'internet' THEN elem || jsonb_build_object('meaning', 'a network connecting computers worldwide')
        WHEN 'robot' THEN elem || jsonb_build_object('meaning', 'a machine that can do tasks on its own')
        WHEN 'camera' THEN elem || jsonb_build_object('meaning', 'a device that takes pictures')
        ELSE elem
      END
      ORDER BY ord
    )
    FROM jsonb_array_elements(m.content->'words') WITH ORDINALITY AS t(elem, ord)
  )
)
WHERE m.type = 'words_explorer' AND m.content->>'topic' = 'Technology';

UPDATE public.greenleaf_missions m
SET content = jsonb_set(
  m.content,
  '{words}',
  (
    SELECT jsonb_agg(
      CASE elem->>'word'
        WHEN 'Tet' THEN elem || jsonb_build_object('meaning', 'Vietnamese Lunar New Year')
        WHEN 'Christmas' THEN elem || jsonb_build_object('meaning', 'a holiday celebrated in December')
        WHEN 'birthday' THEN elem || jsonb_build_object('meaning', 'the day you celebrate being born')
        WHEN 'wedding' THEN elem || jsonb_build_object('meaning', 'a ceremony where two people marry')
        WHEN 'New Year' THEN elem || jsonb_build_object('meaning', 'the start of a new calendar year')
        ELSE elem
      END
      ORDER BY ord
    )
    FROM jsonb_array_elements(m.content->'words') WITH ORDINALITY AS t(elem, ord)
  )
)
WHERE m.type = 'words_explorer' AND m.content->>'topic' = 'Festivals';

UPDATE public.greenleaf_missions m
SET content = jsonb_set(
  m.content,
  '{words}',
  (
    SELECT jsonb_agg(
      CASE elem->>'word'
        WHEN 'lion' THEN elem || jsonb_build_object('meaning', 'a large wild cat known as king of the jungle')
        WHEN 'elephant' THEN elem || jsonb_build_object('meaning', 'a huge animal with a long trunk')
        WHEN 'giraffe' THEN elem || jsonb_build_object('meaning', 'a tall animal with a long neck')
        WHEN 'monkey' THEN elem || jsonb_build_object('meaning', 'a playful animal that climbs trees')
        WHEN 'tiger' THEN elem || jsonb_build_object('meaning', 'a large wild cat with stripes')
        ELSE elem
      END
      ORDER BY ord
    )
    FROM jsonb_array_elements(m.content->'words') WITH ORDINALITY AS t(elem, ord)
  )
)
WHERE m.type = 'words_explorer' AND m.content->>'topic' = 'Zoo Animals';

UPDATE public.greenleaf_missions m
SET content = jsonb_set(
  m.content,
  '{words}',
  (
    SELECT jsonb_agg(
      CASE elem->>'word'
        WHEN 'firefighter' THEN elem || jsonb_build_object('meaning', 'a person who puts out fires')
        WHEN 'police officer' THEN elem || jsonb_build_object('meaning', 'a person who keeps people safe')
        WHEN 'nurse' THEN elem || jsonb_build_object('meaning', 'a person who cares for sick people')
        WHEN 'engineer' THEN elem || jsonb_build_object('meaning', 'a person who builds and designs things')
        WHEN 'farmer' THEN elem || jsonb_build_object('meaning', 'a person who grows crops')
        ELSE elem
      END
      ORDER BY ord
    )
    FROM jsonb_array_elements(m.content->'words') WITH ORDINALITY AS t(elem, ord)
  )
)
WHERE m.type = 'words_explorer' AND m.content->>'topic' = 'Community Helpers';

UPDATE public.greenleaf_missions m
SET content = jsonb_set(
  m.content,
  '{words}',
  (
    SELECT jsonb_agg(
      CASE elem->>'word'
        WHEN 'menu' THEN elem || jsonb_build_object('meaning', 'a list of food you can order')
        WHEN 'order' THEN elem || jsonb_build_object('meaning', 'to ask for food at a restaurant')
        WHEN 'waiter' THEN elem || jsonb_build_object('meaning', 'a person who serves food')
        WHEN 'bill' THEN elem || jsonb_build_object('meaning', 'the paper showing how much to pay')
        WHEN 'delicious' THEN elem || jsonb_build_object('meaning', 'very tasty')
        ELSE elem
      END
      ORDER BY ord
    )
    FROM jsonb_array_elements(m.content->'words') WITH ORDINALITY AS t(elem, ord)
  )
)
WHERE m.type = 'words_explorer' AND m.content->>'topic' = 'Food and Restaurant';

UPDATE public.greenleaf_missions m
SET content = jsonb_set(
  m.content,
  '{words}',
  (
    SELECT jsonb_agg(
      CASE elem->>'word'
        WHEN 'airport' THEN elem || jsonb_build_object('meaning', 'a place where planes take off and land')
        WHEN 'hotel' THEN elem || jsonb_build_object('meaning', 'a place where travelers stay')
        WHEN 'ticket' THEN elem || jsonb_build_object('meaning', 'a paper that lets you travel or enter somewhere')
        WHEN 'luggage' THEN elem || jsonb_build_object('meaning', 'the bags you bring when you travel')
        WHEN 'passport' THEN elem || jsonb_build_object('meaning', 'a document for traveling to other countries')
        ELSE elem
      END
      ORDER BY ord
    )
    FROM jsonb_array_elements(m.content->'words') WITH ORDINALITY AS t(elem, ord)
  )
)
WHERE m.type = 'words_explorer' AND m.content->>'topic' = 'Travel';

UPDATE public.greenleaf_missions m
SET content = jsonb_set(
  m.content,
  '{words}',
  (
    SELECT jsonb_agg(
      CASE elem->>'word'
        WHEN 'pollution' THEN elem || jsonb_build_object('meaning', 'harmful substances that damage nature')
        WHEN 'recycling' THEN elem || jsonb_build_object('meaning', 'turning waste into new products')
        WHEN 'climate change' THEN elem || jsonb_build_object('meaning', 'long-term changes in the Earth''s weather')
        WHEN 'deforestation' THEN elem || jsonb_build_object('meaning', 'cutting down large areas of forest')
        WHEN 'renewable energy' THEN elem || jsonb_build_object('meaning', 'power from sources that never run out, like the sun')
        ELSE elem
      END
      ORDER BY ord
    )
    FROM jsonb_array_elements(m.content->'words') WITH ORDINALITY AS t(elem, ord)
  )
)
WHERE m.type = 'words_explorer' AND m.content->>'topic' = 'Environment';

UPDATE public.greenleaf_missions m
SET content = jsonb_set(
  m.content,
  '{words}',
  (
    SELECT jsonb_agg(
      CASE elem->>'word'
        WHEN 'smartphone' THEN elem || jsonb_build_object('meaning', 'a mobile phone with internet and apps')
        WHEN 'social media' THEN elem || jsonb_build_object('meaning', 'websites and apps for sharing and connecting')
        WHEN 'addiction' THEN elem || jsonb_build_object('meaning', 'being unable to stop doing something')
        WHEN 'privacy' THEN elem || jsonb_build_object('meaning', 'keeping your personal information safe')
        WHEN 'connection' THEN elem || jsonb_build_object('meaning', 'a link between people or things')
        ELSE elem
      END
      ORDER BY ord
    )
    FROM jsonb_array_elements(m.content->'words') WITH ORDINALITY AS t(elem, ord)
  )
)
WHERE m.type = 'words_explorer' AND m.content->>'topic' = 'Technology & Social Media';

UPDATE public.greenleaf_missions m
SET content = jsonb_set(
  m.content,
  '{words}',
  (
    SELECT jsonb_agg(
      CASE elem->>'word'
        WHEN 'exam pressure' THEN elem || jsonb_build_object('meaning', 'stress caused by tests')
        WHEN 'online learning' THEN elem || jsonb_build_object('meaning', 'studying through the internet')
        WHEN 'extracurricular activities' THEN elem || jsonb_build_object('meaning', 'activities outside of regular classes')
        WHEN 'university' THEN elem || jsonb_build_object('meaning', 'a school for higher education')
        WHEN 'skills' THEN elem || jsonb_build_object('meaning', 'abilities you learn and practice')
        ELSE elem
      END
      ORDER BY ord
    )
    FROM jsonb_array_elements(m.content->'words') WITH ORDINALITY AS t(elem, ord)
  )
)
WHERE m.type = 'words_explorer' AND m.content->>'topic' = 'Education';

UPDATE public.greenleaf_missions m
SET content = jsonb_set(
  m.content,
  '{words}',
  (
    SELECT jsonb_agg(
      CASE elem->>'word'
        WHEN 'junk food' THEN elem || jsonb_build_object('meaning', 'unhealthy food with little nutrition')
        WHEN 'obesity' THEN elem || jsonb_build_object('meaning', 'having too much body weight')
        WHEN 'exercise' THEN elem || jsonb_build_object('meaning', 'physical activity to stay healthy')
        WHEN 'mental health' THEN elem || jsonb_build_object('meaning', 'the state of your emotional wellbeing')
        WHEN 'balance' THEN elem || jsonb_build_object('meaning', 'having a healthy mix of activities')
        ELSE elem
      END
      ORDER BY ord
    )
    FROM jsonb_array_elements(m.content->'words') WITH ORDINALITY AS t(elem, ord)
  )
)
WHERE m.type = 'words_explorer' AND m.content->>'topic' = 'Health & Lifestyle';

UPDATE public.greenleaf_missions m
SET content = jsonb_set(
  m.content,
  '{words}',
  (
    SELECT jsonb_agg(
      CASE elem->>'word'
        WHEN 'career choices' THEN elem || jsonb_build_object('meaning', 'decisions about your future job')
        WHEN 'passion' THEN elem || jsonb_build_object('meaning', 'a strong love for something')
        WHEN 'salary' THEN elem || jsonb_build_object('meaning', 'money you earn from a job')
        WHEN 'job market' THEN elem || jsonb_build_object('meaning', 'the availability of jobs')
        WHEN 'internship' THEN elem || jsonb_build_object('meaning', 'short-term work experience')
        ELSE elem
      END
      ORDER BY ord
    )
    FROM jsonb_array_elements(m.content->'words') WITH ORDINALITY AS t(elem, ord)
  )
)
WHERE m.type = 'words_explorer' AND m.content->>'topic' = 'Career Choices';

UPDATE public.greenleaf_missions m
SET content = jsonb_set(
  m.content,
  '{words}',
  (
    SELECT jsonb_agg(
      CASE elem->>'word'
        WHEN 'globalization' THEN elem || jsonb_build_object('meaning', 'the world becoming more connected')
        WHEN 'culture' THEN elem || jsonb_build_object('meaning', 'the beliefs and customs of a group')
        WHEN 'language' THEN elem || jsonb_build_object('meaning', 'a system used to communicate')
        WHEN 'trade' THEN elem || jsonb_build_object('meaning', 'buying and selling between countries')
        WHEN 'technology' THEN elem || jsonb_build_object('meaning', 'tools and machines created by science')
        ELSE elem
      END
      ORDER BY ord
    )
    FROM jsonb_array_elements(m.content->'words') WITH ORDINALITY AS t(elem, ord)
  )
)
WHERE m.type = 'words_explorer' AND m.content->>'topic' = 'Globalization';

UPDATE public.greenleaf_missions m
SET content = jsonb_set(
  m.content,
  '{words}',
  (
    SELECT jsonb_agg(
      CASE elem->>'word'
        WHEN 'generation gap' THEN elem || jsonb_build_object('meaning', 'differences between older and younger people')
        WHEN 'traditional values' THEN elem || jsonb_build_object('meaning', 'beliefs passed down through generations')
        WHEN 'modern family' THEN elem || jsonb_build_object('meaning', 'a family with today''s lifestyle')
        WHEN 'communication' THEN elem || jsonb_build_object('meaning', 'sharing information with others')
        WHEN 'society' THEN elem || jsonb_build_object('meaning', 'a community of people living together')
        ELSE elem
      END
      ORDER BY ord
    )
    FROM jsonb_array_elements(m.content->'words') WITH ORDINALITY AS t(elem, ord)
  )
)
WHERE m.type = 'words_explorer' AND m.content->>'topic' = 'Family & Society';

UPDATE public.greenleaf_missions m
SET content = jsonb_set(
  m.content,
  '{words}',
  (
    SELECT jsonb_agg(
      CASE elem->>'word'
        WHEN 'tourism' THEN elem || jsonb_build_object('meaning', 'traveling for pleasure')
        WHEN 'culture' THEN elem || jsonb_build_object('meaning', 'the customs and traditions of a place')
        WHEN 'environment' THEN elem || jsonb_build_object('meaning', 'the natural world around us')
        WHEN 'economy' THEN elem || jsonb_build_object('meaning', 'the system of money and resources')
        WHEN 'experience' THEN elem || jsonb_build_object('meaning', 'something you go through or learn from')
        ELSE elem
      END
      ORDER BY ord
    )
    FROM jsonb_array_elements(m.content->'words') WITH ORDINALITY AS t(elem, ord)
  )
)
WHERE m.type = 'words_explorer' AND m.content->>'topic' = 'Travel & Tourism';

UPDATE public.greenleaf_missions m
SET content = jsonb_set(
  m.content,
  '{words}',
  (
    SELECT jsonb_agg(
      CASE elem->>'word'
        WHEN 'volunteering' THEN elem || jsonb_build_object('meaning', 'helping others without being paid')
        WHEN 'community service' THEN elem || jsonb_build_object('meaning', 'work done to help your local area')
        WHEN 'benefits' THEN elem || jsonb_build_object('meaning', 'positive results or advantages')
        WHEN 'teamwork' THEN elem || jsonb_build_object('meaning', 'working together with others')
        WHEN 'kindness' THEN elem || jsonb_build_object('meaning', 'being caring and generous')
        ELSE elem
      END
      ORDER BY ord
    )
    FROM jsonb_array_elements(m.content->'words') WITH ORDINALITY AS t(elem, ord)
  )
)
WHERE m.type = 'words_explorer' AND m.content->>'topic' = 'Volunteering';

UPDATE public.greenleaf_missions m
SET content = jsonb_set(
  m.content,
  '{words}',
  (
    SELECT jsonb_agg(
      CASE elem->>'word'
        WHEN 'automation' THEN elem || jsonb_build_object('meaning', 'using machines instead of people')
        WHEN 'artificial intelligence' THEN elem || jsonb_build_object('meaning', 'computer systems that can think like humans')
        WHEN 'jobs' THEN elem || jsonb_build_object('meaning', 'work that people do')
        WHEN 'skills' THEN elem || jsonb_build_object('meaning', 'abilities needed to do something well')
        WHEN 'adapt' THEN elem || jsonb_build_object('meaning', 'to change to fit new situations')
        ELSE elem
      END
      ORDER BY ord
    )
    FROM jsonb_array_elements(m.content->'words') WITH ORDINALITY AS t(elem, ord)
  )
)
WHERE m.type = 'words_explorer' AND m.content->>'topic' = 'Future of Work';
