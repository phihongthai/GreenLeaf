-- English immersion (see 87fba74 "i18n: translate entire UI from Vietnamese to English"):
-- app UI/feedback is now English-only, but the `meaning` field on each Words Explorer word
-- was seeded in Vietnamese (0011) and never touched by the UI translation pass since it lives
-- in DB content, not code. Replace with short, simple English definitions instead, so the app
-- is consistently English end-to-end. Idempotent — always overwrites with the same value.

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "cat", "imageUrl": "", "meaning": "a small pet animal that says meow"},
  {"word": "dog", "imageUrl": "", "meaning": "a pet animal that says woof"},
  {"word": "bird", "imageUrl": "", "meaning": "an animal that can fly"},
  {"word": "rat", "imageUrl": "", "meaning": "a small animal with a long tail"},
  {"word": "lizard", "imageUrl": "", "meaning": "a small animal with scaly skin"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Animals';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "car", "imageUrl": "", "meaning": "a vehicle you drive on roads"},
  {"word": "train", "imageUrl": "", "meaning": "a long vehicle that runs on tracks"},
  {"word": "robot", "imageUrl": "", "meaning": "a machine that can move and work"},
  {"word": "bike", "imageUrl": "", "meaning": "a two-wheeled vehicle you pedal"},
  {"word": "kite", "imageUrl": "", "meaning": "a toy that flies in the wind"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Toys';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "cinema", "imageUrl": "", "meaning": "a place to watch movies"},
  {"word": "post office", "imageUrl": "", "meaning": "a place to send letters and packages"},
  {"word": "supermarket", "imageUrl": "", "meaning": "a big store to buy food"},
  {"word": "police station", "imageUrl": "", "meaning": "a place where police officers work"},
  {"word": "swimming pool", "imageUrl": "", "meaning": "a place to swim"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Places';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "downtown", "imageUrl": "", "meaning": "the busy center of a city"},
  {"word": "public transport", "imageUrl": "", "meaning": "buses, trains, etc. that everyone can use"},
  {"word": "traffic congestion", "imageUrl": "", "meaning": "too many cars causing delays"},
  {"word": "rush hour", "imageUrl": "", "meaning": "the busiest time for traffic"},
  {"word": "concrete jungle", "imageUrl": "", "meaning": "a crowded city full of buildings"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'City Life';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "red", "imageUrl": "", "meaning": "the color of an apple"},
  {"word": "blue", "imageUrl": "", "meaning": "the color of the sky"},
  {"word": "yellow", "imageUrl": "", "meaning": "the color of the sun"},
  {"word": "green", "imageUrl": "", "meaning": "the color of grass"},
  {"word": "pink", "imageUrl": "", "meaning": "a light red color"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Colors';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "mom", "imageUrl": "", "meaning": "your female parent"},
  {"word": "dad", "imageUrl": "", "meaning": "your male parent"},
  {"word": "sister", "imageUrl": "", "meaning": "a girl in your family"},
  {"word": "brother", "imageUrl": "", "meaning": "a boy in your family"},
  {"word": "baby", "imageUrl": "", "meaning": "a very young child"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Family';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "apple", "imageUrl": "", "meaning": "a round, sweet fruit"},
  {"word": "banana", "imageUrl": "", "meaning": "a long yellow fruit"},
  {"word": "milk", "imageUrl": "", "meaning": "a white drink from cows"},
  {"word": "egg", "imageUrl": "", "meaning": "a food that comes from hens"},
  {"word": "bread", "imageUrl": "", "meaning": "a food made from flour"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Food';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "head", "imageUrl": "", "meaning": "the top part of your body"},
  {"word": "hand", "imageUrl": "", "meaning": "the part you use to hold things"},
  {"word": "foot", "imageUrl": "", "meaning": "the part you walk on"},
  {"word": "eye", "imageUrl": "", "meaning": "the part you see with"},
  {"word": "nose", "imageUrl": "", "meaning": "the part you smell with"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Body Parts';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "one", "imageUrl": "", "meaning": "the number 1"},
  {"word": "two", "imageUrl": "", "meaning": "the number 2"},
  {"word": "three", "imageUrl": "", "meaning": "the number 3"},
  {"word": "four", "imageUrl": "", "meaning": "the number 4"},
  {"word": "five", "imageUrl": "", "meaning": "the number 5"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Numbers';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "circle", "imageUrl": "", "meaning": "a round shape"},
  {"word": "square", "imageUrl": "", "meaning": "a shape with 4 equal sides"},
  {"word": "triangle", "imageUrl": "", "meaning": "a shape with 3 sides"},
  {"word": "star", "imageUrl": "", "meaning": "a shape with points, like in the night sky"},
  {"word": "heart", "imageUrl": "", "meaning": "a shape that means love"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Shapes';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "sun", "imageUrl": "", "meaning": "the bright light in the sky"},
  {"word": "rain", "imageUrl": "", "meaning": "water that falls from clouds"},
  {"word": "cloud", "imageUrl": "", "meaning": "a white shape floating in the sky"},
  {"word": "wind", "imageUrl": "", "meaning": "moving air"},
  {"word": "snow", "imageUrl": "", "meaning": "soft white flakes that fall when it's cold"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Weather';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "hat", "imageUrl": "", "meaning": "something you wear on your head"},
  {"word": "shoes", "imageUrl": "", "meaning": "something you wear on your feet"},
  {"word": "socks", "imageUrl": "", "meaning": "soft clothes for your feet"},
  {"word": "dress", "imageUrl": "", "meaning": "clothing girls wear"},
  {"word": "coat", "imageUrl": "", "meaning": "warm clothing for outside"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Clothes';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "cow", "imageUrl": "", "meaning": "a farm animal that gives milk"},
  {"word": "pig", "imageUrl": "", "meaning": "a farm animal that says oink"},
  {"word": "hen", "imageUrl": "", "meaning": "a female chicken"},
  {"word": "duck", "imageUrl": "", "meaning": "a bird that swims and says quack"},
  {"word": "sheep", "imageUrl": "", "meaning": "a farm animal with wool"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Farm Animals';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "orange", "imageUrl": "", "meaning": "a round orange fruit"},
  {"word": "grape", "imageUrl": "", "meaning": "a small, round fruit that grows in bunches"},
  {"word": "mango", "imageUrl": "", "meaning": "a sweet, juicy tropical fruit"},
  {"word": "pear", "imageUrl": "", "meaning": "a green or yellow fruit"},
  {"word": "lemon", "imageUrl": "", "meaning": "a sour yellow fruit"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Fruits';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "book", "imageUrl": "", "meaning": "something you read"},
  {"word": "pen", "imageUrl": "", "meaning": "something you write with"},
  {"word": "bag", "imageUrl": "", "meaning": "something you carry things in"},
  {"word": "ruler", "imageUrl": "", "meaning": "a tool to measure or draw straight lines"},
  {"word": "eraser", "imageUrl": "", "meaning": "something that removes pencil marks"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'School Things';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "football", "imageUrl": "", "meaning": "a sport played by kicking a ball"},
  {"word": "swimming", "imageUrl": "", "meaning": "moving through water"},
  {"word": "running", "imageUrl": "", "meaning": "moving fast on your feet"},
  {"word": "jumping", "imageUrl": "", "meaning": "pushing off the ground into the air"},
  {"word": "tennis", "imageUrl": "", "meaning": "a sport played with rackets and a ball"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Sports';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "doctor", "imageUrl": "", "meaning": "a person who helps sick people"},
  {"word": "teacher", "imageUrl": "", "meaning": "a person who helps you learn"},
  {"word": "farmer", "imageUrl": "", "meaning": "a person who grows food"},
  {"word": "driver", "imageUrl": "", "meaning": "a person who drives vehicles"},
  {"word": "chef", "imageUrl": "", "meaning": "a person who cooks food"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Jobs';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "dog", "imageUrl": "", "meaning": "a common pet that barks"},
  {"word": "cat", "imageUrl": "", "meaning": "a common pet that meows"},
  {"word": "fish", "imageUrl": "", "meaning": "a pet that lives in water"},
  {"word": "rabbit", "imageUrl": "", "meaning": "a pet with long ears"},
  {"word": "hamster", "imageUrl": "", "meaning": "a small furry pet"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Pets';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "kitchen", "imageUrl": "", "meaning": "the room where you cook"},
  {"word": "bedroom", "imageUrl": "", "meaning": "the room where you sleep"},
  {"word": "bathroom", "imageUrl": "", "meaning": "the room where you wash"},
  {"word": "living room", "imageUrl": "", "meaning": "the room where families relax"},
  {"word": "garden", "imageUrl": "", "meaning": "the outdoor area where plants grow"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Rooms in a House';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "Monday", "imageUrl": "", "meaning": "the first day of the school week"},
  {"word": "Tuesday", "imageUrl": "", "meaning": "the second day of the week"},
  {"word": "Wednesday", "imageUrl": "", "meaning": "the middle day of the week"},
  {"word": "Thursday", "imageUrl": "", "meaning": "the day before Friday"},
  {"word": "Friday", "imageUrl": "", "meaning": "the last school day of the week"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Days of the Week';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "spring", "imageUrl": "", "meaning": "the season when flowers bloom"},
  {"word": "summer", "imageUrl": "", "meaning": "the hottest season"},
  {"word": "autumn", "imageUrl": "", "meaning": "the season when leaves fall"},
  {"word": "winter", "imageUrl": "", "meaning": "the coldest season"},
  {"word": "weather", "imageUrl": "", "meaning": "what it's like outside, like sunny or rainy"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Seasons';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "bus", "imageUrl": "", "meaning": "a big vehicle for many passengers"},
  {"word": "car", "imageUrl": "", "meaning": "a small vehicle for a few people"},
  {"word": "bike", "imageUrl": "", "meaning": "a vehicle with two wheels"},
  {"word": "boat", "imageUrl": "", "meaning": "a vehicle that travels on water"},
  {"word": "plane", "imageUrl": "", "meaning": "a vehicle that flies in the sky"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Transport';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "happy", "imageUrl": "", "meaning": "feeling good and cheerful"},
  {"word": "sad", "imageUrl": "", "meaning": "feeling unhappy"},
  {"word": "angry", "imageUrl": "", "meaning": "feeling upset or mad"},
  {"word": "tired", "imageUrl": "", "meaning": "needing rest or sleep"},
  {"word": "excited", "imageUrl": "", "meaning": "feeling very happy about something"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Feelings';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "carrot", "imageUrl": "", "meaning": "an orange vegetable"},
  {"word": "potato", "imageUrl": "", "meaning": "a brown vegetable that grows underground"},
  {"word": "tomato", "imageUrl": "", "meaning": "a red, round vegetable"},
  {"word": "cucumber", "imageUrl": "", "meaning": "a long green vegetable"},
  {"word": "corn", "imageUrl": "", "meaning": "a yellow vegetable with small kernels"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Fruits and Vegetables';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "reading", "imageUrl": "", "meaning": "looking at and understanding words"},
  {"word": "painting", "imageUrl": "", "meaning": "creating pictures with paint"},
  {"word": "cycling", "imageUrl": "", "meaning": "riding a bike"},
  {"word": "dancing", "imageUrl": "", "meaning": "moving your body to music"},
  {"word": "gaming", "imageUrl": "", "meaning": "playing video games"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Free Time Activities';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "Math", "imageUrl": "", "meaning": "the subject about numbers"},
  {"word": "Science", "imageUrl": "", "meaning": "the subject about how things work"},
  {"word": "Art", "imageUrl": "", "meaning": "the subject about drawing and creating"},
  {"word": "Music", "imageUrl": "", "meaning": "the subject about songs and sounds"},
  {"word": "History", "imageUrl": "", "meaning": "the subject about the past"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'School Subjects';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "mountain", "imageUrl": "", "meaning": "a very tall landform"},
  {"word": "river", "imageUrl": "", "meaning": "a long stream of flowing water"},
  {"word": "forest", "imageUrl": "", "meaning": "a large area full of trees"},
  {"word": "beach", "imageUrl": "", "meaning": "the sandy area next to the sea"},
  {"word": "desert", "imageUrl": "", "meaning": "a dry area with very little rain"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Nature';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "hospital", "imageUrl": "", "meaning": "a place where sick people are treated"},
  {"word": "medicine", "imageUrl": "", "meaning": "something you take to feel better"},
  {"word": "exercise", "imageUrl": "", "meaning": "physical activity to stay fit"},
  {"word": "doctor", "imageUrl": "", "meaning": "a person who treats sick people"},
  {"word": "rest", "imageUrl": "", "meaning": "relaxing to recover energy"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Health';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "computer", "imageUrl": "", "meaning": "a machine for work and information"},
  {"word": "phone", "imageUrl": "", "meaning": "a device for calling and messaging"},
  {"word": "internet", "imageUrl": "", "meaning": "a network connecting computers worldwide"},
  {"word": "robot", "imageUrl": "", "meaning": "a machine that can do tasks on its own"},
  {"word": "camera", "imageUrl": "", "meaning": "a device that takes pictures"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Technology';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "Tet", "imageUrl": "", "meaning": "Vietnamese Lunar New Year"},
  {"word": "Christmas", "imageUrl": "", "meaning": "a holiday celebrated in December"},
  {"word": "birthday", "imageUrl": "", "meaning": "the day you celebrate being born"},
  {"word": "wedding", "imageUrl": "", "meaning": "a ceremony where two people marry"},
  {"word": "New Year", "imageUrl": "", "meaning": "the start of a new calendar year"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Festivals';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "lion", "imageUrl": "", "meaning": "a large wild cat known as king of the jungle"},
  {"word": "elephant", "imageUrl": "", "meaning": "a huge animal with a long trunk"},
  {"word": "giraffe", "imageUrl": "", "meaning": "a tall animal with a long neck"},
  {"word": "monkey", "imageUrl": "", "meaning": "a playful animal that climbs trees"},
  {"word": "tiger", "imageUrl": "", "meaning": "a large wild cat with stripes"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Zoo Animals';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "firefighter", "imageUrl": "", "meaning": "a person who puts out fires"},
  {"word": "police officer", "imageUrl": "", "meaning": "a person who keeps people safe"},
  {"word": "nurse", "imageUrl": "", "meaning": "a person who cares for sick people"},
  {"word": "engineer", "imageUrl": "", "meaning": "a person who builds and designs things"},
  {"word": "farmer", "imageUrl": "", "meaning": "a person who grows crops"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Community Helpers';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "menu", "imageUrl": "", "meaning": "a list of food you can order"},
  {"word": "order", "imageUrl": "", "meaning": "to ask for food at a restaurant"},
  {"word": "waiter", "imageUrl": "", "meaning": "a person who serves food"},
  {"word": "bill", "imageUrl": "", "meaning": "the paper showing how much to pay"},
  {"word": "delicious", "imageUrl": "", "meaning": "very tasty"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Food and Restaurant';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "airport", "imageUrl": "", "meaning": "a place where planes take off and land"},
  {"word": "hotel", "imageUrl": "", "meaning": "a place where travelers stay"},
  {"word": "ticket", "imageUrl": "", "meaning": "a paper that lets you travel or enter somewhere"},
  {"word": "luggage", "imageUrl": "", "meaning": "the bags you bring when you travel"},
  {"word": "passport", "imageUrl": "", "meaning": "a document for traveling to other countries"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Travel';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "pollution", "imageUrl": "", "meaning": "harmful substances that damage nature"},
  {"word": "recycling", "imageUrl": "", "meaning": "turning waste into new products"},
  {"word": "climate change", "imageUrl": "", "meaning": "long-term changes in the Earth's weather"},
  {"word": "deforestation", "imageUrl": "", "meaning": "cutting down large areas of forest"},
  {"word": "renewable energy", "imageUrl": "", "meaning": "power from sources that never run out, like the sun"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Environment';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "smartphone", "imageUrl": "", "meaning": "a mobile phone with internet and apps"},
  {"word": "social media", "imageUrl": "", "meaning": "websites and apps for sharing and connecting"},
  {"word": "addiction", "imageUrl": "", "meaning": "being unable to stop doing something"},
  {"word": "privacy", "imageUrl": "", "meaning": "keeping your personal information safe"},
  {"word": "connection", "imageUrl": "", "meaning": "a link between people or things"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Technology & Social Media';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "exam pressure", "imageUrl": "", "meaning": "stress caused by tests"},
  {"word": "online learning", "imageUrl": "", "meaning": "studying through the internet"},
  {"word": "extracurricular activities", "imageUrl": "", "meaning": "activities outside of regular classes"},
  {"word": "university", "imageUrl": "", "meaning": "a school for higher education"},
  {"word": "skills", "imageUrl": "", "meaning": "abilities you learn and practice"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Education';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "junk food", "imageUrl": "", "meaning": "unhealthy food with little nutrition"},
  {"word": "obesity", "imageUrl": "", "meaning": "having too much body weight"},
  {"word": "exercise", "imageUrl": "", "meaning": "physical activity to stay healthy"},
  {"word": "mental health", "imageUrl": "", "meaning": "the state of your emotional wellbeing"},
  {"word": "balance", "imageUrl": "", "meaning": "having a healthy mix of activities"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Health & Lifestyle';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "career choices", "imageUrl": "", "meaning": "decisions about your future job"},
  {"word": "passion", "imageUrl": "", "meaning": "a strong love for something"},
  {"word": "salary", "imageUrl": "", "meaning": "money you earn from a job"},
  {"word": "job market", "imageUrl": "", "meaning": "the availability of jobs"},
  {"word": "internship", "imageUrl": "", "meaning": "short-term work experience"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Career Choices';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "globalization", "imageUrl": "", "meaning": "the world becoming more connected"},
  {"word": "culture", "imageUrl": "", "meaning": "the beliefs and customs of a group"},
  {"word": "language", "imageUrl": "", "meaning": "a system used to communicate"},
  {"word": "trade", "imageUrl": "", "meaning": "buying and selling between countries"},
  {"word": "technology", "imageUrl": "", "meaning": "tools and machines created by science"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Globalization';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "generation gap", "imageUrl": "", "meaning": "differences between older and younger people"},
  {"word": "traditional values", "imageUrl": "", "meaning": "beliefs passed down through generations"},
  {"word": "modern family", "imageUrl": "", "meaning": "a family with today's lifestyle"},
  {"word": "communication", "imageUrl": "", "meaning": "sharing information with others"},
  {"word": "society", "imageUrl": "", "meaning": "a community of people living together"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Family & Society';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "tourism", "imageUrl": "", "meaning": "traveling for pleasure"},
  {"word": "culture", "imageUrl": "", "meaning": "the customs and traditions of a place"},
  {"word": "environment", "imageUrl": "", "meaning": "the natural world around us"},
  {"word": "economy", "imageUrl": "", "meaning": "the system of money and resources"},
  {"word": "experience", "imageUrl": "", "meaning": "something you go through or learn from"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Travel & Tourism';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "volunteering", "imageUrl": "", "meaning": "helping others without being paid"},
  {"word": "community service", "imageUrl": "", "meaning": "work done to help your local area"},
  {"word": "benefits", "imageUrl": "", "meaning": "positive results or advantages"},
  {"word": "teamwork", "imageUrl": "", "meaning": "working together with others"},
  {"word": "kindness", "imageUrl": "", "meaning": "being caring and generous"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Volunteering';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "automation", "imageUrl": "", "meaning": "using machines instead of people"},
  {"word": "artificial intelligence", "imageUrl": "", "meaning": "computer systems that can think like humans"},
  {"word": "jobs", "imageUrl": "", "meaning": "work that people do"},
  {"word": "skills", "imageUrl": "", "meaning": "abilities needed to do something well"},
  {"word": "adapt", "imageUrl": "", "meaning": "to change to fit new situations"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Future of Work';
