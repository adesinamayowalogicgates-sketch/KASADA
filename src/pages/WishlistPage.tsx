import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Trash2, 
  Share2, 
  Plus, 
  Settings2,
  X,
  Users
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  doc, 
  deleteDoc, 
  updateDoc, 
  arrayUnion, 
  collection, 
  addDoc, 
  Timestamp 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import { PRODUCTS } from '../constants';
import { ProductCard } from '../components/ProductCard';
import { useCart } from '../contexts/CartContext';

const WishlistPage: React.FC = () => {
    const { wishlists, loading } = useWishlist();
    const { user } = useAuth();
    const { showToast } = useCart();
    const [isCreating, setIsCreating] = useState(false);
    const [newListName, setNewListName] = useState('');
  
    const handleCreateList = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user || !user.email) return;
      try {
        await addDoc(collection(db, 'wishlists'), {
          name: newListName,
          ownerId: user.uid,
          ownerEmail: user.email,
          collaboratorEmails: [user.email],
          itemIds: [],
          createdAt: Timestamp.now()
        });
        showToast(`Wishlist "${newListName}" created`);
        setIsCreating(false);
        setNewListName('');
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, 'wishlists');
      }
    };
  
    const shareList = async (listId: string) => {
      const email = prompt("Enter the email of the person you'd like to collaborate with:");
      if (email && email.includes('@')) {
        try {
          await updateDoc(doc(db, 'wishlists', listId), {
            collaboratorEmails: arrayUnion(email.toLowerCase())
          });
          showToast(`Shared with ${email}`);
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, `wishlists/${listId}`);
        }
      }
    };
  
    const deleteList = async (listId: string, name: string) => {
      if (confirm(`Delete "${name}"?`)) {
        try {
          await deleteDoc(doc(db, 'wishlists', listId));
          showToast(`Wishlist "${name}" deleted`);
        } catch (error) {
          handleFirestoreError(error, OperationType.DELETE, `wishlists/${listId}`);
        }
      }
    };
  
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="pt-24 sm:pt-40 pb-24 px-4 sm:px-6 max-w-7xl mx-auto"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 sm:mb-24 gap-8">
          <div>
            <span className="text-brand-copper uppercase tracking-[0.4em] text-[10px] font-black mb-4 block">Personal Curation</span>
            <h1 className="text-6xl md:text-8xl font-serif font-bold tracking-tight italic">Wishlists.</h1>
          </div>
          <button 
            onClick={() => setIsCreating(true)}
            className="flex items-center space-x-4 bg-brand-onyx text-white px-8 sm:px-10 py-5 rounded-full font-bold hover:bg-brand-copper transition-all shadow-xl"
          >
            <Plus size={20} />
            <span>Create New List</span>
          </button>
        </div>
  
        <AnimatePresence>
          {isCreating && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-16 sm:mb-20 bg-brand-onyx p-10 sm:p-12 rounded-[3.5rem] text-white overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-1/3 h-full bg-brand-copper/10 -skew-x-12 translate-x-1/2" />
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 sm:gap-12">
                <div className="shrink-0 w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-brand-copper">
                  <Heart size={32} />
                </div>
                <div className="flex-grow">
                  <h3 className="text-2xl font-serif font-bold mb-4">Name Your Collection</h3>
                  <form onSubmit={handleCreateList} className="flex gap-4">
                    <input 
                      autoFocus
                      required
                      value={newListName}
                      onChange={e => setNewListName(e.target.value)}
                      className="flex-grow bg-white/5 border-b border-white/20 py-4 focus:outline-none focus:border-brand-copper text-xl font-serif italic placeholder:text-white/20"
                      placeholder="e.g. Dream Living Room"
                    />
                    <button type="submit" className="bg-white text-brand-onyx px-8 rounded-full font-bold hover:bg-brand-copper hover:text-white transition-all">Save</button>
                    <button onClick={() => setIsCreating(false)} className="p-4 text-white/40 hover:text-white"><X /></button>
                  </form>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
  
        <div className="space-y-24 sm:space-y-32">
          {wishlists.map((list) => {
            const listItems = PRODUCTS.filter(p => list.itemIds.includes(p.id));
            const isOwner = list.ownerId === user?.uid;
            
            return (
              <div key={list.id}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 sm:mb-16 gap-6 sm:gap-8">
                  <div>
                    <h2 className="text-3xl sm:text-5xl font-serif font-bold mb-4 flex items-center gap-4">
                        <span>{list.name}</span>
                        {list.collaboratorEmails.length > 1 && <Users size={24} className="text-brand-copper" />}
                    </h2>
                    <p className="text-brand-slate text-[10px] font-black uppercase tracking-widest flex items-center space-x-3">
                      <span>{listItems.length} {listItems.length === 1 ? 'Piece' : 'Pieces'}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-onyx/10" />
                      <span>{isOwner ? 'Your Collection' : `Shared by ${list.ownerEmail}`}</span>
                    </p>
                  </div>
                  <div className="flex space-x-4">
                    <button onClick={() => shareList(list.id)} className="p-4 bg-brand-onyx/5 rounded-2xl text-brand-onyx hover:bg-brand-onyx hover:text-white transition-all flex items-center space-x-3">
                      <Share2 size={18} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Share</span>
                    </button>
                    {isOwner && (
                      <button onClick={() => deleteList(list.id, list.name)} className="p-4 bg-red-50 rounded-2xl text-red-500 hover:bg-red-500 hover:text-white transition-all">
                        <Trash2 size={18} />
                      </button>
                    )}
                    <button 
                      onClick={async () => {
                        const newName = prompt("Rename your wishlist:", list.name);
                        if (newName && newName !== list.name) {
                          try {
                            await updateDoc(doc(db, 'wishlists', list.id), { name: newName });
                            showToast(`Renamed to "${newName}"`);
                          } catch (error) {
                            handleFirestoreError(error, OperationType.UPDATE, `wishlists/${list.id}`);
                          }
                        }
                      }}
                      className="p-4 bg-brand-onyx text-white rounded-2xl hover:bg-brand-copper transition-all"
                    >
                      <Settings2 size={18} />
                    </button>
                  </div>
                </div>
  
                {listItems.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 md:gap-x-12 gap-y-16 md:gap-y-24">
                    {listItems.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="py-24 bg-brand-onyx/5 rounded-[3rem] text-center">
                    <p className="text-brand-slate font-light text-xl mb-8 italic">No masterpieces have been curated into this collection yet.</p>
                    <Link to="/collections" className="text-[10px] font-black uppercase tracking-widest text-brand-copper hover:text-brand-onyx transition-colors">Explore the Catalog</Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    );
  };

export default WishlistPage;
