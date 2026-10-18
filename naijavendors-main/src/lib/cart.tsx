import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { MarketplaceProduct } from "@/lib/marketplace-data";
import { getProductById } from "@/lib/use-products";

export type CartItem = {
  productId: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (productId: string, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
  lines: Array<{ product: MarketplaceProduct; quantity: number; lineTotal: number }>;
};

const STORAGE_KEY = "9ja-vendors-cart-v1";
const CartContext = createContext<CartContextValue | null>(null);

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((i) => i && typeof i.productId === "string" && i.quantity > 0);
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(loadCart());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const addItem = useCallback((productId: string, quantity = 1) => {
    const product = getProductById(productId);
    if (!product || product.quantity <= 0) return;
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === productId);
      const nextQty = Math.min(product.quantity, (existing?.quantity ?? 0) + quantity);
      if (nextQty <= 0) return prev.filter((i) => i.productId !== productId);
      if (existing) {
        return prev.map((i) => (i.productId === productId ? { ...i, quantity: nextQty } : i));
      }
      return [...prev, { productId, quantity: nextQty }];
    });
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    const product = getProductById(productId);
    if (!product) return;
    const q = Math.max(0, Math.min(product.quantity, Math.floor(quantity)));
    setItems((prev) => {
      if (q <= 0) return prev.filter((i) => i.productId !== productId);
      const existing = prev.find((i) => i.productId === productId);
      if (existing) return prev.map((i) => (i.productId === productId ? { ...i, quantity: q } : i));
      return [...prev, { productId, quantity: q }];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const lines = useMemo(() => {
    return items
      .map((item) => {
        const product = getProductById(item.productId);
        if (!product) return null;
        return {
          product,
          quantity: item.quantity,
          lineTotal: product.price * item.quantity,
        };
      })
      .filter(Boolean) as Array<{ product: MarketplaceProduct; quantity: number; lineTotal: number }>;
  }, [items]);

  const totalItems = useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items]);
  const totalAmount = useMemo(() => lines.reduce((s, l) => s + l.lineTotal, 0), [lines]);

  const value = useMemo(
    () => ({ items, addItem, setQuantity, removeItem, clearCart, totalItems, totalAmount, lines }),
    [items, addItem, setQuantity, removeItem, clearCart, totalItems, totalAmount, lines],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
