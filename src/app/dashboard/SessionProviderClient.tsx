// app/dashboard/SessionProviderClient.tsx
'use client';

import { SessionProvider } from 'next-auth/react';
import React, { FC, ReactNode } from 'react';

interface SessionProviderProps {
  children: ReactNode;
}

const SessionProviderClient: FC<SessionProviderProps> = ({ children }) => {
  console.log('🔐 [SessionProviderClient] Rendering with SessionProvider');

  // ✅ SIEMPRE usar SessionProvider (requerido por useSession hook)
  // En desarrollo, el middleware bloqueará las llamadas a /api/auth/session
  // y useAuth retornará valores mock
  return <SessionProvider>{children}</SessionProvider>;
};

export default SessionProviderClient;