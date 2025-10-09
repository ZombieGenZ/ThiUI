import { useState, useEffect, lazy, Suspense } from 'react';
import AOS from 'aos';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { LoadingScreen } from './components/LoadingScreen';
import { Footer } from './components/Footer';
import { CartSidebar } from './components/CartSidebar';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';

const BedroomPage = lazy(() => import('./pages/BedroomPage').then(m => ({ default: m.BedroomPage })));
const LivingRoomPage = lazy(() => import('./pages/LivingRoomPage').then(m => ({ default: m.LivingRoomPage })));
const DiningPage = lazy(() => import('./pages/DiningPage').then(m => ({ default: m.DiningPage })));
const OfficePage = lazy(() => import('./pages/OfficePage').then(m => ({ default: m.OfficePage })));
const OutdoorPage = lazy(() => import('./pages/OutdoorPage').then(m => ({ default: m.OutdoorPage })));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage').then(m => ({ default: m.ProductDetailPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const ProductsPage = lazy(() => import('./pages/ProductsPage').then(m => ({ default: m.ProductsPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })));
const SalePage = lazy(() => import('./pages/SalePage').then(m => ({ default: m.SalePage })));
const BestSellersPage = lazy(() => import('./pages/BestSellersPage').then(m => ({ default: m.BestSellersPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage').then(m => ({ default: m.FavoritesPage })));
const OrdersPage = lazy(() => import('./pages/OrdersPage').then(m => ({ default: m.OrdersPage })));
const PaymentInstructionsPage = lazy(() => import('./pages/PaymentInstructionsPage').then(m => ({ default: m.PaymentInstructionsPage })));

function App() {
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      offset: 100,
      delay: 100,
      disable: 'mobile',
      mirror: false,
      anchorPlacement: 'top-bottom',
    });

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      AOS.init({ disable: true });
    }
  }, []);

  const handleLoadComplete = () => {
    setLoading(false);
  };

  useEffect(() => {
    if (cartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [cartOpen]);

  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <FavoritesProvider>
            <Router>
              {loading && <LoadingScreen onLoadComplete={handleLoadComplete} />}

              {!loading && <AppContent cartOpen={cartOpen} setCartOpen={setCartOpen} />}
              <ToastContainer
                position="top-right"
                autoClose={3500}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                style={{ zIndex: 9999 }}
                toastClassName="bg-white rounded-xl shadow-strong border border-neutral-200"
                bodyClassName="text-sm font-medium text-neutral-900"
                progressClassName="bg-gradient-to-r from-brand-600 to-brand-700"
              />
            </Router>
          </FavoritesProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

function AppContent({ cartOpen, setCartOpen }: { cartOpen: boolean; setCartOpen: (open: boolean) => void }) {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    AOS.refresh();
  }, [location.pathname]);

  return (
    <>
      <div className="min-h-screen flex flex-col transition-colors duration-300 bg-white">
        <Header onCartOpen={() => setCartOpen(true)} />
        <main className="flex-1 pt-20 transition-all duration-300">
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-600"></div>
            </div>
          }>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/shop/living" element={<LivingRoomPage />} />
              <Route path="/shop/bedroom" element={<BedroomPage />} />
              <Route path="/shop/dining" element={<DiningPage />} />
              <Route path="/shop/office" element={<OfficePage />} />
              <Route path="/shop/outdoor" element={<OutdoorPage />} />
              <Route path="/product/:slug" element={<ProductDetailPage />} />
              <Route path="/sale" element={<SalePage />} />
              <Route path="/best-sellers" element={<BestSellersPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/payment-instructions/:orderId" element={<PaymentInstructionsPage />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>

      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}

export default App;