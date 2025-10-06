/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración de imágenes para optimización
  images: {
    // Permitir optimización de imágenes locales y externas
    domains: [
      'localhost',
      'degux.cl',
      'www.degux.cl',
      'vercel.app',
      'lh3.googleusercontent.com',  // Para avatares de Google
      'avatars.githubusercontent.com', // Para avatares de GitHub (futuro)
    ],
    // Patrones remotos para mayor flexibilidad
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.tile.openstreetmap.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'vercel.app',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'degux.cl',
        port: '',
        pathname: '/**',
      },
    ],
    // Formatos soportados para optimización
    formats: ['image/webp', 'image/avif'],
    // Configuraciones adicionales para desarrollo
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Configuración de tamaños de imagen
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Configuración de Headers para CSP y Cache Control
  async headers() {
    const cspHeader = `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://static.cloudflareinsights.com;
      style-src 'self' 'unsafe-inline';
      img-src 'self' blob: data: https://*.googleusercontent.com https://*.tile.openstreetmap.org https://degux.cl https://www.degux.cl;
      font-src 'self' data:;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'none';
      connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com https://vercel.live/ https://vitals.vercel-insights.com https://api.openai.com https://api.github.com ws://127.0.0.1:* ws://localhost:*;
      block-all-mixed-content;
      upgrade-insecure-requests;
    `;

    return [
      // Headers para páginas HTML - cache corto
      {
        source: '/:path*',
        has: [
          {
            type: 'header',
            key: 'accept',
            value: '(.*text/html.*)',
          },
        ],
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
          },
          {
            key: 'Content-Security-Policy',
            value: cspHeader.replace(/\s{2,}/g, ' ').trim(),
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      // Headers para archivos estáticos con hash (inmutables)
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Headers para imágenes (cache medio)
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000',
          },
        ],
      },
      // Headers para favicon y manifest
      {
        source: '/(favicon.ico|manifest.json|robots.txt)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=86400',
          },
        ],
      },
      // Headers para API pública (cache corto con revalidación)
      {
        source: '/api/public/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
      // Headers para APIs privadas (no cachear)
      {
        source: '/api/:path((?!public).*)*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },

  // Configuración adicional para desarrollo
  experimental: {
    optimizePackageImports: ['@heroicons/react'],
  },

  // Configuración de webpack para desarrollo
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Mejoras para desarrollo local
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    
    // Configuración adicional para manejar módulos
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    };
    
    return config;
  },

  // Configuración de transpile para módulos específicos
  transpilePackages: ['@ai-sdk/openai', 'ai'],

  // ✅ CONFIGURACIÓN DE REDIRECCIONES CORREGIDA
  async redirects() {
    return [
      // ✅ CORREGIDO: Solo redirigir /login a /auth/signin
      // Eliminados otros redirects que podrían causar bucles
      {
        source: '/login',
        destination: '/auth/signin',
        permanent: false,
      },
      // ✅ AGREGADO: Redirigir también /signin por consistencia
      {
        source: '/signin',
        destination: '/auth/signin',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
