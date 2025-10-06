import { useEffect } from 'react';

// 🔧 Hook personalizado que funciona sin SessionProvider en desarrollo
function useSessionSafe() {
  // En desarrollo, retornar mock sin llamar a useSession
  if (process.env.NODE_ENV === 'development') {
    return {
      data: null,
      status: 'unauthenticated' as const,
    };
  }

  // En producción, usar el hook real de NextAuth
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { useSession } = require('next-auth/react');
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useSession();
}

export function useAuth() {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const { data: session, status } = useSessionSafe();

  const isLoading = isDevelopment ? false : status === 'loading';
  const isAuthenticated = isDevelopment ? false : !!session?.user;
  const user = isDevelopment ? null : session?.user;
  const userRole = isDevelopment ? 'user' : (session?.user?.role || 'user');

  // Log para debugging en consola
  useEffect(() => {
    if (isDevelopment) {
      console.log('🔧 [useAuth] DEV MODE: Using mock auth data');
    } else if (status !== 'loading') {
      console.log('🔐 [USEAUTH-HOOK]', {
        status,
        isAuthenticated,
        userRole,
        userId: user?.id,
        userEmail: user?.email,
        timestamp: new Date().toISOString()
      });
    }
  }, [isDevelopment, status, isAuthenticated, userRole, user?.id, user?.email]);

  const isAdmin = userRole === 'admin' || userRole === 'superadmin';
  const isSuperAdmin = userRole === 'superadmin';
  const isUser = userRole === 'user';

  // Función para verificar si el usuario puede realizar operaciones CRUD
  const canCreateReferenciales = isAuthenticated; // Todos los usuarios autenticados pueden crear
  const canEditReferenciales = isAdmin;
  const canDeleteReferenciales = isAdmin;
  const canViewSensitiveData = isAdmin;

  return {
    // Estado de autenticación
    isLoading,
    isAuthenticated,
    user,
    userRole,

    // Verificaciones de rol
    isAdmin,
    isSuperAdmin,
    isUser,

    // Permisos específicos
    canCreateReferenciales,
    canEditReferenciales,
    canDeleteReferenciales,
    canViewSensitiveData,
  };
}