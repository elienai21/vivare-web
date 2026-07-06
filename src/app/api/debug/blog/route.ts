import { NextResponse } from 'next/server';

/**
 * ENDPOINT DE DIAGNÓSTICO TEMPORÁRIO — remover depois de resolver o
 * problema do blog vazio. Testa a leitura anônima do Firestore
 * server-side (mesmo caminho da página pública /blog) e reporta o que
 * está acontecendo, sem precisar navegar nos Runtime Logs da Vercel.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: Record<string, any> = {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || null,
        hasAdminEnv: Boolean(process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY),
    };

    try {
        const { initializeApp, getApps, getApp } = await import('firebase/app');
        const {
            getFirestore,
            initializeFirestore,
            collection,
            getDocs,
            query,
            where,
        } = await import('firebase/firestore');

        const firebaseConfig = {
            apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
            authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        };

        const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
        let db;
        try {
            db = initializeFirestore(app, { experimentalAutoDetectLongPolling: true });
        } catch {
            db = getFirestore(app);
        }

        // Query 1 — TODOS os blog_posts (sem nenhum filtro). Mede o que a
        // leitura anônima consegue enxergar.
        const allSnap = await getDocs(collection(db, 'blog_posts'));
        result.totalDocsVisiveis = allSnap.size;
        result.amostraStatus = allSnap.docs.slice(0, 8).map((d) => {
            const data = d.data();
            return {
                id: d.id,
                status: data.status ?? '(sem status)',
                temPublishedAt: data.publishedAt != null,
                slug: data.slug ?? '(sem slug)',
            };
        });

        // Query 2 — só status == published.
        const pubSnap = await getDocs(
            query(collection(db, 'blog_posts'), where('status', '==', 'published')),
        );
        result.countStatusPublished = pubSnap.size;
    } catch (err) {
        result.error = err instanceof Error ? err.message : String(err);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        result.errorCode = (err as any)?.code ?? null;
    }

    return NextResponse.json(result, {
        headers: { 'Cache-Control': 'no-store' },
    });
}
