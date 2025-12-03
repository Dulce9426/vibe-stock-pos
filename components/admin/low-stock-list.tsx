'use client';

import { AlertTriangle, Package, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import type { LowStockProduct } from '@/app/(dashboard)/admin/actions';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface LowStockListProps {
  products: LowStockProduct[];
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function LowStockList({ products }: LowStockListProps) {
  if (products.length === 0) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-white">Stock Bajo</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-3">
            <Package className="w-8 h-8 text-emerald-400" />
          </div>
          <p className="text-emerald-400 font-medium">¡Todo en orden!</p>
          <p className="text-sm text-slate-500 mt-1">
            No hay productos con stock bajo
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Stock Bajo</h3>
            <p className="text-sm text-slate-500">
              {products.length} productos requieren atención
            </p>
          </div>
        </div>
        <Link 
          href="/admin/inventory"
          className="text-sm text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1"
        >
          Ver inventario
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {/* Products List */}
      <div className="space-y-3">
        {products.map((product) => (
          <LowStockRow key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Low Stock Row
// -----------------------------------------------------------------------------

function LowStockRow({ product }: { product: LowStockProduct }) {
  const stockPercentage = Math.min((product.stock / product.min_stock) * 100, 100);
  const isCritical = product.stock === 0;
  const isWarning = product.stock > 0 && product.stock <= product.min_stock / 2;

  return (
    <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 transition-colors">
      {/* Product Image */}
      <div className="w-12 h-12 rounded-xl bg-slate-700 overflow-hidden flex-shrink-0">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.product_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-5 h-5 text-slate-500" />
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white truncate">
          {product.product_name}
        </p>
        <p className="text-sm text-slate-500 truncate">
          {product.variant_name} • {product.sku}
        </p>
      </div>

      {/* Stock Info */}
      <div className="text-right flex-shrink-0">
        <div className="flex items-center gap-2 justify-end mb-1">
          <span className={`
            text-lg font-bold
            ${isCritical ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-amber-400'}
          `}>
            {product.stock}
          </span>
          <span className="text-sm text-slate-500">/ {product.min_stock}</span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-20 h-1.5 rounded-full bg-slate-700 overflow-hidden">
          <div
            className={`
              h-full rounded-full transition-all duration-500
              ${isCritical 
                ? 'bg-red-500' 
                : isWarning 
                  ? 'bg-amber-500' 
                  : 'bg-amber-500'
              }
            `}
            style={{ width: `${stockPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}

