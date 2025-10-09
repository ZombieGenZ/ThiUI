import { useState, useEffect } from 'react';
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
import { HomePage } from './pages/HomePage';
import { BedroomPage } from './pages/BedroomPage';
import { LivingRoomPage } from './pages/LivingRoomPage';
import { DiningPage } from './pages/DiningPage';
import { OfficePage } from './pages/OfficePage';
import { OutdoorPage } from './pages/OutdoorPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { AboutPage } from './pages/AboutPage';
import { ProductsPage } from './pages/ProductsPage';
import { ContactPage } from './pages/ContactPage';
import { SalePage } from './pages/SalePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { ProfilePage } from './pages/ProfilePage';
import { FavoritesPage } from './pages/FavoritesPage';
import { OrdersPage } from './pages/OrdersPage';
import { Header } from './components/Header';

function App() {
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    AOS.init({
      duration: 600,
      easing: 'ease-out-cubic',
      once: true,
      offset: 50,
      delay: 50,
      disable: false,
      mirror: false,
      anchorPlacement: 'top-bottom',
    });
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
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
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
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/favorites" element={<FavoritesPage />} />
                    <Route path="/orders" element={<OrdersPage />} />
          </Routes>
        </main>
        <Footer />
      </div>

      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}

export default App;