import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Actualiza la sesión del usuario en el middleware
 * Esto mantiene la sesión activa y refresca los tokens
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANTE: No escribas ningún código entre createServerClient y
  // supabase.auth.getUser(). Un simple error podría hacer que tu aplicación
  // sea muy difícil de debuggear porque problemas aleatorios de usuarios
  // no autenticados.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Rutas protegidas - redirigir al login si no está autenticado
  const protectedRoutes = ['/pos', '/admin', '/dashboard'];
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Si está autenticado y trata de ir al login, redirigir según el rol
  if (user && request.nextUrl.pathname === '/login') {
    const url = request.nextUrl.clone();
    // El redirect real al rol correcto se maneja en las páginas
    url.pathname = '/pos';
    return NextResponse.redirect(url);
  }

  // Si está autenticado y va a la página principal, redirigir al POS
  if (user && request.nextUrl.pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/pos';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

