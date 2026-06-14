const env = import.meta.env || {};

export const APP_VERSION = "kurumsal-netlify-yayin-hazirligi";

export const appConfig = {
  mode: env.VITE_APP_MODE || "pilot",
  authMode: env.VITE_AUTH_MODE || "local",
};

export const backendConfig = {
  mode: env.VITE_BACKEND_MODE || "local",
  apiUrl: env.VITE_API_URL || "",
  apiKey: env.VITE_API_KEY || "",
};

export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: env.VITE_FIREBASE_APP_ID || "",
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || "",
};

export function isProductionMode() {
  return appConfig.mode === "production";
}

export function getBackendLabel() {
  if (backendConfig.mode === "firestore" && isFirebaseConfigured()) {
    return "Firebase Firestore backend";
  }

  if (backendConfig.mode === "remote" && backendConfig.apiUrl) {
    return "Uzak backend hazır";
  }

  return "Yerel demo modu";
}

export function isRemoteBackendEnabled() {
  return (backendConfig.mode === "remote" && Boolean(backendConfig.apiUrl)) ||
    (backendConfig.mode === "firestore" && isFirebaseConfigured());
}

export function isFirebaseAuthEnabled() {
  return appConfig.authMode === "firebase" &&
    isFirebaseConfigured();
}

export function isFirebaseConfigured() {
  return Boolean(firebaseConfig.apiKey) &&
    Boolean(firebaseConfig.authDomain) &&
    Boolean(firebaseConfig.projectId) &&
    Boolean(firebaseConfig.appId);
}
