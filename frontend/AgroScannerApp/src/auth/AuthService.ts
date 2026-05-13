/**
 * @file src/auth/AuthService.ts
 * @description Modulo de autenticacion con Supabase Auth.
 * Responsable de las operaciones de registro, inicio de sesion,
 * cierre de sesion y sincronizacion del perfil con SQLite local.
 *
 * Flujo de datos:
 * - signUp/signIn → Supabase Auth + guardar perfil en Postgres + SQLite local
 * - signOut → limpiar SQLite local + Supabase Auth
 * - getCurrentUser → leer sesion activa desde Supabase Auth + SQLite
 *
 * @author AgroScanner Team
 */

import { supabase } from '../supabase/client';
import { insertUsuario } from '../database/queries';
import { getDatabase } from '../database/initDB';
import { Usuario } from '../types';

export const AuthService = {
  /**
   * Registra un nuevo agricultor en Supabase Auth y guarda su perfil
   * tanto en Postgres (usuarios) como en SQLite local.
   *
   * Flujo:
   * 1. supabase.auth.signUp() con user_metadata (nombre, telefono, zona)
   * 2. INSERT en tabla usuarios de Supabase (Postgres)
   * 3. INSERT en SQLite local via insertUsuario()
   *
   * @param email         Correo electronico del agricultor
   * @param password      Contrasena (minimo 6 caracteres)
   * @param nombre        Nombre completo del agricultor
   * @param telefono      Numero de telefono (opcional)
   * @param zonaAgricola  Zona agricola detectada por GPS (opcional)
   * @returns Datos de la sesion de Supabase Auth
   * @throws Error si Supabase rechaza el registro
   */
  async signUp(
    email: string,
    password: string,
    nombre: string,
    telefono?: string,
    zonaAgricola?: string,
  ) {
    console.log('[AgroScanner Auth] Iniciando registro:', email);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre,
          telefono,
          zona_agricola: zonaAgricola,
        },
      },
    });

    if (error) throw error;
    if (!data.user) throw new Error('No se pudo crear la cuenta');

    const token = data.session?.access_token || '';

    await supabase.from('usuarios').insert({
      id: data.user.id,
      nombre,
      email,
      zona_agricola: zonaAgricola || null,
      telefono: telefono || null,
    });

    await insertUsuario(
      data.user.id,
      nombre,
      email,
      token,
      zonaAgricola ?? null,
      telefono ?? null,
    );

    console.log('[AgroScanner Auth] Registro exitoso:', data.user.id);
    return data;
  },

  /**
   * Inicia sesion con correo y contrasena en Supabase Auth.
   * Guarda o actualiza el perfil del usuario en SQLite local.
   *
   * Flujo:
   * 1. supabase.auth.signInWithPassword()
   * 2. Extraer nombre, zona y telefono de user_metadata
   * 3. INSERT OR REPLACE en SQLite local via insertUsuario()
   *
   * @param email     Correo del agricultor
   * @param password  Contrasena
   * @returns Datos de la sesion de Supabase Auth
   * @throws Error si las credenciales son invalidas
   */
  async signIn(email: string, password: string) {
    console.log('[AgroScanner Auth] Iniciando sesion:', email);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error('Credenciales invalidas');

    const token = data.session?.access_token || '';
    const nombre = data.user.user_metadata?.nombre || data.user.email || 'Agricultor';

    await insertUsuario(
      data.user.id,
      nombre,
      email,
      token,
      data.user.user_metadata?.zona_agricola ?? null,
      data.user.user_metadata?.telefono ?? null,
    );

    console.log('[AgroScanner Auth] Sesion iniciada:', data.user.id);
    return data;
  },

  /**
   * Cierra la sesion del usuario.
   * Elimina datos locales del usuario autenticado y notifica a Supabase Auth.
   *
   * Flujo:
   * 1. DELETE detecciones, parcelas y usuario con token != NULL en SQLite local
   * 2. supabase.auth.signOut() — invalida el token en la nube
   *
   * Los datos en Postgres NO se eliminan (se recuperan en el proximo login
   * via Sync Manager).
   */
  async signOut() {
    console.log('[AgroScanner Auth] Cerrando sesion...');

    const db = getDatabase();
    try {
      await db.runAsync('DELETE FROM detecciones WHERE usuario_id IS NOT NULL');
      await db.runAsync('DELETE FROM parcelas WHERE usuario_id IS NOT NULL');
      await db.runAsync('DELETE FROM usuarios WHERE token IS NOT NULL');
      console.log('[AgroScanner Auth] Datos locales del usuario eliminados');
    } catch (error) {
      console.error('[AgroScanner Auth] Error limpiando BD local:', error);
    }

    await supabase.auth.signOut();
    console.log('[AgroScanner Auth] Sesion cerrada');
  },

  /**
   * Obtiene el perfil del usuario actual desde SQLite local
   * usando el ID de la sesion activa de Supabase Auth.
   *
   * @returns Objeto Usuario o null si no hay sesion activa
   */
  async getCurrentUser(): Promise<Usuario | null> {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) return null;

    const db = getDatabase();
    const usuario = await db.getFirstAsync(
      'SELECT * FROM usuarios WHERE id = ?',
      [session.user.id],
    ) as Usuario | null;

    return usuario;
  },

  /**
   * Guarda una sesion en SQLite local sin verificar contra Supabase.
   * Util para persistir sesiones offline (demo, desarrollo).
   *
   * @param userId  UUID del usuario
   * @param token   JWT de la sesion
   * @param nombre  Nombre del agricultor
   * @param email   Correo electronico
   */
  async saveSessionToLocal(userId: string, token: string, nombre: string, email: string) {
    await insertUsuario(userId, nombre, email, token);
    console.log('[AgroScanner Auth] Sesion guardada localmente:', userId);
  },

  /**
   * Guarda el perfil completo del usuario en SQLite local.
   * Incluye campos opcionales de zona agricola y telefono.
   *
   * @param userId        UUID del usuario
   * @param nombre        Nombre completo
   * @param email         Correo electronico
   * @param token         JWT de sesion
   * @param zonaAgricola  Zona agricola (opcional)
   * @param telefono      Telefono (opcional)
   */
  async saveUserToLocal(
    userId: string,
    nombre: string,
    email: string,
    token: string,
    zonaAgricola?: string | null,
    telefono?: string | null,
  ) {
    await insertUsuario(userId, nombre, email, token, zonaAgricola ?? null, telefono ?? null);
    console.log('[AgroScanner Auth] Perfil guardado localmente:', userId);
  },
};
