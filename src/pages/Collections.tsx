import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ProductCard } from '../components/ProductCard';
import { PRODUCTS } from '../constants';
import { cn } from '../lib/utils';

const Collections: React.FC = () => {
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
                  ? "bg-brand-onyx text-white active:scale-95" 
                  : "bg-brand-onyx/5 text-brand-slate hover:bg-brand-onyx/10 active:scale-95"
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
};

export default Collections;
