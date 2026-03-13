"use client";

import { useState, useRef } from "react";
import { Upload, Loader2 } from "lucide-react";
import { upload } from "@vercel/blob/client";

interface ImageUploadButtonProps {
    onUploadComplete: (url: string) => void;
    className?: string;
    label?: string;
}

export function ImageUploadButton({ onUploadComplete, className = "", label = "Upload Imagem" }: ImageUploadButtonProps) {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);
            
            // Upload direto do client para o Vercel Blob (bypassing 4.5MB serverless limit)
            const newBlob = await upload(file.name, file, {
                access: "public",
                handleUploadUrl: "/api/admin/upload/handle",
            });

            if (newBlob.url) {
                onUploadComplete(newBlob.url);
            }
        } catch (error) {
            console.error("Erro no upload:", error);
            const msg = error instanceof Error ? error.message : "Erro desconhecido";
            alert(`Erro ao enviar a imagem: ${msg}`);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    return (
        <div className={`inline-flex items-center gap-2 ${className}`}>
            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
            />
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                title="Subir arquivo do seu computador via Vercel Blob"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 rounded-md transition-colors border border-neutral-200 dark:border-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
                {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <Upload className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">{isUploading ? "Enviando..." : label}</span>
            </button>
        </div>
    );
}
