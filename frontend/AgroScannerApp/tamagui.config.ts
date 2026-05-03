/**
 * @file tamagui.config.ts
 * @description Configuración central del sistema de diseño Tamagui para AgroScanner.
 * Extiende la configuración base v3 (@tamagui/config) con los tokens de diseño
 * específicos de la identidad visual CPI Jaguars (paleta de colores, espaciado,
 * radios y tamaños). Permite el uso de props temáticas (ej. color="$primary")
 * en todos los componentes de Tamagui.
 *
 * @author AgroScanner Team
 */

import { config } from '@tamagui/config/v3'
import { createTamagui } from 'tamagui'

// ── Configuración de tokens extendida ──────────────────────────────
// Se fusiona la config base de Tamagui con los tokens de AgroScanner
// para mantener compatibilidad con la escala de diseño existente.

const appConfig = {
  ...config,
  tokens: {
    ...config.tokens,

    // ── Colores ────────────────────────────────────────────────────
    // Paleta de marca: verde campo + acento dorado jaguar.
    // Accesibles vía color="$primary", bg="$acentoLight", etc.
    color: {
      ...config.tokens?.color,
      primary: '#1B6B2F',
      primaryLight: '#4CAF50',
      primaryDark: '#0D4A1E',
      primaryBg: '#F1F8F1',
      acento: '#F4A825',
      acentoLight: '#FFF3D6',
      acentoDark: '#C17D0A',
      bgPrimary: '#F5F7F2',
      bgCard: '#FFFFFF',
      bgGreen: '#EDF7EE',
      bgGreenDark: '#D4EDDA',
      danger: '#C62828',
      dangerLight: '#FFEBEE',
      warning: '#E65100',
      warningLight: '#FFF3E0',
      success: '#1B6B2F',
      successLight: '#EDF7EE',
      semaforoRojo: '#D32F2F',
      semaforoAmarillo: '#F9A825',
      semaforoVerde: '#2E7D32',
      textPrimary: '#1A1A1A',
      textSecondary: '#4A4A4A',
      textMuted: '#888888',
      textWhite: '#FFFFFF',
      border: '#E0E0E0',
      divider: '#F0F0F0',
      white: '#FFFFFF',
      black: '#000000',
    },

    // ── Espaciado ──────────────────────────────────────────────────
    // Escala de márgenes/paddings/gaps. Usada en props como px, py, gap, mt, etc.
    space: {
      ...config.tokens?.space,
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
      xxxl: 64,
    },

    // ── Tamaños genéricos ──────────────────────────────────────────
    // NOTA: Estos tokens se aplican a propiedades como width/height.
    // Para fontSize en <Text>, Tamagui v3 RC requiere configuración
    // tipográfica adicional (sección 'fonts'), por lo que en pantallas
    // se usan valores numéricos explícitos como fontSize={18}.
    size: {
      ...config.tokens?.size,
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 32,
    },

    // ── Radios de borde ────────────────────────────────────────────
    // Usados en borderRadius de stacks y botones.
    radius: {
      ...config.tokens?.radius,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 24,
      xxl: 32,
      full: 999,
    },
  },
}

// ── Creación de la instancia de configuración ──────────────────────
const tamaguiConfig = createTamagui(appConfig)

// ── Extensión de tipos para autocompletado ─────────────────────────
// Permite que TypeScript infiera los tokens personalizados en props de Tamagui.
type Conf = typeof tamaguiConfig
declare module 'tamagui' {
  interface TamaguiCustomConfig extends Conf {}
}

export default tamaguiConfig
