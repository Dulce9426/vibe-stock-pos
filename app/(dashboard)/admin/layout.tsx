import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { UserButton } from '@/components/auth/user-button';

// -----------------------------------------------------------------------------
// Admin Layout
// -----------------------------------------------------------------------------

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // Verificar autenticación
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  // Obtener perfil
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Verificar que sea admin
  if (profile?.role !== 'admin') {
    redirect('/pos');
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 flex items-center justify-end px-4 sm:px-6 border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
          <UserButton user={user} profile={profile} />
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

