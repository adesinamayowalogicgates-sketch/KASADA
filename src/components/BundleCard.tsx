import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Bundle } from '../types';
import { PRODUCTS } from '../constants';

interface BundleCardProps {
  bundle: Bundle;
}

export const BundleCard: React.FC<BundleCardProps> = ({ bundle }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="group"
      >
        <Link to={`/bundles/${bundle.id}`}>
          <div className="relative aspect-video rounded-[2.5rem] overflow-hidden mb-8 bg-brand-onyx/5">
            <img 
              src={bundle.image} 
              alt={bundle.name} 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-6 left-6 flex space-x-2">
              <div className="bg-brand-onyx/80 backdrop-blur-md px-4 py-2 rounded-full text-white text-[8px] font-black uppercase tracking-widest">
                Save 15%
              </div>
            </div>
          </div>
          
          <div className="px-2">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-brand-copper uppercase tracking-[0.2em] text-[8px] font-black mb-1 block">{bundle.category}</span>
                <h3 className="text-2xl font-serif font-bold text-brand-onyx group-hover:text-brand-copper transition-colors">{bundle.name}</h3>
              </div>
              <div className="text-right">
                <p className="text-xs text-brand-slate line-through mb-1">₦{bundle.price.toLocaleString()}</p>
                <p className="text-xl font-black text-brand-onyx">₦{bundle.discountPrice.toLocaleString()}</p>
              </div>
            </div>
            <p className="text-brand-slate text-sm font-light leading-relaxed mb-8 line-clamp-2">
              {bundle.description}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex -space-x-3">
                {bundle.productIds.slice(0, 3).map((pid, idx) => {
                  const p = PRODUCTS.find(prod => prod.id === pid);
                  return p ? (
                    <div key={idx} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-brand-onyx/5">
                      <img src={p.images[0]} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  ) : null;
                })}
                {bundle.productIds.length > 3 && (
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-brand-onyx/10 flex items-center justify-center text-[10px] font-bold text-brand-onyx">
                    +{bundle.productIds.length - 3}
                  </div>
                )}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest flex items-center space-x-2 group-hover:text-brand-copper transition-colors">
                <span>View Bundle</span>
                <ArrowRight size={14} />
              </span>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  };
