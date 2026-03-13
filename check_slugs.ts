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
        const qPosts = query(
            collection(db, "blog_posts"),
            where("status", "==", "published"),
            orderBy("publishedAt", "desc"),
            limit(5)
        );
        const snap = await getDocs(qPosts);
        const results = snap.docs.map(d => ({
            id: d.id,
            title: d.data().title,
            slug: d.data().slug
        }));
        fs.writeFileSync("slugs.json", JSON.stringify(results, null, 2));
        console.log("Success! File saved to slugs.json");
    } catch (e: any) {
        console.error("ERRO:", e.message);
    }
    process.exit(0);
}

go();
