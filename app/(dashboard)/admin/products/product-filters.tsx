'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter, X } from 'lucide-react';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface ProductFiltersProps {
  categories: string[];
  currentSearch?: string;
  currentCategory?: string;
  currentStatus?: string;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function ProductFilters({
  categories,
  currentSearch = '',
  currentCategory = '',
  currentStatus = 'all',
}: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(currentSearch);

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (search !== currentSearch) {
        updateFilters({ search: search || undefined });
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  const updateFilters = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    startTransition(() => {
      router.push(`/admin/products?${params.toString()}`);
    });
  };

  const clearFilters = () => {
    setSearch('');
    startTransition(() => {
      router.push('/admin/products');
    });
  };

  const hasFilters = currentSearch || currentCategory || currentStatus !== 'all';

  return (
    <div className="glass-card p-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="search"
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-4 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
          />
          {isPending && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        {/* Category Filter */}
        <select
          value={currentCategory}
          onChange={(e) => updateFilters({ category: e.target.value || undefined })}
          className="h-11 px-4 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
        >
          <option value="">Todas las categorías</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={currentStatus}
          onChange={(e) => updateFilters({ status: e.target.value === 'all' ? undefined : e.target.value })}
          className="h-11 px-4 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>

        {/* Clear Filters */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="h-11 px-4 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 transition-colors flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Limpiar</span>
          </button>
        )}
      </div>
    </div>
  );
}

