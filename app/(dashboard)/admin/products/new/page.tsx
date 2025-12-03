import { ProductForm } from '@/components/admin/products/product-form';
import { getCategories } from '../actions';

// -----------------------------------------------------------------------------
// New Product Page
// -----------------------------------------------------------------------------

export default async function NewProductPage() {
  const categories = await getCategories();

  return <ProductForm categories={categories} />;
}

