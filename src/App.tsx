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
import { Header } from './components/Header';

function App() {
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const handleLoadComplete = () => {
    setLoading(false);
    AOS.init({
      duration: 1000,
      easing: 'ease-in-out-cubic',
      once: true,
      offset: 100,
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
                    <Route
                      path="/shop/living-room"
                      element={
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                          <h1 className="text-3xl font-bold capitalize">Living Room</h1>
                          <p>Content for Living Room category.</p>
                        </div>
                      }
                    />
                    <Route
                      path="/shop/bedroom"
                      element={
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                          <h1 className="text-3xl font-bold capitalize">Bedroom</h1>
                          <p>Content for Bedroom category.</p>
                        </div>
                      }
                    />
                    <Route
                      path="/shop/dining"
                      element={
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                          <h1 className="text-3xl font-bold capitalize">Dining</h1>
                          <p>Content for Dining category.</p>
                        </div>
                      }
                    />
                    <Route
                      path="/shop/office"
                      element={
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                          <h1 className="text-3xl font-bold capitalize">Office</h1>
                          <p>Content for Office category.</p>
                        </div>
                      }
                    />
                    <Route
                      path="/shop/outdoor"
                      element={
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                          <h1 className="text-3xl font-bold capitalize">Outdoor</h1>
                          <p>Content for Outdoor category.</p>
                        </div>
                      }
                    />
                    <Route
                      path="/sale"
                      element={
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                          <h1 className="text-3xl font-bold capitalize">Sale</h1>
                          <p>Content for Sale category.</p>
                        </div>
                      }
                    />
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