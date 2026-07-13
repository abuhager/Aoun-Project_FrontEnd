// src/lib/firebase.ts
// تهيئة Firebase Client SDK للتحقق من الهاتف
// ─────────────────────────────────────────────────────────────
// متغيرات البيئة المطلوبة في .env.local:
//   NEXT_PUBLIC_FIREBASE_API_KEY
//   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
//   NEXT_PUBLIC_FIREBASE_PROJECT_ID

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth }                         from 'firebase/auth';

const firebaseConfig = {
  apiKey:    process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId:  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
};

// منع إعادة التهيئة عند Hot Reload
const app  = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(app);
