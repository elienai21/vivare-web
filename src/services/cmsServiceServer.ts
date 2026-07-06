/**
 * CMS Service (Server-Side) — para uso em Server Components e Server
 * Actions (sem `"use client"`).
 *
 * Usa o Firebase **Web SDK** para leituras públicas (pages, blog). É
 * leitura pública, não precisa de credenciais Admin.
 *
 * Fix do gRPC: `initializeFirestore(app, { experimentalAutoDetectLongPolling })`
 * — o transporte gRPC padrão do Web SDK reclama de "GRPC error has no
 * .code" / "Could not reach Cloud Firestore backend" em contexto SSR
 * (Node.js/Vercel), porque depende de sockets HTTP/2 long-lived que são
 * frágeis nesse ambiente. O auto-detect mantém gRPC no browser e cai
 * pra HTTP long-polling em Node — sem ruído nem perda de perf.
 *
 * IMPORTANTE (histórico — HURDLE): NÃO reintroduzir preferência por
 * Admin SDK aqui. Uma refatoração anterior fez isso e quebrou o blog em
 * produção — quando as credenciais Admin não estão setadas (ou estão
 * parciais), o Admin SDK lançava erro, caía no catch e retornava lista
 * vazia ("Nenhum artigo publicado"). Leitura pública = Web SDK.
 */

import type { CmsPage } from "@/types/cms";

const PUBLISHED_COL = "pages";
const DRAFTS_COL = "pages_drafts";
const BLOG_COL = "blog_posts";
const FETCH_TIMEOUT = 8000;

/** Wrapper com timeout pra falhar rápido se o backend trava. */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return Promise.race([
        promise,
        new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
        ),
    ]);
}

/**
 * Inicializa (uma vez) e devolve a instância Firestore do Web SDK com
 * auto-detect de long-polling — robusto em SSR.
 */
async function getServerDb() {
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
        // initializeFirestore só pode rodar UMA vez por app, antes do
        // primeiro getFirestore. Se já foi inicializado em outro lugar
        // (lib/firebase.ts no client via SSR), recupera a instância.
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

/* ────────── CMS Pages ────────── */

/** Busca a versão PUBLICADA de uma página (Server Component safe). */
export async function getPublishedPageServer(pageId: string): Promise<CmsPage | null> {
    try {
        const { doc, getDoc } = await import('firebase/firestore');
        const db = await getServerDb();
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
        const { doc, getDoc } = await import('firebase/firestore');
        const db = await getServerDb();
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

/**
 * Lista posts publicados (ordenados por data desc).
 *
 * HURDLE: a versão anterior usava `orderBy("publishedAt", "desc")` na
 * query do Firestore. Isso (a) EXCLUI silenciosamente qualquer doc onde
 * `publishedAt` seja null/ausente — mesmo com `status: "published"` — e
 * (b) exige um índice composto (status + publishedAt) que, se ausente,
 * faz a query lançar erro → catch → lista vazia → "Nenhum artigo".
 * Resultado: posts publicados sumiam da página pública.
 *
 * Correção: filtra só por `status` (where simples, sem índice composto)
 * e ordena em memória. Robusto a `publishedAt` ausente.
 */
export async function listPublishedPostsServer(max: number = 20): Promise<BlogPost[]> {
    try {
        const { collection, getDocs, query, where, limit: firestoreLimit } = await import('firebase/firestore');
        const db = await getServerDb();
        const q = query(
            collection(db, BLOG_COL),
            where("status", "==", "published"),
            // Buscamos uma folga (max * 3) pra ordenar em memória sem
            // arriscar cortar posts recentes por ordem arbitrária do Firestore.
            firestoreLimit(Math.max(max * 3, 60)),
        );
        const snap = await withTimeout(getDocs(q), FETCH_TIMEOUT);
        const posts = snap.docs.map(d => ({ id: d.id, ...d.data() } as BlogPost));
        // Ordena por publishedAt; cai pra createdAt/updatedAt quando ausente.
        posts.sort((a, b) => {
            const da = a.publishedAt ?? a.createdAt ?? a.updatedAt ?? 0;
            const db_ = b.publishedAt ?? b.createdAt ?? b.updatedAt ?? 0;
            return db_ - da;
        });
        return posts.slice(0, max);
    } catch (err) {
        console.error("[Blog-Server] Erro ao listar posts:", err);
        return [];
    }
}

/**
 * Busca um post pelo slug.
 *
 * Filtra só por `slug` no Firestore (índice simples, sempre existe) e
 * confere `status === 'published'` em memória — mesmo motivo do HURDLE
 * em `listPublishedPostsServer`: o `where` composto (slug + status)
 * exigiria índice e podia falhar silenciosamente.
 */
export async function getPostBySlugServer(slug: string): Promise<BlogPost | null> {
    try {
        const { collection, getDocs, query, where, limit: firestoreLimit } = await import('firebase/firestore');
        const db = await getServerDb();
        const q = query(
            collection(db, BLOG_COL),
            where("slug", "==", slug),
            firestoreLimit(5),
        );
        const snap = await withTimeout(getDocs(q), FETCH_TIMEOUT);
        if (snap.empty) return null;
        const posts = snap.docs.map(d => ({ id: d.id, ...d.data() } as BlogPost));
        const published = posts.find(p => p.status === 'published');
        return published ?? null;
    } catch (err) {
        console.error(`[Blog-Server] Erro ao buscar post "${slug}":`, err);
        return null;
    }
}
