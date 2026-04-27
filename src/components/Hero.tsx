import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

export const Hero: React.FC = () => {
    return (
      <section className="relative min-h-[90vh] flex items-center pt-24 sm:pt-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "circOut" }}
          >
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-8 h-8 rounded-full bg-brand-copper/10 flex items-center justify-center text-brand-copper">
                <Sparkles size={16} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-copper">The Afro-Modern Standard</span>
            </div>
            
            <h1 className="text-6xl sm:text-7xl md:text-9xl font-serif font-black mb-10 leading-[0.85] tracking-tighter text-brand-onyx">
              Artisanal <br /> Heritage. <br /> <span className="text-brand-slate/20">Modern Life.</span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-brand-slate font-light leading-relaxed max-w-lg mb-12">
              Bespoke furniture handcrafted by Nigeria's master artisans, delivered with white-glove precision.
            </p>
  
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Link 
                to="/collections" 
                className="w-full sm:w-auto bg-brand-onyx text-white px-10 py-5 rounded-full font-bold text-center hover:bg-brand-copper transition-all duration-500 shadow-xl"
              >
                Shop the Collection
              </Link>
              <Link 
                to="/bespoke" 
                className="group flex items-center space-x-4 text-[10px] font-black uppercase tracking-[0.3em] hover:text-brand-copper transition-colors"
              >
                <span>Bespoke Portal</span>
                <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>
          </motion.div>
  
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "circOut" }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-[4rem] overflow-hidden shadow-2xl relative">
              <img 
                src="https://i.imgur.com/lVJaYQ8.jpg" 
                alt="Luxury Nigerian Interior" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-brand-copper/5 mix-blend-multiply"></div>
            </div>
            
            {/* Floating stats */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1 }}
              className="absolute -bottom-8 -left-8 bg-white p-8 rounded-[2.5rem] shadow-2xl border border-brand-onyx/5 hidden md:block"
            >
              <p className="text-3xl font-serif font-black text-brand-onyx mb-1">500+</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-brand-slate">Partner Artisans</p>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Background Decorative Element */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-alabaster/50 -skew-x-12 translate-x-1/2 pointer-events-none"></div>
      </section>
    );
  };
