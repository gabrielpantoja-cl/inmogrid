import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Comunidad | inmogrid.cl',
  description: 'Conecta con la comunidad de inmogrid.cl',
};

export default function ComunidadPage() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Comunidad</h1>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-gray-600">
          El espacio de comunidad esta en desarrollo. Mientras tanto, participa en nuestras discusiones:
        </p>

        <div className="mt-6 space-y-4">
          <a
            href="https://github.com/inmogrid/inmogrid/discussions"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <svg className="w-8 h-8 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <div>
              <p className="font-medium text-gray-900">Discusiones en GitHub</p>
              <p className="text-sm text-gray-500">Preguntas, ideas y conversaciones con la comunidad</p>
            </div>
          </a>
        </div>

        <div className="mt-8">
          <p className="text-sm font-medium text-gray-700 mb-2">Proximamente:</p>
          <ul className="text-sm text-gray-500 list-disc list-inside space-y-1">
            <li>Foro de discusiones integrado</li>
            <li>Mensajeria entre usuarios</li>
            <li>Grupos tematicos</li>
            <li>Eventos y meetups</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
