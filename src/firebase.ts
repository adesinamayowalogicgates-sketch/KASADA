/// <reference types="vite/client" />
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocFromServer,
  initializeFirestore
} from 'firebase/firestore';
import { handleFirestoreError as handleFirestoreErrorUtil, OperationType } from './lib/firebaseUtils';

// Import config from environment variables
const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
};

const rawDatabaseId = import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID;

// Sanitize database ID to remove common prefixes like "Use: " and illegal characters
const sanitizeDatabaseId = (id: string | undefined): string | undefined => {
  if (!id) return undefined;
  // Remove "Use: ", "Database: ", etc. and anything after whitespace
  let clean = id.toString().replace(/^(Use|Database|ID)\s*:\s*/i, '').trim().split(/\s/)[0];
  // Strip anything that isn't a lowercase letter, number, or hyphen
  clean = clean.toLowerCase().replace(/[^a-z0-9-]/g, '');
  return clean || undefined;
};

const firestoreDatabaseId = sanitizeDatabaseId(rawDatabaseId);

// Log missing variables (safely)
const missingVars = Object.entries(firebaseConfig)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (!firestoreDatabaseId) missingVars.push('VITE_FIREBASE_FIRESTORE_DATABASE_ID');

if (missingVars.length > 0) {
  console.error("Missing Firebase environment variables: ", missingVars.join(", "));
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// Ensure persistence is set
setPersistence(auth, browserLocalPersistence);

// Force long polling for environments with restrictive network rules
const firestoreSettings = {
  experimentalForceLongPolling: true,
  useFetchStreams: false // More stable in some iframe/sandbox environments
};

export const db = firestoreDatabaseId 
  ? initializeFirestore(app, firestoreSettings, firestoreDatabaseId)
  : initializeFirestore(app, firestoreSettings);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Auth Helpers
export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logout = () => signOut(auth);

// Firestore Error Handler Wrapper
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  return handleFirestoreErrorUtil(error, operationType, path, auth);
}

export { OperationType };

// Connection Test
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. ");
    }
  }
}
testConnection();
