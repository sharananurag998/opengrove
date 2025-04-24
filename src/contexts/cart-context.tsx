'use client';

import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import { Product, ProductVersion } from '@/generated/prisma';
import { CartItem, CartState, CartContextValue, CartValidationResponse } from '@/types/cart';
import { useSession } from 'next-auth/react';

const CART_STORAGE_KEY = 'opengrove_cart';
const CART_EXPIRY_DAYS = 30;

// Action types
type CartAction =
  | { type: 'SET_ITEMS'; payload: CartItem[] }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { itemId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

// Initial state
const initialState: CartState = {
  items: [],
  isLoading: false,
  error: null,
};

// Reducer
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_ITEMS':
      return { ...state, items: action.payload, error: null };
    
    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(
        item => item.productId === action.payload.productId && 
                item.versionId === action.payload.versionId
      );
      
      if (existingItemIndex >= 0) {
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + action.payload.quantity,
        };
        return { ...state, items: updatedItems, error: null };
      }
      
      return { ...state, items: [...state.items, action.payload], error: null };
    }
    
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
        error: null,
      };
    
    case 'UPDATE_QUANTITY': {
      const { itemId, quantity } = action.payload;
      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(item => item.id !== itemId),
          error: null,
        };
      }
      
      return {
        ...state,
        items: state.items.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        ),
        error: null,
      };
    }
    
    case 'CLEAR_CART':
      return { ...state, items: [], error: null };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    default:
      return state;
  }
}

// Context
const CartContext = createContext<CartContextValue | undefined>(undefined);

// Storage helpers
function getStoredCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return [];
    
    const { items, expiry } = JSON.parse(stored);
    
    // Check if cart has expired
    if (new Date().getTime() > expiry) {
      localStorage.removeItem(CART_STORAGE_KEY);
      return [];
    }
    
    return items || [];
  } catch (error) {
    console.error('Error loading cart from storage:', error);
    return [];
  }
}

function saveCartToStorage(items: CartItem[]) {
  if (typeof window === 'undefined') return;
  
  try {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + CART_EXPIRY_DAYS);
    
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify({
        items,
        expiry: expiry.getTime(),
      })
    );
  } catch (error) {
    console.error('Error saving cart to storage:', error);
  }
}

// Provider component
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { data: session } = useSession();

  // Load cart from localStorage on mount
  useEffect(() => {
    const storedItems = getStoredCart();
    if (storedItems.length > 0) {
      dispatch({ type: 'SET_ITEMS', payload: storedItems });
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    saveCartToStorage(state.items);
  }, [state.items]);

  // Add item to cart
  const addItem = useCallback(async (
    product: Product,
    version?: ProductVersion,
    quantity: number = 1
  ) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Fetch creator info
      const response = await fetch(`/api/products/${product.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch product details');
      }
      
      const productWithCreator = await response.json();
      
      const cartItem: CartItem = {
        id: `${product.id}-${version?.id || 'default'}-${Date.now()}`,
        productId: product.id,
        versionId: version?.id,
        quantity,
        price: version?.price ? Number(version.price) : Number(product.price || 0),
        product: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          coverImage: product.coverImage,
          type: product.type,
          creatorId: product.creatorId,
        },
        version: version ? {
          id: version.id,
          name: version.name,
        } : undefined,
        creator: {
          id: productWithCreator.creator.id,
          username: productWithCreator.creator.username,
        },
      };
      
      dispatch({ type: 'ADD_ITEM', payload: cartItem });
    } catch (error) {
      console.error('Error adding item to cart:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add item to cart' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Remove item from cart
  const removeItem = useCallback((itemId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: itemId });
  }, []);

  // Update item quantity
  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { itemId, quantity } });
  }, []);

  // Clear cart
  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  // Get item count
  const getItemCount = useCallback(() => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  }, [state.items]);

  // Get subtotal
  const getSubtotal = useCallback(() => {
    return state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [state.items]);

  // Get tax
  const getTax = useCallback((taxRate: number = 0) => {
    const subtotal = getSubtotal();
    return subtotal * taxRate;
  }, [getSubtotal]);

  // Get total
  const getTotal = useCallback((taxRate: number = 0) => {
    const subtotal = getSubtotal();
    const tax = getTax(taxRate);
    return subtotal + tax;
  }, [getSubtotal, getTax]);

  // Validate cart with server
  const validateCart = useCallback(async () => {
    if (state.items.length === 0) return;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await fetch('/api/cart/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: state.items.map(item => ({
            productId: item.productId,
            versionId: item.versionId,
            quantity: item.quantity,
            price: item.price,
          })),
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to validate cart');
      }
      
      const validation: CartValidationResponse = await response.json();
      
      // Update prices if needed
      if (!validation.valid) {
        const updatedItems = state.items.map(item => {
          const validationItem = validation.items.find(v => v.itemId === item.id);
          if (validationItem && validationItem.updatedPrice !== undefined) {
            return { ...item, price: validationItem.updatedPrice };
          }
          return item;
        });
        
        dispatch({ type: 'SET_ITEMS', payload: updatedItems });
      }
    } catch (error) {
      console.error('Error validating cart:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to validate cart' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.items]);

  const value: CartContextValue = {
    ...state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemCount,
    getSubtotal,
    getTax,
    getTotal,
    validateCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// Hook to use cart context
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}