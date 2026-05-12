import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getDatabase } from '../database/initDB';
import { getUsuarioActivo } from '../database/queries';
import { type Usuario } from '../types';

type AuthState = 'loading' | 'guest' | 'authenticated';

interface AuthContextValue {
  estado: AuthState;
  usuarioId: string;
  usuario: Usuario | null;
  refreshAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const GUEST_USER_ID = 'guest';
const GUEST_PARCELA_ID = 'guest-parcela';

const ensureGuestRow = async () => {
  const db = getDatabase();
  await db.runAsync(
    'INSERT OR IGNORE INTO usuarios (id, nombre, email, token) VALUES (?, ?, null, null)',
    [GUEST_USER_ID, 'Invitado'],
  );
  await db.runAsync(
    'INSERT OR IGNORE INTO parcelas (id, alias, geometria, metros_cuadrados, area_timestamp, usuario_id) VALUES (?, ?, ?, ?, ?, ?)',
    [GUEST_PARCELA_ID, 'Sin parcela', '[]', 0, new Date().toISOString(), GUEST_USER_ID],
  );
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [estado, setEstado] = useState<AuthState>('loading');
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  const refreshAuth = async () => {
    try {
      const user = await getUsuarioActivo() as Usuario | null;

      if (user) {
        setEstado('authenticated');
        setUsuario(user);
      } else {
        await ensureGuestRow();
        setEstado('guest');
        setUsuario(null);
      }
    } catch (error) {
      console.error('[AuthContext] Error refreshing auth:', error);
      await ensureGuestRow();
      setEstado('guest');
      setUsuario(null);
    }
  };

  const logout = async () => {
    const db = getDatabase();
    try {
      if (usuario) {
        await db.runAsync('DELETE FROM detecciones WHERE usuario_id = ?', [usuario.id]);
        await db.runAsync('DELETE FROM parcelas WHERE usuario_id = ?', [usuario.id]);
        await db.runAsync('DELETE FROM usuarios WHERE id = ?', [usuario.id]);
      }
      await refreshAuth();
    } catch (error) {
      console.error('[AuthContext] Error logging out:', error);
    }
  };

  useEffect(() => {
    refreshAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const usuarioId = usuario?.id ?? GUEST_USER_ID;

  return (
    <AuthContext.Provider value={{ estado, usuarioId, usuario, refreshAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
