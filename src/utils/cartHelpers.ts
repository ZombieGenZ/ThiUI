import { toast } from 'react-toastify';
import type { Language } from '../contexts/LanguageContext';

type TranslateFn = (
  values: Partial<Record<Language, string>> | null | undefined,
  fallback?: string
) => string;

interface CartHandlerOptions {
  navigate?: (path: string) => void;
  translate?: TranslateFn;
  signInPath?: string;
}

export const createAddToCartHandler = (
  addToCart: (productId: string, quantity: number) => Promise<void>,
  user?: any,
  navigate?: (path: string) => void,
  options: CartHandlerOptions = {}
) => {
  const { translate, signInPath } = options;

  return async (productId: string, productName: string, quantity: number = 1): Promise<boolean> => {
    if (!user) {
      toast.error(
        translate?.({
          en: 'Please sign in to add items to cart',
          vi: 'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng',
        }) ?? 'Please sign in to add items to cart'
      );
      if (navigate) navigate(signInPath ?? '/login');
      return false;
    }

    try {
      await addToCart(productId, quantity);
      toast.success(
        translate?.({
          en: `${productName} added to cart!`,
          vi: `Đã thêm ${productName} vào giỏ hàng!`,
        }) ?? `${productName} added to cart!`
      );
      return true;
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      if (error?.message) {
        toast.error(error.message);
        return false;
      }
      toast.error(
        translate?.({
          en: 'Failed to add item to cart',
          vi: 'Không thể thêm sản phẩm vào giỏ hàng',
        }) ?? 'Failed to add item to cart'
      );
      return false;
    }
  };
};
