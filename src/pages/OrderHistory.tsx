import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Package, 
  ChevronRight, 
  Clock, 
  MapPin, 
  ShieldCheck,
  ShoppingBag
} from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { handleFirestoreError, OperationType } from '../lib/firebaseUtils';
import { cn } from '../lib/utils';

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  assembly: boolean;
}

interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: 'Processing' | 'In Transit' | 'Delivered' | 'Cancelled';
  createdAt: any;
}

const OrderHistory: React.FC = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      if (!user) return;
  
      const q = query(
        collection(db, 'orders'), 
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
  
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order));
        setOrders(docs);
        setLoading(false);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'orders');
        setLoading(false);
      });
  
      return () => unsubscribe();
    }, [user]);
  
    if (!user) return <div className="pt-40 text-center">Please sign in to view your legacy transactions.</div>;
  
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="pt-24 sm:pt-40 pb-24 px-4 sm:px-6 max-w-5xl mx-auto"
      >
        <div className="mb-16 sm:mb-20">
          <span className="text-brand-copper uppercase tracking-[0.4em] text-[10px] font-black mb-4 block">Archive</span>
          <h1 className="text-4xl sm:text-7xl font-serif font-bold tracking-tight">Order <br/>History.</h1>
        </div>
  
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => <div key={i} className="h-40 bg-brand-onyx/5 rounded-[2.5rem] animate-pulse" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-brand-onyx/5 p-16 sm:p-24 rounded-[3rem] text-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-brand-slate mx-auto mb-8 shadow-xl">
                <ShoppingBag size={32} />
              </div>
              <h3 className="text-2xl font-serif font-bold mb-4">No Orders Found</h3>
              <p className="text-brand-slate font-light">Your collection begins here. Visit the catalog to find your first masterpiece.</p>
          </div>
        ) : (
          <div className="space-y-8 sm:space-y-12">
            {orders.map((order) => (
              <motion.div 
                layout
                key={order.id}
                className="bg-white p-8 sm:p-12 rounded-[3.5rem] shadow-xl border border-brand-onyx/5 group relative overflow-hidden"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
                  <div className="flex flex-wrap items-center gap-6">
                    <div className="w-16 h-16 rounded-3xl bg-brand-onyx/5 flex items-center justify-center text-brand-copper">
                      <Package size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-brand-slate mb-1">Order Ref</p>
                      <p className="text-xl font-mono font-bold">#{order.id.slice(-8).toUpperCase()}</p>
                    </div>
                    <div className="hidden sm:block h-12 w-px bg-brand-onyx/5" />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-brand-slate mb-1">Status</p>
                      <div className="flex items-center space-x-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          order.status === 'Processing' ? "bg-brand-copper animate-pulse" : "bg-green-500"
                        )} />
                        <span className="font-bold">{order.status}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-slate mb-1">Amount</p>
                    <p className="text-3xl font-serif font-bold">₦{order.total.toLocaleString()}</p>
                  </div>
                </div>
  
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 sm:gap-16 border-t border-brand-onyx/5 pt-12">
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-slate mb-6">Masterpieces</h4>
                    <div className="space-y-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center group/item cursor-default">
                          <p className="font-serif text-lg group-hover/item:text-brand-copper transition-colors">{item.name} <span className="text-sm font-sans text-brand-slate">x{item.quantity}</span></p>
                          <p className="font-bold text-xs opacity-40">₦{(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-brand-onyx/5 rounded-[2.5rem] p-8 sm:p-10 space-y-6">
                    <div className="flex items-center space-x-4 text-xs font-bold">
                        <Clock className="text-brand-copper" size={18} />
                        <span>Ordered on {order.createdAt?.toDate().toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-xs font-bold">
                        <MapPin className="text-brand-copper" size={18} />
                        <span>White-Glove Delivery to Lagos Residence</span>
                    </div>
                    <div className="flex items-center space-x-4 text-xs font-bold">
                        <ShieldCheck className="text-brand-copper" size={18} />
                        <span>Verified by Artisanal Escrow</span>
                    </div>
                    <button className="w-full mt-4 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-brand-onyx hover:text-brand-copper transition-colors group/btn">
                        <span>View Full Invoice</span>
                        <ChevronRight size={16} className="group-hover/btn:translate-x-2 transition-transform" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    );
  };

export default OrderHistory;
