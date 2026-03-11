import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ─── Types ────────────────────────────────────────────────────────
type AiProvider = "claude" | "chatgpt" | "gemini";

interface AiAssistRequest {
    text: string;
    instruction: string;
    provider: AiProvider;
    fieldContext?: string; // ex: "título do blog", "subtítulo da home"
}

interface AiAssistResponse {
    result: string;
    provider: AiProvider;
}

interface AiAssistError {
    error: string;
    code: string;
}

// ─── System Prompt (mesmo tom da Vivare) ───────────────────────────
const VIVARE_SYSTEM_PROMPT = `Você é um assistente de redação da Vivare Stay, empresa de gestão de locação por temporada em São Paulo.
Seu trabalho é MELHORAR textos que o editor humano já escreveu, seguindo as instruções dele.

REGRAS DE TOM:
- Sofisticado, local, direto e confiável.
- NUNCA USE: "a cidade que nunca dorme", "experiência única", "incrível", "os melhores preços", "atendimento personalizado".
- USE QUANDO RELEVANTE: hospedagem, estadia, apartamento, hóspede, proprietário, check-in digital, gestão completa, rentabilidade, transparência.
- Nunca invente dados ou estatísticas.
- Máximo 1 exclamação por peça.
- Mantenha o mesmo idioma do texto original (pt-BR).

FORMATO DA RESPOSTA:
- Retorne APENAS o texto melhorado, sem explicações, sem aspas ao redor, sem markdown.
- Se a instrução pedir correção gramatical, corrija e retorne o texto completo.
- Se a instrução pedir uma versão alternativa, retorne a nova versão completa.
- NÃO adicione prefixos como "Aqui está" ou "Texto melhorado:".`;

// ─── Provider Adapters ────────────────────────────────────────────

function buildUserMessage(text: string, instruction: string, fieldContext?: string): string {
    let message = `INSTRUÇÃO: ${instruction}\n\n`;
    if (fieldContext) {
        message += `CONTEXTO DO CAMPO: Este texto será usado como ${fieldContext}.\n\n`;
    }
    message += `TEXTO ORIGINAL:\n${text}`;
    return message;
}

async function callClaude(text: string, instruction: string, fieldContext?: string): Promise<string> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
        throw new ProviderError("ANTHROPIC_API_KEY não configurada. Adicione nas variáveis de ambiente.", "missing_key");
    }

    const anthropic = new Anthropic({ apiKey });
    const message = await anthropic.messages.create({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 2000,
        system: VIVARE_SYSTEM_PROMPT,
        messages: [
            { role: "user", content: buildUserMessage(text, instruction, fieldContext) },
        ],
    });

    const content = message.content[0];
    if (content.type !== "text") {
        throw new ProviderError("Resposta inesperada do Claude.", "unexpected_response");
    }
    return content.text.trim();
}

async function callChatGPT(text: string, instruction: string, fieldContext?: string): Promise<string> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new ProviderError("OPENAI_API_KEY não configurada. Adicione nas variáveis de ambiente.", "missing_key");
    }

    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        max_tokens: 2000,
        messages: [
            { role: "system", content: VIVARE_SYSTEM_PROMPT },
            { role: "user", content: buildUserMessage(text, instruction, fieldContext) },
        ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
        throw new ProviderError("Resposta vazia do ChatGPT.", "unexpected_response");
    }
    return content.trim();
}

async function callGemini(text: string, instruction: string, fieldContext?: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new ProviderError("GEMINI_API_KEY não configurada. Adicione nas variáveis de ambiente.", "missing_key");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `${VIVARE_SYSTEM_PROMPT}\n\n${buildUserMessage(text, instruction, fieldContext)}`;
    const result = await model.generateContent(prompt);
    const response = result.response;
    const content = response.text();

    if (!content) {
        throw new ProviderError("Resposta vazia do Gemini.", "unexpected_response");
    }
    return content.trim();
}

class ProviderError extends Error {
    code: string;
    constructor(message: string, code: string) {
        super(message);
        this.code = code;
    }
}

// ─── Provider Map ─────────────────────────────────────────────────
const providerMap: Record<AiProvider, typeof callClaude> = {
    claude: callClaude,
    chatgpt: callChatGPT,
    gemini: callGemini,
};

// ─── Available providers check endpoint ───────────────────────────
export async function GET() {
    const available: Record<AiProvider, boolean> = {
        claude: !!process.env.ANTHROPIC_API_KEY,
        chatgpt: !!process.env.OPENAI_API_KEY,
        gemini: !!process.env.GEMINI_API_KEY,
    };

    return NextResponse.json({ providers: available });
}

// ─── Main POST handler ───────────────────────────────────────────
export async function POST(request: NextRequest) {
    try {
        const body = (await request.json()) as AiAssistRequest;

        // Validation
        if (!body.text || typeof body.text !== "string") {
            return NextResponse.json(
                { error: "Campo 'text' é obrigatório.", code: "validation_error" } satisfies AiAssistError,
                { status: 400 }
            );
        }

        if (!body.instruction || typeof body.instruction !== "string") {
            return NextResponse.json(
                { error: "Campo 'instruction' é obrigatório.", code: "validation_error" } satisfies AiAssistError,
                { status: 400 }
            );
        }

        const provider = body.provider || "claude";
        if (!providerMap[provider]) {
            return NextResponse.json(
                { error: `Provider '${provider}' não suportado. Use: claude, chatgpt ou gemini.`, code: "invalid_provider" } satisfies AiAssistError,
                { status: 400 }
            );
        }

        // Call provider
        const callProvider = providerMap[provider];
        const result = await callProvider(body.text, body.instruction, body.fieldContext);

        return NextResponse.json({ result, provider } satisfies AiAssistResponse);

    } catch (error) {
        if (error instanceof ProviderError) {
            return NextResponse.json(
                { error: error.message, code: error.code } satisfies AiAssistError,
                { status: 422 }
            );
        }

        const message = error instanceof Error ? error.message : "Erro desconhecido ao processar a requisição.";
        console.error("[AI Assist] Erro:", message);
        return NextResponse.json(
            { error: message, code: "internal_error" } satisfies AiAssistError,
            { status: 500 }
        );
    }
}
