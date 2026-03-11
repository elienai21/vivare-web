/**
 * Seed script for initial RSS sources.
 * Run once via: npx ts-node --project tsconfig.json src/scripts/seed-sources.ts
 * Or add sources manually via /admin/content-queue/sources
 */

import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, where } from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const SOURCES = [
    {
        name: "Viagem e Turismo",
        url: "https://www.viagemeturismo.abril.com.br/feed/",
        type: "rss" as const,
        topic: "turismo",
        audience: "hospede" as const,
        active: true,
        lastRun: null,
    },
    {
        name: "InfoMoney Imóveis",
        url: "https://www.infomoney.com.br/mercados/imoveis/feed/",
        type: "rss" as const,
        topic: "mercado_imoveis",
        audience: "proprietario" as const,
        active: true,
        lastRun: null,
    },
    {
        name: "Folha Turismo",
        url: "https://feeds.folha.uol.com.br/turismo/rss091.xml",
        type: "rss" as const,
        topic: "turismo",
        audience: "ambos" as const,
        active: true,
        lastRun: null,
    },
];

async function seed() {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const col = collection(db, "feed_sources");

    for (const source of SOURCES) {
        // Check if already exists
        const existing = await getDocs(
            query(col, where("url", "==", source.url))
        );
        if (!existing.empty) {
            console.log(`Skipping (already exists): ${source.name}`);
            continue;
        }

        await addDoc(col, source);
        console.log(`Added: ${source.name}`);
    }

    console.log("Seed complete.");
    process.exit(0);
}

seed().catch(err => {
    console.error("Seed failed:", err);
    process.exit(1);
});
