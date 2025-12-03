'use client';

import { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { CartItem, Variant, Product } from '@/types/database.types';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface CartState {
  items: CartItem[];
  subtotal: number;
  tax: number;
  taxRate: number;
  discount: number;
  total: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { variant: Variant; product: Product } }
  | { type: 'REMOVE_ITEM'; payload: { variantId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { variantId: string; quantity: number } }
  | { type: 'SET_DISCOUNT'; payload: { discount: number } }
  | { type: 'CLEAR_CART' };

interface CartContextType {
  state: CartState;
  addItem: (variant: Variant, product: Product) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  setDiscount: (discount: number) => void;
  clearCart: () => void;
  itemCount: number;
}

// -----------------------------------------------------------------------------
// Initial State
// -----------------------------------------------------------------------------

const TAX_RATE = 0.16; // 16% IVA

const initialState: CartState = {
  items: [],
  subtotal: 0,
  tax: 0,
  taxRate: TAX_RATE,
  discount: 0,
  total: 0,
};

// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------

function calculateTotals(items: CartItem[], discount: number, taxRate: number): Omit<CartState, 'items' | 'taxRate'> {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountedSubtotal = subtotal - discount;
  const tax = discountedSubtotal * taxRate;
  const total = discountedSubtotal + tax;

  return {
    subtotal,
    tax,
    discount,
    total: Math.max(0, total),
  };
}

// -----------------------------------------------------------------------------
// Reducer
// -----------------------------------------------------------------------------

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { variant, product } = action.payload;
      const existingItem = state.items.find((item) => item.id === variant.id);

      let newItems: CartItem[];

      if (existingItem) {
        // Incrementar cantidad si ya existe
        newItems = state.items.map((item) =>
          item.id === variant.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Agregar nuevo item
        const newItem: CartItem = {
          ...variant,
          quantity: 1,
          product_name: product.name,
          product_image: product.image_url,
        };
        newItems = [...state.items, newItem];
      }

      return {
        ...state,
        items: newItems,
        ...calculateTotals(newItems, state.discount, state.taxRate),
      };
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(
        (item) => item.id !== action.payload.variantId
      );
      return {
        ...state,
        items: newItems,
        ...calculateTotals(newItems, state.discount, state.taxRate),
      };
    }

    case 'UPDATE_QUANTITY': {
      const { variantId, quantity } = action.payload;

      if (quantity <= 0) {
        const newItems = state.items.filter((item) => item.id !== variantId);
        return {
          ...state,
          items: newItems,
          ...calculateTotals(newItems, state.discount, state.taxRate),
        };
      }

      const newItems = state.items.map((item) =>
        item.id === variantId ? { ...item, quantity } : item
      );

      return {
        ...state,
        items: newItems,
        ...calculateTotals(newItems, state.discount, state.taxRate),
      };
    }

    case 'SET_DISCOUNT': {
      return {
        ...state,
        ...calculateTotals(state.items, action.payload.discount, state.taxRate),
      };
    }

    case 'CLEAR_CART': {
      return initialState;
    }

    default:
      return state;
  }
}

// -----------------------------------------------------------------------------
// Context
// -----------------------------------------------------------------------------

const CartContext = createContext<CartContextType | undefined>(undefined);

// -----------------------------------------------------------------------------
// Provider
// -----------------------------------------------------------------------------

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addItem = (variant: Variant, product: Product) => {
    dispatch({ type: 'ADD_ITEM', payload: { variant, product } });
  };

  const removeItem = (variantId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { variantId } });
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { variantId, quantity } });
  };

  const setDiscount = (discount: number) => {
    dispatch({ type: 'SET_DISCOUNT', payload: { discount } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        state,
        addItem,
        removeItem,
        updateQuantity,
        setDiscount,
        clearCart,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

