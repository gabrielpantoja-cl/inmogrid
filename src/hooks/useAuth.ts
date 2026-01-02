import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

export function useAuth() {
  // ✅ SIEMPRE llamar useSession (cumple con reglas de hooks)
  const { data: session, status } = useSession();

  // ✅ CORREGIDO: Usar NextAuth en desarrollo también
  const isLoading = status === 'loading';
  const isAuthenticated = !!session?.user;
  const user = session?.user;
  const userRole = session?.user?.role || 'user';

  // Log para debugging en consola
  useEffect(() => {
    if (status !== 'loading') {
      console.log('🔐 [USEAUTH-HOOK]', {
        status,
        isAuthenticated,
        userRole,
        userId: user?.id,
        userEmail: user?.email,
        timestamp: new Date().toISOString()
      });
    }
  }, [status, isAuthenticated, userRole, user?.id, user?.email]);

  const isAdmin = userRole === 'admin' || userRole === 'superadmin';
  const isSuperAdmin = userRole === 'superadmin';
  const isUser = userRole === 'user';

  // Función para verificar si el usuario puede realizar operaciones CRUD
  const canCreateContent = isAuthenticated; // Todos los usuarios autenticados pueden crear contenido
  const canEditContent = isAdmin; // Solo admins pueden editar contenido de otros
  const canDeleteContent = isAdmin; // Solo admins pueden eliminar contenido de otros
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

    // Permisos específicos (generic permissions for content management)
    canCreateContent,
    canEditContent,
    canDeleteContent,
    canViewSensitiveData,
  };
}