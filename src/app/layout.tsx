import type { Metadata, Viewport } from "next";
import { Jost, Source_Sans_3 } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, DEFAULT_OG_IMAGE, META_PIXEL_ID, GA4_ID, GOOGLE_ADS_ID, GTM_ID } from "@/lib/constants";

/* Mesmas fontes da apresentação comercial: Jost nos títulos (geométrica,
   da família do logotipo) e Source Sans 3 no texto. As duas são variáveis,
   então um arquivo por fonte cobre todos os pesos. */
const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

/** Cor da barra de status por tema e área segura do iPhone (mobile-native). */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f4" },
    { media: "(prefers-color-scheme: dark)", color: "#16241d" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - Hospedagens de Alto Padrão`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "hospedagem São Paulo", "aluguel temporada São Paulo", "apartamento temporada",
    "hospedagem Santos", "hospedagem Guarujá", "aluguel por temporada",
    "apartamento mobiliado SP", "estadia curta São Paulo", "check-in digital",
    "locação temporada premium", "Vivare", "gestão de imóveis",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} - Hospedagens de Alto Padrão em SP, Santos e Guarujá`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Vivare - Hospedagens de Alto Padrão",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} - Hospedagens de Alto Padrão`,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
};

import { OwnerPopupProvider } from "@/components/ui/OwnerPopupProvider";
import { LazyOwnerPopup } from "@/components/ui/LazyOwnerPopup";
import { FloatingWhatsApp } from "@/components/ui/FloatingWhatsApp";
import { Header } from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import { ThemeProvider } from "@/components/theme-provider";
import { ScrollObserver } from "@/components/ui/ScrollObserver";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Vivare",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description: SITE_DESCRIPTION,
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+55-11-98506-7840",
    contactType: "customer service",
    areaServed: "BR",
    availableLanguage: "Portuguese",
  },
  areaServed: ["São Paulo", "Santos", "Guarujá"],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Vivare",
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/unidades?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${sourceSans.variable} ${jost.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        {/* Google Tag (gtag.js) — script NATIVO (não next/script).
            Motivo: `next/script strategy="afterInteractive"` renderiza só
            um <link preload as="script"> no HTML inicial e injeta o
            <script> executável via JS depois da hidratação. O detector
            automático do Google Ads faz um fetch estático do HTML (sem
            rodar JS) e procura o <script async src="...gtag/js?id=AW-...">
            literal — que não existe no HTML com next/script. Usando o
            script nativo, ele aparece no HTML servido (SSR) exatamente no
            formato que o Google espera, e ainda carrega mais cedo.
            O `id=` do carregador usa o Google Ads quando configurado
            (detector procura por ele); GA4 segue via gtag('config'). */}
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID || GA4_ID}`}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA4_ID}');
              ${GOOGLE_ADS_ID ? `gtag('config', '${GOOGLE_ADS_ID}');` : ''}
            `,
          }}
        />
        {/* Google Tag Manager — só carrega quando NEXT_PUBLIC_GTM_ID está
            setado. Script nativo (mesmo motivo do gtag acima) e depois do
            init do dataLayer, pra que o container já enxergue os pushes
            do gtag. O <noscript> correspondente fica no topo do <body>. */}
        {GTM_ID && (
          /* eslint-disable-next-line @next/next/next-script-for-ga */
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${GTM_ID}');
              `,
            }}
          />
        )}
        {/* Meta Pixel — only loads when NEXT_PUBLIC_META_PIXEL_ID is set.
            Set the env var in Vercel (Production + Preview) to activate
            without redeploying app code. fbq becomes a no-op when the
            ID is empty, so trackEvent() is safe either way. */}
        {META_PIXEL_ID && (
          <>
            <Script id="meta-pixel" strategy="afterInteractive">
              {`
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${META_PIXEL_ID}');
                fbq('track', 'PageView');
              `}
            </Script>
            {/* noscript fallback for users with JS disabled */}
            <noscript>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                height="1"
                width="1"
                style={{ display: 'none' }}
                alt=""
                src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
              />
            </noscript>
          </>
        )}
      </head>
      <body>
        {/* Google Tag Manager (noscript) — fallback pra JS desabilitado.
            O Google pede que fique logo após a abertura do <body>. */}
        {GTM_ID && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
              title="Google Tag Manager"
            />
          </noscript>
        )}
        {/* Skip-to-content link — visible only when keyboard-focused. Lets
            screen-reader & keyboard users bypass the sticky header on every
            page. WCAG 2.4.1 (Bypass Blocks). */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-ink focus:text-parchment focus:px-4 focus:py-2 focus:rounded focus:outline-none focus:ring-2 focus:ring-primary"
        >
          Pular para o conteúdo
        </a>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <OwnerPopupProvider>
            <Header />
            {/* Wrapper target for the skip-link. tabIndex=-1 lets focus land
                here programmatically without putting it into the tab order. */}
            <div id="main-content" tabIndex={-1} className="focus:outline-none">
              {children}
            </div>
            <Footer />
            <LazyOwnerPopup />
            <FloatingWhatsApp />
            <ScrollObserver />
            {/* Prévia temporária de paleta: remover após a decisão */}
          </OwnerPopupProvider>
        </ThemeProvider>
        <div id="root-portal" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </body>
    </html>
  );
}
