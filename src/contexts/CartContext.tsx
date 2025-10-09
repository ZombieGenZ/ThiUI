import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface CartItem {
  id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  selected?: boolean;
  product?: {
    name: string;
    base_price: number;
    sale_price: number | null;
    images: string[];
    slug: string;
  };
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  total: number;
  selectedTotal: number;
  loading: boolean;
  addToCart: (productId: string, quantity: number, variantId?: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  toggleItemSelection: (itemId: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setItems(prevItems => prevItems.map(item => ({ ...item, selected: true })));
  }, [user]);

  const refreshCart = async () => {
    if (!user) {
      setItems([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          product_id,
          variant_id,
          quantity,
          product:products(name, base_price, sale_price, images, slug)
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      setItems((data as any || []).map((item: CartItem) => ({ ...item, selected: true })));
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [user]);

  const addToCart = async (productId: string, quantity: number, variantId?: string) => {
    if (!user) {
      throw new Error('Please sign in to add items to cart');
    }

    try {
      const existingItem = items.find(
        item => item.product_id === productId && item.variant_id === (variantId || null)
      );

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
          .eq('id', existingItem.id);

        if (error) throw error;

        setItems(prevItems =>
          prevItems.map(item =>
            item.id === existingItem.id ? { ...item, quantity: newQuantity } : item
          )
        );
      } else {
        const { data, error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: productId,
            variant_id: variantId || null,
            quantity,
          })
          .select(`
            id,
            product_id,
            variant_id,
            quantity,
            product:products(name, base_price, sale_price, images, slug)
          `)
          .single();

        if (error) throw error;

        if (data) {
          setItems(prevItems => [...prevItems, { ...data as any, selected: true }]);
        }
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }

    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity, updated_at: new Date().toISOString() })
        .eq('id', itemId);

      if (error) throw error;
      await refreshCart();
    } catch (error) {
      console.error('Error updating cart:', error);
      throw error;
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const { error } = await supabase.from('cart_items').delete().eq('id', itemId);
      if (error) throw error;
      await refreshCart();
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    if (!user) return;

    try {
      const { error } = await supabase.from('cart_items').delete().eq('user_id', user.id);
      if (error) throw error;
      setItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  };

  const toggleItemSelection = (itemId: string) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const selectAll = () => {
    setItems(prevItems => prevItems.map(item => ({ ...item, selected: true })));
  };

  const deselectAll = () => {
    setItems(prevItems => prevItems.map(item => ({ ...item, selected: false })));
  };

  const itemCount = useMemo(() =>
    items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const total = useMemo(() =>
    items.reduce((sum, item) => {
      const price = item.product?.sale_price || item.product?.base_price || 0;
      return sum + price * item.quantity;
    }, 0),
    [items]
  );

  const selectedTotal = useMemo(() =>
    items
      .filter(item => item.selected)
      .reduce((sum, item) => {
        const price = item.product?.sale_price || item.product?.base_price || 0;
        return sum + price * item.quantity;
      }, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        total,
        selectedTotal,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart,
        toggleItemSelection,
        selectAll,
        deselectAll,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
