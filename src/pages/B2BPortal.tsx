import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  Box, 
  Star, 
  Gift, 
  Truck, 
  Zap 
} from 'lucide-react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { cn } from '../lib/utils';

const B2BPortal: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useCart();
  const [inquiryType, setInquiryType] = useState('Hospitality');
  const [formData, setFormData] = useState({
    company: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const scrollToInquiry = () => {
    const el = document.getElementById('inquiry');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await addDoc(collection(db, 'b2b_inquiries'), {
        ...formData,
        userId: user?.uid || null,
        sector: inquiryType,
        status: 'pending',
        createdAt: Timestamp.now()
      });
      
      showToast("Application submitted. A specialist will reach out within 24 hours.");
      setFormData({ company: '', email: '', message: '' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'b2b_inquiries');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-24 sm:pt-40 pb-24"
    >
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 mb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div>
            <span className="text-brand-copper uppercase tracking-[0.4em] text-[10px] font-black mb-6 block">KASADA FOR BUSINESS</span>
            <h1 className="text-6xl md:text-8xl font-serif font-bold mb-8 leading-tight">Scale Your <br/>Interior Vision.</h1>
            <p className="text-xl text-brand-slate font-light leading-relaxed mb-12">
              From boutique hotels to sustainable corporate headquarters, we provide high-volume, 
              handcrafted furniture built to endure Nigeria's climate and corporate rigors.
            </p>
            <div className="flex flex-wrap gap-6">
              <button 
                onClick={scrollToInquiry}
                className="bg-brand-onyx text-white px-10 py-5 rounded-full font-bold hover:bg-brand-copper transition-all shadow-xl"
              >
                Start Bulk Inquiry
              </button>
              <div className="flex items-center space-x-4 px-8 py-5 border border-brand-onyx/10 rounded-full">
                <ShieldCheck className="text-brand-copper" size={24} />
                <span className="text-sm font-bold uppercase tracking-widest">Trade Certified</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/3] rounded-[3rem] overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop" 
                alt="B2B Workspace" 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-12 -left-12 bg-white p-8 rounded-[2rem] shadow-2xl hidden md:block max-w-xs border border-brand-onyx/5">
              <p className="text-brand-copper font-serif font-bold text-lg mb-2">"KASADA transformed our office into a cultural landmark."</p>
              <p className="text-xs text-brand-slate font-bold uppercase tracking-widest">— CEO, Eko Tech Hub</p>
            </div>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="bg-brand-onyx py-32 mb-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-serif font-bold text-white mb-8">Tailored Industry Solutions</h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto font-light">
              We understand the unique demands of professional environments. 
              Our B2B partners enjoy tiered pricing and logistics priority.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { 
                title: 'Hospitality', 
                icon: Star, 
                desc: 'Bespoke suites for hotels and airbnbs that demand durability without sacrificing artisanal soul.',
                image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop'
              },
              { 
                title: 'Corporate', 
                icon: Box, 
                desc: 'Productivity-first workstations and boardrooms designed for the modern African enterprise.',
                image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop'
              },
              { 
                title: 'Real Estate', 
                icon: ShieldCheck, 
                desc: 'Turnkey interior packages for property developers looking to elevate their valuation.',
                image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop'
              }
            ].map((service) => (
              <div key={service.title} className="group cursor-pointer">
                <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden mb-8 shadow-xl relative">
                  <img src={service.image} alt={service.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-brand-onyx/40 flex items-center justify-center scale-0 group-hover:scale-100 transition-transform duration-500">
                    <button 
                      onClick={scrollToInquiry}
                      className="bg-white text-brand-onyx px-8 py-3 rounded-full font-bold"
                    >
                      Request Specs
                    </button>
                  </div>
                </div>
                <div className="flex items-center space-x-4 mb-4">
                  <service.icon className="text-brand-copper" size={24} />
                  <h3 className="text-2xl font-serif font-bold text-white uppercase tracking-wider">{service.title}</h3>
                </div>
                <p className="text-white/50 leading-relaxed font-light">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trade Benefits */}
      <div className="max-w-7xl mx-auto px-6 mb-32">
        <div className="bg-brand-onyx/5 rounded-[3rem] p-12 md:p-24 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-12">The Trade Advantage</h2>
            <div className="space-y-12">
              <div className="flex gap-8">
                <div className="w-16 h-16 rounded-2xl bg-brand-copper/10 text-brand-copper flex items-center justify-center shrink-0">
                  <Gift size={32} />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2">Volume Discounts</h4>
                  <p className="text-brand-slate font-light leading-relaxed">Save up to 35% on multi-unit procurement and recurring projects.</p>
                </div>
              </div>
              <div className="flex gap-8">
                <div className="w-16 h-16 rounded-2xl bg-brand-copper/10 text-brand-copper flex items-center justify-center shrink-0">
                  <Truck size={32} />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2">Priority Logistics</h4>
                  <p className="text-brand-slate font-light leading-relaxed">Nationwide delivery with dedicated project management and on-site assembly.</p>
                </div>
              </div>
              <div className="flex gap-8">
                <div className="w-16 h-16 rounded-2xl bg-brand-copper/10 text-brand-copper flex items-center justify-center shrink-0">
                  <Zap size={32} />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2">CAD/3D Assets</h4>
                  <p className="text-brand-slate font-light leading-relaxed">Instant access to high-fidelity models for your architectural visualizations.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div id="inquiry" className="bg-white p-12 rounded-[2.5rem] shadow-2xl border border-brand-onyx/5">
            <h3 className="text-2xl font-serif font-bold mb-8">B2B Inquiry</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-brand-slate mb-2">Select Sector</label>
                <div className="flex gap-3">
                  {['Hospitality', 'Corporate', 'Residential'].map(t => (
                    <button 
                      key={t}
                      type="button"
                      onClick={() => setInquiryType(t)}
                      className={cn(
                        "px-4 py-2 rounded-full text-[10px] uppercase font-black tracking-widest transition-all",
                        inquiryType === t ? "bg-brand-copper text-white" : "bg-brand-onyx/5 text-brand-slate"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-brand-slate mb-2">Company Name</label>
                <input 
                  required
                  type="text" 
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                  className="w-full bg-brand-onyx/5 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-brand-copper" 
                  placeholder="e.g. Radisson Blu"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-brand-slate mb-2">Business Email</label>
                <input 
                  required
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-brand-onyx/5 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-brand-copper" 
                  placeholder="procurement@company.ng"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-brand-slate mb-2">Project Brief</label>
                <textarea 
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full bg-brand-onyx/5 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-brand-copper" 
                  placeholder="Tell us about your space and requirements..."
                />
              </div>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-brand-onyx text-white py-5 rounded-full font-bold hover:bg-brand-copper transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default B2BPortal;
