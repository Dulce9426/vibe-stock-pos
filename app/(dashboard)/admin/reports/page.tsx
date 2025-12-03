import { BarChart3, TrendingUp, DollarSign, Package, Calendar } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import { formatCurrency } from '@/lib/utils';

// -----------------------------------------------------------------------------
// Get Reports Data
// -----------------------------------------------------------------------------

async function getReportsData() {
  const supabase = await createClient();
  const now = new Date();
  
  // Get all completed transactions
  const { data: transactions } = await supabase
    .from('transactions')
    .select('total, created_at, payment_method')
    .eq('status', 'completed');

  const allTransactions = transactions || [];

  // Calculate periods
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisWeek = new Date(today);
  thisWeek.setDate(today.getDate() - 7);
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  // Filter by period
  const todayTx = allTransactions.filter(t => new Date(t.created_at) >= today);
  const weekTx = allTransactions.filter(t => new Date(t.created_at) >= thisWeek);
  const monthTx = allTransactions.filter(t => new Date(t.created_at) >= thisMonth);
  const lastMonthTx = allTransactions.filter(t => {
    const d = new Date(t.created_at);
    return d >= lastMonth && d <= lastMonthEnd;
  });

  // Calculate totals
  const sumTotal = (txs: any[]) => txs.reduce((sum, t) => sum + (t.total || 0), 0);

  // Payment method breakdown
  const paymentBreakdown = {
    cash: monthTx.filter(t => t.payment_method === 'cash').length,
    card: monthTx.filter(t => t.payment_method === 'card').length,
    transfer: monthTx.filter(t => t.payment_method === 'transfer').length,
  };

  return {
    today: { sales: sumTotal(todayTx), count: todayTx.length },
    week: { sales: sumTotal(weekTx), count: weekTx.length },
    month: { sales: sumTotal(monthTx), count: monthTx.length },
    lastMonth: { sales: sumTotal(lastMonthTx), count: lastMonthTx.length },
    total: { sales: sumTotal(allTransactions), count: allTransactions.length },
    paymentBreakdown,
  };
}

async function getTopProducts() {
  const supabase = await createClient();

  const { data: items } = await supabase
    .from('transaction_items')
    .select(`
      quantity,
      subtotal,
      variant:variants (
        name,
        product:products (name, image_url)
      )
    `);

  if (!items) return [];

  // Aggregate by product
  const productMap = new Map();
  items.forEach((item: any) => {
    const productName = item.variant?.product?.name || 'Producto';
    const existing = productMap.get(productName) || { name: productName, quantity: 0, revenue: 0 };
    existing.quantity += item.quantity;
    existing.revenue += item.subtotal;
    productMap.set(productName, existing);
  });

  return Array.from(productMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
}

// -----------------------------------------------------------------------------
// Page Component
// -----------------------------------------------------------------------------

export default async function ReportsPage() {
  const data = await getReportsData();
  const topProducts = await getTopProducts();

  const monthGrowth = data.lastMonth.sales > 0 
    ? ((data.month.sales - data.lastMonth.sales) / data.lastMonth.sales * 100).toFixed(1)
    : '0';

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <BarChart3 className="w-7 h-7 text-violet-400" />
          Reportes
        </h1>
        <p className="text-slate-400 mt-1">
          Análisis y estadísticas de tu negocio
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          icon={<DollarSign className="w-5 h-5" />}
          label="Ventas Hoy"
          value={formatCurrency(data.today.sales)}
          subtitle={`${data.today.count} transacciones`}
          color="violet"
        />
        <SummaryCard
          icon={<Calendar className="w-5 h-5" />}
          label="Esta Semana"
          value={formatCurrency(data.week.sales)}
          subtitle={`${data.week.count} transacciones`}
          color="blue"
        />
        <SummaryCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Este Mes"
          value={formatCurrency(data.month.sales)}
          subtitle={`${monthGrowth}% vs mes anterior`}
          color="emerald"
        />
        <SummaryCard
          icon={<Package className="w-5 h-5" />}
          label="Total Histórico"
          value={formatCurrency(data.total.sales)}
          subtitle={`${data.total.count} transacciones`}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Métodos de Pago (Este Mes)
          </h2>
          <div className="space-y-4">
            <PaymentBar 
              label="Efectivo" 
              count={data.paymentBreakdown.cash}
              total={data.month.count}
              color="emerald"
            />
            <PaymentBar 
              label="Tarjeta" 
              count={data.paymentBreakdown.card}
              total={data.month.count}
              color="blue"
            />
            <PaymentBar 
              label="Transferencia" 
              count={data.paymentBreakdown.transfer}
              total={data.month.count}
              color="violet"
            />
          </div>
        </div>

        {/* Top Products */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Productos Más Vendidos
          </h2>
          {topProducts.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No hay datos de ventas aún
            </div>
          ) : (
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div 
                  key={product.name}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30"
                >
                  <span className="w-6 h-6 rounded-lg bg-violet-500/20 text-violet-400 flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{product.name}</p>
                    <p className="text-sm text-slate-500">{product.quantity} vendidos</p>
                  </div>
                  <span className="font-semibold text-emerald-400">
                    {formatCurrency(product.revenue)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Summary Card
// -----------------------------------------------------------------------------

function SummaryCard({ 
  icon, 
  label, 
  value, 
  subtitle, 
  color 
}: { 
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle: string;
  color: 'violet' | 'blue' | 'emerald' | 'amber';
}) {
  const colors = {
    violet: 'from-violet-500/20 to-violet-500/5 border-violet-500/30 text-violet-400',
    blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/30 text-blue-400',
    emerald: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30 text-emerald-400',
    amber: 'from-amber-500/20 to-amber-500/5 border-amber-500/30 text-amber-400',
  };

  return (
    <div className={`p-5 rounded-2xl bg-gradient-to-br border ${colors[color]}`}>
      <div className={`inline-flex p-2 rounded-xl bg-slate-800/50 mb-3`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-slate-400">{label}</p>
      <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Payment Bar
// -----------------------------------------------------------------------------

function PaymentBar({ 
  label, 
  count, 
  total, 
  color 
}: { 
  label: string;
  count: number;
  total: number;
  color: 'emerald' | 'blue' | 'violet';
}) {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  
  const colors = {
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    violet: 'bg-violet-500',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-slate-300">{label}</span>
        <span className="text-sm text-slate-500">{count} ({percentage.toFixed(0)}%)</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full ${colors[color]} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

