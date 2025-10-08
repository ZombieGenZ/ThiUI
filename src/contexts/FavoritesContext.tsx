import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface Favorite {
  id: string;
  product_id: string;
  created_at: string;
  product?: {
    id: string;
    name: string;
    slug: string;
    base_price: number;
    sale_price: number | null;
    images: string[];
    rating: number;
    review_count: number;
    is_new: boolean;
    stock_quantity: number;
  };
}

interface FavoritesContextType {
  favorites: Favorite[];
  loading: boolean;
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => Promise<void>;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshFavorites = async () => {
    if (!user) {
      setFavorites([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          id,
          product_id,
          created_at,
          product:products(
            id,
            name,
            slug,
            base_price,
            sale_price,
            images,
            rating,
            review_count,
            is_new,
            stock_quantity
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFavorites(data as any || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshFavorites();
  }, [user]);

  const isFavorite = (productId: string): boolean => {
    return favorites.some(fav => fav.product_id === productId);
  };

  const toggleFavorite = async (productId: string) => {
    if (!user) {
      throw new Error('Please sign in to save favorites');
    }

    try {
      const existingFavorite = favorites.find(fav => fav.product_id === productId);

      if (existingFavorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('id', existingFavorite.id);

        if (error) throw error;

        setFavorites(prevFavorites =>
          prevFavorites.filter(fav => fav.id !== existingFavorite.id)
        );
      } else {
        const { data, error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            product_id: productId,
          })
          .select(`
            id,
            product_id,
            created_at,
            product:products(
              id,
              name,
              slug,
              base_price,
              sale_price,
              images,
              rating,
              review_count,
              is_new,
              stock_quantity
            )
          `)
          .single();

        if (error) throw error;

        if (data) {
          setFavorites(prevFavorites => [data as any, ...prevFavorites]);
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        loading,
        isFavorite,
        toggleFavorite,
        refreshFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
