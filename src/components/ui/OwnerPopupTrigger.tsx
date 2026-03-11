"use client";

import { useOwnerPopup } from "./OwnerPopupProvider";

export function OwnerPopupTrigger({ children, className }: { children: React.ReactNode, className?: string }) {
    const { openOwnerPopup } = useOwnerPopup();
    return (
        <button onClick={openOwnerPopup} className={className}>
            {children}
        </button>
    );
}
