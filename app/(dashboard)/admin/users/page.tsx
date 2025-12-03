import { Users, UserPlus } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import { UserTable } from '@/components/admin/users/user-table';
import { getUsers } from './actions';

// -----------------------------------------------------------------------------
// Users Page
// -----------------------------------------------------------------------------

export default async function UsersPage() {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  // Get all users
  const users = await getUsers();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Users className="w-7 h-7 text-violet-400" />
            Usuarios
          </h1>
          <p className="text-slate-400 mt-1">
            Gestiona los usuarios y sus roles
          </p>
        </div>
        
        {/* Info Card */}
        <div className="flex items-center gap-4 px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{users.length}</p>
            <p className="text-xs text-slate-500">Total</p>
          </div>
          <div className="w-px h-8 bg-slate-700" />
          <div className="text-center">
            <p className="text-2xl font-bold text-violet-400">
              {users.filter(u => u.role === 'admin').length}
            </p>
            <p className="text-xs text-slate-500">Admins</p>
          </div>
          <div className="w-px h-8 bg-slate-700" />
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-400">
              {users.filter(u => u.role === 'cashier').length}
            </p>
            <p className="text-xs text-slate-500">Cajeros</p>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
        <div className="flex items-start gap-3">
          <UserPlus className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-blue-400 font-medium">¿Cómo agregar usuarios?</p>
            <p className="text-blue-400/70 text-sm mt-1">
              Los usuarios se agregan automáticamente cuando se registran en la página de login. 
              Luego puedes cambiar su rol aquí.
            </p>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <UserTable users={users} currentUserId={user?.id || ''} />
    </div>
  );
}

