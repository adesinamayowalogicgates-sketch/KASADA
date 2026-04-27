import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  getDocs,
  setDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import { handleFirestoreError, OperationType } from '../lib/firebaseUtils';

interface Wishlist {
  id: string;
  name: string;
  ownerId: string;
  ownerEmail: string;
  collaboratorEmails: string[];
  itemIds: string[];
  createdAt: Timestamp;
}

interface WishlistContextType {
  wishlists: Wishlist[];
  loading: boolean;
  toggleWishlist: (productId: string) => Promise<void>;
  isLiked: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setWishlists([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'wishlists'), 
      where('collaboratorEmails', 'array-contains', user.email)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Wishlist));
      setWishlists(docs);
      setLoading(false);
    }, (error) => {
      console.error("Wishlist snapshot error:", error);
      handleFirestoreError(error, OperationType.LIST, 'wishlists');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const toggleWishlist = async (productId: string) => {
    if (!user || !user.email) return;

    // Use default 'My Favorites' wishlist if it exists, or create it
    let defaultWishlist = wishlists.find(w => w.name === 'My Favorites' && w.ownerId === user.uid);
    
    if (!defaultWishlist) {
      const q = query(
        collection(db, 'wishlists'), 
        where('ownerId', '==', user.uid),
        where('name', '==', 'My Favorites')
      );
      const snap = await getDocs(q);
      if (snap.empty) {
        const newRef = doc(collection(db, 'wishlists'));
        await setDoc(newRef, {
          name: 'My Favorites',
          ownerId: user.uid,
          ownerEmail: user.email,
          collaboratorEmails: [user.email],
          itemIds: [productId],
          createdAt: Timestamp.now()
        });
        return;
      }
      defaultWishlist = { id: snap.docs[0].id, ...snap.docs[0].data() } as Wishlist;
    }

    const isAdded = defaultWishlist.itemIds.includes(productId);
    try {
      await updateDoc(doc(db, 'wishlists', defaultWishlist.id), {
        itemIds: isAdded ? arrayRemove(productId) : arrayUnion(productId)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `wishlists/${defaultWishlist.id}`);
    }
  };

  const isLiked = (productId: string) => {
    return wishlists.some(w => w.itemIds.includes(productId));
  };

  return (
    <WishlistContext.Provider value={{ wishlists, loading, toggleWishlist, isLiked }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
