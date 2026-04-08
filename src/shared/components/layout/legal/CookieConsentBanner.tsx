'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Settings, Shield } from 'lucide-react';
import { Button } from '@/shared/components/ui/primitives/button';
import { Card } from '@/shared/components/ui/primitives/card';
import { useCookieConsent } from './CookieConsentProvider';
import { CookieCategoriesList } from './cookies/CookieCategoriesList';
import { CookieModalShell } from './cookies/CookieModalShell';
import { useCookiePreferencesState } from './cookies/useCookiePreferencesState';
import { ALL_ACCEPTED, DEFAULT_PREFERENCES } from './cookies/categories';

/**
 * Banner de primera visita — pide consentimiento con 3 atajos
 * (Aceptar todas / Solo esenciales / Configurar).
 * El botón Configurar abre un modal con el detalle por categoría.
 */
export default function CookieConsentBanner() {
  const { hasConsent, updatePreferences } = useCookieConsent();
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const { preferences, toggle } = useCookiePreferencesState(DEFAULT_PREFERENCES);

  useEffect(() => {
    setShowBanner(!hasConsent);
  }, [hasConsent]);

  const handleAcceptAll = () => {
    updatePreferences(ALL_ACCEPTED);
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    updatePreferences(DEFAULT_PREFERENCES);
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    updatePreferences(preferences);
    setShowBanner(false);
    setShowPreferences(false);
  };

  if (!showBanner) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 bg-white border-t border-gray-200 shadow-lg">
        <Card className="max-w-6xl mx-auto p-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">degux.cl usa cookies</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Utilizamos cookies esenciales para el funcionamiento del sitio y cookies
              opcionales para análisis y mejoras. Puedes configurar tus preferencias o
              aceptar todas las cookies.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleAcceptAll}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6"
              >
                Aceptar todas
              </Button>
              <Button onClick={handleRejectAll} variant="outline" className="px-6">
                Solo esenciales
              </Button>
              <Button
                onClick={() => setShowPreferences(true)}
                variant="outline"
                className="px-6"
              >
                <Settings className="h-4 w-4 mr-2" />
                Configurar
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Al usar este sitio, acepta nuestras{' '}
              <Link href="/privacy" className="text-blue-600 hover:underline">
                Políticas de Privacidad
              </Link>{' '}
              conforme a la Ley 21.719 de Chile.
            </p>
          </div>
        </Card>
      </div>

      {showPreferences && (
        <CookieModalShell
          title="Configuración de Cookies"
          subtitle="Controla qué tipos de cookies permites."
          onClose={() => setShowPreferences(false)}
          footer={
            <>
              <div className="flex gap-3">
                <Button
                  onClick={handleSavePreferences}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 font-semibold"
                >
                  Guardar Preferencias
                </Button>
                <Button
                  onClick={() => setShowPreferences(false)}
                  variant="outline"
                  className="px-8 py-3 border-gray-300 hover:bg-gray-100"
                >
                  Cancelar
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-3 text-center">
                Puede cambiar estas preferencias en cualquier momento desde el footer.
              </p>
            </>
          }
        >
          <CookieCategoriesList preferences={preferences} onToggle={toggle} />
        </CookieModalShell>
      )}
    </>
  );
}
