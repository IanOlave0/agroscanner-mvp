/**
 * @file src/supabase/client.example.ts
 * @description Plantilla para configurar el cliente de Supabase.
 *
 * Instrucciones:
 * 1. Copia este archivo como client.ts
 * 2. Reemplaza los placeholders con tus credenciales reales
 * 3. Las credenciales se obtienen en Supabase Dashboard → Settings → API
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xxxxxxxxxxxx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
