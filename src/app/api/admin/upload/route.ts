import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const { searchParams } = new URL(request.url);
        const filename = searchParams.get("filename");

        if (!filename) {
            return NextResponse.json(
                { error: "Filename is required in the query string (?filename=...)" },
                { status: 400 }
            );
        }

        if (!request.body) {
            return NextResponse.json(
                { error: "No file body provided" },
                { status: 400 }
            );
        }

        // Faz o upload direto do stream do request para o Vercel Blob
        const blob = await put(filename, request.body, {
            access: "public",
        });

        return NextResponse.json(blob);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
        console.error("[Vercel Blob Upload] Erro detalhado:", error);
        return NextResponse.json(
            { error: "Erro ao realizar upload", details: errorMessage },
            { status: 500 }
        );
    }
}
