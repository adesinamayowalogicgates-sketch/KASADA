import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Trash2, 
  Minus, 
  Plus, 
  ArrowRight, 
  ShieldCheck, 
  Truck,
  Sparkles
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { PRODUCTS } from '../constants';
import { cn } from '../lib/utils';

const Cart: React.FC = () => {
    const { cart, removeFromCart, addToCart, clearCart, showToast } = useCart();
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const [isCheckingOut, setIsCheckingOut] = useState(false);
  
    const cartProducts = cart.map(item => ({
      ...item,
      product: PRODUCTS.find(p => p.id === item.productId)!
    })).filter(item => item.product !== undefined);
  
    const subtotal = cartProducts.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    const assemblyTotal = cartProducts.reduce((acc, item) => acc + (item.assembly ? (item.product.assemblyCost || 0) * item.quantity : 0), 0);
    const delivery = subtotal > 500000 ? 0 : 25000;
    const total = subtotal + assemblyTotal + delivery;
  
    const handleCheckout = async () => {
      if (!user) {
        login();
        return;
      }
      setIsCheckingOut(true);
      try {
        const idToken = await user.getIdToken();
        const response = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            idToken,
            shippingAddress: 'Concierge Managed',
            clientTotal: total,
            items: cartProducts.map(item => ({
              productId: item.product.id,
              quantity: item.quantity,
              assembly: item.assembly
            }))
          })
        });
        
        const result = await response.json();
        if (result.success) {
          clearCart();
          navigate(`/order-success?id=${result.orderId}`);
        } else {
            showToast(result.error || "Checkout failed");
        }
      } catch (error) {
        showToast("Server error during checkout");
      } finally {
        setIsCheckingOut(false);
      }
    };
  
    if (cart.length === 0) {
      return (
        <div className="pt-40 pb-24 px-6 text-center max-w-2xl mx-auto">
          <div className="w-24 h-24 bg-brand-onyx/5 rounded-full flex items-center justify-center text-brand-slate mx-auto mb-10">
            <ShoppingBag size={40} />
          </div>
          <h1 className="text-4xl font-serif font-bold mb-6">Your bag is empty.</h1>
          <p className="text-brand-slate mb-12 font-light leading-relaxed text-lg">
            Beautiful spaces start with a single piece. Explore our curated collections to find yours.
          </p>
          <Link to="/collections" className="bg-brand-onyx text-white px-12 py-5 rounded-full font-bold hover:bg-brand-copper transition-all shadow-xl inline-block">
            Start Shopping
          </Link>
        </div>
      );
    }
  
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="pt-24 sm:pt-40 pb-24 px-4 sm:px-6 max-w-7xl mx-auto"
      >
        <h1 className="text-4xl sm:text-7xl font-serif font-bold mb-12 sm:mb-20">Shopping Bag</h1>
  
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 sm:gap-16">
          <div className="lg:col-span-2 space-y-8 sm:space-y-12">
            <AnimatePresence mode="popLayout">
              {cartProducts.map((item) => (
                <motion.div 
                  layout
                  key={`${item.productId}-${item.assembly}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="flex flex-col sm:flex-row gap-6 sm:gap-10 pb-8 sm:pb-12 border-b border-brand-onyx/10 group"
                >
                  <Link to={`/product/${item.product.id}`} className="block relative aspect-square w-full sm:w-48 rounded-3xl overflow-hidden bg-brand-onyx/5 shrink-0">
                    <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
                  </Link>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.2em] font-black text-brand-copper mb-1">{item.product.category}</p>
                            <h3 className="text-2xl font-serif font-bold text-brand-onyx">{item.product.name}</h3>
                        </div>
                        <p className="text-xl font-black">₦{(item.product.price * item.quantity).toLocaleString()}</p>
                    </div>
                    <div className="space-y-3 mb-8">
                        <p className="text-xs text-brand-slate flex items-center space-x-2">
                            <ShieldCheck size={14} className="text-brand-copper" />
                            <span>Condition: Pristine Handcrafted</span>
                        </p>
                        {item.assembly && (
                            <p className="text-xs text-brand-copper flex items-center space-x-2 font-bold">
                                <Sparkles size={14} />
                                <span>Assembly service included (+₦{(item.product.assemblyCost || 0).toLocaleString()})</span>
                            </p>
                        )}
                        <p className="text-xs text-brand-slate flex items-center space-x-2 font-bold">
                            <Truck size={14} />
                            <span>Logistics: White-Glove Delivery</span>
                        </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 border border-brand-onyx/10 rounded-full px-4 py-2">
                        <button onClick={() => addToCart(item.productId, -1, item.assembly)} className="p-1 hover:text-brand-copper"><Minus size={14}/></button>
                        <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                        <button onClick={() => addToCart(item.productId, 1, item.assembly)} className="p-1 hover:text-brand-copper"><Plus size={14}/></button>
                      </div>
                      <button onClick={() => removeFromCart(item.productId)} className="text-brand-slate hover:text-red-500 transition-colors flex items-center space-x-2">
                        <Trash2 size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest leading-none">Remove</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
  
          <div className="lg:col-span-1">
            <div className="bg-brand-onyx text-white p-10 sm:p-12 rounded-[3.5rem] shadow-2xl sticky top-32 lg:translate-x-4">
              <h2 className="text-2xl font-serif font-bold mb-10">Order Summary</h2>
              <div className="space-y-6 text-sm mb-10 font-light border-b border-white/10 pb-10">
                <div className="flex justify-between">
                  <span className="text-white/50">Subtotal</span>
                  <span className="font-bold">₦{subtotal.toLocaleString()}</span>
                </div>
                {assemblyTotal > 0 && (
                  <div className="flex justify-between">
                    <span className="text-white/50">Assembly Fees</span>
                    <span className="font-bold text-brand-copper">+₦{assemblyTotal.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-white/50">Logistics & Delivery</span>
                  <span className="font-bold">{delivery === 0 ? 'Complimentary' : `₦${delivery.toLocaleString()}`}</span>
                </div>
              </div>
              <div className="flex justify-between items-end mb-12">
                <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-2">Total Amount</h3>
                    <p className="text-4xl font-serif font-bold">₦{total.toLocaleString()}</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] uppercase font-black tracking-widest text-brand-copper mb-2">Escrow Protected</p>
                    <div className="flex justify-end gap-1">
                        {[1, 2, 3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-brand-copper/30" />)}
                    </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <button 
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full bg-brand-copper text-white py-5 rounded-full font-bold hover:bg-white hover:text-brand-onyx transition-all duration-700 shadow-xl flex items-center justify-center space-x-3 disabled:opacity-50"
                >
                  {isCheckingOut ? (
                    <span className="animate-pulse">Processing Order...</span>
                  ) : (
                    <>
                      <span>Secure Checkout</span>
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
                <div className="flex items-center justify-center space-x-2 text-[8px] font-black uppercase tracking-[0.2em] text-white/30">
                  <ShieldCheck size={12} />
                  <span>Verified Escrow via Paystack</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

export default Cart;
