'use client';

import { 
  Receipt, 
  CreditCard, 
  Banknote, 
  Smartphone,
  Clock,
  CheckCircle2,
  XCircle,
  MoreHorizontal
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { RecentTransaction } from '@/app/(dashboard)/admin/actions';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface RecentTransactionsProps {
  transactions: RecentTransaction[];
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  if (transactions.length === 0) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
            <Receipt className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-white">Transacciones Recientes</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Receipt className="w-12 h-12 text-slate-600 mb-3" />
          <p className="text-slate-400">No hay transacciones aún</p>
          <p className="text-sm text-slate-500 mt-1">
            Las ventas aparecerán aquí
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
            <Receipt className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-white">Transacciones Recientes</h3>
        </div>
        <button className="text-sm text-violet-400 hover:text-violet-300 transition-colors">
          Ver todas
        </button>
      </div>

      {/* Transactions List */}
      <div className="space-y-3">
        {transactions.map((transaction) => (
          <TransactionRow key={transaction.id} transaction={transaction} />
        ))}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Transaction Row
// -----------------------------------------------------------------------------

function TransactionRow({ transaction }: { transaction: RecentTransaction }) {
  const PaymentIcon = {
    cash: Banknote,
    card: CreditCard,
    transfer: Smartphone,
  }[transaction.payment_method] || Banknote;

  const StatusIcon = {
    completed: CheckCircle2,
    pending: Clock,
    cancelled: XCircle,
  }[transaction.status] || Clock;

  const statusColors = {
    completed: 'text-emerald-400',
    pending: 'text-amber-400',
    cancelled: 'text-red-400',
  }[transaction.status] || 'text-slate-400';

  return (
    <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 transition-colors">
      {/* Payment Method Icon */}
      <div className="p-2.5 rounded-xl bg-slate-700/50">
        <PaymentIcon className="w-5 h-5 text-slate-400" />
      </div>

      {/* Transaction Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-white truncate">
            #{transaction.id.slice(0, 8).toUpperCase()}
          </p>
          <StatusIcon className={`w-4 h-4 ${statusColors}`} />
        </div>
        <p className="text-sm text-slate-500">
          {transaction.items_count} artículos • {transaction.user_name}
        </p>
      </div>

      {/* Amount & Time */}
      <div className="text-right">
        <p className="font-semibold text-white">
          {formatCurrency(transaction.total)}
        </p>
        <p className="text-xs text-slate-500">
          {formatRelativeTime(transaction.created_at)}
        </p>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Helper: Format Relative Time
// -----------------------------------------------------------------------------

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours} h`;
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  
  return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
}

