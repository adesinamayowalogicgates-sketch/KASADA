import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from 'fs';
import 'dotenv/config';
import { PRODUCTS, BUNDLES } from "./src/constants";
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
let db: admin.firestore.Firestore | null = null;
let auth: admin.auth.Auth | null = null;

function initializeFirebase() {
  if (db && auth) return { db, auth };

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || process.env.VITE_FIREBASE_SERVICE_ACCOUNT_KEY;
  let databaseId = process.env.FIREBASE_FIRESTORE_DATABASE_ID || process.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID;
  
  if (!serviceAccountKey) {
    console.warn("FIREBASE_SERVICE_ACCOUNT_KEY is missing. Check your Settings > Secrets panel.");
    return null;
  }

  // Try to read from config file if env vars are missing
  if (!databaseId) {
    try {
      const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        databaseId = config.firestoreDatabaseId;
      }
    } catch (e) {
      console.warn("Failed to read database ID from config file:", e);
    }
  }

  // SANITIZE DATABASE ID: Remove common junk like "Use: " and strip all illegal characters
  if (databaseId) {
    // First remove prefixes
    let cleanId = databaseId.toString().replace(/^(Use|Database|ID)\s*:\s*/i, '').trim();
    // Then strip anything that isn't a lowercase letter, number, or hyphen
    // Firestore DB IDs are restricted to these characters
    cleanId = cleanId.toLowerCase().replace(/[^a-z0-9-]/g, '');
    databaseId = cleanId;
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountKey);
    let app: admin.app.App;
    if (admin.apps.length === 0) {
      app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } else {
      app = admin.app();
    }
    
    // Use getFirestore and getAuth from sub-modules for reliable multi-db and auth support
    // @ts-ignore
    db = databaseId ? getFirestore(databaseId) : getFirestore();
    auth = getAuth(app);
    
    console.log(`Firebase Admin initialized successfully (Database: ${databaseId || '(default)'}).`);
    return { db, auth };
  } catch (error) {
    console.error("Failed to initialize Firebase Admin:", error);
    return null;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/checkout", async (req, res) => {
    const firebase = initializeFirebase();
    if (!firebase) {
      return res.status(500).json({ error: "Server configuration incomplete. (Missing FIREBASE_SERVICE_ACCOUNT_KEY)" });
    }

    const { items, idToken, shippingAddress, clientTotal } = req.body;

    if (!items || !idToken) {
      return res.status(400).json({ error: "Missing required fields (items, idToken)" });
    }

    try {
      // 1. Verify User
      const decodedToken = await firebase.auth.verifyIdToken(idToken);
      const userId = decodedToken.uid;

      // 2. Validate Prices and Calculate Total Server-Side
      let subtotal = 0;
      const validatedItems = items.map((item: any) => {
        // Find in Products
        let itemPrice = 0;
        let itemName = '';
        let assemblyFee = 0;

        const product = PRODUCTS.find(p => p.id === item.productId);
        const bundle = BUNDLES.find(b => b.id === item.productId);

        if (product) {
          itemPrice = product.price;
          itemName = product.name;
          assemblyFee = product.assemblyCost || 0;
        } else if (bundle) {
          itemPrice = bundle.discountPrice || bundle.price;
          itemName = bundle.name;
          assemblyFee = 0; 
        } else {
          throw new Error(`Product or Bundle ${item.productId} not found`);
        }

        // Validate Quantity
        const quantity = parseInt(item.quantity);
        if (isNaN(quantity) || quantity <= 0) {
          throw new Error(`Invalid quantity for ${itemName}`);
        }

        const itemSubtotal = itemPrice * quantity;
        const assemblyCost = item.assembly ? assemblyFee * quantity : 0;
        
        subtotal += itemSubtotal + assemblyCost;

        return {
          productId: item.productId,
          quantity: quantity,
          priceAtTime: itemPrice,
          assembly: !!item.assembly,
          assemblyCostAtTime: item.assembly ? assemblyFee : 0
        };
      });

      // 3. Include Delivery and Verification
      const deliveryFee = subtotal > 500000 ? 0 : 25000;
      const finalTotal = subtotal + deliveryFee;

      // Price Mismatch Check (Protection against stale UI prices or man-in-the-middle)
      if (clientTotal !== undefined && Math.abs(clientTotal - finalTotal) > 1) { 
        throw new Error(`Price mismatch detected. Please refresh your cart. (Expected: ₦${finalTotal.toLocaleString()})`);
      }

      // 4. Prepare references and data
      const orderRef = firebase.db.collection('orders').doc();
      const loyaltyTxRef = firebase.db.collection('loyalty_transactions').doc();
      const profileRef = firebase.db.collection('loyalty_profiles').doc(userId);
      const pointsEarned = Math.floor(subtotal / 1000); // Loyalty points on products, not delivery

      const orderData = {
        userId,
        items: validatedItems,
        subtotal,
        deliveryFee,
        totalAmount: finalTotal,
        status: 'Confirmed',
        createdAt: admin.firestore.Timestamp.now(),
        shippingAddress: shippingAddress || 'Concierge Managed'
      };

      // 4. Atomic Transaction for Order + Loyalty
      await firebase.db.runTransaction(async (transaction) => {
        const profileDoc = await transaction.get(profileRef);

        // Set Order
        transaction.set(orderRef, orderData);

        // Set Loyalty Transaction
        transaction.set(loyaltyTxRef, {
          userId,
          amount: pointsEarned,
          type: 'earn',
          description: `Order #${orderRef.id.slice(-6).toUpperCase()}`,
          createdAt: admin.firestore.Timestamp.now()
        });

        // Update or Create Profile
        if (!profileDoc.exists) {
          transaction.set(profileRef, {
            userId,
            points: 500 + pointsEarned, // Welcome bonus + earned
            tier: 'Bronze',
            lifetimePoints: 500 + pointsEarned,
            updatedAt: admin.firestore.Timestamp.now()
          });
        } else {
          const data = profileDoc.data()!;
          const newPoints = (data.points || 0) + pointsEarned;
          const newLifetime = (data.lifetimePoints || 0) + pointsEarned;
          
          let tier = 'Bronze';
          if (newLifetime >= 10000) tier = 'Platinum';
          else if (newLifetime >= 5000) tier = 'Gold';
          else if (newLifetime >= 1000) tier = 'Silver';

          transaction.update(profileRef, {
            points: newPoints,
            lifetimePoints: newLifetime,
            tier,
            updatedAt: admin.firestore.Timestamp.now()
          });
        }
      });

      res.json({ success: true, orderId: orderRef.id });

    } catch (error: any) {
      console.error("Checkout error:", error);
      res.status(500).json({ error: error.message || "Checkout failed" });
    }
  });

  // Daily Points API
  app.post("/api/loyalty/daily-bonus", async (req, res) => {
    const firebase = initializeFirebase();
    if (!firebase) return res.status(500).json({ error: "Server error" });

    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ error: "Auth required" });

    try {
      const decodedToken = await firebase.auth.verifyIdToken(idToken);
      const userId = decodedToken.uid;
      const profileRef = firebase.db.collection('loyalty_profiles').doc(userId);
      
      const result = await firebase.db.runTransaction(async (transaction) => {
        const profileDoc = await transaction.get(profileRef);
        const now = admin.firestore.Timestamp.now();
        const amount = 50;
        const txRef = firebase.db.collection('loyalty_transactions').doc();

        if (!profileDoc.exists) {
          // Initialize with daily bonus
          transaction.set(profileRef, {
            userId,
            points: 500 + amount,
            tier: 'Bronze',
            lifetimePoints: 500 + amount,
            lastBonusAt: now,
            updatedAt: now
          });
          
          transaction.set(txRef, {
            userId,
            amount: 500 + amount, // Initial + daily
            type: 'earn',
            description: 'Account opening + First daily bonus',
            createdAt: now
          });
          
          return { success: true, pointsAdded: amount };
        }

        const data = profileDoc.data()!;
        const lastBonusAt = data.lastBonusAt?.toDate();
        
        // 24h Cooldown check
        if (lastBonusAt && (now.toDate().getTime() - lastBonusAt.getTime() < 24 * 60 * 60 * 1000)) {
          throw new Error("Bonus already claimed. Try again in 24 hours.");
        }

        const newPoints = (data.points || 0) + amount;
        const newLifetime = (data.lifetimePoints || 0) + amount;
        
        let tier = data.tier || 'Bronze';
        if (newLifetime >= 10000) tier = 'Platinum';
        else if (newLifetime >= 5000) tier = 'Gold';
        else if (newLifetime >= 1000) tier = 'Silver';

        transaction.update(profileRef, {
          points: newPoints,
          lifetimePoints: newLifetime,
          tier,
          lastBonusAt: now,
          updatedAt: now
        });

        transaction.set(firebase.db.collection('loyalty_transactions').doc(), {
          userId,
          amount,
          type: 'earn',
          description: 'Daily check-in bonus',
          createdAt: now
        });

        return { success: true, pointsAdded: amount };
      });

      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Redeem Reward API
  app.post("/api/loyalty/redeem", async (req, res) => {
    const firebase = initializeFirebase();
    if (!firebase) return res.status(500).json({ error: "Server error" });

    const { idToken, rewardId } = req.body;
    if (!idToken || !rewardId) return res.status(400).json({ error: "Auth and Reward ID required" });

    const REWARDS = {
      'free-delivery': { points: 25000, name: 'Free Delivery' },
      'polish-set': { points: 15000, name: 'Furniture Polish Set' },
      'bespoke-consult': { points: 50000, name: 'Bespoke Consultation' }
    };

    const reward = REWARDS[rewardId as keyof typeof REWARDS];
    if (!reward) return res.status(400).json({ error: "Invalid reward" });

    try {
      const decodedToken = await firebase.auth.verifyIdToken(idToken);
      const userId = decodedToken.uid;
      const profileRef = firebase.db.collection('loyalty_profiles').doc(userId);

      const result = await firebase.db.runTransaction(async (transaction) => {
        const profileDoc = await transaction.get(profileRef);
        if (!profileDoc.exists) throw new Error("Profile not found");

        const data = profileDoc.data()!;
        if ((data.points || 0) < reward.points) {
          throw new Error("Insufficient points");
        }

        const now = admin.firestore.Timestamp.now();
        
        transaction.update(profileRef, {
          points: data.points - reward.points,
          updatedAt: now
        });

        transaction.set(firebase.db.collection('loyalty_transactions').doc(), {
          userId,
          amount: reward.points,
          type: 'redeem',
          description: `Redeemed: ${reward.name}`,
          createdAt: now
        });

        return { success: true, rewardName: reward.name };
      });

      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
