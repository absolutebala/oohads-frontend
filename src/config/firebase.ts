import { initializeApp, FirebaseApp, getApps } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const isDevelopment = process.env.REACT_APP_ENVIRONMENT === 'development';

/** Whether Firebase was successfully initialized. False when env vars are absent. */
export let firebaseReady = false;

let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;
let storage: FirebaseStorage;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  firestore = getFirestore(app);
  storage = getStorage(app);
  firebaseReady = true;

  if (isDevelopment) {
    console.log('[Firebase] Initialized successfully in development mode');
  }
} catch (error) {
  console.warn(
    '[Firebase] Initialization skipped – environment variables not configured. ' +
    'Auth and database features will be unavailable.',
    error,
  );
  // These stubs are intentionally uninitialized; all callers must guard with
  // `firebaseReady` before invoking Firebase SDK methods.
  app = null as unknown as FirebaseApp;
  auth = null as unknown as Auth;
  firestore = null as unknown as Firestore;
  storage = null as unknown as FirebaseStorage;
}

export { app, auth, firestore, storage, isDevelopment };
