'use client';

import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Mail, 
  Lock, 
  LogIn, 
  UserPlus, 
  Package,
  ArrowLeft,
  User,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { login, signup, type AuthState } from './actions';

// -----------------------------------------------------------------------------
// Initial State
// -----------------------------------------------------------------------------

const initialState: AuthState = {
  error: null,
  success: false,
};

// -----------------------------------------------------------------------------
// Login Page Component
// -----------------------------------------------------------------------------

export default function LoginPage() {
  const searchParams = useSearchParams();
  const roleParam = searchParams.get('role');
  const isAdmin = roleParam === 'admin';

  // Form states
  const [loginState, loginAction, isLoginPending] = useActionState(login, initialState);
  const [signupState, signupAction, isSignupPending] = useActionState(signup, initialState);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>

        {/* Card Container */}
        <div className="glass-card p-8 animate-fade-in">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/30">
              <Package className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {isAdmin ? 'Panel de Administración' : 'Punto de Venta'}
            </h1>
            <p className="text-slate-400">
              Ingresa tus credenciales para continuar
            </p>
          </div>

          {/* Success Message for Signup */}
          {signupState.success && (
            <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-green-400 font-medium">¡Registro exitoso!</p>
                <p className="text-green-400/70 text-sm mt-1">
                  Revisa tu email para confirmar tu cuenta antes de iniciar sesión.
                </p>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex mb-6 p-1 bg-slate-800/50 rounded-xl">
            <TabButton 
              active={!signupState.success} 
              icon={<LogIn className="w-4 h-4" />}
              label="Iniciar Sesión"
              formId="login-form"
            />
            <TabButton 
              active={false} 
              icon={<UserPlus className="w-4 h-4" />}
              label="Registrarse"
              formId="signup-form"
            />
          </div>

          {/* Login Form */}
          <form id="login-form" action={loginAction} className="space-y-5">
            {/* Error Alert */}
            {loginState.error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                <p className="text-red-400 text-sm">{loginState.error}</p>
              </div>
            )}

            <Input
              name="email"
              type="email"
              label="Correo electrónico"
              placeholder="tu@email.com"
              leftIcon={<Mail className="w-5 h-5" />}
              autoComplete="email"
              required
            />

            <Input
              name="password"
              type="password"
              label="Contraseña"
              placeholder="••••••••"
              leftIcon={<Lock className="w-5 h-5" />}
              autoComplete="current-password"
              required
            />

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoginPending}
              leftIcon={<LogIn className="w-5 h-5" />}
            >
              Iniciar Sesión
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-900/50 text-slate-500">
                ¿No tienes cuenta?
              </span>
            </div>
          </div>

          {/* Signup Form */}
          <form id="signup-form" action={signupAction} className="space-y-5">
            {/* Error Alert */}
            {signupState.error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                <p className="text-red-400 text-sm">{signupState.error}</p>
              </div>
            )}

            <Input
              name="fullName"
              type="text"
              label="Nombre completo"
              placeholder="Juan Pérez"
              leftIcon={<User className="w-5 h-5" />}
              autoComplete="name"
              required
            />

            <Input
              name="email"
              type="email"
              label="Correo electrónico"
              placeholder="tu@email.com"
              leftIcon={<Mail className="w-5 h-5" />}
              autoComplete="email"
              required
            />

            <Input
              name="password"
              type="password"
              label="Contraseña"
              placeholder="Mínimo 6 caracteres"
              leftIcon={<Lock className="w-5 h-5" />}
              hint="La contraseña debe tener al menos 6 caracteres"
              autoComplete="new-password"
              required
            />

            <Button
              type="submit"
              variant="secondary"
              className="w-full"
              size="lg"
              isLoading={isSignupPending}
              leftIcon={<UserPlus className="w-5 h-5" />}
            >
              Crear Cuenta
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-sm mt-6">
          Al continuar, aceptas nuestros términos de servicio.
        </p>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Tab Button Component
// -----------------------------------------------------------------------------

interface TabButtonProps {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  formId: string;
}

function TabButton({ active, icon, label, formId }: TabButtonProps) {
  const scrollToForm = () => {
    document.getElementById(formId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <button
      type="button"
      onClick={scrollToForm}
      className={`
        flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg
        text-sm font-medium transition-all duration-200
        ${active 
          ? 'bg-slate-700 text-white shadow-sm' 
          : 'text-slate-400 hover:text-slate-200'
        }
      `}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

