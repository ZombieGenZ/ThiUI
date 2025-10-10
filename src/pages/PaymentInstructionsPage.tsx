import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Copy, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useCurrency } from '../contexts/CurrencyContext';

interface PaymentInfo {
  bankName: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  content: string;
}

export function PaymentInstructionsPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { clearCart } = useCart();
  const { language } = useLanguage();
  const { formatPrice, convertAmount, currency } = useCurrency();
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    loadPaymentInfo();
  }, [orderId]);

  const loadPaymentInfo = async () => {
    try {
      const stored = localStorage.getItem('pending_payment');
      if (stored) {
        const data = JSON.parse(stored);
        if (data.orderId === orderId) {
          setPaymentInfo(data.paymentInfo);
        }
      }

      if (!user || !orderId) {
        navigate('/');
        return;
      }

      const { data: order, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error || !order) {
        toast.error('Order not found');
        navigate('/orders');
        return;
      }

      if (order.payment_status !== 'pending') {
        navigate('/orders');
        return;
      }
    } catch (error) {
      console.error('Error loading payment info:', error);
      toast.error('Failed to load payment information');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const handleConfirmPayment = async () => {
    if (!orderId || !user) return;

    setConfirming(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          payment_status: 'processing',
          status: 'processing',
        })
        .eq('id', orderId);

      if (error) throw error;

      localStorage.removeItem('pending_payment');
      await clearCart();

      toast.success('Payment confirmation received! We will verify your payment shortly.');

      setTimeout(() => {
        navigate('/orders');
      }, 2000);
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast.error('Failed to confirm payment');
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment information...</p>
        </div>
      </div>
    );
  }

  if (!paymentInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Payment Information Not Found</h2>
          <button
            onClick={() => navigate('/orders')}
            className="mt-4 bg-brand-600 text-white px-6 py-2 rounded-lg hover:bg-brand-700 transition-colors"
          >
            View Orders
          </button>
        </div>
      </div>
    );
  }

  const amountInSelectedCurrency = convertAmount(paymentInfo.amount, 'USD');
  const formattedAmount = formatPrice(paymentInfo.amount, language, 'USD');
  const amountCopyValue =
    currency === 'USD'
      ? amountInSelectedCurrency.toFixed(2)
      : Math.round(amountInSelectedCurrency).toString();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Orders
        </button>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Complete Your Payment</h1>
            <p className="text-gray-600">
              Please transfer the exact amount to the bank account below
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 font-medium">Bank Name</span>
                <button
                  onClick={() => copyToClipboard(paymentInfo.bankName, 'Bank name')}
                  className="text-brand-600 hover:text-brand-700"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-lg font-semibold">{paymentInfo.bankName}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 font-medium">Account Number</span>
                <button
                  onClick={() => copyToClipboard(paymentInfo.accountNumber, 'Account number')}
                  className="text-brand-600 hover:text-brand-700"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-lg font-semibold font-mono">{paymentInfo.accountNumber}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 font-medium">Account Name</span>
                <button
                  onClick={() => copyToClipboard(paymentInfo.accountName, 'Account name')}
                  className="text-brand-600 hover:text-brand-700"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-lg font-semibold">{paymentInfo.accountName}</p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-blue-800 font-medium">
                  {language === 'vi' ? 'Số tiền chuyển' : 'Transfer Amount'} ({currency})
                </span>
                <button
                  onClick={() => copyToClipboard(amountCopyValue, language === 'vi' ? 'Số tiền' : 'Amount')}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-2xl font-bold text-blue-900">{formattedAmount}</p>
            </div>

            <div className="bg-amber-50 p-4 rounded-lg border-2 border-amber-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-amber-800 font-medium">Transfer Content (Important!)</span>
                <button
                  onClick={() => copyToClipboard(paymentInfo.content, 'Transfer content')}
                  className="text-amber-600 hover:text-amber-700"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-lg font-bold text-amber-900 font-mono">{paymentInfo.content}</p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-yellow-900 mb-2 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              Important Instructions
            </h3>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>1. Transfer the EXACT amount shown above</li>
              <li>2. Include the transfer content exactly as shown</li>
              <li>3. Your order will be processed after payment verification</li>
              <li>4. Verification usually takes 5-15 minutes</li>
            </ul>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleConfirmPayment}
              disabled={confirming}
              className="w-full bg-brand-600 text-white py-3 rounded-lg hover:bg-brand-700 transition-colors font-semibold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              {confirming ? 'Processing...' : 'I Have Made the Transfer'}
            </button>

            <button
              onClick={() => navigate('/orders')}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
            >
              I'll Pay Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
