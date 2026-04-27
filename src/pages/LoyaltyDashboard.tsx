import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Gift, 
  TrendingUp, 
  History, 
  Calendar, 
  Star, 
  Zap, 
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Award
} from 'lucide-react';
import { 
  doc, 
  onSnapshot, 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs,
  updateDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { handleFirestoreError, OperationType } from '../lib/firebaseUtils';
import { cn } from '../lib/utils';

interface LoyaltyProfile {
  points: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  lifetimePoints: number;
  lastBonusAt?: any;
}

interface LoyaltyTransaction {
  id: string;
  amount: number;
  type: 'earn' | 'redeem' | 'bonus';
  description: string;
  createdAt: any;
}

const TIER_THRESHOLDS = {
  Bronze: 0,
  Silver: 1000,
  Gold: 5000,
  Platinum: 10000
};

const LoyaltyDashboard: React.FC = () => {
    const { user } = useAuth();
    const { showToast } = useCart();
    const [profile, setProfile] = useState<LoyaltyProfile | null>(null);
    const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [isClaiming, setIsClaiming] = useState(false);
  
    useEffect(() => {
      if (!user) return;
  
      const unsubscribe = onSnapshot(doc(db, 'loyalty_profiles', user.uid), (doc) => {
        if (doc.exists()) {
          const data = doc.data() as LoyaltyProfile;
          setProfile(data);
          
          // Check for auto-upgrade (Sync client-side for UX, but server handles it too)
          const currentTier = data.tier;
          let newTier = currentTier;
          const lifetimePoints = data.lifetimePoints || 0;
          
          if (lifetimePoints >= TIER_THRESHOLDS.Platinum) newTier = 'Platinum';
          else if (lifetimePoints >= TIER_THRESHOLDS.Gold) newTier = 'Gold';
          else if (lifetimePoints >= TIER_THRESHOLDS.Silver) newTier = 'Silver';
          else newTier = 'Bronze';
          
          if (newTier !== currentTier) {
            // Tier upgrade detected from snapshot
            showToast(`Congratulations! You've been upgraded to ${newTier} tier.`);
          }
        }
        setLoading(false);
      }, (error) => {
        console.error("Profile snapshot error:", error);
        handleFirestoreError(error, OperationType.GET, `loyalty_profiles/${user.uid}`);
        setLoading(false);
      });
  
      const q = query(
        collection(db, 'loyalty_transactions'), 
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
  
      getDocs(q).then(snap => {
        const txs = snap.docs.map(d => ({ id: d.id, ...d.data() } as LoyaltyTransaction));
        setTransactions(txs);
      });
  
      return () => unsubscribe();
    }, [user]);
  
    const claimDailyBonus = async () => {
      if (!user) return;
      setIsClaiming(true);
      try {
        const idToken = await user.getIdToken();
        const response = await fetch('/api/loyalty/daily-bonus', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken })
        });
        const result = await response.json();
        if (result.success) {
          showToast(`+${result.pointsAdded} Daily Bonus Points Claimed!`);
        } else {
          showToast(result.error || "Could not claim bonus");
        }
      } catch (error) {
        showToast("Server error. Try again tomorrow.");
      } finally {
        setIsClaiming(false);
      }
    };

    const handleRedeem = async (rewardId: string) => {
        if (!user || !profile) return;
        
        setIsClaiming(true);
        try {
            const idToken = await user.getIdToken();
            const response = await fetch('/api/loyalty/redeem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken, rewardId })
            });
            const result = await response.json();
            if (result.success) {
                showToast(`Success! You've redeemed: ${result.rewardName}`);
            } else {
                showToast(result.error || "Redemption failed");
            }
        } catch (error) {
            showToast("Server error. Please try again later.");
        } finally {
            setIsClaiming(false);
        }
    };
  
    if (!user) return (
        <div className="pt-40 text-center px-6">
            <h1 className="text-4xl font-serif font-bold mb-8">Loyalty Dashboard</h1>
            <p className="text-brand-slate">Please sign in to access your rewards.</p>
        </div>
    );
    if (loading) return <div className="pt-40 text-center">Loading your legacy...</div>;
  
    const tierConfig = {
      Bronze: { color: 'text-orange-700', bg: 'bg-orange-50', icon: Award, next: 'Silver' },
      Silver: { color: 'text-slate-500', bg: 'bg-slate-50', icon: ShieldCheck, next: 'Gold' },
      Gold: { color: 'text-yellow-600', bg: 'bg-yellow-50', icon: Star, next: 'Platinum' },
      Platinum: { color: 'text-brand-copper', bg: 'bg-brand-copper/5', icon: Zap, next: null }
    };
  
    const config = tierConfig[profile?.tier || 'Bronze'];
  
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="pt-24 sm:pt-40 pb-24 px-6 max-w-7xl mx-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 sm:gap-16">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12 sm:space-y-16">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
              <div>
                <span className="text-brand-copper uppercase tracking-[0.4em] text-[10px] font-black mb-4 block">Kasada Points</span>
                <h1 className="text-4xl sm:text-6xl font-serif font-bold tracking-tight">Your Rewards <br/>Dashboard.</h1>
              </div>
              <button 
                onClick={claimDailyBonus}
                disabled={isClaiming}
                className="group relative overflow-hidden bg-brand-onyx text-white px-8 py-4 rounded-full font-bold shadow-2xl flex items-center space-x-3 transition-all hover:bg-brand-copper disabled:opacity-50"
              >
                <div className="relative z-10 flex items-center space-x-3">
                  <TrendingUp size={18} />
                  <span>{isClaiming ? 'Claiming...' : 'Claim Daily Bonus'}</span>
                </div>
                <motion.div 
                  className="absolute inset-0 bg-brand-copper"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.5 }}
                />
              </button>
            </div>
  
            {/* Stats Card */}
            <div className="bg-brand-onyx p-10 sm:p-12 rounded-[3rem] text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-copper/10 -skew-x-12 translate-x-1/2" />
              
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-12 sm:gap-16">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-4">Available Points</p>
                  <p className="text-6xl font-serif font-black flex items-end">
                    {profile?.points || 0}
                    <span className="text-brand-copper text-lg ml-2 mb-2 italic">pts</span>
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-4">Loyalty Tier</p>
                  <div className="flex items-center space-x-4">
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center bg-white/10", config.color)}>
                      <config.icon size={24} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{profile?.tier || 'Bronze'}</p>
                      <p className="text-[10px] uppercase font-black tracking-widest text-brand-copper">Priority Member</p>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-4">Lifetime Progress</p>
                  <p className="text-3xl font-black">{ (profile?.lifetimePoints || 0).toLocaleString()} <span className="text-xs text-brand-copper italic uppercase">Total pts</span></p>
                </div>
              </div>
  
              {config.next && (
                <div className="mt-16 pt-10 border-t border-white/10 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="flex-grow max-w-md w-full">
                    <div className="flex justify-between text-[10px] uppercase font-black tracking-[0.2em] mb-3">
                      <span>Progress to {config.next}</span>
                      <span>{Math.floor(((profile?.lifetimePoints || 0) / TIER_THRESHOLDS[config.next as keyof typeof TIER_THRESHOLDS]) * 100)}%</span>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, ((profile?.lifetimePoints || 0) / TIER_THRESHOLDS[config.next as keyof typeof TIER_THRESHOLDS]) * 100)}%` }}
                        className="h-full bg-brand-copper rounded-full"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-white/40 italic">{(TIER_THRESHOLDS[config.next as keyof typeof TIER_THRESHOLDS] - (profile?.lifetimePoints || 0)).toLocaleString()} more points to unlock {config.next}</p>
                </div>
              )}
            </div>
  
            {/* Transactions */}
            <div>
              <div className="flex items-center space-x-4 mb-10">
                <History className="text-brand-onyx" size={24} />
                <h3 className="text-2xl font-serif font-bold">Transaction History</h3>
              </div>
              
              <div className="space-y-4">
                {transactions.length === 0 ? (
                  <div className="bg-brand-onyx/5 p-12 rounded-3xl text-center">
                    <p className="text-brand-slate font-light">No transactions recorded yet. Start shopping to earn points.</p>
                  </div>
                ) : (
                  transactions.map(tx => (
                    <div key={tx.id} className="bg-white p-6 rounded-3xl border border-brand-onyx/5 flex items-center justify-between group hover:shadow-lg transition-all">
                      <div className="flex items-center space-x-6">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center",
                          tx.type === 'earn' ? "bg-green-50 text-green-600" : "bg-brand-copper/10 text-brand-copper"
                        )}>
                          {tx.type === 'earn' ? <TrendingUp size={20} /> : <Gift size={20} />}
                        </div>
                        <div>
                          <p className="font-bold text-brand-onyx">{tx.description}</p>
                          <div className="flex items-center space-x-4 text-[10px] uppercase font-black tracking-widest text-brand-slate mt-1">
                            <span className="flex items-center space-x-1">
                              <Calendar size={10} />
                              <span>{tx.createdAt?.toDate().toLocaleDateString()}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className={cn(
                        "text-xl font-black",
                        tx.type === 'earn' ? "text-green-600" : "text-brand-copper"
                      )}>
                        {tx.type === 'earn' ? '+' : '-'}{tx.amount}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
  
          {/* Side Panels */}
          <div className="space-y-12">
            <div className="bg-brand-alabaster p-10 rounded-[2.5rem] border border-brand-onyx/5">
              <h4 className="text-xl font-serif font-bold mb-8">Exclusive Rewards</h4>
              <div className="space-y-6">
                {[
                  { id: 'free-delivery', title: 'Free Delivery', points: 25000, desc: 'Unlimited first-class shipping.' },
                  { id: 'polish-set', title: 'Furniture Polish Set', points: 15000, desc: 'Professional wood care kit.' },
                  { id: 'bespoke-consult', title: 'Bespoke Consultation', points: 50000, desc: '1-on-1 session with master artisan.' }
                ].map(reward => (
                  <button 
                    key={reward.title} 
                    onClick={() => handleRedeem(reward.id)}
                    disabled={isClaiming || (profile?.points || 0) < reward.points}
                    className="w-full text-left p-6 bg-white rounded-[2rem] border border-brand-onyx/5 group relative overflow-hidden transition-all hover:shadow-md disabled:opacity-50 disabled:hover:shadow-none"
                  >
                    <h5 className="font-bold mb-1">{reward.title}</h5>
                    <p className="text-[10px] text-brand-slate mb-4">{reward.desc}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-brand-copper">{reward.points.toLocaleString()} pts</span>
                      <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
              <p className="mt-6 text-[10px] text-center text-brand-slate tracking-widest uppercase font-bold">Select a reward above to redeem</p>
            </div>
  
            <div className="p-10 bg-brand-copper/5 rounded-[2.5rem] border border-brand-copper/10">
              <div className="flex items-center space-x-4 mb-6">
                <Sparkles className="text-brand-copper" size={24} />
                <h4 className="text-lg font-serif font-bold">Refer a Friend</h4>
              </div>
              <p className="text-sm font-light text-brand-slate leading-relaxed mb-8">
                Share the KASADA heritage. You both get <span className="font-bold text-brand-onyx">1,000 pts</span> when they make their first purchase above ₦100k.
              </p>
              <button className="text-[10px] font-black uppercase tracking-widest text-brand-copper flex items-center space-x-2">
                <span>Generate Link</span>
                <ChevronRight size={12} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

export default LoyaltyDashboard;
