import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Box, Smartphone } from 'lucide-react';

interface PrototypePageProps {
  title: string;
  description: string;
  content?: React.ReactNode;
}

export const PrototypePage: React.FC<PrototypePageProps> = ({ title, description, content }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="pt-40 pb-24 px-6 max-w-7xl mx-auto"
    >
      <div className="max-w-4xl mx-auto text-center mb-24">
        <h1 className="text-5xl md:text-8xl font-serif font-bold mb-8 leading-tight">{title}</h1>
        <p className="text-xl text-brand-slate font-light leading-relaxed">
          {description}
        </p>
      </div>

      {content ? (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
          {content}
        </div>
      ) : (
        <div className="max-w-5xl mx-auto">
          <div className="p-12 md:p-24 border border-brand-onyx/10 rounded-[3rem] bg-brand-onyx/5 relative overflow-hidden text-center mb-16">
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-copper/5 via-transparent to-brand-onyx/5"></div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center space-x-3 bg-brand-copper/10 px-6 py-2 rounded-full mb-8">
                <div className="w-2 h-2 bg-brand-copper rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-copper">Engine Initializing</span>
              </div>
              
              <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6">Neural Rendering in Progress</h2>
              <p className="text-brand-onyx text-xl font-light mb-12 max-w-2xl mx-auto leading-relaxed">
                We are calibrating our spatial algorithms to perfectly render Nigerian mahogany and teak within your unique space.
              </p>
              
              <div className="w-full max-w-sm mx-auto h-1 bg-brand-onyx/10 rounded-full overflow-hidden mb-16">
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: "65%" }}
                  transition={{ duration: 4, ease: "easeInOut" }}
                  className="h-full bg-brand-copper"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                <div className="p-8 bg-white/60 backdrop-blur-md rounded-3xl shadow-sm border border-white/20">
                  <div className="w-10 h-10 bg-brand-copper/10 rounded-full flex items-center justify-center text-brand-copper mb-4">
                    <CheckCircle2 size={20} />
                  </div>
                  <h4 className="font-bold mb-2">LiDAR Mapping</h4>
                  <p className="text-xs text-brand-slate">Scanning environment depth for sub-millimeter precision.</p>
                </div>
                <div className="p-8 bg-white/60 backdrop-blur-md rounded-3xl shadow-sm border border-white/20">
                  <div className="w-10 h-10 bg-brand-onyx/10 rounded-full flex items-center justify-center text-brand-onyx mb-4">
                    <Box size={20} />
                  </div>
                  <h4 className="font-bold mb-2">PBR Materials</h4>
                  <p className="text-xs text-brand-slate">Physically Based Rendering of authentic wood grains.</p>
                </div>
                <div className="p-8 bg-white/60 backdrop-blur-md rounded-3xl shadow-sm border border-white/20">
                  <div className="w-10 h-10 bg-brand-onyx/10 rounded-full flex items-center justify-center text-brand-onyx mb-4">
                    <Smartphone size={20} />
                  </div>
                  <h4 className="font-bold mb-2">Global Lighting</h4>
                  <p className="text-xs text-brand-slate">Calculating real-time shadows and reflections.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="text-center mt-24">
        <Link to="/" className="inline-flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest text-brand-copper hover:text-brand-onyx transition-all group">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          <span>Return to Home</span>
        </Link>
      </div>
    </motion.div>
  );
};
