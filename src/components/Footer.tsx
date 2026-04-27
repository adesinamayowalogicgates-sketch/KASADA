import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Instagram, 
  Twitter, 
  Facebook, 
  Linkedin,
  ArrowRight
} from 'lucide-react';

export const Footer: React.FC = () => {
    return (
      <footer className="bg-brand-onyx text-brand-alabaster pt-32 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 md:gap-24 mb-24 md:mb-32">
            <div className="lg:col-span-1 text-center md:text-left">
              <h2 className="text-3xl font-serif font-black tracking-tighter mb-8">KASADA</h2>
              <p className="text-white/40 font-light leading-relaxed mb-12 max-w-xs mx-auto md:mx-0">
                Nigeria's premier destination for handcrafted furniture. 
                Bridging the gap between local artisans and modern homes.
              </p>
              <div className="flex justify-center md:justify-start space-x-6">
                <Instagram size={18} className="text-white/40 hover:text-brand-copper cursor-pointer transition-colors" />
                <Twitter size={18} className="text-white/40 hover:text-brand-copper cursor-pointer transition-colors" />
                <Facebook size={18} className="text-white/40 hover:text-brand-copper cursor-pointer transition-colors" />
                <Linkedin size={18} className="text-white/40 hover:text-brand-copper cursor-pointer transition-colors" />
              </div>
            </div>
            
            <div className="text-center md:text-left">
              <h4 className="text-[10px] uppercase tracking-[0.3em] font-black mb-8 md:mb-10 text-brand-copper">Shop</h4>
              <ul className="space-y-4 md:space-y-6 text-white/40 text-sm font-medium">
                <li><Link to="/collections?category=Living Room" className="hover:text-white transition-colors">Living Room</Link></li>
                <li><Link to="/collections?category=Bedroom" className="hover:text-white transition-colors">Bedroom</Link></li>
                <li><Link to="/collections?category=Office" className="hover:text-white transition-colors">Office</Link></li>
                <li><Link to="/collections?category=Dining Room" className="hover:text-white transition-colors">Dining Room</Link></li>
                <li><Link to="/bespoke" className="hover:text-white transition-colors">Bespoke Portal</Link></li>
                <li><Link to="/loyalty" className="hover:text-white transition-colors">Kasada Points</Link></li>
              </ul>
            </div>
  
            <div className="text-center md:text-left">
              <h4 className="text-[10px] uppercase tracking-[0.3em] font-black mb-8 md:mb-10 text-brand-copper">Support</h4>
              <ul className="space-y-4 md:space-y-6 text-white/40 text-sm font-medium">
                <li><Link to="/shipping" className="hover:text-white transition-colors">Shipping & Logistics</Link></li>
                <li><Link to="/returns" className="hover:text-white transition-colors">Returns & Escrow</Link></li>
                <li><Link to="/faq" className="hover:text-white transition-colors">FAQs</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              </ul>
            </div>
  
            <div className="text-center md:text-left">
              <h4 className="text-[10px] uppercase tracking-[0.3em] font-black mb-8 md:mb-10 text-brand-copper">Newsletter</h4>
              <p className="text-white/40 text-sm mb-8 font-light leading-relaxed">Join our list for design inspiration and early access to new collections.</p>
              <div className="relative max-w-xs mx-auto md:mx-0">
                <input 
                  type="email" 
                  placeholder="Email address" 
                  className="bg-transparent border-b border-white/20 pb-4 w-full focus:outline-none focus:border-brand-copper transition-colors text-sm"
                />
                <button className="absolute right-0 bottom-4 text-brand-copper hover:text-white transition-colors">
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </div>
          
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8 text-white/20 text-[8px] font-black tracking-[0.3em] uppercase text-center md:text-left">
            <p>© 2026 KASADA FURNITURE. ALL RIGHTS RESERVED.</p>
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-12">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    );
  };
