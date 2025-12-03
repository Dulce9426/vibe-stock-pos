'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Package, 
  Plus, 
  Trash2, 
  Save, 
  ArrowLeft,
  Upload,
  X,
  GripVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImageUpload } from '@/components/admin/products/image-upload';
import { 
  createProduct, 
  updateProduct,
  type ProductFormData,
  type VariantFormData,
  type ProductWithVariants
} from '@/app/(dashboard)/admin/products/actions';
import { generateSKU } from '@/lib/utils';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface ProductFormProps {
  product?: ProductWithVariants;
  categories: string[];
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function ProductForm({ product, categories }: ProductFormProps) {
  const router = useRouter();
  const isEditing = !!product;

  // Product state
  const [name, setName] = useState(product?.name || '');
  const [description, setDescription] = useState(product?.description || '');
  const [category, setCategory] = useState(product?.category || '');
  const [newCategory, setNewCategory] = useState('');
  const [imageUrl, setImageUrl] = useState(product?.image_url || '');
  const [isActive, setIsActive] = useState(product?.is_active ?? true);

  // Variants state
  const [variants, setVariants] = useState<VariantFormData[]>(
    product?.variants.map((v) => ({
      id: v.id,
      name: v.name,
      sku: v.sku,
      price: v.price,
      cost: v.cost || undefined,
      stock: v.stock,
      min_stock: v.min_stock || 5,
      barcode: v.barcode || undefined,
      is_active: v.is_active,
    })) || [createEmptyVariant()]
  );

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create empty variant
  function createEmptyVariant(): VariantFormData {
    return {
      name: 'Default',
      sku: generateSKU(),
      price: 0,
      stock: 0,
      min_stock: 5,
      is_active: true,
    };
  }

  // Add variant
  const addVariant = () => {
    setVariants([...variants, createEmptyVariant()]);
  };

  // Remove variant
  const removeVariant = (index: number) => {
    if (variants.length > 1) {
      setVariants(variants.filter((_, i) => i !== index));
    }
  };

  // Update variant
  const updateVariant = (index: number, field: keyof VariantFormData, value: any) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Validation
    if (!name.trim()) {
      setError('El nombre del producto es requerido');
      setIsSubmitting(false);
      return;
    }

    const finalCategory = newCategory.trim() || category;
    if (!finalCategory) {
      setError('La categoría es requerida');
      setIsSubmitting(false);
      return;
    }

    if (variants.length === 0) {
      setError('Debe tener al menos una variante');
      setIsSubmitting(false);
      return;
    }

    // Check variants
    for (const variant of variants) {
      if (!variant.sku.trim()) {
        setError('Todas las variantes deben tener SKU');
        setIsSubmitting(false);
        return;
      }
      if (variant.price <= 0) {
        setError('El precio debe ser mayor a 0');
        setIsSubmitting(false);
        return;
      }
    }

    const productData: ProductFormData = {
      name: name.trim(),
      description: description.trim() || undefined,
      category: finalCategory,
      image_url: imageUrl || undefined,
      is_active: isActive,
    };

    try {
      const result = isEditing
        ? await updateProduct(product.id, productData, variants)
        : await createProduct(productData, variants);

      if (result.success) {
        router.push('/admin/products');
        router.refresh();
      } else {
        setError(result.error || 'Error al guardar el producto');
      }
    } catch (err) {
      setError('Error inesperado al guardar');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
            </h1>
            <p className="text-slate-400 text-sm">
              {isEditing ? 'Modifica los datos del producto' : 'Agrega un nuevo producto al inventario'}
            </p>
          </div>
        </div>
        <Button
          type="submit"
          isLoading={isSubmitting}
          leftIcon={<Save className="w-4 h-4" />}
        >
          {isEditing ? 'Guardar Cambios' : 'Crear Producto'}
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info Card */}
          <div className="glass-card p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-violet-400" />
              Información Básica
            </h2>

            <Input
              label="Nombre del producto"
              placeholder="Ej: Camiseta Básica"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Descripción (opcional)
              </label>
              <textarea
                placeholder="Describe el producto..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Categoría
                </label>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    if (e.target.value) setNewCategory('');
                  }}
                  className="w-full h-12 px-4 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                >
                  <option value="">Seleccionar...</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <Input
                label="O crear nueva categoría"
                placeholder="Nueva categoría"
                value={newCategory}
                onChange={(e) => {
                  setNewCategory(e.target.value);
                  if (e.target.value) setCategory('');
                }}
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:ring-2 peer-focus:ring-violet-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-violet-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
              <span className="text-sm text-slate-300">
                Producto activo (visible en POS)
              </span>
            </div>
          </div>

          {/* Variants Card */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                Variantes
              </h2>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={addVariant}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Agregar
              </Button>
            </div>

            <div className="space-y-4">
              {variants.map((variant, index) => (
                <VariantRow
                  key={index}
                  variant={variant}
                  index={index}
                  canDelete={variants.length > 1}
                  onUpdate={(field, value) => updateVariant(index, field, value)}
                  onRemove={() => removeVariant(index)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          {/* Image Card */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Imagen
            </h2>
            <ImageUpload
              value={imageUrl}
              onChange={setImageUrl}
            />
          </div>
        </div>
      </div>
    </form>
  );
}

// -----------------------------------------------------------------------------
// Variant Row
// -----------------------------------------------------------------------------

interface VariantRowProps {
  variant: VariantFormData;
  index: number;
  canDelete: boolean;
  onUpdate: (field: keyof VariantFormData, value: any) => void;
  onRemove: () => void;
}

function VariantRow({ variant, index, canDelete, onUpdate, onRemove }: VariantRowProps) {
  return (
    <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-slate-600" />
          <span className="text-sm font-medium text-slate-300">
            Variante {index + 1}
          </span>
        </div>
        {canDelete && (
          <button
            type="button"
            onClick={onRemove}
            className="p-1 text-slate-500 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Nombre variante"
          placeholder="Ej: Talla M"
          value={variant.name}
          onChange={(e) => onUpdate('name', e.target.value)}
        />
        <Input
          label="SKU"
          placeholder="SKU-001"
          value={variant.sku}
          onChange={(e) => onUpdate('sku', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Input
          type="number"
          label="Precio"
          placeholder="0.00"
          value={variant.price || ''}
          onChange={(e) => onUpdate('price', parseFloat(e.target.value) || 0)}
        />
        <Input
          type="number"
          label="Costo"
          placeholder="0.00"
          value={variant.cost || ''}
          onChange={(e) => onUpdate('cost', parseFloat(e.target.value) || undefined)}
        />
        <Input
          type="number"
          label="Stock"
          placeholder="0"
          value={variant.stock || ''}
          onChange={(e) => onUpdate('stock', parseInt(e.target.value) || 0)}
        />
        <Input
          type="number"
          label="Stock mín."
          placeholder="5"
          value={variant.min_stock || ''}
          onChange={(e) => onUpdate('min_stock', parseInt(e.target.value) || 5)}
        />
      </div>

      <Input
        label="Código de barras (opcional)"
        placeholder="7501234567890"
        value={variant.barcode || ''}
        onChange={(e) => onUpdate('barcode', e.target.value || undefined)}
      />
    </div>
  );
}

