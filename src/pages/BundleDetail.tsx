import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle2, ShoppingBag, ShieldCheck } from 'lucide-react';
import { BUNDLES, PRODUCTS } from '../constants';
import { useCart } from '../contexts/CartContext';
import { ProductCard } from '../components/ProductCard';

const BundleDetail: React.FC = () => {
  const { id } = useParams();
  const bundle = BUNDLES.find(b => b.id === id);
  const bundleProducts = bundle ? PRODUCTS.filter(p => bundle.productIds.includes(p.id)) : [];
  const { addToCart } = useCart();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!bundle) return <div className="pt-40 text-center font-serif text-2xl">Bundle not found</div>;

  const totalIndividualPrice = bundleProducts.reduce((acc, p) => acc + p.price, 0);
  const savings = totalIndividualPrice - bundle.discountPrice;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-24 sm:pt-40 pb-24 px-4 sm:px-6 max-w-7xl mx-auto"
    >
      <Link to="/bundles" className="inline-flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-brand-slate hover:text-brand-onyx mb-12 transition-colors">
        <ArrowLeft size={14} />
        <span>Back to Bundles</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 mb-32 items-center">
        <div className="relative">
          <div className="aspect-square rounded-[3rem] overflow-hidden bg-brand-onyx/5 shadow-2xl">
            <img src={bundle.image} alt={bundle.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div className="absolute -bottom-8 -right-8 bg-brand-copper text-white p-8 rounded-[2rem] shadow-2xl">
            <p className="text-[10px] font-black uppercase tracking-widest mb-1">Total Savings</p>
            <p className="text-3xl font-black">₦{savings.toLocaleString()}</p>
          </div>
        </div>

        <div>
          <span className="text-brand-copper uppercase tracking-[0.4em] text-[10px] font-black mb-6 block">{bundle.category} Collection</span>
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-8 leading-tight">{bundle.name}</h1>
          <p className="text-xl text-brand-slate font-light leading-relaxed mb-12">
            {bundle.description}
          </p>

          <div className="bg-brand-onyx/5 p-8 sm:p-10 rounded-[2.5rem] mb-12">
            <div className="flex items-center justify-between mb-8">
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-slate">Bundle Includes</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-copper">{bundleProducts.length} Items</span>
            </div>
            <div className="space-y-6">
              {bundleProducts.map(p => (
                <div key={p.id} className="flex items-center justify-between group">
                  <div className="flex items-center space-x-4">
                    <CheckCircle2 size={18} className="text-brand-copper" />
                    <span className="font-serif text-lg group-hover:text-brand-copper transition-colors">{p.name}</span>
                  </div>
                  <span className="text-sm font-bold text-brand-slate">₦{p.price.toLocaleString()}</span>
                </div>
              ))}
              <div className="pt-6 border-t border-brand-onyx/5 flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand-slate mb-1 italic line-through">₦{totalIndividualPrice.toLocaleString()}</p>
                  <p className="text-3xl font-black">₦{bundle.discountPrice.toLocaleString()}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-green-600 font-bold mb-1">Bundle Exclusive Price</p>
                    <div className="flex items-center space-x-2 text-brand-copper justify-end">
                        <ShieldCheck size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Insurance Included</span>
                    </div>
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={() => {
              bundleProducts.forEach(p => addToCart(p.id, 1, false));
            }}
            className="w-full bg-brand-onyx text-white py-5 rounded-full font-bold hover:bg-brand-copper transition-all duration-500 shadow-xl flex items-center justify-center space-x-3"
          >
            <ShoppingBag size={20} />
            <span>Add Entire Bundle to Bag</span>
          </button>
        </div>
      </div>

      <div className="pt-32 border-t border-brand-onyx/5">
        <h2 className="text-3xl font-serif font-bold mb-16 text-center">Inside the Collection</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {bundleProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default BundleDetail;
