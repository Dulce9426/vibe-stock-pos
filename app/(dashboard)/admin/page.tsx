import { Suspense } from 'react';
import { createClient } from '@/utils/supabase/server';
import { StatsCards } from '@/components/admin/stats-cards';
import { SalesChart } from '@/components/admin/sales-chart';
import { RecentTransactions } from '@/components/admin/recent-transactions';
import { LowStockList } from '@/components/admin/low-stock-list';
import { TopProducts } from '@/components/admin/top-products';
import {
  getDashboardStats,
  getSalesChartData,
  getRecentTransactions,
  getLowStockProducts,
  getTopProducts,
} from './actions';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// -----------------------------------------------------------------------------
// Loading Skeletons
// -----------------------------------------------------------------------------

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-36 rounded-2xl bg-slate-800/50 animate-pulse" />
      ))}
    </div>
  );
}

function ChartSkeleton() {
  return <div className="h-80 rounded-2xl bg-slate-800/50 animate-pulse" />;
}

function ListSkeleton() {
  return <div className="h-96 rounded-2xl bg-slate-800/50 animate-pulse" />;
}

// -----------------------------------------------------------------------------
// Dashboard Content Components
// -----------------------------------------------------------------------------

async function DashboardStats() {
  const stats = await getDashboardStats();
  return <StatsCards stats={stats} />;
}

async function DashboardChart() {
  const chartData = await getSalesChartData();
  return <SalesChart data={chartData} />;
}

async function DashboardTransactions() {
  const transactions = await getRecentTransactions();
  return <RecentTransactions transactions={transactions} />;
}

async function DashboardLowStock() {
  const products = await getLowStockProducts();
  return <LowStockList products={products} />;
}

async function DashboardTopProducts() {
  const products = await getTopProducts();
  return <TopProducts products={products} />;
}

// -----------------------------------------------------------------------------
// Main Dashboard Page
// -----------------------------------------------------------------------------

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user?.id)
    .single();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          Hola, {profile?.full_name || 'Administrador'} 👋
        </h1>
        <p className="text-slate-400 mt-1">
          Aquí está el resumen de tu negocio hoy
        </p>
      </div>

      {/* Stats Cards */}
      <Suspense fallback={<StatsSkeleton />}>
        <div className="animate-slide-up opacity-0 animation-delay-100">
          <DashboardStats />
        </div>
      </Suspense>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart - 2 columns */}
        <div className="lg:col-span-2">
          <Suspense fallback={<ChartSkeleton />}>
            <div className="animate-slide-up opacity-0 animation-delay-200">
              <DashboardChart />
            </div>
          </Suspense>
        </div>

        {/* Top Products - 1 column */}
        <div>
          <Suspense fallback={<ListSkeleton />}>
            <div className="animate-slide-up opacity-0 animation-delay-300">
              <DashboardTopProducts />
            </div>
          </Suspense>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Suspense fallback={<ListSkeleton />}>
          <div className="animate-slide-up opacity-0 animation-delay-400">
            <DashboardTransactions />
          </div>
        </Suspense>

        {/* Low Stock Alert */}
        <Suspense fallback={<ListSkeleton />}>
          <div className="animate-slide-up opacity-0 animation-delay-500">
            <DashboardLowStock />
          </div>
        </Suspense>
      </div>
    </div>
  );
}
