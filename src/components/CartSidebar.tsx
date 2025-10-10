import { X, Plus, Minus, ShoppingBag, CheckSquare, Square } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { getLocalizedValue } from '../utils/i18n';
import { normalizeImageUrl, DEFAULT_PRODUCT_IMAGE } from '../utils/imageHelpers';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const navigate = useNavigate();
  const { items, selectedTotal, loading, updateQuantity, removeFromCart, toggleItemSelection, selectAll, deselectAll } = useCart();
  const { language, translate } = useLanguage();
  const { formatPrice } = useCurrency();
  const allSelected = items.length > 0 && items.every(item => item.selected);
  const selectedCount = items.filter(item => item.selected).length;
  const selectedLabel = language === 'vi' ? `${selectedCount} đã chọn` : `${selectedCount} selected`;
  const subtotalLabel = language === 'vi'
    ? `Tạm tính (${selectedCount} sản phẩm)`
    : `Subtotal (${selectedCount} items)`;
  const checkoutLabel = language === 'vi'
    ? `Tiến hành thanh toán (${selectedCount} sản phẩm)`
    : `Proceed to Checkout (${selectedCount} items)`;

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 z-50 transition-opacity backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      <div className="fixed right-0 top-0 h-full w-full sm:w-[400px] bg-white z-50 shadow-2xl transform transition-all duration-400 flex flex-col animate-slide-in-right will-change-transform">
        <div className="p-6 border-b space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {translate({ en: 'Shopping Cart', vi: 'Giỏ hàng' })} ({items.length})
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full smooth-transition hover-scale active:scale-90 ripple-effect"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {items.length > 0 && (
            <div className="flex items-center justify-between">
              <button
                onClick={allSelected ? deselectAll : selectAll}
                className="flex items-center space-x-2 text-sm font-medium text-brand-600 hover:text-brand-700 smooth-transition"
              >
                {allSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                <span>
                  {allSelected
                    ? translate({ en: 'Deselect All', vi: 'Bỏ chọn tất cả' })
                    : translate({ en: 'Select All', vi: 'Chọn tất cả' })}
                </span>
              </button>
              <span className="text-sm text-gray-600">{selectedLabel}</span>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {translate({ en: 'Your cart is empty', vi: 'Giỏ hàng của bạn trống' })}
              </h3>
              <p className="text-gray-600 mb-6">
                {translate({ en: 'Start adding items to your cart', vi: 'Hãy thêm sản phẩm vào giỏ hàng' })}
              </p>
              <button
                onClick={onClose}
                className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                {translate({ en: 'Continue Shopping', vi: 'Tiếp tục mua sắm' })}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex space-x-3 pb-4 border-b">
                  <button
                    onClick={() => toggleItemSelection(item.id)}
                    className="flex-shrink-0 mt-1"
                  >
                    {item.selected ? (
                      <CheckSquare className="w-5 h-5 text-brand-600" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={normalizeImageUrl(item.product?.images?.[0], DEFAULT_PRODUCT_IMAGE)}
                      alt={item.product?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium mb-1 line-clamp-2">
                      {getLocalizedValue(item.product?.name_i18n ?? null, language, item.product?.name ?? '')}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {formatPrice(item.product?.sale_price || item.product?.base_price || 0, language)}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors hover:scale-110 active:scale-95"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors hover:scale-110 active:scale-95"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-sm text-red-600 hover:underline"
                      >
                        {translate({ en: 'Remove', vi: 'Xóa' })}
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
              <span className="text-gray-600">{subtotalLabel}</span>
              <span className="font-medium">{formatPrice(selectedTotal, language)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{translate({ en: 'Shipping', vi: 'Vận chuyển' })}</span>
              <span className="font-medium">
                {translate({ en: 'Calculated at checkout', vi: 'Tính tại bước thanh toán' })}
              </span>
            </div>
            <div className="flex items-center justify-between text-lg font-semibold pt-4 border-t">
              <span>{translate({ en: 'Total', vi: 'Tổng cộng' })}</span>
              <span>{formatPrice(selectedTotal, language)}</span>
            </div>

            <button
              onClick={() => {
                if (selectedCount === 0) return;
                onClose();
                navigate('/checkout');
              }}
              disabled={selectedCount === 0}
              className="w-full bg-black text-white py-4 rounded-lg hover:bg-gray-800 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {checkoutLabel}
            </button>

            <button
              onClick={onClose}
              className="w-full border border-gray-300 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              {translate({ en: 'Continue Shopping', vi: 'Tiếp tục mua sắm' })}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
