'use client';

import { useState } from 'react';
import { 
  User, 
  Shield, 
  ShieldCheck, 
  MoreHorizontal,
  Pencil,
  Trash2,
  UserCog
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { updateUserRole, deleteUser } from '@/app/(dashboard)/admin/users/actions';
import type { UserWithEmail } from '@/app/(dashboard)/admin/users/actions';
import type { UserRole } from '@/types/database.types';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface UserTableProps {
  users: UserWithEmail[];
  currentUserId: string;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function UserTable({ users, currentUserId }: UserTableProps) {
  const [loadingUsers, setLoadingUsers] = useState<Set<string>>(new Set());
  const [editingUser, setEditingUser] = useState<string | null>(null);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setLoadingUsers((prev) => new Set(prev).add(userId));
    
    const result = await updateUserRole(userId, newRole);
    
    if (!result.success) {
      alert(result.error);
    }
    
    setLoadingUsers((prev) => {
      const newSet = new Set(prev);
      newSet.delete(userId);
      return newSet;
    });
    setEditingUser(null);
  };

  const handleDelete = async (userId: string, userName: string) => {
    if (!confirm(`¿Estás seguro de eliminar a "${userName}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    setLoadingUsers((prev) => new Set(prev).add(userId));
    
    const result = await deleteUser(userId);
    
    if (!result.success) {
      alert(result.error);
    }
    
    setLoadingUsers((prev) => {
      const newSet = new Set(prev);
      newSet.delete(userId);
      return newSet;
    });
  };

  if (users.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <User className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No hay usuarios</h3>
        <p className="text-slate-400">Los usuarios aparecerán aquí cuando se registren</p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="text-left p-4 text-sm font-medium text-slate-400">Usuario</th>
              <th className="text-left p-4 text-sm font-medium text-slate-400">Rol</th>
              <th className="text-left p-4 text-sm font-medium text-slate-400">Registro</th>
              <th className="text-right p-4 text-sm font-medium text-slate-400">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isCurrentUser = user.id === currentUserId;
              const isLoading = loadingUsers.has(user.id);
              const isEditing = editingUser === user.id;

              return (
                <tr 
                  key={user.id}
                  className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                >
                  {/* User Info */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white font-medium">
                        {user.full_name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-medium text-white flex items-center gap-2">
                          {user.full_name || 'Sin nombre'}
                          {isCurrentUser && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400">
                              Tú
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-slate-500">{user.email || 'Sin email'}</p>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="p-4">
                    {isEditing ? (
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                        disabled={isLoading}
                        className="h-9 px-3 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                        autoFocus
                        onBlur={() => setEditingUser(null)}
                      >
                        <option value="admin">Administrador</option>
                        <option value="cashier">Cajero</option>
                      </select>
                    ) : (
                      <RoleBadge role={user.role} />
                    )}
                  </td>

                  {/* Created At */}
                  <td className="p-4">
                    <span className="text-sm text-slate-400">
                      {formatDate(user.created_at)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      {!isCurrentUser && (
                        <>
                          <button
                            onClick={() => setEditingUser(user.id)}
                            disabled={isLoading}
                            className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
                            title="Cambiar rol"
                          >
                            <UserCog className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id, user.full_name || 'Usuario')}
                            disabled={isLoading}
                            className="p-2 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors disabled:opacity-50"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-slate-800">
        {users.map((user) => {
          const isCurrentUser = user.id === currentUserId;
          const isLoading = loadingUsers.has(user.id);

          return (
            <div key={user.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white font-medium text-lg flex-shrink-0">
                  {user.full_name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-white truncate">
                      {user.full_name || 'Sin nombre'}
                    </p>
                    {isCurrentUser && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400 flex-shrink-0">
                        Tú
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 truncate mb-2">{user.email}</p>
                  <div className="flex items-center gap-3">
                    <RoleBadge role={user.role} />
                    <span className="text-xs text-slate-500">
                      {formatDate(user.created_at)}
                    </span>
                  </div>
                </div>
                {!isCurrentUser && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleRoleChange(user.id, user.role === 'admin' ? 'cashier' : 'admin')}
                      disabled={isLoading}
                      className="p-2 rounded-lg bg-slate-800 text-slate-400 disabled:opacity-50"
                    >
                      <UserCog className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id, user.full_name || 'Usuario')}
                      disabled={isLoading}
                      className="p-2 rounded-lg bg-slate-800 text-red-400 disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Role Badge
// -----------------------------------------------------------------------------

function RoleBadge({ role }: { role: UserRole }) {
  if (role === 'admin') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-500/20 text-violet-400 text-sm font-medium">
        <ShieldCheck className="w-3.5 h-3.5" />
        Administrador
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-700 text-slate-300 text-sm font-medium">
      <Shield className="w-3.5 h-3.5" />
      Cajero
    </span>
  );
}

