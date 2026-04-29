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