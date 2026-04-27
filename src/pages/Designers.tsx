import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { DESIGNERS } from '../constants';
import { cn } from '../lib/utils';

const Designers: React.FC = () => {
  const navigate = useNavigate();
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-40 pb-24"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-12">
          <div className="max-w-2xl">
            <span className="text-brand-copper uppercase tracking-[0.4em] text-[10px] font-black mb-6 block">The Collective</span>
            <h1 className="text-6xl md:text-8xl font-serif font-bold mb-8 leading-tight">Meet the <br/>Visionaries.</h1>
            <p className="text-xl text-brand-slate font-light leading-relaxed">
              KASADA is a home for the continent's most daring furniture designers. 
              We partner with artisans who bridge the gap between ancient heritage and modern luxury.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-32 h-32 rounded-full border border-brand-onyx/10 flex items-center justify-center p-4">
              <Sparkles className="text-brand-copper" size={48} />
            </div>
          </div>
        </div>

        <div className="space-y-40">
          {DESIGNERS.map((designer, idx) => (
            <motion.div 
              key={designer.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: idx * 0.2 }}
              className={cn(
                "flex flex-col gap-12 md:gap-24",
                idx % 2 === 1 ? "md:flex-row-reverse" : "md:flex-row"
              )}
            >
              <div className="flex-1">
                <div className="aspect-[3/4] overflow-hidden rounded-[3rem] shadow-2xl relative group">
                  <img 
                    src={designer.image} 
                    alt={designer.name} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-brand-onyx/20 group-hover:bg-brand-onyx/0 transition-colors duration-500" />
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-center">
                <div className="mb-12">
                  <div className="flex flex-wrap gap-3 mb-8">
                    {designer.styles.map(style => (
                      <span key={style} className="px-4 py-1.5 rounded-full border border-brand-onyx/10 text-[10px] uppercase font-black tracking-widest text-brand-slate">
                        {style}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-4xl md:text-6xl font-serif font-bold mb-8">{designer.name}</h2>
                  <p className="text-xl text-brand-slate font-light leading-relaxed mb-12">
                    {designer.bio}
                  </p>
                </div>

                <div className="bg-brand-onyx/5 p-12 rounded-[2.5rem]">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-brand-slate mb-8 pb-4 border-b border-brand-onyx/5">Notable Works</h3>
                  <div className="space-y-4">
                    {designer.notableWorks.map(work => (
                      <div key={work} className="flex items-center space-x-4">
                        <div className="w-2 h-2 rounded-full bg-brand-copper" />
                        <span className="text-lg font-serif italic text-brand-onyx">{work}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <button 
                  onClick={() => {
                    const searchParams = new URLSearchParams();
                    searchParams.set('designer', designer.name);
                    navigate(`/search?${searchParams.toString()}`);
                  }}
                  className="mt-12 group flex items-center space-x-4 text-brand-copper font-bold hover:text-brand-onyx transition-colors"
                >
                  <span>View Designer Portfolio</span>
                  <ArrowRight size={20} className="transition-transform group-hover:translate-x-2" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Designers;
