/**
 * Lightweight anti-bot helpers.
 *
 * No third-party service required. Layered defense:
 *
 * 1. **Honeypot field** — render an invisible input bots tend to fill.
 *    Real users never see it; if it has a value on submit, treat it as
 *    spam and silently bail.
 *
 * 2. **Submit rate limit** — keep a per-form timestamp in `localStorage`
 *    so the same browser can't replay a form within `MIN_INTERVAL_MS`.
 *    Catches naive scripts and accidental double-clicks.
 *
 * 3. **Likely-bot detection** — `navigator.webdriver` + a small list of
 *    obvious headless/bot user-agents. Used to skip analytics so we
 *    don't poison GA4/Meta numbers with synthetic traffic.
 *
 * Limitations: this is the cheapest tier — anything determined to bypass
 * us (puppeteer-extra-stealth, residential proxies) will get through.
 * For higher-value sites pair with Cloudflare Turnstile or hCaptcha.
 */

const STORAGE_PREFIX = 'vivare_form_lastsubmit_';
const MIN_INTERVAL_MS = 30 * 1000; // 30s

/** Field name used by the honeypot helpers. Keep it innocuous-looking. */
export const HONEYPOT_FIELD = 'website_url' as const;

/**
 * Returns true if the visitor looks like a bot. Conservative on purpose
 * — false positives kill real conversions, so we only flag the obvious.
 */
export function isLikelyBot(): boolean {
    if (typeof navigator === 'undefined') return false;

    // Selenium/Playwright/Puppeteer set this on the navigator object.
    // Real browsers leave it undefined unless the user explicitly opts in.
    if ((navigator as Navigator & { webdriver?: boolean }).webdriver) return true;

    const ua = navigator.userAgent || '';
    if (!ua) return true; // empty UA is itself suspicious

    // Lightweight bot signatures. We keep this short to avoid false
    // positives — Google/Meta crawlers don't reach client-side code on
    // SSR'd pages, so we mostly worry about scrapers and naive scripts.
    const botPatterns = [
        /bot/i,
        /crawler/i,
        /spider/i,
        /headlesschrome/i,
        /phantom/i,
        /puppeteer/i,
        /selenium/i,
        /playwright/i,
    ];
    return botPatterns.some((p) => p.test(ua));
}

/**
 * Inspect the form's honeypot field. A real user can't see/fill it, so
 * any non-empty value means an automated submitter.
 */
export function isHoneypotTriggered(formData: Record<string, unknown>): boolean {
    const value = formData[HONEYPOT_FIELD];
    return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Per-form rate limit. Returns `{ ok: true }` when the submission is
 * allowed, otherwise `{ ok: false, retryAfterMs }` so the caller can
 * present a sensible message instead of hard-failing.
 */
export function checkSubmitRateLimit(
    formId: string,
): { ok: true } | { ok: false; retryAfterMs: number } {
    if (typeof window === 'undefined') return { ok: true };
    try {
        const key = STORAGE_PREFIX + formId;
        const last = parseInt(window.localStorage.getItem(key) || '0', 10);
        const now = Date.now();
        const elapsed = now - last;
        if (last && elapsed < MIN_INTERVAL_MS) {
            return { ok: false, retryAfterMs: MIN_INTERVAL_MS - elapsed };
        }
        window.localStorage.setItem(key, String(now));
        return { ok: true };
    } catch {
        // localStorage disabled (private mode / quota) — fail open.
        return { ok: true };
    }
}

/**
 * Tailwind-friendly classes for hiding a honeypot from real users while
 * keeping it submitted with the form. We avoid `display:none` because
 * some bot frameworks specifically skip those.
 */
export const honeypotHiddenClass =
    'absolute left-[-9999px] top-auto w-px h-px overflow-hidden';
