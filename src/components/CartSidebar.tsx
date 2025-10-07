import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { items, total, loading, updateQuantity, removeFromCart } = useCart();
  const { user } = useAuth();

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={onClose}
      />

      <div className="fixed right-0 top-0 h-full w-full sm:w-[400px] bg-white z-50 shadow-2xl transform transition-transform duration-300 flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Shopping Cart ({items.length})</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
           
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
              <p className="text-gray-600 mb-6">Start adding items to your cart</p>
              <button
                onClick={onClose}
                className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
               
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex space-x-4 pb-4 border-b">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={item.product?.images[0] || ''}
                      alt={item.product?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium mb-1 line-clamp-2">
                      {item.product?.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      ${(item.product?.sale_price || item.product?.base_price || 0).toFixed(2)}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                         
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                         
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-sm text-red-600 hover:underline"
                       
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t p-6 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">${total.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Shipping</span>
              <span className="font-medium">Calculated at checkout</span>
            </div>
            <div className="flex items-center justify-between text-lg font-semibold pt-4 border-t">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <button
              className="w-full bg-black text-white py-4 rounded-lg hover:bg-gray-800 transition-colors font-semibold"
             
            >
              Proceed to Checkout
            </button>

            <button
              onClick={onClose}
              className="w-full border border-gray-300 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
             
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
