/**
 * @file src/supabase/client.ts
 * @description Cliente singleton de Supabase para la app AgroScanner.
 *
 * Credenciales:
 * Se obtienen en Supabase Dashboard → Settings → API
 * - Project URL: URL unica del proyecto
 * - anon/public key: clave publica segura para el cliente movil
 *
 * La SERVICE_ROLE key NUNCA debe incluirse en el cliente movil.
 *
 * @author AgroScanner Team
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xxxxxxxxxxxx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
