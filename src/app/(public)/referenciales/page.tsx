import { ReferencialesExplorer } from '@/features/referenciales';

export const metadata = {
  title: 'Mapa',
  description:
    'Mapa público de transacciones inmobiliarias verificadas en Chile — datos abiertos con fuente CBR.',
};

export default function PublicMapaPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      <ReferencialesExplorer
        mode="public"
        header={
          <header className="mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Mapa</h1>
            <p className="mt-2 max-w-3xl text-gray-600">
              Transacciones inmobiliarias verificadas. La información proviene
              de fuentes oficiales y públicas como los Conservadores de Bienes
              Raíces (CBR). Los datos se procesan y actualizan periódicamente
              para entregar información confiable y vigente. Esta información
              es de carácter referencial y no constituye tasación ni asesoría
              profesional.
            </p>
          </header>
        }
        footer={
          <footer className="mt-4 border-t border-gray-200 pt-6 text-xs text-gray-500">
            Fuentes: Conservadores de Bienes Raíces (CBR) de Chile. Datos
            procesados y actualizados periódicamente. La información es
            referencial y no garantiza exactitud — consulte a un profesional
            para decisiones de inversión. Cumplimiento Ley 19.628 sobre
            protección de datos personales.
          </footer>
        }
      />
    </main>
  );
}
