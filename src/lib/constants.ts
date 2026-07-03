export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://vivarestay.com';
export const SITE_NAME = 'Vivare';
export const SITE_DESCRIPTION = 'Hospedagens de alto padrão em São Paulo, Santos e Guarujá. Design, conforto e zero burocracia para sua estadia perfeita.';
export const WHATSAPP_NUMBER = '5511985067840';
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;
export const DEFAULT_OG_IMAGE = `/og-img.png`;

/**
 * GA4 Measurement ID. Configurado no `<head>` do layout.
 */
export const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID || 'G-NS503CK9EC';

/**
 * Google Ads Conversion ID. Setar `NEXT_PUBLIC_GOOGLE_ADS_ID` na Vercel
 * (formato `AW-XXXXXXXXX`) pra habilitar rastreamento de conversões
 * de campanhas Google Ads. Sem isso, o `gtag('config', ...)` do Ads
 * não é injetado e as chamadas viram no-op — GA4 continua funcionando
 * normal em paralelo.
 *
 * Quando setado, `trackEvent('purchase', {...})` já dispara conversão
 * automaticamente pra Ads via GA4 → Ads import (recomendado, latência
 * de ~24h). Pra conversões com latência baixa, configure Conversion
 * Labels no Ads Dashboard e use `trackAdsConversion(label, ...)` abaixo.
 */
export const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || '';

/**
 * Meta (Facebook) Pixel ID. Set NEXT_PUBLIC_META_PIXEL_ID in your env to
 * enable Pixel tracking. When unset, all Pixel calls become no-ops and
 * the GA4 path is unaffected.
 */
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '';

/**
 * Maps GA4-style snake_case event names to the Meta Pixel standard
 * events that match. Anything not in this map is forwarded as a custom
 * `trackCustom` so the Pixel still receives signal, just unmapped.
 *
 * Reference: https://developers.facebook.com/docs/meta-pixel/reference
 */
const PIXEL_EVENT_MAP: Record<string, string> = {
  // Booking funnel
  begin_checkout: 'InitiateCheckout',
  add_payment_info: 'AddPaymentInfo',
  purchase: 'Purchase',
  view_item: 'ViewContent',
  search: 'Search',
  // Owner / lead funnel
  owner_popup_submitted: 'Lead',
  owner_contact_form_submitted: 'Lead',
  simulacao_submitted: 'Lead',
  email_signup_submitted: 'Subscribe',
};

type PixelParams = {
  value?: number;
  currency?: string;
  content_ids?: string[];
  content_name?: string;
  content_type?: string;
  num_items?: number;
} & Record<string, unknown>;

/**
 * Cheap client-side bot check. We use this to skip analytics for the
 * obvious cases (Selenium, Puppeteer, headless Chrome, common scrapers)
 * so synthetic traffic doesn't poison conversion data and inflate ad
 * spend. Conservative by design — false positives would silently lose
 * real conversions, which is worse than letting some bots through.
 *
 * Duplicated here (instead of imported from `lib/anti-bot.ts`) to keep
 * `constants.ts` free of circular-import risk and importable from
 * anywhere — including server components that tree-shake to nothing.
 */
function isAnalyticsBot(): boolean {
  if (typeof navigator === 'undefined') return false;
  if ((navigator as Navigator & { webdriver?: boolean }).webdriver) return true;
  const ua = navigator.userAgent || '';
  if (!ua) return true;
  return /bot|crawler|spider|headlesschrome|phantom|puppeteer|selenium|playwright/i.test(ua);
}

/**
 * Fire an analytics event in every connected destination (GA4 today,
 * Meta Pixel when configured). Numeric params like `value` are kept as
 * numbers — only attach `currency` alongside `value` so revenue events
 * land correctly in both platforms.
 *
 * Skips entirely for likely bots — saves money on ad platforms that
 * optimize bidding off of these signals.
 */
export function trackEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  if (isAnalyticsBot()) return;

  // GA4 (gtag) — same shape we've been using all along.
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  if (typeof gtag === 'function') {
    gtag('event', eventName, params);
  }

  // Meta Pixel — translate to standard event when we know the mapping,
  // otherwise send as a custom event. Both code paths require fbq().
  const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq;
  if (typeof fbq === 'function') {
    const pixelEvent = PIXEL_EVENT_MAP[eventName];
    const pixelParams = params ? (params as PixelParams) : undefined;
    if (pixelEvent) {
      fbq('track', pixelEvent, pixelParams);
    } else {
      fbq('trackCustom', eventName, pixelParams);
    }
  }
}

/**
 * Dispara uma conversão específica pro Google Ads em cima de um
 * Conversion Label criado no Ads Dashboard (Tools → Conversions).
 *
 * Uso:
 *   trackAdsConversion('AbC1De2FgH', { value: 2880, currency: 'BRL' })
 *
 * O `send_to` combina o Ads ID + Label. `value` e `currency` são
 * opcionais mas obrigatórios pra Smart Bidding baseado em ROAS.
 *
 * No-op quando `NEXT_PUBLIC_GOOGLE_ADS_ID` não está setado, ou quando
 * o visitante parece bot.
 */
export function trackAdsConversion(
  conversionLabel: string,
  params?: { value?: number; currency?: string; transaction_id?: string },
) {
  if (typeof window === 'undefined') return;
  if (isAnalyticsBot()) return;
  if (!GOOGLE_ADS_ID) return;

  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  if (typeof gtag !== 'function') return;

  gtag('event', 'conversion', {
    send_to: `${GOOGLE_ADS_ID}/${conversionLabel}`,
    ...params,
  });
}
