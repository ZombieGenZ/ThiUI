import { toast } from 'react-toastify';

export const createAddToCartHandler = (
  addToCart: (productId: string, quantity: number) => Promise<void>,
  user?: any,
  navigate?: (path: string) => void
) => {
  return async (productId: string, productName: string, quantity: number = 1) => {
    if (!user) {
      toast.error('Please sign in to add items to cart');
      if (navigate) navigate('/login');
      return;
    }

    try {
      await addToCart(productId, quantity);
      toast.success(`${productName} added to cart!`);
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      toast.error(error.message || 'Failed to add item to cart');
    }
  };
};
