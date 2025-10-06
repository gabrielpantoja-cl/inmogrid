// app/dashboard/SessionProviderClient.tsx
'use client';

import { SessionProvider } from 'next-auth/react';
import React, { FC, ReactNode } from 'react';

interface SessionProviderProps {
  children: ReactNode;
}

const SessionProviderClient: FC<SessionProviderProps> = ({ children }) => {
  console.log('🔐 [SessionProviderClient] NODE_ENV:', process.env.NODE_ENV);

  // 🔧 DESARROLLO: Sin SessionProvider para evitar llamadas a /api/auth/session
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 [SessionProviderClient] DEV MODE: Skipping SessionProvider');
    return <>{children}</>;
  }

  // ✅ PRODUCCIÓN: Con SessionProvider normal
  console.log('✅ [SessionProviderClient] PROD MODE: Using SessionProvider');
  return <SessionProvider>{children}</SessionProvider>;
};

export default SessionProviderClient;