/**
 * Componente de testing para el sistema de SignOut
 * Solo para desarrollo - no incluir en producción
 */

"use client";

import React, { useState } from 'react';
import { createClient } from '@/shared/lib/supabase/client';

export default function SignOutTestComponent() {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV === 'production' || !isVisible) {
    return null;
  }

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()} — ${message}`]);
  };

  const handleTestSignOut = async (testType: string) => {
    setIsSigningOut(true);
    addLog(`Starting signOut test: ${testType}`);

    try {
      const supabase = createClient();

      switch (testType) {
        case 'normal': {
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
          addLog('Normal signOut succeeded');
          window.location.href = '/';
          break;
        }

        case 'no-redirect': {
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
          addLog('No-redirect signOut succeeded (session cleared)');
          break;
        }

        case 'custom-callback': {
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
          addLog('Custom-callback signOut succeeded');
          window.location.href = '/auth/login?test=true';
          break;
        }

        default: {
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
          addLog('Default signOut succeeded');
          window.location.href = '/';
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      addLog(`signOut FAILED: ${message}`);
      console.error('Test signOut failed:', error);
    } finally {
      setIsSigningOut(false);
    }
  };

  const clearLogs = () => setLogs([]);

  return (
    <div className="fixed bottom-4 right-4 bg-white border-2 border-yellow-400 rounded-lg p-4 shadow-lg max-w-md z-[90]">
      <div className="flex justify-between items-center text-sm font-bold text-yellow-800 mb-3">
        <span>SignOut Test Panel (DEV ONLY)</span>
        <button onClick={() => setIsVisible(false)} className="text-red-500 hover:text-red-700 font-bold">X</button>
      </div>

      <div className="space-y-2 mb-4">
        <button
          onClick={() => handleTestSignOut('normal')}
          disabled={isSigningOut}
          className="w-full px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 disabled:opacity-50"
        >
          {isSigningOut ? 'Testing...' : 'Test Normal SignOut'}
        </button>

        <button
          onClick={() => handleTestSignOut('no-redirect')}
          disabled={isSigningOut}
          className="w-full px-3 py-1 bg-orange-500 text-white rounded text-xs hover:bg-orange-600 disabled:opacity-50"
        >
          Test No Redirect
        </button>

        <button
          onClick={() => handleTestSignOut('custom-callback')}
          disabled={isSigningOut}
          className="w-full px-3 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600 disabled:opacity-50"
        >
          Test Custom Callback
        </button>
      </div>

      <div className="border-t pt-3 space-y-2">
        <button
          onClick={clearLogs}
          className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
        >
          Clear Logs ({logs.length})
        </button>
      </div>

      {logs.length > 0 && (
        <div className="mt-3 max-h-40 overflow-y-auto bg-gray-100 p-2 rounded text-xs">
          <div className="font-bold mb-2">Recent Logs:</div>
          {logs.slice(-10).map((log, index) => (
            <div key={index} className="mb-1 font-mono">
              {log}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
