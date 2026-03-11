"use client";

import dynamic from "next/dynamic";

const PropertyMap = dynamic(() => import("./PropertyMap"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full bg-neutral-100 flex items-center justify-center animate-pulse">
            <span className="material-symbols-outlined text-4xl text-neutral-300">map</span>
        </div>
    ),
});

export default PropertyMap;
