import type { Metadata, ResolvingMetadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlugServer, listPublishedPostsServer } from "@/services/cmsServiceServer";
import { WHATSAPP_URL } from "@/lib/constants";
import { CalendarIcon, ClockIcon, UserIcon, ArrowLeftIcon } from "lucide-react";

export const dynamic = 'force-dynamic';

type Props = {
    params: Promise<{ slug: string }>;
};

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { slug } = await params;
    const post = await getPostBySlugServer(slug);
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
    const { slug } = await params;
    const post = await getPostBySlugServer(slug);

    if (!post) {
        notFound();
    }

    const isoDate = new Date(post.publishedAt || post.updatedAt).toISOString();

    // Posts relacionados: prioriza quem compartilha tag; completa com os mais recentes.
    const allPosts = await listPublishedPostsServer(12).catch(() => [] as typeof post[]);
    const others = allPosts.filter((p) => p.slug !== post.slug);
    const sameTag = others.filter((p) => (p.tags ?? []).some((t) => (post.tags ?? []).includes(t)));
    const related = [...sameTag, ...others.filter((p) => !sameTag.includes(p))].slice(0, 3);

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
        <main className="min-h-screen pt-10 md:pt-14 pb-20 bg-background-light dark:bg-background-dark">
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
                                <span key={tag} className="px-3 py-1 bg-primary-dim text-foreground text-xs uppercase tracking-[0.1em] font-semibold rounded-full">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    <h1 className="font-display text-4xl md:text-5xl font-normal text-ink dark:text-parchment leading-tight mb-8 text-balance">
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
                    <figure className="mb-16 -mx-6 lg:-mx-16 aspect-[21/9] relative rounded-none lg:rounded-2xl overflow-hidden">
                        <Image
                            src={post.coverImage}
                            alt={`Capa do artigo: ${post.title}`}
                            fill
                            sizes="(max-width: 1024px) 100vw, 1024px"
                            className="object-cover"
                            priority
                        />
                    </figure>
                )}

                {/* Resumo (Opcional - destacado) */}
                {post.excerpt && (
                    <div className="text-lg md:text-xl text-foreground/90 mb-12 leading-relaxed border-l border-primary pl-6 py-1 max-w-[65ch]">
                        {post.excerpt}
                    </div>
                )}

                {/* Conteúdo Rico HTML */}
                <div
                    className="prose prose-lg dark:prose-invert prose-headings:font-display prose-headings:font-semibold prose-headings:text-balance prose-img:rounded-xl max-w-[65ch] mx-auto text-foreground leading-relaxed prose-p:text-[1.0625rem] prose-p:leading-[1.7]"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* Fecho: continuar lendo + caminho de volta ao funil */}
                <footer className="mt-16 pt-10 border-t border-card-border">
                    {related.length > 0 && (
                        <section aria-labelledby="continue-lendo" className="mb-12">
                            <h2 id="continue-lendo" className="font-display text-2xl font-medium mb-6">Continue lendo</h2>
                            <ul className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                {related.map((r) => (
                                    <li key={r.id}>
                                        <Link href={`/blog/${r.slug}`} className="group block">
                                            {r.coverImage && (
                                                <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-warm-mid dark:bg-ink-card mb-3">
                                                    <Image src={r.coverImage} alt="" fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]" />
                                                </div>
                                            )}
                                            <h3 className="font-display text-lg font-medium leading-snug line-clamp-3 group-hover:text-primary-deep dark:group-hover:text-primary-light transition-colors">{r.title}</h3>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                    <div className="rounded-2xl bg-ink text-parchment p-8 md:p-10">
                        <p className="chapeu text-primary-light">Hospede-se com a Vivare</p>
                        <h2 className="mt-2 font-display text-2xl md:text-3xl font-normal text-balance">Apartamentos de alto padrão em São Paulo, Santos e Guarujá.</h2>
                        <p className="mt-3 text-warm-mid max-w-prose">Check-in digital, sem caução e sem fiador. Reservar direto custa menos do que nas plataformas.</p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <Link href="/unidades" className="inline-flex min-h-12 items-center bg-primary-light px-6 text-xs font-bold uppercase tracking-widest text-ink transition-colors hover:bg-primary-glow">Ver acomodações</Link>
                            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center border border-primary/60 px-6 text-xs font-semibold uppercase tracking-widest text-parchment transition-colors hover:bg-white/5">Falar no WhatsApp</a>
                        </div>
                    </div>
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
