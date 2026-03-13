import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import fs from "fs";

// Load env vars (naive parser just for the script)
const env = fs.readFileSync(".env.local", "utf-8");
const config: any = {};
env.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        config[match[1]] = match[2].replace(/(^"|"$)/g, '');
    }
});

const app = initializeApp({
    apiKey: config.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: config.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: config.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: config.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: config.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: config.NEXT_PUBLIC_FIREBASE_APP_ID,
});

const db = getFirestore(app);

async function checkData() {
    console.log("--- CHECANDO POSTS PUBLICADOS ---");
    try {
        const qPosts = query(
            collection(db, "blog_posts"),
            where("status", "==", "published"),
            orderBy("publishedAt", "desc"),
            limit(5)
        );
        const snap = await getDocs(qPosts);
        console.log("Posts publicados encontrados:", snap.size);
        snap.forEach(d => console.log(`- ${d.id}: ${d.data().title}`));
    } catch (e: any) {
        console.error("ERRO ao buscar posts (Missing Index?):", e.message);
    }

    console.log("\n--- CHECANDO FILA DE CONTEÚDO (pending_review) ---");
    try {
        const qQueue = query(
            collection(db, "content_queue"),
            where("status", "==", "pending_review")
        );
        const snap = await getDocs(qQueue);
        let noDraft = 0;
        let withDraft = 0;
        snap.forEach(d => {
            if (d.data().draftTitle) withDraft++;
            else noDraft++;
        });
        console.log(`Total em pending_review: ${snap.size}`);
        console.log(`- Sem rascunho (noDraft): ${noDraft}`);
        console.log(`- Com rascunho (withDraft): ${withDraft}`);

    } catch (e: any) {
        console.error("ERRO fila:", e.message);
    }
    
    process.exit(0);
}

checkData();
