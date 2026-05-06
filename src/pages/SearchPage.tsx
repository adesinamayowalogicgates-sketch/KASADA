import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { PRODUCTS } from '../constants';
import { Product } from '../types';

const SearchPage: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialQuery = searchParams.get('q') || searchParams.get('designer') || '';
  
  const [query, setQuery] = useState(initialQuery);
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
                className="p-6 sm:p-8 bg-brand-onyx/5 rounded-3xl hover:bg-brand-onyx hover:text-white active:bg-brand-copper transition-all duration-500 text-center group active:scale-95"
              >
                <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-white transition-colors">{cat}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default SearchPage;
