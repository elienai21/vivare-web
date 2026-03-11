import { NextRequest, NextResponse } from "next/server";
import { getServerDb, withTimeout } from "@/lib/firestore-server";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Anthropic from "@anthropic-ai/sdk";

const QUEUE_COL = "content_queue";
const TIMEOUT = 10000;
const RELEVANCE_THRESHOLD = parseFloat(process.env.RELEVANCE_THRESHOLD || "0.6");

const VIVARE_SYSTEM_PROMPT = `Você é o redator oficial da Vivare Stay, empresa de gestão de locação por temporada em São Paulo. Tom: sofisticado, local, direto, confiável.
NUNCA USE: "a cidade que nunca dorme", "experiência única", "incrível", "os melhores preços", "atendimento personalizado".
USE SEMPRE: hospedagem, estadia, apartamento, hóspede, proprietário, check-in digital, gestão completa, rentabilidade, transparência.
Nunca invente dados. Máximo 1 exclamação por peça.`;

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { instruction } = await request.json().catch(() => ({ instruction: "" }));

        const db = getServerDb();
        const queueSnap = await withTimeout(getDoc(doc(db, QUEUE_COL, id)), TIMEOUT);

        if (!queueSnap.exists()) {
            return NextResponse.json({ error: "Item não encontrado." }, { status: 404 });
        }

        const item = queueSnap.data();
        const body = item.originalBody.slice(0, 1500);

        let userPrompt = `Escreva artigo de 500 palavras para o blog da Vivare Stay baseado nesta notícia.
Público: ${item.audience}.

NOTÍCIA: ${item.originalTitle} — ${body}
Fonte: ${item.sourceName}

Retorne APENAS JSON válido (sem markdown):
{"title":"","body":"","meta_description":"","tags":[],"relevance_score":0.0}

Se relevance_score < 0.6 (pouco relevante para SP/turismo/imóveis),
retorne {"relevance_score": 0.1} e os outros campos vazios.`;

        if (instruction) {
            userPrompt += `\n\nINSTRUÇÃO ADICIONAL DO EDITOR: ${instruction}`;
        }

        const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
        const message = await anthropic.messages.create({
            model: "claude-sonnet-4-5-20250929",
            max_tokens: 1500,
            system: VIVARE_SYSTEM_PROMPT,
            messages: [{ role: "user", content: userPrompt }],
        });

        const text = message.content[0].type === "text" ? message.content[0].text : "";
        const parsed = JSON.parse(text);
        const relevance = parsed.relevance_score ?? 0;

        if (relevance < RELEVANCE_THRESHOLD) {
            await updateDoc(doc(db, QUEUE_COL, id), {
                status: "rejected",
                relevanceScore: relevance,
                editorNote: "auto-rejected: low relevance (regenerate)",
                reviewedAt: Date.now(),
            });
            return NextResponse.json({ regenerated: false, rejected: true, relevance });
        }

        await updateDoc(doc(db, QUEUE_COL, id), {
            draftTitle: parsed.title || null,
            draftBody: parsed.body || null,
            draftMetaDesc: parsed.meta_description || null,
            draftTags: parsed.tags || [],
            relevanceScore: relevance,
            draftedAt: Date.now(),
            editedTitle: null,
            editedBody: null,
        });

        return NextResponse.json({ regenerated: true, rejected: false, relevance });
    } catch (error) {
        console.error("[Regenerate] Erro:", error);
        return NextResponse.json(
            { error: "Erro ao regenerar rascunho." },
            { status: 500 }
        );
    }
}
