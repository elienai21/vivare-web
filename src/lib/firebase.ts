import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
    getFirestore,
    initializeFirestore,
    type Firestore,
} from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

/**
 * Inicialização do Firestore com auto-detect de long-polling.
 *
 * Quando este módulo carrega em SSR (Server Components rebatendo via
 * cliente components que importam `auth`/`db`), o transporte gRPC do
 * Web SDK não funciona bem em Node — gera "GRPC error has no .code" e
 * "Could not reach Cloud Firestore backend" no console.
 *
 * `experimentalAutoDetectLongPolling: true` deixa o SDK decidir: usa
 * gRPC quando consegue (browser moderno), cai pra HTTP long-polling
 * quando detecta restrições (Node.js, proxies, firewalls). Auto-detect
 * é mais robusto que `forceLongPolling` porque mantém performance no
 * browser e estabilidade no server.
 *
 * IMPORTANTE: tem que ser chamado ANTES de qualquer `getFirestore(app)`
 * no mesmo app. Por isso fica aqui — `lib/firebase.ts` é o entrypoint
 * comum de TODO uso do Web SDK no projeto.
 */
let db: Firestore;
try {
    db = initializeFirestore(app, {
        experimentalAutoDetectLongPolling: true,
    });
} catch {
    // Já inicializado em algum lugar (HMR do Turbopack pode causar) —
    // recupera a instância existente.
    db = getFirestore(app);
}

export { app, auth, db };
