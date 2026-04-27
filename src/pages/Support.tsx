import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Truck, 
  RefreshCcw, 
  HelpCircle, 
  Mail, 
  ChevronDown, 
  ShieldCheck, 
  Clock, 
  MapPin,
  Send,
  MessageSquare
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';

const FAQS = [
  {
    question: "How long does shipping take within Nigeria?",
    answer: "Delivery timelines vary by region. Lagos/Abuja: 3-5 business days. Other major cities: 7-10 business days. Regional areas: 12-14 business days. All items are shipped with white-glove handling."
  },
  {
    question: "What is the KASADA Escrow Protection?",
    answer: "Your payment is held securely in escrow until you've received and inspected your heritage furniture. You have a 7-day inspection period from the date of delivery."
  },
  {
    question: "Can I request custom modifications to standard pieces?",
    answer: "Yes, we specialize in bespoke craftsmanship. You can request custom finishes, dimensions, or fabric changes through our Bespoke Portal or by contacting a concierge specialist."
  },
  {
    question: "Do you offer international shipping?",
    answer: "Currently, we focus on pan-African distribution. For shipping outside of Africa, please contact our logistics team for a specialized quote and customs assessment."
  },
  {
    question: "How do I care for my handcrafted wooden furniture?",
    answer: "Avoid direct sunlight and extreme humidity. Dust with a soft, lint-free cloth. We recommend our signature Kasada Cedar Oil for conditioning every 6 months to maintain the wood's artisanal luster."
  }
];

const SECTIONS = [
  { id: 'shipping', label: 'Shipping', icon: Truck },
  { id: 'returns', label: 'Returns', icon: RefreshCcw },
  { id: 'faq', label: 'FAQs', icon: HelpCircle },
  { id: 'contact', label: 'Contact', icon: Mail }
];

export default function Support() {
  const location = useLocation();
  const initialSection = location.pathname.split('/').pop() || 'shipping';
  const [activeSection, setActiveSection] = useState(initialSection === 'support' ? 'shipping' : initialSection);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormState({ name: '', email: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    }, 1500);
  };

  return (
    <div className="pt-32 pb-24 bg-brand-alabaster min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <header className="mb-20 text-center">
          <h1 className="text-5xl md:text-7xl font-serif font-black mb-6 tracking-tight">Support Centre</h1>
          <p className="text-brand-slate text-lg max-w-2xl mx-auto font-light leading-relaxed">
            Direct concierge assistance and information for the KASADA ecosystem. 
            We are here to ensure your heritage pieces last generations.
          </p>
        </header>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-20">
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "flex items-center space-x-3 px-8 py-4 rounded-full transition-all duration-500 text-[10px] uppercase font-black tracking-widest",
                  activeSection === section.id 
                    ? "bg-brand-onyx text-white shadow-xl shadow-brand-onyx/20" 
                    : "bg-white text-brand-onyx/40 hover:bg-white/80 border border-brand-onyx/5"
                )}
              >
                <Icon size={16} />
                <span>{section.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="max-w-4xl mx-auto bg-white rounded-[3rem] p-8 md:p-16 border border-brand-onyx/5 shadow-sm">
          <AnimatePresence mode="wait">
            {activeSection === 'shipping' && (
              <motion.div
                key="shipping"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-12"
              >
                <div>
                  <h2 className="text-3xl font-serif font-bold mb-6">Logistics & Delivery</h2>
                  <p className="text-brand-slate font-light leading-relaxed mb-8">
                    Our white-glove delivery service ensures that every piece arrives in pristine condition. 
                    We handle all logistics in-house to maintain our heritage standards.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                  <div className="p-8 bg-brand-alabaster rounded-3xl">
                    <ShieldCheck className="text-brand-copper mb-4" size={32} />
                    <h4 className="font-bold mb-2">Insured Transit</h4>
                    <p className="text-xs text-brand-slate leading-relaxed">Full replacement value insurance on every order transit across 36 states.</p>
                  </div>
                  <div className="p-8 bg-brand-alabaster rounded-3xl">
                    <Clock className="text-brand-copper mb-4" size={32} />
                    <h4 className="font-bold mb-2">Scheduled Arrival</h4>
                    <p className="text-xs text-brand-slate leading-relaxed">Choose your precise delivery window. Our team will call 24 hours before arrival.</p>
                  </div>
                  <div className="p-8 bg-brand-alabaster rounded-3xl">
                    <MapPin className="text-brand-copper mb-4" size={32} />
                    <h4 className="font-bold mb-2">National Reach</h4>
                    <p className="text-xs text-brand-slate leading-relaxed">Dedicated logistics hubs in Lagos, Port Harcourt, and Kano.</p>
                  </div>
                  <div className="p-8 bg-brand-copper/5 rounded-3xl border border-brand-copper/20">
                    <Truck className="text-brand-copper mb-4" size={32} />
                    <h4 className="font-bold mb-2">White-Glove Service</h4>
                    <p className="text-xs text-brand-slate leading-relaxed">Includes unpacking, precise room placement, and debris removal.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeSection === 'returns' && (
              <motion.div
                key="returns"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-12"
              >
                <h2 className="text-3xl font-serif font-bold mb-6">Returns & Escrow</h2>
                <div className="prose prose-onyx prose-sm max-w-none font-light text-brand-slate">
                  <p className="text-lg text-brand-onyx font-medium mb-6">We stand by our craftsmanship. If it's not perfect, we make it right.</p>
                  
                  <div className="space-y-8 mt-12">
                    <div className="flex items-start space-x-6">
                      <div className="flex-shrink-0 w-8 h-8 bg-brand-copper/10 rounded-full flex items-center justify-center text-brand-copper font-serif font-bold italic">7</div>
                      <div>
                        <h4 className="text-brand-onyx font-bold mb-2 uppercase tracking-widest text-[10px]">Day Inspection Period</h4>
                        <p>Upon delivery, you have 7 calendar days to inspect the piece for craftsmanship defects or shipping damage.</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-6">
                      <div className="flex-shrink-0 w-8 h-8 bg-brand-onyx/10 rounded-full flex items-center justify-center text-brand-onyx">
                        <ShieldCheck size={16} />
                      </div>
                      <div>
                        <h4 className="text-brand-onyx font-bold mb-2 uppercase tracking-widest text-[10px]">Escrow Protection</h4>
                        <p>Funds are only released to artisans after your inspection period clears. Secure transactions are our baseline.</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-6">
                      <div className="flex-shrink-0 w-8 h-8 bg-brand-onyx/10 rounded-full flex items-center justify-center text-brand-onyx">
                        <RefreshCcw size={16} />
                      </div>
                      <div>
                        <h4 className="text-brand-onyx font-bold mb-2 uppercase tracking-widest text-[10px]">Seamless Exchange</h4>
                        <p>Should a return be necessary, our logistics team will collect the item directly from your home at no additional cost if due to defects.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeSection === 'faq' && (
              <motion.div
                key="faq"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-3xl font-serif font-bold mb-10">Frequently Asked Questions</h2>
                {FAQS.map((faq, index) => (
                  <div key={index} className="border-b border-brand-onyx/5 last:border-0">
                    <button
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      className="w-full py-6 flex items-center justify-between text-left group"
                    >
                      <span className="font-serif text-lg md:text-xl font-medium pr-8 group-hover:text-brand-copper transition-colors">
                        {faq.question}
                      </span>
                      <ChevronDown 
                        size={20} 
                        className={cn("transition-transform duration-500", openFaq === index ? "rotate-180" : "")} 
                      />
                    </button>
                    <AnimatePresence>
                      {openFaq === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.5, ease: 'circOut' }}
                          className="overflow-hidden"
                        >
                          <p className="pb-8 text-brand-slate font-light leading-relaxed text-sm max-w-2xl">
                            {faq.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </motion.div>
            )}

            {activeSection === 'contact' && (
              <motion.div
                key="contact"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-12"
              >
                <div className="flex flex-col md:flex-row gap-12">
                  <div className="md:w-1/3 space-y-8">
                    <h2 className="text-3xl font-serif font-bold">Contact Concierge</h2>
                    <div className="space-y-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-brand-alabaster flex items-center justify-center text-brand-onyx">
                          <MessageSquare size={16} />
                        </div>
                        <div className="text-[10px] uppercase font-black tracking-widest">Live Chat Availability<br/><span className="text-brand-copper font-medium lowercase">9:00 AM - 6:00 PM WAT</span></div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-brand-alabaster flex items-center justify-center text-brand-onyx">
                          <Mail size={16} />
                        </div>
                        <div className="text-[10px] uppercase font-black tracking-widest">Direct Email<br/><span className="text-brand-copper font-medium lowercase">concierge@kasada.ng</span></div>
                      </div>
                    </div>
                  </div>

                  <div className="md:w-2/3">
                    {submitted ? (
                      <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-brand-copper/5 border border-brand-copper/20 rounded-[2rem] p-12 text-center"
                      >
                        <div className="w-16 h-16 bg-brand-copper rounded-full flex items-center justify-center text-white mx-auto mb-6">
                          <ShieldCheck size={32} />
                        </div>
                        <h3 className="text-2xl font-serif font-bold mb-2">Message Received</h3>
                        <p className="text-sm text-brand-slate font-light">A concierge specialist will respond within 2 business hours.</p>
                      </motion.div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[8px] uppercase font-black tracking-widest text-brand-onyx/40 ml-4">Your Name</label>
                            <input 
                              required
                              type="text"
                              value={formState.name}
                              onChange={e => setFormState({...formState, name: e.target.value})}
                              className="w-full bg-brand-alabaster rounded-2xl px-6 py-4 outline-none focus:ring-2 ring-brand-copper/10 transition-all text-sm font-medium"
                              placeholder="Mayowa Adesina"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[8px] uppercase font-black tracking-widest text-brand-onyx/40 ml-4">Email Address</label>
                            <input 
                              required
                              type="email"
                              value={formState.email}
                              onChange={e => setFormState({...formState, email: e.target.value})}
                              className="w-full bg-brand-alabaster rounded-2xl px-6 py-4 outline-none focus:ring-2 ring-brand-copper/10 transition-all text-sm font-medium"
                              placeholder="mayowa@example.com"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[8px] uppercase font-black tracking-widest text-brand-onyx/40 ml-4">Message</label>
                          <textarea
                            required
                            rows={4}
                            value={formState.message}
                            onChange={e => setFormState({...formState, message: e.target.value})}
                            className="w-full bg-brand-alabaster rounded-2xl px-6 py-6 outline-none focus:ring-2 ring-brand-copper/10 transition-all text-sm font-medium resize-none"
                            placeholder="Tell us how our specialists can assist you today..."
                          />
                        </div>
                        <button 
                          disabled={isSubmitting}
                          type="submit" 
                          className="w-full bg-brand-onyx text-white rounded-full py-4 uppercase text-[10px] font-black tracking-widest hover:bg-brand-copper transition-all duration-500 disabled:opacity-50 flex items-center justify-center space-x-3"
                        >
                          {isSubmitting ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <>
                              <span>Send Message</span>
                              <Send size={14} />
                            </>
                          )}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
