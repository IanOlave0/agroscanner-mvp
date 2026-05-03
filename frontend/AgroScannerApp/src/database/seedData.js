/**
 * Módulo de datos iniciales (Seed Data)
 * 
 * Encargado de precargar la base de datos con:
 * - Catálogo de cultivos disponibles
 * - Catálogo de enfermedades conocidas
 * - Tratamientos específicos por cultivo-enfermedad
 * 
 * Se ejecuta una sola vez al iniciar la app por primera vez
 * Utiliza INSERT OR IGNORE para evitar duplicados
 */
import { getDatabase } from "./initDB.js";

/**
 * Cultivos precargados en la base de datos
 * Campo: tratamiento_sugerido = Recomendación cuando el cultivo está sano (preventivo)
 */
const CULTIVOS_INICIALES = [
  { nombre: "Limón", tratamiento_sugerido: "Aplicar fertilizante rico en nitrógeno cada 30 días" },
  { nombre: "Papaya", tratamiento_sugerido: "Riego constante y fertilizante orgánico mensual" },
  { nombre: "Plátano", tratamiento_sugerido: "Aplicar mulch orgánico para retener humedad" },
];

/**
 * Enfermedades precargadas en la base de datos
 * Cada enfermedad tiene descripción técnica de la causa
 */
const ENFERMEDADES_INICIALES = [
  { nombre: "HLB", descripcion: "Enfermedad del Huanglongbing causada por bacteria Candidatus Liberibacter. Afecta el transporte de nutrientes en los vasos del floema." },
  { nombre: "Shigatoka Negra", descripcion: "Enfermedad fúngica causada por Mycosphaerella fijiensis. Produce manchas negras en las hojas." },
  { nombre: "Araña Roja", descripcion: "Plaga causada por Tetranychus urticae. Se alimentan de savia de las hojas causando decoloración y manchas amarillas." },
];

/**
 * Tratamientos específicos por combinación cultivo-enfermedad
 * Tabla relación Many-a-Muchos: cultivo_enfermedad
 * Se consultan al mostrar resultados de detección
 */
const CULTIVO_ENFERMEDAD_TRATAMIENTOS = [
  { cultivo_nombre: "Limón", enfermedad_nombre: "HLB", tratamiento: "Aplicar aceite de neem + cobre cada 15 días. Remover hojas afectadas. Control de pulgón vector." },
  { cultivo_nombre: "Plátano", enfermedad_nombre: "Shigatoka Negra", tratamiento: "Aplicar fungicida a base de cobre cada 7 días. Mejorar circulación de aire. Evitar exceso de humedad." },
  { cultivo_nombre: "Papaya", enfermedad_nombre: "Araña Roja", tratamiento: "Aplicar acaricida natural (jabón potasio) cada semana. Introducir depredadores naturales como phytoseiulus." },
];

/**
 * Función principal: precarga todos los datos iniciales
 * Se llama desde el componente de inicio de la app
 * 
 * FLUJO:
 * 1. Inserta cultivos (si no existen)
 * 2. Inserta enfermedades (si no existen)
 * 3. Inserta tratamientos cultivo-enfermedad (si no existen)
 * 
 * @throws {Error} Si falla la inserción de datos
 */
export async function seedDatabase() {
  const db = getDatabase();

  try {
    for (const cultivo of CULTIVOS_INICIALES) {
      await db.runAsync(
        "INSERT OR IGNORE INTO cultivos (nombre, tratamiento_sugerido) VALUES (?, ?)",
        [cultivo.nombre, cultivo.tratamiento_sugerido]
      );
    }
    console.log("[AgroScanner DB] Cultivos inicializados");

    for (const enfermedad of ENFERMEDADES_INICIALES) {
      await db.runAsync(
        "INSERT OR IGNORE INTO enfermedades (nombre, descripcion) VALUES (?, ?)",
        [enfermedad.nombre, enfermedad.descripcion]
      );
    }
    console.log("[AgroScanner DB] Enfermedades inicializadas");

    for (const ce of CULTIVO_ENFERMEDAD_TRATAMIENTOS) {
      const cultivo = await db.getFirstAsync("SELECT id FROM cultivos WHERE nombre = ?", [ce.cultivo_nombre]);
      const enfermedad = await db.getFirstAsync("SELECT id FROM enfermedades WHERE nombre = ?", [ce.enfermedad_nombre]);

      if (cultivo && enfermedad) {
        await db.runAsync(
          "INSERT OR IGNORE INTO cultivo_enfermedad (cultivo_id, enfermedad_id, tratamiento) VALUES (?, ?, ?)",
          [cultivo.id, enfermedad.id, ce.tratamiento]
        );
      }
    }
    console.log("[AgroScanner DB] Tratamientos cultivo-enfermedad inicializados");

    console.log("[AgroScanner DB] Datos iniciales cargados correctamente");
  } catch (error) {
    console.error("[AgroScanner DB] Error al cargar datos iniciales:", error);
    throw error;
  }
}

export default seedDatabase;

/**
 * Usuario mock para testing
 * Token JWT válido hasta el año 2099 (exp: 4102444800)
 * Se inserta manualmente al tocar "Iniciar como Demo"
 */
const MOCK_USER = {
  id: "mock-user-00000000-0000-0000-0000-000000000001",
  nombre: "Carlos Ramírez",
  email: "demo@agroscanner.com",
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtb2NrLXVzZXItMDAwMDAwMDAtMDAwMC0wMDAwLTAwMDAtMDAwMDAwMDAwMDAxIiwiZW1haWwiOiJkZW1vQGFncm9zY2FubmVyLmNvbSIsInJvbCI6ImFncmljdWx0b3IiLCJleHAiOjQxMDI0NDQ4MDB9.mockSignature",
  zona_agricola: "Colima, México",
};

/**
 * Parcelas mock para testing
 * Polígonos con coordenadas GPS simuladas (zona de Colima)
 */
const MOCK_PARCELAS = [
  {
    id: "mock-parcela-norte",
    alias: "Parcela Norte",
    geometria: JSON.stringify([
      { lat: 18.9060, lng: -104.3520 },
      { lat: 18.9070, lng: -104.3510 },
      { lat: 18.9065, lng: -104.3495 },
      { lat: 18.9055, lng: -104.3505 },
    ]),
    metros_cuadrados: 15234.5,
    area_timestamp: new Date().toISOString(),
  },
  {
    id: "mock-parcela-sur",
    alias: "Parcela Sur — Rancho El Limonal",
    geometria: JSON.stringify([
      { lat: 18.9020, lng: -104.3540 },
      { lat: 18.9030, lng: -104.3530 },
      { lat: 18.9035, lng: -104.3515 },
      { lat: 18.9025, lng: -104.3505 },
      { lat: 18.9015, lng: -104.3520 },
    ]),
    metros_cuadrados: 28450.2,
    area_timestamp: new Date().toISOString(),
  },
];

/**
 * Detección mock para testing
 * Vinculada a la Parcela Norte con HLB en limón
 */
const MOCK_DETECCION = {
  id: "mock-deteccion-001",
  usuario_id: MOCK_USER.id,
  parcela_id: "mock-parcela-norte",
  cultivo_nombre: "Limón",
  enfermedad_nombre: "HLB",
  imagen_uri: "/mock/imagen.jpg",
  nivel_confianza: 94,
  latitud: 18.9060,
  longitud: -104.3520,
  pin_latitud: 18.9062,
  pin_longitud: -104.3512,
};

/**
 * Inserta usuario mock, parcelas mock y detección mock en la BD
 * Se llama manualmente al tocar "Iniciar como Demo" en WelcomeScreen
 * Utiliza INSERT OR IGNORE para evitar duplicados si ya existe
 * 
 * @returns {Promise<boolean>} true si se insertó el usuario, false si ya existía
 */
export async function seedMockUser() {
  const db = getDatabase();

  try {
    // Insertar usuario mock
    await db.runAsync(
      "INSERT OR IGNORE INTO usuarios (id, nombre, email, token, zona_agricola) VALUES (?, ?, ?, ?, ?)",
      [MOCK_USER.id, MOCK_USER.nombre, MOCK_USER.email, MOCK_USER.token, MOCK_USER.zona_agricola]
    );

    const usuario = await db.getFirstAsync("SELECT * FROM usuarios WHERE id = ?", [MOCK_USER.id]);
    if (!usuario) {
      return false; // Ya existía
    }

    console.log("[AgroScanner DB] Usuario mock insertado");

    // Insertar parcelas mock
    for (const parcela of MOCK_PARCELAS) {
      await db.runAsync(
        "INSERT OR IGNORE INTO parcelas (id, alias, geometria, metros_cuadrados, area_timestamp, usuario_id) VALUES (?, ?, ?, ?, ?, ?)",
        [parcela.id, parcela.alias, parcela.geometria, parcela.metros_cuadrados, parcela.area_timestamp, MOCK_USER.id]
      );
    }
    console.log("[AgroScanner DB] Parcelas mock insertadas");

    // Insertar detección mock
    const cultivo = await db.getFirstAsync("SELECT id FROM cultivos WHERE nombre = ?", [MOCK_DETECCION.cultivo_nombre]);
    const enfermedad = await db.getFirstAsync("SELECT id FROM enfermedades WHERE nombre = ?", [MOCK_DETECCION.enfermedad_nombre]);

    if (cultivo && enfermedad) {
      await db.runAsync(
        "INSERT OR IGNORE INTO detecciones (id, usuario_id, parcela_id, cultivo_id, enfermedad_id, imagen_uri, nivel_confianza, latitud, longitud, pin_latitud, pin_longitud) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          MOCK_DETECCION.id,
          MOCK_DETECCION.usuario_id,
          MOCK_DETECCION.parcela_id,
          cultivo.id,
          enfermedad.id,
          MOCK_DETECCION.imagen_uri,
          MOCK_DETECCION.nivel_confianza,
          MOCK_DETECCION.latitud,
          MOCK_DETECCION.longitud,
          MOCK_DETECCION.pin_latitud,
          MOCK_DETECCION.pin_longitud,
        ]
      );
      console.log("[AgroScanner DB] Detección mock insertada");
    }

    console.log("[AgroScanner DB] Datos mock cargados correctamente");
    return true;
  } catch (error) {
    console.error("[AgroScanner DB] Error al cargar datos mock:", error);
    throw error;
  }
}

/**
 * Elimina el usuario mock y todos sus datos asociados
 * Se llama al tocar "Cerrar sesión" en PerfilScreen
 */
export async function clearMockUser() {
  const db = getDatabase();

  try {
    // Eliminar detecciones del usuario mock
    await db.runAsync("DELETE FROM detecciones WHERE usuario_id = ?", [MOCK_USER.id]);
    
    // Eliminar parcelas del usuario mock
    await db.runAsync("DELETE FROM parcelas WHERE usuario_id = ?", [MOCK_USER.id]);
    
    // Eliminar usuario mock
    await db.runAsync("DELETE FROM usuarios WHERE id = ?", [MOCK_USER.id]);

    console.log("[AgroScanner DB] Usuario mock eliminado");
  } catch (error) {
    console.error("[AgroScanner DB] Error al eliminar usuario mock:", error);
    throw error;
  }
}