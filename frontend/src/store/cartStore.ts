import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, MenuItem, Variant, Addon, Restaurant } from '@/types';

interface CartStore {
  restaurantId: string | null;
  branchId: string | null;
  restaurant: Restaurant | null;
  items: CartItem[];
  
  // Actions
  addItem: (
    menuItem: MenuItem,
    restaurantId: string,
    branchId: string,
    quantity?: number,
    variant?: Variant,
    addons?: Addon[],
    customizations?: string[],
    specialInstructions?: string
  ) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  setRestaurant: (restaurant: Restaurant) => void;
  
  // Computed
  getTotalItems: () => number;
  getSubtotal: () => number;
  getTotalWithTax: () => number;
  total: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      restaurantId: null,
      branchId: null,
      restaurant: null,
      items: [],

      setRestaurant: (restaurant) => {
        set({ restaurant });
      },

      addItem: (
        menuItem,
        restaurantId,
        branchId,
        quantity = 1,
        variant,
        addons = [],
        customizations = [],
        specialInstructions
      ) => {
        const state = get();
        
        // If cart has items from different restaurant, clear it
        if (state.restaurantId && state.restaurantId !== restaurantId) {
          set({
            restaurantId,
            branchId,
            items: [{
              menuItem,
              quantity,
              selectedVariant: variant,
              selectedAddons: addons,
              customizations,
              specialInstructions,
            }],
          });
          return;
        }

        // Check if item already exists
        const existingIndex = state.items.findIndex(
          (item) => item.menuItem.id === menuItem.id &&
            item.selectedVariant?.name === variant?.name
        );

        if (existingIndex >= 0) {
          // Update quantity
          const newItems = [...state.items];
          newItems[existingIndex].quantity += quantity;
          set({ items: newItems });
        } else {
          // Add new item
          set({
            restaurantId,
            branchId,
            items: [
              ...state.items,
              {
                menuItem,
                quantity,
                selectedVariant: variant,
                selectedAddons: addons,
                customizations,
                specialInstructions,
              },
            ],
          });
        }
      },

      removeItem: (menuItemId) => {
        const state = get();
        const newItems = state.items.filter(
          (item) => item.menuItem.id !== menuItemId
        );
        
        if (newItems.length === 0) {
          set({
            restaurantId: null,
            branchId: null,
            items: [],
          });
        } else {
          set({ items: newItems });
        }
      },

      updateQuantity: (menuItemId, quantity) => {
        const state = get();
        
        if (quantity <= 0) {
          get().removeItem(menuItemId);
          return;
        }

        const newItems = state.items.map((item) =>
          item.menuItem.id === menuItemId
            ? { ...item, quantity }
            : item
        );
        set({ items: newItems });
      },

      clearCart: () => {
        set({
          restaurantId: null,
          branchId: null,
          restaurant: null,
          items: [],
        });
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce((total, item) => {
          const basePrice = item.selectedVariant?.price || item.menuItem.final_price;
          const addonsPrice = item.selectedAddons.reduce(
            (sum, addon) => sum + addon.price,
            0
          );
          return total + (basePrice + addonsPrice) * item.quantity;
        }, 0);
      },

      getTotalWithTax: () => {
        const subtotal = get().getSubtotal();
        const tax = subtotal * 0.05; // 5% tax
        return subtotal + tax;
      },

      total: () => {
        return get().getTotalWithTax();
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
