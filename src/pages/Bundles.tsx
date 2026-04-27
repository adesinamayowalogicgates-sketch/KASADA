import React from 'react';
import { motion } from 'motion/react';
import { BundleCard } from '../components/BundleCard';
import { BUNDLES } from '../constants';

const Bundles: React.FC = () => {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="pt-24 sm:pt-40 pb-24 px-4 sm:px-6 max-w-7xl mx-auto"
      >
        <div className="mb-16 sm:mb-24 text-center">
            <span className="text-brand-copper uppercase tracking-[0.4em] text-[10px] font-black mb-6 block">Curated Living</span>
            <h1 className="text-5xl md:text-8xl font-serif font-bold mb-8">Room Bundles</h1>
            <p className="max-w-2xl mx-auto text-lg sm:text-xl text-brand-slate font-light leading-relaxed">
              Complete your space with designer-curated collections. Each bundle is carefully selected to ensure material harmony and functional perfection, while offering significant savings.
            </p>
        </div>
  
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12">
          {BUNDLES.map((bundle) => (
            <BundleCard key={bundle.id} bundle={bundle} />
          ))}
        </div>
  
        <div className="mt-32 p-16 sm:p-24 bg-brand-onyx rounded-[3rem] text-center text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-brand-copper/5 -skew-y-3 translate-y-12"></div>
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-5xl font-serif font-bold mb-8">Need a Custom Bundle?</h2>
            <p className="text-white/50 max-w-xl mx-auto font-light leading-relaxed mb-12">
              Building a large project or outfitting a whole home? Our consultants can help you mix and match pieces to create your perfect corporate or hospitality package.
            </p>
            <button className="bg-brand-copper text-white px-12 py-5 rounded-full font-bold hover:bg-white hover:text-brand-onyx transition-all duration-500 shadow-2xl">
              Talk to a Designer
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

export default Bundles;
