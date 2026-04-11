import React from 'react';
import './globals.css';
import { Poppins } from 'next/font/google';
import { Metadata, Viewport } from 'next';

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700', '800'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
});
import { Toaster } from 'react-hot-toast';
import { CookieConsentProvider } from '@/shared/components/layout/legal/CookieConsentProvider';
import CookieConsentBanner from '@/shared/components/layout/legal/CookieConsentBanner';
import {
  ConditionalGoogleAnalytics,
  ConditionalVercelAnalytics,
  ConditionalSpeedInsights
} from '@/shared/components/layout/legal/ConditionalAnalytics';
import Footer from '@/shared/components/layout/common/Footer';
import { GitHubStarsSimple } from '@/features/github-stars/components';

// Configuración del Viewport
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

// Configuración de Metadatos (SEO, Social Sharing, etc.)
export const metadata: Metadata = {
  title: {
    template: '%s | inmogrid.cl',
    default: 'inmogrid.cl — Conocimiento abierto para la comunidad inmobiliaria chilena',
  },
  description: 'Ecosistema digital abierto y colaborativo para la comunidad inmobiliaria chilena. Un espacio libre para tasadores, peritos, corredores de propiedades, abogados inmobiliarios, arquitectos y administradores donde publicar, compartir conocimiento y conectar.',
  metadataBase: new URL('https://inmogrid.cl'),
  applicationName: 'inmogrid.cl',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'inmogrid.cl',
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  authors: [{ name: 'inmogrid.cl', url: 'https://inmogrid.cl' }],
  creator: 'inmogrid.cl',
  publisher: 'inmogrid.cl',
  keywords: ['comunidad inmobiliaria', 'sector inmobiliario chile', 'tasadores', 'peritos judiciales', 'corredores de propiedades', 'abogados inmobiliarios', 'arquitectos', 'administradores de propiedad', 'datos abiertos', 'código abierto', 'open source', 'referenciales', 'CBR', 'conservador de bienes raíces'],
  // Nota: el favicon principal vive en `src/app/icon.png` y Next.js 15 lo
  // inyecta automaticamente vía file-based metadata conventions. Las entries
  // de abajo son solo para los tamaños mayores (PWA launcher icons) y Apple
  // touch icon, que no siguen la convención de ruta.
  icons: {
    icon: [
      { url: '/images/android/android-launchericon-512-512.png', sizes: '512x512', type: 'image/png' },
      { url: '/images/android/android-launchericon-192-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/images/ios/180.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/images/safari-pinned-tab.svg',
        color: '#000000',
      },
    ],
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'inmogrid.cl — Conocimiento abierto para la comunidad inmobiliaria chilena',
    description: 'Ecosistema digital abierto y colaborativo para tasadores, peritos, corredores, abogados inmobiliarios, arquitectos y otros profesionales del rubro inmobiliario en Chile.',
    url: 'https://inmogrid.cl',
    siteName: 'inmogrid.cl',
    locale: 'es_CL',
    type: 'website',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'inmogrid.cl — Comunidad inmobiliaria abierta de Chile',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'inmogrid.cl — Conocimiento abierto para la comunidad inmobiliaria chilena',
    description: 'Ecosistema digital abierto y colaborativo para tasadores, peritos, corredores, abogados inmobiliarios, arquitectos y otros profesionales del rubro inmobiliario en Chile.',
    images: ['/images/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://inmogrid.cl',
  },
};

// Componente RootLayout Principal
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning={true} className={poppins.variable}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        {/* Google Analytics Consent Mode Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('consent', 'default', {
                analytics_storage: 'denied',
                ad_storage: 'denied',
                functionality_storage: 'denied',
                personalization_storage: 'denied',
                security_storage: 'granted',
                wait_for_update: 500,
              });
            `
          }}
        />
      </head>
      <body className={`antialiased ${poppins.className}`}>
        <CookieConsentProvider>
          <>
            {children}
            <Footer
              githubStarsSlot={
                <GitHubStarsSimple repo="inmogrid/inmogrid" className="text-xs" />
              }
            />
          </>

          {/* Componente para mostrar notificaciones (react-hot-toast) */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                style: {
                  background: '#22c55e',
                },
              },
              error: {
                duration: 3000,
                style: {
                  background: '#ef4444',
                },
              },
            }}
          />

          {/* Analytics condicionales - Solo se cargan con consentimiento */}
          <ConditionalGoogleAnalytics />
          <ConditionalVercelAnalytics />
          <ConditionalSpeedInsights />

          {/* Banner de consentimiento de cookies */}
          <CookieConsentBanner />

        </CookieConsentProvider>
      </body>
    </html>
  );
}
