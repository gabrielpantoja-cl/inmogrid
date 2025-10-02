import { notFound } from 'next/navigation';
import Link from 'next/link';
import { promises as fs } from 'fs';
import path from 'path';
import { getDocById, getPublicDocs, categories } from '@/config/publicDocs';
import DocViewer from '@/components/ui/documentation/DocViewer';

interface DocPageProps {
  params: Promise<{
    docId: string;
  }>;
}

export async function generateStaticParams() {
  const docs = getPublicDocs();
  return docs.map((doc) => ({
    docId: doc.id,
  }));
}

export async function generateMetadata({ params }: DocPageProps) {
  const resolvedParams = await params;
  const doc = getDocById(resolvedParams.docId);

  if (!doc || !doc.isPublic) {
    return {
      title: 'Documento no encontrado | degux.cl',
    };
  }

  return {
    title: `${doc.title} | degux.cl`,
    description: doc.description,
  };
}

export default async function DocPage({ params }: DocPageProps) {
  const resolvedParams = await params;
  const doc = getDocById(resolvedParams.docId);

  // Si el documento no existe o no es público, mostrar 404
  if (!doc || !doc.isPublic) {
    notFound();
  }

  // Leer el contenido del archivo Markdown
  const docsDirectory = path.join(process.cwd(), 'docs');
  const filePath = path.join(docsDirectory, doc.filePath);

  let content: string;
  try {
    content = await fs.readFile(filePath, 'utf-8');
  } catch (error) {
    console.error('Error leyendo archivo:', error);
    notFound();
  }

  const category = categories.find((cat) => cat.id === doc.category);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header con breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
            <Link href="/" className="hover:text-primary transition-colors">
              Inicio
            </Link>
            <span>/</span>
            <Link href="/docs" className="hover:text-primary transition-colors">
              Documentación
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium truncate max-w-xs">
              {doc.title}
            </span>
          </nav>

          <div className="flex items-center gap-4">
            <span className="text-5xl">{doc.icon || '📄'}</span>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  {doc.title}
                </h1>
                {category && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
                    {category.icon} {category.label}
                  </span>
                )}
              </div>
              <p className="text-gray-600 text-lg">
                {doc.description}
              </p>
              {doc.lastUpdated && (
                <p className="text-sm text-gray-500 mt-2">
                  Última actualización: {new Date(doc.lastUpdated).toLocaleDateString('es-CL', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contenido del documento */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <DocViewer content={content} />

          {/* Navegación inferior */}
          <div className="mt-12 flex justify-between items-center border-t border-gray-200 pt-8">
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Volver a Documentación
            </Link>

            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>¿Fue útil este documento?</span>
              <div className="flex gap-2">
                <button className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-50 transition-colors">
                  👍 Sí
                </button>
                <button className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-50 transition-colors">
                  👎 No
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 text-center md:text-left">
              Base de datos colaborativa y open-source para tasaciones inmobiliarias en Chile
            </p>
            <Link
              href="/"
              className="text-primary hover:text-primary/80 underline"
            >
              Ir al inicio
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}