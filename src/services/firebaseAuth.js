import { initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
} from "firebase/auth";
import { firebaseConfig, isFirebaseAuthEnabled } from "../utils/appConfig.js";

let firebaseApp = null;
let firebaseAuth = null;

export function getFirebaseAuth() {
  if (!isFirebaseAuthEnabled()) {
    return null;
  }

  if (!firebaseApp) {
    firebaseApp = initializeApp(firebaseConfig);
    firebaseAuth = getAuth(firebaseApp);
  }

  return firebaseAuth;
}

export async function createFirebaseUser({ email, password }) {
  const auth = getFirebaseAuth();

  if (!auth) {
    throw new Error("Firebase auth yapılandırması hazır değil.");
  }

  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(credential.user);

    return credential.user;
  } catch (error) {
    throw new Error(getFirebaseAuthErrorMessage(error));
  }
}

export async function signInFirebaseUser({ email, password, requireEmailVerified = true }) {
  const auth = getFirebaseAuth();

  if (!auth) {
    throw new Error("Firebase auth yapılandırması hazır değil.");
  }

  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);

    if (requireEmailVerified && !credential.user.emailVerified) {
      await signOut(auth);
      throw new Error("E-posta doğrulanmadan giriş yapılamaz.");
    }

    return credential.user;
  } catch (error) {
    throw new Error(getFirebaseAuthErrorMessage(error));
  }
}

export async function updateFirebasePassword(newPassword) {
  const auth = getFirebaseAuth();

  if (!auth?.currentUser) {
    throw new Error("Şifre değiştirmek için aktif Firebase oturumu gerekli.");
  }

  try {
    await updatePassword(auth.currentUser, newPassword);
    return auth.currentUser;
  } catch (error) {
    throw new Error(getFirebaseAuthErrorMessage(error));
  }
}

export async function resendFirebaseVerificationEmail() {
  const auth = getFirebaseAuth();

  if (!auth?.currentUser) {
    throw new Error("Doğrulama e-postası için aktif Firebase oturumu gerekli.");
  }

  await sendEmailVerification(auth.currentUser);
  return auth.currentUser;
}

export async function sendFirebasePasswordReset(email) {
  const auth = getFirebaseAuth();

  if (!auth) {
    throw new Error("Firebase auth yapılandırması hazır değil.");
  }

  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    throw new Error(getFirebaseAuthErrorMessage(error));
  }
}

export async function signOutFirebaseUser() {
  const auth = getFirebaseAuth();

  if (auth) {
    await signOut(auth);
  }
}

function getFirebaseAuthErrorMessage(error) {
  if (error?.code === "auth/email-already-in-use") {
    return "Bu e-posta ile Firebase'de zaten bir öğrenci hesabı var.";
  }

  if (error?.code === "auth/invalid-email") {
    return "Öğrenci e-postası geçerli değil.";
  }

  if (error?.code === "auth/weak-password") {
    return "Geçici şifre Firebase için çok zayıf kaldı.";
  }

  if (error?.code === "auth/network-request-failed") {
    return "Firebase bağlantısı kurulamadı. İnternet bağlantısını kontrol edin.";
  }

  if (error?.code === "auth/api-key-not-valid.-please-pass-a-valid-api-key.") {
    return "Firebase API anahtarı geçerli değil. Firebase config bilgileri yeniden kopyalanmalı.";
  }

  if (error?.code === "auth/invalid-credential" || error?.code === "auth/wrong-password" || error?.code === "auth/user-not-found") {
    return "Firebase e-posta veya şifre hatalı.";
  }

  if (error?.code === "auth/requires-recent-login") {
    return "Şifre değiştirmek için çıkış yapıp tekrar giriş yapmalısın.";
  }

  return error?.message || "Firebase hesabı oluşturulamadı.";
}
