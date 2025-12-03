'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import type { Product, Variant } from '@/types/database.types';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface ProductWithVariants extends Product {
  variants: Variant[];
}

export interface ActionResult {
  success: boolean;
  error?: string;
  data?: any;
}

export interface ProductFormData {
  name: string;
  description?: string;
  category: string;
  image_url?: string;
  is_active: boolean;
}

export interface VariantFormData {
  id?: string;
  name: string;
  sku: string;
  price: number;
  cost?: number;
  stock: number;
  min_stock?: number;
  barcode?: string;
  is_active: boolean;
}

// -----------------------------------------------------------------------------
// Get All Products
// -----------------------------------------------------------------------------

export async function getProducts(options?: {
  search?: string;
  category?: string;
  status?: 'all' | 'active' | 'inactive';
}): Promise<ProductWithVariants[]> {
  const supabase = await createClient();

  let query = supabase
    .from('products')
    .select(`
      *,
      variants (*)
    `)
    .order('created_at', { ascending: false });

  // Filter by search
  if (options?.search) {
    query = query.ilike('name', `%${options.search}%`);
  }

  // Filter by category
  if (options?.category) {
    query = query.eq('category', options.category);
  }

  // Filter by status
  if (options?.status === 'active') {
    query = query.eq('is_active', true);
  } else if (options?.status === 'inactive') {
    query = query.eq('is_active', false);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  return data || [];
}

// -----------------------------------------------------------------------------
// Get Single Product
// -----------------------------------------------------------------------------

export async function getProduct(id: string): Promise<ProductWithVariants | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      variants (*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching product:', error);
    return null;
  }

  return data;
}

// -----------------------------------------------------------------------------
// Get Categories
// -----------------------------------------------------------------------------

export async function getCategories(): Promise<string[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('products')
    .select('category');

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  const categories = [...new Set(data?.map((p) => p.category).filter(Boolean))];
  return categories as string[];
}

// -----------------------------------------------------------------------------
// Create Product
// -----------------------------------------------------------------------------

export async function createProduct(
  productData: ProductFormData,
  variants: VariantFormData[]
): Promise<ActionResult> {
  const supabase = await createClient();

  // Create product
  const { data: product, error: productError } = await supabase
    .from('products')
    .insert({
      name: productData.name,
      description: productData.description || null,
      category: productData.category,
      image_url: productData.image_url || null,
      is_active: productData.is_active,
    })
    .select()
    .single();

  if (productError || !product) {
    console.error('Error creating product:', productError);
    return { success: false, error: 'Error al crear el producto' };
  }

  // Create variants
  if (variants.length > 0) {
    const variantsToInsert = variants.map((v) => ({
      product_id: product.id,
      name: v.name,
      sku: v.sku,
      price: v.price,
      cost: v.cost || null,
      stock: v.stock,
      min_stock: v.min_stock || 5,
      barcode: v.barcode || null,
      is_active: v.is_active,
    }));

    const { error: variantsError } = await supabase
      .from('variants')
      .insert(variantsToInsert);

    if (variantsError) {
      console.error('Error creating variants:', variantsError);
      // Delete the product if variants failed
      await supabase.from('products').delete().eq('id', product.id);
      return { success: false, error: 'Error al crear las variantes' };
    }
  }

  revalidatePath('/admin/products');
  return { success: true, data: product };
}

// -----------------------------------------------------------------------------
// Update Product
// -----------------------------------------------------------------------------

export async function updateProduct(
  productId: string,
  productData: ProductFormData,
  variants: VariantFormData[]
): Promise<ActionResult> {
  const supabase = await createClient();

  // Update product
  const { error: productError } = await supabase
    .from('products')
    .update({
      name: productData.name,
      description: productData.description || null,
      category: productData.category,
      image_url: productData.image_url || null,
      is_active: productData.is_active,
      updated_at: new Date().toISOString(),
    })
    .eq('id', productId);

  if (productError) {
    console.error('Error updating product:', productError);
    return { success: false, error: 'Error al actualizar el producto' };
  }

  // Handle variants
  const existingVariantIds = variants.filter((v) => v.id).map((v) => v.id);
  
  // Delete removed variants
  if (existingVariantIds.length > 0) {
    await supabase
      .from('variants')
      .delete()
      .eq('product_id', productId)
      .not('id', 'in', `(${existingVariantIds.join(',')})`);
  } else {
    // Delete all variants if none provided with IDs
    await supabase.from('variants').delete().eq('product_id', productId);
  }

  // Update or insert variants
  for (const variant of variants) {
    if (variant.id) {
      // Update existing variant
      await supabase
        .from('variants')
        .update({
          name: variant.name,
          sku: variant.sku,
          price: variant.price,
          cost: variant.cost || null,
          stock: variant.stock,
          min_stock: variant.min_stock || 5,
          barcode: variant.barcode || null,
          is_active: variant.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', variant.id);
    } else {
      // Insert new variant
      await supabase.from('variants').insert({
        product_id: productId,
        name: variant.name,
        sku: variant.sku,
        price: variant.price,
        cost: variant.cost || null,
        stock: variant.stock,
        min_stock: variant.min_stock || 5,
        barcode: variant.barcode || null,
        is_active: variant.is_active,
      });
    }
  }

  revalidatePath('/admin/products');
  revalidatePath(`/admin/products/${productId}`);
  return { success: true };
}

// -----------------------------------------------------------------------------
// Delete Product
// -----------------------------------------------------------------------------

export async function deleteProduct(productId: string): Promise<ActionResult> {
  const supabase = await createClient();

  // Delete variants first (cascade)
  await supabase.from('variants').delete().eq('product_id', productId);

  // Delete product
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);

  if (error) {
    console.error('Error deleting product:', error);
    return { success: false, error: 'Error al eliminar el producto' };
  }

  revalidatePath('/admin/products');
  return { success: true };
}

// -----------------------------------------------------------------------------
// Toggle Product Status
// -----------------------------------------------------------------------------

export async function toggleProductStatus(
  productId: string,
  isActive: boolean
): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('products')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', productId);

  if (error) {
    console.error('Error toggling product status:', error);
    return { success: false, error: 'Error al cambiar el estado' };
  }

  revalidatePath('/admin/products');
  return { success: true };
}

// -----------------------------------------------------------------------------
// Upload Image
// -----------------------------------------------------------------------------

export async function uploadProductImage(
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  
  const file = formData.get('file') as File;
  if (!file) {
    return { success: false, error: 'No se proporcionó archivo' };
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `products/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('images')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Error uploading image:', uploadError);
    return { success: false, error: 'Error al subir la imagen' };
  }

  const { data: { publicUrl } } = supabase.storage
    .from('images')
    .getPublicUrl(filePath);

  return { success: true, data: { url: publicUrl } };
}

// -----------------------------------------------------------------------------
// Delete Image
// -----------------------------------------------------------------------------

export async function deleteProductImage(imageUrl: string): Promise<ActionResult> {
  const supabase = await createClient();

  // Extract file path from URL
  const urlParts = imageUrl.split('/');
  const filePath = urlParts.slice(-2).join('/'); // products/filename.ext

  const { error } = await supabase.storage.from('images').remove([filePath]);

  if (error) {
    console.error('Error deleting image:', error);
    return { success: false, error: 'Error al eliminar la imagen' };
  }

  return { success: true };
}

