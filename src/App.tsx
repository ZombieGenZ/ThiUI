import { useState, useEffect } from 'react';
import AOS from 'aos';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { LoadingScreen } from './components/LoadingScreen';
import { Footer } from './components/Footer';
import { CartSidebar } from './components/CartSidebar';
import { AuthModal } from './components/AuthModal';
import { HomePage } from './pages/HomePage';
import { BedroomPage } from './pages/BedroomPage';
import { DiningPage } from './pages/DiningPage';
import { OfficePage } from './pages/OfficePage';
import { OutdoorPage } from './pages/OutdoorPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { AboutPage } from './pages/AboutPage';
import { ProductsPage } from './pages/ProductsPage';
import { ContactPage } from './pages/ContactPage';
import { SalePage } from './pages/SalePage';
import { Header } from './components/Header';

function App() {
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const handleLoadComplete = () => {
    setLoading(false);
    AOS.init({
      duration: 400,
      easing: 'ease-out',
      once: true,
      offset: 20,
      delay: 0,
      disable: false,
    });
  };

  useEffect(() => {
    if (cartOpen || authOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [cartOpen, authOpen]);

  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          {loading && <LoadingScreen onLoadComplete={handleLoadComplete} />}

          {!loading && (
            <>
              <div className="min-h-screen flex flex-col transition-opacity duration-300">
                <Header onCartOpen={() => setCartOpen(true)} onAuthOpen={() => setAuthOpen(true)} />
                <main className="flex-1 pt-20 transition-all duration-300">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/shop/bedroom" element={<BedroomPage />} />
                    <Route path="/shop/dining" element={<DiningPage />} />
                    <Route path="/shop/office" element={<OfficePage />} />
                    <Route path="/shop/outdoor" element={<OutdoorPage />} />
                    <Route path="/product/:slug" element={<ProductDetailPage />} />
                    <Route path="/sale" element={<SalePage />} />
                  </Routes>
                </main>
                <Footer />
              </div>

              <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
              <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
            </>
          )}
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;