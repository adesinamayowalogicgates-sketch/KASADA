import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smartphone, Camera, X, RefreshCw, Box, Layers, Sparkles } from 'lucide-react';
import { PRODUCTS } from '../constants';
import { cn } from '../lib/utils';

export const ARVisualizer: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [selectedProductIdx, setSelectedProductIdx] = useState(0);
  const [instructionStep, setInstructionStep] = useState(0);

  const products = PRODUCTS.slice(0, 5); // Use first 5 products for trial

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    setIsInitializing(true);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setHasPermission(true);
      
      // Sequence instructions
      setTimeout(() => setInstructionStep(1), 2000);
      setTimeout(() => setInstructionStep(2), 5000);
    } catch (err) {
      console.error("Camera access error:", err);
      setHasPermission(false);
    } finally {
      setIsInitializing(false);
    }
  };

  const nextProduct = () => {
    setSelectedProductIdx((prev) => (prev + 1) % products.length);
  };

  if (hasPermission === false) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center bg-brand-onyx/5 rounded-[3rem] border border-brand-onyx/10">
        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
          <Camera size={32} />
        </div>
        <h2 className="text-2xl font-serif font-bold mb-4">Camera Access Required</h2>
        <p className="text-brand-slate max-w-md mb-8">
          To visualize furniture in your space, we need access to your camera. Please enable camera permissions in your browser settings.
        </p>
        <button 
          onClick={startCamera}
          className="bg-brand-onyx text-white px-8 py-4 rounded-full font-bold hover:bg-brand-copper transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video md:aspect-[16/9] bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-brand-onyx">
      {/* Video Stream */}
      <video 
        ref={videoRef}
        autoPlay 
        playsInline 
        className="w-full h-full object-cover grayscale-[20%] contrast-[110%]"
      />

      {/* Overlay Filter */}
      <div className="absolute inset-0 bg-blue-500/5 mix-blend-overlay"></div>

      {/* HUD Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Scanning Reticle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-64 h-64 border border-brand-copper/50 rounded-full flex items-center justify-center"
          >
            <div className="w-1 h-1 bg-brand-copper rounded-full"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-4 bg-brand-copper"></div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1px] h-4 bg-brand-copper"></div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-[1px] bg-brand-copper"></div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-[1px] bg-brand-copper"></div>
          </motion.div>
        </div>

        {/* Battery/Status HUD */}
        <div className="absolute top-6 left-6 right-6 flex justify-between">
          <div className="flex items-center space-x-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] text-white font-black uppercase tracking-widest leading-none">AR Engine v1.0.4</span>
          </div>
          <div className="flex items-center space-x-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
            <span className="text-[10px] text-white font-black uppercase tracking-widest leading-none">GPS LOCK: NGR.LGS</span>
          </div>
        </div>

        {/* Instructions Overlay */}
        <AnimatePresence mode="wait">
          {instructionStep < 3 && (
            <motion.div 
              key={instructionStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute bottom-32 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-xl border border-white/10 p-6 rounded-3xl text-center min-w-[300px]"
            >
              {instructionStep === 0 && (
                <div className="flex flex-col items-center space-y-3">
                  <Smartphone className="text-brand-copper animate-bounce" size={24} />
                  <p className="text-white text-xs font-bold uppercase tracking-widest">Slowly scan your room</p>
                </div>
              )}
              {instructionStep === 1 && (
                <div className="flex flex-col items-center space-y-3">
                  <Box className="text-brand-copper" size={24} />
                  <p className="text-white text-xs font-bold uppercase tracking-widest">Surface detected. Placing piece...</p>
                </div>
              )}
              {instructionStep === 2 && (
                <div className="flex flex-col items-center space-y-3">
                  <Sparkles className="text-brand-copper" size={24} />
                  <p className="text-white text-xs font-bold uppercase tracking-widest">Masterpiece anchored. Walk around it.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Furniture Model (Mock Layer) */}
      {instructionStep >= 2 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div 
            initial={{ opacity: 0, scale: 0.6, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 40 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            style={{ perspective: "1000px" }}
            className="w-[70%] max-w-sm relative"
          >
            {/* The Furniture Image */}
            <motion.img 
              src={products[selectedProductIdx].images[0]} 
              alt="AR Model" 
              animate={{ 
                rotateY: [0, 5, 0, -5, 0],
                rotateX: [0, 2, 0, -2, 0],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              className="w-full rounded-2xl shadow-[0_50px_100px_rgba(0,0,0,0.6)]"
              style={{ transformStyle: "preserve-3d" }}
              referrerPolicy="no-referrer"
            />
            
            {/* Perspective Shadow Overlay */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[90%] h-12 bg-black/50 blur-[40px] rounded-[100%]"></div>
          </motion.div>
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-8 left-0 right-0 px-8 flex items-center justify-between pointer-events-auto">
        <button 
          onClick={() => window.history.back()}
          className="w-14 h-14 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center text-white transition-all order-1"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col items-center order-2">
          <div className="flex space-x-2 mb-4">
            {products.map((_, idx) => (
              <div 
                key={idx} 
                className={cn(
                  "w-1 h-1 rounded-full transition-all duration-300",
                  selectedProductIdx === idx ? "w-4 bg-brand-copper" : "bg-white/30"
                )}
              ></div>
            ))}
          </div>
          <button 
            onClick={nextProduct}
            className="bg-brand-copper text-white px-10 py-5 rounded-full font-bold flex items-center space-x-4 shadow-2xl hover:scale-105 active:scale-95 transition-all"
          >
            <RefreshCw size={18} />
            <span className="uppercase tracking-widest text-[10px]">Switch Masterpiece</span>
          </button>
        </div>

        <button 
          className="w-14 h-14 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center text-white transition-all order-3"
        >
          <Layers size={24} />
        </button>
      </div>

      {/* Initializing State */}
      <AnimatePresence>
        {isInitializing && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-brand-onyx flex flex-col items-center justify-center z-50 px-10 text-center"
          >
            <div className="w-16 h-16 border-4 border-brand-copper/30 border-t-brand-copper rounded-full animate-spin mb-8"></div>
            <p className="text-white text-sm font-black uppercase tracking-[0.5em] animate-pulse">Initializing Neural Engine</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
