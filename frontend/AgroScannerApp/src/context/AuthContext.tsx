import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getDatabase } from '../database/initDB';
import { getUsuarioActivo, insertUsuario } from '../database/queries';
import { supabase } from '../supabase/client';
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

const syncSupabaseSessionToLocal = async () => {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user) return null;

  const db = getDatabase();
  const existing = await db.getFirstAsync(
    'SELECT * FROM usuarios WHERE id = ?',
    [session.user.id],
  ) as Usuario | null;

  if (!existing) {
    const nombre = session.user.user_metadata?.nombre || session.user.email || 'Agricultor';
    const token = session.access_token;
    await insertUsuario(session.user.id, nombre, session.user.email || '', token);
  } else {
    await db.runAsync(
      'UPDATE usuarios SET token = ? WHERE id = ?',
      [session.access_token, session.user.id],
    );
  }

  return await db.getFirstAsync(
    'SELECT * FROM usuarios WHERE id = ?',
    [session.user.id],
  ) as Usuario | null;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [estado, setEstado] = useState<AuthState>('loading');
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  const refreshAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const syncedUser = await syncSupabaseSessionToLocal();
        if (syncedUser) {
          setEstado('authenticated');
          setUsuario(syncedUser);
          return;
        }
      }

      const localUser = await getUsuarioActivo() as Usuario | null;
      if (localUser) {
        setEstado('authenticated');
        setUsuario(localUser);
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
      await supabase.auth.signOut();
      await ensureGuestRow();
      setEstado('guest');
      setUsuario(null);
    } catch (error) {
      console.error('[AuthContext] Error logging out:', error);
    }
  };

  useEffect(() => {
    refreshAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const syncedUser = await syncSupabaseSessionToLocal();
        if (syncedUser) {
          setEstado('authenticated');
          setUsuario(syncedUser);
        }
      } else if (event === 'SIGNED_OUT') {
        await ensureGuestRow();
        setEstado('guest');
        setUsuario(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
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
