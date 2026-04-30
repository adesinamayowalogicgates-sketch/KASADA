import express from "express";
// import { createServer as createViteServer } from "vite"; // Removed top-level import to avoid production crash
import path from "path";
import { fileURLToPath } from "url";
import fs from 'fs';
import 'dotenv/config';
import { PRODUCTS, BUNDLES } from "./src/constants.ts";
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { GoogleGenAI, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini AI
let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is missing. AI features will use fallback logic.");
      return null;
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// Initialize Firebase Admin
let db: admin.firestore.Firestore | null = null;
let auth: admin.auth.Auth | null = null;

function initializeFirebase() {
  if (db && auth) return { db, auth };

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  let databaseId = process.env.FIREBASE_FIRESTORE_DATABASE_ID;
  
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
    db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);
    auth = getAuth(app);
    
    console.log(`Firebase Admin initialized successfully (Database: ${databaseId || '(default)'}).`);
    
    // Seed products if needed
    seedProducts(db);
    
    return { db, auth };
  } catch (error) {
    console.error("Failed to initialize Firebase Admin:", error);
    return null;
  }
}

async function seedProducts(db: admin.firestore.Firestore) {
  try {
    const productsSnapshot = await db.collection('products').limit(1).get();
    if (productsSnapshot.empty) {
      console.log("Seeding products to Firestore...");
      const batch = db.batch();
      PRODUCTS.forEach(product => {
        const productRef = db.collection('products').doc(product.id);
        batch.set(productRef, product);
      });
      await batch.commit();
      console.log("Product seeding complete.");
    }
  } catch (error) {
    console.error("Error seeding products:", error);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/products", async (req, res) => {
    const firebase = initializeFirebase();
    if (!firebase) return res.status(500).json({ error: "Server error" });
    
    try {
      const snapshot = await firebase.db.collection('products').get();
      const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    const firebase = initializeFirebase();
    if (!firebase) return res.status(500).json({ error: "Server error" });
    
    try {
      const doc = await firebase.db.collection('products').doc(req.params.id).get();
      if (!doc.exists) {
        // Try static data as fallback
        const staticProduct = PRODUCTS.find(p => p.id === req.params.id);
        if (staticProduct) return res.json(staticProduct);
        return res.status(404).json({ error: "Product not found" });
      }
      res.json({ id: doc.id, ...doc.data() });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

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

      // 2. Prepare Order and Loyalty Data
      const orderRef = firebase.db.collection('orders').doc();
      const loyaltyTxRef = firebase.db.collection('loyalty_transactions').doc();
      const profileRef = firebase.db.collection('loyalty_profiles').doc(userId);
      
      // 3. Atomic Transaction for Order + Loyalty + Stock
      const result = await firebase.db.runTransaction(async (transaction) => {
        let subtotal = 0;
        const validatedItems = [];
        const stockUpdates = [];

        for (const item of items) {
          const productRef = firebase.db.collection('products').doc(item.productId);
          const bundleRef = firebase.db.collection('bundles').doc(item.productId); // Bundles might not be in DB yet, but let's check products first
          
          const productDoc = await transaction.get(productRef);
          
          let itemPrice = 0;
          let itemName = '';
          let assemblyFee = 0;
          let availableStock = 0;

          if (productDoc.exists) {
            const product = productDoc.data()!;
            itemPrice = product.price;
            itemName = product.name;
            assemblyFee = product.assemblyCost || 0;
            availableStock = product.stock || 0;
          } else {
            // Fallback to static constants for evaluation if not in DB (bundles etc.)
            const staticProduct = PRODUCTS.find(p => p.id === item.productId);
            const staticBundle = BUNDLES.find(b => b.id === item.productId);

            if (staticProduct) {
              itemPrice = staticProduct.price;
              itemName = staticProduct.name;
              assemblyFee = staticProduct.assemblyCost || 0;
              availableStock = staticProduct.stock || 0;
            } else if (staticBundle) {
              itemPrice = staticBundle.discountPrice || staticBundle.price;
              itemName = staticBundle.name;
              assemblyFee = 0;
              availableStock = 999; // Bundles have virtual stock usually
            } else {
              throw new Error(`Product or Bundle ${item.productId} not found`);
            }
          }

          const quantity = parseInt(item.quantity);
          if (isNaN(quantity) || quantity <= 0) {
            throw new Error(`Invalid quantity for ${itemName}`);
          }

          if (availableStock < quantity) {
            throw new Error(`Insufficient stock for ${itemName}. Only ${availableStock} left.`);
          }

          const itemSubtotal = itemPrice * quantity;
          const assemblyCost = item.assembly ? assemblyFee * quantity : 0;
          subtotal += itemSubtotal + assemblyCost;

          validatedItems.push({
            productId: item.productId,
            name: itemName,
            quantity: quantity,
            price: itemPrice,
            assembly: !!item.assembly,
            assemblyCost: item.assembly ? assemblyFee : 0
          });

          // Queue stock decrement if it was a real product in DB
          if (productDoc.exists) {
            stockUpdates.push({ ref: productRef, newStock: availableStock - quantity });
          }
        }

        const deliveryFee = subtotal > 500000 ? 0 : 25000;
        const finalTotal = subtotal + deliveryFee;

        if (clientTotal !== undefined && Math.abs(clientTotal - finalTotal) > 1) { 
          throw new Error(`Price mismatch detected. Please refresh your cart. (Expected: ₦${finalTotal.toLocaleString()})`);
        }

        const pointsEarned = Math.floor(subtotal / 1000);
        const profileDoc = await transaction.get(profileRef);

        // Apply Stock Updates
        stockUpdates.forEach(update => {
          transaction.update(update.ref, { stock: update.newStock });
        });

        // Set Order
        transaction.set(orderRef, {
          userId,
          items: validatedItems,
          subtotal,
          deliveryFee,
          totalAmount: finalTotal,
          status: 'Processing',
          createdAt: admin.firestore.Timestamp.now(),
          shippingAddress: shippingAddress || 'Concierge Managed'
        });

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
            points: 500 + pointsEarned,
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

        return { success: true, orderId: orderRef.id };
      });

      res.json(result);

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

  // AI Recommendations API
  app.post("/api/ai/complete-the-look", async (req, res) => {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ error: "Missing productId" });
    }

    const currentProduct = PRODUCTS.find(p => p.id === productId);
    if (!currentProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    const ai = getGeminiClient();
    if (!ai) {
      // Fallback if no API key
      const fallback = PRODUCTS
        .filter(p => p.id !== productId && p.category === currentProduct.category)
        .slice(0, 3)
        .map(p => p.id);
      return res.json({ recommendedIds: fallback });
    }

    try {
      const otherProducts = PRODUCTS.filter(p => p.id !== productId);
      
      const prompt = `
        You are a high-end interior designer for KASADA, a luxury Nigerian furniture brand.
        A customer is currently viewing the following product:
        Name: ${currentProduct.name}
        Category: ${currentProduct.category}
        Material: ${currentProduct.material}
        Style: ${currentProduct.style}
        Description: ${currentProduct.description}

        Based on this product, select exactly 3 complementary products from the list below that would "Complete the Look" for a cohesive room design.
        Consider style, material compatibility, and functional pairing (e.g., if it's a bed, suggest a nightstand or dresser).

        Available Products:
        ${otherProducts.map(p => `ID: ${p.id}, Name: ${p.name}, Category: ${p.category}, Style: ${p.style}`).join('\n')}

        Return only the IDs of the 3 selected products in a JSON array.
      `;

      const result = await ai.models.generateContent({
        model: "gemini-1.5-flash-latest",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING
            }
          }
        }
      });

      const text = result.text || "[]";
      const recommendedIds = JSON.parse(text || "[]");
      res.json({ recommendedIds });
    } catch (error: any) {
      console.error("Gemini AI Error:", error);
      // Fallback
      const fallback = PRODUCTS
        .filter(p => p.id !== productId && p.category === currentProduct.category)
        .slice(0, 3)
        .map(p => p.id);
      res.json({ recommendedIds: fallback });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
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
