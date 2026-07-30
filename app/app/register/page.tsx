'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'teacher' | 'parent'>('teacher');
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
        data: { name, role },
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

    router.push(role === 'teacher' ? '/teacher/dashboard' : '/parent/dashboard');
    router.refresh();
  };

  if (needsConfirmation) {
    return (
      <div className="min-h-screen flex items-center justify-center gl-playful-bg px-4">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-lg p-8 text-center space-y-3">
          <div className="text-4xl">📧</div>
          <p className="text-gray-700 font-semibold">Check your email to confirm your account before signing in.</p>
          <Link href="/login" className="text-[#3A7D44] font-semibold hover:underline">
            Back to sign in
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
          <h1 className="text-xl font-extrabold text-[#3A7D44]">Create a GreenLeaf Account</h1>
          <p className="text-xs text-gray-400">For Teachers / Parents — student accounts are created by teachers in the app.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">I am a</label>
            <div className="grid grid-cols-2 gap-2">
              {(['teacher', 'parent'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                    role === r ? 'bg-[#3A7D44] text-white border-[#3A7D44]' : 'bg-white text-gray-500 border-gray-200'
                  }`}
                >
                  {r === 'teacher' ? 'Teacher' : 'Parent'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Full name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A7D44]"
            />
          </div>

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
            <label className="block text-xs font-semibold text-gray-500 mb-1">Password</label>
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
            {loading ? 'Creating...' : 'Sign up'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="text-[#3A7D44] font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
