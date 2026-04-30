import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smartphone, Camera, X, RefreshCw, Box, Layers, Sparkles, BoxSelect } from 'lucide-react';
import { PRODUCTS } from '../constants';
import { cn } from '../lib/utils';
import '@google/model-viewer';

export const ARVisualizer: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [selectedProductIdx, setSelectedProductIdx] = useState(0);
  const [instructionStep, setInstructionStep] = useState(0);
  const [showHUD, setShowHUD] = useState(true);

  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const products = PRODUCTS.slice(0, 5); // Use first 5 products for trial

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    setIsInitializing(true);
    try {
      // Try with environment first (good for mobile AR)
      let mediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
      } catch (e) {
        // Fallback to any available video source (good for desktops or devices without environment camera)
        console.warn("Front camera fallback:", e);
        mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: true 
        });
      }

      setStream(mediaStream);
      streamRef.current = mediaStream;
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
    // Reset spatial state for new product
    setScale(1);
    setRotation(0);
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
          <span className="block mt-2 font-bold text-brand-onyx">Tip: If you are using the AI Studio preview, try opening the app in a new tab to allow the camera prompt.</span>
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
    <div className="relative w-full aspect-video md:aspect-[16/9] bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-brand-onyx touch-none">
      {/* Video Stream */}
      <video 
        ref={videoRef}
        autoPlay 
        playsInline 
        muted
        className="w-full h-full object-cover grayscale-[20%] contrast-[110%]"
      />

      {/* Overlay Filter */}
      <div className="absolute inset-0 bg-blue-500/5 mix-blend-overlay pointer-events-none"></div>

      {/* HUD Elements */}
      <div className={cn("absolute inset-0 pointer-events-none transition-opacity duration-500", !showHUD && "opacity-0 invisible")}>
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
        <div className="absolute top-6 left-6 right-6 flex justify-between pointer-events-none">
          <div className="flex items-center space-x-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] text-white font-black uppercase tracking-widest leading-none">Spatial v1.2.0</span>
          </div>
          <div className="flex items-center space-x-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
            <span className="text-[10px] text-white font-black uppercase tracking-widest leading-none">Tracking: Locked</span>
          </div>
        </div>

        {/* Spatial Information (Visible when anchored) */}
        <AnimatePresence>
          {instructionStep >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute top-24 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md px-6 py-2 rounded-full border border-white/10"
            >
              <p className="text-white text-[10px] font-bold uppercase tracking-[0.3em]">Spatial Sync Active • 1:1 Scale</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Instructions Overlay */}
        <AnimatePresence mode="wait">
          {instructionStep < 3 && (
            <motion.div 
              key={instructionStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute bottom-40 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-xl border border-white/10 p-6 rounded-3xl text-center min-w-[300px]"
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
                  <p className="text-white text-xs font-bold uppercase tracking-widest">Identifying Surfaces...</p>
                </div>
              )}
              {instructionStep === 2 && !products[selectedProductIdx].model3d && (
                <div className="flex flex-col items-center space-y-3">
                  <Sparkles className="text-brand-copper" size={24} />
                  <p className="text-white text-xs font-bold uppercase tracking-widest">Anchored. Touch to move & scale.</p>
                </div>
              )}
              {instructionStep === 2 && products[selectedProductIdx].model3d && (
                <div className="flex flex-col items-center space-y-3">
                  <Box className="text-green-400" size={24} />
                  <p className="text-white text-xs font-bold uppercase tracking-widest">3D Model Positioned.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Spatial Controls (Visible when anchored) */}
        {instructionStep >= 2 && (
          <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col space-y-8 pointer-events-auto">
            <div className="flex flex-col items-center space-y-3 bg-black/40 backdrop-blur-xl p-4 rounded-3xl border border-white/10">
              <span className="text-[8px] text-white/60 font-black uppercase tracking-widest vertical-text">Scale</span>
              <input 
                type="range" 
                min="0.4" 
                max="2.5" 
                step="0.1" 
                value={scale} 
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="appearance-none w-1 h-32 bg-white/20 rounded-full accent-brand-copper orientation-vertical"
                style={{ WebkitAppearance: 'slider-vertical' } as any}
              />
            </div>
            
            <div className="flex flex-col items-center space-y-3 bg-black/40 backdrop-blur-xl p-4 rounded-3xl border border-white/10">
              <span className="text-[8px] text-white/60 font-black uppercase tracking-widest vertical-text underline decoration-brand-copper underline-offset-4">Rotate</span>
              <input 
                type="range" 
                min="-180" 
                max="180" 
                step="1" 
                value={rotation} 
                onChange={(e) => setRotation(parseInt(e.target.value))}
                className="appearance-none w-1 h-32 bg-white/20 rounded-full accent-brand-copper orientation-vertical"
                style={{ WebkitAppearance: 'slider-vertical' } as any}
              />
            </div>
          </div>
        )}
      </div>

      {/* Furniture Model (Interactive Layer) */}
      {instructionStep >= 2 && (
        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
          {products[selectedProductIdx].model3d ? (
            /* REAL 3D MODEL VIEW */
            <div className="w-full h-full pointer-events-auto">
              {/* @ts-ignore */}
              <model-viewer
                src={products[selectedProductIdx].model3d}
                ar
                ar-modes="webxr scene-viewer quick-look"
                camera-controls
                auto-rotate
                shadow-intensity="1"
                environment-image="neutral"
                exposure="1"
                style={{ width: '100%', height: '100%', '--poster-color': 'transparent' }}
                class="w-full h-full"
              >
                <div slot="ar-button" id="ar-button" className="hidden"></div>
              {/* @ts-ignore */}
              </model-viewer>
            </div>
          ) : (
            /* 2D SPATIAL PREVIEW (Fallback) */
            <motion.div 
              drag
              dragConstraints={{ left: -300, right: 300, top: -200, bottom: 200 }}
              onDrag={(e, info) => setPosition({ x: info.point.x, y: info.point.y })}
              initial={{ opacity: 0, scale: 0.6, y: 100 }}
              animate={{ 
                opacity: 1, 
                scale: scale,
                rotateY: rotation,
                y: 40 
              }}
              transition={{ 
                opacity: { duration: 0.5 },
                scale: { type: "spring", stiffness: 200, damping: 25 },
                rotateY: { type: "spring", stiffness: 100, damping: 20 }
              }}
              style={{ 
                perspective: "1200px",
                cursor: "grab",
                pointerEvents: "auto",
                touchAction: "none"
              }}
              className="w-[70%] max-w-sm absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            >
              {/* The Furniture Image */}
              <motion.img 
                src={products[selectedProductIdx].images[0]} 
                alt="AR Model" 
                className="w-full drop-shadow-[0_40px_60px_rgba(0,0,0,0.5)]"
                style={{ transformStyle: "preserve-3d" }}
                referrerPolicy="no-referrer"
              />
              
              {/* Perspective Shadow Overlay - Grounds the object */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[100%] h-12 bg-black/40 blur-[30px] rounded-[100%] -z-10 group-active:scale-110 transition-transform"></div>
              
              {/* Interaction Indicator */}
              <div className="absolute inset-0 border-2 border-brand-copper/0 hover:border-brand-copper/30 rounded-3xl transition-colors pointer-events-none"></div>
            </motion.div>
          )}
        </div>
      )}

      {/* Controls Bar */}
      <div className="absolute bottom-8 left-0 right-0 px-8 flex items-center justify-between pointer-events-auto z-20">
        <button 
          onClick={() => window.history.back()}
          className="w-14 h-14 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center text-white transition-all order-1"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col items-center order-2">
          {/* Main AR Activation (Mobile only usually) */}
          {products[selectedProductIdx].model3d && (
            <button 
              onClick={() => {
                const viewer = document.querySelector('model-viewer') as any;
                if (viewer) viewer.activateAR();
              }}
              className="mb-4 bg-white text-brand-onyx px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center space-x-2 shadow-xl hover:bg-brand-copper hover:text-white transition-all"
            >
              <Smartphone size={14} />
              <span>Enter Reality Mode</span>
            </button>
          )}

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
            className="bg-brand-copper text-white px-10 py-5 rounded-full font-bold flex items-center space-x-4 shadow-2xl hover:scale-105 active:scale-95 transition-all group"
          >
            <RefreshCw size={18} className="group-active:rotate-180 transition-transform duration-500" />
            <span className="uppercase tracking-widest text-[10px]">Switch Masterpiece</span>
          </button>
        </div>

        <div className="flex flex-col space-y-4 order-3">
          <button 
            onClick={() => setShowHUD(!showHUD)}
            className={cn(
              "w-14 h-14 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center text-white transition-all",
              showHUD ? "bg-brand-copper shadow-[0_0_20px_rgba(184,134,11,0.5)]" : "bg-white/10 hover:bg-white/20"
            )}
          >
            <Layers size={21} />
          </button>
          
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-4 rounded-full flex items-center justify-center">
             {products[selectedProductIdx].model3d ? (
               <Box className="text-green-400" size={18} />
             ) : (
               <BoxSelect className="text-brand-copper/60" size={18} />
             )}
          </div>
        </div>
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
            <p className="text-white text-sm font-black uppercase tracking-[0.5em] animate-pulse">Initializing Visual Overlay</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
