// Ubicación: components/ui/common/Footer.tsx
import React from 'react';
import Link from 'next/link';
import { version as nextVersion } from 'next/package.json';
import { version as reactVersion } from 'react/package.json';

const Footer: React.FC = () => {
  // --- URLs (Asegúrate que sean correctas) ---
  const githubRepoUrl = process.env.NEXT_PUBLIC_GITHUB_REPO_URL || 'https://github.com/gabrielpantoja-cl/degux.cl';
  const githubDiscussionsUrl = `${githubRepoUrl}/discussions`;
  // --- Fin URLs ---

  return (
    // Aumentado margen superior (mt-16) y padding vertical (py-12) para más "aire"
    <footer className="mt-16 py-12 border-t border-gray-200">
      {/* Contenedor principal con padding horizontal y más gap vertical en móvil (gap-y-8) */}
      {/* Nuevo layout: grid para mejor control de columnas en desktop */}
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 items-center gap-y-8 md:gap-x-8">
        {/* Columna 1: Botón/Enlace a inicio */}
        <div className="flex justify-center md:justify-start">
          <Link href="/" className="text-lg font-semibold text-blue-700 hover:text-blue-900 transition-colors">
            degux.cl
          </Link>
        </div>

        {/* Columna 2: Enlaces de Contacto/Comunidad */}
        <div className="flex flex-col items-center gap-y-5 md:flex-row md:items-start md:justify-center md:gap-x-10">
          {/* TODO: GitHub Discussions - habilitar cuando esté listo
          <div className="text-center md:text-left">
            <a
              href={githubDiscussionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub Discussions (Consultas públicas/técnicas)"
              className="text-sm font-medium text-gray-700 hover:text-black underline inline-flex items-center"
            >
               <span>Discusiones GitHub</span>
            </a>
            <p className="text-xs text-gray-500 mt-1">Preguntas técnicas y comunidad</p>
          </div>
          */}
        </div>

        {/* Columna 3: Enlaces Legales + version */}
        <div className="flex flex-col items-center md:items-end justify-center gap-y-1 text-center md:text-right">
          <Link href="/terms" className="text-sm text-gray-600 hover:text-gray-900">
            Términos
          </Link>
          <Link href="/privacy" className="text-sm text-gray-600 hover:text-gray-900">
            Privacidad
          </Link>
          <span className="text-xs text-gray-400 mt-1 font-mono tracking-tight">
            Next.js {nextVersion} &middot; React {reactVersion}
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
