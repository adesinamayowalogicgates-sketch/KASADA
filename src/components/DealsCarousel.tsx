import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PRODUCTS } from '../constants';

export const DealsCarousel: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const deals = PRODUCTS.slice(0, 3);
  
    useEffect(() => {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % deals.length);
      }, 5000);
      return () => clearInterval(timer);
    }, [deals.length]);
  
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.9, rotateY: 45 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            exit={{ opacity: 0, scale: 1.1, rotateY: -45 }}
            transition={{ duration: 0.8, ease: "circOut" }}
            className="absolute inset-0"
          >
            <div className="relative h-full w-full group">
              <img 
                src={deals[currentIndex].images[0]} 
                alt={deals[currentIndex].name}
                className="w-full h-full object-cover rounded-[3rem] shadow-2xl grayscale group-hover:grayscale-0 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-onyx/80 via-transparent to-transparent flex flex-col justify-end p-12">
                <span className="text-brand-copper font-black text-[10px] uppercase tracking-[0.4em] mb-4">Limited Edition</span>
                <h3 className="text-3xl font-serif font-bold text-white mb-2">{deals[currentIndex].name}</h3>
                <div className="flex items-center space-x-4">
                  <span className="text-2xl font-black text-white">₦{deals[currentIndex].price.toLocaleString()}</span>
                  <Link 
                    to={`/product/${deals[currentIndex].id}`}
                    className="bg-white text-brand-onyx w-10 h-10 rounded-full flex items-center justify-center hover:bg-brand-copper hover:text-white transition-all duration-500"
                  >
                    <ShoppingBag size={18} />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
        
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex space-x-3">
          {deals.map((_, idx) => (
            <button 
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all duration-500 ${currentIndex === idx ? 'w-8 bg-brand-copper' : 'bg-white/20'}`}
            />
          ))}
        </div>
      </div>
    );
  };
