export function formatImageUrl(url: string | null | undefined): string {
    if (!url) return "";

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
