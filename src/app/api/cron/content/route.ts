import { NextResponse } from "next/server";
import { fetchAllSources } from "@/app/api/admin/fetch/route";
import { draftItems } from "@/app/api/admin/draft/route";

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get("authorization");
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return new Response("Unauthorized", { status: 401 });
        }

        console.log("[Cron Content] Iniciando ciclo diário...");

        // 1. Buscar novos itens das fontes RSS
        const fetchResult = await fetchAllSources();
        console.log(`[Cron Content] Fetch concluído. ${fetchResult.fetched} itens de ${fetchResult.sources} fontes.`);

        // 2. Gerar rascunhos para os itens pendentes
        const draftResult = await draftItems();
        console.log(`[Cron Content] Draft concluído. ${draftResult.drafted} criados, ${draftResult.rejected} rejeitados.`);

        return NextResponse.json({
            success: true,
            fetch: fetchResult,
            draft: draftResult,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("[Cron Content] Erro fatal:", error);
        return NextResponse.json(
            { error: "Erro na execução do Cron." },
            { status: 500 }
        );
    }
}
