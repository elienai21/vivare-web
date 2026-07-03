/**
 * CMS Service (Server-Side) — para uso em Server Components e Server
 * Actions (sem `"use client"`).
 *
 * Estratégia em duas camadas:
 *
 *   1. **Firebase Admin SDK (preferido)** — usa REST, sem GRPC, robusto
 *      em Node.js/Vercel. Quando `FIREBASE_PROJECT_ID/CLIENT_EMAIL/
 *      PRIVATE_KEY` estão setadas, usamos este caminho.
 *
 *   2. **Firebase Web SDK (fallback)** — usa GRPC, ocasionalmente
 *      reclama de "Could not reach Cloud Firestore backend" em contexto
 *      server-side. Permanece como fallback pra dev sem service account
 *      configurado, mas em produção sempre cai no caminho Admin.
 *
 * Esse switch zera o erro "@firebase/firestore: GRPC error has no .code"
 * que apareceu no dev quando o Web SDK perde conexão tentando ler
 * `pages/home` durante SSR.
 */

import type { CmsPage } from "@/types/cms";

const PUBLISHED_COL = "pages";
const DRAFTS_COL = "pages_drafts";
const BLOG_COL = "blog_posts";
const FETCH_TIMEOUT = 8000;

/** Indica se temos credenciais Admin disponíveis pra preferir esse caminho. */
function hasAdminCredentials(): boolean {
    return Boolean(
        (process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT)
        && process.env.FIREBASE_CLIENT_EMAIL
        && process.env.FIREBASE_PRIVATE_KEY,
    );
}

/** Wrapper com timeout pra falhar rápido se o backend trava. */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return Promise.race([
        promise,
        new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
        ),
    ]);
}

// ─────────────────── Admin SDK path (preferido) ───────────────────

async function getDocAdmin(collectionName: string, docId: string): Promise<Record<string, unknown> | null> {
    const { getAdminDb } = await import('@/lib/firebase-admin');
    const snap = await withTimeout(
        getAdminDb().collection(collectionName).doc(docId).get(),
        FETCH_TIMEOUT,
    );
    if (!snap.exists) return null;
    return { id: snap.id, ...snap.data() } as Record<string, unknown>;
}

async function queryAdmin(
    collectionName: string,
    filters: Array<[string, FirebaseFirestore.WhereFilterOp, unknown]>,
    options: { orderBy?: [string, 'asc' | 'desc']; limit?: number } = {},
): Promise<Array<Record<string, unknown>>> {
    const { getAdminDb } = await import('@/lib/firebase-admin');
    let q: FirebaseFirestore.Query = getAdminDb().collection(collectionName);
    for (const [field, op, value] of filters) {
        q = q.where(field, op, value);
    }
    if (options.orderBy) q = q.orderBy(options.orderBy[0], options.orderBy[1]);
    if (options.limit) q = q.limit(options.limit);
    const snap = await withTimeout(q.get(), FETCH_TIMEOUT);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Record<string, unknown>));
}

// ─────────────────── Web SDK path (fallback) ───────────────────
//
// IMPORTANTE: usamos `initializeFirestore` com `experimentalForceLongPolling`
// pra evitar o "GRPC error has no .code" / "Could not reach Cloud Firestore
// backend" que o Web SDK lança em contexto Node.js. gRPC depende de HTTP/2
// nativo e sockets long-lived — frágil em Vercel Functions e em dev
// (Turbopack recria contextos com frequência). Long-polling usa HTTP
// requests curtos, ~5% mais lento mas robusto.

async function getOrInitWebFirestore() {
    const { initializeApp, getApps, getApp } = await import('firebase/app');
    const { getFirestore, initializeFirestore } = await import('firebase/firestore');

    const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };

    const isNewApp = getApps().length === 0;
    const app = isNewApp ? initializeApp(firebaseConfig) : getApp();

    if (isNewApp) {
        // initializeFirestore só pode ser chamado UMA vez por app — antes
        // do primeiro getFirestore. Se já foi inicializado em outro lugar
        // (ex.: lib/firebase.ts pelo lado client via SSR), aqui pega
        // a instância existente. `autoDetectLongPolling` mantém gRPC no
        // browser e cai pra HTTP long-polling em Node.
        try {
            return initializeFirestore(app, {
                experimentalAutoDetectLongPolling: true,
            });
        } catch {
            return getFirestore(app);
        }
    }
    return getFirestore(app);
}

async function getDocWeb(collectionName: string, docId: string): Promise<Record<string, unknown> | null> {
    const { doc, getDoc } = await import('firebase/firestore');
    const db = await getOrInitWebFirestore();
    const snap = await withTimeout(getDoc(doc(db, collectionName, docId)), FETCH_TIMEOUT);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Record<string, unknown>;
}

// ─────────────────── Public API ───────────────────

/** Busca a versão PUBLICADA de uma página (Server Component safe). */
export async function getPublishedPageServer(pageId: string): Promise<CmsPage | null> {
    try {
        const data = hasAdminCredentials()
            ? await getDocAdmin(PUBLISHED_COL, pageId)
            : await getDocWeb(PUBLISHED_COL, pageId);
        return data ? (data as unknown as CmsPage) : null;
    } catch (err) {
        console.error(`[CMS-Server] Erro ao buscar "${pageId}":`, err);
        return null;
    }
}

/** Busca a versão RASCUNHO de uma página (para preview). */
export async function getDraftPageServer(pageId: string): Promise<CmsPage | null> {
    try {
        const data = hasAdminCredentials()
            ? await getDocAdmin(DRAFTS_COL, pageId)
            : await getDocWeb(DRAFTS_COL, pageId);
        return data ? (data as unknown as CmsPage) : null;
    } catch (err) {
        console.error(`[CMS-Server] Erro ao buscar rascunho "${pageId}":`, err);
        return null;
    }
}

/* ────────── Blog Posts ────────── */

export interface BlogPost {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    coverImage?: string;
    author: string;
    tags: string[];
    status: 'draft' | 'published';
    publishedAt?: number;
    createdAt: number;
    updatedAt: number;
    updatedBy?: string;
}

/** Lista posts publicados (ordenados por data desc). */
export async function listPublishedPostsServer(max: number = 20): Promise<BlogPost[]> {
    try {
        if (hasAdminCredentials()) {
            const rows = await queryAdmin(
                BLOG_COL,
                [['status', '==', 'published']],
                { orderBy: ['publishedAt', 'desc'], limit: max },
            );
            return rows as unknown as BlogPost[];
        }
        // Fallback Web SDK — usa long-polling pra evitar GRPC issues.
        const { collection, getDocs, query, where, orderBy, limit: firestoreLimit } = await import('firebase/firestore');
        const db = await getOrInitWebFirestore();
        const q = query(
            collection(db, BLOG_COL),
            where("status", "==", "published"),
            orderBy("publishedAt", "desc"),
            firestoreLimit(max),
        );
        const snap = await withTimeout(getDocs(q), FETCH_TIMEOUT);
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as BlogPost));
    } catch (err) {
        console.error("[Blog-Server] Erro ao listar posts:", err);
        return [];
    }
}

/** Busca um post pelo slug. */
export async function getPostBySlugServer(slug: string): Promise<BlogPost | null> {
    try {
        if (hasAdminCredentials()) {
            const rows = await queryAdmin(
                BLOG_COL,
                [
                    ['slug', '==', slug],
                    ['status', '==', 'published'],
                ],
                { limit: 1 },
            );
            return rows[0] ? (rows[0] as unknown as BlogPost) : null;
        }
        // Fallback Web SDK — usa long-polling pra evitar GRPC issues.
        const { collection, getDocs, query, where, limit: firestoreLimit } = await import('firebase/firestore');
        const db = await getOrInitWebFirestore();
        const q = query(
            collection(db, BLOG_COL),
            where("slug", "==", slug),
            where("status", "==", "published"),
            firestoreLimit(1),
        );
        const snap = await withTimeout(getDocs(q), FETCH_TIMEOUT);
        if (snap.empty) return null;
        const d = snap.docs[0];
        return { id: d.id, ...d.data() } as BlogPost;
    } catch (err) {
        console.error(`[Blog-Server] Erro ao buscar post "${slug}":`, err);
        return null;
    }
}
