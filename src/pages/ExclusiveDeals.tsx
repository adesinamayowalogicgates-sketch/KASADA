import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { PRODUCTS } from '../constants';

const ExclusiveDeals: React.FC = () => {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="pt-24 sm:pt-40 pb-24 px-6 max-w-7xl mx-auto"
      >
        <div className="mb-20 text-center">
            <span className="text-brand-copper uppercase tracking-[0.4em] text-[10px] font-black mb-6 block">Limited Opportunity</span>
            <h1 className="text-5xl md:text-8xl font-serif font-bold mb-8 italic">Curated Deals.</h1>
            <p className="max-w-2xl mx-auto text-xl text-brand-slate font-light leading-relaxed">
              Exceptional artisanal pieces at unprecedented value. These offers are strictly time-bound and available exclusively for our registered members.
            </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-24 gap-x-12">
          {PRODUCTS.slice(4, 9).map((product) => (
            <div key={product.id} className="relative">
              <div className="absolute -top-12 left-6 z-10 bg-brand-onyx text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 border border-white/10">
                <Sparkles className="text-brand-copper" size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest leading-none">20% Flash Discount</span>
              </div>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
  
        <div className="mt-40 bg-brand-alabaster rounded-[3rem] p-16 sm:p-24 flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="max-w-xl">
                <h2 className="text-4xl font-serif font-bold mb-6">Never miss a masterpiece.</h2>
                <p className="text-brand-slate font-light mb-8">Join our inner circle to receive WhatsApp notifications whenever a new limited-edition deal drops from our master artisans.</p>
                <button className="flex items-center space-x-4 text-[10px] font-black uppercase tracking-widest text-brand-copper hover:text-brand-onyx transition-colors">
                    <span>Join the Notification Circle</span>
                    <ArrowRight size={16} />
                </button>
            </div>
            <div className="w-full lg:w-1/3 aspect-video bg-brand-onyx rounded-3xl flex items-center justify-center p-12 text-center text-white relative group overflow-hidden">
                <div className="absolute inset-0 bg-brand-copper/10 group-hover:scale-150 transition-transform duration-1000"></div>
                <div className="relative z-10">
                    <p className="text-4xl font-serif font-bold mb-2">Private Sale</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/50 italic">Every Last Friday</p>
                </div>
            </div>
        </div>
      </motion.div>
    );
  };

export default ExclusiveDeals;
