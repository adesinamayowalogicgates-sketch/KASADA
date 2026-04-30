import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';

export interface CartItem {
  productId: string;
  quantity: number;
  assembly: boolean;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (productId: string, quantity: number, assembly: boolean) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  showToast: (message: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('kasada_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      console.error("Error loading cart from localStorage:", err);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('kasada_cart', JSON.stringify(cart));
  }, [cart]);

  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const addToCart = (productId: string, quantity: number, assembly: boolean) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === productId && item.assembly === assembly);
      if (existing) {
        return prev.map(item => 
          (item.productId === productId && item.assembly === assembly)
            ? { ...item, quantity: Math.max(1, item.quantity + quantity) }
            : item
        );
      }
      return [...prev, { productId, quantity: Math.max(1, quantity), assembly }];
    });
    showToast("Added to bag");
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, showToast }}>
      {children}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-12 left-1/2 z-[100] bg-brand-onyx text-white px-8 py-4 rounded-full shadow-2xl flex items-center space-x-3 pointer-events-none border border-white/10"
          >
            <Sparkles className="text-brand-copper" size={18} />
            <span className="text-xs font-black uppercase tracking-widest">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
