import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { UserButton } from '@/components/auth/user-button';
import { Package, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { getProductsWithVariants, getCategories } from './actions';
import { POSClient } from './pos-client';

// -----------------------------------------------------------------------------
// POS Page (Server Component)
// -----------------------------------------------------------------------------

export default async function POSPage() {
  const supabase = await createClient();
  
  // Verificar autenticación
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    redirect('/login');
  }

  // Obtener perfil del usuario
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Obtener productos y categorías
  const [products, categories] = await Promise.all([
    getProductsWithVariants(),
    getCategories(),
  ]);

  const isAdmin = profile?.role === 'admin';

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
        <div className="flex h-14 items-center justify-between px-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-bold text-white leading-tight">Vibe POS</h1>
              <p className="text-xs text-slate-500 leading-tight">Punto de Venta</p>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Admin Link */}
            {isAdmin && (
              <Link
                href="/admin"
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white text-sm transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                Admin
              </Link>
            )}

            {/* User Menu */}
            <UserButton user={user} profile={profile} />
          </div>
        </div>
      </header>

      {/* Main Content - Client Component */}
      <POSClient 
        initialProducts={products} 
        categories={categories}
      />
    </div>
  );
}
