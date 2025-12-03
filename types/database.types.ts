// =============================================================================
// VIBE STOCK & POS - Database Types
// Tipos de TypeScript basados en el esquema de Supabase
// =============================================================================

// -----------------------------------------------------------------------------
// Enums
// -----------------------------------------------------------------------------

export type UserRole = 'admin' | 'cashier';

export type TransactionStatus = 'completed' | 'pending' | 'cancelled';

export type PaymentMethod = 'cash' | 'card' | 'transfer';

// -----------------------------------------------------------------------------
// Database Tables
// -----------------------------------------------------------------------------

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string | null;
  category: string;
  image_url?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Variant {
  id: string;
  product_id: string;
  sku: string;
  name: string;
  price: number;
  cost?: number | null;
  stock: number;
  min_stock?: number | null;
  barcode?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  total: number;
  subtotal: number;
  tax?: number | null;
  discount?: number | null;
  payment_method: PaymentMethod;
  status: TransactionStatus;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TransactionItem {
  id: string;
  transaction_id: string;
  variant_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at: string;
}

// -----------------------------------------------------------------------------
// Extended Types (con relaciones)
// -----------------------------------------------------------------------------

export interface VariantWithProduct extends Variant {
  product: Product;
}

export interface TransactionWithItems extends Transaction {
  items: TransactionItemWithVariant[];
  profile?: Profile;
}

export interface TransactionItemWithVariant extends TransactionItem {
  variant: VariantWithProduct;
}

// -----------------------------------------------------------------------------
// Cart Types (para el POS)
// -----------------------------------------------------------------------------

export interface CartItem extends Variant {
  quantity: number;
  product_name: string;
  product_image?: string | null;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
}

// -----------------------------------------------------------------------------
// Form Types (para crear/editar)
// -----------------------------------------------------------------------------

export interface CreateProductInput {
  name: string;
  description?: string;
  category: string;
  image_url?: string;
}

export interface CreateVariantInput {
  product_id: string;
  sku: string;
  name: string;
  price: number;
  cost?: number;
  stock: number;
  min_stock?: number;
  barcode?: string;
}

export interface CreateTransactionInput {
  items: {
    variant_id: string;
    quantity: number;
    unit_price: number;
  }[];
  payment_method: PaymentMethod;
  discount?: number;
  notes?: string;
}

// -----------------------------------------------------------------------------
// API Response Types
// -----------------------------------------------------------------------------

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// -----------------------------------------------------------------------------
// Dashboard Stats
// -----------------------------------------------------------------------------

export interface DashboardStats {
  totalSales: number;
  totalTransactions: number;
  totalProducts: number;
  lowStockItems: number;
  todaySales: number;
  todayTransactions: number;
}

