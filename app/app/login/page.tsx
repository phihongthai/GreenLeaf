'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const ROLE_HOME: Record<string, string> = {
  student: '/grades',
  teacher: '/teacher/homework',
  parent: '/parent/dashboard',
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Tài khoản do giáo viên tạo (học sinh/phụ huynh) đăng nhập bằng username, không phải
    // email thật — quy đổi về email giả "<username>@greenleaf.local" khi input không có "@".
    const email = identifier.includes('@') ? identifier : `${identifier.trim().toLowerCase()}@greenleaf.local`;

    const supabase = createClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError('Sai tên đăng nhập/email hoặc mật khẩu.');
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from('greenleaf_profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    const redirect = searchParams.get('redirect');
    router.push(redirect || ROLE_HOME[profile?.role ?? ''] || '/');
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center gl-playful-bg px-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-lg p-8 space-y-6">
        <div className="text-center space-y-1">
          <div className="text-4xl">🌱</div>
          <h1 className="text-xl font-extrabold text-[#2E4A34]">GreenLeaf English Academy</h1>
          <p className="text-sm text-gray-400">Đăng nhập để tiếp tục</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Email hoặc Username</label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Học sinh dùng username giáo viên đã cấp"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A7D44]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Mật khẩu</label>
            <input
              type="password"
              required
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
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400">
          Chưa có tài khoản?{' '}
          <Link href="/register" className="text-[#3A7D44] font-semibold hover:underline">
            Đăng ký
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
