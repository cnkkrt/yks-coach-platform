import { getApp, getApps, initializeApp } from "firebase/app";
import { doc, getDoc, getFirestore, serverTimestamp, setDoc } from "firebase/firestore";
import { backendConfig, firebaseConfig, isRemoteBackendEnabled } from "./appConfig.js";

const FIRESTORE_DATA_COLLECTION = "platformData";
const FIRESTORE_DATA_DOCUMENT = "main";

export async function loadRemoteStudents() {
  if (!isRemoteBackendEnabled()) return null;

  if (backendConfig.mode === "firestore") {
    const payload = await loadRemoteAppData();
    return payload?.students || [];
  }

  const response = await fetch(`${backendConfig.apiUrl.replace(/\/$/, "")}/students`, {
    headers: createHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Uzak veri okunamadı: ${response.status}`);
  }

  const payload = await response.json();
  return Array.isArray(payload) ? payload : payload.students;
}

export async function saveRemoteStudents(students) {
  if (!isRemoteBackendEnabled()) return;

  if (backendConfig.mode === "firestore") {
    await saveRemoteAppData({ students });
    return;
  }

  const response = await fetch(`${backendConfig.apiUrl.replace(/\/$/, "")}/students`, {
    method: "PUT",
    headers: createHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ students }),
  });

  if (!response.ok) {
    throw new Error(`Uzak veri kaydedilemedi: ${response.status}`);
  }
}

export async function loadRemoteAppData() {
  if (!isRemoteBackendEnabled()) return null;

  if (backendConfig.mode !== "firestore") {
    const students = await loadRemoteStudents();
    return { students, accounts: null };
  }

  const snapshot = await getDoc(getFirestoreDataDoc());

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data() || {};
  return {
    students: Array.isArray(data.students) ? data.students : [],
    accounts: Array.isArray(data.accounts) ? data.accounts : null,
  };
}

export async function saveRemoteAppData({ students, accounts }) {
  if (!isRemoteBackendEnabled()) return;

  if (backendConfig.mode !== "firestore") {
    if (Array.isArray(students)) {
      await saveRemoteStudents(students);
    }
    return;
  }

  const payload = {
    updatedAt: serverTimestamp(),
  };

  if (Array.isArray(students)) {
    payload.students = sanitizeFirestoreValue(students);
  }

  if (Array.isArray(accounts)) {
    payload.accounts = sanitizeFirestoreValue(accounts);
  }

  await setDoc(getFirestoreDataDoc(), payload, { merge: true });
}

export function createBackupPayload({ students, accounts, version }) {
  return {
    app: "yks-kocluk-platformu",
    version,
    exportedAt: new Date().toISOString(),
    accounts,
    students,
  };
}

export function downloadJsonBackup(payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `yks-kocluk-yedek-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function readBackupFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const payload = JSON.parse(String(reader.result || "{}"));
        const students = Array.isArray(payload) ? payload : payload.students;

        if (!Array.isArray(students)) {
          reject(new Error("Yedek dosyasında öğrenci listesi bulunamadı."));
          return;
        }

        resolve({
          students,
          accounts: Array.isArray(payload.accounts) ? payload.accounts : null,
        });
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error("Yedek dosyası okunamadı."));
    reader.readAsText(file);
  });
}

function createHeaders(extraHeaders = {}) {
  return {
    ...(backendConfig.apiKey ? { Authorization: `Bearer ${backendConfig.apiKey}` } : {}),
    ...extraHeaders,
  };
}

function getFirestoreDataDoc() {
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  const database = getFirestore(app);
  return doc(database, FIRESTORE_DATA_COLLECTION, FIRESTORE_DATA_DOCUMENT);
}

function sanitizeFirestoreValue(value) {
  if (Array.isArray(value)) {
    return value.map(sanitizeFirestoreValue);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, entryValue]) => entryValue !== undefined)
        .map(([key, entryValue]) => [key, sanitizeFirestoreValue(entryValue)]),
    );
  }

  return value;
}
