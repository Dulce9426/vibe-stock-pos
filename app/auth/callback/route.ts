import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * Callback Route para Auth de Supabase
 * Maneja la confirmación de email y OAuth callbacks
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/pos';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Redirigir al destino deseado
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Si hay error, redirigir al login con mensaje
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}

