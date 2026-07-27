'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const SLIDES = [
  {
    emoji: '👋',
    title: 'Chào mừng đến GreenLeaf!',
    body: 'Đây là app luyện nói tiếng Anh cùng AI. Để mèo Brave chỉ con cách dùng nhé!',
  },
  {
    emoji: '📚',
    title: 'Chọn 1 bài học',
    body: 'Trang chính có danh sách bài học. Bấm vào 1 bài (ô có tên bài) để bắt đầu luyện.',
  },
  {
    emoji: '🎤',
    title: 'Nghe rồi ghi âm',
    body: 'Mỗi bài có 3 phần nhỏ. Nghe từ/câu mẫu trước, rồi bấm nút xanh để ghi âm đọc theo, bấm nút đỏ khi đọc xong.',
  },
  {
    emoji: '🍃',
    title: 'Đọc đạt là có lá!',
    body: 'Điểm từ 80 trở lên là qua phần tiếp theo, được cộng lá 🍃. Chưa đạt cũng không sao — đọc lại bao nhiêu lần cũng được!',
  },
  {
    emoji: '🔥',
    title: 'Học đều mỗi ngày',
    body: 'Học mỗi ngày để giữ chuỗi ngày học, mang lá tích lũy được tới trung tâm đổi quà nhé!',
  },
];

const storageKey = (userId: string) => `greenleaf_onboarding_seen_${userId}`;

export default function FirstTimeGuide({ userId }: { userId: string | null }) {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!userId) return;
    try {
      if (!localStorage.getItem(storageKey(userId))) setVisible(true);
    } catch {
      // localStorage không khả dụng (chế độ ẩn danh...) — bỏ qua, không chặn app.
    }
  }, [userId]);

  const dismiss = () => {
    setVisible(false);
    if (userId) {
      try {
        localStorage.setItem(storageKey(userId), '1');
      } catch {
        // ignore
      }
    }
  };

  if (!visible) return null;

  const slide = SLIDES[step];
  const isLast = step === SLIDES.length - 1;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl max-w-sm w-full p-6 space-y-5 gl-pop-in">
        <div className="text-center space-y-3">
          <div className="text-6xl gl-float">{slide.emoji}</div>
          <h2 className="text-xl font-extrabold text-[#2E4A34]">{slide.title}</h2>
          <p className="text-sm text-gray-500 leading-relaxed">{slide.body}</p>
        </div>

        <div className="flex justify-center gap-1.5">
          {SLIDES.map((_, i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${i === step ? 'bg-[#3A7D44]' : 'bg-gray-200'}`}
            />
          ))}
        </div>

        {isLast ? (
          <div className="space-y-2">
            <button
              onClick={dismiss}
              className="w-full bg-[#3A7D44] hover:bg-[#2E4A34] text-white font-extrabold py-3 rounded-xl transition-colors"
            >
              Bắt đầu học →
            </button>
            <Link
              href="/help"
              onClick={dismiss}
              className="block text-center text-xs font-bold text-gray-400 hover:text-[#3A7D44] transition-colors"
            >
              Xem hướng dẫn đầy đủ
            </Link>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <button onClick={dismiss} className="text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors">
              Bỏ qua
            </button>
            <button
              onClick={() => setStep((s) => s + 1)}
              className="bg-[#3A7D44] hover:bg-[#2E4A34] text-white font-extrabold py-2 px-5 rounded-xl text-sm transition-colors"
            >
              Tiếp theo →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
