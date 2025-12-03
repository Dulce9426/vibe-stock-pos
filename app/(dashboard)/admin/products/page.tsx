import { Suspense } from 'react';
import Link from 'next/link';
import { Plus, Package, Search, Filter } from 'lucide-react';
import { ProductTable } from '@/components/admin/products/product-table';
import { getProducts, getCategories } from './actions';
import { ProductFilters } from './product-filters';

// -----------------------------------------------------------------------------
// Loading Skeleton
// -----------------------------------------------------------------------------

function TableSkeleton() {
  return (
    <div className="glass-card p-6 space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-16 rounded-xl bg-slate-800/50 animate-pulse" />
      ))}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Products List Component
// -----------------------------------------------------------------------------

async function ProductsList({ 
  search, 
  category, 
  status 
}: { 
  search?: string;
  category?: string;
  status?: string;
}) {
  const products = await getProducts({
    search,
    category,
    status: status as 'all' | 'active' | 'inactive',
  });

  return <ProductTable products={products} />;
}

// -----------------------------------------------------------------------------
// Page Component
// -----------------------------------------------------------------------------

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; status?: string }>;
}) {
  const params = await searchParams;
  const categories = await getCategories();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Package className="w-7 h-7 text-violet-400" />
            Productos
          </h1>
          <p className="text-slate-400 mt-1">
            Gestiona tu catálogo de productos
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-violet-500 hover:bg-violet-400 text-white font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Producto
        </Link>
      </div>

      {/* Filters */}
      <ProductFilters 
        categories={categories}
        currentSearch={params.search}
        currentCategory={params.category}
        currentStatus={params.status}
      />

      {/* Products Table */}
      <Suspense fallback={<TableSkeleton />}>
        <ProductsList 
          search={params.search}
          category={params.category}
          status={params.status}
        />
      </Suspense>
    </div>
  );
}

