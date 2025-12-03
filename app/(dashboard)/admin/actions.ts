'use server';

import { createClient } from '@/utils/supabase/server';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface DashboardStats {
  todaySales: number;
  todayTransactions: number;
  weekSales: number;
  weekTransactions: number;
  monthSales: number;
  monthTransactions: number;
  totalProducts: number;
  lowStockCount: number;
  percentageChange: {
    sales: number;
    transactions: number;
  };
}

export interface SalesChartData {
  date: string;
  sales: number;
  transactions: number;
}

export interface TopProduct {
  id: string;
  name: string;
  image_url: string | null;
  totalSold: number;
  totalRevenue: number;
}

export interface RecentTransaction {
  id: string;
  total: number;
  payment_method: string;
  status: string;
  created_at: string;
  items_count: number;
  user_name: string;
}

export interface LowStockProduct {
  id: string;
  product_name: string;
  variant_name: string;
  sku: string;
  stock: number;
  min_stock: number;
  image_url: string | null;
}

// -----------------------------------------------------------------------------
// Helper: Get date ranges
// -----------------------------------------------------------------------------

function getDateRanges() {
  const now = new Date();
  
  // Today
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // This week (Monday to Sunday)
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() + mondayOffset);
  weekStart.setHours(0, 0, 0, 0);
  
  // This month
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  
  // Last month (for comparison)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  return {
    todayStart: todayStart.toISOString(),
    weekStart: weekStart.toISOString(),
    monthStart: monthStart.toISOString(),
    lastMonthStart: lastMonthStart.toISOString(),
    lastMonthEnd: lastMonthEnd.toISOString(),
  };
}

// -----------------------------------------------------------------------------
// Get Dashboard Stats
// -----------------------------------------------------------------------------

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();
  const dates = getDateRanges();

  // Get transactions for different periods
  const { data: allTransactions } = await supabase
    .from('transactions')
    .select('total, created_at')
    .eq('status', 'completed');

  const transactions = allTransactions || [];

  // Calculate stats for each period
  const todayStart = new Date(dates.todayStart);
  const weekStart = new Date(dates.weekStart);
  const monthStart = new Date(dates.monthStart);
  const lastMonthStart = new Date(dates.lastMonthStart);
  const lastMonthEnd = new Date(dates.lastMonthEnd);

  const todayTransactions = transactions.filter(
    (t) => new Date(t.created_at) >= todayStart
  );
  const weekTransactions = transactions.filter(
    (t) => new Date(t.created_at) >= weekStart
  );
  const monthTransactions = transactions.filter(
    (t) => new Date(t.created_at) >= monthStart
  );
  const lastMonthTransactions = transactions.filter(
    (t) => {
      const date = new Date(t.created_at);
      return date >= lastMonthStart && date <= lastMonthEnd;
    }
  );

  const todaySales = todayTransactions.reduce((sum, t) => sum + (t.total || 0), 0);
  const weekSales = weekTransactions.reduce((sum, t) => sum + (t.total || 0), 0);
  const monthSales = monthTransactions.reduce((sum, t) => sum + (t.total || 0), 0);
  const lastMonthSales = lastMonthTransactions.reduce((sum, t) => sum + (t.total || 0), 0);

  // Get product counts
  const { count: totalProducts } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  // Get low stock count
  const { data: lowStockVariants } = await supabase
    .from('variants')
    .select('id, stock, min_stock')
    .eq('is_active', true);

  const lowStockCount = (lowStockVariants || []).filter(
    (v) => v.stock <= (v.min_stock || 5)
  ).length;

  // Calculate percentage change
  const salesChange = lastMonthSales > 0 
    ? ((monthSales - lastMonthSales) / lastMonthSales) * 100 
    : 0;
  const transactionsChange = lastMonthTransactions.length > 0
    ? ((monthTransactions.length - lastMonthTransactions.length) / lastMonthTransactions.length) * 100
    : 0;

  return {
    todaySales,
    todayTransactions: todayTransactions.length,
    weekSales,
    weekTransactions: weekTransactions.length,
    monthSales,
    monthTransactions: monthTransactions.length,
    totalProducts: totalProducts || 0,
    lowStockCount,
    percentageChange: {
      sales: Math.round(salesChange),
      transactions: Math.round(transactionsChange),
    },
  };
}

// -----------------------------------------------------------------------------
// Get Sales Chart Data (Last 7 days)
// -----------------------------------------------------------------------------

export async function getSalesChartData(): Promise<SalesChartData[]> {
  const supabase = await createClient();
  
  // Get last 7 days
  const days: SalesChartData[] = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    days.push({
      date: dateStr,
      sales: 0,
      transactions: 0,
    });
  }

  // Get transactions for the last 7 days
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const { data: transactions } = await supabase
    .from('transactions')
    .select('total, created_at')
    .eq('status', 'completed')
    .gte('created_at', sevenDaysAgo.toISOString());

  // Aggregate by day
  (transactions || []).forEach((t) => {
    const dateStr = new Date(t.created_at).toISOString().split('T')[0];
    const dayData = days.find((d) => d.date === dateStr);
    if (dayData) {
      dayData.sales += t.total || 0;
      dayData.transactions += 1;
    }
  });

  return days;
}

// -----------------------------------------------------------------------------
// Get Top Products
// -----------------------------------------------------------------------------

export async function getTopProducts(limit = 5): Promise<TopProduct[]> {
  const supabase = await createClient();

  // Get transaction items with product info
  const { data: items } = await supabase
    .from('transaction_items')
    .select(`
      quantity,
      subtotal,
      variant:variants (
        product:products (
          id,
          name,
          image_url
        )
      )
    `);

  if (!items || items.length === 0) return [];

  // Aggregate by product
  const productMap = new Map<string, TopProduct>();

  items.forEach((item: any) => {
    const product = item.variant?.product;
    if (!product) return;

    const existing = productMap.get(product.id);
    if (existing) {
      existing.totalSold += item.quantity;
      existing.totalRevenue += item.subtotal;
    } else {
      productMap.set(product.id, {
        id: product.id,
        name: product.name,
        image_url: product.image_url,
        totalSold: item.quantity,
        totalRevenue: item.subtotal,
      });
    }
  });

  // Sort by revenue and return top N
  return Array.from(productMap.values())
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, limit);
}

// -----------------------------------------------------------------------------
// Get Recent Transactions
// -----------------------------------------------------------------------------

export async function getRecentTransactions(limit = 10): Promise<RecentTransaction[]> {
  const supabase = await createClient();

  const { data: transactions } = await supabase
    .from('transactions')
    .select(`
      id,
      total,
      payment_method,
      status,
      created_at,
      profile:profiles (full_name),
      items:transaction_items (id)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (!transactions) return [];

  return transactions.map((t: any) => ({
    id: t.id,
    total: t.total,
    payment_method: t.payment_method,
    status: t.status,
    created_at: t.created_at,
    items_count: t.items?.length || 0,
    user_name: t.profile?.full_name || 'Usuario',
  }));
}

// -----------------------------------------------------------------------------
// Get Low Stock Products
// -----------------------------------------------------------------------------

export async function getLowStockProducts(limit = 10): Promise<LowStockProduct[]> {
  const supabase = await createClient();

  const { data: variants } = await supabase
    .from('variants')
    .select(`
      id,
      name,
      sku,
      stock,
      min_stock,
      product:products (
        name,
        image_url
      )
    `)
    .eq('is_active', true)
    .order('stock', { ascending: true })
    .limit(limit * 2); // Get more to filter

  if (!variants) return [];

  return variants
    .filter((v: any) => v.stock <= (v.min_stock || 5))
    .slice(0, limit)
    .map((v: any) => ({
      id: v.id,
      product_name: v.product?.name || 'Producto',
      variant_name: v.name,
      sku: v.sku,
      stock: v.stock,
      min_stock: v.min_stock || 5,
      image_url: v.product?.image_url,
    }));
}

