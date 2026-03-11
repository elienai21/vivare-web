"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface OwnerPopupContextType {
    openOwnerPopup: () => void;
    closeOwnerPopup: () => void;
    isOpen: boolean;
}

const OwnerPopupContext = createContext<OwnerPopupContextType | undefined>(undefined);

export function useOwnerPopup() {
    const context = useContext(OwnerPopupContext);
    if (!context) {
        throw new Error("useOwnerPopup must be used within an OwnerPopupProvider");
    }
    return context;
}

export function OwnerPopupProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);

    const openOwnerPopup = () => {
        setIsOpen(true);
        trackEvent("owner_popup_opened");
    };

    const closeOwnerPopup = () => {
        setIsOpen(false);
        trackEvent("owner_popup_closed");
    };

    // Basic event tracking mock (should be wired to GTM/GA4)
    const trackEvent = (eventName: string, data?: unknown) => {
        console.log(`[Tracking Event] ${eventName}`, data || "");
        if (typeof window !== "undefined" && (window as unknown as { gtag?: (type: string, name: string, data?: unknown) => void }).gtag) {
            const w = window as unknown as { gtag: (type: string, name: string, data?: unknown) => void };
            w.gtag("event", eventName, data);
        }
    };

    return (
        <OwnerPopupContext.Provider value={{ openOwnerPopup, closeOwnerPopup, isOpen }}>
            {children}
        </OwnerPopupContext.Provider>
    );
}
