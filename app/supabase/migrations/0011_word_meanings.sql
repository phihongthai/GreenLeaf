-- Thêm nghĩa tiếng Việt cho từng từ vựng trong mọi mission Words Explorer đã seed (0002 +
-- 0009) — học sinh (và phụ huynh không biết tiếng Anh) cần tự hiểu nghĩa từ, không chỉ nghe
-- phát âm. Cập nhật tại chỗ (UPDATE), không tạo lesson/mission mới nên an toàn chạy lại nhiều
-- lần (idempotent tự nhiên vì luôn ghi đè cùng 1 giá trị).

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "cat", "imageUrl": "", "meaning": "con mèo"},
  {"word": "dog", "imageUrl": "", "meaning": "con chó"},
  {"word": "bird", "imageUrl": "", "meaning": "con chim"},
  {"word": "rat", "imageUrl": "", "meaning": "con chuột"},
  {"word": "lizard", "imageUrl": "", "meaning": "con thằn lằn"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Animals';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "car", "imageUrl": "", "meaning": "xe hơi"},
  {"word": "train", "imageUrl": "", "meaning": "tàu hỏa"},
  {"word": "robot", "imageUrl": "", "meaning": "người máy"},
  {"word": "bike", "imageUrl": "", "meaning": "xe đạp"},
  {"word": "kite", "imageUrl": "", "meaning": "diều"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Toys';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "cinema", "imageUrl": "", "meaning": "rạp chiếu phim"},
  {"word": "post office", "imageUrl": "", "meaning": "bưu điện"},
  {"word": "supermarket", "imageUrl": "", "meaning": "siêu thị"},
  {"word": "police station", "imageUrl": "", "meaning": "đồn công an"},
  {"word": "swimming pool", "imageUrl": "", "meaning": "hồ bơi"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Places';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "downtown", "imageUrl": "", "meaning": "trung tâm thành phố"},
  {"word": "public transport", "imageUrl": "", "meaning": "phương tiện công cộng"},
  {"word": "traffic congestion", "imageUrl": "", "meaning": "tắc đường"},
  {"word": "rush hour", "imageUrl": "", "meaning": "giờ cao điểm"},
  {"word": "concrete jungle", "imageUrl": "", "meaning": "rừng bê tông (đô thị đông đúc)"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'City Life';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "red", "imageUrl": "", "meaning": "màu đỏ"},
  {"word": "blue", "imageUrl": "", "meaning": "màu xanh dương"},
  {"word": "yellow", "imageUrl": "", "meaning": "màu vàng"},
  {"word": "green", "imageUrl": "", "meaning": "màu xanh lá"},
  {"word": "pink", "imageUrl": "", "meaning": "màu hồng"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Colors';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "mom", "imageUrl": "", "meaning": "mẹ"},
  {"word": "dad", "imageUrl": "", "meaning": "bố"},
  {"word": "sister", "imageUrl": "", "meaning": "chị/em gái"},
  {"word": "brother", "imageUrl": "", "meaning": "anh/em trai"},
  {"word": "baby", "imageUrl": "", "meaning": "em bé"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Family';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "apple", "imageUrl": "", "meaning": "quả táo"},
  {"word": "banana", "imageUrl": "", "meaning": "quả chuối"},
  {"word": "milk", "imageUrl": "", "meaning": "sữa"},
  {"word": "egg", "imageUrl": "", "meaning": "quả trứng"},
  {"word": "bread", "imageUrl": "", "meaning": "bánh mì"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Food';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "head", "imageUrl": "", "meaning": "cái đầu"},
  {"word": "hand", "imageUrl": "", "meaning": "bàn tay"},
  {"word": "foot", "imageUrl": "", "meaning": "bàn chân"},
  {"word": "eye", "imageUrl": "", "meaning": "mắt"},
  {"word": "nose", "imageUrl": "", "meaning": "mũi"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Body Parts';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "one", "imageUrl": "", "meaning": "một"},
  {"word": "two", "imageUrl": "", "meaning": "hai"},
  {"word": "three", "imageUrl": "", "meaning": "ba"},
  {"word": "four", "imageUrl": "", "meaning": "bốn"},
  {"word": "five", "imageUrl": "", "meaning": "năm"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Numbers';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "circle", "imageUrl": "", "meaning": "hình tròn"},
  {"word": "square", "imageUrl": "", "meaning": "hình vuông"},
  {"word": "triangle", "imageUrl": "", "meaning": "hình tam giác"},
  {"word": "star", "imageUrl": "", "meaning": "ngôi sao"},
  {"word": "heart", "imageUrl": "", "meaning": "trái tim"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Shapes';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "sun", "imageUrl": "", "meaning": "mặt trời"},
  {"word": "rain", "imageUrl": "", "meaning": "mưa"},
  {"word": "cloud", "imageUrl": "", "meaning": "mây"},
  {"word": "wind", "imageUrl": "", "meaning": "gió"},
  {"word": "snow", "imageUrl": "", "meaning": "tuyết"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Weather';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "hat", "imageUrl": "", "meaning": "mũ"},
  {"word": "shoes", "imageUrl": "", "meaning": "giày"},
  {"word": "socks", "imageUrl": "", "meaning": "tất"},
  {"word": "dress", "imageUrl": "", "meaning": "váy"},
  {"word": "coat", "imageUrl": "", "meaning": "áo khoác"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Clothes';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "cow", "imageUrl": "", "meaning": "con bò"},
  {"word": "pig", "imageUrl": "", "meaning": "con lợn"},
  {"word": "hen", "imageUrl": "", "meaning": "gà mái"},
  {"word": "duck", "imageUrl": "", "meaning": "con vịt"},
  {"word": "sheep", "imageUrl": "", "meaning": "con cừu"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Farm Animals';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "orange", "imageUrl": "", "meaning": "quả cam"},
  {"word": "grape", "imageUrl": "", "meaning": "quả nho"},
  {"word": "mango", "imageUrl": "", "meaning": "quả xoài"},
  {"word": "pear", "imageUrl": "", "meaning": "quả lê"},
  {"word": "lemon", "imageUrl": "", "meaning": "quả chanh"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Fruits';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "book", "imageUrl": "", "meaning": "quyển sách"},
  {"word": "pen", "imageUrl": "", "meaning": "cây bút"},
  {"word": "bag", "imageUrl": "", "meaning": "cặp sách"},
  {"word": "ruler", "imageUrl": "", "meaning": "thước kẻ"},
  {"word": "eraser", "imageUrl": "", "meaning": "cục tẩy"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'School Things';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "football", "imageUrl": "", "meaning": "bóng đá"},
  {"word": "swimming", "imageUrl": "", "meaning": "bơi lội"},
  {"word": "running", "imageUrl": "", "meaning": "chạy bộ"},
  {"word": "jumping", "imageUrl": "", "meaning": "nhảy"},
  {"word": "tennis", "imageUrl": "", "meaning": "quần vợt"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Sports';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "doctor", "imageUrl": "", "meaning": "bác sĩ"},
  {"word": "teacher", "imageUrl": "", "meaning": "giáo viên"},
  {"word": "farmer", "imageUrl": "", "meaning": "nông dân"},
  {"word": "driver", "imageUrl": "", "meaning": "tài xế"},
  {"word": "chef", "imageUrl": "", "meaning": "đầu bếp"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Jobs';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "dog", "imageUrl": "", "meaning": "con chó"},
  {"word": "cat", "imageUrl": "", "meaning": "con mèo"},
  {"word": "fish", "imageUrl": "", "meaning": "con cá"},
  {"word": "rabbit", "imageUrl": "", "meaning": "con thỏ"},
  {"word": "hamster", "imageUrl": "", "meaning": "chuột hamster"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Pets';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "kitchen", "imageUrl": "", "meaning": "nhà bếp"},
  {"word": "bedroom", "imageUrl": "", "meaning": "phòng ngủ"},
  {"word": "bathroom", "imageUrl": "", "meaning": "phòng tắm"},
  {"word": "living room", "imageUrl": "", "meaning": "phòng khách"},
  {"word": "garden", "imageUrl": "", "meaning": "khu vườn"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Rooms in a House';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "Monday", "imageUrl": "", "meaning": "thứ Hai"},
  {"word": "Tuesday", "imageUrl": "", "meaning": "thứ Ba"},
  {"word": "Wednesday", "imageUrl": "", "meaning": "thứ Tư"},
  {"word": "Thursday", "imageUrl": "", "meaning": "thứ Năm"},
  {"word": "Friday", "imageUrl": "", "meaning": "thứ Sáu"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Days of the Week';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "spring", "imageUrl": "", "meaning": "mùa xuân"},
  {"word": "summer", "imageUrl": "", "meaning": "mùa hè"},
  {"word": "autumn", "imageUrl": "", "meaning": "mùa thu"},
  {"word": "winter", "imageUrl": "", "meaning": "mùa đông"},
  {"word": "weather", "imageUrl": "", "meaning": "thời tiết"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Seasons';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "bus", "imageUrl": "", "meaning": "xe buýt"},
  {"word": "car", "imageUrl": "", "meaning": "xe hơi"},
  {"word": "bike", "imageUrl": "", "meaning": "xe đạp"},
  {"word": "boat", "imageUrl": "", "meaning": "thuyền"},
  {"word": "plane", "imageUrl": "", "meaning": "máy bay"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Transport';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "happy", "imageUrl": "", "meaning": "vui"},
  {"word": "sad", "imageUrl": "", "meaning": "buồn"},
  {"word": "angry", "imageUrl": "", "meaning": "giận dữ"},
  {"word": "tired", "imageUrl": "", "meaning": "mệt mỏi"},
  {"word": "excited", "imageUrl": "", "meaning": "hào hứng"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Feelings';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "carrot", "imageUrl": "", "meaning": "cà rốt"},
  {"word": "potato", "imageUrl": "", "meaning": "khoai tây"},
  {"word": "tomato", "imageUrl": "", "meaning": "cà chua"},
  {"word": "cucumber", "imageUrl": "", "meaning": "dưa chuột"},
  {"word": "corn", "imageUrl": "", "meaning": "bắp"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Fruits and Vegetables';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "reading", "imageUrl": "", "meaning": "đọc sách"},
  {"word": "painting", "imageUrl": "", "meaning": "vẽ tranh"},
  {"word": "cycling", "imageUrl": "", "meaning": "đạp xe"},
  {"word": "dancing", "imageUrl": "", "meaning": "nhảy múa"},
  {"word": "gaming", "imageUrl": "", "meaning": "chơi game"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Free Time Activities';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "Math", "imageUrl": "", "meaning": "môn Toán"},
  {"word": "Science", "imageUrl": "", "meaning": "môn Khoa học"},
  {"word": "Art", "imageUrl": "", "meaning": "môn Mỹ thuật"},
  {"word": "Music", "imageUrl": "", "meaning": "môn Âm nhạc"},
  {"word": "History", "imageUrl": "", "meaning": "môn Lịch sử"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'School Subjects';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "mountain", "imageUrl": "", "meaning": "núi"},
  {"word": "river", "imageUrl": "", "meaning": "sông"},
  {"word": "forest", "imageUrl": "", "meaning": "rừng"},
  {"word": "beach", "imageUrl": "", "meaning": "bãi biển"},
  {"word": "desert", "imageUrl": "", "meaning": "sa mạc"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Nature';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "hospital", "imageUrl": "", "meaning": "bệnh viện"},
  {"word": "medicine", "imageUrl": "", "meaning": "thuốc"},
  {"word": "exercise", "imageUrl": "", "meaning": "tập thể dục"},
  {"word": "doctor", "imageUrl": "", "meaning": "bác sĩ"},
  {"word": "rest", "imageUrl": "", "meaning": "nghỉ ngơi"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Health';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "computer", "imageUrl": "", "meaning": "máy tính"},
  {"word": "phone", "imageUrl": "", "meaning": "điện thoại"},
  {"word": "internet", "imageUrl": "", "meaning": "mạng internet"},
  {"word": "robot", "imageUrl": "", "meaning": "người máy"},
  {"word": "camera", "imageUrl": "", "meaning": "máy ảnh"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Technology';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "Tet", "imageUrl": "", "meaning": "Tết"},
  {"word": "Christmas", "imageUrl": "", "meaning": "lễ Giáng sinh"},
  {"word": "birthday", "imageUrl": "", "meaning": "sinh nhật"},
  {"word": "wedding", "imageUrl": "", "meaning": "đám cưới"},
  {"word": "New Year", "imageUrl": "", "meaning": "năm mới"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Festivals';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "lion", "imageUrl": "", "meaning": "sư tử"},
  {"word": "elephant", "imageUrl": "", "meaning": "voi"},
  {"word": "giraffe", "imageUrl": "", "meaning": "hươu cao cổ"},
  {"word": "monkey", "imageUrl": "", "meaning": "khỉ"},
  {"word": "tiger", "imageUrl": "", "meaning": "hổ"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Zoo Animals';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "firefighter", "imageUrl": "", "meaning": "lính cứu hỏa"},
  {"word": "police officer", "imageUrl": "", "meaning": "cảnh sát"},
  {"word": "nurse", "imageUrl": "", "meaning": "y tá"},
  {"word": "engineer", "imageUrl": "", "meaning": "kỹ sư"},
  {"word": "farmer", "imageUrl": "", "meaning": "nông dân"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Community Helpers';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "menu", "imageUrl": "", "meaning": "thực đơn"},
  {"word": "order", "imageUrl": "", "meaning": "gọi món"},
  {"word": "waiter", "imageUrl": "", "meaning": "nhân viên phục vụ"},
  {"word": "bill", "imageUrl": "", "meaning": "hóa đơn"},
  {"word": "delicious", "imageUrl": "", "meaning": "ngon"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Food and Restaurant';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "airport", "imageUrl": "", "meaning": "sân bay"},
  {"word": "hotel", "imageUrl": "", "meaning": "khách sạn"},
  {"word": "ticket", "imageUrl": "", "meaning": "vé"},
  {"word": "luggage", "imageUrl": "", "meaning": "hành lý"},
  {"word": "passport", "imageUrl": "", "meaning": "hộ chiếu"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Travel';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "pollution", "imageUrl": "", "meaning": "ô nhiễm"},
  {"word": "recycling", "imageUrl": "", "meaning": "tái chế"},
  {"word": "climate change", "imageUrl": "", "meaning": "biến đổi khí hậu"},
  {"word": "deforestation", "imageUrl": "", "meaning": "phá rừng"},
  {"word": "renewable energy", "imageUrl": "", "meaning": "năng lượng tái tạo"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Environment';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "smartphone", "imageUrl": "", "meaning": "điện thoại thông minh"},
  {"word": "social media", "imageUrl": "", "meaning": "mạng xã hội"},
  {"word": "addiction", "imageUrl": "", "meaning": "sự nghiện"},
  {"word": "privacy", "imageUrl": "", "meaning": "quyền riêng tư"},
  {"word": "connection", "imageUrl": "", "meaning": "sự kết nối"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Technology & Social Media';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "exam pressure", "imageUrl": "", "meaning": "áp lực thi cử"},
  {"word": "online learning", "imageUrl": "", "meaning": "học trực tuyến"},
  {"word": "extracurricular activities", "imageUrl": "", "meaning": "hoạt động ngoại khóa"},
  {"word": "university", "imageUrl": "", "meaning": "đại học"},
  {"word": "skills", "imageUrl": "", "meaning": "kỹ năng"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Education';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "junk food", "imageUrl": "", "meaning": "đồ ăn nhanh"},
  {"word": "obesity", "imageUrl": "", "meaning": "béo phì"},
  {"word": "exercise", "imageUrl": "", "meaning": "tập thể dục"},
  {"word": "mental health", "imageUrl": "", "meaning": "sức khỏe tinh thần"},
  {"word": "balance", "imageUrl": "", "meaning": "sự cân bằng"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Health & Lifestyle';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "career choices", "imageUrl": "", "meaning": "lựa chọn nghề nghiệp"},
  {"word": "passion", "imageUrl": "", "meaning": "đam mê"},
  {"word": "salary", "imageUrl": "", "meaning": "tiền lương"},
  {"word": "job market", "imageUrl": "", "meaning": "thị trường việc làm"},
  {"word": "internship", "imageUrl": "", "meaning": "kỳ thực tập"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Career Choices';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "globalization", "imageUrl": "", "meaning": "toàn cầu hóa"},
  {"word": "culture", "imageUrl": "", "meaning": "văn hóa"},
  {"word": "language", "imageUrl": "", "meaning": "ngôn ngữ"},
  {"word": "trade", "imageUrl": "", "meaning": "thương mại"},
  {"word": "technology", "imageUrl": "", "meaning": "công nghệ"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Globalization';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "generation gap", "imageUrl": "", "meaning": "khoảng cách thế hệ"},
  {"word": "traditional values", "imageUrl": "", "meaning": "giá trị truyền thống"},
  {"word": "modern family", "imageUrl": "", "meaning": "gia đình hiện đại"},
  {"word": "communication", "imageUrl": "", "meaning": "sự giao tiếp"},
  {"word": "society", "imageUrl": "", "meaning": "xã hội"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Family & Society';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "tourism", "imageUrl": "", "meaning": "du lịch"},
  {"word": "culture", "imageUrl": "", "meaning": "văn hóa"},
  {"word": "environment", "imageUrl": "", "meaning": "môi trường"},
  {"word": "economy", "imageUrl": "", "meaning": "kinh tế"},
  {"word": "experience", "imageUrl": "", "meaning": "trải nghiệm"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Travel & Tourism';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "volunteering", "imageUrl": "", "meaning": "hoạt động tình nguyện"},
  {"word": "community service", "imageUrl": "", "meaning": "hoạt động cộng đồng"},
  {"word": "benefits", "imageUrl": "", "meaning": "lợi ích"},
  {"word": "teamwork", "imageUrl": "", "meaning": "làm việc nhóm"},
  {"word": "kindness", "imageUrl": "", "meaning": "lòng tốt"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Volunteering';

UPDATE public.greenleaf_missions SET content = jsonb_set(content, '{words}', $json$[
  {"word": "automation", "imageUrl": "", "meaning": "tự động hóa"},
  {"word": "artificial intelligence", "imageUrl": "", "meaning": "trí tuệ nhân tạo"},
  {"word": "jobs", "imageUrl": "", "meaning": "công việc"},
  {"word": "skills", "imageUrl": "", "meaning": "kỹ năng"},
  {"word": "adapt", "imageUrl": "", "meaning": "thích nghi"}
]$json$::jsonb) WHERE type = 'words_explorer' AND content->>'topic' = 'Future of Work';
