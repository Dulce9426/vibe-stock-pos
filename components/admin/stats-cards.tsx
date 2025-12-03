'use client';

import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  ShoppingBag, 
  Package, 
  AlertTriangle 
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { DashboardStats } from '@/app/(dashboard)/admin/actions';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface StatsCardsProps {
  stats: DashboardStats;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Today Sales */}
      <StatCard
        icon={<DollarSign className="w-5 h-5" />}
        label="Ventas Hoy"
        value={formatCurrency(stats.todaySales)}
        subtitle={`${stats.todayTransactions} transacciones`}
        color="violet"
      />

      {/* Week Sales */}
      <StatCard
        icon={<TrendingUp className="w-5 h-5" />}
        label="Ventas Semana"
        value={formatCurrency(stats.weekSales)}
        subtitle={`${stats.weekTransactions} transacciones`}
        color="emerald"
      />

      {/* Month Sales */}
      <StatCard
        icon={<ShoppingBag className="w-5 h-5" />}
        label="Ventas del Mes"
        value={formatCurrency(stats.monthSales)}
        subtitle={`${stats.monthTransactions} transacciones`}
        trend={stats.percentageChange.sales}
        color="blue"
      />

      {/* Products & Stock */}
      <StatCard
        icon={stats.lowStockCount > 0 ? <AlertTriangle className="w-5 h-5" /> : <Package className="w-5 h-5" />}
        label="Productos"
        value={stats.totalProducts.toString()}
        subtitle={stats.lowStockCount > 0 
          ? `${stats.lowStockCount} con stock bajo` 
          : 'Stock en orden'
        }
        color={stats.lowStockCount > 0 ? 'amber' : 'slate'}
        alert={stats.lowStockCount > 0}
      />
    </div>
  );
}

// -----------------------------------------------------------------------------
// Stat Card
// -----------------------------------------------------------------------------

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle: string;
  trend?: number;
  color: 'violet' | 'emerald' | 'blue' | 'amber' | 'slate';
  alert?: boolean;
}

function StatCard({ icon, label, value, subtitle, trend, color, alert }: StatCardProps) {
  const colorClasses = {
    violet: {
      bg: 'from-violet-500/20 to-violet-500/5',
      border: 'border-violet-500/30',
      icon: 'text-violet-400 bg-violet-500/20',
    },
    emerald: {
      bg: 'from-emerald-500/20 to-emerald-500/5',
      border: 'border-emerald-500/30',
      icon: 'text-emerald-400 bg-emerald-500/20',
    },
    blue: {
      bg: 'from-blue-500/20 to-blue-500/5',
      border: 'border-blue-500/30',
      icon: 'text-blue-400 bg-blue-500/20',
    },
    amber: {
      bg: 'from-amber-500/20 to-amber-500/5',
      border: 'border-amber-500/30',
      icon: 'text-amber-400 bg-amber-500/20',
    },
    slate: {
      bg: 'from-slate-500/20 to-slate-500/5',
      border: 'border-slate-500/30',
      icon: 'text-slate-400 bg-slate-500/20',
    },
  };

  const classes = colorClasses[color];

  return (
    <div className={`
      relative p-5 rounded-2xl bg-gradient-to-br border overflow-hidden
      ${classes.bg} ${classes.border}
      ${alert ? 'animate-pulse-subtle' : ''}
    `}>
      {/* Icon */}
      <div className={`inline-flex p-2.5 rounded-xl ${classes.icon} mb-3`}>
        {icon}
      </div>

      {/* Value */}
      <p className="text-2xl font-bold text-white mb-1">{value}</p>

      {/* Label */}
      <p className="text-sm text-slate-400">{label}</p>

      {/* Subtitle with trend */}
      <div className="flex items-center gap-2 mt-2">
        <span className="text-xs text-slate-500">{subtitle}</span>
        {trend !== undefined && trend !== 0 && (
          <span className={`
            inline-flex items-center gap-0.5 text-xs font-medium
            ${trend > 0 ? 'text-emerald-400' : 'text-red-400'}
          `}>
            {trend > 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {Math.abs(trend)}%
          </span>
        )}
      </div>

      {/* Decorative element */}
      <div className={`
        absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-10
        ${color === 'violet' ? 'bg-violet-500' : ''}
        ${color === 'emerald' ? 'bg-emerald-500' : ''}
        ${color === 'blue' ? 'bg-blue-500' : ''}
        ${color === 'amber' ? 'bg-amber-500' : ''}
        ${color === 'slate' ? 'bg-slate-500' : ''}
      `} />
    </div>
  );
}

