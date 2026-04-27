import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, LogIn, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
    const { login, user } = useAuth();
    const navigate = useNavigate();
  
    React.useEffect(() => {
      if (user) navigate('/loyalty');
    }, [user, navigate]);
  
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen pt-32 sm:pt-40 pb-24 px-6 flex items-center justify-center bg-brand-alabaster overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-copper/5 -skew-x-12 translate-x-1/2 pointer-events-none" />
        
        <div className="max-w-xl w-full bg-white p-12 sm:p-20 rounded-[4rem] shadow-2xl relative z-10 border border-brand-onyx/5">
          <div className="text-center mb-16">
            <div className="w-20 h-20 bg-brand-copper/10 rounded-full flex items-center justify-center text-brand-copper mx-auto mb-8">
              <Sparkles size={32} />
            </div>
            <h1 className="text-4xl sm:text-5xl font-serif font-bold mb-6">Join the Registry.</h1>
            <p className="text-brand-slate font-light leading-relaxed">
              Unlock artisanal member pricing, track your bespoke concepts, and earn points on every masterpiece.
            </p>
          </div>
  
          <div className="space-y-6">
            <button 
              onClick={login}
              className="w-full bg-brand-onyx text-white py-5 rounded-full font-bold hover:bg-brand-copper transition-all duration-500 shadow-xl flex items-center justify-center space-x-4"
            >
              <LogIn size={20} />
              <span>Continue with Google</span>
            </button>
            <p className="text-center text-[10px] font-black uppercase tracking-widest text-brand-slate/40">
              Trusted by 5,000+ Nigerian Design Enthusiasts
            </p>
          </div>
  
          <div className="mt-16 pt-12 border-t border-brand-onyx/5 grid grid-cols-2 gap-8 text-center">
            <div className="space-y-3">
              <ShieldCheck className="mx-auto text-brand-copper" size={24} />
              <p className="text-[10px] font-black uppercase tracking-widest">Escrow Protected</p>
            </div>
            <div className="space-y-3">
              <Sparkles className="mx-auto text-brand-copper" size={24} />
              <p className="text-[10px] font-black uppercase tracking-widest">Master Artisans</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

export default Login;
