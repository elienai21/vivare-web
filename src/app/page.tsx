import { Suspense } from "react";
import { Hero } from "@/components/home/Hero";
import { Collections } from "@/components/home/Collections";
import { CityEvents } from "@/components/home/CityEvents";
import { FeaturedListings } from "@/components/home/FeaturedListings";
import { Skeleton } from "@/components/ui/Skeleton";

function FeaturedSkeleton() {
  return (
    <div className="py-24 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between mb-12 gap-6">
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-6 w-96" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="aspect-[4/3] rounded-3xl" />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-black">
      <Hero />
      <Collections />
      <CityEvents />
      <Suspense fallback={<FeaturedSkeleton />}>
        <FeaturedListings />
      </Suspense>
    </main>
  );
}
