import React from 'react';
import { motion } from 'motion/react';
import { ARVisualizer } from '../components/ARVisualizer';
import { Smartphone, Sparkles, Box, ShieldCheck } from 'lucide-react';

const RoomVisualizer: React.FC = () => {
  return (
    <div className="pt-32 pb-24 px-6 max-w-7xl mx-auto min-h-screen">
      <div className="max-w-4xl mx-auto text-center mb-16 px-4">
        <div className="inline-flex items-center space-x-3 bg-brand-copper/10 px-6 py-2 rounded-full mb-8">
          <Sparkles size={16} className="text-brand-copper" />
          <span className="text-[10px] font-black uppercase tracking-widest text-brand-copper">KASADA Tech Labs</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6">Visual Reality 3D</h1>
        <p className="text-brand-slate text-lg font-light leading-relaxed max-w-2xl mx-auto">
          Experience our artisanal masterpieces in your own home. Using state-of-the-art neural rendering, we predict exactly how Nigerian hardwoods will interact with your space's actual lighting.
        </p>
      </div>

      {/* The Visualizer Component */}
      <div className="max-w-6xl mx-auto mb-20 px-4 md:px-0">
        <ARVisualizer />
      </div>

      {/* Technology Callouts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <div className="p-10 bg-brand-onyx/5 rounded-[2.5rem] border border-brand-onyx/5 hover:border-brand-copper/20 transition-all group">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-onyx mb-6 shadow-sm group-hover:bg-brand-copper group-hover:text-white transition-all">
            <Smartphone size={24} />
          </div>
          <h3 className="font-serif text-xl font-bold mb-3">LiDAR Depth Mapping</h3>
          <p className="text-sm text-brand-slate font-light leading-relaxed">
            Uses your device's infrared sensors to scan room dimensions and surface heights with sub-millimeter precision.
          </p>
        </div>

        <div className="p-10 bg-brand-onyx/5 rounded-[2.5rem] border border-brand-onyx/5 hover:border-brand-copper/20 transition-all group">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-onyx mb-6 shadow-sm group-hover:bg-brand-copper group-hover:text-white transition-all">
            <Box size={24} />
          </div>
          <h3 className="font-serif text-xl font-bold mb-3">PBR Materials</h3>
          <p className="text-sm text-brand-slate font-light leading-relaxed">
            Physically Based Rendering ensures mahogany, teak, and cane textures reflect light exactly as they do in our workshops.
          </p>
        </div>

        <div className="p-10 bg-brand-onyx/5 rounded-[2.5rem] border border-brand-onyx/5 hover:border-brand-copper/20 transition-all group">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-onyx mb-6 shadow-sm group-hover:bg-brand-copper group-hover:text-white transition-all">
            <ShieldCheck size={24} />
          </div>
          <h3 className="font-serif text-xl font-bold mb-3">Privacy First</h3>
          <p className="text-sm text-brand-slate font-light leading-relaxed">
            All spatial processing occurs directly on your device. KASADA never stores or transmits image data of your private home.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoomVisualizer;
