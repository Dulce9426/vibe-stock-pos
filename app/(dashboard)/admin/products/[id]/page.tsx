import { notFound } from 'next/navigation';
import { ProductForm } from '@/components/admin/products/product-form';
import { getProduct, getCategories } from '../actions';

// -----------------------------------------------------------------------------
// Edit Product Page
// -----------------------------------------------------------------------------

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  const [product, categories] = await Promise.all([
    getProduct(id),
    getCategories(),
  ]);

  if (!product) {
    notFound();
  }

  return <ProductForm product={product} categories={categories} />;
}

