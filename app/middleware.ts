import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const ROLE_HOME: Record<string, string> = {
  student: '/grades',
  teacher: '/teacher/homework',
  parent: '/parent/dashboard',
};

const PROTECTED_PREFIXES = ['/grades', '/missions', '/journey', '/homework', '/teacher', '/parent'];

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));

  if (!isProtected) return supabaseResponse;

  if (!user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    const redirectResponse = NextResponse.redirect(loginUrl);
    supabaseResponse.cookies.getAll().forEach(({ name, value }) => {
      redirectResponse.cookies.set(name, value);
    });
    return redirectResponse;
  }

  const { data: profile } = await supabase
    .from('greenleaf_profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const role = profile?.role as string | undefined;

  const roleAllowed =
    (role === 'student' &&
      (pathname.startsWith('/grades') ||
        pathname.startsWith('/missions') ||
        pathname.startsWith('/journey') ||
        pathname.startsWith('/homework'))) ||
    (role === 'teacher' && pathname.startsWith('/teacher')) ||
    (role === 'parent' && pathname.startsWith('/parent'));

  if (role && !roleAllowed) {
    const homeUrl = new URL(ROLE_HOME[role] ?? '/', request.url);
    const redirectResponse = NextResponse.redirect(homeUrl);
    supabaseResponse.cookies.getAll().forEach(({ name, value }) => {
      redirectResponse.cookies.set(name, value);
    });
    return redirectResponse;
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/grades/:path*',
    '/missions/:path*',
    '/journey/:path*',
    '/homework/:path*',
    '/teacher/:path*',
    '/parent/:path*',
  ],
};
