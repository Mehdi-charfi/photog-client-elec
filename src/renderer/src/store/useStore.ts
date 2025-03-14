import { create } from 'zustand';
import { CartItem, Photo, PhotoFormat } from '../types';

interface Settings {
  small_print_price: number;
  medium_print_price: number;
  large_print_price: number;
  xlarge_print_price: number;
  digital_price: number;
}

interface StoreState {
  cart: CartItem[];
  settings: Settings | null;
  addToCart: (photo: Photo, format: PhotoFormat, filterName?: string, filterClass?: string) => void;
  removeFromCart: (photoId: string) => void;
  clearCart: () => void;
  setSettings: (settings: Settings) => void;
}

export const useStore = create<StoreState>((set) => ({
  cart: [],
  settings: null,
  addToCart: (photo, format, filterName, filterClass) =>
    set((state) => ({
      cart: [...state.cart, { photoId: photo.id, photo, filterName, filterClass, format }],
    })),
  removeFromCart: (photoId) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.photoId !== photoId),
    })),
  clearCart: () => set({ cart: [] }),
  setSettings: (settings) => set({ settings }),
}));