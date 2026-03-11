"use client";

/**
 * CMS Service — CRUD para páginas editoriais no Firestore.
 *
 * Collections:
 *   • pages/{id}        → Versão publicada (leitura pública)
 *   • pages_drafts/{id} → Versão rascunho (leitura admin)
 */

import { db } from "@/lib/firebase";
import {
    doc,
    getDoc,
    setDoc,
    getDocs,
    collection,
    serverTimestamp,
    Timestamp,
} from "firebase/firestore";
import type { CmsPage, CmsPageStatus } from "@/types/cms";

const PUBLISHED_COL = "pages";
const DRAFTS_COL = "pages_drafts";

/* ────────── READ ────────── */

/** Busca a versão PUBLICADA de uma página (para uso no site público). */
export async function getPublishedPage(pageId: string): Promise<CmsPage | null> {
    try {
        const snap = await getDoc(doc(db, PUBLISHED_COL, pageId));
        if (!snap.exists()) return null;
        return { id: snap.id, ...snap.data() } as CmsPage;
    } catch (err) {
        console.error(`[CMS] Erro ao buscar publicada "${pageId}":`, err);
        return null;
    }
}

/** Busca a versão RASCUNHO de uma página (admin/preview). */
export async function getDraftPage(pageId: string): Promise<CmsPage | null> {
    try {
        const snap = await getDoc(doc(db, DRAFTS_COL, pageId));
        if (!snap.exists()) return null;
        return { id: snap.id, ...snap.data() } as CmsPage;
    } catch (err) {
        console.error(`[CMS] Erro ao buscar rascunho "${pageId}":`, err);
        return null;
    }
}

/** Lista todas as páginas (combina publicadas + rascunhos). */
export async function listAllPages(): Promise<CmsPage[]> {
    const pagesMap = new Map<string, CmsPage>();

    try {
        // Primeiro, publicadas
        const pubSnap = await getDocs(collection(db, PUBLISHED_COL));
        pubSnap.forEach((d) => {
            pagesMap.set(d.id, { id: d.id, ...d.data() } as CmsPage);
        });

        // Depois, rascunhos (sobrescreve com status atualizado)
        const draftSnap = await getDocs(collection(db, DRAFTS_COL));
        draftSnap.forEach((d) => {
            const existing = pagesMap.get(d.id);
            const draftData = { id: d.id, ...d.data() } as CmsPage;
            if (existing) {
                // Se existe publicada, preservamos `publishedAt` mas marcamos que há rascunho
                pagesMap.set(d.id, {
                    ...draftData,
                    publishedAt: existing.publishedAt,
                });
            } else {
                pagesMap.set(d.id, draftData);
            }
        });
    } catch (err) {
        console.error("[CMS] Erro ao listar páginas:", err);
    }

    return Array.from(pagesMap.values());
}

/* ────────── WRITE ────────── */

/** Salva conteúdo como RASCUNHO (não afeta o site público). */
export async function saveDraft(
    pageId: string,
    data: Partial<CmsPage>,
    editorEmail?: string
): Promise<void> {
    const payload: Record<string, unknown> = {
        ...data,
        id: pageId,
        status: 'draft' as CmsPageStatus,
        updatedAt: Date.now(),
        updatedBy: editorEmail || 'admin',
    };

    await setDoc(doc(db, DRAFTS_COL, pageId), payload, { merge: true });
}

/** Publica: copia rascunho → publicado. */
export async function publishPage(
    pageId: string,
    editorEmail?: string
): Promise<void> {
    // 1. Buscar o rascunho atual
    const draft = await getDraftPage(pageId);
    if (!draft) {
        throw new Error(`Rascunho "${pageId}" não encontrado. Salve um rascunho primeiro.`);
    }

    // 2. Copiar para a collection publicada
    const publishedData: Record<string, unknown> = {
        ...draft,
        status: 'published' as CmsPageStatus,
        publishedAt: Date.now(),
        updatedAt: Date.now(),
        updatedBy: editorEmail || 'admin',
    };

    await setDoc(doc(db, PUBLISHED_COL, pageId), publishedData);

    // 3. Atualizar o status do rascunho
    await setDoc(doc(db, DRAFTS_COL, pageId), {
        ...draft,
        status: 'published' as CmsPageStatus,
        publishedAt: publishedData.publishedAt,
        updatedAt: publishedData.updatedAt,
    });
}
