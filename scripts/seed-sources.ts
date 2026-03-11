import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, where } from "firebase/firestore";
import * as dotenv from "dotenv";
import * as path from "path";

// Carregar .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const SOURCES_COL = "feed_sources";

const INITIAL_SOURCES = [
    {
        name: "Viagem e Turismo",
        url: "https://www.viagemeturismo.abril.com.br/feed/",
        type: "rss",
        topic: "turismo",
        audience: "hospede",
        active: true,
        lastRun: null,
    },
    {
        name: "Folha · Turismo",
        url: "https://feeds.folha.uol.com.br/turismo/rss091.xml",
        type: "rss",
        topic: "turismo",
        audience: "hospede",
        active: true,
        lastRun: null,
    },
    {
        name: "Estadão · Viagem",
        url: "https://www.estadao.com.br/viagem/feed/",
        type: "rss",
        topic: "turismo",
        audience: "hospede",
        active: true,
        lastRun: null,
    },
    {
        name: "InfoMoney · Imóveis",
        url: "https://www.infomoney.com.br/mercados/imoveis/feed/",
        type: "rss",
        topic: "mercado",
        audience: "proprietario",
        active: true,
        lastRun: null,
    },
    {
        name: "PANROTAS",
        url: "https://www.panrotas.com.br/rss.xml",
        type: "rss",
        topic: "turismo",
        audience: "ambos",
        active: true,
        lastRun: null,
    },
    {
        name: "Prefeitura SP · Notícias",
        url: "https://www.prefeitura.sp.gov.br/cidade/secretarias/comunicacao/noticias/index.php?p=rss",
        type: "rss",
        topic: "sao-paulo",
        audience: "hospede",
        active: true,
        lastRun: null,
    },
];

async function seed() {
    console.log("Iniciando seed de Feed Sources...");
    let added = 0;
    
    for (const source of INITIAL_SOURCES) {
        // Verificar se já existe para não duplicar
        const q = query(collection(db, SOURCES_COL), where("url", "==", source.url));
        const snap = await getDocs(q);
        
        if (snap.empty) {
            await addDoc(collection(db, SOURCES_COL), source);
            console.log(`✅ Adicionado: ${source.name}`);
            added++;
        } else {
            console.log(`⏭️ Ignorado (já existe): ${source.name}`);
        }
    }
    
    console.log(`\nSeed concluído! Fontes adicionadas: ${added}`);
    process.exit(0);
}

seed().catch((err) => {
    console.error("Erro no seed:", err);
    process.exit(1);
});
