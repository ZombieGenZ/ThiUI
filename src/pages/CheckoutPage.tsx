import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { CreditCard, MapPin, User, Mail, Phone, Lock, Wallet, Building2, Smartphone, Tag, X } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { payosClient } from '../lib/payos';
import { normalizeImageUrl, DEFAULT_PRODUCT_IMAGE } from '../utils/imageHelpers';

type PaymentMethod = 'credit-card' | 'debit-card' | 'paypal' | 'bank-transfer' | 'cash-on-delivery';

interface Voucher {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_discount_amount: number | null;
  description: string;
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, selectedTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit-card');
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const selectedItems = items.filter(item => item.selected);

  const metadataName = useMemo(() => {
    if (!user) {
      return '';
    }

    const namesToCheck: Array<string | undefined> = [
      typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : undefined,
      typeof user.user_metadata?.name === 'string' ? user.user_metadata.name : undefined,
      typeof user.user_metadata?.display_name === 'string' ? user.user_metadata.display_name : undefined,
      typeof user.user_metadata?.user_name === 'string' ? user.user_metadata.user_name : undefined,
      typeof user.user_metadata?.given_name === 'string'
        ? [user.user_metadata.given_name, user.user_metadata.family_name].filter(Boolean).join(' ')
        : undefined,
    ];

    for (const value of namesToCheck) {
      if (value && value.trim().length > 0) {
        return value.trim();
      }
    }

    return '';
  }, [user]);

  const [formData, setFormData] = useState({
    fullName: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    paypalEmail: '',
    bankName: '',
    accountNumber: '',
  });

  useEffect(() => {
    if (!user) {
      return;
    }

    setFormData(prev => {
      const derivedFullName = prev.fullName || metadataName;
      const derivedCardName = prev.cardName || metadataName || prev.fullName;
      const nextEmail = user.email || prev.email;

      if (
        prev.email === nextEmail &&
        prev.fullName === derivedFullName &&
        prev.cardName === derivedCardName
      ) {
        return prev;
      }

      return {
        ...prev,
        email: nextEmail,
        fullName: derivedFullName,
        cardName: derivedCardName,
      };
    });
  }, [metadataName, user]);

  const loadUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
        return;
      }

      setFormData(prev => ({
        ...prev,
        fullName: data?.full_name || prev.fullName,
        phone: data?.phone || prev.phone,
        cardName: prev.cardName || data?.full_name || prev.fullName,
      }));
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedItems.length === 0) {
      toast.error('Please select items to checkout');
      return;
    }

    const baseFields = ['fullName', 'email', 'phone', 'address', 'city', 'state', 'zipCode'];

    let paymentFields: string[] = [];
    if (paymentMethod === 'credit-card' || paymentMethod === 'debit-card') {
      paymentFields = ['cardNumber', 'cardName', 'expiryDate', 'cvv'];
    } else if (paymentMethod === 'paypal') {
      paymentFields = ['paypalEmail'];
    } else if (paymentMethod === 'bank-transfer') {
      paymentFields = [];
    }

    const requiredFields = [...baseFields, ...paymentFields];
    const emptyFields = requiredFields.filter((field) => !formData[field as keyof typeof formData]);

    if (emptyFields.length > 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      if (!user) {
        toast.error('Please sign in to place an order');
        return;
      }

      const shippingAddress = {
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
      };

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: finalTotal,
          shipping_cost: shippingCost,
          tax: tax,
          discount: voucherDiscount,
          subtotal: selectedTotal,
          status: 'pending',
          payment_method: paymentMethod,
          payment_status: 'pending',
          shipping_address: shippingAddress,
          voucher_id: appliedVoucher?.id || null,
          voucher_discount: voucherDiscount,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      if (appliedVoucher) {
        await supabase.from('voucher_usage').insert({
          voucher_id: appliedVoucher.id,
          user_id: user.id,
          order_id: order.id,
          discount_amount: voucherDiscount,
        });

        await supabase
          .from('vouchers')
          .update({ usage_count: appliedVoucher.usage_count + 1 })
          .eq('id', appliedVoucher.id);
      }

      const orderItems = selectedItems.map(item => {
        const unitPrice = item.product?.sale_price || item.product?.base_price || 0;
        return {
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: unitPrice,
          price: unitPrice,
          subtotal: unitPrice * item.quantity,
        };
      });

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      if (paymentMethod === 'bank-transfer') {
        try {
          // Generate numeric order code (timestamp + random)
          const numericOrderCode = Math.floor(Date.now() / 1000) * 1000 + Math.floor(Math.random() * 1000);
          
          console.log('Creating PayOS payment link with:', {
            orderCode: numericOrderCode,
            orderNumber: order.order_number,
            amount: finalTotal * 23000,
            orderId: order.id
          });

          const paymentLink = await payosClient.createPaymentLink({
            orderCode: numericOrderCode,
            amount: Math.round(finalTotal * 23000),
            description: `Order ${order.order_number}`,
            returnUrl: `${window.location.origin}/orders?payment=success&order_id=${order.id}`,
            cancelUrl: `${window.location.origin}/checkout?payment=cancelled`,
          });

          console.log('PayOS response:', paymentLink);

          if (!paymentLink || !paymentLink.checkoutUrl) {
            console.error('Invalid PayOS response - missing checkoutUrl');
            toast.error('Payment gateway is temporarily unavailable. Please try another payment method.');
            setLoading(false);
            return;
          }

          // Update order with PayOS order code
          await supabase
            .from('orders')
            .update({ 
              payos_order_code: numericOrderCode 
            })
            .eq('id', order.id);

          localStorage.setItem('pending_payment', JSON.stringify({
            orderId: order.id,
            orderNumber: order.order_number,
            payosOrderCode: numericOrderCode,
            checkoutUrl: paymentLink.checkoutUrl,
          }));

          toast.info('Redirecting to PayOS payment gateway...');
          
          setTimeout(() => {
            window.location.href = paymentLink.checkoutUrl;
          }, 500);
          
          return;
        } catch (error: any) {
          console.error('PayOS error details:', {
            message: error?.message,
            response: error?.response,
            data: error?.response?.data,
            error
          });
          
          toast.error('Payment gateway error. Please try another payment method.');
          setLoading(false);
          return;
        }
      }

      await clearCart();

      toast.success('Order placed successfully! Thank you for your purchase.');

      setTimeout(() => {
        navigate('/orders');
      }, 2000);
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const shippingCost = selectedTotal > 500 ? 0 : 50;
  const tax = selectedTotal * 0.1;
  const voucherDiscount = calculateVoucherDiscount();
  const finalTotal = selectedTotal + shippingCost + tax - voucherDiscount;

  function calculateVoucherDiscount(): number {
    if (!appliedVoucher) return 0;

    if (appliedVoucher.discount_type === 'percentage') {
      const discount = (selectedTotal * appliedVoucher.discount_value) / 100;
      if (appliedVoucher.max_discount_amount) {
        return Math.min(discount, appliedVoucher.max_discount_amount);
      }
      return discount;
    } else {
      return appliedVoucher.discount_value;
    }
  }

  const applyVoucher = async () => {
    if (!voucherCode.trim()) {
      toast.error('Please enter a voucher code');
      return;
    }

    setVoucherLoading(true);

    try {
      const { data: voucher, error } = await supabase
        .from('vouchers')
        .select('*')
        .eq('code', voucherCode.toUpperCase())
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;

      if (!voucher) {
        toast.error('Invalid voucher code');
        return;
      }

      if (voucher.valid_until && new Date(voucher.valid_until) < new Date()) {
        toast.error('This voucher has expired');
        return;
      }

      if (voucher.min_order_amount > selectedTotal) {
        toast.error(`Minimum order amount of $${voucher.min_order_amount} required`);
        return;
      }

      if (voucher.usage_limit && voucher.usage_count >= voucher.usage_limit) {
        toast.error('This voucher has reached its usage limit');
        return;
      }

      setAppliedVoucher(voucher);
      toast.success(`Voucher applied! ${voucher.description}`);
    } catch (error) {
      console.error('Error applying voucher:', error);
      toast.error('Failed to apply voucher');
    } finally {
      setVoucherLoading(false);
    }
  };

  const removeVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode('');
    toast.info('Voucher removed');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Sign In Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to continue with checkout</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-brand-600 text-white px-6 py-3 rounded-lg hover:bg-brand-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (selectedItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">No items selected</h2>
          <p className="text-gray-600 mb-6">Please select items from your cart to checkout</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-brand-600 text-white px-6 py-3 rounded-lg hover:bg-brand-700 transition-colors"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-display font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <User className="w-5 h-5 text-brand-600" />
                  <h2 className="text-xl font-semibold">Contact Information</h2>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <MapPin className="w-5 h-5 text-brand-600" />
                  <h2 className="text-xl font-semibold">Shipping Address</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State *
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ZIP Code *
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <CreditCard className="w-5 h-5 text-brand-600" />
                  <h2 className="text-xl font-semibold">Payment Method</h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('credit-card')}
                    className={`p-4 border-2 rounded-lg flex flex-col items-center space-y-2 transition-all ${
                      paymentMethod === 'credit-card'
                        ? 'border-brand-600 bg-brand-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <CreditCard className="w-6 h-6" />
                    <span className="text-sm font-medium">Credit Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('debit-card')}
                    className={`p-4 border-2 rounded-lg flex flex-col items-center space-y-2 transition-all ${
                      paymentMethod === 'debit-card'
                        ? 'border-brand-600 bg-brand-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <CreditCard className="w-6 h-6" />
                    <span className="text-sm font-medium">Debit Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('paypal')}
                    className={`p-4 border-2 rounded-lg flex flex-col items-center space-y-2 transition-all ${
                      paymentMethod === 'paypal'
                        ? 'border-brand-600 bg-brand-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Wallet className="w-6 h-6" />
                    <span className="text-sm font-medium">PayPal</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bank-transfer')}
                    className={`p-4 border-2 rounded-lg flex flex-col items-center space-y-2 transition-all ${
                      paymentMethod === 'bank-transfer'
                        ? 'border-brand-600 bg-brand-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Building2 className="w-6 h-6" />
                    <span className="text-sm font-medium">Bank Transfer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash-on-delivery')}
                    className={`p-4 border-2 rounded-lg flex flex-col items-center space-y-2 transition-all ${
                      paymentMethod === 'cash-on-delivery'
                        ? 'border-brand-600 bg-brand-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Smartphone className="w-6 h-6" />
                    <span className="text-sm font-medium">Cash on Delivery</span>
                  </button>
                </div>

                {(paymentMethod === 'credit-card' || paymentMethod === 'debit-card') && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Card Number *
                      </label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cardholder Name *
                      </label>
                      <input
                        type="text"
                        name="cardName"
                        value={formData.cardName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expiry Date *
                        </label>
                        <input
                          type="text"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleInputChange}
                          placeholder="MM/YY"
                          maxLength={5}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">CVV *</label>
                        <input
                          type="text"
                          name="cvv"
                          value={formData.cvv}
                          onChange={handleInputChange}
                          placeholder="123"
                          maxLength={4}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'paypal' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PayPal Email *
                    </label>
                    <input
                      type="email"
                      name="paypalEmail"
                      value={formData.paypalEmail}
                      onChange={handleInputChange}
                      placeholder="your.email@example.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                      required
                    />
                  </div>
                )}

                {paymentMethod === 'bank-transfer' && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800 font-medium mb-2">PayOS Payment Gateway</p>
                    <p className="text-sm text-blue-700">
                      You will be redirected to PayOS secure payment page to complete your bank transfer payment.
                      All major Vietnamese banks are supported.
                    </p>
                  </div>
                )}

                {paymentMethod === 'cash-on-delivery' && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-800">
                      You will pay in cash when your order is delivered. Please have the exact amount ready.
                    </p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-600 text-white py-4 rounded-lg hover:bg-brand-700 transition-colors font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : `Place Order - $${finalTotal.toFixed(2)}`}
              </button>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                {selectedItems.map((item) => (
                  <div key={item.id} className="flex space-x-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={normalizeImageUrl(item.product?.images?.[0], DEFAULT_PRODUCT_IMAGE)}
                        alt={item.product?.name || 'Product image'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm line-clamp-2">{item.product?.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-sm font-medium">
                      ${((item.product?.sale_price || item.product?.base_price || 0) * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-4">
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Tag className="w-4 h-4 text-brand-600" />
                    <span className="text-sm font-medium">Have a voucher?</span>
                  </div>

                  {appliedVoucher ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-green-800">{appliedVoucher.code}</p>
                          <p className="text-xs text-green-600">{appliedVoucher.description}</p>
                        </div>
                        <button
                          onClick={removeVoucher}
                          className="text-green-600 hover:text-green-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                        placeholder="Enter voucher code"
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                      <button
                        type="button"
                        onClick={applyVoucher}
                        disabled={voucherLoading}
                        className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50"
                      >
                        {voucherLoading ? 'Checking...' : 'Apply'}
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${selectedTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>
                  {voucherDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Voucher Discount</span>
                      <span className="font-medium text-green-600">-${voucherDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>${finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {selectedTotal > 500 && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800 font-medium">
                    You got free shipping!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
