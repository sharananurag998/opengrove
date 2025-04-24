import { Product, ProductVersion } from '@/generated/prisma';

export interface CartItem {
  id: string; // Unique ID for the cart item
  productId: string;
  versionId?: string;
  quantity: number;
  price: number;
  product: Pick<Product, 'id' | 'name' | 'slug' | 'coverImage' | 'type' | 'creatorId'>;
  version?: Pick<ProductVersion, 'id' | 'name'>;
  creator: {
    id: string;
    username: string;
  };
}

export interface CartState {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
}

export interface CartContextValue extends CartState {
  addItem: (product: Product, version?: ProductVersion, quantity?: number) => Promise<void>;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
  getTax: (taxRate?: number) => number;
  getTotal: (taxRate?: number) => number;
  validateCart: () => Promise<void>;
}

export interface CartValidationResponse {
  valid: boolean;
  items: Array<{
    itemId: string;
    valid: boolean;
    error?: string;
    updatedPrice?: number;
  }>;
}