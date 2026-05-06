import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Heart, Star, ShieldCheck } from 'lucide-react';
import { Product } from '../types';
import { useWishlist } from '../contexts/WishlistContext';
import { cn } from '../lib/utils';
import { useCart } from '../contexts/CartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { toggleWishlist, isLiked } = useWishlist();
  const { addToCart } = useCart();
  const liked = isLiked(product.id);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group"
    >
      <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden mb-6 bg-brand-onyx/5">
        <img 
          src={product.images[0]} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        
        <div className="absolute top-6 left-6 flex flex-col space-y-2">
          {product.isMadeInNigeria && (
            <div className="bg-brand-alabaster/90 backdrop-blur-md px-4 py-1.5 rounded-full shadow-sm">
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-brand-onyx">Handcrafted</span>
            </div>
          )}
          {product.isEscrowProtected && (
            <div className="bg-green-500/90 backdrop-blur-md px-4 py-1.5 rounded-full shadow-sm flex items-center space-x-2 text-white">
              <ShieldCheck size={10} />
              <span className="text-[8px] font-black uppercase tracking-[0.2em]">Verified</span>
            </div>
          )}
        </div>

        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={cn(
            "absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 z-10 active:scale-90",
            liked ? "bg-brand-copper text-white" : "bg-white/90 backdrop-blur-md text-brand-onyx hover:bg-brand-onyx hover:text-white"
          )}
        >
          <Heart size={18} className={liked ? "fill-white" : ""} />
        </button>

        <div className="absolute inset-x-6 bottom-6 flex space-x-3 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-500">
          <Link 
            to={`/product/${product.id}`}
            className="flex-grow bg-white text-brand-onyx py-3 rounded-full font-bold text-xs text-center hover:bg-brand-copper hover:text-white transition-all transform translate-y-0 sm:translate-y-4 sm:group-hover:translate-y-0 active:scale-95 duration-500 delay-75"
          >
            Quick View
          </Link>
          <button 
            onClick={() => addToCart(product.id, 1, false)}
            className="w-12 h-12 bg-white text-brand-onyx rounded-full flex items-center justify-center hover:bg-brand-onyx hover:text-white transition-all transform translate-y-0 sm:translate-y-4 sm:group-hover:translate-y-0 active:scale-95 duration-500 delay-150"
          >
            +
          </button>
        </div>
      </div>

      <Link to={`/product/${product.id}`} className="block">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-serif font-bold text-brand-onyx group-hover:text-brand-copper transition-colors">{product.name}</h3>
          <p className="font-black text-brand-onyx">₦{product.price.toLocaleString()}</p>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-slate/60">{product.category}</span>
          <div className="flex items-center space-x-1">
            <Star size={10} className="text-brand-copper fill-brand-copper" />
            <span className="text-[10px] font-bold text-brand-onyx">{product.seller.rating}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
