import React from 'react';
import Link from 'next/link';

interface FooterProps {
  githubStarsSlot?: React.ReactNode;
}

const Footer: React.FC<FooterProps> = ({ githubStarsSlot }) => {
  const githubRepoUrl = process.env.NEXT_PUBLIC_GITHUB_REPO_URL || 'https://github.com/gabrielpantoja-cl/inmogrid';

  return (
    <footer className="mt-16 py-12 bg-gray-900 border-t-2 border-primary/50">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-y-8 md:gap-x-8">
        {/* Col 1: Brand + copyright */}
        <div className="flex flex-col items-center md:items-start gap-1">
          <Link href="/" className="text-lg font-semibold text-white hover:text-primary transition-colors">
            inmogrid.cl
          </Link>
          <span className="text-xs text-gray-400">
            &copy; 2011&ndash;{new Date().getFullYear()} inmogrid
          </span>
        </div>

        {/* Col 2: Open source */}
        <div className="flex flex-col items-center gap-2">
          <a
            href={githubRepoUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Ver el código fuente en GitHub"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-primary transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
            <span>Ver en GitHub</span>
            {githubStarsSlot}
          </a>
          <span className="text-xs text-gray-400">Proyecto open source &middot; MIT</span>
        </div>

        {/* Col 3: Producto */}
        <div className="flex flex-col items-center md:items-start gap-y-1">
          <span className="text-sm font-semibold text-gray-100 mb-1">Producto</span>
          <Link href="/sofia" className="text-sm text-gray-400 hover:text-primary transition-colors">
            Chat Sof&iacute;a
          </Link>
          <Link href="/referenciales" className="text-sm text-gray-400 hover:text-primary transition-colors">
            Referenciales
          </Link>
          <Link href="/referenciales#conservadores" className="text-sm text-gray-400 hover:text-primary transition-colors">
            Conservadores
          </Link>
        </div>

        {/* Col 4: Legal */}
        <div className="flex flex-col items-center md:items-start gap-y-1">
          <span className="text-sm font-semibold text-gray-100 mb-1">Legal</span>
          <Link href="/terms" className="text-sm text-gray-400 hover:text-primary transition-colors">
            T&eacute;rminos
          </Link>
          <Link href="/privacy" className="text-sm text-gray-400 hover:text-primary transition-colors">
            Privacidad
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
