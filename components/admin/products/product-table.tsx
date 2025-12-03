'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Package, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { toggleProductStatus, deleteProduct } from '@/app/(dashboard)/admin/products/actions';
import type { ProductWithVariants } from '@/app/(dashboard)/admin/products/actions';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface ProductTableProps {
  products: ProductWithVariants[];
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function ProductTable({ products }: ProductTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [loadingActions, setLoadingActions] = useState<Set<string>>(new Set());

  const toggleRow = (productId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
    }
    setExpandedRows(newExpanded);
  };

  const handleToggleStatus = async (productId: string, currentStatus: boolean) => {
    setLoadingActions((prev) => new Set(prev).add(productId));
    await toggleProductStatus(productId, !currentStatus);
    setLoadingActions((prev) => {
      const newSet = new Set(prev);
      newSet.delete(productId);
      return newSet;
    });
  };

  const handleDelete = async (productId: string, productName: string) => {
    if (!confirm(`¿Estás seguro de eliminar "${productName}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    
    setLoadingActions((prev) => new Set(prev).add(productId));
    await deleteProduct(productId);
    setLoadingActions((prev) => {
      const newSet = new Set(prev);
      newSet.delete(productId);
      return newSet;
    });
  };

  if (products.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No hay productos</h3>
        <p className="text-slate-400 mb-6">Comienza agregando tu primer producto</p>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500 text-white hover:bg-violet-400 transition-colors"
        >
          Agregar Producto
        </Link>
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
              <th className="text-left p-4 text-sm font-medium text-slate-400">Producto</th>
              <th className="text-left p-4 text-sm font-medium text-slate-400">Categoría</th>
              <th className="text-left p-4 text-sm font-medium text-slate-400">Variantes</th>
              <th className="text-left p-4 text-sm font-medium text-slate-400">Stock Total</th>
              <th className="text-left p-4 text-sm font-medium text-slate-400">Estado</th>
              <th className="text-right p-4 text-sm font-medium text-slate-400">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
              const hasLowStock = product.variants.some((v) => v.stock <= (v.min_stock || 5));
              const isExpanded = expandedRows.has(product.id);
              const isLoading = loadingActions.has(product.id);

              return (
                <>
                  <tr 
                    key={product.id} 
                    className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                  >
                    {/* Product Info */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-700 overflow-hidden flex-shrink-0">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-5 h-5 text-slate-500" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white">{product.name}</p>
                          {product.description && (
                            <p className="text-sm text-slate-500 line-clamp-1">
                              {product.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-4">
                      <span className="px-2 py-1 rounded-lg bg-slate-700 text-sm text-slate-300">
                        {product.category}
                      </span>
                    </td>

                    {/* Variants */}
                    <td className="p-4">
                      <button
                        onClick={() => toggleRow(product.id)}
                        className="flex items-center gap-2 text-violet-400 hover:text-violet-300"
                      >
                        <span>{product.variants.length} variantes</span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    {/* Stock */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${hasLowStock ? 'text-amber-400' : 'text-white'}`}>
                          {totalStock}
                        </span>
                        {hasLowStock && (
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <span className={`
                        px-2 py-1 rounded-lg text-sm font-medium
                        ${product.is_active 
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : 'bg-slate-700 text-slate-400'
                        }
                      `}>
                        {product.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleToggleStatus(product.id, product.is_active)}
                          disabled={isLoading}
                          className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
                          title={product.is_active ? 'Desactivar' : 'Activar'}
                        >
                          {product.is_active ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          disabled={isLoading}
                          className="p-2 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors disabled:opacity-50"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Variants Row */}
                  {isExpanded && (
                    <tr key={`${product.id}-variants`} className="bg-slate-800/20">
                      <td colSpan={6} className="p-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {product.variants.map((variant) => (
                            <VariantCard key={variant.id} variant={variant} />
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-slate-800">
        {products.map((product) => (
          <MobileProductCard
            key={product.id}
            product={product}
            isExpanded={expandedRows.has(product.id)}
            onToggleExpand={() => toggleRow(product.id)}
            onToggleStatus={() => handleToggleStatus(product.id, product.is_active)}
            onDelete={() => handleDelete(product.id, product.name)}
            isLoading={loadingActions.has(product.id)}
          />
        ))}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Variant Card
// -----------------------------------------------------------------------------

function VariantCard({ variant }: { variant: any }) {
  const isLowStock = variant.stock <= (variant.min_stock || 5);

  return (
    <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-white">{variant.name}</span>
        <span className={`
          text-sm font-medium
          ${isLowStock ? 'text-amber-400' : 'text-slate-400'}
        `}>
          Stock: {variant.stock}
        </span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-500">SKU: {variant.sku}</span>
        <span className="text-violet-400 font-medium">
          {formatCurrency(variant.price)}
        </span>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Mobile Product Card
// -----------------------------------------------------------------------------

interface MobileProductCardProps {
  product: ProductWithVariants;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
  isLoading: boolean;
}

function MobileProductCard({
  product,
  isExpanded,
  onToggleExpand,
  onToggleStatus,
  onDelete,
  isLoading,
}: MobileProductCardProps) {
  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
  const hasLowStock = product.variants.some((v) => v.stock <= (v.min_stock || 5));

  return (
    <div className="p-4">
      <div className="flex gap-3">
        {/* Image */}
        <div className="w-16 h-16 rounded-xl bg-slate-700 overflow-hidden flex-shrink-0">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-6 h-6 text-slate-500" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-medium text-white">{product.name}</h3>
              <p className="text-sm text-slate-500">{product.category}</p>
            </div>
            <span className={`
              px-2 py-0.5 rounded text-xs font-medium flex-shrink-0
              ${product.is_active 
                ? 'bg-emerald-500/20 text-emerald-400' 
                : 'bg-slate-700 text-slate-400'
              }
            `}>
              {product.is_active ? 'Activo' : 'Inactivo'}
            </span>
          </div>

          <div className="flex items-center gap-4 mt-2 text-sm">
            <span className="text-slate-400">
              {product.variants.length} variantes
            </span>
            <span className={`flex items-center gap-1 ${hasLowStock ? 'text-amber-400' : 'text-slate-400'}`}>
              Stock: {totalStock}
              {hasLowStock && <AlertTriangle className="w-3 h-3" />}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-3">
        <button
          onClick={onToggleExpand}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-800 text-slate-300 text-sm"
        >
          {isExpanded ? 'Ocultar' : 'Ver'} variantes
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        <Link
          href={`/admin/products/${product.id}`}
          className="p-2 rounded-lg bg-slate-800 text-slate-300"
        >
          <Edit className="w-4 h-4" />
        </Link>
        <button
          onClick={onToggleStatus}
          disabled={isLoading}
          className="p-2 rounded-lg bg-slate-800 text-slate-300 disabled:opacity-50"
        >
          {product.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
        <button
          onClick={onDelete}
          disabled={isLoading}
          className="p-2 rounded-lg bg-slate-800 text-red-400 disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Expanded Variants */}
      {isExpanded && (
        <div className="mt-3 space-y-2">
          {product.variants.map((variant) => (
            <VariantCard key={variant.id} variant={variant} />
          ))}
        </div>
      )}
    </div>
  );
}

