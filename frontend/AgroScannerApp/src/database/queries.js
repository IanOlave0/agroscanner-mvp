import { getDatabase } from "./initDB.js";

export async function insertUsuario(id, email, token, zonaAgricola = null) {
  const db = getDatabase();
  try {
    await db.runAsync(
      "INSERT INTO usuarios (id, email, token, zona_agricola) VALUES (?, ?, ?, ?)",
      [id, email, token, zonaAgricola]
    );
    console.log("[AgroScanner DB] Usuario insertado:", id);
  } catch (error) {
    console.error("[AgroScanner DB] Error inserting usuario:", error);
    throw error;
  }
}

export async function getUsuarioById(id) {
  const db = getDatabase();
  try {
    return await db.getFirstAsync("SELECT * FROM usuarios WHERE id = ?", [id]);
  } catch (error) {
    console.error("[AgroScanner DB] Error getting usuario:", error);
    throw error;
  }
}

export async function getUsuarioByEmail(email) {
  const db = getDatabase();
  try {
    return await db.getFirstAsync("SELECT * FROM usuarios WHERE email = ?", [email]);
  } catch (error) {
    console.error("[AgroScanner DB] Error getting usuario by email:", error);
    throw error;
  }
}

export async function updateUsuario(id, zonaAgricola, sincronizado = 0) {
  const db = getDatabase();
  try {
    await db.runAsync(
      "UPDATE usuarios SET zona_agricola = ?, sincronizado = ? WHERE id = ?",
      [zonaAgricola, sincronizado, id]
    );
    console.log("[AgroScanner DB] Usuario actualizado:", id);
  } catch (error) {
    console.error("[AgroScanner DB] Error updating usuario:", error);
    throw error;
  }
}

export async function insertUbicacion(id, alias, direccion, metrosCuadrados, latitud, longitud, usuarioId) {
  const db = getDatabase();
  try {
    await db.runAsync(
      "INSERT INTO ubicaciones (id, alias, direccion, metros_cuadrados, latitud, longitud, usuario_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [id, alias, direccion, metrosCuadrados, latitud, longitud, usuarioId]
    );
    console.log("[AgroScanner DB] Ubicacion insertada:", id);
  } catch (error) {
    console.error("[AgroScanner DB] Error inserting ubicacion:", error);
    throw error;
  }
}

export async function getUbicacionById(id) {
  const db = getDatabase();
  try {
    return await db.getFirstAsync("SELECT * FROM ubicaciones WHERE id = ?", [id]);
  } catch (error) {
    console.error("[AgroScanner DB] Error getting ubicacion:", error);
    throw error;
  }
}

export async function getUbicacionesByUsuario(usuarioId) {
  const db = getDatabase();
  try {
    return await db.getAllAsync("SELECT * FROM ubicaciones WHERE usuario_id = ?", [usuarioId]);
  } catch (error) {
    console.error("[AgroScanner DB] Error getting ubicaciones:", error);
    throw error;
  }
}

export async function updateUbicacion(id, alias, direccion, metrosCuadrados, sincronizado = 0) {
  const db = getDatabase();
  try {
    await db.runAsync(
      "UPDATE ubicaciones SET alias = ?, direccion = ?, metros_cuadrados = ?, sincronizado = ? WHERE id = ?",
      [alias, direccion, metrosCuadrados, sincronizado, id]
    );
    console.log("[AgroScanner DB] Ubicacion actualizada:", id);
  } catch (error) {
    console.error("[AgroScanner DB] Error updating ubicacion:", error);
    throw error;
  }
}

export async function deleteUbicacion(id) {
  const db = getDatabase();
  try {
    await db.runAsync("DELETE FROM ubicaciones WHERE id = ?", [id]);
    console.log("[AgroScanner DB] Ubicacion eliminada:", id);
  } catch (error) {
    console.error("[AgroScanner DB] Error deleting ubicacion:", error);
    throw error;
  }
}

export async function getAllCultivos() {
  const db = getDatabase();
  try {
    return await db.getAllAsync("SELECT * FROM cultivos ORDER BY nombre");
  } catch (error) {
    console.error("[AgroScanner DB] Error getting cultivos:", error);
    throw error;
  }
}

export async function getCultivoById(id) {
  const db = getDatabase();
  try {
    return await db.getFirstAsync("SELECT * FROM cultivos WHERE id = ?", [id]);
  } catch (error) {
    console.error("[AgroScanner DB] Error getting cultivo:", error);
    throw error;
  }
}

export async function getAllEnfermedades() {
  const db = getDatabase();
  try {
    return await db.getAllAsync("SELECT * FROM enfermedades ORDER BY nombre");
  } catch (error) {
    console.error("[AgroScanner DB] Error getting enfermedades:", error);
    throw error;
  }
}

export async function getEnfermedadById(id) {
  const db = getDatabase();
  try {
    return await db.getFirstAsync("SELECT * FROM enfermedades WHERE id = ?", [id]);
  } catch (error) {
    console.error("[AgroScanner DB] Error getting enfermedad:", error);
    throw error;
  }
}

export async function getEnfermedadesByCultivo(cultivoId) {
  const db = getDatabase();
  try {
    return await db.getAllAsync(
      `SELECT e.*, ce.tratamiento 
       FROM enfermedades e
       JOIN cultivo_enfermedad ce ON e.id = ce.enfermedad_id
       WHERE ce.cultivo_id = ?`,
      [cultivoId]
    );
  } catch (error) {
    console.error("[AgroScanner DB] Error getting enfermedades by cultivo:", error);
    throw error;
  }
}

export async function getTratamiento(cultivoId, enfermedadId) {
  const db = getDatabase();
  try {
    return await db.getFirstAsync(
      "SELECT tratamiento FROM cultivo_enfermedad WHERE cultivo_id = ? AND enfermedad_id = ?",
      [cultivoId, enfermedadId]
    );
  } catch (error) {
    console.error("[AgroScanner DB] Error getting tratamiento:", error);
    throw error;
  }
}

export async function insertDeteccion(
  id,
  usuarioId,
  ubicacionId,
  cultivoId,
  enfermedadId,
  imagenUri,
  nivelConfianza,
  latitud,
  longitud
) {
  const db = getDatabase();
  try {
    await db.runAsync(
      `INSERT INTO detecciones (id, usuario_id, ubicacion_id, cultivo_id, enfermedad_id, imagen_uri, nivel_confianza, latitud, longitud)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, usuarioId, ubicacionId, cultivoId, enfermedadId, imagenUri, nivelConfianza, latitud, longitud]
    );
    console.log("[AgroScanner DB] Deteccion insertada:", id);
  } catch (error) {
    console.error("[AgroScanner DB] Error inserting deteccion:", error);
    throw error;
  }
}

export async function getDeteccionById(id) {
  const db = getDatabase();
  try {
    return await db.getFirstAsync("SELECT * FROM detecciones WHERE id = ?", [id]);
  } catch (error) {
    console.error("[AgroScanner DB] Error getting deteccion:", error);
    throw error;
  }
}

export async function getDeteccionesByUsuario(usuarioId) {
  const db = getDatabase();
  try {
    return await db.getAllAsync(
      `SELECT d.*, c.nombre as cultivo_nombre, e.nombre as enfermedad_nombre
       FROM detecciones d
       JOIN cultivos c ON d.cultivo_id = c.id
       LEFT JOIN enfermedades e ON d.enfermedad_id = e.id
       WHERE d.usuario_id = ?
       ORDER BY d.fecha_creacion DESC`,
      [usuarioId]
    );
  } catch (error) {
    console.error("[AgroScanner DB] Error getting detecciones:", error);
    throw error;
  }
}

export async function getDeteccionesPendientes() {
  const db = getDatabase();
  try {
    return await db.getAllAsync(
      "SELECT * FROM detecciones WHERE sincronizado = 0 ORDER BY fecha_creacion"
    );
  } catch (error) {
    console.error("[AgroScanner DB] Error getting detecciones pendientes:", error);
    throw error;
  }
}

export async function getUbicacionesPendientes() {
  const db = getDatabase();
  try {
    return await db.getAllAsync(
      "SELECT * FROM ubicaciones WHERE sincronizado = 0 ORDER BY fecha_creacion"
    );
  } catch (error) {
    console.error("[AgroScanner DB] Error getting ubicaciones pendientes:", error);
    throw error;
  }
}

export async function getUsuariosPendientes() {
  const db = getDatabase();
  try {
    return await db.getAllAsync(
      "SELECT * FROM usuarios WHERE sincronizado = 0 ORDER BY fecha_creacion"
    );
  } catch (error) {
    console.error("[AgroScanner DB] Error getting usuarios pendients:", error);
    throw error;
  }
}

export async function updateDeteccionSincronizado(id, sincronizado = 1) {
  const db = getDatabase();
  try {
    await db.runAsync(
      "UPDATE detecciones SET sincronizado = ? WHERE id = ?",
      [sincronizado, id]
    );
    console.log("[AgroScanner DB] Deteccion marcada como sincronizada:", id);
  } catch (error) {
    console.error("[AgroScanner DB] Error updating deteccion sincronizado:", error);
    throw error;
  }
}

export async function deleteDeteccion(id) {
  const db = getDatabase();
  try {
    await db.runAsync("DELETE FROM detecciones WHERE id = ?", [id]);
    console.log("[AgroScanner DB] Deteccion eliminada:", id);
  } catch (error) {
    console.error("[AgroScanner DB] Error deleting deteccion:", error);
    throw error;
  }
}

export async function getUsuarioActivo() {
  const db = getDatabase();
  try {
    return await db.getFirstAsync("SELECT * FROM usuarios LIMIT 1");
  } catch (error) {
    console.error("[AgroScanner DB] Error getting usuario activo:", error);
    throw error;
  }
}

function decodeJWT(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch (error) {
    console.error("[AgroScanner DB] Error decoding JWT:", error);
    return null;
  }
}

export async function verifyTokenOffline() {
  const db = getDatabase();
  try {
    const usuario = await db.getFirstAsync("SELECT * FROM usuarios LIMIT 1");
    
    if (!usuario || !usuario.token) {
      console.log("[AgroScanner DB] No hay token almacenado");
      return { valido: false, razon: "sin_sesion" };
    }

    const payload = decodeJWT(usuario.token);
    
    if (!payload) {
      console.log("[AgroScanner DB] Token inválido");
      return { valido: false, razon: "token_invalido" };
    }

    if (payload.exp && payload.exp * 1000 < Date.now()) {
      console.log("[AgroScanner DB] Token expirado");
      return { valido: false, razon: "token_expirado" };
    }

    console.log("[AgroScanner DB] Token válido, usuario autenticado offline");
    return { valido: true, usuario };
  } catch (error) {
    console.error("[AgroScanner DB] Error verifying token offline:", error);
    throw error;
  }
}

export async function logoutUsuario() {
  const db = getDatabase();
  try {
    await db.runAsync("DELETE FROM usuarios");
    console.log("[AgroScanner DB] Sesión cerrada, usuario eliminado");
  } catch (error) {
    console.error("[AgroScanner DB] Error logout usuario:", error);
    throw error;
  }
}

export async function updateToken(token) {
  const db = getDatabase();
  try {
    await db.runAsync("UPDATE usuarios SET token = ?", [token]);
    console.log("[AgroScanner DB] Token actualizado");
  } catch (error) {
    console.error("[AgroScanner DB] Error updating token:", error);
    throw error;
  }
}