import { NextResponse } from "next/server";
import { getServerDb, withTimeout } from "@/lib/firestore-server";
import {
    collection,
    getDocs,
    updateDoc,
    doc,
    query,
    where,
    orderBy,
    limit,
} from "firebase/firestore";
import Anthropic from "@anthropic-ai/sdk";

const QUEUE_COL = "content_queue";
const TIMEOUT = 15000;
const DRAFT_LIMIT = parseInt(process.env.DRAFT_LIMIT || "10", 10);
const RELEVANCE_THRESHOLD = parseFloat(process.env.RELEVANCE_THRESHOLD || "0.4");

/** System prompt hardcoded — NÃO deve ser alterável pela interface. */
const VIVARE_SYSTEM_PROMPT = `Você é o redator oficial da Vivare Stay, empresa de gestão de locação por temporada em São Paulo. Tom: sofisticado, local, direto, confiável.
NUNCA USE: "a cidade que nunca dorme", "experiência única", "incrível", "os melhores preços", "atendimento personalizado".
USE SEMPRE: hospedagem, estadia, apartamento, hóspede, proprietário, check-in digital, gestão completa, rentabilidade, transparência.
Nunca invente dados. Máximo 1 exclamação por peça.`;

function buildUserPrompt(item: {
    originalTitle: string;
    originalBody: string;
    sourceName: string;
    audience: string;
}, extraInstruction?: string): string {
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

    if (extraInstruction) {
        prompt += `\n\nINSTRUÇÃO ADICIONAL DO EDITOR: ${extraInstruction}`;
    }

    return prompt;
}

export async function draftItems(itemLimit?: number, extraInstruction?: string) {
    if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error("ANTHROPIC_API_KEY não está configurada. Adicione nas variáveis de ambiente da Vercel.");
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const db = getServerDb();

    // Query SEM orderBy para não exigir índice composto
    const q = query(
        collection(db, QUEUE_COL),
        where("status", "==", "pending_review")
    );
    const snap = await withTimeout(getDocs(q), TIMEOUT);

    // Filtra e ordena inteiramente no JS — sem índice composto
    const pendingDraft = snap.docs
        .filter(d => !d.data().draftTitle)
        .sort((a, b) => (b.data().fetchedAt || 0) - (a.data().fetchedAt || 0))
        .slice(0, itemLimit ?? DRAFT_LIMIT);

    if (pendingDraft.length === 0) {
        return { drafted: 0, rejected: 0, total: 0, message: "Nenhum item pendente para redigir." };
    }

    let drafted = 0;
    let rejected = 0;
    const errors: string[] = [];

    for (const queueDoc of pendingDraft) {
        const item = queueDoc.data();

        try {
            const message = await anthropic.messages.create({
                model: "claude-sonnet-4-5-20250929",
                max_tokens: 1500,
                system: VIVARE_SYSTEM_PROMPT,
                messages: [
                    {
                        role: "user",
                        content: buildUserPrompt(
                            {
                                originalTitle: item.originalTitle,
                                originalBody: item.originalBody,
                                sourceName: item.sourceName,
                                audience: item.audience || "ambos",
                            },
                            extraInstruction
                        ),
                    },
                ],
            });

            const text = message.content[0].type === "text" ? message.content[0].text : "";
            const parsed = JSON.parse(text);

            const relevance = parsed.relevance_score ?? 0;

            if (relevance < RELEVANCE_THRESHOLD) {
                await updateDoc(doc(db, QUEUE_COL, queueDoc.id), {
                    status: "rejected",
                    relevanceScore: relevance,
                    editorNote: "auto-rejected: low relevance",
                    reviewedAt: Date.now(),
                });
                rejected++;
            } else {
                await updateDoc(doc(db, QUEUE_COL, queueDoc.id), {
                    draftTitle: parsed.title || null,
                    draftBody: parsed.body || null,
                    draftMetaDesc: parsed.meta_description || null,
                    draftTags: parsed.tags || [],
                    relevanceScore: relevance,
                    draftedAt: Date.now(),
                });
                drafted++;
            }
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            console.error(`[Drafter] Erro ao gerar draft para "${item.originalTitle}":`, msg);
            errors.push(`${item.originalTitle?.substring(0, 30)}: ${msg.substring(0, 80)}`);
        }
    }

    return { drafted, rejected, total: pendingDraft.length, errors: errors.length > 0 ? errors : undefined };
}

export async function POST() {
    try {
        const result = await draftItems();
        return NextResponse.json(result);
    } catch (error) {
        const msg = error instanceof Error ? error.message : "Erro desconhecido";
        console.error("[Drafter] Erro geral:", msg);
        return NextResponse.json(
            { error: msg },
            { status: 500 }
        );
    }
}

