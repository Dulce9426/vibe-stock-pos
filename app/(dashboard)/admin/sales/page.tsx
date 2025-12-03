import { Suspense } from 'react';
import { TrendingUp, Calendar, Download, Filter } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import { formatCurrency, formatDate } from '@/lib/utils';

// -----------------------------------------------------------------------------
// Get Sales Data
// -----------------------------------------------------------------------------

async function getSalesData() {
  const supabase = await createClient();

  const { data: transactions, error } = await supabase
    .from('transactions')
    .select(`
      *,
      profile:profiles (full_name),
      items:transaction_items (
        quantity,
        unit_price,
        subtotal,
        variant:variants (
          name,
          sku,
          product:products (name)
        )
      )
    `)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching sales:', error);
    return [];
  }

  return transactions || [];
}

// -----------------------------------------------------------------------------
// Sales Table Component
// -----------------------------------------------------------------------------

async function SalesTable() {
  const sales = await getSalesData();

  if (sales.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <TrendingUp className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No hay ventas</h3>
        <p className="text-slate-400">Las ventas realizadas aparecerán aquí</p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="text-left p-4 text-sm font-medium text-slate-400">ID</th>
              <th className="text-left p-4 text-sm font-medium text-slate-400">Fecha</th>
              <th className="text-left p-4 text-sm font-medium text-slate-400">Cajero</th>
              <th className="text-left p-4 text-sm font-medium text-slate-400">Items</th>
              <th className="text-left p-4 text-sm font-medium text-slate-400">Método</th>
              <th className="text-right p-4 text-sm font-medium text-slate-400">Total</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale: any) => (
              <tr 
                key={sale.id}
                className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
              >
                <td className="p-4">
                  <span className="font-mono text-sm text-violet-400">
                    #{sale.id.slice(0, 8).toUpperCase()}
                  </span>
                </td>
                <td className="p-4">
                  <span className="text-sm text-slate-300">
                    {formatDate(sale.created_at)}
                  </span>
                </td>
                <td className="p-4">
                  <span className="text-sm text-slate-300">
                    {sale.profile?.full_name || 'Usuario'}
                  </span>
                </td>
                <td className="p-4">
                  <span className="text-sm text-slate-400">
                    {sale.items?.length || 0} productos
                  </span>
                </td>
                <td className="p-4">
                  <PaymentBadge method={sale.payment_method} />
                </td>
                <td className="p-4 text-right">
                  <span className="font-semibold text-white">
                    {formatCurrency(sale.total)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Payment Badge
// -----------------------------------------------------------------------------

function PaymentBadge({ method }: { method: string }) {
  const styles = {
    cash: 'bg-emerald-500/20 text-emerald-400',
    card: 'bg-blue-500/20 text-blue-400',
    transfer: 'bg-violet-500/20 text-violet-400',
  }[method] || 'bg-slate-700 text-slate-400';

  const labels = {
    cash: 'Efectivo',
    card: 'Tarjeta',
    transfer: 'Transferencia',
  }[method] || method;

  return (
    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${styles}`}>
      {labels}
    </span>
  );
}

// -----------------------------------------------------------------------------
// Loading Skeleton
// -----------------------------------------------------------------------------

function TableSkeleton() {
  return (
    <div className="glass-card p-6 space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-12 rounded-lg bg-slate-800/50 animate-pulse" />
      ))}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Page Component
// -----------------------------------------------------------------------------

export default async function SalesPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <TrendingUp className="w-7 h-7 text-violet-400" />
            Historial de Ventas
          </h1>
          <p className="text-slate-400 mt-1">
            Revisa todas las transacciones completadas
          </p>
        </div>
      </div>

      {/* Sales Table */}
      <Suspense fallback={<TableSkeleton />}>
        <SalesTable />
      </Suspense>
    </div>
  );
}

