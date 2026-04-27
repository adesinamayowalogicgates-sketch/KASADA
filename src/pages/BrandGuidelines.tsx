import React from 'react';
import { motion } from 'motion/react';

const BrandGuidelines: React.FC = () => {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="pt-32 sm:pt-40 pb-24 px-4 sm:px-6 max-w-7xl mx-auto"
      >
        <div className="mb-20">
          <span className="text-brand-copper uppercase tracking-[0.4em] text-[10px] font-black mb-6 block">Identity System</span>
          <h1 className="text-5xl md:text-8xl font-serif font-bold mb-8">Brand <br/>Guidelines.</h1>
          <p className="text-xl text-brand-slate font-light leading-relaxed max-w-2xl">
            KASADA's visual identity is a balance between raw artisanal textures and refined modernist precision.
          </p>
        </div>
  
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 sm:gap-24">
          <section>
            <h2 className="text-2xl font-serif font-bold mb-12 pb-4 border-b border-brand-onyx/10">Color Palette</h2>
            <div className="grid grid-cols-2 gap-6">
              {[
                { name: 'Onyx', hex: '#111111', class: 'bg-brand-onyx', text: 'text-white' },
                { name: 'Copper', hex: '#C67B4A', class: 'bg-brand-copper', text: 'text-white' },
                { name: 'Alabaster', hex: '#F9F7F2', class: 'bg-brand-alabaster', text: 'text-brand-onyx' },
                { name: 'Slate', hex: '#4A4A4A', class: 'bg-brand-slate', text: 'text-white' }
              ].map(color => (
                <div key={color.name} className="space-y-4">
                  <div className={cn("aspect-square rounded-3xl p-6 flex flex-col justify-end", color.class, color.text)}>
                    <p className="font-bold text-lg">{color.name}</p>
                    <p className="text-[10px] uppercase font-black tracking-widest opacity-60">{color.hex}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
  
          <section>
            <h2 className="text-2xl font-serif font-bold mb-12 pb-4 border-b border-brand-onyx/10">Typography</h2>
            <div className="space-y-12">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-slate mb-4">Primary Serif</p>
                <p className="text-5xl font-serif font-bold mb-2">Playfair Display</p>
                <p className="text-sm text-brand-slate font-light">The voice of heritage and luxury. Used for headlines and emphasis.</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-slate mb-4">Interface Sans</p>
                <p className="text-5xl font-sans font-black tracking-tighter mb-2">Inter</p>
                <p className="text-sm text-brand-slate font-light">The voice of precision and utility. Used for navigation and core UI.</p>
              </div>
            </div>
          </section>
  
          <section className="lg:col-span-2">
            <h2 className="text-2xl font-serif font-bold mb-12 pb-4 border-b border-brand-onyx/10">Photography Style</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: 'The Macro View', desc: 'Focusing on the raw textures of Mahogany and Teak.', url: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?q=80&w=1974&auto=format&fit=crop' },
                { title: 'The Human Element', desc: 'Capturing the precision of the artisan\'s hands.', url: 'https://images.unsplash.com/photo-1581539250439-c96689b516dd?q=80&w=1914&auto=format&fit=crop' },
                { title: 'The Space', desc: 'Minimalist interiors that let the furniture speak.', url: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=2070&auto=format&fit=crop' }
              ].map(item => (
                <div key={item.title} className="group">
                  <div className="aspect-[4/3] rounded-[2rem] overflow-hidden mb-6">
                    <img src={item.url} alt={item.title} className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110" referrerPolicy="no-referrer" />
                  </div>
                  <h4 className="font-bold mb-2">{item.title}</h4>
                  <p className="text-xs text-brand-slate font-light leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </motion.div>
    );
  };

import { cn } from '../lib/utils';
export default BrandGuidelines;
