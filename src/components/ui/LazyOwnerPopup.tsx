"use client";

import dynamic from "next/dynamic";
import { useOwnerPopup } from "./OwnerPopupProvider";

/**
 * Lazy mount for OwnerPopup. The full popup pulls in Firebase Firestore
 * (~250KB gzip) just to write the lead doc on submit, so we keep it out of
 * the initial bundle of every page (it sits in the root layout) and only
 * load it the first time the user actually opens the modal.
 *
 * Behavior contract: identical to mounting <OwnerPopup /> directly — the
 * provider state remains the source of truth for open/close.
 */
const OwnerPopup = dynamic(
    () => import("./OwnerPopup").then((m) => m.OwnerPopup),
    { ssr: false, loading: () => null },
);

export function LazyOwnerPopup() {
    const { isOpen } = useOwnerPopup();
    if (!isOpen) return null;
    return <OwnerPopup />;
}
