import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center px-6 pt-24 pb-12"
    >
      <div className="max-w-xl w-full text-center">
        <div className="mb-12">
          <span className="text-brand-copper uppercase tracking-[0.4em] text-[10px] font-black mb-6 block">Error 404</span>
          <h1 className="text-6xl md:text-8xl font-serif font-bold mb-8 italic">Misplaced.</h1>
          <p className="text-xl text-brand-slate font-light leading-relaxed mb-12">
            The masterpiece you are looking for doesn't exist at this location. It may have been moved to a different collection.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link 
            to="/" 
            className="w-full sm:w-auto bg-brand-onyx text-white px-10 py-4 rounded-full font-bold hover:bg-brand-copper transition-all shadow-xl flex items-center justify-center space-x-3"
          >
            <ArrowLeft size={18} />
            <span>Return to Home</span>
          </Link>
          <Link 
            to="/search" 
            className="w-full sm:w-auto border border-brand-onyx/10 text-brand-onyx px-10 py-4 rounded-full font-bold hover:bg-brand-onyx/5 transition-all flex items-center justify-center space-x-3"
          >
            <Search size={18} />
            <span>Search Catalog</span>
          </Link>
        </div>

        <div className="mt-24 pt-12 border-t border-brand-onyx/5">
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-slate opacity-40 italic">"Good design is obvious. Great design is transparent." — Joe Sparano</p>
        </div>
      </div>
    </motion.div>
  );
};

export default NotFound;
