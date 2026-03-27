// ─────────────────────────────────────────
// USUARIO
// Refleja la tabla Usuario de la BD
// ─────────────────────────────────────────
export interface Usuario {
  id_usuario:  number;
  nombre:      string;
  correo:      string;
  rol:         'agricultor' | 'administrador';
  zona_agricola?: string;
  token?:      string;
}

// ─────────────────────────────────────────
// CULTIVO
// Refleja la tabla Cultivo de la BD
// ─────────────────────────────────────────
export interface Cultivo {
  id_cultivo:     number;
  nombre_cultivo: string;
}

// ─────────────────────────────────────────
// ENFERMEDAD
// Refleja la tabla Enfermedad de la BD
// ─────────────────────────────────────────
export interface Enfermedad {
  id_enfermedad:     number;
  id_cultivo:        number;
  nombre_enfermedad: string;
  descripcion:       string;
  tratamiento:       string;
}

// ─────────────────────────────────────────
// DETECCION
// Refleja la tabla Deteccion de la BD
// Es el dato más importante de la app
// ─────────────────────────────────────────
export interface Deteccion {
  id_deteccion:     number;
  id_ubicacion:     number;
  id_cultivo:       number;
  id_modelo:        number;
  fecha_hora:       string;       // ISO 8601
  confianza_ia:     number;       // 0.0 a 1.0
  resultado_positivo: boolean;    // true = enfermedad detectada
  ruta_imagen_local: string;      // ruta en el celular
  sincronizado:     boolean;      // false = pendiente de subir
  // Datos relacionados (joins del backend)
  nombre_cultivo?:     string;
  nombre_enfermedad?:  string;
  tratamiento?:        string;
}

// ─────────────────────────────────────────
// UBICACION GPS
// Refleja la tabla Ubicacion_GPS de la BD
// ─────────────────────────────────────────
export interface UbicacionGPS {
  id_ubicacion:    number;
  direccion:       string;
  alias_terreno:   string;
  metros_cuadrados: number;
  latitud?:        number;
  longitud?:       number;
}

// ─────────────────────────────────────────
// RESULTADO IA
// Lo que regresa el modelo de IA
// tras analizar una imagen
// ─────────────────────────────────────────
export interface ResultadoIA {
  enfermedad:        string;
  confianza:         number;   // 0.0 a 1.0, ej: 0.92 = 92%
  resultado_positivo: boolean;
  tratamiento:       string;
  nivel_riesgo:      'critico' | 'alto' | 'sano';
}

// ─────────────────────────────────────────
// NAVEGACION
// Define las pantallas y sus parámetros
// ─────────────────────────────────────────
export type RootStackParams = {
  // Auth
  Welcome:   undefined;
  Login:     undefined;
  Registro:  undefined;

  // Main (tabs)
  Home:      undefined;
  Scanner:   undefined;
  Historial: undefined;
  Mapa:      undefined;
  Perfil:    undefined;

  // Scanner flow
  SeleccionCultivo: undefined;
  Camara:    { cultivoId: number; cultivoNombre: string };
  Resultado: { resultado: ResultadoIA; imagenUri: string; cultivoId: number };
};

// ─────────────────────────────────────────
// API RESPONSES
// Forma estándar de respuestas del backend
// ─────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data:    T;
  message: string;
}

export interface LoginResponse {
  access_token: string;
  token_type:   string;
  usuario:      Usuario;
}