'use client';

import { useState } from 'react';
import { ShoppingCart, X } from 'lucide-react';
import { CartProvider, useCart } from '@/contexts/cart-context';
import { ProductGrid } from '@/components/pos/product-grid';
import { CartSidebar } from '@/components/pos/cart-sidebar';
import { CheckoutModal } from '@/components/pos/checkout-modal';
import { createTransaction } from './actions';
import type { Product, Variant, PaymentMethod } from '@/types/database.types';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface ProductWithVariants extends Product {
  variants: Variant[];
}

interface POSClientProps {
  initialProducts: ProductWithVariants[];
  categories: string[];
}

// -----------------------------------------------------------------------------
// Main Client Component (with Provider)
// -----------------------------------------------------------------------------

export function POSClient({ initialProducts, categories }: POSClientProps) {
  return (
    <CartProvider>
      <POSLayout initialProducts={initialProducts} categories={categories} />
    </CartProvider>
  );
}

// -----------------------------------------------------------------------------
// POS Layout (inside Provider)
// -----------------------------------------------------------------------------

function POSLayout({ initialProducts, categories }: POSClientProps) {
  const [showMobileCart, setShowMobileCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPaymentMethod, setCurrentPaymentMethod] = useState<PaymentMethod>('cash');
  const [transactionId, setTransactionId] = useState<string>();
  
  const { state, clearCart, itemCount } = useCart();

  const handleCheckout = async (paymentMethod: PaymentMethod) => {
    setCurrentPaymentMethod(paymentMethod);
    setShowCheckout(true);
  };

  const handleConfirmSale = async () => {
    setIsProcessing(true);
    
    try {
      const result = await createTransaction(
        state.items,
        currentPaymentMethod,
        state.subtotal,
        state.tax,
        state.discount,
        state.total
      );

      if (result.success) {
        setTransactionId(result.transactionId);
      } else {
        alert(result.error || 'Error al procesar la venta');
        setShowCheckout(false);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al procesar la venta');
      setShowCheckout(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNewSale = () => {
    clearCart();
    setTransactionId(undefined);
    setShowCheckout(false);
    setShowMobileCart(false);
  };

  return (
    <>
      <div className="flex-1 flex overflow-hidden">
        {/* Products Section */}
        <div className="flex-1 p-4 overflow-hidden">
          <ProductGrid products={initialProducts} categories={categories} />
        </div>

        {/* Cart Sidebar - Desktop */}
        <div className="hidden lg:block w-96">
          <CartSidebar onCheckout={handleCheckout} isProcessing={isProcessing} />
        </div>

        {/* Mobile Cart Overlay */}
        {showMobileCart && (
          <div className="lg:hidden fixed inset-0 z-40">
            <div 
              className="absolute inset-0 bg-black/60"
              onClick={() => setShowMobileCart(false)}
            />
            <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-slate-900 animate-slide-in-right">
              <button
                onClick={() => setShowMobileCart(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white z-10"
              >
                <X className="w-6 h-6" />
              </button>
              <CartSidebar onCheckout={handleCheckout} isProcessing={isProcessing} />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Cart FAB */}
      <button
        onClick={() => setShowMobileCart(true)}
        className="lg:hidden fixed bottom-6 right-6 w-16 h-16 bg-violet-500 rounded-full shadow-lg shadow-violet-500/30 flex items-center justify-center z-30 active:scale-95 transition-transform"
      >
        <ShoppingCart className="w-7 h-7 text-white" />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full text-white text-xs font-bold flex items-center justify-center">
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        )}
      </button>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => !transactionId && setShowCheckout(false)}
        total={state.total}
        items={state.items}
        paymentMethod={currentPaymentMethod}
        onConfirm={handleConfirmSale}
        onNewSale={handleNewSale}
        transactionId={transactionId}
      />
    </>
  );
}

