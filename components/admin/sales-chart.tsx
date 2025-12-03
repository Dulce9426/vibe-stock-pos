'use client';

import { useMemo } from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { SalesChartData } from '@/app/(dashboard)/admin/actions';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface SalesChartProps {
  data: SalesChartData[];
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function SalesChart({ data }: SalesChartProps) {
  const { maxSales, totalSales, totalTransactions } = useMemo(() => {
    const sales = data.map((d) => d.sales);
    return {
      maxSales: Math.max(...sales, 1), // Avoid division by zero
      totalSales: sales.reduce((a, b) => a + b, 0),
      totalTransactions: data.reduce((a, d) => a + d.transactions, 0),
    };
  }, [data]);

  const formatDay = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return days[date.getDay()];
  };

  const isToday = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
  };

  return (
    <div className="glass-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-violet-500/20 text-violet-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Ventas (7 días)</h3>
            <p className="text-sm text-slate-500">
              {totalTransactions} transacciones
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-white">{formatCurrency(totalSales)}</p>
          <p className="text-xs text-slate-500">Total del período</p>
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-48">
        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="border-b border-slate-800/50" />
          ))}
        </div>

        {/* Bars */}
        <div className="relative h-full flex items-end justify-between gap-2 px-2">
          {data.map((day, index) => {
            const height = maxSales > 0 ? (day.sales / maxSales) * 100 : 0;
            const today = isToday(day.date);

            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                {/* Tooltip on hover */}
                <div className="relative group flex-1 w-full flex items-end">
                  {/* Bar */}
                  <div
                    className={`
                      w-full rounded-t-lg transition-all duration-500 ease-out
                      ${today 
                        ? 'bg-gradient-to-t from-violet-600 to-violet-400' 
                        : 'bg-gradient-to-t from-slate-700 to-slate-600 group-hover:from-violet-600/50 group-hover:to-violet-400/50'
                      }
                    `}
                    style={{ 
                      height: `${Math.max(height, 4)}%`,
                      animationDelay: `${index * 100}ms`,
                    }}
                  />

                  {/* Tooltip */}
                  <div className="
                    absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                    px-3 py-2 rounded-lg bg-slate-800 border border-slate-700
                    opacity-0 group-hover:opacity-100 transition-opacity
                    pointer-events-none z-10 whitespace-nowrap
                  ">
                    <p className="text-sm font-medium text-white">
                      {formatCurrency(day.sales)}
                    </p>
                    <p className="text-xs text-slate-400">
                      {day.transactions} ventas
                    </p>
                  </div>
                </div>

                {/* Day label */}
                <span className={`
                  text-xs font-medium
                  ${today ? 'text-violet-400' : 'text-slate-500'}
                `}>
                  {formatDay(day.date)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-gradient-to-t from-violet-600 to-violet-400" />
          <span className="text-xs text-slate-400">Hoy</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-gradient-to-t from-slate-700 to-slate-600" />
          <span className="text-xs text-slate-400">Días anteriores</span>
        </div>
      </div>
    </div>
  );
}

