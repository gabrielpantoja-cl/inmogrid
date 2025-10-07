/**
 * 🧪 Test de Acceso al Dashboard - degux.cl
 *
 * Este test verifica que el dashboard sea accesible para usuarios anónimos (de incógnito),
 * cumpliendo con el requisito de que el dashboard sea público.
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Importar los componentes de las páginas que vamos a probar
import HomePage from '@/app/page';
import DashboardContent from '@/app/dashboard/(overview)/DashboardContent';

// Mockear los hooks de Next.js y NextAuth
jest.mock('next-auth/react');
jest.mock('next/navigation');

// Mockear el componente UfDisplay que usa Suspense y puede causar problemas en tests
jest.mock('@/components/ui/dashboard/UfDisplay', () => {
  return function MockUfDisplay() {
    return <div data-testid="uf-display-mock">UF Display Mock</div>;
  };
});

// Mockear el componente TopCommunesChart que es dinámico y usa ssr: false
jest.mock('@/components/ui/dashboard/TopComunasChart', () => {
  return function MockTopCommunesChart() {
    return <div data-testid="top-communes-chart-mock">Top Communes Chart Mock</div>;
  };
});

// Mockear el componente LatestReferenciales que usa Suspense
jest.mock('@/components/ui/dashboard/latest-referenciales', () => {
  return function MockLatestReferenciales() {
    return <div data-testid="latest-referenciales-mock">Latest Referenciales Mock</div>;
  };
});

// Tipar los mocks para tener autocompletado y seguridad de tipos
const useSessionMock = useSession as jest.Mock;
const useRouterMock = useRouter as jest.Mock;

describe('🔑 Acceso al Dashboard como Anónimo', () => {

  beforeEach(() => {
    // Configuración del mock de useRouter para todas las pruebas en este describe
    useRouterMock.mockReturnValue({
      push: jest.fn(),
      replace: jest.fn(),
      refresh: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
    });
  });

  test('1. La página de inicio muestra un enlace para "Entrar como incógnito" para usuarios no autenticados', () => {
    // Simular un usuario no autenticado
    useSessionMock.mockReturnValue({ data: null, status: 'unauthenticated' });

    render(<HomePage />);

    // Buscar el enlace por su texto
    const incognitoLink = screen.getByRole('link', { name: /entrar como incógnito/i });

    // Verificar que el enlace existe
    expect(incognitoLink).toBeInTheDocument();

    // Verificar que el enlace apunta al dashboard
    expect(incognitoLink).toHaveAttribute('href', '/dashboard');
  });

  test('2. El contenido del dashboard se renderiza correctamente para un usuario anónimo', async () => {
    // Simular un usuario no autenticado (la sesión se pasa como prop, no se usa useSession aquí)
    render(<DashboardContent session={null} latestReferenciales={[]} totalReferenciales={0} />);

    // Buscar el encabezado principal del dashboard
    const dashboardHeading = await screen.findByRole('heading', {
      name: /inicio/i,
      level: 1,
    });

    // Verificar que el encabezado está presente
    expect(dashboardHeading).toBeInTheDocument();

    // Verificar que el saludo personalizado NO está presente
    const welcomeMessage = screen.queryByText(/¡Hola!/i);
    expect(welcomeMessage).not.toBeInTheDocument();

    // Verificar que los mocks de los componentes con Suspense/dynamic se renderizan
    expect(screen.getByTestId('uf-display-mock')).toBeInTheDocument();
    expect(screen.getByTestId('top-communes-chart-mock')).toBeInTheDocument();
    expect(screen.getByTestId('latest-referenciales-mock')).toBeInTheDocument();
  });

  test('3. El contenido del dashboard muestra el nombre del usuario autenticado', async () => {
    // Simular un usuario autenticado
    const mockSession = {
      user: {
        name: 'Usuario de Prueba',
        email: 'test@example.com',
        id: '123',
        role: 'user',
      },
      expires: '1',
    };
    render(<DashboardContent session={mockSession as any} latestReferenciales={[]} totalReferenciales={0} />);

    // Verificar que el saludo personalizado SÍ está presente
    const welcomeMessageSpan = await screen.findByText('Usuario de Prueba', { selector: 'span' });
    expect(welcomeMessageSpan).toBeInTheDocument();
    expect(welcomeMessageSpan).toHaveTextContent('Usuario de Prueba');

    // Verificar que los mocks de los componentes con Suspense/dynamic se renderizan
    expect(screen.getByTestId('uf-display-mock')).toBeInTheDocument();
    expect(screen.getByTestId('top-communes-chart-mock')).toBeInTheDocument();
    expect(screen.getByTestId('latest-referenciales-mock')).toBeInTheDocument();
  });
});