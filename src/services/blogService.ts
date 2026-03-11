import { db } from "@/lib/firebase";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
} from "firebase/firestore";
import type { BlogPost, NewsletterSubscriber } from "@/types/blog";

const BLOG_COL = "blog_posts";
const NEWSLETTER_COL = "leads_newsletter";

/* ────────── Lógica de Cadastro Newsletter ────────── */

export async function subscribeToNewsletter(email: string, source: string = 'website'): Promise<void> {
    try {
        // Verifica se já existe
        const q = query(collection(db, NEWSLETTER_COL), where("email", "==", email), limit(1));
        const snap = await getDocs(q);

        if (!snap.empty) {
            // Já cadastrado, podemos apenas retornar sucesso e ignorar
            return;
        }

        // Adiciona novo email
        await addDoc(collection(db, NEWSLETTER_COL), {
            email,
            source,
            createdAt: serverTimestamp(),
        });
    } catch (error) {
        console.error("[Newsletter] Erro ao cadastrar email:", error);
        throw error;
    }
}

/* ────────── Leitura (Público & Admin) ────────── */

export async function listAllPosts(): Promise<BlogPost[]> {
    try {
        const q = query(
            collection(db, BLOG_COL),
            orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as BlogPost));
    } catch (error) {
        console.error("[Blog] Erro ao listar posts gerais:", error);
        return [];
    }
}

export async function listPublishedPosts(max: number = 20): Promise<BlogPost[]> {
    try {
        const q = query(
            collection(db, BLOG_COL),
            where("status", "==", "published"),
            orderBy("publishedAt", "desc"),
            limit(max)
        );
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as BlogPost));
    } catch (error) {
        console.error("[Blog] Erro ao listar posts publicados:", error);
        return [];
    }
}

export async function getPostById(postId: string): Promise<BlogPost | null> {
    try {
        const snap = await getDoc(doc(db, BLOG_COL, postId));
        if (!snap.exists()) return null;
        return { id: snap.id, ...snap.data() } as BlogPost;
    } catch (error) {
        console.error(`[Blog] Erro ao buscar post "${postId}":`, error);
        return null;
    }
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
    try {
        const q = query(
            collection(db, BLOG_COL),
            where("slug", "==", slug),
            limit(1)
        );
        const snap = await getDocs(q);
        if (snap.empty) return null;
        const d = snap.docs[0];
        return { id: d.id, ...d.data() } as BlogPost;
    } catch (error) {
        console.error(`[Blog] Erro ao buscar post por slug "${slug}":`, error);
        return null;
    }
}

/* ────────── Escrita (Admin) ────────── */

export async function createPost(data: Partial<BlogPost>): Promise<string> {
    try {
        const docRef = doc(collection(db, BLOG_COL)); // Gera ID automático
        const now = Date.now();
        const newPost = {
            ...data,
            id: docRef.id,
            status: data.status || 'draft',
            createdAt: now,
            updatedAt: now,
            publishedAt: data.status === 'published' ? now : null,
        };
        await setDoc(docRef, newPost);
        return docRef.id;
    } catch (error) {
        console.error("[Blog] Erro ao criar post:", error);
        throw error;
    }
}

export async function updatePost(postId: string, data: Partial<BlogPost>): Promise<void> {
    try {
        const ref = doc(db, BLOG_COL, postId);
        const now = Date.now();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateData: any = {
            ...data,
            updatedAt: now,
        };

        // Se mudou pra publicado e não tinha publishedAt
        if (data.status === 'published' && !data.publishedAt) {
            updateData.publishedAt = now;
        }

        await updateDoc(ref, updateData);
    } catch (error) {
        console.error(`[Blog] Erro ao atualizar post "${postId}":`, error);
        throw error;
    }
}

export async function deletePost(postId: string): Promise<void> {
    try {
        await deleteDoc(doc(db, BLOG_COL, postId));
    } catch (error) {
        console.error(`[Blog] Erro ao deletar post "${postId}":`, error);
        throw error;
    }
}
