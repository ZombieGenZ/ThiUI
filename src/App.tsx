import { useState, useEffect } from 'react';
import AOS from 'aos';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { LoadingScreen } from './components/LoadingScreen';
import { CustomCursor } from './components/CustomCursor';
import { Footer } from './components/Footer';
import { CartSidebar } from './components/CartSidebar';
import { AuthModal } from './components/AuthModal';
import { HomePage } from './pages/HomePage';
import { BedroomPage } from './pages/BedroomPage';
import { DiningPage } from './pages/DiningPage';
import { OfficePage } from './pages/OfficePage';
import { OutdoorPage } from './pages/OutdoorPage';
import { SalePage } from './pages/SalePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { Header } from './components/Header';

function App() {
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const handleLoadComplete = () => {
    setLoading(false);
    AOS.init({
      duration: 600,
      easing: 'ease-out-cubic',
      once: true,
      offset: 50,
      delay: 0,
      disable: 'mobile',
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
              <CustomCursor />
              <div className="min-h-screen flex flex-col">
                <Header onCartOpen={() => setCartOpen(true)} onAuthOpen={() => setAuthOpen(true)} />
                <main className="flex-1 pt-20">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/shop/bedroom" element={<BedroomPage />} />
                    <Route path="/shop/dining" element={<DiningPage />} />
                    <Route path="/shop/office" element={<OfficePage />} />
                    <Route path="/shop/outdoor" element={<OutdoorPage />} />
                    <Route path="/sale" element={<SalePage />} />
                    <Route path="/product/:slug" element={<ProductDetailPage />} />
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