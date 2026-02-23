"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { CartItem, Product } from "@/types";
import { useAuth } from "./AuthContext";
import api from "@/lib/api";
import toast from "react-hot-toast";

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalAmount: number;
  itemCount: number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchCart = useCallback(async () => {
    if (!user) { setItems([]); return; }
    try {
      setLoading(true);
      const { data } = await api.get("/cart");
      setItems(data.data?.items ?? []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = async (product: Product, quantity: number) => {
    const currentQty = items.find((i) => i.product._id === product._id)?.quantity ?? 0;
    const newQty = currentQty + quantity;

    // Optimistic update
    setItems((prev) => {
      const existing = prev.find((i) => i.product._id === product._id);
      if (existing) {
        return prev.map((i) =>
          i.product._id === product._id ? { ...i, quantity: newQty } : i
        );
      }
      return [...prev, { product, quantity }];
    });

    try {
      const { data } = await api.post("/cart", { productId: product._id, quantity: newQty });
      setItems(data.data?.items ?? []);
    } catch {
      toast.error("Failed to update cart");
      fetchCart();
    }
  };

  const removeFromCart = async (productId: string) => {
    setItems((prev) => prev.filter((i) => i.product._id !== productId));
    try {
      const { data } = await api.delete(`/cart/${productId}`);
      setItems(data.data?.items ?? []);
    } catch {
      toast.error("Failed to remove item");
      fetchCart();
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) { await removeFromCart(productId); return; }
    setItems((prev) =>
      prev.map((i) => (i.product._id === productId ? { ...i, quantity } : i))
    );
    try {
      const { data } = await api.patch(`/cart/${productId}`, { quantity });
      setItems(data.data?.items ?? []);
    } catch {
      toast.error("Failed to update quantity");
      fetchCart();
    }
  };

  const clearCart = async () => {
    setItems([]);
    try {
      await api.delete("/cart");
    } catch {
      toast.error("Failed to clear cart");
      fetchCart();
    }
  };

  const totalAmount = items.reduce(
    (sum, item) => sum + (item.product?.pricePerUnit ?? 0) * item.quantity,
    0
  );
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalAmount, itemCount, loading }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
