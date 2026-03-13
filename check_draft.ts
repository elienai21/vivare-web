import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import fs from "fs";

const env = fs.readFileSync(".env.local", "utf-8");
const config: any = {};
env.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) config[match[1]] = match[2].replace(/(^"|"$)/g, '').trim();
});

const app = initializeApp({
    apiKey: config.NEXT_PUBLIC_FIREBASE_API_KEY,
    projectId: config.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
});
const db = getFirestore(app);

async function go() {
    try {
        const qQueue = query(
            collection(db, "content_queue"),
            where("status", "==", "pending_review")
        );
        const snap = await getDocs(qQueue);
        const pending = snap.docs.map(d => ({id: d.id, ...d.data()})).sort((a: any, b: any) => b.fetchedAt - a.fetchedAt);
        const countNoDraft = pending.filter((d: any) => !d.draftTitle).length;
        const countWithDraft = pending.filter((d: any) => !!d.draftTitle).length;
        
        console.log(`TOTAL PENDING: ${pending.length} (com rascunho: ${countWithDraft}, sem rascunho: ${countNoDraft})`);
        
        if (countNoDraft > 0) {
            console.log("\nTop 5 itens SEM rascunho:");
            pending.filter((d: any) => !d.draftTitle).slice(0, 5).forEach((d: any) => {
                console.log(`- [${d.id}] ${d.originalTitle} (${d.sourceName})`);
            });
        }
    } catch(e: any) {
        console.log('ERROR:', e.message);
    }
    process.exit(0);
}
go();
