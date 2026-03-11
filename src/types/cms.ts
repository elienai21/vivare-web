/**
 * CMS Types — Modelo de dados para o sistema editorial Vivare.
 *
 * Cada "página" tem 2 versões no Firestore:
 *   • pages/{id}        → publicada (leitura pública)
 *   • pages_drafts/{id} → rascunho  (leitura somente admin)
 */

/* ---------- Legado (mantido para retrocompatibilidade) ---------- */
export interface SiteContent {
    id?: string;
    heroTitle: string;
    heroSubtitle: string;
    ctaButtonText: string;
    updatedAt?: number;
}

/* ---------- CMS Editorial ---------- */

export type CmsPageStatus = 'draft' | 'published';

/** Definição dos campos editáveis de cada página. */
export interface CmsFieldDef {
    key: string;
    label: string;
    type: 'text' | 'textarea' | 'richtext' | 'json' | 'image';
    placeholder?: string;
    helpText?: string;
}

/** Registro de uma página no CMS. */
export interface CmsPage {
    id: string;                         // slug: "home", "sobre", "faq", etc.
    title: string;                      // Nome amigável da página
    metaDescription?: string;           // SEO meta description
    status: CmsPageStatus;
    content: Record<string, string>;    // Campos chave→valor flexíveis
    updatedAt: number;                  // Timestamp da última edição
    updatedBy?: string;                 // Email do editor
    publishedAt?: number;               // Timestamp da publicação
}

/* ---------- Registro de cada página editável ---------- */

export interface CmsPageConfig {
    id: string;
    title: string;
    description: string;
    fields: CmsFieldDef[];
}

/** Catálogo master de todas as páginas editáveis. */
export const CMS_PAGES_CATALOG: CmsPageConfig[] = [
    {
        id: 'home',
        title: 'Home',
        description: 'Página principal do site — Hero, subtítulo e CTA.',
        fields: [
            { key: 'heroTitle', label: 'Título Hero (H1)', type: 'textarea', helpText: 'Suporta HTML para destaques com <span>.' },
            { key: 'heroSubtitle', label: 'Subtítulo do Hero', type: 'textarea' },
            { key: 'ctaButtonText', label: 'Texto do Botão CTA', type: 'text' },
        ],
    },
    {
        id: 'sobre',
        title: 'Quem Somos',
        description: 'Página institucional "A Experiência Vivare".',
        fields: [
            { key: 'pageTitle', label: 'Título da Página', type: 'text' },
            { key: 'intro', label: 'Texto Introdutório', type: 'textarea' },
            { key: 'mission', label: 'Missão', type: 'textarea' },
            { key: 'vision', label: 'Visão', type: 'textarea' },
            { key: 'values', label: 'Valores', type: 'textarea' },
            { key: 'bodyHtml', label: 'Conteúdo Principal (HTML)', type: 'richtext', helpText: 'HTML completo do corpo da página.' },
            { key: 'heroImage', label: 'Imagem Hero (lateral)', type: 'image', helpText: 'Foto principal da seção hero. Recomendado: 900×1200px.' },
            { key: 'storyImage', label: 'Imagem — Nossa História', type: 'image', helpText: 'Foto da seção "Nossa História". Recomendado: 700×520px.' },
            { key: 'founderPhoto', label: 'Foto do Fundador / Sócio 1', type: 'image', helpText: 'Foto do fundador ou primeiro sócio. Recomendado: 600×580px, foco no rosto.' },
            { key: 'founderName', label: 'Nome do Fundador / Sócio 1', type: 'text' },
            { key: 'founderRole', label: 'Cargo do Fundador / Sócio 1', type: 'text', placeholder: 'Ex: Fundador & CEO' },
            { key: 'founderBio', label: 'Bio do Fundador / Sócio 1', type: 'richtext', helpText: 'Parágrafos de apresentação. Suporta HTML.' },
            { key: 'founderQuote', label: 'Citação do Fundador / Sócio 1', type: 'textarea', helpText: 'Frase em destaque (blockquote).' },
            { key: 'partner2Photo', label: 'Foto do Sócio 2 (opcional)', type: 'image', helpText: 'Deixe vazio para não exibir.' },
            { key: 'partner2Name', label: 'Nome do Sócio 2', type: 'text' },
            { key: 'partner2Role', label: 'Cargo do Sócio 2', type: 'text' },
            { key: 'partner2Bio', label: 'Bio do Sócio 2', type: 'richtext' },
        ],
    },
    {
        id: 'faq',
        title: 'Perguntas Frequentes',
        description: 'FAQ — Lista de perguntas e respostas.',
        fields: [
            { key: 'pageTitle', label: 'Título da Página', type: 'text' },
            { key: 'items', label: 'Perguntas e Respostas (JSON)', type: 'json', helpText: 'Array JSON [{q:"pergunta", a:"resposta"}, ...]' },
        ],
    },
    {
        id: 'para-proprietarios',
        title: 'Para Proprietários',
        description: 'Landing page de captação de proprietários.',
        fields: [
            { key: 'pageTitle', label: 'Título da Página', type: 'text' },
            { key: 'heroSubtitle', label: 'Subtítulo', type: 'textarea' },
            { key: 'bodyHtml', label: 'Conteúdo (HTML)', type: 'richtext' },
        ],
    },
    {
        id: 'termos',
        title: 'Termos e Condições',
        description: 'Termos e condições de uso.',
        fields: [
            { key: 'pageTitle', label: 'Título', type: 'text' },
            { key: 'bodyHtml', label: 'Conteúdo Legal (HTML)', type: 'richtext' },
        ],
    },
    {
        id: 'politica-de-privacidade',
        title: 'Política de Privacidade',
        description: 'Política de privacidade e proteção de dados.',
        fields: [
            { key: 'pageTitle', label: 'Título', type: 'text' },
            { key: 'bodyHtml', label: 'Conteúdo Legal (HTML)', type: 'richtext' },
        ],
    },
    {
        id: 'politica-de-cancelamento',
        title: 'Política de Cancelamento',
        description: 'Política de cancelamento e reembolso.',
        fields: [
            { key: 'pageTitle', label: 'Título', type: 'text' },
            { key: 'bodyHtml', label: 'Conteúdo Legal (HTML)', type: 'richtext' },
        ],
    },
];
