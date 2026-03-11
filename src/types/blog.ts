export interface BlogPost {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string; // HTML ou Markdown
    coverImage?: string;
    author: string;
    tags: string[];
    status: 'draft' | 'published';
    publishedAt?: number;
    createdAt: number;
    updatedAt: number;
    updatedBy?: string;
}

export interface NewsletterSubscriber {
    id?: string;
    email: string;
    subscribedAt: number;
    source?: string;
}
