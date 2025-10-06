import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

export function useAuth() {
  // ✅ SIEMPRE llamar a useSession (regla de hooks de React)
  const { data: session, status } = useSession();

  // 🔧 En desarrollo, ignorar la sesión real y usar valores mock
  const isDevelopment = process.env.NODE_ENV === 'development';

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