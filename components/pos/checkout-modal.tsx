'use client';

import { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  Printer, 
  RotateCcw,
  Banknote,
  Calculator
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';
import type { PaymentMethod, CartItem } from '@/types/database.types';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  items: CartItem[];
  paymentMethod: PaymentMethod;
  onConfirm: () => void;
  onNewSale: () => void;
  transactionId?: string;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function CheckoutModal({
  isOpen,
  onClose,
  total,
  items,
  paymentMethod,
  onConfirm,
  onNewSale,
  transactionId,
}: CheckoutModalProps) {
  const [cashReceived, setCashReceived] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  const cashAmount = parseFloat(cashReceived) || 0;
  const change = cashAmount - total;
  const canComplete = paymentMethod !== 'cash' || cashAmount >= total;

  // Reset state cuando se abre/cierra
  useEffect(() => {
    if (isOpen) {
      setCashReceived('');
      setIsComplete(false);
    }
  }, [isOpen]);

  const handleConfirm = () => {
    onConfirm();
    setIsComplete(true);
  };

  const handleNewSale = () => {
    onNewSale();
    onClose();
  };

  const quickAmounts = [
    Math.ceil(total / 10) * 10,
    Math.ceil(total / 50) * 50,
    Math.ceil(total / 100) * 100,
    Math.ceil(total / 500) * 500,
  ].filter((amount, index, self) => 
    amount >= total && self.indexOf(amount) === index
  ).slice(0, 4);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white">
            {isComplete ? '¡Venta Completada!' : 'Confirmar Venta'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isComplete ? (
            // Success State
            <div className="text-center py-4">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center animate-fade-in">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {formatCurrency(total)}
              </h3>
              <p className="text-slate-400 mb-1">
                Transacción #{transactionId?.slice(0, 8).toUpperCase()}
              </p>
              {paymentMethod === 'cash' && change > 0 && (
                <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                  <p className="text-amber-400 font-medium">
                    Cambio: {formatCurrency(change)}
                  </p>
                </div>
              )}
            </div>
          ) : (
            // Checkout Form
            <div className="space-y-6">
              {/* Total */}
              <div className="text-center py-4 rounded-xl bg-slate-800/50">
                <p className="text-slate-400 text-sm mb-1">Total a cobrar</p>
                <p className="text-4xl font-bold text-violet-400">
                  {formatCurrency(total)}
                </p>
                <p className="text-slate-500 text-sm mt-2">
                  {items.reduce((sum, item) => sum + item.quantity, 0)} artículos
                </p>
              </div>

              {/* Cash Input (solo para efectivo) */}
              {paymentMethod === 'cash' && (
                <div className="space-y-3">
                  <Input
                    type="number"
                    label="Efectivo recibido"
                    placeholder="0.00"
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    leftIcon={<Banknote className="w-5 h-5" />}
                  />

                  {/* Quick Amount Buttons */}
                  <div className="flex gap-2 flex-wrap">
                    {quickAmounts.map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setCashReceived(amount.toString())}
                        className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
                      >
                        {formatCurrency(amount)}
                      </button>
                    ))}
                  </div>

                  {/* Change Display */}
                  {cashAmount >= total && (
                    <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                      <div className="flex items-center gap-2">
                        <Calculator className="w-5 h-5 text-emerald-400" />
                        <span className="text-emerald-400">Cambio</span>
                      </div>
                      <span className="text-xl font-bold text-emerald-400">
                        {formatCurrency(change)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Payment Method Display */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50">
                <span className="text-slate-400">Método de pago</span>
                <span className="text-white font-medium capitalize">
                  {paymentMethod === 'cash' ? 'Efectivo' : 
                   paymentMethod === 'card' ? 'Tarjeta' : 'Transferencia'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          {isComplete ? (
            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="flex-1"
                leftIcon={<Printer className="w-4 h-4" />}
                onClick={() => window.print()}
              >
                Imprimir
              </Button>
              <Button
                className="flex-1"
                leftIcon={<RotateCcw className="w-4 h-4" />}
                onClick={handleNewSale}
              >
                Nueva Venta
              </Button>
            </div>
          ) : (
            <Button
              className="w-full"
              size="lg"
              onClick={handleConfirm}
              disabled={!canComplete}
            >
              Confirmar Venta
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

