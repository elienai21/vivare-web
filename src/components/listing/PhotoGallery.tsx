import Image from 'next/image';
import { Photo } from '@/types';
import { Button } from '@/components/ui/Button';
import { Grid } from 'lucide-react';

interface PhotoGalleryProps {
    photos: Photo[];
}

export function PhotoGallery({ photos }: PhotoGalleryProps) {
    if (!photos || photos.length === 0) return null;

    // We display up to 5 photos: 1 main, 4 smaller
    const mainPhoto = photos[0];
    const sidePhotos = photos.slice(1, 5);


    return (
        <div className="relative rounded-2xl overflow-hidden shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 h-[400px] md:h-[500px]">
                {/* Main Photo */}
                <div className="relative h-full">
                    <Image
                        src={mainPhoto.url}
                        alt={mainPhoto.caption || 'Main photo'}
                        fill
                        className="object-cover hover:opacity-95 transition-opacity cursor-pointer"
                        priority
                        sizes="(max-width: 768px) 100vw, 50vw"
                    />
                </div>

                {/* Side Photos Grid */}
                <div className="hidden md:grid grid-cols-2 gap-2 h-full">
                    {sidePhotos.map((photo, index) => (
                        <div key={photo.id} className="relative h-full">
                            <Image
                                src={photo.url}
                                alt={photo.caption || `Photo ${index + 2}`}
                                fill
                                className="object-cover hover:opacity-95 transition-opacity cursor-pointer"
                                sizes="25vw"
                            />
                        </div>
                    ))}

                    {/* Fill empty slots if fewer than 5 photos? No, grid handles it. */}
                </div>
            </div>

            {/* Show All Button */}
            <div className="absolute bottom-4 right-4">
                <Button variant="secondary" size="sm" className="shadow-lg backdrop-blur-sm bg-white/90 hover:bg-white">
                    <Grid className="w-4 h-4 mr-2" />
                    Mostrar todas as fotos
                </Button>
            </div>
        </div>
    );
}
