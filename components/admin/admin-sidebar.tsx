'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Package,
  LayoutDashboard,
  Box,
  TrendingUp,
  Users,
  Settings,
  ShoppingCart,
  Menu,
  X,
  ChevronRight,
  BarChart3,
  Tags,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

// -----------------------------------------------------------------------------
// Navigation Items
// -----------------------------------------------------------------------------

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    label: 'Productos',
    href: '/admin/products',
    icon: <Box className="w-5 h-5" />,
  },
  {
    label: 'Categorías',
    href: '/admin/categories',
    icon: <Tags className="w-5 h-5" />,
  },
  {
    label: 'Ventas',
    href: '/admin/sales',
    icon: <TrendingUp className="w-5 h-5" />,
  },
  {
    label: 'Reportes',
    href: '/admin/reports',
    icon: <BarChart3 className="w-5 h-5" />,
  },
  {
    label: 'Usuarios',
    href: '/admin/users',
    icon: <Users className="w-5 h-5" />,
  },
  {
    label: 'Configuración',
    href: '/admin/settings',
    icon: <Settings className="w-5 h-5" />,
  },
];

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-slate-800 text-white"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed lg:static inset-y-0 left-0 z-50',
        'w-64 bg-slate-900 border-r border-slate-800',
        'flex flex-col transition-transform duration-300',
        'lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white">Vibe Admin</h1>
              <p className="text-xs text-slate-500">Panel de Control</p>
            </div>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/admin' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl',
                  'text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-violet-500/20 text-violet-400'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                )}
              >
                {item.icon}
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-xs">
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <ChevronRight className="w-4 h-4" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* POS Link */}
        <div className="p-3 border-t border-slate-800">
          <Link
            href="/pos"
            className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gradient-to-r from-violet-600/20 to-indigo-600/20 border border-violet-500/30 text-violet-400 hover:border-violet-500/50 transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="font-medium">Ir al POS</span>
          </Link>
        </div>
      </aside>
    </>
  );
}

