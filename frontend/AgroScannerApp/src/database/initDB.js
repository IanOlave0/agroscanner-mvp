import * as SQLite from "expo-sqlite";

const DATABASE_NAME = "agroscanner.db";

let db = null;

export async function openDatabase() {
  if (db) return db;
  db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  await db.execAsync("PRAGMA foreign_keys = ON;");
  return db;
}

export async function initDatabase() {
  const database = await openDatabase();

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id TEXT PRIMARY KEY NOT NULL,
      email TEXT,
      token TEXT,
      zona_agricola TEXT,
      fecha_creacion TEXT DEFAULT (datetime('now')),
      sincronizado INTEGER DEFAULT 0
    );
  `);

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS ubicaciones (
      id TEXT PRIMARY KEY NOT NULL,
      alias TEXT NOT NULL,
      direccion TEXT,
      metros_cuadrados REAL,
      latitud REAL,
      longitud REAL,
      usuario_id TEXT NOT NULL,
      fecha_creacion TEXT DEFAULT (datetime('now')),
      sincronizado INTEGER DEFAULT 0,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    );
  `);

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS cultivos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT UNIQUE NOT NULL,
      tratamiento_sugerido TEXT
    );
  `);

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS enfermedades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT UNIQUE NOT NULL,
      descripcion TEXT NOT NULL
    );
  `);

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS cultivo_enfermedad (
      cultivo_id INTEGER NOT NULL,
      enfermedad_id INTEGER NOT NULL,
      tratamiento TEXT NOT NULL,
      PRIMARY KEY (cultivo_id, enfermedad_id),
      FOREIGN KEY (cultivo_id) REFERENCES cultivos(id),
      FOREIGN KEY (enfermedad_id) REFERENCES enfermedades(id)
    );
  `);

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS detecciones (
      id TEXT PRIMARY KEY NOT NULL,
      usuario_id TEXT NOT NULL,
      ubicacion_id TEXT,
      cultivo_id INTEGER NOT NULL,
      enfermedad_id INTEGER,
      imagen_uri TEXT NOT NULL,
      nivel_confianza REAL NOT NULL,
      latitud REAL,
      longitud REAL,
      fecha_creacion TEXT DEFAULT (datetime('now')),
      sincronizado INTEGER DEFAULT 0,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
      FOREIGN KEY (ubicacion_id) REFERENCES ubicaciones(id),
      FOREIGN KEY (cultivo_id) REFERENCES cultivos(id),
      FOREIGN KEY (enfermedad_id) REFERENCES enfermedades(id)
    );
  `);

  console.log("[AgroScanner DB] Base de datos inicializada correctamente");
}

export function getDatabase() {
  if (!db) {
    throw new Error("[AgroScanner DB] Database no inicializada. Llama a initDatabase() primero.");
  }
  return db;
}