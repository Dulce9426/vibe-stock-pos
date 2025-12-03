'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Search, Package, Plus, Filter } from 'lucide-react';
import { useCart } from '@/contexts/cart-context';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';
import type { Product, Variant } from '@/types/database.types';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface ProductWithVariants extends Product {
  variants: Variant[];
}

interface ProductGridProps {
  products: ProductWithVariants[];
  categories: string[];
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function ProductGrid({ products, categories }: ProductGridProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { addItem } = useCart();

  // Filtrar productos
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.variants.some((v) =>
          v.sku.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesCategory =
        !selectedCategory || product.category === selectedCategory;

      return matchesSearch && matchesCategory && product.is_active;
    });
  }, [products, searchQuery, selectedCategory]);

  const handleAddToCart = (variant: Variant, product: Product) => {
    if (variant.stock > 0) {
      addItem(variant, product);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Buscar producto o SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-5 h-5" />}
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
        <CategoryTab
          label="Todos"
          active={!selectedCategory}
          onClick={() => setSelectedCategory(null)}
          count={products.length}
        />
        {categories.map((category) => (
          <CategoryTab
            key={category}
            label={category}
            active={selectedCategory === category}
            onClick={() => setSelectedCategory(category)}
            count={products.filter((p) => p.category === category).length}
          />
        ))}
      </div>

      {/* Products Grid */}
      <div className="flex-1 overflow-y-auto">
        {filteredProducts.length === 0 ? (
          <EmptyState searchQuery={searchQuery} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Category Tab
// -----------------------------------------------------------------------------

interface CategoryTabProps {
  label: string;
  active: boolean;
  onClick: () => void;
  count: number;
}

function CategoryTab({ label, active, onClick, count }: CategoryTabProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
        whitespace-nowrap transition-all duration-200
        ${active
          ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/30'
          : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
        }
      `}
    >
      {label}
      <span className={`
        px-1.5 py-0.5 rounded-md text-xs
        ${active ? 'bg-white/20' : 'bg-slate-700'}
      `}>
        {count}
      </span>
    </button>
  );
}

// -----------------------------------------------------------------------------
// Product Card
// -----------------------------------------------------------------------------

interface ProductCardProps {
  product: ProductWithVariants;
  onAddToCart: (variant: Variant, product: Product) => void;
}

function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const variant = product.variants[selectedVariantIndex];
  const hasMultipleVariants = product.variants.length > 1;
  const isOutOfStock = !variant || variant.stock <= 0;
  const isLowStock = variant && variant.stock > 0 && variant.stock <= 5;

  if (!variant) return null;

  return (
    <div className="group relative glass-card p-3 flex flex-col transition-all duration-200 hover:border-violet-500/50">
      {/* Stock Badge */}
      {isOutOfStock && (
        <div className="absolute top-2 right-2 z-10 px-2 py-1 rounded-lg bg-red-500/90 text-white text-xs font-medium">
          Agotado
        </div>
      )}
      {isLowStock && !isOutOfStock && (
        <div className="absolute top-2 right-2 z-10 px-2 py-1 rounded-lg bg-amber-500/90 text-white text-xs font-medium">
          Quedan {variant.stock}
        </div>
      )}

      {/* Product Image */}
      <div className="relative aspect-square rounded-lg overflow-hidden bg-slate-800 mb-3">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-600">
            <Package className="w-12 h-12" />
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 flex flex-col">
        <h3 className="font-medium text-white text-sm leading-tight mb-1 line-clamp-2">
          {product.name}
        </h3>
        
        {/* Variant Selector */}
        {hasMultipleVariants && (
          <div className="flex flex-wrap gap-1 mb-2">
            {product.variants.map((v, index) => (
              <button
                key={v.id}
                onClick={() => setSelectedVariantIndex(index)}
                className={`
                  px-2 py-0.5 rounded text-xs transition-colors
                  ${index === selectedVariantIndex
                    ? 'bg-violet-500 text-white'
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                  }
                  ${v.stock <= 0 ? 'opacity-50 line-through' : ''}
                `}
              >
                {v.name}
              </button>
            ))}
          </div>
        )}

        <p className="text-xs text-slate-500 mb-2">SKU: {variant.sku}</p>

        {/* Price & Add Button */}
        <div className="mt-auto flex items-center justify-between gap-2">
          <span className="text-lg font-bold text-violet-400">
            {formatCurrency(variant.price)}
          </span>
          <button
            onClick={() => onAddToCart(variant, product)}
            disabled={isOutOfStock}
            className={`
              p-2 rounded-lg transition-all duration-200
              ${isOutOfStock
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-violet-500 text-white hover:bg-violet-400 active:scale-95'
              }
            `}
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Empty State
// -----------------------------------------------------------------------------

function EmptyState({ searchQuery }: { searchQuery: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-12 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
        <Search className="w-8 h-8 text-slate-600" />
      </div>
      <h3 className="text-lg font-medium text-white mb-2">
        No se encontraron productos
      </h3>
      <p className="text-slate-400 text-sm max-w-sm">
        {searchQuery
          ? `No hay productos que coincidan con "${searchQuery}"`
          : 'No hay productos disponibles en esta categoría'}
      </p>
    </div>
  );
}

