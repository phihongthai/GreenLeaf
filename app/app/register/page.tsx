'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const GRADES = [
  { code: 'kindergarten', name: 'Kindergarten (2.5-6 tuổi)' },
  { code: 'kids1', name: 'Kids 1 (Lớp 1-2-3)' },
  { code: 'kids2', name: 'Kids 2 (Lớp 4-5)' },
  { code: 'teens', name: 'Teens (THCS & THPT)' },
];

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'teacher' | 'parent'>('student');
  const [gradeCode, setGradeCode] = useState(GRADES[0].code);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role, grade_code: role === 'student' ? gradeCode : null },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (!data.session) {
      setNeedsConfirmation(true);
      setLoading(false);
      return;
    }

    router.push(role === 'student' ? '/grades' : role === 'teacher' ? '/teacher/homework' : '/parent/dashboard');
    router.refresh();
  };

  if (needsConfirmation) {
    return (
      <div className="min-h-screen flex items-center justify-center gl-playful-bg px-4">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-lg p-8 text-center space-y-3">
          <div className="text-4xl">📧</div>
          <p className="text-gray-700 font-semibold">Kiểm tra email để xác nhận tài khoản trước khi đăng nhập.</p>
          <Link href="/login" className="text-[#3A7D44] font-semibold hover:underline">
            Về trang đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center gl-playful-bg px-4 py-10">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-lg p-8 space-y-6">
        <div className="text-center space-y-1">
          <div className="text-4xl">🌱</div>
          <h1 className="text-xl font-extrabold text-[#2E4A34]">Tạo tài khoản GreenLeaf</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Bạn là</label>
            <div className="grid grid-cols-3 gap-2">
              {(['student', 'teacher', 'parent'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                    role === r ? 'bg-[#3A7D44] text-white border-[#3A7D44]' : 'bg-white text-gray-500 border-gray-200'
                  }`}
                >
                  {r === 'student' ? 'Học sinh' : r === 'teacher' ? 'Giáo viên' : 'Phụ huynh'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Họ tên</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A7D44]"
            />
          </div>

          {role === 'student' && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Cấp độ</label>
              <select
                value={gradeCode}
                onChange={(e) => setGradeCode(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A7D44]"
              >
                {GRADES.map((g) => (
                  <option key={g.code} value={g.code}>{g.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A7D44]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Mật khẩu</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A7D44]"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#3A7D44] hover:bg-[#2E4A34] disabled:opacity-60 text-white font-bold py-2.5 rounded-xl transition-colors"
          >
            {loading ? 'Đang tạo...' : 'Đăng ký'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400">
          Đã có tài khoản?{' '}
          <Link href="/login" className="text-[#3A7D44] font-semibold hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
