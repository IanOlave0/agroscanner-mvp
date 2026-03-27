// ─────────────────────────────────────────
// COLORES — Diseñados para uso en campo
// Alto contraste, legibles bajo sol directo
// ─────────────────────────────────────────
export const COLORS = {
  // Fondos — claros para máxima legibilidad
  bgPrimary:    '#F5F7F2',  // fondo principal, blanco hueso
  bgCard:       '#FFFFFF',  // tarjetas y modales
  bgGreen:      '#E8F5E9',  // fondo secciones verdes suaves

  // Marca
  primary:      '#2E7D32',  // verde campo oscuro — botones principales
  primaryLight: '#66BB6A',  // verde lima — botones secundarios
  primaryDark:  '#1B5E20',  // verde muy oscuro — headers

  // Alertas — muy visibles bajo sol
  danger:       '#C62828',  // rojo fuerte — enfermedad crítica
  dangerLight:  '#FFEBEE',  // fondo rojo suave
  warning:      '#E65100',  // naranja fuerte — riesgo medio
  warningLight: '#FFF3E0',  // fondo naranja suave
  success:      '#2E7D32',  // verde — planta sana
  successLight: '#E8F5E9',  // fondo verde suave

  // Texto — máximo contraste
  textPrimary:   '#1A1A1A', // negro suave — títulos
  textSecondary: '#424242', // gris oscuro — subtítulos
  textMuted:     '#757575', // gris medio — textos pequeños
  textWhite:     '#FFFFFF', // blanco — texto sobre fondos oscuros

  // Bordes y separadores
  border:     '#E0E0E0',
  divider:    '#F5F5F5',

  // Semáforo de diagnóstico
  semaforoRojo:     '#C62828',
  semaforoAmarillo: '#F9A825',
  semaforoVerde:    '#2E7D32',

  // Extras
  white:       '#FFFFFF',
  black:       '#000000',
  transparent: 'transparent',
};

// ─────────────────────────────────────────
// TIPOGRAFÍA — Tamaños grandes para campo
// ─────────────────────────────────────────
export const FONT_SIZE = {
  xs:   12,  // notas pequeñas
  sm:   14,  // texto secundario
  md:   16,  // texto normal
  lg:   18,  // subtítulos
  xl:   22,  // títulos de sección
  xxl:  28,  // títulos de pantalla
  xxxl: 36,  // números grandes (% confianza)
};

export const FONT_WEIGHT = {
  regular:   '400' as const,
  medium:    '500' as const,
  semibold:  '600' as const,
  bold:      '700' as const,
  extrabold: '800' as const,
};

// ─────────────────────────────────────────
// ESPACIADO — Botones grandes para campo
// ─────────────────────────────────────────
export const SPACING = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
};

export const RADIUS = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  full: 999,
};

// ─────────────────────────────────────────
// CULTIVOS — Config central de cada planta
// ─────────────────────────────────────────
export const CULTIVOS = {
  limon: {
    id:            1,
    nombre:        'Limón Mexicano',
    emoji:         '🍋',
    enfermedad:    'HLB (Dragón Amarillo)',
    color:         '#F9A825',
    colorFondo:    '#FFFDE7',
    descripcion:   'Detecta Huanglongbing en hojas de limón',
  },
  papaya: {
    id:            2,
    nombre:        'Papaya',
    emoji:         '🍈',
    enfermedad:    'Araña Roja',
    color:         '#E65100',
    colorFondo:    '#FFF3E0',
    descripcion:   'Detecta Tetranychus urticae en hojas de papaya',
  },
  platano: {
    id:            3,
    nombre:        'Plátano',
    emoji:         '🍌',
    enfermedad:    'Sigatoka Negra',
    color:         '#558B2F',
    colorFondo:    '#F1F8E9',
    descripcion:   'Detecta Mycosphaerella fijiensis en hojas de plátano',
  },
};

// ─────────────────────────────────────────
// API — URL del backend FastAPI
// ─────────────────────────────────────────
export const API_URL = 'http://10.0.2.2:8000';

// ─────────────────────────────────────────
// STORAGE KEYS — Nombres para AsyncStorage
// ─────────────────────────────────────────
export const STORAGE = {
  TOKEN:    'agroscanner_token',
  USUARIO:  'agroscanner_usuario',
  OFFLINE:  'agroscanner_offline_queue',
};