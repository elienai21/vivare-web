export function formatImageUrl(url: unknown): string {
    // Defensive: callers occasionally pass values from Firestore/CMS that
    // come back as non-strings (Timestamp, undefined, null, number) under
    // a `Record<string, string>` cast. Bail on anything that isn't a
    // usable string so `.match()` / `.includes()` never blow up the page.
    if (typeof url !== "string" || url.length === 0) return "";

    // Se for link de view ou open do Google Drive
    if (url.includes("drive.google.com")) {
        // Formato: https://drive.google.com/file/d/1yOBdIXFeSyk9HZZV1IqdSXiRsftfuU_/view?usp=sharing
        const match = url.match(/\/d\/(.*?)\//) || url.match(/[?&]id=(.*?)(&|$)/);

        if (match && match[1]) {
            const fileId = match[1];
            // Format for direct image display
            return `https://drive.google.com/uc?export=view&id=${fileId}`;
        }
    }

    return url;
}
