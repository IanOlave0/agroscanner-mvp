/**
 * Pantalla de Canvas para Dibujo de Parcelas
 * 
 * Permite al agricultor:
 * - Tocar la pantalla para agregar vértices del polígono
 * - Ver el polígono en tiempo real mientras dibuja
 * - Ver el área calculada (con turf.js)
 * - Guardar la parcela en la BD
 * - Editar parcela existente (precarga vértices)
 * 
 * FLUJO:
 * 1. Usuario toca pantalla → agrega vértice
 * 2. Mínimo 3 vértices → habilita botón "Guardar"
 * 3. Calcula área con turf.js
 * 4. Guarda en BD con geometría JSON
 */
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions, 
  Alert, 
  TextInput,
  ScrollView
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParams, Parcela, Usuario } from '../../types';
import { COLORS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT } from '../../constants';
import { insertParcela, getParcelaById, getUsuarioActivo, updateParcelaGeometria } from '../../database/queries';
import { calcularAreaParcela, formatearArea, parseGeometria, serializeGeometria } from '../../utils/geometria';
import { useFocusEffect } from '@react-navigation/native';
import { v4 as uuidv4 } from 'uuid';

type ParcelaCanvasNavigationProp = NativeStackNavigationProp<RootStackParams, 'ParcelaCanvas'>;
type ParcelaCanvasRouteProp = RouteProp<RootStackParams, 'ParcelaCanvas'>;

type Props = {
  navigation: ParcelaCanvasNavigationProp;
  route: ParcelaCanvasRouteProp;
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Área de dibujo (80% del ancho de pantalla)
const CANVAS_SIZE = Math.min(SCREEN_WIDTH - 40, SCREEN_HEIGHT * 0.5);
const CANVAS_SCALE = 0.00001; // Escala para coordenadas GPS → pixeles

/**
 * Punto (vértice) en el canvas
 */
interface Vertex {
  x: number;
  y: number;
  lat: number;
  lng: number;
}

export default function ParcelaCanvasScreen({ navigation, route }: Props) {
  const { parcelaId } = route.params;
  const [vertices, setVertices] = useState<Vertex[]>([]);
  const [nombre, setNombre] = useState('');
  const [area, setArea] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const canvasRef = useRef<View>(null);

  /**
   * Si es edición, carga la parcela existente
   */
  useFocusEffect(
    React.useCallback(() => {
      if (parcelaId) {
        cargarParcela(parcelaId);
        setIsEditing(true);
      }
    }, [parcelaId])
  );

  /**
   * Carga datos de parcela existente para edición
   */
  const cargarParcela = async (id: string) => {
    try {
      const parcela = await getParcelaById(id) as Parcela | null;
      if (!parcela) {
        Alert.alert('Error', 'Parcela no encontrada');
        navigation.goBack();
        return;
      }

      setNombre(parcela.alias);
      const parsed = parseGeometria(parcela.geometria);
      
      // Convertir coordenadas GPS a posición en canvas
      const scaled = parsed.map((coord, i) => ({
        x: (coord.lng - parsed[0].lng) / CANVAS_SCALE + CANVAS_SIZE / 2,
        y: (coord.lat - parsed[0].lat) / CANVAS_SCALE + CANVAS_SIZE / 2,
        lat: coord.lat,
        lng: coord.lng,
      }));

      setVertices(scaled);
      setArea(parcela.metros_cuadrados);
    } catch (error) {
      console.error('[ParcelaCanvas] Error cargando parcela:', error);
      Alert.alert('Error', 'No se pudo cargar la parcela');
    }
  };

  /**
   * Maneja el toque en el canvas para agregar vértice
   */
  const handleCanvasTap = (event: any) => {
    const { locationX, locationY } = event.nativeEvent;
    
    // Si es edición, no permitir agregar vértices
    if (isEditing) {
      Alert.alert('Modo edición', 'No puedes agregar vértices en modo edición. Crea una nueva parcela.');
      return;
    }

    // Convertir posición en canvas a coordenadas GPS simuladas
    // En producción, esto usaría GPS real + posición relativa
    const lat = -3.5 + (locationY - CANVAS_SIZE / 2) * CANVAS_SCALE * 10000;
    const lng = -80.0 + (locationX - CANVAS_SIZE / 2) * CANVAS_SCALE * 10000;

    const newVertex: Vertex = {
      x: locationX,
      y: locationY,
      lat,
      lng,
    };

    const newVertices = [...vertices, newVertex];
    setVertices(newVertices);

    // Calcular área si hay al menos 3 vértices
    if (newVertices.length >= 3) {
      const coords = newVertices.map(v => ({ lat: v.lat, lng: v.lng }));
      const calculatedArea = calcularAreaParcela(coords);
      setArea(calculatedArea);
    }
  };

  /**
   * Dibuja el polígono en el canvas (representación visual)
   */
  const renderPolygon = () => {
    if (vertices.length === 0) return null;

    return (
      <View 
        style={[styles.canvas, { width: CANVAS_SIZE, height: CANVAS_SIZE }]}
        ref={canvasRef}
        onTouchEnd={handleCanvasTap}
      >
        {/* Líneas entre vértices */}
        {vertices.map((vertex, i) => {
          if (i === 0) return null;
          const prev = vertices[i - 1];
          return (
            <View
              key={`line-${i}`}
              style={[
                styles.line,
                {
                  left: Math.min(vertex.x, prev.x),
                  top: Math.min(vertex.y, prev.y),
                  width: Math.abs(vertex.x - prev.x),
                  height: Math.abs(vertex.y - prev.y),
                },
              ]}
            />
          );
        })}

        {/* Vértices (puntos) */}
        {vertices.map((vertex, i) => (
          <View
            key={`vertex-${i}`}
            style={[
              styles.vertex,
              { left: vertex.x - 6, top: vertex.y - 6 },
            ]}
          >
            <Text style={styles.vertexLabel}>{i + 1}</Text>
          </View>
        ))}

        {/* Instrucción */}
        {vertices.length === 0 && (
          <Text style={styles.canvasHint}>
            Toca aquí para agregar vértices
          </Text>
        )}
      </View>
    );
  };

  /**
   * Guarda la parcela en la BD
   */
  const handleGuardar = async () => {
    if (vertices.length < 3) {
      Alert.alert('Error', 'Se necesitan al menos 3 vértices para formar un polígono');
      return;
    }

    if (!nombre.trim()) {
      Alert.alert('Error', 'Ingresa un nombre para la parcela');
      return;
    }

    try {
      const usuario = await getUsuarioActivo() as Usuario | null;
      if (!usuario) {
        Alert.alert('Sesión requerida', 'Debes iniciar sesión para guardar parcelas');
        return;
      }

      const coords = vertices.map(v => ({ lat: v.lat, lng: v.lng }));
      const geometriaJSON = serializeGeometria(coords);
      const areaM2 = area!;
      const timestamp = new Date().toISOString();

      if (isEditing && parcelaId) {
        // Actualizar parcela existente
        await updateParcelaGeometria(parcelaId, geometriaJSON, areaM2, timestamp);
        Alert.alert('Éxito', 'Parcela actualizada correctamente');
      } else {
        // Crear nueva parcela
        const id = uuidv4();
        await insertParcela(id, nombre, geometriaJSON, areaM2, timestamp, usuario.id);
        Alert.alert('Éxito', 'Parcela creada correctamente');
      }

      navigation.goBack();
    } catch (error) {
      console.error('[ParcelaCanvas] Error guardando parcela:', error);
      Alert.alert('Error', 'No se pudo guardar la parcela');
    }
  };

  /**
   * Elimina el último vértice
   */
  const handleDeshacer = () => {
    if (vertices.length === 0) return;
    
    const newVertices = vertices.slice(0, -1);
    setVertices(newVertices);

    // Recalcular área
    if (newVertices.length >= 3) {
      const coords = newVertices.map(v => ({ lat: v.lat, lng: v.lng }));
      setArea(calcularAreaParcela(coords));
    } else {
      setArea(null);
    }
  };

  /**
   * Limpia todos los vértices
   */
  const handleLimpiar = () => {
    Alert.alert(
      'Limpiar canvas',
      '¿Estás seguro? Se eliminarán todos los vértices.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Limpiar', 
          style: 'destructive',
          onPress: () => {
            setVertices([]);
            setArea(null);
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>
          {isEditing ? 'Editar Parcela' : 'Dibujar Parcela'}
        </Text>
      </View>

      {/* Nombre */}
      <View style={styles.nameSection}>
        <Text style={styles.label}>Nombre de la parcela</Text>
        <TextInput
          style={styles.input}
          value={nombre}
          onChangeText={setNombre}
          placeholder="Ej: Parcela Norte, Terreno A, ..."
          placeholderTextColor={COLORS.textMuted}
        />
      </View>

      {/* Canvas */}
      <View style={styles.canvasSection}>
        <Text style={styles.label}>
          {isEditing ? 'Vista de la parcela' : 'Toca para agregar vértices'}
        </Text>
        {renderPolygon()}
      </View>

      {/* Info */}
      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Vértices:</Text>
          <Text style={styles.infoValue}>{vertices.length}</Text>
        </View>
        
        {area !== null && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Área:</Text>
            <Text style={[styles.infoValue, styles.areaValue]}>
              {formatearArea(area)}
            </Text>
          </View>
        )}
      </View>

      {/* Botones */}
      <View style={styles.buttonsSection}>
        {!isEditing && (
          <>
            <TouchableOpacity 
              style={[styles.button, styles.secondaryButton]}
              onPress={handleDeshacer}
              disabled={vertices.length === 0}
            >
              <Text style={styles.secondaryButtonText}>Deshacer</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.dangerButton]}
              onPress={handleLimpiar}
              disabled={vertices.length === 0}
            >
              <Text style={styles.dangerButtonText}>Limpiar</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity 
          style={[
            styles.button, 
            styles.primaryButton,
            (vertices.length < 3 || !nombre.trim()) && styles.disabledButton,
          ]}
          onPress={handleGuardar}
          disabled={vertices.length < 3 || !nombre.trim()}
        >
          <Text style={styles.primaryButtonText}>
            {isEditing ? 'Actualizar' : 'Guardar Parcela'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  header: {
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  nameSection: {
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    marginTop: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.bgPrimary,
  },
  canvasSection: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  canvas: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
    position: 'relative',
    marginVertical: SPACING.md,
  },
  canvasHint: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -80 }, { translateY: -12 }],
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.sm,
  },
  line: {
    position: 'absolute',
    backgroundColor: COLORS.primary,
    height: 2,
  },
  vertex: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vertexLabel: {
    color: COLORS.white,
    fontSize: 8,
    fontWeight: FONT_WEIGHT.bold,
  },
  infoSection: {
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    marginTop: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
  },
  infoLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
  },
  areaValue: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.lg,
  },
  buttonsSection: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  button: {
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
  },
  secondaryButton: {
    backgroundColor: COLORS.bgPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  secondaryButtonText: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
  },
  dangerButton: {
    backgroundColor: COLORS.danger + '20',
  },
  dangerButtonText: {
    color: COLORS.danger,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
  },
  disabledButton: {
    backgroundColor: COLORS.textMuted,
  },
});