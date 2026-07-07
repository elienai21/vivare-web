/**
 * CMS Service (Server-Side) — para Server Components / Server Actions.
 *
 * Usa a **API REST do Firestore** (HTTP) em vez do Web SDK (gRPC).
 *
 * HURDLE (crítico): o Firebase Web SDK NÃO funciona confiável em
 * contexto server-side (Vercel Functions / Node.js). O transporte gRPC
 * falha ao conectar ("Could not reach Cloud Firestore backend"), o SDK
 * entra em modo offline e retorna cache vazio (0 docs) SEM lançar erro.
 * Sintoma: página pública /blog e / mostravam vazio enquanto o admin
 * (que roda no browser, onde o Web SDK funciona) mostrava os dados.
 * `experimentalAutoDetectLongPolling` não resolveu em produção.
 *
 * A REST API é HTTP puro — funciona igual no browser e no servidor,
 * sem gRPC. Usa a API key pública (`NEXT_PUBLIC_FIREBASE_API_KEY`) e
 * respeita as Security Rules (leitura pública quando as regras permitem).
 * Não precisa de credenciais Admin.
 */

import type { CmsPage } from "@/types/cms";

const PUBLISHED_COL = "pages";
const DRAFTS_COL = "pages_drafts";
const BLOG_COL = "blog_posts";
const FETCH_TIMEOUT = 8000;

function projectId(): string {
    return process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "";
}
function apiKey(): string {
    return process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "";
}
function restBase(): string {
    return `https://firestore.googleapis.com/v1/projects/${projectId()}/databases/(default)/documents`;
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
    return Promise.race([
        p,
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)),
    ]);
}

// ── Firestore REST value parsing ────────────────────────────────────
// A REST API devolve campos "tipados": { stringValue }, { integerValue },
// { timestampValue }, { arrayValue }, { mapValue }, etc. Convertemos pra
// valores JS planos.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseValue(v: any): unknown {
    if (v == null) return null;
    if (v.stringValue !== undefined) return v.stringValue;
    if (v.integerValue !== undefined) return Number(v.integerValue);
    if (v.doubleValue !== undefined) return v.doubleValue;
    if (v.booleanValue !== undefined) return v.booleanValue;
    if (v.timestampValue !== undefined) return v.timestampValue;
    if (v.nullValue !== undefined) return null;
    if (v.arrayValue !== undefined) return (v.arrayValue.values || []).map(parseValue);
    if (v.mapValue !== undefined) return parseFields(v.mapValue.fields || {});
    return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseFields(fields: Record<string, any>): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(fields)) out[k] = parseValue(v);
    return out;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseDoc(doc: any): Record<string, unknown> {
    const id = String(doc.name || "").split("/").pop() || "";
    return { id, ...parseFields(doc.fields || {}) };
}

/** GET de um documento específico. Retorna null se não existir (404). */
async function restGetDoc(collection: string, docId: string): Promise<Record<string, unknown> | null> {
    const url = `${restBase()}/${collection}/${encodeURIComponent(docId)}?key=${apiKey()}`;
    const res = await withTimeout(fetch(url, { cache: "no-store" }), FETCH_TIMEOUT);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Firestore REST GET ${collection}/${docId} -> ${res.status}`);
    const data = await res.json();
    if (!data.fields) return null;
    return parseDoc(data);
}

/** Lista todos os docs de uma collection (paginado, até `max`). */
async function restListCollection(collection: string, max = 300): Promise<Array<Record<string, unknown>>> {
    const out: Array<Record<string, unknown>> = [];
    let pageToken: string | undefined;
    do {
        const params = new URLSearchParams({ key: apiKey(), pageSize: "100" });
        if (pageToken) params.set("pageToken", pageToken);
        const url = `${restBase()}/${collection}?${params.toString()}`;
        const res = await withTimeout(fetch(url, { cache: "no-store" }), FETCH_TIMEOUT);
        if (!res.ok) throw new Error(`Firestore REST LIST ${collection} -> ${res.status}`);
        const data = await res.json();
        for (const doc of data.documents || []) out.push(parseDoc(doc));
        pageToken = data.nextPageToken;
    } while (pageToken && out.length < max);
    return out;
}

/* ────────── CMS Pages ────────── */

export async function getPublishedPageServer(pageId: string): Promise<CmsPage | null> {
    try {
        const doc = await restGetDoc(PUBLISHED_COL, pageId);
        return doc ? (doc as unknown as CmsPage) : null;
    } catch (err) {
        console.error(`[CMS-Server] Erro ao buscar "${pageId}":`, err);
        return null;
    }
}

export async function getDraftPageServer(pageId: string): Promise<CmsPage | null> {
    try {
        const doc = await restGetDoc(DRAFTS_COL, pageId);
        return doc ? (doc as unknown as CmsPage) : null;
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

/** Lista posts publicados (ordenados por data desc). Filtra e ordena em JS. */
export async function listPublishedPostsServer(max: number = 20): Promise<BlogPost[]> {
    try {
        const all = await restListCollection(BLOG_COL);
        const published = (all as unknown as BlogPost[]).filter(p => p.status === 'published');
        published.sort((a, b) => {
            const da = a.publishedAt ?? a.createdAt ?? a.updatedAt ?? 0;
            const db = b.publishedAt ?? b.createdAt ?? b.updatedAt ?? 0;
            return db - da;
        });
        return published.slice(0, max);
    } catch (err) {
        console.error("[Blog-Server] Erro ao listar posts:", err);
        return [];
    }
}

/** Busca um post publicado pelo slug. */
export async function getPostBySlugServer(slug: string): Promise<BlogPost | null> {
    try {
        const all = await restListCollection(BLOG_COL);
        const post = (all as unknown as BlogPost[]).find(
            p => p.slug === slug && p.status === 'published',
        );
        return post ?? null;
    } catch (err) {
        console.error(`[Blog-Server] Erro ao buscar post "${slug}":`, err);
        return null;
    }
}
