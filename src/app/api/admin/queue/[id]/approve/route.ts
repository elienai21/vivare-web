import { NextRequest, NextResponse } from "next/server";
import { getServerDb, withTimeout } from "@/lib/firestore-server";
import {
    doc,
    getDoc,
    updateDoc,
    setDoc,
    collection,
} from "firebase/firestore";

const QUEUE_COL = "content_queue";
const BLOG_COL = "blog_posts";
const TIMEOUT = 10000;

function slugify(text: string): string {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 80);
}

export async function POST(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const db = getServerDb();

        // 1. Read queue item
        const queueSnap = await withTimeout(getDoc(doc(db, QUEUE_COL, id)), TIMEOUT);
        if (!queueSnap.exists()) {
            return NextResponse.json({ error: "Item não encontrado." }, { status: 404 });
        }
        const item = queueSnap.data();

        if (item.status === "published") {
            return NextResponse.json({ error: "Item já publicado." }, { status: 400 });
        }

        // 2. Use edited version if available, otherwise use draft
        const title = item.editedTitle || item.draftTitle || item.originalTitle;
        const body = item.editedBody || item.draftBody || "";
        const excerpt = (item.draftMetaDesc || body.slice(0, 160)).replace(/<[^>]*>/g, "");
        const slug = slugify(title);
        const now = Date.now();

        // 3. Create blog post (same structure as blogService.createPost)
        const blogRef = doc(collection(db, BLOG_COL));
        await setDoc(blogRef, {
            id: blogRef.id,
            slug,
            title,
            excerpt,
            content: body,
            author: "Vivare Stay",
            tags: item.draftTags || [],
            status: "published",
            publishedAt: now,
            createdAt: now,
            updatedAt: now,
            updatedBy: "content-automation",
        });

        // 4. Update queue item
        await updateDoc(doc(db, QUEUE_COL, id), {
            status: "published",
            publishedAt: now,
            publishedUrl: `/blog/${slug}`,
            reviewedAt: now,
        });

        return NextResponse.json({
            postId: blogRef.id,
            slug,
            publishedUrl: `/blog/${slug}`,
        });
    } catch (error) {
        console.error("[Approve] Erro ao publicar:", error);
        return NextResponse.json(
            { error: "Erro ao publicar conteúdo." },
            { status: 500 }
        );
    }
}
