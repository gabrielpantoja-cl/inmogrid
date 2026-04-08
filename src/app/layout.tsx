import React from 'react';
import './globals.css';
import { Metadata, Viewport } from 'next';
import { Toaster } from 'react-hot-toast';
import { CookieConsentProvider } from '@/shared/components/layout/legal/CookieConsentProvider';
import CookieConsentBanner from '@/shared/components/layout/legal/CookieConsentBanner';
import {
  ConditionalGoogleAnalytics,
  ConditionalVercelAnalytics,
  ConditionalSpeedInsights
} from '@/shared/components/layout/legal/ConditionalAnalytics';
import Footer from '@/shared/components/layout/common/Footer';

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
    template: '%s | degux.cl',
    default: 'degux.cl - Tu lienzo digital para crear y conectar',
  },
  description: 'Un espacio libre y abierto donde puedes construir tu perfil, publicar tu trabajo, compartir ideas y conectar con una comunidad de creadores y profesionales.',
  metadataBase: new URL('https://degux.cl'),
  applicationName: 'degux.cl',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'degux.cl',
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  authors: [{ name: 'degux.cl', url: 'https://degux.cl' }], 
  creator: 'degux.cl',
  publisher: 'degux.cl',
  keywords: ['marca personal', 'portafolio digital', 'creadores de contenido', 'networking', 'comunidad profesional', 'blog personal', 'Substack', 'Behance', 'Linktree'],
  icons: {
    icon: [
      { url: '/images/android/android-launchericon-512-512.png', sizes: '512x512', type: 'image/png' },
      { url: '/images/android/android-launchericon-192-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any', type: 'image/x-icon' }
    ],
    apple: [
      { url: '/images/ios/180.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
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
    title: 'degux.cl - Tu lienzo digital para crear y conectar',
    description: 'Construye tu perfil, publica tu trabajo y conecta con una comunidad de creadores y profesionales.',
    url: 'https://degux.cl',
    siteName: 'degux.cl',
    locale: 'es_CL',
    type: 'website',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'degux.cl - Tu lienzo digital para crear y conectar',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'degux.cl - Tu lienzo digital para crear y conectar',
    description: 'Construye tu perfil, publica tu trabajo y conecta con una comunidad de creadores y profesionales.',
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
    canonical: 'https://degux.cl',
  },
};

// Componente RootLayout Principal
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning={true}>
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
      <body className="antialiased">
        <CookieConsentProvider>
          <>
            {children}
            <Footer />
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
