'use client';

import { useState, useRef, useEffect } from 'react';
import { User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { logout } from '@/app/(auth)/login/actions';
import type { Profile } from '@/types/database.types';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface UserButtonProps {
  user: {
    email?: string;
    user_metadata?: {
      full_name?: string;
      avatar_url?: string;
    };
  };
  profile?: Profile | null;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function UserButton({ user, profile }: UserButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const displayName = profile?.full_name || user.user_metadata?.full_name || 'Usuario';
  const email = user.email || '';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-2 pr-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 transition-all duration-200"
      >
        {/* Avatar */}
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white font-medium text-sm">
          {initials}
        </div>

        {/* Info */}
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium text-slate-200 leading-tight">
            {displayName}
          </p>
          <p className="text-xs text-slate-500 leading-tight">
            {String(profile?.role).toLowerCase() === 'admin' ? 'Administrador' : 'Cajero'}
          </p>
        </div>

        {/* Chevron */}
        <ChevronDown 
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 py-2 bg-slate-800 border border-slate-700 rounded-xl shadow-xl shadow-black/20 z-50 animate-fade-in">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-slate-700">
            <p className="text-sm font-medium text-white">{displayName}</p>
            <p className="text-xs text-slate-400 truncate">{email}</p>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <MenuItem icon={<User className="w-4 h-4" />} label="Mi Perfil" />
            <MenuItem icon={<Settings className="w-4 h-4" />} label="Configuración" />
          </div>

          {/* Logout */}
          <div className="border-t border-slate-700 pt-2">
            <form action={logout}>
              <button
                type="submit"
                className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Cerrar Sesión</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Menu Item Component
// -----------------------------------------------------------------------------

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

function MenuItem({ icon, label, onClick }: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-300 hover:bg-slate-700/50 transition-colors"
    >
      {icon}
      <span className="text-sm">{label}</span>
    </button>
  );
}

