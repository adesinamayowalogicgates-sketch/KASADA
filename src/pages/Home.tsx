import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Smartphone, Box } from 'lucide-react';
import { Hero } from '../components/Hero';
import { BundleCard } from '../components/BundleCard';
import { DealsCarousel } from '../components/DealsCarousel';
import { ProductCard } from '../components/ProductCard';
import { BUNDLES, PRODUCTS, CATEGORIES } from '../constants';

const Home: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Hero />
      
      {/* 3D Reality Feature Callout */}
      <section className="py-12 bg-brand-copper/5 border-y border-brand-copper/10 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-copper/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
              <div className="w-20 h-20 rounded-[2rem] bg-brand-onyx flex items-center justify-center text-brand-copper shadow-2xl rotate-3 shrink-0">
                <Smartphone size={32} />
              </div>
              <div className="max-w-xl">
                <div className="flex items-center justify-center md:justify-start space-x-3 mb-2">
                  <span className="text-brand-onyx uppercase tracking-[0.4em] text-[10px] font-black">Next Gen Shopping</span>
                  <div className="h-[1px] w-8 bg-brand-copper/30"></div>
                </div>
                <h3 className="text-3xl md:text-4xl font-serif font-bold text-brand-onyx mb-3">Visual Reality 3D</h3>
                <p className="text-brand-slate text-base font-light leading-relaxed">
                  Bridge the gap between vision and reality. See our artisanal masterpieces in your own space using state-of-the-art AR technology. 
                </p>
              </div>
            </div>
            <Link 
              to="/room-visualizer" 
              className="group bg-brand-onyx text-white px-10 py-5 rounded-full font-bold flex items-center space-x-4 hover:bg-brand-copper transition-all duration-500 shadow-xl whitespace-nowrap"
            >
              <span>Launch AR Experience</span>
              <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Bundles Section */}
      <section className="py-20 md:py-32 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-20 gap-8">
          <div>
            <span className="text-brand-copper uppercase tracking-[0.4em] text-[10px] font-black mb-4 block">Curated Sets</span>
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-serif font-bold">Room Bundles</h2>
            <p className="text-brand-slate mt-6 max-w-xl text-lg font-light">
              Expertly curated furniture sets designed to transform your space in one click, at a fraction of the cost.
            </p>
          </div>
          <Link to="/bundles" className="group flex items-center space-x-4 text-[10px] font-black uppercase tracking-[0.2em] hover:text-brand-copper transition-colors">
            <span>Explore All Bundles</span>
            <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {BUNDLES.map((bundle) => (
            <BundleCard key={bundle.id} bundle={bundle} />
          ))}
        </div>
      </section>
      
      {/* Value Prop Section / Deals Carousel */}
      <section className="py-20 md:py-32 px-6 bg-brand-onyx text-brand-alabaster overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div className="relative h-[400px] sm:h-[500px] lg:h-[600px] flex items-center justify-center">
            <DealsCarousel />
          </div>
          
          <div>
            <span className="text-brand-copper uppercase tracking-[0.4em] text-[10px] font-black mb-8 block">Limited Time Offers</span>
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-serif font-bold mb-12 leading-tight">
              Exclusive Deals <br /> on Masterpieces.
            </h2>
            <div className="space-y-10 sm:space-y-12">
              {[
                { title: 'Curated Discounts', desc: 'Handpicked items from our top artisans at exceptional prices.', icon: <Star /> },
                { title: 'Flash Sales', desc: 'New deals added weekly. Don\'t miss out on these limited editions.', icon: <Smartphone /> },
                { title: 'Trade Benefits', desc: 'Extra savings for our B2B partners and interior designers.', icon: <Box /> }
              ].map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.2 }}
                  className="flex items-start space-x-6"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/5 flex items-center justify-center text-brand-copper shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-lg sm:text-xl font-serif font-bold mb-2">{item.title}</h4>
                    <p className="text-white/50 text-sm sm:text-base font-light leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <Link 
              to="/deals"
              className="mt-12 sm:mt-16 inline-flex items-center space-x-4 bg-brand-copper text-white px-8 sm:px-10 py-4 rounded-full font-bold hover:bg-white hover:text-brand-onyx transition-all duration-500"
            >
              <span>View All Deals</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 md:py-32 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-20 gap-8">
          <div>
            <span className="text-brand-copper uppercase tracking-[0.4em] text-[10px] font-black mb-4 block">The Collection</span>
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-serif font-bold">New Arrivals</h2>
          </div>
          <Link to="/collections" className="group flex items-center space-x-4 text-[10px] font-black uppercase tracking-[0.2em] hover:text-brand-copper transition-colors">
            <span>View Full Catalog</span>
            <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 md:gap-x-12 gap-y-16 md:gap-y-24">
          {PRODUCTS.slice(0, 6).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 md:py-32 px-6 bg-brand-alabaster">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 md:mb-16">
            <span className="text-brand-copper uppercase tracking-[0.4em] text-[10px] font-black mb-4 block">Categories</span>
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-serif font-bold">Shop by Room</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CATEGORIES.map((cat) => (
              <Link 
                key={cat.id}
                to={`/collections?category=${cat.name}`}
                className="group relative aspect-[3/4] rounded-2xl overflow-hidden"
              >
                <img 
                  src={cat.image} 
                  alt={cat.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 bg-brand-onyx/5"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-onyx/80 via-transparent to-transparent flex flex-col justify-end p-6 sm:p-8">
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mb-2">{cat.name}</h3>
                  <p className="text-white/60 text-[10px] sm:text-xs font-light opacity-0 group-hover:opacity-100 transition-all duration-500">{cat.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* B2B Section */}
      <section className="py-20 md:py-32 bg-brand-onyx text-brand-alabaster">
        <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          <div className="lg:w-1/2">
            <span className="text-brand-copper uppercase tracking-[0.4em] text-[10px] font-black mb-8 block">KASADA for Business</span>
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-serif font-bold mb-8 leading-tight">
              Designing for <br /> Scale.
            </h2>
            <p className="text-white/50 text-lg sm:text-xl font-light mb-12 leading-relaxed">
              Are you an interior designer, hotelier, or Airbnb host? 
              Access trade pricing, bulk order management, and dedicated project support.
            </p>
            <Link 
              to="/b2b"
              className="inline-block bg-brand-alabaster text-brand-onyx px-10 sm:px-12 py-4 sm:py-5 rounded-full font-bold hover:bg-brand-copper hover:text-white transition-all duration-500"
            >
              Apply for Trade Account
            </Link>
          </div>
          <div className="lg:w-1/2 grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop" className="rounded-2xl aspect-[4/5] object-cover" referrerPolicy="no-referrer" alt="B2B Office 1" />
              <img src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=2069&auto=format&fit=crop" className="rounded-2xl aspect-square object-cover" referrerPolicy="no-referrer" alt="B2B Office 2" />
            </div>
            <div className="space-y-4 pt-8 sm:pt-12">
              <img src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=2069&auto=format&fit=crop" className="rounded-2xl aspect-square object-cover" referrerPolicy="no-referrer" alt="B2B Office 3" />
              <img src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=2070&auto=format&fit=crop" className="rounded-2xl aspect-[4/5] object-cover" referrerPolicy="no-referrer" alt="B2B Office 4" />
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default Home;
