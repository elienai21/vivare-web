import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where, updateDoc, doc, limit } from "firebase/firestore";
import Anthropic from "@anthropic-ai/sdk";
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
const anthropic = new Anthropic({ apiKey: config.ANTHROPIC_API_KEY });

const VIVARE_SYSTEM_PROMPT = `Você é o redator oficial da Vivare Stay, empresa de gestão de locação por temporada em São Paulo. Tom: sofisticado, local, direto, confiável.
NUNCA USE: "a cidade que nunca dorme", "experiência única", "incrível", "os melhores preços", "atendimento personalizado".
USE SEMPRE: hospedagem, estadia, apartamento, hóspede, proprietário, check-in digital, gestão completa, rentabilidade, transparência.
Nunca invente dados. Máximo 1 exclamação por peça.`;

function buildUserPrompt(item: any): string {
    const body = item.originalBody.slice(0, 1500);
    let prompt = `Escreva artigo de 500 palavras para o blog da Vivare Stay baseado nesta notícia.
Público: ${item.audience}.

NOTÍCIA: ${item.originalTitle} — ${body}
Fonte: ${item.sourceName}

Retorne APENAS JSON válido (sem markdown):
{"title":"","body":"","meta_description":"","tags":[],"relevance_score":0.0}

O relevance_score varia de 0.0 a 1.0 (onde turismo em geral ou locação merecem ao menos 0.5+ mesmo que não seja exatamente sobre São Paulo).
Se relevance_score < 0.4 (totalmente irrelevante: não é viagem, turismo, hotelaria, passagens, economia ou imóveis),
retorne {"relevance_score": 0.1} e os outros campos vazios.`;
    return prompt;
}

async function go() {
    try {
        const qQueue = query(
            collection(db, "content_queue"),
            where("status", "==", "pending_review")
        );
        const snap = await getDocs(qQueue);
        const pending = snap.docs.map(d => ({id: d.id, ...d.data()}))
                            .filter((d: any) => !d.draftTitle)
                            .sort((a: any, b: any) => b.fetchedAt - a.fetchedAt)
                            .slice(0, 1);
        
        if (pending.length === 0) { console.log("Nenhum item."); process.exit(0); }
        
        const queueDoc = pending[0] as any;
        console.log(`Processando: ${queueDoc.originalTitle}`);
        
        const message = await anthropic.messages.create({
            model: "claude-sonnet-4-5-20250929",
            max_tokens: 1500,
            system: VIVARE_SYSTEM_PROMPT,
            messages: [{ role: "user", content: buildUserPrompt(queueDoc) }],
        });

        let text = message.content[0].type === "text" ? message.content[0].text : "";
        console.log("R: ", text.substring(0, 100));
        
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
            text = text.substring(firstBrace, lastBrace + 1);
        }
        
        const parsed = JSON.parse(text);
        console.log("SUCESSO:", parsed.title);
    } catch(e: any) {
        console.log('ERROR:', e.message);
    }
    process.exit(0);
}
go();
