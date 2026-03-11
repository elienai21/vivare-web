import type { Metadata } from "next";
import Link from "next/link";
import { BlogPost, listPublishedPostsServer } from "@/services/cmsServiceServer";
import { CalendarIcon, ClockIcon } from "lucide-react";

export const metadata: Metadata = {
    title: "Blog & Novidades",
    description: "Dicas de viagem, tendências do mercado imobiliário e novidades da Vivare Experience.",
    alternates: { canonical: "/blog" },
};

function formatDate(timestamp: number) {
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    }).format(new Date(timestamp));
}

// Estima tempo de leitura (aprox 200 palavras por minuto)
function getReadingTime(text: string) {
    const words = text.replace(/<[^>]*>?/gm, '').split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min`;
}

export default async function BlogIndexPage() {
    const posts = await listPublishedPostsServer(20);

    return (
        <main className="min-h-screen pt-32 pb-20 bg-background-light dark:bg-background-dark">
            <div className="mx-auto max-w-7xl px-6 lg:px-10">
                <div className="text-center md:text-left mb-16">
                    <span className="text-xs font-bold uppercase tracking-[.3em] text-primary">Journal</span>
                    <h1 className="font-display text-4xl md:text-6xl font-light text-ink dark:text-parchment mt-2 mb-4">Blog Vivare</h1>
                    <span className="gold-line md:mx-0"></span>
                    <p className="text-neutral-600 dark:text-neutral-400 mt-6 max-w-2xl text-lg">
                        Inspirações de viagem, novidades em São Paulo, Santos e Guarujá e dicas para rentabilizar seu imóvel com nossa curadoria.
                    </p>
                </div>

                {posts.length === 0 ? (
                    <div className="py-20 text-center">
                        <p className="text-xl text-neutral-500 font-light">Nenhum artigo publicado no momento.</p>
                        <p className="text-neutral-400 mt-2">Volte em breve para novidades.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                        {posts.map((post) => (
                            <Link href={`/blog/${post.slug}`} key={post.id} className="group flex flex-col h-full rounded-2xl bg-white dark:bg-neutral-900 overflow-hidden shadow-sm hover:shadow-xl transition-all border border-neutral-100 dark:border-neutral-800">
                                {/* Cover Image */}
                                <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                                    {post.coverImage ? (
                                        <img
                                            src={post.coverImage}
                                            alt={post.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-neutral-200 dark:to-neutral-800 flex items-center justify-center">
                                            <span className="text-primary font-display text-2xl opacity-50">Vivare</span>
                                        </div>
                                    )}
                                    {post.tags && post.tags.length > 0 && (
                                        <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
                                            <span className="px-3 py-1 bg-white/90 dark:bg-black/90 backdrop-blur-sm text-ink dark:text-parchment text-[10px] uppercase tracking-wider font-bold rounded-full">
                                                {post.tags[0]}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-6 md:p-8 flex flex-col flex-grow">
                                    <h2 className="font-display text-2xl font-medium text-ink dark:text-parchment mb-3 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                                        {post.title}
                                    </h2>
                                    <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-6 line-clamp-3 leading-relaxed flex-grow">
                                        {post.excerpt}
                                    </p>

                                    {/* Footer Info */}
                                    <div className="mt-auto pt-6 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500 font-medium uppercase tracking-wider">
                                        <div className="flex items-center gap-1.5">
                                            <CalendarIcon className="w-3.5 h-3.5" />
                                            <span>{formatDate(post.publishedAt || post.updatedAt)}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <ClockIcon className="w-3.5 h-3.5" />
                                            <span>{getReadingTime(post.content)}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
