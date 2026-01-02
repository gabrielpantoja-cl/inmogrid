import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Conexiones | Dashboard',
  description: 'Gestiona tus conexiones y red profesional',
};

export default async function NetworkingPage() {
  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold">Mis Conexiones</h1>

      <div className="mt-8 rounded-md bg-white p-6 shadow-sm">
        <p className="text-gray-600">
          🤝 Aquí podrás gestionar tus conexiones profesionales.
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Próximamente:
        </p>
        <ul className="mt-2 text-sm text-gray-500 list-disc list-inside">
          <li>Solicitudes de conexión pendientes</li>
          <li>Lista de conexiones aceptadas</li>
          <li>Buscar nuevas personas para conectar</li>
          <li>Mensajería 1-a-1 (opcional)</li>
        </ul>
      </div>
    </div>
  );
}
