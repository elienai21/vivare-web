"use client";

import dynamic from "next/dynamic";
import { Map as MapIcon } from "lucide-react";

const PropertyMap = dynamic(() => import("./PropertyMap"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full bg-neutral-100 flex items-center justify-center animate-pulse">
            <MapIcon className="w-10 h-10 text-neutral-300" aria-hidden="true" />
        </div>
    ),
});

export default PropertyMap;
