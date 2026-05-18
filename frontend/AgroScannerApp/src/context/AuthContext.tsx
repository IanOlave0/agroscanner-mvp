import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getDatabase } from '../database/initDB';
import { getUsuarioActivo, insertUsuario } from '../database/queries';
import { supabase } from '../supabase/client';
import { type Usuario } from '../types';
import { pushPendingData } from '../sync/SyncManager';

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

  const nombre = session.user.user_metadata?.nombre || session.user.email || 'Agricultor';
  const zona = session.user.user_metadata?.zona_agricola ?? null;
  const telefono = session.user.user_metadata?.telefono ?? null;

  if (!existing) {
    await insertUsuario(session.user.id, nombre, session.user.email || '', session.access_token, zona, telefono);
  } else {
    await db.runAsync(
      'UPDATE usuarios SET token = ?, zona_agricola = COALESCE(?, zona_agricola), telefono = COALESCE(?, telefono) WHERE id = ?',
      [session.access_token, zona, telefono, session.user.id],
    );
  }

  const { error: upsertError } = await supabase.from('usuarios').upsert({
    id: session.user.id,
    nombre,
    email: session.user.email || '',
    zona_agricola: zona ?? null,
    telefono: telefono ?? null,
  }, { onConflict: 'id' });

  if (upsertError) {
    console.error('[AuthContext] Error haciendo upsert de usuario a Supabase:', upsertError);
  }

  return await db.getFirstAsync(
    'SELECT * FROM usuarios WHERE id = ?',
    [session.user.id],
  ) as Usuario | null;
};

/**
 * Dispara la sincronizacion offline-first si el usuario acepto
 * compartir datos. La ejecucion es fire-and-forget para no
 * bloquear el flujo de autenticacion; SyncManager gestiona
 * su propia bandera de concurrencia (syncing).
 *
 * @param user  Usuario autenticado con campo compartir_datos
 */
const triggerSyncIfEligible = (user: Usuario) => {
  if (user.compartir_datos) {
    pushPendingData();
  }
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
          triggerSyncIfEligible(syncedUser);
          return;
        }
      }

      const localUser = await getUsuarioActivo() as Usuario | null;
      if (localUser) {
        setEstado('authenticated');
        setUsuario(localUser);
        triggerSyncIfEligible(localUser);
      } else {
        await ensureGuestRow();
        setEstado('guest');
        setUsuario(null);
      }
    } catch (error) {
      console.error('[AuthContext] Error refreshing auth:', error);
      const localUser = await getUsuarioActivo() as Usuario | null;
      if (localUser) {
        setEstado('authenticated');
        setUsuario(localUser);
        triggerSyncIfEligible(localUser);
        return;
      }
      await ensureGuestRow();
      setEstado('guest');
      setUsuario(null);
    }
  };

  const logout = async () => {
    const db = getDatabase();
    try {
      if (usuario) {
        await db.runAsync('UPDATE usuarios SET token = NULL WHERE id = ?', [usuario.id]);
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
          triggerSyncIfEligible(syncedUser);
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
