/**
 * CMS Service (Server-Side) — Para uso em Server Components (sem "use client").
 *
 * Usa Firebase Admin SDK leve ou fetch direto ao Firestore REST.
 * Aqui usamos a abordagem de import dinâmico do firebase/firestore com
 * inicialização condicional para funcionar tanto em SSR quanto CSR.
 */

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, getDoc, collection, getDocs, query, where, orderBy, limit as firestoreLimit } from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function getServerDb() {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    return getFirestore(app);
}

/** Wrapper com timeout para evitar que o build trave quando Firestore está offline. */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return Promise.race([
        promise,
        new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
        ),
    ]);
}

/* ────────── CMS Pages ────────── */

import type { CmsPage } from "@/types/cms";

const PUBLISHED_COL = "pages";
const DRAFTS_COL = "pages_drafts";
const FETCH_TIMEOUT = 8000;

/** Busca a versão PUBLICADA de uma página (Server Component safe). */
export async function getPublishedPageServer(pageId: string): Promise<CmsPage | null> {
    try {
        const db = getServerDb();
        const snap = await withTimeout(getDoc(doc(db, PUBLISHED_COL, pageId)), FETCH_TIMEOUT);
        if (!snap.exists()) return null;
        return { id: snap.id, ...snap.data() } as CmsPage;
    } catch (err) {
        console.error(`[CMS-Server] Erro ao buscar "${pageId}":`, err);
        return null;
    }
}

/** Busca a versão RASCUNHO de uma página (para preview). */
export async function getDraftPageServer(pageId: string): Promise<CmsPage | null> {
    try {
        const db = getServerDb();
        const snap = await withTimeout(getDoc(doc(db, DRAFTS_COL, pageId)), FETCH_TIMEOUT);
        if (!snap.exists()) return null;
        return { id: snap.id, ...snap.data() } as CmsPage;
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
    content: string;         // HTML ou Markdown
    coverImage?: string;
    author: string;
    tags: string[];
    status: 'draft' | 'published';
    publishedAt?: number;
    createdAt: number;
    updatedAt: number;
    updatedBy?: string;
}

const BLOG_COL = "blog_posts";

/** Lista posts publicados (ordenados por data desc). */
export async function listPublishedPostsServer(max: number = 20): Promise<BlogPost[]> {
    try {
        const db = getServerDb();
        const q = query(
            collection(db, BLOG_COL),
            where("status", "==", "published"),
            orderBy("publishedAt", "desc"),
            firestoreLimit(max)
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
        const db = getServerDb();
        const q = query(
            collection(db, BLOG_COL),
            where("slug", "==", slug),
            where("status", "==", "published"),
            firestoreLimit(1)
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
