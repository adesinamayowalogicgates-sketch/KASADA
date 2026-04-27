import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle2, ArrowRight, Package, Smartphone } from 'lucide-react';

const OrderSuccess: React.FC = () => {
    const location = useLocation();
    const orderId = new URLSearchParams(location.search).get('id');
  
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen pt-40 pb-24 px-6 flex items-center justify-center bg-brand-alabaster overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-copper/5 -skew-x-12 translate-x-1/2" />
        <div className="max-w-2xl w-full bg-white p-12 sm:p-20 rounded-[4rem] shadow-2xl relative z-10 text-center border border-brand-onyx/5">
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center text-green-500 mx-auto mb-10 shadow-lg">
            <CheckCircle2 size={48} />
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold mb-6">Masterpiece Secured.</h1>
          <p className="text-brand-slate font-light leading-relaxed mb-12 text-lg">
            Your heritage collection has been registered. Our master artisans are preparing your order 
            for white-glove delivery across Nigeria.
          </p>
  
          <div className="bg-brand-onyx/5 p-8 rounded-3xl mb-12 text-left">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-slate">Order Signature</span>
              <span className="font-mono text-xs font-bold text-brand-onyx">#{orderId || 'KSD-10293'}</span>
            </div>
            <div className="flex items-center space-x-4 text-brand-copper">
                <Package size={20} />
                <span className="text-sm font-bold">Estimated Delivery: 7-14 Business Days</span>
            </div>
          </div>
  
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link 
              to="/orders"
              className="bg-brand-onyx text-white py-5 rounded-full font-bold hover:bg-brand-copper transition-all shadow-xl flex items-center justify-center space-x-3"
            >
              <span>Track Order</span>
              <ArrowRight size={18} />
            </Link>
            <Link 
              to="/collections"
              className="border border-brand-onyx/10 text-brand-onyx py-5 rounded-full font-bold hover:bg-brand-onyx/5 transition-all flex items-center justify-center space-x-3"
            >
              <Smartphone size={18} />
              <span>Back to Registry</span>
            </Link>
          </div>
        </div>
      </motion.div>
    );
  };
  
export default OrderSuccess;
