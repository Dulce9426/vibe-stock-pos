'use client';

import { useState } from 'react';
import { 
  ShoppingCart, 
  Trash2, 
  Minus, 
  Plus, 
  X,
  CreditCard,
  Banknote,
  Smartphone,
  Tag
} from 'lucide-react';
import { useCart } from '@/contexts/cart-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';
import type { CartItem, PaymentMethod } from '@/types/database.types';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface CartSidebarProps {
  onCheckout: (paymentMethod: PaymentMethod) => Promise<void>;
  isProcessing: boolean;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function CartSidebar({ onCheckout, isProcessing }: CartSidebarProps) {
  const { state, removeItem, updateQuantity, setDiscount, clearCart, itemCount } = useCart();
  const [showDiscount, setShowDiscount] = useState(false);
  const [discountInput, setDiscountInput] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('cash');

  const handleApplyDiscount = () => {
    const discount = parseFloat(discountInput) || 0;
    setDiscount(Math.min(discount, state.subtotal)); // No puede ser mayor al subtotal
    setShowDiscount(false);
  };

  const handleCheckout = async () => {
    await onCheckout(selectedPayment);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/50 border-l border-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="relative">
            <ShoppingCart className="w-6 h-6 text-violet-400" />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-violet-500 rounded-full text-xs font-bold flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </div>
          <h2 className="text-lg font-semibold text-white">Carrito</h2>
        </div>
        {state.items.length > 0 && (
          <button
            onClick={clearCart}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            title="Vaciar carrito"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {state.items.length === 0 ? (
          <EmptyCart />
        ) : (
          state.items.map((item) => (
            <CartItemCard
              key={item.id}
              item={item}
              onRemove={() => removeItem(item.id)}
              onUpdateQuantity={(qty) => updateQuantity(item.id, qty)}
            />
          ))
        )}
      </div>

      {/* Totals & Checkout */}
      {state.items.length > 0 && (
        <div className="border-t border-slate-800 p-4 space-y-4">
          {/* Discount Toggle */}
          {!showDiscount ? (
            <button
              onClick={() => setShowDiscount(true)}
              className="flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition-colors"
            >
              <Tag className="w-4 h-4" />
              Aplicar descuento
            </button>
          ) : (
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="$ Descuento"
                value={discountInput}
                onChange={(e) => setDiscountInput(e.target.value)}
                className="h-10"
              />
              <Button size="sm" onClick={handleApplyDiscount}>
                Aplicar
              </Button>
              <button
                onClick={() => {
                  setShowDiscount(false);
                  setDiscountInput('');
                  setDiscount(0);
                }}
                className="p-2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Totals */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span>{formatCurrency(state.subtotal)}</span>
            </div>
            {state.discount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Descuento</span>
                <span>-{formatCurrency(state.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-400">
              <span>IVA (16%)</span>
              <span>{formatCurrency(state.tax)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-white pt-2 border-t border-slate-700">
              <span>Total</span>
              <span className="text-violet-400">{formatCurrency(state.total)}</span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <p className="text-sm text-slate-400">Método de pago</p>
            <div className="grid grid-cols-3 gap-2">
              <PaymentButton
                icon={<Banknote className="w-5 h-5" />}
                label="Efectivo"
                active={selectedPayment === 'cash'}
                onClick={() => setSelectedPayment('cash')}
              />
              <PaymentButton
                icon={<CreditCard className="w-5 h-5" />}
                label="Tarjeta"
                active={selectedPayment === 'card'}
                onClick={() => setSelectedPayment('card')}
              />
              <PaymentButton
                icon={<Smartphone className="w-5 h-5" />}
                label="Transfer"
                active={selectedPayment === 'transfer'}
                onClick={() => setSelectedPayment('transfer')}
              />
            </div>
          </div>

          {/* Checkout Button */}
          <Button
            className="w-full"
            size="lg"
            onClick={handleCheckout}
            isLoading={isProcessing}
          >
            Cobrar {formatCurrency(state.total)}
          </Button>
        </div>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Cart Item Card
// -----------------------------------------------------------------------------

interface CartItemCardProps {
  item: CartItem;
  onRemove: () => void;
  onUpdateQuantity: (quantity: number) => void;
}

function CartItemCard({ item, onRemove, onUpdateQuantity }: CartItemCardProps) {
  return (
    <div className="flex gap-3 p-3 bg-slate-800/50 rounded-xl">
      {/* Image */}
      <div className="w-16 h-16 rounded-lg bg-slate-700 flex-shrink-0 overflow-hidden">
        {item.product_image ? (
          <img
            src={item.product_image}
            alt={item.product_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-500">
            <ShoppingCart className="w-6 h-6" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-white truncate">
          {item.product_name}
        </h4>
        <p className="text-xs text-slate-500">{item.name}</p>
        <p className="text-sm font-semibold text-violet-400 mt-1">
          {formatCurrency(item.price)}
        </p>
      </div>

      {/* Quantity Controls */}
      <div className="flex flex-col items-end justify-between">
        <button
          onClick={onRemove}
          className="p-1 text-slate-500 hover:text-red-400 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onUpdateQuantity(item.quantity - 1)}
            className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-white transition-colors"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="w-8 text-center text-sm font-medium text-white">
            {item.quantity}
          </span>
          <button
            onClick={() => onUpdateQuantity(item.quantity + 1)}
            disabled={item.quantity >= item.stock}
            className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-white transition-colors"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Payment Button
// -----------------------------------------------------------------------------

interface PaymentButtonProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

function PaymentButton({ icon, label, active, onClick }: PaymentButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-200
        ${active
          ? 'bg-violet-500 text-white'
          : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
        }
      `}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}

// -----------------------------------------------------------------------------
// Empty Cart
// -----------------------------------------------------------------------------

function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
        <ShoppingCart className="w-8 h-8 text-slate-600" />
      </div>
      <h3 className="text-lg font-medium text-white mb-2">Carrito vacío</h3>
      <p className="text-slate-400 text-sm">
        Agrega productos para comenzar
      </p>
    </div>
  );
}

