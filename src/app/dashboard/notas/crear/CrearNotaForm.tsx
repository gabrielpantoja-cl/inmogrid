'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { lusitana } from '@/lib/styles/fonts';
import {
  ArrowLeftIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function CrearNotaForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    coverImageUrl: '',
    tags: '',
    published: false,
  });

  const handleSubmit = async (e: React.FormEvent, shouldPublish: boolean) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          excerpt: formData.excerpt || undefined,
          coverImageUrl: formData.coverImageUrl || undefined,
          tags: formData.tags
            ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
            : [],
          published: shouldPublish,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al crear la publicación');
      }

      // Redirigir a la lista de notas
      router.push('/dashboard/notas');
      router.refresh();
    } catch (error) {
      console.error('Error creating post:', error);
      alert(error instanceof Error ? error.message : 'Error al crear la publicación');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <main className="flex flex-col space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/notas"
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <h1 className={`${lusitana.className} text-2xl md:text-3xl text-gray-800`}>
              Nueva Publicación
            </h1>
            <p className="text-gray-600 mt-1">
              Comparte tu conocimiento con la comunidad
            </p>
          </div>
        </div>

        <button
          onClick={() => setPreview(!preview)}
          className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
        >
          <EyeIcon className="w-5 h-5 mr-2" />
          {preview ? 'Editar' : 'Vista Previa'}
        </button>
      </div>

      {/* Formulario */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {!preview ? (
          <form className="space-y-6">
            {/* Título */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Título *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Escribe un título atractivo..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Contenido */}
            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Contenido *
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                rows={15}
                placeholder="Escribe tu contenido aquí... Puedes usar Markdown para dar formato."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Puedes usar Markdown para dar formato (títulos con #, negritas con **texto**, etc.)
              </p>
            </div>

            {/* Extracto */}
            <div>
              <label
                htmlFor="excerpt"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Extracto (opcional)
              </label>
              <textarea
                id="excerpt"
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                rows={3}
                placeholder="Breve descripción de tu publicación (máx. 160 caracteres)"
                maxLength={160}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.excerpt.length}/160 caracteres
              </p>
            </div>

            {/* Imagen de portada */}
            <div>
              <label
                htmlFor="coverImageUrl"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                URL de Imagen de Portada (opcional)
              </label>
              <input
                type="url"
                id="coverImageUrl"
                name="coverImageUrl"
                value={formData.coverImageUrl}
                onChange={handleChange}
                placeholder="https://ejemplo.com/imagen.jpg"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Tags */}
            <div>
              <label
                htmlFor="tags"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Etiquetas (opcional)
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="tecnología, programación, web"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Separa las etiquetas con comas
              </p>
            </div>

            {/* Botones de acción */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <Link
                href="/dashboard/notas"
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </Link>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, false)}
                  disabled={loading || !formData.title || !formData.content}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Guardando...' : 'Guardar Borrador'}
                </button>

                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, true)}
                  disabled={loading || !formData.title || !formData.content}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Publicando...' : 'Publicar Ahora'}
                </button>
              </div>
            </div>
          </form>
        ) : (
          // Vista Previa
          <div className="prose prose-lg max-w-none">
            <h1>{formData.title || 'Título de tu publicación'}</h1>
            {formData.excerpt && (
              <p className="text-xl text-gray-600 italic">{formData.excerpt}</p>
            )}
            {formData.coverImageUrl && (
              <img
                src={formData.coverImageUrl}
                alt="Portada"
                className="w-full h-64 object-cover rounded-lg"
              />
            )}
            <div className="whitespace-pre-wrap">
              {formData.content || 'Tu contenido aparecerá aquí...'}
            </div>
            {formData.tags && (
              <div className="flex gap-2 mt-4">
                {formData.tags.split(',').map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                  >
                    #{tag.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
