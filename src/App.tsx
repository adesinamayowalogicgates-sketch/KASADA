/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import { 
  Search, 
  ShoppingCart, 
  User as UserIcon, 
  Menu, 
  X, 
  ArrowRight, 
  Star, 
  ShieldCheck, 
  Truck, 
  Smartphone,
  Heart,
  ChevronRight,
  Filter,
  ArrowLeft,
  Plus,
  Minus,
  CheckCircle2,
  Box,
  MessageSquare,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Sparkles,
  FileText,
  Clock,
  AlertCircle,
  Trophy,
  Gift,
  Zap,
  History,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { cn } from './lib/utils';
import { CATEGORIES, PRODUCTS, BUNDLES, DESIGNERS } from './constants';
import { Product, Bundle, Designer } from './types';
import { getCompleteTheLook } from './services/geminiService';
import { 
  auth, 
  db, 
  loginWithGoogle, 
  logout, 
  collection, 
  doc, 
  addDoc, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs,
  query, 
  where, 
  or,
  orderBy,
  Timestamp,
  arrayUnion,
  arrayRemove,
  User,
  handleFirestoreError,
  OperationType
} from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

// --- Auth Context ---

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  const logoutAction = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout: logoutAction }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// --- Context ---

interface CartItem {
  productId: string;
  quantity: number;
  assembly: boolean;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (productId: string, quantity: number, assembly: boolean) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  toast: string | null;
  showToast: (message: string) => void;
}

const CartContext = React.createContext<CartContextType | undefined>(undefined);

function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const addToCart = (productId: string, quantity: number, assembly: boolean) => {
    const product = PRODUCTS.find(p => p.id === productId);
    setCart(prev => {
      const existing = prev.find(item => item.productId === productId);
      if (existing) {
        return prev.map(item => 
          item.productId === productId 
            ? { ...item, quantity: item.quantity + quantity, assembly: item.assembly || assembly }
            : item
        );
      }
      return [...prev, { productId, quantity, assembly }];
    });
    
    showToast(`${product?.name} added to bag`);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, toast, showToast }}>
      {children}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-8 left-1/2 z-[100] bg-brand-onyx text-white px-6 py-3 rounded-full shadow-2xl flex items-center space-x-3 border border-white/10"
          >
            <div className="w-2 h-2 rounded-full bg-brand-copper animate-pulse"></div>
            <span className="text-xs font-bold uppercase tracking-widest">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </CartContext.Provider>
  );
}

function useCart() {
  const context = React.useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}

// --- Components ---

function DealsCarousel() {
  const dealProducts = PRODUCTS.slice(0, 4);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % dealProducts.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [dealProducts.length]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 rounded-full border border-white/10 flex items-center justify-center"
      >
        <div className="w-3/4 h-3/4 rounded-full border border-white/20 flex items-center justify-center">
          <div className="w-1/2 h-1/2 rounded-full bg-brand-copper/20 blur-3xl animate-pulse"></div>
        </div>
      </motion.div>
      
      <div className="relative w-4/5 sm:w-2/3 aspect-[4/5] z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -50, scale: 0.9 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <Link to={`/product/${dealProducts[currentIndex].id}`}>
              <img 
                src={dealProducts[currentIndex].images[0]} 
                alt={dealProducts[currentIndex].name} 
                className="w-full h-full object-cover rounded-2xl shadow-2xl"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 left-4 bg-brand-copper text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg">
                SAVE 15%
              </div>
            </Link>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Dots */}
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex space-x-3">
          {dealProducts.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                currentIndex === idx ? "bg-brand-copper w-6" : "bg-white/20"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, login, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { cart } = useCart();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 py-6",
      isScrolled ? "bg-brand-alabaster/90 backdrop-blur-xl py-4 border-b border-brand-onyx/5" : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="text-2xl font-serif font-black tracking-tighter text-brand-onyx">
          KASADA
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-10">
          {['Collections', 'Bundles', 'Designers', 'Bespoke', 'B2B', 'About'].map((item) => (
            <Link 
              key={item} 
              to={`/${item.toLowerCase()}`}
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-onyx/60 hover:text-brand-copper transition-colors"
            >
              {item}
            </Link>
          ))}
        </div>

        <div className="flex items-center space-x-4">
          <Link to="/search" className="p-2 hover:text-brand-copper transition-colors">
            <Search size={18} />
          </Link>
          <Link to="/cart" className="p-2 hover:text-brand-copper transition-colors relative">
            <ShoppingCart size={18} />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-copper text-white text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full">
                {cart.reduce((acc, item) => acc + item.quantity, 0)}
              </span>
            )}
          </Link>
          {user ? (
            <div className="relative">
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="w-10 h-10 rounded-full overflow-hidden border-2 border-brand-onyx/10 hover:border-brand-copper transition-all p-0.5"
              >
                <div className="w-full h-full rounded-full overflow-hidden">
                  <img 
                    src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
                    alt={user.displayName || ''} 
                    className="w-full h-full object-cover" 
                  />
                </div>
              </button>

              <AnimatePresence>
                {isUserMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-[60]" 
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 10 }}
                      className="absolute right-0 mt-4 w-72 bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-brand-onyx/5 z-[70] overflow-hidden origin-top-right"
                    >
                      <div className="p-8 border-b border-brand-onyx/5 bg-brand-alabaster/50">
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-copper mb-3 block">Member</span>
                        <h4 className="font-serif font-bold text-xl text-brand-onyx truncate mb-1">{user.displayName}</h4>
                        <p className="text-[10px] text-brand-onyx/40 truncate font-mono">{user.email}</p>
                      </div>
                      <div className="p-3 space-y-1">
                        {[
                          { to: '/loyalty', icon: Trophy, label: 'Loyalty Rewards' },
                          { to: '/wishlist', icon: Heart, label: 'My Wishlist' },
                          { to: '/orders', icon: Box, label: 'Order History' },
                        ].map((item) => (
                          <Link 
                            key={item.label}
                            to={item.to} 
                            className="flex items-center space-x-3 p-4 rounded-2xl hover:bg-brand-alabaster transition-all group"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <item.icon size={18} className="text-brand-onyx/30 group-hover:text-brand-copper transition-colors" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-brand-onyx/70 group-hover:text-brand-onyx">
                              {item.label}
                            </span>
                          </Link>
                        ))}
                        <button 
                          onClick={() => {
                            logout();
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full flex items-center space-x-3 p-4 rounded-2xl hover:bg-red-50 transition-all group text-red-500"
                        >
                          <LogOut size={18} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link 
              to="/login"
              className="p-2 hover:text-brand-copper transition-colors"
            >
              <UserIcon size={18} />
            </Link>
          )}
          <button 
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
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
            className="fixed inset-0 bg-brand-alabaster z-50 p-12 flex flex-col justify-between"
          >
            <div className="flex justify-between items-center mb-12">
              <span className="text-xl font-serif font-black">KASADA</span>
              <button onClick={() => setIsMobileMenuOpen(false)}><X size={32} /></button>
            </div>
            <div className="flex flex-col space-y-8">
              {['Collections', 'Bundles', 'Search', 'Designers', 'Bespoke', 'B2B', 'About'].map((item) => (
                <Link 
                  key={item} 
                  to={`/${item.toLowerCase()}`}
                  className="text-5xl font-serif font-bold text-brand-onyx"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item}
                </Link>
              ))}
              {user ? (
                <button 
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-5xl font-serif font-bold text-red-500 text-left"
                >
                  Sign Out
                </button>
              ) : (
                <Link 
                  to="/login"
                  className="text-5xl font-serif font-bold text-brand-onyx"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </div>
            <div className="pt-12 border-t border-brand-onyx/10">
              <p className="text-xs uppercase tracking-widest font-bold text-brand-slate mb-4">Contact</p>
              <p className="text-lg font-serif">hello@kasada.ng</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function Hero() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section className="relative h-[110vh] flex items-center justify-center overflow-hidden">
      <motion.div style={{ y: y1 }} className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=2064&auto=format&fit=crop" 
          alt="Luxury Interior" 
          className="w-full h-full object-cover brightness-50"
          referrerPolicy="no-referrer"
        />
      </motion.div>
      
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          style={{ opacity }}
        >
          <motion.span 
            initial={{ opacity: 0, letterSpacing: "0.8em" }}
            animate={{ opacity: 1, letterSpacing: "0.4em" }}
            transition={{ duration: 1.5, delay: 0.2 }}
            className="text-brand-copper uppercase text-[10px] font-black mb-6 block"
          >
            The New Standard of African Living
          </motion.span>
          <h1 className="text-5xl sm:text-7xl md:text-[10rem] text-brand-alabaster font-serif font-black mb-12 leading-[0.85] tracking-tighter text-balance">
            Crafted for <br /> 
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
            >Eternity</motion.span>
          </h1>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link 
              to="/collections" 
              className="group bg-brand-copper text-white px-12 py-5 rounded-full font-bold flex items-center space-x-3 hover:bg-white hover:text-brand-onyx transition-all duration-500"
            >
              <span>Explore Collections</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/room-visualizer"
              className="group bg-white/5 backdrop-blur-xl text-white border border-white/20 px-12 py-5 rounded-full font-bold hover:bg-white/20 transition-all duration-500"
            >
              Room Visualizer
            </Link>
          </motion.div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-12 left-12 hidden lg:block"
      >
        <div className="flex items-center space-x-4 text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">
          <span className="w-12 h-px bg-white/20"></span>
          <span>Scroll to Discover</span>
        </div>
      </motion.div>
    </section>
  );
}

function ProductCard({ product }: ProductCardProps) {
  const [user, setUser] = useState<User | null>(null);
  const { addToCart, showToast } = useCart();

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  const addToWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      loginWithGoogle();
      return;
    }

    try {
      // Find if a wishlist already exists for this user
      const q = query(collection(db, 'wishlists'), where('ownerId', '==', user.uid));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const wishlistDoc = snapshot.docs[0];
        await updateDoc(doc(db, 'wishlists', wishlistDoc.id), {
          itemIds: arrayUnion(product.id)
        });
      } else {
        await addDoc(collection(db, 'wishlists'), {
          name: 'My Wishlist',
          ownerId: user.uid,
          ownerEmail: user.email,
          collaboratorEmails: [user.email],
          itemIds: [product.id],
          createdAt: Timestamp.now()
        });
      }
      showToast(`${product.name} added to wishlist`);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'wishlists');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="group cursor-pointer"
    >
      <Link to={`/product/${product.id}`}>
        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-brand-onyx/5">
          <img 
            src={product.images[0]} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
          
          {/* Badges */}
          <div className="absolute top-6 left-6 flex flex-col gap-2">
            {product.isMadeInNigeria && (
              <div className="bg-brand-alabaster/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm flex items-center space-x-2">
                <span className="text-[8px] font-black uppercase tracking-widest text-brand-onyx">Made in Nigeria</span>
              </div>
            )}
            {product.isEscrowProtected && (
              <div className="bg-green-500/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm flex items-center space-x-2">
                <Lock size={10} className="text-white" />
                <span className="text-[8px] font-black uppercase tracking-widest text-white">Escrow Protected</span>
              </div>
            )}
          </div>

          <div className="absolute inset-0 bg-brand-onyx/20 lg:bg-brand-onyx/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center space-x-4">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addToCart(product.id, 1, false);
              }}
              className="bg-white text-brand-onyx w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-xl"
            >
              <ShoppingCart size={18} />
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="bg-white text-brand-onyx px-6 py-2.5 sm:px-8 sm:py-3 rounded-full font-bold text-[10px] sm:text-xs uppercase tracking-widest shadow-xl"
            >
              Quick View
            </motion.button>
          </div>
          
          <div className="absolute top-6 right-6 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500">
            <button 
              onClick={addToWishlist}
              className="w-12 h-12 bg-brand-alabaster rounded-full flex items-center justify-center text-brand-onyx hover:bg-brand-copper hover:text-white transition-colors shadow-xl"
            >
              <Heart size={20} />
            </button>
          </div>

          {product.seller.isVerified && (
            <div className="absolute bottom-6 left-6 flex items-center space-x-2 bg-brand-alabaster/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm">
              <ShieldCheck size={12} className="text-brand-copper" />
              <span className="text-[8px] font-black uppercase tracking-widest text-brand-onyx">Verified Seller</span>
              {product.seller.tier && (
                <span className="text-[8px] font-black text-brand-copper ml-1">• {product.seller.tier}</span>
              )}
            </div>
          )}
        </div>
        
        <div className="mt-6 flex justify-between items-start">
          <div>
            <h3 className="text-lg font-serif font-bold text-brand-onyx mb-1 group-hover:text-brand-copper transition-colors">{product.name}</h3>
            <p className="text-[10px] uppercase tracking-widest text-brand-slate font-bold">{product.seller.name}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-black text-brand-onyx">₦{product.price.toLocaleString()}</p>
            {product.installmentOptions && (
              <p className="text-[8px] text-brand-copper font-bold uppercase tracking-widest mt-1">From ₦{(product.price / 6).toLocaleString()}/mo</p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

interface BundleCardProps {
  bundle: Bundle;
  key?: string | number;
}

function BundleCard({ bundle }: BundleCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="group cursor-pointer bg-brand-alabaster rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500"
    >
      <Link to={`/bundles/${bundle.id}`}>
        <div className="relative aspect-[16/9] overflow-hidden">
          <img 
            src={bundle.image} 
            alt={bundle.name} 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-6 left-6 bg-brand-copper text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
            Save ₦{(bundle.price - bundle.discountPrice).toLocaleString()}
          </div>
        </div>
        
        <div className="p-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-brand-copper uppercase tracking-[0.2em] text-[8px] font-black mb-2 block">{bundle.category} Bundle</span>
              <h3 className="text-2xl font-serif font-bold text-brand-onyx group-hover:text-brand-copper transition-colors">{bundle.name}</h3>
            </div>
            <div className="text-right">
              <p className="text-xs text-brand-slate line-through mb-1">₦{bundle.price.toLocaleString()}</p>
              <p className="text-xl font-black text-brand-onyx">₦{bundle.discountPrice.toLocaleString()}</p>
            </div>
          </div>
          <p className="text-brand-slate text-sm font-light leading-relaxed mb-8 line-clamp-2">
            {bundle.description}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex -space-x-3">
              {bundle.productIds.slice(0, 3).map((pid, idx) => {
                const p = PRODUCTS.find(prod => prod.id === pid);
                return p ? (
                  <div key={idx} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-brand-onyx/5">
                    <img src={p.images[0]} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                ) : null;
              })}
              {bundle.productIds.length > 3 && (
                <div className="w-10 h-10 rounded-full border-2 border-white bg-brand-onyx/10 flex items-center justify-center text-[10px] font-bold text-brand-onyx">
                  +{bundle.productIds.length - 3}
                </div>
              )}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest flex items-center space-x-2 group-hover:text-brand-copper transition-colors">
              <span>View Bundle</span>
              <ArrowRight size={14} />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
function Home() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Hero />
      
      {/* Bundles Section */}
      <section className="py-20 md:py-32 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-20 gap-8">
          <div>
            <span className="text-brand-copper uppercase tracking-[0.4em] text-[10px] font-black mb-4 block">Curated Sets</span>
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-serif font-bold">Room Bundles</h2>
            <p className="text-brand-slate mt-6 max-w-xl text-lg font-light">
              Expertly curated furniture sets designed to transform your space in one click, at a fraction of the cost.
            </p>
          </div>
          <Link to="/bundles" className="group flex items-center space-x-4 text-[10px] font-black uppercase tracking-[0.2em] hover:text-brand-copper transition-colors">
            <span>Explore All Bundles</span>
            <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {BUNDLES.map((bundle) => (
            <BundleCard key={bundle.id} bundle={bundle} />
          ))}
        </div>
      </section>
      
      {/* Value Prop Section / Deals Carousel */}
      <section className="py-20 md:py-32 px-6 bg-brand-onyx text-brand-alabaster overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div className="relative h-[400px] sm:h-[500px] lg:h-[600px] flex items-center justify-center">
            <DealsCarousel />
          </div>
          
          <div>
            <span className="text-brand-copper uppercase tracking-[0.4em] text-[10px] font-black mb-8 block">Limited Time Offers</span>
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-serif font-bold mb-12 leading-tight">
              Exclusive Deals <br /> on Masterpieces.
            </h2>
            <div className="space-y-10 sm:space-y-12">
              {[
                { title: 'Curated Discounts', desc: 'Handpicked items from our top artisans at exceptional prices.', icon: <Star /> },
                { title: 'Flash Sales', desc: 'New deals added weekly. Don\'t miss out on these limited editions.', icon: <Smartphone /> },
                { title: 'Trade Benefits', desc: 'Extra savings for our B2B partners and interior designers.', icon: <Box /> }
              ].map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.2 }}
                  className="flex items-start space-x-6"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/5 flex items-center justify-center text-brand-copper shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-lg sm:text-xl font-serif font-bold mb-2">{item.title}</h4>
                    <p className="text-white/50 text-sm sm:text-base font-light leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <Link 
              to="/deals"
              className="mt-12 sm:mt-16 inline-flex items-center space-x-4 bg-brand-copper text-white px-8 sm:px-10 py-4 rounded-full font-bold hover:bg-white hover:text-brand-onyx transition-all duration-500"
            >
              <span>View All Deals</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 md:py-32 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-20 gap-8">
          <div>
            <span className="text-brand-copper uppercase tracking-[0.4em] text-[10px] font-black mb-4 block">The Collection</span>
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-serif font-bold">New Arrivals</h2>
          </div>
          <Link to="/collections" className="group flex items-center space-x-4 text-[10px] font-black uppercase tracking-[0.2em] hover:text-brand-copper transition-colors">
            <span>View Full Catalog</span>
            <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 md:gap-x-12 gap-y-16 md:gap-y-24">
          {PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 md:py-32 px-6 bg-brand-alabaster">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 md:mb-16">
            <span className="text-brand-copper uppercase tracking-[0.4em] text-[10px] font-black mb-4 block">Categories</span>
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-serif font-bold">Shop by Room</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CATEGORIES.map((cat, idx) => (
              <Link 
                key={cat.id}
                to={`/collections?category=${cat.name}`}
                className="group relative aspect-[3/4] rounded-2xl overflow-hidden"
              >
                <img 
                  src={cat.image} 
                  alt={cat.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 bg-brand-onyx/5"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-onyx/80 via-transparent to-transparent flex flex-col justify-end p-6 sm:p-8">
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mb-2">{cat.name}</h3>
                  <p className="text-white/60 text-[10px] sm:text-xs font-light opacity-0 group-hover:opacity-100 transition-all duration-500">{cat.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* B2B Section */}
      <section className="py-20 md:py-32 bg-brand-onyx text-brand-alabaster">
        <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          <div className="lg:w-1/2">
            <span className="text-brand-copper uppercase tracking-[0.4em] text-[10px] font-black mb-8 block">KASADA for Business</span>
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-serif font-bold mb-8 leading-tight">
              Designing for <br /> Scale.
            </h2>
            <p className="text-white/50 text-lg sm:text-xl font-light mb-12 leading-relaxed">
              Are you an interior designer, hotelier, or Airbnb host? 
              Access trade pricing, bulk order management, and dedicated project support.
            </p>
            <Link 
              to="/b2b"
              className="inline-block bg-brand-alabaster text-brand-onyx px-10 sm:px-12 py-4 sm:py-5 rounded-full font-bold hover:bg-brand-copper hover:text-white transition-all duration-500"
            >
              Apply for Trade Account
            </Link>
          </div>
          <div className="lg:w-1/2 grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop" className="rounded-2xl aspect-[4/5] object-cover" referrerPolicy="no-referrer" />
              <img src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=2069&auto=format&fit=crop" className="rounded-2xl aspect-square object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="space-y-4 pt-8 sm:pt-12">
              <img src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=2069&auto=format&fit=crop" className="rounded-2xl aspect-square object-cover" referrerPolicy="no-referrer" />
              <img src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=2070&auto=format&fit=crop" className="rounded-2xl aspect-[4/5] object-cover" referrerPolicy="no-referrer" />
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}

function ProductDetail() {
  const { id } = useParams();
  const product = PRODUCTS.find(p => p.id === id);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addAssembly, setAddAssembly] = useState(false);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const { addToCart, showToast } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    setSelectedImage(0);
    
    if (product) {
      setIsLoadingRecs(true);
      getCompleteTheLook(product, PRODUCTS).then(recs => {
        setRecommendations(recs);
        setIsLoadingRecs(false);
      });
    }
  }, [id, product]);

  const addToWishlist = async () => {
    if (!user) {
      loginWithGoogle();
      return;
    }

    if (!product) return;

    try {
      // Find if a wishlist already exists for this user
      const q = query(collection(db, 'wishlists'), where('ownerId', '==', user.uid));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const wishlistDoc = snapshot.docs[0];
        await updateDoc(doc(db, 'wishlists', wishlistDoc.id), {
          itemIds: arrayUnion(product.id)
        });
      } else {
        await addDoc(collection(db, 'wishlists'), {
          name: 'My Wishlist',
          ownerId: user.uid,
          ownerEmail: user.email,
          collaboratorEmails: [user.email],
          itemIds: [product.id],
          createdAt: Timestamp.now()
        });
      }
      showToast(`${product.name} added to wishlist`);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'wishlists');
    }
  };

  if (!product) return <div className="pt-32 text-center">Product not found</div>;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-24 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 max-w-7xl mx-auto"
    >
      <Link to="/collections" className="inline-flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-brand-slate hover:text-brand-onyx mb-8 sm:mb-12 transition-colors">
        <ArrowLeft size={14} />
        <span>Back to Collection</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
        {/* Gallery */}
        <div className="space-y-4 sm:space-y-6">
          <motion.div 
            key={selectedImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="aspect-[4/5] rounded-2xl overflow-hidden bg-brand-onyx/5 relative"
          >
            <img 
              src={product.images[selectedImage]} 
              alt={product.name} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {product.isMadeInNigeria && (
              <div className="absolute top-6 left-6 bg-brand-alabaster/90 backdrop-blur-md px-4 py-2 rounded-full shadow-sm flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-onyx">Made in Nigeria</span>
              </div>
            )}
          </motion.div>
          <div className="grid grid-cols-4 gap-3 sm:gap-4">
            {product.images.map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={cn(
                  "aspect-square rounded-xl overflow-hidden border-2 transition-all",
                  selectedImage === idx ? "border-brand-copper" : "border-transparent opacity-60 hover:opacity-100"
                )}
              >
                <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="mb-8 sm:mb-12">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] uppercase tracking-[0.3em] text-brand-copper font-black">{product.category} • {product.style}</p>
              {product.isEscrowProtected && (
                <div className="flex items-center space-x-2 text-green-600 text-[10px] font-black uppercase tracking-widest">
                  <Lock size={12} />
                  <span>Escrow Protected</span>
                </div>
              )}
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold mb-6">{product.name}</h1>
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-8">
              <p className="text-2xl sm:text-3xl font-black">₦{product.price.toLocaleString()}</p>
              <div className="flex items-center space-x-2 text-brand-slate text-sm">
                <Star size={16} className="text-brand-copper fill-brand-copper" />
                <span className="font-bold text-brand-onyx">{product.seller.rating}</span>
                <span>(124 Reviews)</span>
              </div>
            </div>

            {product.installmentOptions && (
              <div className="mb-8 p-4 bg-brand-copper/5 border border-brand-copper/20 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand-copper mb-1">Pay in Installments</p>
                  <p className="text-sm font-medium">As low as ₦{(product.price / 6).toLocaleString()} / month</p>
                </div>
                <div className="flex gap-2">
                  {product.installmentOptions.map(opt => (
                    <span key={opt} className="bg-white px-3 py-1 rounded-md text-[10px] font-bold border border-brand-onyx/5 shadow-sm">{opt}</span>
                  ))}
                </div>
              </div>
            )}

            <p className="text-brand-slate text-base sm:text-lg font-light leading-relaxed mb-8 sm:mb-12">
              {product.description}
            </p>
            
            <div className="grid grid-cols-2 gap-6 sm:gap-8 p-6 sm:p-8 bg-brand-onyx/5 rounded-[2rem] mb-8 sm:mb-12">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-black text-brand-slate mb-2">Material</p>
                <p className="font-serif text-base sm:text-lg">{product.material}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-black text-brand-slate mb-2">Dimensions</p>
                <p className="font-serif text-base sm:text-lg">{product.dimensions.width}x{product.dimensions.height}x{product.dimensions.depth} {product.dimensions.unit}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-black text-brand-slate mb-2">Delivery</p>
                <p className="font-serif text-base sm:text-lg">{product.deliverySLA}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-black text-brand-slate mb-2">Seller</p>
                <p className="font-serif text-base sm:text-lg flex items-center space-x-2">
                  <span>{product.seller.name}</span>
                  {product.seller.isVerified && <ShieldCheck size={16} className="text-brand-copper" />}
                </p>
              </div>
            </div>

            {product.hasAssemblyService && (
              <div className="mb-8 flex items-center justify-between p-6 border border-brand-onyx/10 rounded-2xl">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-brand-onyx/5 flex items-center justify-center text-brand-copper">
                    <Box size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Assembly-as-a-Service</p>
                    <p className="text-xs text-brand-slate">Professional setup on delivery</p>
                  </div>
                </div>
                <button 
                  onClick={() => setAddAssembly(!addAssembly)}
                  className={cn(
                    "w-12 h-6 rounded-full relative transition-colors duration-300",
                    addAssembly ? "bg-brand-copper" : "bg-brand-onyx/10"
                  )}
                >
                  <motion.div 
                    animate={{ x: addAssembly ? 24 : 4 }}
                    className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                  />
                </button>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6 mb-8 sm:mb-12">
              <div className="flex items-center justify-between sm:justify-start border border-brand-onyx/10 rounded-full px-4 py-2">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 hover:text-brand-copper"><Minus size={16} /></button>
                <span className="w-12 text-center font-bold">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-2 hover:text-brand-copper"><Plus size={16} /></button>
              </div>
              <button 
                onClick={() => addToCart(product.id, quantity, addAssembly)}
                className="flex-grow bg-brand-onyx text-white py-4 sm:py-5 rounded-full font-bold hover:bg-brand-copper transition-all duration-500"
              >
                Add to Cart
              </button>
              <button 
                onClick={addToWishlist}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-brand-onyx/10 flex items-center justify-center hover:bg-brand-onyx/5 transition-colors"
              >
                <Heart size={24} />
              </button>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <button 
                onClick={() => navigate('/room-visualizer')}
                className="w-full border border-brand-onyx text-brand-onyx py-4 sm:py-5 rounded-full font-bold hover:bg-brand-onyx hover:text-white transition-all flex items-center justify-center space-x-3"
              >
                <Smartphone size={20} />
                <span>Try Room Visualizer (AR)</span>
              </button>
              <button className="w-full flex items-center justify-center space-x-3 text-[10px] font-black uppercase tracking-widest text-brand-slate hover:text-brand-onyx transition-colors">
                <MessageSquare size={16} />
                <span>Track Order via WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendations: Complete the Look */}
      <div className="mt-32 pt-32 border-t border-brand-onyx/5">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-brand-copper/10 rounded-full flex items-center justify-center text-brand-copper">
                <Sparkles size={16} />
              </div>
              <span className="text-brand-copper uppercase tracking-[0.4em] text-[10px] font-black">AI-Powered Curation</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-serif font-bold">Complete the Look</h2>
          </div>
          <p className="text-brand-slate max-w-md font-light leading-relaxed">
            Our AI designer has curated these pieces to perfectly complement your selection, creating a harmonious and elevated space.
          </p>
        </div>

        {isLoadingRecs ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/5] bg-brand-onyx/5 rounded-3xl mb-6"></div>
                <div className="h-4 bg-brand-onyx/5 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-brand-onyx/5 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {recommendations.map(rec => (
              <ProductCard key={rec.id} product={rec} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function Collections() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const categoryFilter = searchParams.get('category');

  const filteredProducts = categoryFilter && categoryFilter !== 'All'
    ? PRODUCTS.filter(p => p.category.toLowerCase() === categoryFilter.toLowerCase())
    : PRODUCTS;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-24 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 max-w-7xl mx-auto"
    >
      <div className="mb-12 sm:mb-20">
        <span className="text-brand-copper uppercase tracking-[0.4em] text-[10px] font-black mb-4 block">Collections</span>
        <h1 className="text-4xl sm:text-6xl md:text-8xl font-serif font-bold mb-8">
          {categoryFilter && categoryFilter !== 'All' ? categoryFilter : 'All Pieces'}
        </h1>
        <div className="flex flex-wrap gap-3 sm:gap-4">
          {['All', 'Living Room', 'Bedroom', 'Dining Room', 'Office', 'Decor'].map(cat => (
            <Link 
              key={cat} 
              to={cat === 'All' ? '/collections' : `/collections?category=${cat}`}
              className={cn(
                "px-6 sm:px-8 py-2 sm:py-3 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all",
                (categoryFilter === cat || (!categoryFilter && cat === 'All')) 
                  ? "bg-brand-onyx text-white" 
                  : "bg-brand-onyx/5 text-brand-slate hover:bg-brand-onyx/10"
              )}
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 md:gap-x-12 gap-y-16 md:gap-y-24">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </motion.div>
  );
}

function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);

  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
      return;
    }

    const filtered = PRODUCTS.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.description.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase()) ||
      p.seller.name.toLowerCase().includes(query.toLowerCase())
    );
    setResults(filtered);
  }, [query]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-32 sm:pt-40 pb-16 sm:pb-24 px-4 sm:px-6 max-w-7xl mx-auto"
    >
      <div className="mb-12 sm:mb-20 text-center">
        <h1 className="text-5xl md:text-8xl font-serif font-bold mb-8">Search</h1>
        <div className="max-w-2xl mx-auto relative">
          <input 
            type="text"
            placeholder="Search for furniture, designers, or collections..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-brand-onyx/5 border-none rounded-full py-5 sm:py-6 px-8 sm:px-10 text-lg sm:text-xl focus:ring-2 focus:ring-brand-copper transition-all"
            autoFocus
          />
          <Search className="absolute right-6 sm:right-8 top-1/2 -translate-y-1/2 text-brand-slate" size={24} />
        </div>
      </div>

      {query && (
        <div>
          <p className="text-brand-slate mb-12 text-center text-sm sm:text-base">
            {results.length} {results.length === 1 ? 'result' : 'results'} for "{query}"
          </p>
          
          {results.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 md:gap-x-12 gap-y-16 md:gap-y-24">
              {results.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-brand-onyx/5 rounded-[3rem]">
              <p className="text-xl sm:text-2xl text-brand-slate font-light">No products found matching your search.</p>
              <button 
                onClick={() => setQuery('')}
                className="mt-8 text-brand-copper font-bold hover:underline"
              >
                Clear search
              </button>
            </div>
          )}
        </div>
      )}

      {!query && (
        <div className="mt-24">
          <h2 className="text-2xl font-serif font-bold mb-12 text-center">Popular Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 sm:gap-6">
            {['Living Room', 'Bedroom', 'Dining Room', 'Office', 'Decor'].map((cat) => (
              <button 
                key={cat}
                onClick={() => setQuery(cat)}
                className="p-6 sm:p-8 bg-brand-onyx/5 rounded-3xl hover:bg-brand-onyx hover:text-white transition-all duration-500 text-center group"
              >
                <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-white transition-colors">{cat}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function BrandGuidelines() {
  const colors = [
    { name: 'Onyx', hex: '#0a0a0a', usage: 'Primary text, backgrounds, and deep accents.', class: 'bg-brand-onyx text-white' },
    { name: 'Alabaster', hex: '#fafaf9', usage: 'Main background, negative space, and clean surfaces.', class: 'bg-brand-alabaster text-brand-onyx border border-brand-border' },
    { name: 'Copper', hex: '#b45309', usage: 'Primary accent, call-to-actions, and highlights.', class: 'bg-brand-copper text-white' },
    { name: 'Slate', hex: '#475569', usage: 'Secondary text, metadata, and subtle borders.', class: 'bg-brand-slate text-white' },
  ];

  const principles = [
    { title: 'Authenticity', desc: 'We celebrate the raw beauty of Nigerian materials and the honesty of hand-carved details.' },
    { title: 'Modernity', desc: 'We bridge traditional motifs with contemporary silhouettes for the global home.' },
    { title: 'Transparency', desc: 'From artisan wages to shipping timelines, we believe in radical honesty.' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-32 sm:pt-40 pb-24 px-6 max-w-7xl mx-auto"
    >
      <div className="mb-24 text-center">
        <span className="text-brand-copper uppercase tracking-[0.4em] text-[10px] font-black mb-4 block">Identity System</span>
        <h1 className="text-5xl md:text-8xl font-serif font-bold mb-8">Brand Guidelines</h1>
        <p className="text-xl text-brand-slate font-light max-w-2xl mx-auto leading-relaxed">
          KASADA is more than a marketplace; it is a cultural bridge. Our visual identity reflects the intersection of Nigerian heritage and modern luxury.
        </p>
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-32">
        <div className="p-12 bg-brand-onyx text-brand-alabaster rounded-[3rem]">
          <h2 className="text-3xl font-serif font-bold mb-6">Our Mission</h2>
          <p className="text-lg text-white/60 font-light leading-relaxed">
            To empower Nigerian artisans by providing a global platform for their craftsmanship, while offering homeowners unique, high-quality furniture that tells a story.
          </p>
        </div>
        <div className="p-12 bg-brand-onyx/5 rounded-[3rem] border border-brand-onyx/10">
          <h2 className="text-3xl font-serif font-bold mb-6">Our Vision</h2>
          <p className="text-lg text-brand-slate font-light leading-relaxed">
            To become the definitive global destination for Afro-contemporary design, setting the standard for ethical production and artisanal luxury.
          </p>
        </div>
      </div>

      {/* Color Palette */}
      <section className="mb-32">
        <h2 className="text-3xl font-serif font-bold mb-12">Color Palette</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {colors.map((color) => (
            <div key={color.name} className="group">
              <div className={cn("aspect-square rounded-3xl mb-6 flex items-end p-8 transition-transform duration-500 group-hover:scale-[1.02]", color.class)}>
                <span className="text-2xl font-serif font-bold">{color.hex}</span>
              </div>
              <h3 className="text-lg font-bold mb-2">{color.name}</h3>
              <p className="text-sm text-brand-slate font-light leading-relaxed">{color.usage}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Typography */}
      <section className="mb-32">
        <h2 className="text-3xl font-serif font-bold mb-12">Typography</h2>
        <div className="space-y-12">
          <div className="p-12 bg-brand-onyx/5 rounded-[3rem] border border-brand-onyx/10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div>
                <span className="text-brand-copper uppercase tracking-widest text-[10px] font-black mb-4 block">Primary Display</span>
                <h3 className="text-6xl md:text-8xl font-serif font-bold">Playfair Display</h3>
              </div>
              <p className="text-sm text-brand-slate font-light max-w-xs">
                Used for headings, hero sections, and brand statements. It conveys elegance, tradition, and authority.
              </p>
            </div>
          </div>
          <div className="p-12 bg-brand-onyx/5 rounded-[3rem] border border-brand-onyx/10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div>
                <span className="text-brand-copper uppercase tracking-widest text-[10px] font-black mb-4 block">Secondary UI</span>
                <h3 className="text-4xl md:text-6xl font-sans font-bold">Plus Jakarta Sans</h3>
              </div>
              <p className="text-sm text-brand-slate font-light max-w-xs">
                Used for body copy, navigation, and functional UI elements. It ensures clarity, modernity, and readability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Principles */}
      <section>
        <h2 className="text-3xl font-serif font-bold mb-12">Core Principles</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {principles.map((p) => (
            <div key={p.title} className="p-10 bg-brand-onyx/5 rounded-[2.5rem] border border-brand-onyx/5">
              <h3 className="text-xl font-serif font-bold mb-4">{p.title}</h3>
              <p className="text-sm text-brand-slate font-light leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
}

function Footer() {
  return (
    <footer className="bg-brand-onyx text-brand-alabaster pt-32 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 md:gap-24 mb-24 md:mb-32">
          <div className="lg:col-span-1 text-center md:text-left">
            <h2 className="text-3xl font-serif font-black tracking-tighter mb-8">KASADA</h2>
            <p className="text-white/40 font-light leading-relaxed mb-12 max-w-xs mx-auto md:mx-0">
              Nigeria's premier destination for handcrafted furniture. 
              Bridging the gap between local artisans and modern homes.
            </p>
            <div className="flex justify-center md:justify-start space-x-6">
              <Instagram size={18} className="text-white/40 hover:text-brand-copper cursor-pointer transition-colors" />
              <Twitter size={18} className="text-white/40 hover:text-brand-copper cursor-pointer transition-colors" />
              <Facebook size={18} className="text-white/40 hover:text-brand-copper cursor-pointer transition-colors" />
              <Linkedin size={18} className="text-white/40 hover:text-brand-copper cursor-pointer transition-colors" />
            </div>
          </div>
          
          <div className="text-center md:text-left">
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-black mb-8 md:mb-10 text-brand-copper">Shop</h4>
            <ul className="space-y-4 md:space-y-6 text-white/40 text-sm font-medium">
              <li><Link to="/collections?category=Living Room" className="hover:text-white transition-colors">Living Room</Link></li>
              <li><Link to="/collections?category=Bedroom" className="hover:text-white transition-colors">Bedroom</Link></li>
              <li><Link to="/collections?category=Office" className="hover:text-white transition-colors">Office</Link></li>
              <li><Link to="/collections?category=Dining Room" className="hover:text-white transition-colors">Dining Room</Link></li>
              <li><Link to="/bespoke" className="hover:text-white transition-colors">Bespoke Portal</Link></li>
              <li><Link to="/loyalty" className="hover:text-white transition-colors">Kasada Points</Link></li>
            </ul>
          </div>

          <div className="text-center md:text-left">
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-black mb-8 md:mb-10 text-brand-copper">Support</h4>
            <ul className="space-y-4 md:space-y-6 text-white/40 text-sm font-medium">
              <li><Link to="/shipping" className="hover:text-white transition-colors">Shipping & Logistics</Link></li>
              <li><Link to="/returns" className="hover:text-white transition-colors">Returns & Escrow</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">FAQs</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div className="text-center md:text-left">
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-black mb-8 md:mb-10 text-brand-copper">Newsletter</h4>
            <p className="text-white/40 text-sm mb-8 font-light leading-relaxed">Join our list for design inspiration and early access to new collections.</p>
            <div className="relative max-w-xs mx-auto md:mx-0">
              <input 
                type="email" 
                placeholder="Email address" 
                className="bg-transparent border-b border-white/20 pb-4 w-full focus:outline-none focus:border-brand-copper transition-colors text-sm"
              />
              <button className="absolute right-0 bottom-4 text-brand-copper hover:text-white transition-colors">
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
        
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8 text-white/20 text-[8px] font-black tracking-[0.3em] uppercase text-center md:text-left">
          <p>© 2026 KASADA FURNITURE. ALL RIGHTS RESERVED.</p>
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-12">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

interface ProductCardProps {
  product: Product;
  key?: string | number;
}

// --- Prototype Components ---

function Bundles() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-40 pb-24 px-6 max-w-7xl mx-auto"
    >
      <div className="mb-20">
        <span className="text-brand-copper uppercase tracking-[0.4em] text-[10px] font-black mb-4 block">Curated Collections</span>
        <h1 className="text-5xl md:text-8xl font-serif font-bold mb-8">Room Bundles</h1>
        <p className="text-xl text-brand-slate font-light max-w-2xl leading-relaxed">
          Our design team has paired our most iconic pieces to create cohesive, ready-to-live spaces. 
          Save up to 20% when you purchase a complete bundle.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {BUNDLES.map((bundle) => (
          <BundleCard key={bundle.id} bundle={bundle} />
        ))}
      </div>
    </motion.div>
  );
}

function BundleDetail() {
  const { id } = useParams();
  const bundle = BUNDLES.find(b => b.id === id);
  
  if (!bundle) return <div className="pt-40 text-center">Bundle not found</div>;

  const bundleProducts = bundle.productIds.map(pid => PRODUCTS.find(p => p.id === pid)).filter(Boolean) as Product[];

  const { addToCart, showToast } = useCart();

  const addBundleToCart = () => {
    bundle.productIds.forEach(pid => {
      addToCart(pid, 1, false);
    });
    showToast(`${bundle.name} added to bag`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-40 pb-24 px-6 max-w-7xl mx-auto"
    >
      <Link to="/bundles" className="inline-flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-brand-slate hover:text-brand-onyx mb-12 transition-colors">
        <ArrowLeft size={14} />
        <span>Back to Bundles</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 mb-32">
        <div className="aspect-[16/9] lg:aspect-square rounded-[3rem] overflow-hidden shadow-2xl">
          <img src={bundle.image} alt={bundle.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </div>
        
        <div className="flex flex-col justify-center">
          <span className="text-brand-copper uppercase tracking-[0.4em] text-[10px] font-black mb-6 block">{bundle.category} Bundle</span>
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-8 leading-tight">{bundle.name}</h1>
          <p className="text-xl text-brand-slate font-light leading-relaxed mb-12">
            {bundle.description}
          </p>
          
          <div className="bg-brand-onyx/5 p-10 rounded-[3rem] mb-12">
            <div className="flex justify-between items-end mb-8">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-slate mb-2">Bundle Value</p>
                <p className="text-2xl text-brand-slate line-through">₦{bundle.price.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-copper mb-2">Bundle Price</p>
                <p className="text-5xl font-black text-brand-onyx">₦{bundle.discountPrice.toLocaleString()}</p>
              </div>
            </div>
            <button 
              onClick={addBundleToCart}
              className="w-full bg-brand-onyx text-white py-6 rounded-full font-bold text-lg hover:bg-brand-copper transition-all duration-500 shadow-xl"
            >
              Add Complete Bundle to Cart
            </button>
          </div>

          <div className="flex items-center space-x-6 text-brand-slate">
            <div className="flex items-center space-x-2">
              <ShieldCheck size={20} className="text-brand-copper" />
              <span className="text-xs font-bold uppercase tracking-widest">Escrow Protected</span>
            </div>
            <div className="flex items-center space-x-2">
              <Truck size={20} className="text-brand-copper" />
              <span className="text-xs font-bold uppercase tracking-widest">White Glove Delivery</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-3xl font-serif font-bold mb-16">What's Included</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {bundleProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function Login() {
  const { user, login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/loyalty');
    }
  }, [user, navigate]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-40 pb-24 px-6 min-h-screen flex items-center justify-center bg-brand-alabaster"
    >
      <div className="max-w-md w-full bg-white p-12 rounded-[2.5rem] shadow-2xl border border-brand-onyx/5">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif font-bold mb-4">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="text-brand-slate text-sm">Experience the new standard of African living.</p>
        </div>

        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          {!isLogin && (
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-brand-slate mb-2">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-slate" size={18} />
                <input 
                  type="text" 
                  placeholder="John Doe"
                  className="w-full bg-brand-onyx/5 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-brand-copper transition-all"
                />
              </div>
            </div>
          )}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-brand-slate mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-slate" size={18} />
              <input 
                type="email" 
                placeholder="hello@kasada.ng"
                className="w-full bg-brand-onyx/5 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-brand-copper transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-brand-slate mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-slate" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••"
                className="w-full bg-brand-onyx/5 border-none rounded-2xl py-4 pl-12 pr-12 focus:ring-2 focus:ring-brand-copper transition-all"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-slate hover:text-brand-onyx"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {isLogin && (
            <div className="text-right">
              <button className="text-[10px] font-black uppercase tracking-widest text-brand-copper hover:text-brand-onyx transition-colors">
                Forgot Password?
              </button>
            </div>
          )}

          <button 
            type="button"
            onClick={() => login()}
            className="w-full bg-brand-onyx text-white py-5 rounded-full font-bold hover:bg-brand-copper transition-all duration-500 shadow-xl"
          >
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-12 text-center">
          <p className="text-sm text-brand-slate mb-6">Or continue with</p>
          <div className="flex justify-center space-x-4">
            <button 
              onClick={() => login()}
              className="w-12 h-12 rounded-full bg-brand-onyx/5 flex items-center justify-center hover:bg-brand-onyx/10 transition-colors"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
            </button>
            <button className="w-12 h-12 rounded-full bg-brand-onyx/5 flex items-center justify-center hover:bg-brand-onyx/10 transition-colors">
              <Facebook className="w-5 h-5 text-blue-600" />
            </button>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-brand-onyx/5 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm font-medium text-brand-slate hover:text-brand-onyx transition-colors mb-4 block w-full text-center"
          >
            {isLogin ? "Don't have an account? Create one" : "Already have an account? Sign in"}
          </button>
          <p className="text-[10px] text-brand-slate/60 leading-relaxed italic">
            Having trouble? Try opening the app in a new tab if you're in the AI Studio preview.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function PrototypePage({ title, description, content }: { title: string, description: string, content?: React.ReactNode }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="pt-40 pb-24 px-6 max-w-7xl mx-auto"
    >
      <div className="max-w-4xl mx-auto text-center mb-24">
        <h1 className="text-5xl md:text-8xl font-serif font-bold mb-8 leading-tight">{title}</h1>
        <p className="text-xl text-brand-slate font-light leading-relaxed">
          {description}
        </p>
      </div>

      {content ? (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
          {content}
        </div>
      ) : (
        <div className="max-w-4xl mx-auto p-16 border border-brand-onyx/10 rounded-[3rem] bg-brand-onyx/5 text-center">
          <p className="text-sm uppercase tracking-widest font-black text-brand-copper mb-6">Prototype Status</p>
          <p className="text-brand-onyx text-xl font-medium mb-12">This page is currently under development as part of the KASADA 2026 roadmap. We are crafting a bespoke experience for this section.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="p-8 bg-white rounded-3xl shadow-sm">
              <div className="w-10 h-10 bg-brand-copper/10 rounded-full flex items-center justify-center text-brand-copper mb-4">
                <CheckCircle2 size={20} />
              </div>
              <h4 className="font-bold mb-2">Design Phase</h4>
              <p className="text-xs text-brand-slate">Finalizing the visual language and user flows.</p>
            </div>
            <div className="p-8 bg-white rounded-3xl shadow-sm opacity-50">
              <div className="w-10 h-10 bg-brand-onyx/10 rounded-full flex items-center justify-center text-brand-onyx mb-4">
                <Box size={20} />
              </div>
              <h4 className="font-bold mb-2">Development</h4>
              <p className="text-xs text-brand-slate">Building the core functional components.</p>
            </div>
            <div className="p-8 bg-white rounded-3xl shadow-sm opacity-50">
              <div className="w-10 h-10 bg-brand-onyx/10 rounded-full flex items-center justify-center text-brand-onyx mb-4">
                <Smartphone size={20} />
              </div>
              <h4 className="font-bold mb-2">Testing</h4>
              <p className="text-xs text-brand-slate">Ensuring a seamless multi-device experience.</p>
            </div>
          </div>
        </div>
      )}

      <div className="text-center mt-24">
        <Link to="/" className="inline-flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest text-brand-copper hover:text-brand-onyx transition-all group">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          <span>Return to Home</span>
        </Link>
      </div>
    </motion.div>
  );
}

function About() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-24 sm:pt-32"
    >
      {/* Hero Section */}
      <section className="px-6 max-w-7xl mx-auto mb-24 md:mb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-brand-copper uppercase tracking-[0.4em] text-[10px] font-black mb-6 block"
            >
              Our Story
            </motion.span>
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-serif font-black mb-8 leading-[0.9]">
              Born in Lagos. <br /> Built for the <br /> World.
            </h1>
            <p className="text-brand-slate text-lg sm:text-xl font-light leading-relaxed max-w-xl">
              KASADA began with a simple observation: Nigeria's artisans possess world-class talent, but lack the platform to reach modern, global audiences. We bridged that gap.
            </p>
          </div>
          <div className="relative aspect-square rounded-[3rem] overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1581539250439-c96689b516dd?q=80&w=1914&auto=format&fit=crop" 
              alt="Artisan at work" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-brand-copper/10 mix-blend-multiply"></div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="bg-brand-onyx text-brand-alabaster py-24 md:py-32 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl sm:text-6xl font-serif font-bold mb-16">Our Mission</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { title: 'Elevate Craft', desc: 'Preserving traditional techniques while infusing them with contemporary design language.' },
              { title: 'Empower Artisans', desc: 'Providing sustainable livelihoods and global exposure for local master craftsmen.' },
              { title: 'Define Luxury', desc: 'Creating a new standard of African luxury that is authentic, sustainable, and timeless.' }
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.2 }}
                className="p-10 rounded-[2.5rem] bg-white/5 border border-white/10"
              >
                <h3 className="text-2xl font-serif font-bold mb-4 text-brand-copper">{item.title}</h3>
                <p className="text-white/50 font-light leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* The Process */}
      <section className="py-24 md:py-32 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
          <div className="lg:w-1/2 order-2 lg:order-1">
            <div className="grid grid-cols-2 gap-4">
              <img src="https://images.unsplash.com/photo-1540932239986-30128078f3c5?q=80&w=1974&auto=format&fit=crop" className="rounded-2xl aspect-square object-cover" referrerPolicy="no-referrer" />
              <img src="https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?q=80&w=2070&auto=format&fit=crop" className="rounded-2xl aspect-[4/5] object-cover mt-8" referrerPolicy="no-referrer" />
            </div>
          </div>
          <div className="lg:w-1/2 order-1 lg:order-2">
            <span className="text-brand-copper uppercase tracking-[0.4em] text-[10px] font-black mb-6 block">The Process</span>
            <h2 className="text-4xl sm:text-6xl font-serif font-bold mb-8">Slow Furniture. <br /> Fast Impact.</h2>
            <p className="text-brand-slate text-lg font-light leading-relaxed mb-8">
              Every KASADA piece is made to order. We don't believe in mass production. We believe in the soul of the material and the hands that shape it.
            </p>
            <ul className="space-y-6">
              {[
                'Sustainably sourced Teak and Iroko wood.',
                'Hand-rubbed natural oil finishes.',
                'Traditional joinery without metal screws.',
                'Rigorous 48-point quality inspection.'
              ].map((item, idx) => (
                <li key={idx} className="flex items-center space-x-4">
                  <div className="w-2 h-2 rounded-full bg-brand-copper"></div>
                  <span className="text-sm font-bold uppercase tracking-widest text-brand-onyx">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-3xl mx-auto bg-brand-alabaster p-16 rounded-[3rem] border border-brand-onyx/5">
          <h2 className="text-4xl font-serif font-bold mb-8">Join the Movement</h2>
          <p className="text-brand-slate mb-12">Experience the fusion of heritage and modernity in your own home.</p>
          <Link 
            to="/collections" 
            className="inline-block bg-brand-onyx text-white px-12 py-5 rounded-full font-bold hover:bg-brand-copper transition-all duration-500"
          >
            Explore the Collection
          </Link>
        </div>
      </section>
    </motion.div>
  );
}

function Cart() {
  const { cart, removeFromCart, clearCart, showToast } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const cartItems = cart.map(item => {
    const product = PRODUCTS.find(p => p.id === item.productId);
    return { ...item, product };
  }).filter(item => item.product !== undefined);

  const subtotal = cartItems.reduce((acc, item) => acc + (item.product!.price * item.quantity), 0);

  const handleCheckout = async () => {
    if (!user) {
      showToast("Please login to complete your order");
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) return;

    setIsProcessing(true);
    try {
      const orderData = {
        userId: user.uid,
        items: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          priceAtTime: item.product!.price,
          assembly: item.assembly
        })),
        totalAmount: subtotal,
        status: 'Confirmed',
        createdAt: Timestamp.now(),
        shippingAddress: 'Concierge Managed'
      };

      const orderRef = await addDoc(collection(db, 'orders'), orderData);
      
      // Earn points for the purchase
      await addDoc(collection(db, 'loyalty_transactions'), {
        userId: user.uid,
        amount: Math.floor(subtotal / 1000), // 1 point per ₦1000
        type: 'earn',
        description: `Order #${orderRef.id.slice(-6).toUpperCase()}`,
        createdAt: Timestamp.now()
      });

      clearCart();
      showToast("Order placed successfully!");
      navigate('/orders');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'orders');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-24 sm:pt-40 pb-16 sm:pb-24 px-4 sm:px-6 max-w-7xl mx-auto"
    >
      <h1 className="text-4xl sm:text-5xl font-serif font-bold mb-8 sm:mb-12">Your Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          {cartItems.length > 0 ? cartItems.map((item, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row items-center sm:items-center gap-6 sm:gap-8 p-6 bg-brand-onyx/5 rounded-[2rem]">
              <img src={item.product!.images[0]} alt={item.product!.name} className="w-full sm:w-24 h-48 sm:h-24 object-cover rounded-2xl sm:rounded-lg" referrerPolicy="no-referrer" />
              <div className="flex-grow text-center sm:text-left">
                <h3 className="text-xl font-serif font-bold">{item.product!.name}</h3>
                <p className="text-xs text-brand-slate uppercase tracking-widest font-black">{item.product!.category}</p>
                {item.assembly && <p className="text-[10px] text-brand-copper font-bold mt-1">Includes Assembly Service</p>}
              </div>
              <div className="flex items-center space-x-6 sm:space-x-4">
                <span className="font-bold">Qty: {item.quantity}</span>
              </div>
              <p className="text-lg font-black">₦{(item.product!.price * item.quantity).toLocaleString()}</p>
              <button 
                onClick={() => removeFromCart(item.productId)}
                className="text-brand-slate hover:text-red-500 transition-colors"
                disabled={isProcessing}
              >
                <X size={20} />
              </button>
            </div>
          )) : (
            <div className="text-center py-20 bg-brand-onyx/5 rounded-[2rem]">
              <ShoppingCart size={48} className="mx-auto text-brand-slate/20 mb-6" />
              <p className="text-xl text-brand-slate font-light">Your cart is empty.</p>
              <Link to="/collections" className="mt-8 inline-block text-brand-copper font-bold hover:underline">Start Shopping</Link>
            </div>
          )}
        </div>
        <div className="bg-brand-onyx text-brand-alabaster p-8 sm:p-10 rounded-[2.5rem] h-fit">
          <h3 className="text-2xl font-serif font-bold mb-8">Summary</h3>
          <div className="space-y-4 mb-8">
            <div className="flex justify-between text-white/60">
              <span>Subtotal</span>
              <span>₦{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-white/60">
              <span>Shipping</span>
              <span className="text-right">Calculated at next step</span>
            </div>
            <div className="border-t border-white/10 pt-4 flex justify-between text-xl font-bold">
              <span>Total</span>
              <span>₦{subtotal.toLocaleString()}</span>
            </div>
          </div>
          <button 
            disabled={cartItems.length === 0 || isProcessing}
            onClick={handleCheckout}
            className={cn(
              "w-full py-4 sm:py-5 rounded-full font-bold transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed",
              isProcessing ? "bg-brand-copper/50 text-white cursor-wait" : "bg-brand-copper text-white hover:bg-white hover:text-brand-onyx"
            )}
          >
            {isProcessing ? "Processing Order..." : "Proceed to Checkout"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function WishlistPage() {
  const [user, setUser] = useState<User | null>(null);
  const [wishlists, setWishlists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        setLoading(false);
        setWishlists([]);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'wishlists'),
      or(
        where('ownerId', '==', user.uid),
        where('collaboratorEmails', 'array-contains', user.email)
      ),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setWishlists(docs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'wishlists');
    });

    return () => unsubscribe();
  }, [user]);

  const createWishlist = async () => {
    if (!user) return;
    const name = prompt('Wishlist Name:');
    if (!name) return;

    try {
      await addDoc(collection(db, 'wishlists'), {
        name,
        ownerId: user.uid,
        ownerEmail: user.email,
        collaboratorEmails: [user.email],
        itemIds: [],
        createdAt: Timestamp.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'wishlists');
    }
  };

  const inviteCollaborator = async (wishlistId: string) => {
    if (!inviteEmail) return;
    try {
      await updateDoc(doc(db, 'wishlists', wishlistId), {
        collaboratorEmails: arrayUnion(inviteEmail)
      });
      setInviteEmail('');
      alert('Invited!');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `wishlists/${wishlistId}`);
    }
  };

  const removeItem = async (wishlistId: string, itemId: string) => {
    try {
      await updateDoc(doc(db, 'wishlists', wishlistId), {
        itemIds: arrayRemove(itemId)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `wishlists/${wishlistId}`);
    }
  };

  if (loading) return <div className="pt-40 text-center">Loading your wishlists...</div>;
  if (!user) return <div className="pt-40 text-center">Please login to view wishlists.</div>;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-40 pb-24 px-6 max-w-7xl mx-auto"
    >
      <div className="flex justify-between items-end mb-16">
        <div>
          <span className="text-brand-copper uppercase tracking-[0.4em] text-[10px] font-black mb-4 block">Collaboration</span>
          <h1 className="text-5xl md:text-7xl font-serif font-bold">Wishlists</h1>
        </div>
        <button 
          onClick={createWishlist}
          className="bg-brand-onyx text-white px-8 py-4 rounded-full font-bold hover:bg-brand-copper transition-all"
        >
          Create New Wishlist
        </button>
      </div>

      <div className="space-y-12">
        {wishlists.map((list) => (
          <div key={list.id} className="bg-brand-onyx/5 rounded-[3rem] p-8 md:p-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
              <div>
                <h2 className="text-3xl font-serif font-bold mb-2">{list.name}</h2>
                <p className="text-brand-slate text-sm">Owner: {list.ownerEmail}</p>
              </div>
              <div className="flex items-center space-x-4">
                <input 
                  type="email" 
                  placeholder="Invite by email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="bg-white border-none rounded-full px-6 py-3 text-sm focus:ring-2 focus:ring-brand-copper"
                />
                <button 
                  onClick={() => inviteCollaborator(list.id)}
                  className="bg-brand-copper text-white px-6 py-3 rounded-full text-sm font-bold"
                >
                  Invite
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {list.itemIds.map((itemId: string) => {
                const product = PRODUCTS.find(p => p.id === itemId);
                if (!product) return null;
                return (
                  <div key={itemId} className="relative group">
                    <ProductCard product={product} />
                    <button 
                      onClick={() => removeItem(list.id, itemId)}
                      className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    >
                      <X size={16} />
                    </button>
                  </div>
                );
              })}
              {list.itemIds.length === 0 && (
                <div className="col-span-full py-12 text-center border-2 border-dashed border-brand-onyx/10 rounded-3xl">
                  <p className="text-brand-slate">No items in this wishlist yet.</p>
                </div>
              )}
            </div>
          </div>
        ))}
        {wishlists.length === 0 && (
          <div className="text-center py-24">
            <p className="text-xl text-brand-slate font-light">You haven't created any wishlists yet.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function LoyaltyDashboard() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Listen to profile
    const profileRef = doc(db, 'loyalty_profiles', user.uid);
    const unsubscribeProfile = onSnapshot(profileRef, (docSnap) => {
      if (docSnap.exists()) {
        setProfile(docSnap.data());
      } else {
        // Initialize profile if it doesn't exist
        const initialProfile = {
          userId: user.uid,
          points: 500, // Welcome points
          tier: 'Bronze',
          lifetimePoints: 500,
          updatedAt: Timestamp.now()
        };
        setDoc(profileRef, initialProfile).catch(err => handleFirestoreError(err, OperationType.CREATE, `loyalty_profiles/${user.uid}`));
      }
      setLoading(false);
    });

    // Listen to transactions
    const q = query(
      collection(db, 'loyalty_transactions'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubscribeTransactions = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setTransactions(docs);
    });

    return () => {
      unsubscribeProfile();
      unsubscribeTransactions();
    };
  }, [user]);

  const earnPoints = async () => {
    if (!user || !profile) return;
    const amount = 50;
    try {
      await updateDoc(doc(db, 'loyalty_profiles', user.uid), {
        points: profile.points + amount,
        lifetimePoints: profile.lifetimePoints + amount,
        updatedAt: Timestamp.now()
      });
      await addDoc(collection(db, 'loyalty_transactions'), {
        userId: user.uid,
        amount,
        type: 'earn',
        description: 'Daily check-in bonus',
        createdAt: Timestamp.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `loyalty_profiles/${user.uid}`);
    }
  };

  if (loading) return <div className="pt-40 text-center">Loading your rewards...</div>;
  if (!user) return <div className="pt-40 text-center">Please login to view your Kasada Points.</div>;

  const tierProgress = (profile?.points % 1000) / 10; // Simple progress logic

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-40 pb-24 px-6 max-w-7xl mx-auto"
    >
      <div className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <span className="text-brand-copper uppercase tracking-[0.4em] text-[10px] font-black mb-4 block">Loyalty Program</span>
          <h1 className="text-5xl md:text-7xl font-serif font-bold">Kasada Points</h1>
        </div>
        <button 
          onClick={() => logout()}
          className="bg-brand-onyx/5 text-brand-onyx px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-500 transition-all border border-brand-onyx/10"
        >
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-24">
        {/* Points Card */}
        <div className="lg:col-span-2 bg-brand-onyx text-white rounded-[3rem] p-12 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-12">
              <div>
                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">Available Balance</p>
                <h2 className="text-7xl font-serif font-bold flex items-baseline">
                  {profile?.points?.toLocaleString()}
                  <span className="text-brand-copper text-2xl ml-4 font-sans font-black uppercase tracking-widest">KP</span>
                </h2>
              </div>
              <div className={cn(
                "px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border",
                profile?.tier === 'Gold' ? "border-amber-400 text-amber-400" : "border-white/20 text-white/60"
              )}>
                {profile?.tier} Member
              </div>
            </div>

            <div className="mb-12">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-4">
                <span className="text-white/40">Next Tier: Silver</span>
                <span className="text-brand-copper">{1000 - (profile?.points % 1000)} points to go</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${tierProgress}%` }}
                  className="h-full bg-brand-copper"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-6">
              <button 
                onClick={earnPoints}
                className="bg-brand-copper text-white px-8 py-4 rounded-full font-bold hover:bg-white hover:text-brand-onyx transition-all flex items-center space-x-3"
              >
                <Zap size={18} />
                <span>Earn Daily Points</span>
              </button>
              <button className="bg-white/10 text-white px-8 py-4 rounded-full font-bold hover:bg-white/20 transition-all">
                Redeem Rewards
              </button>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-brand-copper/20 rounded-full blur-[100px]" />
          <Trophy className="absolute top-12 right-12 text-white/5" size={200} />
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          <div className="bg-brand-onyx/5 rounded-[2.5rem] p-8">
            <Gift className="text-brand-copper mb-4" size={24} />
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-slate mb-1">Lifetime Earned</p>
            <p className="text-3xl font-serif font-bold">{profile?.lifetimePoints?.toLocaleString()} KP</p>
          </div>
          <div className="bg-brand-onyx/5 rounded-[2.5rem] p-8">
            <Star className="text-brand-copper mb-4" size={24} />
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-slate mb-1">Active Rewards</p>
            <p className="text-3xl font-serif font-bold">3 Available</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* Transaction History */}
        <div className="lg:col-span-2">
          <div className="flex items-center space-x-4 mb-12">
            <History className="text-brand-copper" size={24} />
            <h3 className="text-3xl font-serif font-bold">Points History</h3>
          </div>
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-6 bg-white border border-brand-onyx/5 rounded-3xl">
                <div className="flex items-center space-x-6">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center",
                    tx.type === 'earn' ? "bg-green-500/10 text-green-500" : "bg-brand-copper/10 text-brand-copper"
                  )}>
                    {tx.type === 'earn' ? <Plus size={20} /> : <Minus size={20} />}
                  </div>
                  <div>
                    <p className="font-bold text-brand-onyx">{tx.description}</p>
                    <p className="text-xs text-brand-slate">{tx.createdAt?.toDate().toLocaleDateString()}</p>
                  </div>
                </div>
                <p className={cn(
                  "text-lg font-black",
                  tx.type === 'earn' ? "text-green-500" : "text-brand-onyx"
                )}>
                  {tx.type === 'earn' ? '+' : '-'}{tx.amount}
                </p>
              </div>
            ))}
            {transactions.length === 0 && (
              <div className="text-center py-12 text-brand-slate font-light italic">
                No transactions yet. Start earning points today!
              </div>
            )}
          </div>
        </div>

        {/* Tiers Info */}
        <div>
          <h3 className="text-2xl font-serif font-bold mb-8">Tier Benefits</h3>
          <div className="space-y-4">
            {[
              { name: 'Bronze', points: '0+', benefit: 'Standard Support' },
              { name: 'Silver', points: '1,000+', benefit: '5% Off All Pieces' },
              { name: 'Gold', points: '5,000+', benefit: 'Free White-Glove Delivery' },
              { name: 'Platinum', points: '10,000+', benefit: 'Private Artisan Concierge' }
            ].map((tier) => (
              <div key={tier.name} className={cn(
                "p-6 rounded-3xl border transition-all",
                profile?.tier === tier.name 
                  ? "bg-brand-onyx text-white border-brand-onyx shadow-xl scale-105" 
                  : "bg-white border-brand-onyx/5 text-brand-onyx"
              )}>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{tier.points}</p>
                  {profile?.tier === tier.name && <CheckCircle2 size={16} className="text-brand-copper" />}
                </div>
                <p className="text-xl font-serif font-bold mb-1">{tier.name}</p>
                <p className="text-xs opacity-60">{tier.benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ExclusiveDeals() {
  // Filter products for deals - using a simulated logic
  const dealProducts = PRODUCTS.slice(0, 4).map(p => ({
    ...p,
    discountPercentage: 25,
    dealPrice: p.price * 0.75
  }));

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-24 sm:pt-40"
    >
      {/* Editorial Flash Sale Header */}
      <div className="bg-brand-onyx text-white py-24 mb-24 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="max-w-2xl text-center md:text-left">
              <div className="inline-flex items-center space-x-3 bg-brand-copper/20 text-brand-copper px-4 py-2 rounded-full mb-8">
                <Zap size={16} fill="currentColor" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Limited Time Event</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-serif font-black mb-8 leading-[0.9] tracking-tighter">
                THE <br/>FLASH <br/><span className="text-brand-copper">DROP.</span>
              </h1>
              <p className="text-xl text-white/60 font-light leading-relaxed mb-12">
                Curated artisanal pieces at unprecedented value. Available until stocks last.
              </p>
              <div className="flex items-center justify-center md:justify-start space-x-8">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Ends In</p>
                  <p className="text-3xl font-mono font-bold tracking-tighter">14 : 22 : 09</p>
                </div>
                <div className="w-px h-12 bg-white/10" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Status</p>
                  <p className="text-3xl font-sans font-black text-brand-copper">ACTIVE</p>
                </div>
              </div>
            </div>
            
            <div className="relative group">
              <div className="w-80 h-80 md:w-96 md:h-96 rounded-full border border-white/10 flex items-center justify-center p-8 animate-pulse">
                 <div className="text-center">
                   <p className="text-sm uppercase tracking-[0.5em] mb-4">Upto</p>
                   <p className="text-9xl font-serif font-black text-brand-copper">40</p>
                   <p className="text-sm uppercase tracking-[0.5em] mt-4">% OFF</p>
                 </div>
              </div>
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-brand-copper rounded-full flex items-center justify-center rotate-12 group-hover:rotate-45 transition-transform duration-700">
                <span className="text-white font-black text-xs uppercase text-center">Final<br/>Markdowns</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Background Text Marquee */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full opacity-[0.03] pointer-events-none select-none overflow-hidden whitespace-nowrap">
           <div className="text-[30vw] font-serif font-black animate-marquee inline-block">
             EXCLUSIVEDEALS&nbsp;&nbsp;&nbsp;EXCLUSIVEDEALS&nbsp;&nbsp;&nbsp;
           </div>
        </div>
      </div>

      {/* Deals Grid */}
      <div className="max-w-7xl mx-auto px-6 mb-32">
        <h2 className="text-3xl font-serif font-bold mb-16 flex items-center justify-between">
          <span>Active Markdowns</span>
          <span className="text-sm font-sans font-light text-brand-slate uppercase tracking-widest">Showing {dealProducts.length} results</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {dealProducts.map(product => (
            <div key={product.id} className="group flex flex-col h-full">
              <div className="aspect-[4/5] rounded-[2rem] overflow-hidden mb-6 relative">
                 <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" referrerPolicy="no-referrer" />
                 <div className="absolute top-6 left-6 bg-brand-copper text-white text-[10px] font-black px-4 py-2 rounded-full shadow-lg">
                   -{product.discountPercentage}%
                 </div>
                 <Link 
                   to={`/product/${product.id}`}
                   className="absolute inset-0 bg-brand-onyx/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                 >
                   <button className="bg-white text-brand-onyx px-8 py-3 rounded-full font-bold transform translate-y-4 group-hover:translate-y-0 transition-transform">
                     Claim Deal
                   </button>
                 </Link>
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-serif font-bold text-xl">{product.name}</h3>
                </div>
                <div className="flex items-center space-x-3 mb-4">
                  <span className="text-2xl font-black text-brand-onyx">₦{product.dealPrice.toLocaleString()}</span>
                  <span className="text-sm text-brand-slate line-through">₦{product.price.toLocaleString()}</span>
                </div>
                <p className="text-sm text-brand-slate font-light line-clamp-2 leading-relaxed mb-6">
                  {product.description}
                </p>
                <div className="mt-auto flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-brand-slate/40">
                  <span>{product.stock} items left</span>
                  <div className="w-32 h-1 bg-brand-onyx/5 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-copper w-1/4" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deal Bundles */}
      <div className="max-w-7xl mx-auto px-6 mb-32">
        <div className="bg-brand-alabaster rounded-[4rem] p-12 md:p-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div>
              <span className="text-brand-copper uppercase tracking-[0.4em] text-[10px] font-black mb-6 block">Bundle Exclusive</span>
              <h2 className="text-5xl md:text-6xl font-serif font-bold mb-8 leading-tight">The Heritage Living Room Set</h2>
              <p className="text-xl text-brand-slate font-light leading-relaxed mb-12">
                Procure the entire curated set and unlock an additional 15% discount. 
                Our most significant saving ever on handcrafted velvet and teak.
              </p>
              <div className="flex items-center space-x-12 mb-12">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand-slate mb-2">Retail Total</p>
                  <p className="text-2xl text-brand-slate line-through">₦850,000</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand-copper mb-2">Special Offer</p>
                  <p className="text-5xl font-black text-brand-onyx">₦610,000</p>
                </div>
              </div>
              <Link to="/bundles/b2">
                <button className="bg-brand-onyx text-white px-12 py-5 rounded-full font-bold hover:bg-brand-copper transition-all shadow-xl">
                  Shop the Collection
                </button>
              </Link>
            </div>
            <div className="aspect-square rounded-[3rem] overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=2070&auto=format&fit=crop" 
                alt="Bundle Deal" 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function B2BPortal() {
  const { showToast } = useCart();
  const [inquiryType, setInquiryType] = useState('Hospitality');
  const [formData, setFormData] = useState({
    company: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("Application submitted. An specialist will reach out within 24 hours.");
    setFormData({ company: '', email: '', message: '' });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-24 sm:pt-40 pb-24"
    >
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 mb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div>
            <span className="text-brand-copper uppercase tracking-[0.4em] text-[10px] font-black mb-6 block">KASADA FOR BUSINESS</span>
            <h1 className="text-6xl md:text-8xl font-serif font-bold mb-8 leading-tight">Scale Your <br/>Interior Vision.</h1>
            <p className="text-xl text-brand-slate font-light leading-relaxed mb-12">
              From boutique hotels to sustainable corporate headquarters, we provide high-volume, 
              handcrafted furniture built to endure Nigeria's climate and corporate rigors.
            </p>
            <div className="flex flex-wrap gap-6">
              <a href="#inquiry" className="bg-brand-onyx text-white px-10 py-5 rounded-full font-bold hover:bg-brand-copper transition-all shadow-xl">
                Start Bulk Inquiry
              </a>
              <div className="flex items-center space-x-4 px-8 py-5 border border-brand-onyx/10 rounded-full">
                <ShieldCheck className="text-brand-copper" size={24} />
                <span className="text-sm font-bold uppercase tracking-widest">Trade Certified</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/3] rounded-[3rem] overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop" 
                alt="B2B Workspace" 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-12 -left-12 bg-white p-8 rounded-[2rem] shadow-2xl hidden md:block max-w-xs border border-brand-onyx/5">
              <p className="text-brand-copper font-serif font-bold text-lg mb-2">"KASADA transformed our office into a cultural landmark."</p>
              <p className="text-xs text-brand-slate font-bold uppercase tracking-widest">— CEO, Eko Tech Hub</p>
            </div>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="bg-brand-onyx py-32 mb-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-serif font-bold text-white mb-8">Tailored Industry Solutions</h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto font-light">
              We understand the unique demands of professional environments. 
              Our B2B partners enjoy tiered pricing and logistics priority.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { 
                title: 'Hospitality', 
                icon: Star, 
                desc: 'Bespoke suites for hotels and airbnbs that demand durability without sacrificing artisanal soul.',
                image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop'
              },
              { 
                title: 'Corporate', 
                icon: Box, 
                desc: 'Productivity-first workstations and boardrooms designed for the modern African enterprise.',
                image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop'
              },
              { 
                title: 'Real Estate', 
                icon: ShieldCheck, 
                desc: 'Turnkey interior packages for property developers looking to elevate their valuation.',
                image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop'
              }
            ].map((service) => (
              <div key={service.title} className="group cursor-pointer">
                <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden mb-8 shadow-xl relative">
                  <img src={service.image} alt={service.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-brand-onyx/40 flex items-center justify-center scale-0 group-hover:scale-100 transition-transform duration-500">
                    <button className="bg-white text-brand-onyx px-8 py-3 rounded-full font-bold">Request Specs</button>
                  </div>
                </div>
                <div className="flex items-center space-x-4 mb-4">
                  <service.icon className="text-brand-copper" size={24} />
                  <h3 className="text-2xl font-serif font-bold text-white uppercase tracking-wider">{service.title}</h3>
                </div>
                <p className="text-white/50 leading-relaxed font-light">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trade Benefits */}
      <div className="max-w-7xl mx-auto px-6 mb-32">
        <div className="bg-brand-onyx/5 rounded-[3rem] p-12 md:p-24 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-12">The Trade Advantage</h2>
            <div className="space-y-12">
              <div className="flex gap-8">
                <div className="w-16 h-16 rounded-2xl bg-brand-copper/10 text-brand-copper flex items-center justify-center shrink-0">
                  <Gift size={32} />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2">Volume Discounts</h4>
                  <p className="text-brand-slate font-light leading-relaxed">Save up to 35% on multi-unit procurement and recurring projects.</p>
                </div>
              </div>
              <div className="flex gap-8">
                <div className="w-16 h-16 rounded-2xl bg-brand-copper/10 text-brand-copper flex items-center justify-center shrink-0">
                  <Truck size={32} />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2">Priority Logistics</h4>
                  <p className="text-brand-slate font-light leading-relaxed">Nationwide delivery with dedicated project management and on-site assembly.</p>
                </div>
              </div>
              <div className="flex gap-8">
                <div className="w-16 h-16 rounded-2xl bg-brand-copper/10 text-brand-copper flex items-center justify-center shrink-0">
                  <Zap size={32} />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2">CAD/3D Assets</h4>
                  <p className="text-brand-slate font-light leading-relaxed">Instant access to high-fidelity models for your architectural visualizations.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div id="inquiry" className="bg-white p-12 rounded-[2.5rem] shadow-2xl border border-brand-onyx/5">
            <h3 className="text-2xl font-serif font-bold mb-8">B2B Inquiry</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-brand-slate mb-2">Select Sector</label>
                <div className="flex gap-3">
                  {['Hospitality', 'Corporate', 'Residential'].map(t => (
                    <button 
                      key={t}
                      type="button"
                      onClick={() => setInquiryType(t)}
                      className={cn(
                        "px-4 py-2 rounded-full text-[10px] uppercase font-black tracking-widest transition-all",
                        inquiryType === t ? "bg-brand-copper text-white" : "bg-brand-onyx/5 text-brand-slate"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-brand-slate mb-2">Company Name</label>
                <input 
                  required
                  type="text" 
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                  className="w-full bg-brand-onyx/5 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-brand-copper" 
                  placeholder="e.g. Radisson Blu"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-brand-slate mb-2">Business Email</label>
                <input 
                  required
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-brand-onyx/5 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-brand-copper" 
                  placeholder="procurement@company.ng"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-brand-slate mb-2">Project Brief</label>
                <textarea 
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full bg-brand-onyx/5 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-brand-copper" 
                  placeholder="Tell us about your space and requirements..."
                />
              </div>
              <button className="w-full bg-brand-onyx text-white py-5 rounded-full font-bold hover:bg-brand-copper transition-all shadow-xl">
                Submit Application
              </button>
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Designers() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-40 pb-24"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-12">
          <div className="max-w-2xl">
            <span className="text-brand-copper uppercase tracking-[0.4em] text-[10px] font-black mb-6 block">The Collective</span>
            <h1 className="text-6xl md:text-8xl font-serif font-bold mb-8 leading-tight">Meet the <br/>Visionaries.</h1>
            <p className="text-xl text-brand-slate font-light leading-relaxed">
              KASADA is a home for the continent's most daring furniture designers. 
              We partner with artisans who bridge the gap between ancient heritage and modern luxury.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-32 h-32 rounded-full border border-brand-onyx/10 flex items-center justify-center p-4">
              <Sparkles className="text-brand-copper" size={48} />
            </div>
          </div>
        </div>

        <div className="space-y-40">
          {DESIGNERS.map((designer, idx) => (
            <motion.div 
              key={designer.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: idx * 0.2 }}
              className={cn(
                "flex flex-col gap-12 md:gap-24",
                idx % 2 === 1 ? "md:flex-row-reverse" : "md:flex-row"
              )}
            >
              <div className="flex-1">
                <div className="aspect-[3/4] overflow-hidden rounded-[3rem] shadow-2xl relative group">
                  <img 
                    src={designer.image} 
                    alt={designer.name} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-brand-onyx/20 group-hover:bg-brand-onyx/0 transition-colors duration-500" />
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-center">
                <div className="mb-12">
                  <div className="flex flex-wrap gap-3 mb-8">
                    {designer.styles.map(style => (
                      <span key={style} className="px-4 py-1.5 rounded-full border border-brand-onyx/10 text-[10px] uppercase font-black tracking-widest text-brand-slate">
                        {style}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-4xl md:text-6xl font-serif font-bold mb-8">{designer.name}</h2>
                  <p className="text-xl text-brand-slate font-light leading-relaxed mb-12">
                    {designer.bio}
                  </p>
                </div>

                <div className="bg-brand-onyx/5 p-12 rounded-[2.5rem]">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-brand-slate mb-8 pb-4 border-b border-brand-onyx/5">Notable Works</h3>
                  <div className="space-y-4">
                    {designer.notableWorks.map(work => (
                      <div key={work} className="flex items-center space-x-4">
                        <div className="w-2 h-2 rounded-full bg-brand-copper" />
                        <span className="text-lg font-serif italic text-brand-onyx">{work}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <button className="mt-12 group flex items-center space-x-4 text-brand-copper font-bold hover:text-brand-onyx transition-colors">
                  <span>View Designer Portfolio</span>
                  <ArrowRight size={20} className="transition-transform group-hover:translate-x-2" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function OrderHistory() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'orders'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setOrders(docs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'orders');
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) return <div className="pt-40 text-center">Loading your orders...</div>;
  if (!user) return <div className="pt-40 text-center">Please login to view your orders.</div>;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-40 pb-24 px-6 max-w-7xl mx-auto"
    >
      <h1 className="text-5xl font-serif font-bold mb-16">Order History</h1>
      <div className="space-y-8">
        {orders.map((order) => (
          <div key={order.id} className="bg-brand-onyx/5 rounded-[2.5rem] p-8 md:p-12 overflow-hidden border border-brand-onyx/5">
            <div className="flex flex-col md:flex-row justify-between mb-12 gap-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-copper mb-2">Order ID</p>
                <p className="font-mono text-xs text-brand-onyx/40">#{order.id.slice(-8).toUpperCase()}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-slate mb-2">Date</p>
                <p className="font-bold">{order.createdAt?.toDate().toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-slate mb-2">Status</p>
                <div className="flex items-center space-x-2 text-green-500">
                  <CheckCircle2 size={16} />
                  <span className="font-bold uppercase text-[10px] tracking-widest">{order.status}</span>
                </div>
              </div>
              <div className="text-right flex flex-col items-end">
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-slate mb-2">Total Amount</p>
                <p className="text-3xl font-black text-brand-onyx">₦{order.totalAmount.toLocaleString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-8 border-t border-brand-onyx/5">
              {order.items.map((item: any, idx: number) => {
                const product = PRODUCTS.find(p => p.id === item.productId);
                return (
                  <div key={idx} className="flex items-center space-x-6">
                    <img 
                      src={product?.images[0]} 
                      alt={product?.name} 
                      className="w-20 h-20 object-cover rounded-2xl" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="w-full">
                      <h4 className="font-bold text-sm truncate w-40">{product?.name}</h4>
                      <p className="text-xs text-brand-slate">Qty: {item.quantity}</p>
                      <p className="text-xs font-black">₦{((product?.price || 0) * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="text-center py-24 bg-brand-onyx/5 rounded-[3rem]">
            <Box size={48} className="mx-auto text-brand-slate/20 mb-6" />
            <p className="text-xl text-brand-slate font-light italic">No orders found.</p>
            <Link to="/collections" className="mt-8 inline-block text-brand-copper font-bold hover:underline">Start Shopping</Link>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function BespokePortal() {
  const [user, setUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [materials, setMaterials] = useState('');

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        setLoading(false);
        setRequests([]);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'bespoke_requests'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setRequests(docs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'bespoke_requests');
    });

    return () => unsubscribe();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await addDoc(collection(db, 'bespoke_requests'), {
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || 'Anonymous',
        description,
        budget: budget ? parseFloat(budget) : null,
        dimensions,
        materialPreferences: materials,
        status: 'pending',
        createdAt: Timestamp.now(),
        attachments: []
      });
      
      setDescription('');
      setBudget('');
      setDimensions('');
      setMaterials('');
      setShowForm(false);
      alert('Your bespoke request has been submitted! Our artisans will review it shortly.');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'bespoke_requests');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-amber-500 bg-amber-500/10';
      case 'reviewed': return 'text-blue-500 bg-blue-500/10';
      case 'quoted': return 'text-purple-500 bg-purple-500/10';
      case 'in-progress': return 'text-brand-copper bg-brand-copper/10';
      case 'completed': return 'text-green-500 bg-green-500/10';
      default: return 'text-brand-slate bg-brand-slate/10';
    }
  };

  if (loading) return <div className="pt-40 text-center">Loading your requests...</div>;
  if (!user) return <div className="pt-40 text-center">Please login to access the Bespoke Portal.</div>;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-40 pb-24 px-6 max-w-7xl mx-auto"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
        <div>
          <span className="text-brand-copper uppercase tracking-[0.4em] text-[10px] font-black mb-4 block">Custom Craftsmanship</span>
          <h1 className="text-5xl md:text-7xl font-serif font-bold">Bespoke Portal</h1>
          <p className="text-brand-slate mt-6 max-w-xl text-lg font-light">
            Collaborate directly with Nigeria's finest artisans to bring your unique vision to life.
          </p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-brand-onyx text-white px-10 py-5 rounded-full font-bold hover:bg-brand-copper transition-all shadow-xl flex items-center space-x-3"
        >
          <Plus size={20} />
          <span>{showForm ? 'Cancel Request' : 'New Bespoke Request'}</span>
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-24"
          >
            <form onSubmit={handleSubmit} className="bg-brand-onyx/5 rounded-[3rem] p-8 md:p-16 grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-brand-slate mb-4">What are you looking to create?</label>
                <textarea 
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your dream piece in detail. Include style, purpose, and any specific features..."
                  className="w-full bg-white border-none rounded-3xl p-8 min-h-[200px] focus:ring-2 focus:ring-brand-copper transition-all text-lg"
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-brand-slate mb-4">Estimated Budget (₦)</label>
                <input 
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="e.g. 500000"
                  className="w-full bg-white border-none rounded-2xl px-8 py-5 focus:ring-2 focus:ring-brand-copper transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-brand-slate mb-4">Dimensions / Space Constraints</label>
                <input 
                  type="text"
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                  placeholder="e.g. 200cm x 100cm"
                  className="w-full bg-white border-none rounded-2xl px-8 py-5 focus:ring-2 focus:ring-brand-copper transition-all"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-brand-slate mb-4">Material & Finish Preferences</label>
                <input 
                  type="text"
                  value={materials}
                  onChange={(e) => setMaterials(e.target.value)}
                  placeholder="e.g. Teak wood with matte black hardware"
                  className="w-full bg-white border-none rounded-2xl px-8 py-5 focus:ring-2 focus:ring-brand-copper transition-all"
                />
              </div>

              <div className="md:col-span-2 flex justify-end">
                <button 
                  type="submit"
                  className="bg-brand-copper text-white px-12 py-5 rounded-full font-bold hover:bg-brand-onyx transition-all duration-500 shadow-lg"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-8">
        <h3 className="text-2xl font-serif font-bold mb-8">Your Requests</h3>
        {requests.map((req) => (
          <div key={req.id} className="bg-white border border-brand-onyx/5 rounded-[2.5rem] p-8 md:p-12 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row justify-between items-start gap-8">
              <div className="flex-grow">
                <div className="flex items-center space-x-4 mb-6">
                  <span className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest", getStatusColor(req.status))}>
                    {req.status}
                  </span>
                  <span className="text-brand-slate text-xs flex items-center space-x-2">
                    <Clock size={14} />
                    <span>{req.createdAt?.toDate().toLocaleDateString()}</span>
                  </span>
                </div>
                <p className="text-xl text-brand-onyx font-medium leading-relaxed mb-8">
                  {req.description}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-8 border-t border-brand-onyx/5">
                  {req.budget && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-brand-slate mb-1">Budget</p>
                      <p className="font-bold text-brand-onyx">₦{req.budget.toLocaleString()}</p>
                    </div>
                  )}
                  {req.dimensions && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-brand-slate mb-1">Dimensions</p>
                      <p className="font-bold text-brand-onyx">{req.dimensions}</p>
                    </div>
                  )}
                  {req.materialPreferences && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-brand-slate mb-1">Materials</p>
                      <p className="font-bold text-brand-onyx">{req.materialPreferences}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="shrink-0 w-full md:w-auto">
                <div className="p-6 bg-brand-onyx/5 rounded-3xl">
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand-slate mb-4">Concierge Status</p>
                  <div className="flex items-center space-x-3 text-brand-onyx">
                    {req.status === 'pending' ? (
                      <>
                        <Clock size={20} className="text-amber-500" />
                        <span className="text-sm font-medium">Reviewing your brief</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={20} className="text-green-500" />
                        <span className="text-sm font-medium">Artisan assigned</span>
                      </>
                    )}
                  </div>
                  <button className="w-full mt-6 text-[10px] font-black uppercase tracking-widest text-brand-copper hover:text-brand-onyx transition-colors flex items-center justify-center space-x-2">
                    <MessageSquare size={14} />
                    <span>Chat with Artisan</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {requests.length === 0 && !showForm && (
          <div className="text-center py-32 bg-brand-onyx/5 rounded-[3rem]">
            <FileText size={48} className="mx-auto text-brand-slate/20 mb-6" />
            <p className="text-xl text-brand-slate font-light">No bespoke requests yet. Ready to start your custom journey?</p>
            <button 
              onClick={() => setShowForm(true)}
              className="mt-8 text-brand-copper font-bold hover:underline"
            >
              Submit your first brief
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen flex flex-col selection:bg-brand-copper selection:text-white">
            <Navbar />
            <div className="flex-grow">
              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/collections" element={<Collections />} />
                  <Route path="/bundles" element={<Bundles />} />
                  <Route path="/bundles/:id" element={<BundleDetail />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/deals" element={<ExclusiveDeals />} />
                  <Route path="/room-visualizer" element={<PrototypePage title="Room Visualizer" description="Experience our furniture in your own space using AR and 3D modeling." />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/designers" element={<Designers />} />
                  <Route path="/b2b" element={<B2BPortal />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/bespoke" element={<BespokePortal />} />
                  <Route path="/loyalty" element={<LoyaltyDashboard />} />
                  <Route path="/orders" element={<OrderHistory />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/shipping" element={<PrototypePage title="Shipping & Logistics" description="Transparent, trackable delivery for bulky items across all 36 states." />} />
                  <Route path="/returns" element={<PrototypePage title="Returns & Escrow" description="Our 7-day inspection period ensures you only pay for what you love." />} />
                  <Route path="/faq" element={<PrototypePage title="Frequently Asked Questions" description="Everything you need to know about shopping with KASADA." />} />
                  <Route path="/contact" element={<PrototypePage title="Contact Us" description="Our concierge team is here to help with your design journey." />} />
                  <Route path="/privacy" element={<PrototypePage title="Privacy Policy" description="How we protect your data and respect your digital space." />} />
                  <Route path="/terms" element={<PrototypePage title="Terms of Service" description="The fine print, made clear and fair for everyone." />} />
                  <Route path="/brand-guidelines" element={<BrandGuidelines />} />
                </Routes>
              </AnimatePresence>
            </div>
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}
