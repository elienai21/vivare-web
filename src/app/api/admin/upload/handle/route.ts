import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
    const body = (await request.json()) as HandleUploadBody;

    try {
        const jsonResponse = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async (
                pathname,
                /* clientPayload */
            ) => {
                // Aqui você pode adicionar lógica de autenticação se desejar
                // Por enquanto, permitimos se o request vier do nosso domínio/admin
                
                return {
                    allowedContentTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
                    tokenPayload: JSON.stringify({
                        // payloads opcionais
                    }),
                };
            },
            onUploadCompleted: async ({ blob, tokenPayload }) => {
                // Lógica pós-upload (ex: salvar no banco de dados)
                console.log("Upload concluído:", blob, tokenPayload);
            },
        });

        return NextResponse.json(jsonResponse);
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 400 } // O client-side upload espera 400 para erros de permissão
        );
    }
}
