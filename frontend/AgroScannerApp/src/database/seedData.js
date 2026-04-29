import { getDatabase } from "./initDB.js";

const CULTOS_INICIALES = [
  { nombre: "Limón", tratamiento_sugerido: "Aplicar fertilizante rico en nitrógeno cada 30 días" },
  { nombre: "Papaya", tratamiento_sugerido: "Riego constante y fertilizante orgánico mensual" },
  { nombre: "Plátano", tratamiento_sugerido: "Aplicar mulch orgánico para retener humedad" },
];

const ENFERMEDADES_INICIALES = [
  { nombre: "HLB", descripcion: "Enfermedad del Huanglongbing causada por bacteria Candidatus Liberibacter. Afecta el transporte de nutrientes en los vasos del floema." },
  { nombre: "Shigatoka Negra", descripcion: "Enfermedad fúngica causada por Mycosphaerella fijiensis. Produce manchas negras en las hojas." },
  { nombre: "Araña Roja", descripcion: "Plaga causada por Tetranychus urticae. Se alimentan de savia de las hojas causando decoloración y manchas amarillas." },
];

const CULTIVO_ENFERMEDAD_TRATAMIENTOS = [
  { cultivo_nombre: "Limón", enfermedad_nombre: "HLB", tratamiento: "Aplicar aceite de neem + cobre cada 15 días. Remover hojas afectadas. Control de pulgón vector." },
  { cultivo_nombre: "Plátano", enfermedad_nombre: "Shigatoka Negra", tratamiento: "Aplicar fungicida a base de cobre cada 7 días. Mejorar circulación de aire. Evitar exceso de humedad." },
  { cultivo_nombre: "Papaya", enfermedad_nombre: "Araña Roja", tratamiento: "Aplicar acaricida natural (jabón potasio) cada semana. Introducir depredadores naturales como phytoseiulus." },
];

export async function seedDatabase() {
  const db = getDatabase();

  try {
    for (const cultivo of CULTOS_INICIALES) {
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