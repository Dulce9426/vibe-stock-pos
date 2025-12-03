'use client';

import { Trophy, Package, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { TopProduct } from '@/app/(dashboard)/admin/actions';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface TopProductsProps {
  products: TopProduct[];
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function TopProducts({ products }: TopProductsProps) {
  if (products.length === 0) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
            <Trophy className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-white">Productos Top</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <TrendingUp className="w-12 h-12 text-slate-600 mb-3" />
          <p className="text-slate-400">Sin datos aún</p>
          <p className="text-sm text-slate-500 mt-1">
            Los productos más vendidos aparecerán aquí
          </p>
        </div>
      </div>
    );
  }

  const maxRevenue = Math.max(...products.map((p) => p.totalRevenue));

  return (
    <div className="glass-card p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
          <Trophy className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-semibold text-white">Productos Top</h3>
      </div>

      {/* Products List */}
      <div className="space-y-4">
        {products.map((product, index) => (
          <TopProductRow 
            key={product.id} 
            product={product} 
            rank={index + 1}
            maxRevenue={maxRevenue}
          />
        ))}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Top Product Row
// -----------------------------------------------------------------------------

interface TopProductRowProps {
  product: TopProduct;
  rank: number;
  maxRevenue: number;
}

function TopProductRow({ product, rank, maxRevenue }: TopProductRowProps) {
  const percentage = (product.totalRevenue / maxRevenue) * 100;

  const rankColors = {
    1: 'from-amber-400 to-yellow-500 text-amber-900',
    2: 'from-slate-300 to-slate-400 text-slate-800',
    3: 'from-amber-600 to-amber-700 text-amber-100',
  }[rank] || 'from-slate-600 to-slate-700 text-slate-300';

  return (
    <div className="flex items-center gap-4">
      {/* Rank Badge */}
      <div className={`
        w-8 h-8 rounded-lg flex items-center justify-center
        bg-gradient-to-br ${rankColors}
        font-bold text-sm flex-shrink-0
      `}>
        {rank}
      </div>

      {/* Product Image */}
      <div className="w-10 h-10 rounded-lg bg-slate-700 overflow-hidden flex-shrink-0">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-4 h-4 text-slate-500" />
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white truncate text-sm">
          {product.name}
        </p>
        <div className="flex items-center gap-3 mt-1">
          {/* Progress Bar */}
          <div className="flex-1 h-1.5 rounded-full bg-slate-700 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-700"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-xs text-slate-500 flex-shrink-0">
            {product.totalSold} uds
          </span>
        </div>
      </div>

      {/* Revenue */}
      <div className="text-right flex-shrink-0">
        <p className="font-semibold text-violet-400">
          {formatCurrency(product.totalRevenue)}
        </p>
      </div>
    </div>
  );
}

