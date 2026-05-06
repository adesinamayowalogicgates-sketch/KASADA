import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, 
  Search, 
  Menu, 
  X, 
  Heart, 
  User as UserIcon,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { cn } from '../lib/utils';

export const Navbar: React.FC = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user } = useAuth();
    const { cart } = useCart();
    const { wishlists } = useWishlist();
    const location = useLocation();
  
    useEffect(() => {
      const handleScroll = () => setIsScrolled(window.scrollY > 50);
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }, []);
  
    useEffect(() => setIsMobileMenuOpen(false), [location]);
  
    useEffect(() => {
      if (isMobileMenuOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'unset';
      }
      return () => {
        document.body.style.overflow = 'unset';
      };
    }, [isMobileMenuOpen]);

    const wishlistItemCount = wishlists.reduce((acc, list) => acc + list.itemIds.length, 0);
  
    const navLinks = [
      { name: 'Collections', path: '/collections' },
      { name: 'Bundles', path: '/bundles' },
      { name: '3D Reality', path: '/room-visualizer' },
      { name: 'B2B', path: '/b2b' },
      { name: 'Designers', path: '/designers' },
      { name: 'About', path: '/about' },
    ];
  
    return (
      <nav className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-700 px-6 py-4 sm:py-6",
        isScrolled ? "bg-brand-alabaster/80 backdrop-blur-xl shadow-sm py-4" : "bg-transparent"
      )}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-12">
            <Link to="/" className="text-2xl sm:text-3xl font-serif font-black tracking-tighter text-brand-onyx group">
              KASADA<span className="text-brand-copper group-hover:text-brand-onyx transition-colors">.</span>
            </Link>
            
            <div className="hidden lg:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link 
                  key={link.path}
                  to={link.path}
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-onyx/60 hover:text-brand-copper transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-4 sm:space-x-8">
            <Link to="/search" className="text-brand-onyx/60 hover:text-brand-onyx transition-colors">
              <Search size={20} />
            </Link>
            
            <Link to="/wishlist" className="relative group text-brand-onyx/60 hover:text-brand-onyx transition-colors">
              <Heart size={20} className={cn(wishlistItemCount > 0 && "fill-brand-copper text-brand-copper")} />
              {wishlistItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-onyx text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistItemCount}
                </span>
              )}
            </Link>
  
            <Link to="/cart" className="relative group text-brand-onyx/60 hover:text-brand-onyx transition-colors">
              <ShoppingBag size={20} />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-copper text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </Link>
  
            <Link 
              to={user ? "/loyalty" : "/login"} 
              className={cn(
                "hidden sm:flex items-center space-x-3 px-6 py-2.5 rounded-full border transition-all duration-500 active:scale-95",
                isScrolled ? "border-brand-onyx/10 bg-brand-onyx text-white" : "border-brand-onyx/20 text-brand-onyx hover:bg-brand-onyx hover:text-white"
              )}
            >
              <UserIcon size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                {user ? (user.displayName?.split(' ')[0] || 'Account') : 'Sign In'}
              </span>
              {user && <Sparkles size={12} className="text-brand-copper ml-2" />}
            </Link>
  
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-brand-onyx"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
  
        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-0 bg-white z-[100] p-8 flex flex-col overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-16">
                <span className="text-xl font-serif font-black tracking-tighter">KASADA.</span>
                <button onClick={() => setIsMobileMenuOpen(false)}><X size={32} /></button>
              </div>
              
              <div className="space-y-8 flex-grow">
                {navLinks.map((link) => (
                  <Link 
                    key={link.path}
                    to={link.path}
                    className="block text-4xl font-serif font-bold text-brand-onyx active:scale-95 origin-left transition-transform"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
  
              <div className="pt-8 border-t border-brand-onyx/10 space-y-6">
                <Link to={user ? "/loyalty" : "/login"} className="flex items-center space-x-4 text-xl font-bold">
                  <UserIcon size={24} />
                  <span>{user ? 'My Account' : 'Sign In'}</span>
                </Link>
                <div className="flex space-x-6 text-brand-slate">
                  <Heart size={24} />
                  <Search size={24} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    );
  };
