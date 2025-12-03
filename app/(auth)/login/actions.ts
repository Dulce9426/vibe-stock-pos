'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface AuthState {
  error: string | null;
  success: boolean;
}

// -----------------------------------------------------------------------------
// Login Action
// -----------------------------------------------------------------------------

export async function login(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // Validación básica
  if (!email || !password) {
    return {
      error: 'Por favor, completa todos los campos.',
      success: false,
    };
  }

  // Intentar login
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Mapear errores comunes a español
    const errorMessages: Record<string, string> = {
      'Invalid login credentials': 'Credenciales inválidas. Verifica tu email y contraseña.',
      'Email not confirmed': 'Tu email no ha sido confirmado. Revisa tu bandeja de entrada.',
      'Too many requests': 'Demasiados intentos. Por favor, espera unos minutos.',
    };

    return {
      error: errorMessages[error.message] || error.message,
      success: false,
    };
  }

  revalidatePath('/', 'layout');
  redirect('/pos');
}

// -----------------------------------------------------------------------------
// Signup Action
// -----------------------------------------------------------------------------

export async function signup(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('fullName') as string;

  // Validación
  if (!email || !password || !fullName) {
    return {
      error: 'Por favor, completa todos los campos.',
      success: false,
    };
  }

  if (password.length < 6) {
    return {
      error: 'La contraseña debe tener al menos 6 caracteres.',
      success: false,
    };
  }

  // Crear usuario
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    const errorMessages: Record<string, string> = {
      'User already registered': 'Este email ya está registrado.',
      'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres.',
    };

    return {
      error: errorMessages[error.message] || error.message,
      success: false,
    };
  }

  return {
    error: null,
    success: true,
  };
}

// -----------------------------------------------------------------------------
// Logout Action
// -----------------------------------------------------------------------------

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}

