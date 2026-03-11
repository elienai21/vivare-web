export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://vivare.com.br';
export const SITE_NAME = 'Vivare';
export const SITE_DESCRIPTION = 'Hospedagens de alto padrão em São Paulo, Santos e Guarujá. Design, conforto e zero burocracia para sua estadia perfeita.';
export const WHATSAPP_NUMBER = '5511985067840';
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;
export const DEFAULT_OG_IMAGE = `/og-image.jpg`;

export function trackEvent(eventName: string, params?: Record<string, string>) {
  if (typeof window !== 'undefined' && (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag) {
    (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('event', eventName, params);
  }
}
