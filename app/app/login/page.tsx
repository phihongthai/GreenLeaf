'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Eye, EyeOff, Sparkles } from 'lucide-react';
import LeafLogo from '@/components/brand/LeafLogo';

const ROLE_HOME: Record<string, string> = {
  student: '/grades',
  teacher: '/teacher/dashboard',
  parent: '/parent/dashboard',
  admin: '/admin/mystery-box',
};

/**
 * Role pill only changes login field hints, not permissions —
 * permissions come from the profile in DB.
 */
const ROLE_HINTS = [
  { key: 'student', label: 'Student', placeholder: 'e.g. an.nguyen', hint: 'Use the username your teacher gave you.' },
  { key: 'teacher', label: 'Teacher', placeholder: 'name@school.edu', hint: 'Use the email provided by the academy.' },
  { key: 'parent', label: 'Parent', placeholder: 'email@example.com', hint: 'Use the email you registered with the academy.' },
] as const;

type WelcomePhase = 'loading' | 'leafy-enter' | 'ready';

function WelcomeScreen({ destination }: { destination: string }) {
  const router = useRouter();
  const [phase, setPhase] = useState<WelcomePhase>('loading');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('leafy-enter'), 1500);
    const t2 = setTimeout(() => setPhase('ready'), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gl-playful-bg px-4 gap-7">
      {phase === 'loading' && (
        <div className="flex flex-col items-center gap-4 gl-pop-in">
          <LeafLogo size="lg" className="gl-float" />
          <p className="text-sm font-bold text-gl-muted">Getting ready...</p>
        </div>
      )}

      {phase !== 'loading' && (
        <>
          <div className="gl-slide-in-left flex flex-col items-center">
            <div className="w-56 overflow-hidden rounded-[28px] shadow-xl shadow-black/10 ring-4 ring-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/leafy/hero_wave.webp"
                alt="Leafy waving hello in the classroom"
                width={440}
                height={560}
                className="w-full h-auto"
              />
            </div>
            <div className="relative -mt-5 max-w-xs rounded-2xl border-2 border-emerald-200 bg-white px-5 py-3.5 text-center shadow-lg gl-pop-in">
              <p className="gl-display font-extrabold leading-snug text-gl-green">
                {"👋 Welcome to GreenLeaf! Let's learn together!"}
              </p>
            </div>
          </div>

          {phase === 'ready' && (
            <div className="flex flex-col items-center gap-5 gl-pop-in">
              <p className="gl-display text-sm font-bold uppercase tracking-[0.18em] text-gl-muted">
                Grow Beyond
              </p>
              <button
                onClick={() => {
                  router.push(destination);
                  router.refresh();
                }}
                className="bg-gradient-to-r from-[#4F9E58] to-[#2E4A34] text-white font-extrabold py-3.5 px-10 rounded-2xl shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all text-lg gl-glow-pulse"
              >
                {"🚀 Let's go!"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<(typeof ROLE_HINTS)[number]['key']>('student');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [welcome, setWelcome] = useState<{ role: string; destination: string } | null>(null);

  const handleLogin = async (loginEmail?: string, loginPwd?: string) => {
    setError(null);
    setLoading(true);

    const idToUse = loginEmail ?? identifier;
    const pwdToUse = loginPwd ?? password;

    const email = idToUse.includes('@') ? idToUse : `${idToUse.trim().toLowerCase()}@greenleaf.local`;

    const supabase = createClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: pwdToUse,
    });

    if (signInError) {
      setError(signInError.message || 'Incorrect username/email or password.');
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from('greenleaf_profiles')
      .select('role')
      .eq('id', data.user.id)
      .maybeSingle();

    // Actual role comes from DB, fallback to 'student'
    const actualRole = profile?.role ?? 'student';
    const redirect = searchParams.get('redirect');
    const destination = redirect || ROLE_HOME[actualRole] || '/grades';

    if (actualRole === 'student') {
      setWelcome({ role: actualRole, destination });
    } else {
      router.push(destination);
      router.refresh();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin();
  };

  if (welcome) {
    return <WelcomeScreen destination={welcome.destination} />;
  }

  const activeRole = ROLE_HINTS.find((r) => r.key === role) ?? ROLE_HINTS[0];

  return (
    <div className="min-h-screen flex items-center justify-center gl-playful-bg px-4 py-10">
      <div className="w-full max-w-sm bg-white rounded-[28px] shadow-xl shadow-black/5 p-8 space-y-7">
        <div className="text-center space-y-3">
          <LeafLogo size="lg" className="mx-auto" />
          <div className="space-y-1">
            <h1 className="gl-display text-2xl font-extrabold text-gl-green leading-tight">
              GreenLeaf English Academy
            </h1>
            <p className="gl-display text-[11px] font-bold uppercase tracking-[0.18em] text-gl-muted">
              Grow Beyond
            </p>
          </div>
        </div>

        <div>
          <span className="block text-xs font-bold text-gl-muted mb-2">I am a...</span>
          <div className="grid grid-cols-3 gap-2" role="group" aria-label="Select role">
            {ROLE_HINTS.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => setRole(r.key)}
                aria-pressed={r.key === role}
                className={`rounded-xl py-2 text-sm font-bold transition-colors ${
                  r.key === role
                    ? 'bg-gl-green text-white shadow-sm'
                    : 'bg-gl-cream text-gl-green-dark hover:bg-gl-green-light'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="gl-identifier" className="block text-xs font-bold text-gl-muted mb-1.5">
              {role === 'student' ? 'Username' : 'Email'}
            </label>
            <input
              id="gl-identifier"
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={activeRole.placeholder}
              className="w-full rounded-xl border-2 border-gray-100 bg-gl-cream/40 px-4 py-3 text-base focus:outline-none focus:border-gl-green focus:bg-white transition-colors"
            />
            <p className="mt-1.5 text-xs text-gl-muted">{activeRole.hint}</p>
          </div>
          <div>
            <label htmlFor="gl-password" className="block text-xs font-bold text-gl-muted mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                id="gl-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full rounded-xl border-2 border-gray-100 bg-gl-cream/40 pl-4 pr-11 py-3 text-base focus:outline-none focus:border-gl-green focus:bg-white transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gl-green transition-colors p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 border border-red-200 px-3.5 py-2.5 text-sm font-semibold text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#4F9E58] to-[#2E4A34] disabled:opacity-60 text-white font-extrabold py-3.5 rounded-2xl text-lg shadow-md hover:-translate-y-0.5 hover:shadow-lg disabled:hover:translate-y-0 transition-all"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          {/* Quick Demo Student Button */}
          <div className="pt-2 text-center border-t border-gray-100">
            <button
              type="button"
              onClick={() => {
                setRole('student');
                setIdentifier('student.demo');
                setPassword('password123');
                handleLogin('student.demo', 'password123');
              }}
              className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-black px-4 py-2 rounded-full transition-all active:scale-95 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>1-Click Demo Login: student.demo</span>
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-gl-muted">
          {"Don't have an account?"}{' '}
          <Link href="/register" className="text-gl-green font-bold hover:underline">
            Sign up
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
