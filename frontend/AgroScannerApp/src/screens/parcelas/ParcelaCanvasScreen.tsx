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
 * 1. Usuario toca canvas → agrega vértice
 * 2. Mínimo 3 vértices → habilita botón "Guardar"
 * 3. Calcula área con turf.js
 * 4. Guarda en BD con geometría JSON
 *
 * FIX APLICADO:
 * - Usando react-native-svg para dibujar líneas y vértices
 * - Pressable para detección de taps
 * - Líneas conectan directamente los vértices (x1,y1 → x2,y2)
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  TextInput,
  ScrollView,
  Pressable,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import Svg, { Line, Circle, Polygon as SvgPolygon } from 'react-native-svg';
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Canvas ocupa 90% del ancho de pantalla, mínimo 300px
const CANVAS_SIZE = Math.max(300, Math.min(SCREEN_WIDTH - 32, 400));

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
      
      // Normalizar coordenadas al centro del canvas
      let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
      parsed.forEach(coord => {
        if (coord.lat < minLat) minLat = coord.lat;
        if (coord.lat > maxLat) maxLat = coord.lat;
        if (coord.lng < minLng) minLng = coord.lng;
        if (coord.lng > maxLng) maxLng = coord.lng;
      });

      const latRange = maxLat - minLat || 0.001;
      const lngRange = maxLng - minLng || 0.001;
      const padding = 40;
      const usableSize = CANVAS_SIZE - padding * 2;

      const scaled = parsed.map(coord => ({
        x: padding + ((coord.lng - minLng) / lngRange) * usableSize,
        y: padding + ((coord.lat - minLat) / latRange) * usableSize,
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
   * Usa Pressable onPress en lugar de onTouchEnd (compatible con ScrollView)
   */
  const handleCanvasTap = (event: any) => {
    const { locationX, locationY } = event.nativeEvent;
    
    if (isEditing) return;

    const centerX = CANVAS_SIZE / 2;
    const centerY = CANVAS_SIZE / 2;
    const scale = 0.00005;

    const baseLat = 19.1460;
    const baseLng = -104.3260;

    const lat = baseLat + (locationY - centerY) * scale;
    const lng = baseLng + (locationX - centerX) * scale;

    const newVertex: Vertex = {
      x: locationX,
      y: locationY,
      lat,
      lng,
    };

    const newVertices = [...vertices, newVertex];
    setVertices(newVertices);

    if (newVertices.length >= 3) {
      const coords = newVertices.map(v => ({ lat: v.lat, lng: v.lng }));
      const calculatedArea = calcularAreaParcela(coords);
      setArea(calculatedArea);
    }
  };

  /**
   * Dibuja el polígono usando SVG (líneas directas entre vértices)
   */
  const renderPolygon = () => {
    return (
      <View
        style={[styles.canvas, { width: CANVAS_SIZE, height: CANVAS_SIZE }]}
      >
        {/* Svg en la capa inferior - no bloquea touches */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Svg
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
          >
            {/* Línea de cierre (del último al primero) si hay 3+ vértices */}
            {vertices.length >= 3 && (
              <Line
                x1={vertices[vertices.length - 1].x}
                y1={vertices[vertices.length - 1].y}
                x2={vertices[0].x}
                y2={vertices[0].y}
                stroke={COLORS.primary}
                strokeWidth={2}
                strokeOpacity={0.5}
              />
            )}

            {/* Líneas entre vértices consecutivos */}
            {vertices.map((vertex, i) => {
              if (i === 0) return null;
              const prev = vertices[i - 1];
              return (
                <Line
                  key={`line-${i}`}
                  x1={prev.x}
                  y1={prev.y}
                  x2={vertex.x}
                  y2={vertex.y}
                  stroke={COLORS.primary}
                  strokeWidth={3}
                />
              );
            })}

            {/* Vértices como círculos */}
            {vertices.map((vertex, i) => (
              <Circle
                key={`vertex-${i}`}
                cx={vertex.x}
                cy={vertex.y}
                r={10}
                fill={COLORS.primary}
                stroke={COLORS.white}
                strokeWidth={2}
              />
            ))}
          </Svg>
        </View>

        {/* Hint cuando no hay vértices */}
        {vertices.length === 0 && (
          <Text style={styles.canvasHint}>
            Toca aquí para agregar el primer vértice
          </Text>
        )}

        {/* Pressable en la capa superior - captura todos los taps */}
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={handleCanvasTap}
        />
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
        await updateParcelaGeometria(parcelaId, geometriaJSON, areaM2, timestamp);
        Alert.alert('Éxito', 'Parcela actualizada correctamente');
      } else {
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgPrimary} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>
          {isEditing ? 'Editar Parcela' : 'Dibujar Parcela'}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
            {isEditing ? 'Vista de la parcela' : 'Toca el mapa para agregar vértices'}
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
                <Text style={styles.secondaryButtonText}>Deshacer último</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.button, styles.dangerButton]}
                onPress={handleLimpiar}
                disabled={vertices.length === 0}
              >
                <Text style={styles.dangerButtonText}>Limpiar todo</Text>
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
              {isEditing ? 'Actualizar Parcela' : 'Guardar Parcela'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
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
    borderColor: COLORS.primary + '40',
    overflow: 'hidden',
  },
  canvasPressable: {
    width: '100%',
    height: '100%',
  },
  canvasHint: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -12 }],
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
    width: 200,
  },
  infoSection: {
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  secondaryButtonText: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
  },
  dangerButton: {
    backgroundColor: COLORS.danger + '15',
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