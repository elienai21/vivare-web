import { cert, getApps, initializeApp, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore, type Firestore, type CollectionReference } from 'firebase-admin/firestore';

/**
 * Firebase Admin SDK — initialização LAZY.
 *
 * Por que lazy: import deste módulo é eager (top-level), mas o init
 * usa env vars de runtime. Em testes unitários (vitest), arquivos como
 * `checkout-auth.ts` importam isto pra `collections.rateLimits` mas
 * nunca *acessam* o Firestore. Sem lazy, todo `import` quebraria os
 * testes com `FIREBASE_PROJECT_ID não configurada`.
 *
 * Credenciais via env (`FIREBASE_PROJECT_ID`/`CLIENT_EMAIL`/`PRIVATE_KEY`)
 * ou ADC como fallback. Vercel armazena `\n` literal — decodificamos.
 */
let _initialized = false;

function ensureInit() {
    if (_initialized || getApps().length > 0) {
        _initialized = true;
        return;
    }

    const projectId = process.env.FIREBASE_PROJECT_ID
        || process.env.GOOGLE_CLOUD_PROJECT
        || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (projectId && clientEmail && privateKey) {
        const credential: ServiceAccount = { projectId, clientEmail, privateKey };
        initializeApp({ credential: cert(credential), projectId });
        _initialized = true;
        return;
    }

    if (!projectId) {
        throw new Error(
            'firebase-admin não conseguiu inicializar: defina FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY no .env.local (ou GOOGLE_APPLICATION_CREDENTIALS apontando pra um service-account JSON).',
        );
    }
    initializeApp({ projectId });
    _initialized = true;
}

/** Handle do Firestore Admin. Cada chamada garante init. */
export function getAdminDb(): Firestore {
    ensureInit();
    return getFirestore();
}

/**
 * Collection refs com lazy access — chamar `collections.checkouts`
 * dispara o init na primeira leitura, não no import. Permite testes
 * unitários que só importam helpers sem precisar de env Firebase.
 */
export const collections = {
    get checkouts(): CollectionReference {
        return getAdminDb().collection('checkouts');
    },
    get webhookEvents(): CollectionReference {
        return getAdminDb().collection('webhook_events');
    },
    get reservationOrphans(): CollectionReference {
        return getAdminDb().collection('reservation_orphans');
    },
    get rateLimits(): CollectionReference {
        return getAdminDb().collection('rate_limits');
    },
} as const;

/** Compat: alguns módulos importam `adminDb` direto. */
export const adminDb = new Proxy({} as Firestore, {
    get(_target, prop) {
        return getAdminDb()[prop as keyof Firestore];
    },
});
