import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  browserLocalPersistence,
  browserPopupRedirectResolver,
  getAuth,
  initializeAuth,
  type Auth,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let authSingleton: Auth | undefined;

function assertConfig() {
  if (!firebaseConfig.apiKey || !firebaseConfig.appId) {
    throw new Error(
      "Firebase is not configured. Set NEXT_PUBLIC_FIREBASE_* in .env.local",
    );
  }
}

export function getFirebaseApp(): FirebaseApp {
  assertConfig();
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

/**
 * localStorage persistence avoids IndexedDB "closing/hidden" on Google popup.
 * Must pass popupRedirectResolver — without it signInWithPopup throws
 * auth/argument-error.
 */
export function getFirebaseAuth(): Auth {
  if (authSingleton) return authSingleton;
  const app = getFirebaseApp();
  if (typeof window === "undefined") {
    authSingleton = getAuth(app);
    return authSingleton;
  }
  try {
    authSingleton = initializeAuth(app, {
      persistence: browserLocalPersistence,
      popupRedirectResolver: browserPopupRedirectResolver,
    });
  } catch {
    authSingleton = getAuth(app);
  }
  return authSingleton;
}
