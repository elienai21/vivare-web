export type ContentStatus = "pending_review" | "approved" | "rejected" | "published";
export type ContentAudience = "hospede" | "proprietario" | "ambos";

export interface ContentQueueItem {
    id: string;
    sourceUrl: string;
    sourceName: string;
    originalTitle: string;
    originalBody: string;
    fetchedAt: number;
    topic: string;
    audience: ContentAudience;
    relevanceScore: number;
    draftTitle: string | null;
    draftBody: string | null;
    draftMetaDesc: string | null;
    draftTags: string[];
    draftedAt: number | null;
    status: ContentStatus;
    editedTitle: string | null;
    editedBody: string | null;
    editorNote: string | null;
    reviewedAt: number | null;
    publishedAt: number | null;
    publishedUrl: string | null;
}

export interface FeedSource {
    id: string;
    name: string;
    url: string;
    type: "rss" | "api";
    topic: string;
    audience: ContentAudience;
    active: boolean;
    lastRun: number | null;
}
