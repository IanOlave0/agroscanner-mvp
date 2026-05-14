/**
 * @file src/supabase/client.ts
 * @description Cliente singleton de Supabase para la app AgroScanner.
 *
 * Credenciales:
 * Se configuran en el archivo .env con el prefijo EXPO_PUBLIC_.
 * La SERVICE_ROLE key NUNCA debe incluirse en el cliente movil.
 *
 * @author AgroScanner Team
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_KEY as string;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    '[AgroScanner Supabase] Credenciales no configuradas. Crea un archivo .env con EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_KEY.',
  );
}

export const supabase = createClient(
  SUPABASE_URL || '',
  SUPABASE_ANON_KEY || '',
);
