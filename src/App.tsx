import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';

// Contexts
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';

// Components
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { PrototypePage } from './components/PrototypePage';

// Pages
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Collections from './pages/Collections';
import SearchPage from './pages/SearchPage';
import BrandGuidelines from './pages/BrandGuidelines';
import Bundles from './pages/Bundles';
import BundleDetail from './pages/BundleDetail';
import Login from './pages/Login';
import Cart from './pages/Cart';
import WishlistPage from './pages/WishlistPage';
import LoyaltyDashboard from './pages/LoyaltyDashboard';
import ExclusiveDeals from './pages/ExclusiveDeals';
import B2BPortal from './pages/B2BPortal';
import Designers from './pages/Designers';
import OrderSuccess from './pages/OrderSuccess';
import OrderHistory from './pages/OrderHistory';
import BespokePortal from './pages/BespokePortal';
import Support from './pages/Support';
import About from './pages/About';
import RoomVisualizer from './pages/RoomVisualizer';
import NotFound from './pages/NotFound';

function AppContent() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-brand-alabaster font-sans text-brand-onyx selection:bg-brand-copper/30">
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/brand" element={<BrandGuidelines />} />
          <Route path="/bundles" element={<Bundles />} />
          <Route path="/bundles/:id" element={<BundleDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/about" element={<About />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/loyalty" element={<LoyaltyDashboard />} />
          <Route path="/deals" element={<ExclusiveDeals />} />
          <Route path="/b2b" element={<B2BPortal />} />
          <Route path="/designers" element={<Designers />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/bespoke" element={<BespokePortal />} />
          <Route path="/room-visualizer" element={<RoomVisualizer />} />
          
          {/* Prototype Pages */}
          <Route path="/shipping" element={<Support />} />
          <Route path="/returns" element={<Support />} />
          <Route path="/faq" element={<Support />} />
          <Route path="/contact" element={<Support />} />
          <Route path="/support" element={<Support />} />
          <Route path="/privacy" element={<PrototypePage title="Privacy Policy" description="How we protect your artisanal legacy." />} />
          <Route path="/terms" element={<PrototypePage title="Terms of Service" description="The standards of the KASADA ecosystem." />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <AppContent />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}
