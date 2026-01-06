import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

const COLLECTIONS = [
    {
        id: 'beach',
        title: 'Pé na Areia',
        description: 'Acorde com o som das ondas em nossa seleção exclusiva à beira-mar.',
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop',
        href: '/acomodacoes?collection=beach'
    },
    {
        id: 'countryside',
        title: 'Refúgios de Campo',
        description: 'Tranquilidade, ar puro e natureza exuberante para recarregar as energias.',
        image: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=2076&auto=format&fit=crop',
        href: '/acomodacoes?collection=countryside'
    },
    {
        id: 'urban',
        title: 'Oásis Urbanos',
        description: 'Design e sofisticação nos bairros mais nobres da cidade.',
        image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=2070&auto=format&fit=crop',
        href: '/acomodacoes?collection=urban'
    }
];

export function Collections() {
    return (
        <section className="py-24 px-6 bg-white dark:bg-black">
            <div className="max-w-7xl mx-auto">
                <div className="mb-12 text-center md:text-left">
                    <h2 className="text-3xl md:text-4xl font-display font-bold text-neutral-900 dark:text-white mb-4">
                        Inspire-se por Coleções
                    </h2>
                    <p className="text-lg text-neutral-600 dark:text-neutral-400 font-light max-w-2xl">
                        Descubra o cenário perfeito para sua próxima experiência inesquecível.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {COLLECTIONS.map((collection) => (
                        <Link
                            key={collection.id}
                            href={collection.href}
                            className="group relative h-[400px] rounded-3xl overflow-hidden cursor-pointer"
                        >
                            <Image
                                src={collection.image}
                                alt={collection.title}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                            <div className="absolute bottom-0 left-0 p-8 w-full">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-2xl font-bold text-white font-display">
                                        {collection.title}
                                    </h3>
                                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                                        <ArrowUpRight className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                                <p className="text-white/80 font-light text-sm line-clamp-2 transform translate-y-2 opacity-80 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                    {collection.description}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
