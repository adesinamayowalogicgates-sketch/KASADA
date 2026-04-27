import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const About: React.FC = () => {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="pt-24 sm:pt-32"
      >
        {/* Hero Section */}
        <section className="px-6 max-w-7xl mx-auto mb-24 md:mb-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <motion.span 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-brand-copper uppercase tracking-[0.4em] text-[10px] font-black mb-6 block"
              >
                Our Story
              </motion.span>
              <h1 className="text-5xl sm:text-7xl md:text-8xl font-serif font-black mb-8 leading-[0.9]">
                Born in Lagos. <br /> Built for the <br /> World.
              </h1>
              <p className="text-brand-slate text-lg sm:text-xl font-light leading-relaxed max-w-xl">
                KASADA began with a simple observation: Nigeria's artisans possess world-class talent, but lack the platform to reach modern, global audiences. We bridged that gap.
              </p>
            </div>
            <div className="relative aspect-square rounded-[3rem] overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1581539250439-c96689b516dd?q=80&w=1914&auto=format&fit=crop" 
                alt="Artisan at work" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-brand-copper/10 mix-blend-multiply"></div>
            </div>
          </div>
        </section>
  
        {/* Mission Section */}
        <section className="bg-brand-onyx text-brand-alabaster py-24 md:py-32 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-4xl sm:text-6xl font-serif font-bold mb-16">Our Mission</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                { title: 'Elevate Craft', desc: 'Preserving traditional techniques while infusing them with contemporary design language.' },
                { title: 'Empower Artisans', desc: 'Providing sustainable livelihoods and global exposure for local master craftsmen.' },
                { title: 'Define Luxury', desc: 'Creating a new standard of African luxury that is authentic, sustainable, and timeless.' }
              ].map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.2 }}
                  className="p-10 rounded-[2.5rem] bg-white/5 border border-white/10"
                >
                  <h3 className="text-2xl font-serif font-bold mb-4 text-brand-copper">{item.title}</h3>
                  <p className="text-white/50 font-light leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
  
        {/* The Process */}
        <section className="py-24 md:py-32 px-6 max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
            <div className="lg:w-1/2 order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-4">
                <img src="https://images.unsplash.com/photo-1540932239986-30128078f3c5?q=80&w=1974&auto=format&fit=crop" className="rounded-2xl aspect-square object-cover" referrerPolicy="no-referrer" alt="Woodwork 1" />
                <img src="https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?q=80&w=2070&auto=format&fit=crop" className="rounded-2xl aspect-[4/5] object-cover mt-8" referrerPolicy="no-referrer" alt="Woodwork 2" />
              </div>
            </div>
            <div className="lg:w-1/2 order-1 lg:order-2">
              <span className="text-brand-copper uppercase tracking-[0.4em] text-[10px] font-black mb-6 block">The Process</span>
              <h2 className="text-4xl sm:text-6xl font-serif font-bold mb-8">Slow Furniture. <br /> Fast Impact.</h2>
              <p className="text-brand-slate text-lg font-light leading-relaxed mb-10">
                Every KASADA piece is made to order. We don't believe in mass production. We believe in the soul of the material and the hands that shape it.
              </p>
              <ul className="space-y-6">
                {[
                  'Sustainably sourced Teak and Iroko wood.',
                  'Hand-rubbed natural oil finishes.',
                  'Traditional joinery without metal screws.',
                  'Rigorous 48-point quality inspection.'
                ].map(point => (
                  <li key={point} className="flex items-center space-x-4">
                    <div className="w-6 h-px bg-brand-copper"></div>
                    <span className="text-sm font-bold uppercase tracking-widest">{point}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-16">
                <Link to="/collections" className="bg-brand-onyx text-white px-10 py-5 rounded-full font-bold hover:bg-brand-copper transition-all shadow-xl">
                  Explore the Collection
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 md:py-32 bg-brand-alabaster">
            <div className="max-w-4xl mx-auto px-6 text-center">
                <h2 className="text-3xl font-serif font-black mb-8 leading-tight italic">"We are not just selling furniture; we are archiving Nigerian excellence."</h2>
                <div className="flex items-center justify-center space-x-4">
                    <span className="w-12 h-px bg-brand-onyx/20"></span>
                    <p className="text-xs font-black uppercase tracking-[0.2em]">The Founders of KASADA</p>
                    <span className="w-12 h-px bg-brand-onyx/20"></span>
                </div>
            </div>
        </section>
      </motion.div>
    );
  };

export default About;
