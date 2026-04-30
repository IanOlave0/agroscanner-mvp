/**
 * Módulo de utilidades geométricas para parcelas
 * 
 * Encargado de:
 * - Calcular áreas de parcelas a partir de vértices
 * - Formatear áreas para visualización (m², hectáreas)
 * - Validar geometrías de polígonos
 * 
 * Usa Turf.js para cálculos geoespaciales precisos
 * Estándar: GeoJSON format para interoperabilidad
 */
import * as turf from "@turf/turf";

/**
 * Calcula el área de una parcela usando los vértices del polígono
 * Convierte array de coordenadas → GeoJSON → turf.area()
 * 
 * @param {Array<{lat: number, lng: number}>} vertices - Vértices del polígono
 * @returns {number} Área en metros cuadrados
 * 
 * @example
 * const vertices = [
 *   { lat: -33.456, lng: -70.648 },
 *   { lat: -33.457, lng: -70.647 },
 *   { lat: -33.458, lng: -70.649 }
 * ];
 * const areaM2 = calcularAreaParcela(vertices); // => 1523.45
 */
export function calcularAreaParcela(vertices) {
  // Verificar que hay al menos 3 vértices para formar un polígono
  if (!vertices || vertices.length < 3) {
    throw new Error("[AgroScanner Geometría] Se requieren al menos 3 vértices para formar un polígono");
  }

  // Convertir formato {lat, lng} → [lng, lat] (formato GeoJSON)
  const coordinates = vertices.map(v => [v.lng, v.lat]);
  
  // Cerrar el polígono: primer punto = último punto
  coordinates.push(coordinates[0]);

  // Crear polígono GeoJSON y calcular área
  const polygon = turf.polygon([coordinates]);
  const areaM2 = turf.area(polygon);

  return areaM2; // Retorna en metros cuadrados
}

/**
 * Formatea un área en metros cuadrados a unidad legible
 * 
 * @param {number} areaM2 - Área en metros cuadrados
 * @returns {string} Área formateada (ej: "1,234.56 m²" o "3.45 ha")
 */
export function formatearArea(areaM2) {
  if (areaM2 >= 10000) {
    // Convertir a hectáreas si es mayor a 10,000 m²
    const hectareas = areaM2 / 10000;
    return `${hectareas.toFixed(2)} ha`;
  }
  
  return `${areaM2.toFixed(2)} m²`;
}

/**
 * Convierte array de vértices a GeoJSON Polygon
 * Útil para enviar al backend o guardar en formato estándar
 * 
 * @param {Array<{lat: number, lng: number}>} vertices
 * @returns {Object} GeoJSON Polygon feature
 */
export function verticesToGeoJSON(vertices) {
  const coordinates = vertices.map(v => [v.lng, v.lat]);
  coordinates.push(coordinates[0]); // Cerrar polígono
  
  return turf.polygon([coordinates]);
}

/**
 * Convierte JSON string de geometría a array de vértices
 * Útil para parsear desde la base de datos
 * 
 * @param {string} geometriaJSON - JSON string de la geometría
 * @returns {Array<{lat: number, lng: number}>}
 */
export function parseGeometria(geometriaJSON) {
  try {
    const vertices = JSON.parse(geometriaJSON);
    if (!Array.isArray(vertices) || vertices.length < 3) {
      throw new Error("[AgroScanner Geometría] Geometría inválida: menos de 3 vértices");
    }
    return vertices;
  } catch (error) {
    console.error("[AgroScanner Geometría] Error parseando geometría:", error);
    throw error;
  }
}

/**
 * Serializa array de vértices a JSON string
 * Para guardar en la base de datos
 * 
 * @param {Array<{lat: number, lng: number}>} vertices
 * @returns {string} JSON string
 */
export function serializeGeometria(vertices) {
  return JSON.stringify(vertices);
}

/**
 * Obtiene el centroide (punto central) de un polígono
 * Útil para centrar la vista del mapa en la parcela
 * 
 * @param {Array<{lat: number, lng: number}>} vertices
 * @returns {{lat: number, lng: number}} Coordenadas del centroide
 */
export function getCentroide(vertices) {
  const polygon = verticesToGeoJSON(vertices);
  const centroid = turf.centroid(polygon);
  
  return {
    lat: centroid.geometry.coordinates[1],
    lng: centroid.geometry.coordinates[0]
  };
}

/**
 * Verifica si un punto está dentro de un polígono
 * Usado para validar que un pin está dentro de la parcela
 * 
 * @param {Array<{lat: number, lng: number}>} vertices
 * @param {{lat: number, lng: number}} punto
 * @returns {boolean} True si el punto está dentro del polígono
 */
export function puntoEnPoligono(vertices, punto) {
  const polygon = verticesToGeoJSON(vertices);
  const point = turf.point([punto.lng, punto.lat]);
  
  return turf.booleanPointInPolygon(point, polygon);
}