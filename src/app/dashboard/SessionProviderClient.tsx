// app/dashboard/SessionProviderClient.tsx
'use client';

import { SessionProvider } from 'next-auth/react';
import React, { FC, ReactNode } from 'react';

interface SessionProviderProps {
  children: ReactNode;
}

const SessionProviderClient: FC<SessionProviderProps> = ({ children }) => {
  // 🔧 DESARROLLO: Sin SessionProvider para evitar llamadas a /api/auth/session
  if (process.env.NODE_ENV === 'development') {
    return <>{children}</>;
  }

  // ✅ PRODUCCIÓN: Con SessionProvider normal
  return <SessionProvider>{children}</SessionProvider>;
};

export default SessionProviderClient;