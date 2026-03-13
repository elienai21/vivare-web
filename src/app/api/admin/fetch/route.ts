import { NextResponse } from "next/server";
import { getServerDb, withTimeout } from "@/lib/firestore-server";
import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    doc,
    query,
    where,
    limit,
} from "firebase/firestore";
import Parser from "rss-parser";

const SOURCES_COL = "feed_sources";
const QUEUE_COL = "content_queue";
const TIMEOUT = 15000;

export const maxDuration = 30;

const parser = new Parser({
    timeout: 10000,
    headers: { "User-Agent": "VivareBot/1.0" },
});

export async function fetchAllSources() {
    try {
        const db = getServerDb();

        const sourcesSnap = await withTimeout(
            getDocs(query(collection(db, SOURCES_COL), where("active", "==", true))),
            TIMEOUT
        );

        if (sourcesSnap.empty) {
            return { fetched: 0, sources: 0, message: "Nenhuma fonte ativa." };
        }

        let totalFetched = 0;
        let sourcesProcessed = 0;

        // Limita a varredura a maximo de 3 fontes por ciclo para poupar tempo
        const activeSources = sourcesSnap.docs.slice(0, 3);

        for (const sourceDoc of activeSources) {
            const source = sourceDoc.data();

            try {
                if (source.type !== "rss") continue;

                const feed = await parser.parseURL(source.url);
                sourcesProcessed++;

                // Pega apenas as 5 noticias mais recentes para não estourar a Vercel 10s
                const recentItems = feed.items.slice(0, 5);

                const processItemPromises = recentItems.map(async (item) => {
                    const sourceUrl = item.link || item.guid || "";
                    if (!sourceUrl) return 0;

                    const existing = await getDocs(
                        query(collection(db, QUEUE_COL), where("sourceUrl", "==", sourceUrl), limit(1))
                    );
                    if (!existing.empty) return 0;

                    await addDoc(collection(db, QUEUE_COL), {
                        sourceUrl,
                        sourceName: source.name || feed.title || "RSS",
                        originalTitle: item.title || "",
                        originalBody: item.contentSnippet || item.content || item.summary || "",
                        fetchedAt: Date.now(),
                        topic: source.topic || "",
                        audience: source.audience || "ambos",
                        relevanceScore: 0,
                        draftTitle: null,
                        draftBody: null,
                        draftMetaDesc: null,
                        draftTags: [],
                        draftedAt: null,
                        status: "pending_review",
                        editedTitle: null,
                        editedBody: null,
                        editorNote: null,
                        reviewedAt: null,
                        publishedAt: null,
                        publishedUrl: null,
                    });
                    return 1;
                });

                const results = await Promise.all(processItemPromises);
                totalFetched += results.reduce((a: number, b) => a + Number(b), 0);

                // Update source quietly
                updateDoc(doc(db, SOURCES_COL, sourceDoc.id), {
                    lastRun: Date.now(),
                }).catch(() => {});

            } catch (err) {
                console.error(`[Fetcher] Erro na fonte "${source.name}":`, err);
            }
        }

        return { fetched: totalFetched, sources: sourcesProcessed };
    } catch (error) {
        console.error("[Fetcher] Erro geral:", error);
        throw error;
    }
}

export async function POST() {
    try {
        const result = await fetchAllSources();
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ error: "Erro ao buscar conteúdo." }, { status: 500 });
    }
}
