import type { Metadata } from "next";
import { Manrope, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, DEFAULT_OG_IMAGE } from "@/lib/constants";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  style: ["normal", "italic"]
});

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
import { OwnerPopup } from "@/components/ui/OwnerPopup";
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
    <html lang="pt-BR" className={`${manrope.variable} ${cormorant.variable}`} suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <OwnerPopupProvider>
            <Header />
            {children}
            <Footer />
            <OwnerPopup />
            <FloatingWhatsApp />
            <ScrollObserver />
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
