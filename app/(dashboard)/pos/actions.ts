'use server';

import { createClient } from '@/utils/supabase/server';
import type { PaymentMethod, CartItem } from '@/types/database.types';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface CreateTransactionResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

// -----------------------------------------------------------------------------
// Get Products with Variants
// -----------------------------------------------------------------------------

export async function getProductsWithVariants() {
  const supabase = await createClient();

  const { data: products, error } = await supabase
    .from('products')
    .select(`
      *,
      variants (*)
    `)
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  return products || [];
}

// -----------------------------------------------------------------------------
// Get Categories
// -----------------------------------------------------------------------------

export async function getCategories() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('products')
    .select('category')
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  // Get unique categories
  const categories = [...new Set(data?.map((p) => p.category).filter(Boolean))];
  return categories as string[];
}

// -----------------------------------------------------------------------------
// Create Transaction
// -----------------------------------------------------------------------------

export async function createTransaction(
  items: CartItem[],
  paymentMethod: PaymentMethod,
  subtotal: number,
  tax: number,
  discount: number,
  total: number
): Promise<CreateTransactionResult> {
  const supabase = await createClient();

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: 'Usuario no autenticado' };
  }

  // Start a transaction
  // 1. Create the transaction record
  const { data: transaction, error: transactionError } = await supabase
    .from('transactions')
    .insert({
      user_id: user.id,
      subtotal,
      tax,
      discount,
      total,
      payment_method: paymentMethod,
      status: 'completed',
    })
    .select()
    .single();

  if (transactionError || !transaction) {
    console.error('Error creating transaction:', transactionError);
    return { success: false, error: 'Error al crear la transacción' };
  }

  // 2. Create transaction items
  const transactionItems = items.map((item) => ({
    transaction_id: transaction.id,
    variant_id: item.id,
    quantity: item.quantity,
    unit_price: item.price,
    subtotal: item.price * item.quantity,
  }));

  const { error: itemsError } = await supabase
    .from('transaction_items')
    .insert(transactionItems);

  if (itemsError) {
    console.error('Error creating transaction items:', itemsError);
    // Ideally we'd rollback here, but Supabase doesn't support true transactions in JS
    return { success: false, error: 'Error al registrar los productos' };
  }

  // 3. Update stock for each variant
  for (const item of items) {
    const { error: stockError } = await supabase
      .from('variants')
      .update({ stock: item.stock - item.quantity })
      .eq('id', item.id);

    if (stockError) {
      console.error('Error updating stock:', stockError);
      // Continue anyway, but log the error
    }
  }

  return { success: true, transactionId: transaction.id };
}

