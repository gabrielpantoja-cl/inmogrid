import Link from 'next/link';
import { getPublicDocs, categories } from '@/config/publicDocs';

export const metadata = {
  title: 'Centro de Documentación | degux.cl',
  description: 'Documentación completa del ecosistema digital colaborativo degux.cl',
};

export default function DocsPage() {
  const docs = getPublicDocs();

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-4">
              📚 Centro de Documentación
            </h1>
            <p className="text-xl text-white/90">
              Toda la información sobre el ecosistema digital colaborativo degux.cl
            </p>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center space-x-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-primary transition-colors">
            Inicio
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Documentación</span>
        </nav>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Categorías */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Categorías
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => {
                const categoryDocs = docs.filter(
                  (doc) => doc.category === category.id
                );

                if (categoryDocs.length === 0) return null;

                return (
                  <div
                    key={category.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-4xl">{category.icon}</span>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {category.label}
                      </h3>
                    </div>
                    <p className="text-gray-600 text-sm">
                      {categoryDocs.length} documento{categoryDocs.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lista de Documentos */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Todos los Documentos
            </h2>
            <div className="space-y-4">
              {docs.map((doc) => {
                const category = categories.find((cat) => cat.id === doc.category);

                return (
                  <Link
                    key={doc.id}
                    href={`/docs/${doc.id}`}
                    className="block bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-primary/50 transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-4xl flex-shrink-0 group-hover:scale-110 transition-transform">
                        {doc.icon || '📄'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors">
                            {doc.title}
                          </h3>
                          {category && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                              {category.icon} {category.label}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 mb-3">
                          {doc.description}
                        </p>
                        {doc.lastUpdated && (
                          <p className="text-sm text-gray-500">
                            Última actualización: {new Date(doc.lastUpdated).toLocaleDateString('es-CL')}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0 text-gray-400 group-hover:text-primary transition-colors">
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {docs.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  No hay documentos públicos disponibles en este momento.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-gray-600">
              ¿Tienes preguntas o sugerencias?{' '}
              <Link href="/" className="text-primary hover:text-primary/80 underline">
                Contáctanos
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}