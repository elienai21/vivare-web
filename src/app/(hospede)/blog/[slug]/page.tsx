import type { Metadata, ResolvingMetadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlugServer } from "@/services/cmsServiceServer";
import { CalendarIcon, ClockIcon, UserIcon, ArrowLeftIcon } from "lucide-react";

type Props = {
    params: { slug: string };
};

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const post = await getPostBySlugServer(params.slug);
    if (!post) {
        return { title: "Post não encontrado" };
    }

    return {
        title: post.title,
        description: post.excerpt,
        openGraph: {
            title: post.title,
            description: post.excerpt,
            images: post.coverImage ? [post.coverImage] : [],
            type: "article",
            publishedTime: new Date(post.publishedAt || post.updatedAt).toISOString(),
            authors: [post.author || "Vivare"],
        },
        alternates: { canonical: `/blog/${post.slug}` },
    };
}

function formatDate(timestamp: number) {
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    }).format(new Date(timestamp));
}

function getReadingTime(text: string) {
    const words = text.replace(/<[^>]*>?/gm, '').split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min`;
}

export default async function BlogPostPage({ params }: Props) {
    const post = await getPostBySlugServer(params.slug);

    if (!post) {
        notFound();
    }

    const isoDate = new Date(post.publishedAt || post.updatedAt).toISOString();

    const blogPostingJsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        image: post.coverImage ? [post.coverImage] : undefined,
        datePublished: isoDate,
        dateModified: new Date(post.updatedAt).toISOString(),
        author: {
            "@type": "Person",
            name: post.author || "Vivare",
        },
        publisher: {
            "@type": "Organization",
            name: "Vivare",
            logo: {
                "@type": "ImageObject",
                url: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
            },
        },
        description: post.excerpt,
    };

    return (
        <main className="min-h-screen pt-32 pb-20 bg-background-light dark:bg-background-dark">
            <article className="mx-auto max-w-3xl px-6 lg:px-8">

                {/* Botão Voltar */}
                <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-primary transition-colors mb-10 font-medium">
                    <ArrowLeftIcon className="w-4 h-4" />
                    Voltar para o Blog
                </Link>

                {/* Header do Post */}
                <header className="mb-12">
                    {post.tags && post.tags.length > 0 && (
                        <div className="flex gap-2 flex-wrap mb-6">
                            {post.tags.map(tag => (
                                <span key={tag} className="px-3 py-1 bg-primary/10 text-primary text-[10px] uppercase tracking-wider font-bold rounded-full">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-light text-ink dark:text-parchment leading-tight mb-8">
                        {post.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-neutral-500 font-medium">
                        <div className="flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-primary">
                                <UserIcon className="w-4 h-4" />
                            </span>
                            <span>{post.author || "Equipe Vivare"}</span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700 hidden sm:block" />
                        <div className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 border-b border-dashed border-transparent" />
                            <time dateTime={isoDate}>{formatDate(post.publishedAt || post.updatedAt)}</time>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700 hidden sm:block" />
                        <div className="flex items-center gap-2">
                            <ClockIcon className="w-4 h-4 border-b border-dashed border-transparent" />
                            <span>{getReadingTime(post.content)} de leitura</span>
                        </div>
                    </div>
                </header>

                {/* Cover Image */}
                {post.coverImage && (
                    <figure className="mb-16 -mx-6 lg:-mx-16 aspect-[21/9] relative rounded-none lg:rounded-2xl overflow-hidden shadow-lg">
                        <img
                            src={post.coverImage}
                            alt={`Capa do artigo: ${post.title}`}
                            className="w-full h-full object-cover"
                        />
                    </figure>
                )}

                {/* Resumo (Opcional - destacado) */}
                {post.excerpt && (
                    <div className="text-xl md:text-2xl font-display font-light text-neutral-600 dark:text-neutral-400 mb-12 leading-relaxed border-l-4 border-primary pl-6 py-2">
                        {post.excerpt}
                    </div>
                )}

                {/* Conteúdo Rico HTML */}
                <div
                    className="prose prose-lg dark:prose-invert prose-headings:font-display prose-headings:font-medium prose-a:text-primary hover:prose-a:text-primary-600 prose-img:rounded-xl max-w-none text-ink/80 dark:text-parchment/80 leading-loose"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* Tag Footer & Share (placeholder) */}
                <footer className="mt-16 pt-8 border-t border-neutral-200 dark:border-neutral-800">
                    <p className="text-sm text-neutral-500 font-medium uppercase tracking-widest text-center">
                        Gostou do conteúdo? Compartilhe e não deixe de se inscrever na nossa newsletter.
                    </p>
                </footer>
            </article>

            {/* Schema SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingJsonLd) }}
            />
        </main>
    );
}
