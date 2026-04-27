import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Star, 
  Minus, 
  Plus, 
  Heart, 
  Smartphone, 
  MessageSquare, 
  Sparkles,
  ShieldCheck,
  Lock,
  Box
} from 'lucide-react';
import { PRODUCTS } from '../constants';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { getCompleteTheLook } from '../services/geminiService';
import { ProductCard } from '../components/ProductCard';
import { Product } from '../types';
import { cn } from '../lib/utils';

const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const product = PRODUCTS.find(p => p.id === id);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addAssembly, setAddAssembly] = useState(false);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);
  const { addToCart } = useCart();
  const { toggleWishlist, isLiked } = useWishlist();
  const navigate = useNavigate();

  const liked = product ? isLiked(product.id) : false;

  useEffect(() => {
    window.scrollTo(0, 0);
    setSelectedImage(0);
    
    if (product) {
      setIsLoadingRecs(true);
      getCompleteTheLook(product, PRODUCTS).then(recs => {
        setRecommendations(recs);
        setIsLoadingRecs(false);
      });
    }
  }, [id, product]);

  if (!product) return <div className="pt-32 text-center text-brand-onyx font-serif text-2xl">Product not found</div>;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-24 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 max-w-7xl mx-auto"
    >
      <Link to="/collections" className="inline-flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-brand-slate hover:text-brand-onyx mb-8 sm:mb-12 transition-colors">
        <ArrowLeft size={14} />
        <span>Back to Collection</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
        {/* Gallery */}
        <div className="space-y-4 sm:space-y-6">
          <motion.div 
            key={selectedImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="aspect-[4/5] rounded-2xl overflow-hidden bg-brand-onyx/5 relative"
          >
            <img 
              src={product.images[selectedImage]} 
              alt={product.name} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {product.isMadeInNigeria && (
              <div className="absolute top-6 left-6 bg-brand-alabaster/90 backdrop-blur-md px-4 py-2 rounded-full shadow-sm flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-onyx">Made in Nigeria</span>
              </div>
            )}
          </motion.div>
          <div className="grid grid-cols-4 gap-3 sm:gap-4">
            {product.images.map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={cn(
                  "aspect-square rounded-xl overflow-hidden border-2 transition-all",
                  selectedImage === idx ? "border-brand-copper" : "border-transparent opacity-60 hover:opacity-100"
                )}
              >
                <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="mb-8 sm:mb-12">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] uppercase tracking-[0.3em] text-brand-copper font-black">{product.category} • {product.style}</p>
              {product.isEscrowProtected && (
                <div className="flex items-center space-x-2 text-green-600 text-[10px] font-black uppercase tracking-widest">
                  <Lock size={12} />
                  <span>Escrow Protected</span>
                </div>
              )}
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold mb-6">{product.name}</h1>
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-8">
              <p className="text-2xl sm:text-3xl font-black">₦{product.price.toLocaleString()}</p>
              <div className="flex items-center space-x-2 text-brand-slate text-sm">
                <Star size={16} className="text-brand-copper fill-brand-copper" />
                <span className="font-bold text-brand-onyx">{product.seller.rating}</span>
                <span>(124 Reviews)</span>
              </div>
            </div>

            {product.installmentOptions && (
              <div className="mb-8 p-4 bg-brand-copper/5 border border-brand-copper/20 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand-copper mb-1">Pay in Installments</p>
                  <p className="text-sm font-medium">As low as ₦{(product.price / 6).toLocaleString()} / month</p>
                </div>
                <div className="flex gap-2">
                  {product.installmentOptions.map(opt => (
                    <span key={opt} className="bg-white px-3 py-1 rounded-md text-[10px] font-bold border border-brand-onyx/5 shadow-sm">{opt}</span>
                  ))}
                </div>
              </div>
            )}

            <p className="text-brand-slate text-base sm:text-lg font-light leading-relaxed mb-8 sm:mb-12">
              {product.description}
            </p>
            
            <div className="grid grid-cols-2 gap-6 sm:gap-8 p-6 sm:p-8 bg-brand-onyx/5 rounded-[2rem] mb-8 sm:mb-12">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-black text-brand-slate mb-2">Material</p>
                <p className="font-serif text-base sm:text-lg">{product.material}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-black text-brand-slate mb-2">Dimensions</p>
                <p className="font-serif text-base sm:text-lg">{product.dimensions.width}x{product.dimensions.height}x{product.dimensions.depth} {product.dimensions.unit}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-black text-brand-slate mb-2">Delivery</p>
                <p className="font-serif text-base sm:text-lg">{product.deliverySLA}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-black text-brand-slate mb-2">Seller</p>
                <p className="font-serif text-base sm:text-lg flex items-center space-x-2">
                  <span>{product.seller.name}</span>
                  {product.seller.isVerified && <ShieldCheck size={16} className="text-brand-copper" />}
                </p>
              </div>
            </div>

            {product.hasAssemblyService && (
              <div className="mb-8 flex items-center justify-between p-6 border border-brand-onyx/10 rounded-2xl">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-brand-onyx/5 flex items-center justify-center text-brand-copper">
                    <Box size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Assembly-as-a-Service</p>
                    <p className="text-xs text-brand-slate">Professional setup on delivery • <span className="text-brand-copper font-black">₦{product.assemblyCost?.toLocaleString()}</span></p>
                  </div>
                </div>
                <button 
                  onClick={() => setAddAssembly(!addAssembly)}
                  className={cn(
                    "w-12 h-6 rounded-full relative transition-colors duration-300",
                    addAssembly ? "bg-brand-copper" : "bg-brand-onyx/10"
                  )}
                >
                  <motion.div 
                    animate={{ x: addAssembly ? 24 : 4 }}
                    className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                  />
                </button>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6 mb-8 sm:mb-12">
              <div className="flex items-center justify-between sm:justify-start border border-brand-onyx/10 rounded-full px-4 py-2">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 hover:text-brand-copper"><Minus size={16} /></button>
                <span className="w-12 text-center font-bold">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-2 hover:text-brand-copper"><Plus size={16} /></button>
              </div>
              <button 
                onClick={() => addToCart(product.id, quantity, addAssembly)}
                className="flex-grow bg-brand-onyx text-white py-4 sm:py-5 rounded-full font-bold hover:bg-brand-copper transition-all duration-500"
              >
                Add to Cart
              </button>
              <button 
                onClick={() => toggleWishlist(product.id)}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-brand-onyx/10 flex items-center justify-center hover:bg-brand-onyx/5 transition-colors"
              >
                <Heart size={24} className={cn(liked && "fill-brand-copper text-brand-copper transition-all")} />
              </button>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <button 
                onClick={() => navigate('/room-visualizer')}
                className="w-full border border-brand-onyx text-brand-onyx py-4 sm:py-5 rounded-full font-bold hover:bg-brand-onyx hover:text-white transition-all flex items-center justify-center space-x-3"
              >
                <Smartphone size={20} />
                <span>Try Room Visualizer (AR)</span>
              </button>
              <button 
                onClick={() => {
                  const message = `Hello KASADA Concierge, I'd like to track my order for ${product.name}.`;
                  window.open(`https://wa.me/2340000000?text=${encodeURIComponent(message)}`, '_blank');
                }}
                className="w-full flex items-center justify-center space-x-3 text-[10px] font-black uppercase tracking-widest text-brand-slate hover:text-brand-onyx transition-colors"
              >
                <MessageSquare size={16} />
                <span>Track Order via WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendations: Complete the Look */}
      <div className="mt-32 pt-32 border-t border-brand-onyx/5">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-brand-copper/10 rounded-full flex items-center justify-center text-brand-copper">
                <Sparkles size={16} />
              </div>
              <span className="text-brand-copper uppercase tracking-[0.4em] text-[10px] font-black">AI-Powered Curation</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-serif font-bold">Complete the Look</h2>
          </div>
          <p className="text-brand-slate max-w-md font-light leading-relaxed">
            Our AI designer has curated these pieces to perfectly complement your selection, creating a harmonious and elevated space.
          </p>
        </div>

        {isLoadingRecs ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/5] bg-brand-onyx/5 rounded-3xl mb-6"></div>
                <div className="h-4 bg-brand-onyx/5 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-brand-onyx/5 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {recommendations.map(rec => (
              <ProductCard key={rec.id} product={rec} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProductDetail;
