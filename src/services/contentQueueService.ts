"use client";

import { db } from "@/lib/firebase";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    query,
    where,
} from "firebase/firestore";
import type { ContentQueueItem, FeedSource, ContentStatus } from "@/types/content-queue";

const QUEUE_COL = "content_queue";
const SOURCES_COL = "feed_sources";

/* ────────── Fila de Conteúdo ────────── */

export async function listPendingQueue(): Promise<ContentQueueItem[]> {
    try {
        const q = query(
            collection(db, QUEUE_COL),
            where("status", "==", "pending_review")
        );
        const snap = await getDocs(q);
        return snap.docs
            .map(d => ({ id: d.id, ...d.data() } as ContentQueueItem))
            .sort((a, b) => (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0));
    } catch (error) {
        console.error("[ContentQueue] Erro ao listar fila:", error);
        return [];
    }
}

export async function listHistory(
    statusFilter?: ContentStatus
): Promise<ContentQueueItem[]> {
    try {
        let q;
        if (statusFilter) {
            q = query(
                collection(db, QUEUE_COL),
                where("status", "==", statusFilter)
            );
        } else {
            q = query(
                collection(db, QUEUE_COL),
                where("status", "in", ["published", "rejected"])
            );
        }
        const snap = await getDocs(q);
        return snap.docs
            .map(d => ({ id: d.id, ...d.data() } as ContentQueueItem))
            .sort((a, b) => (b.reviewedAt ?? 0) - (a.reviewedAt ?? 0))
            .slice(0, 100);
    } catch (error) {
        console.error("[ContentQueue] Erro ao listar histórico:", error);
        return [];
    }
}

export async function getQueueItem(id: string): Promise<ContentQueueItem | null> {
    try {
        const snap = await getDoc(doc(db, QUEUE_COL, id));
        if (!snap.exists()) return null;
        return { id: snap.id, ...snap.data() } as ContentQueueItem;
    } catch (error) {
        console.error(`[ContentQueue] Erro ao buscar item "${id}":`, error);
        return null;
    }
}

export async function updateQueueItem(
    id: string,
    data: Partial<ContentQueueItem>
): Promise<void> {
    try {
        await updateDoc(doc(db, QUEUE_COL, id), data);
    } catch (error) {
        console.error(`[ContentQueue] Erro ao atualizar item "${id}":`, error);
        throw error;
    }
}

export async function rejectItem(id: string, editorNote?: string): Promise<void> {
    try {
        await updateDoc(doc(db, QUEUE_COL, id), {
            status: "rejected",
            editorNote: editorNote || null,
            reviewedAt: Date.now(),
        });
    } catch (error) {
        console.error(`[ContentQueue] Erro ao rejeitar item "${id}":`, error);
        throw error;
    }
}

/* ────────── Feed Sources ────────── */

export async function listSources(): Promise<FeedSource[]> {
    try {
        const snap = await getDocs(collection(db, SOURCES_COL));
        return snap.docs
            .map(d => ({ id: d.id, ...d.data() } as FeedSource))
            .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
    } catch (error) {
        console.error("[ContentQueue] Erro ao listar fontes:", error);
        return [];
    }
}

export async function addSource(
    data: Omit<FeedSource, "id" | "lastRun">
): Promise<string> {
    try {
        const docRef = await addDoc(collection(db, SOURCES_COL), {
            ...data,
            lastRun: null,
        });
        return docRef.id;
    } catch (error) {
        console.error("[ContentQueue] Erro ao adicionar fonte:", error);
        throw error;
    }
}

export async function updateSource(
    id: string,
    data: Partial<FeedSource>
): Promise<void> {
    try {
        await updateDoc(doc(db, SOURCES_COL, id), data);
    } catch (error) {
        console.error(`[ContentQueue] Erro ao atualizar fonte "${id}":`, error);
        throw error;
    }
}
