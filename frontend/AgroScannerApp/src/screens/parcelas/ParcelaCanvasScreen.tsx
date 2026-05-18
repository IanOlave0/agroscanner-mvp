/**
 * @file src/screens/parcelas/ParcelaCanvasScreen.tsx
 * @description Pantalla de dibujo de parcelas en canvas interactivo.
 * Permite al agricultor trazar un polígono tocando el canvas,
 * calcular el área automáticamente y guardar la parcela en SQLite.
 *
 * Migración UI/UX:
 * - Layout externo migrado a Tamagui (YStack, XStack, Text).
 * - Header alineado al patrón de ParcelaGestionScreen (título centrado verde).
 * - Botones de acción con iconos vectoriales de Lucide (Undo2, Trash2, Save).
 * - Sección de información con acento de color verde.
 * - Canvas SVG interno se mantiene funcionalmente igual.
 *
 * @author AgroScanner Team
 */

import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Pressable,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { YStack, XStack, Text } from 'tamagui';
import { Svg, Line, Circle } from 'react-native-svg';
import {
  ArrowLeft, Undo2, Trash2, Save, Pencil, MapPin,
} from 'lucide-react-native';

import { COLORS, SHADOW } from '../../constants';
import { RootStackParams, Parcela, Usuario } from '../../types';
import {
  insertParcela, getParcelaById, getUsuarioActivo, updateParcelaGeometria,
  updateParcelaAlias,
} from '../../database/queries';
import {
  calcularAreaParcela, formatearArea, parseGeometria, serializeGeometria,
} from '../../utils/geometria';
import { randomUUID } from 'expo-crypto';

type ParcelaCanvasNavigationProp = NativeStackNavigationProp<RootStackParams, 'ParcelaCanvas'>;
type ParcelaCanvasRouteProp = RouteProp<RootStackParams, 'ParcelaCanvas'>;

type Props = {
  navigation: ParcelaCanvasNavigationProp;
  route: ParcelaCanvasRouteProp;
};

// Tamaño fijo del canvas para mantener proporción del dibujo
const CANVAS_SIZE = 320;

/**
 * Representa un vértice en el canvas con coordenadas de pantalla y GPS.
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
   * Si es edición, precarga los datos de la parcela existente.
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
   * Carga los datos de una parcela existente para edición.
   * Normaliza las coordenadas GPS al espacio del canvas.
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

      let minLat = Infinity, maxLat = -Infinity;
      let minLng = Infinity, maxLng = -Infinity;
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
   * Agrega un vértice al tocar el canvas.
   * Calcula el área automáticamente cuando hay al menos 3 vértices.
   */
  const handleCanvasTap = (event: any) => {
    const { locationX, locationY } = event.nativeEvent;

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
   * Renderiza el polígono sobre el canvas usando SVG.
   * MANTENIDO FUNCIONALMENTE IGUAL.
   */
  const renderPolygon = () => {
    return (
      <View
        style={{
          width: CANVAS_SIZE,
          height: CANVAS_SIZE,
          backgroundColor: COLORS.white,
          borderRadius: 16,
          borderWidth: 2,
          borderColor: COLORS.primary + '40',
          overflow: 'hidden',
        }}
      >
        {/* Capa SVG (no intercepta touches) */}
        <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }} pointerEvents="none">
          <Svg width={CANVAS_SIZE} height={CANVAS_SIZE}>
            {/* Línea de cierre */}
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

            {/* Líneas entre vértices */}
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
          <Text
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: [{ translateX: -100 }, { translateY: -12 }],
              color: COLORS.textMuted,
              fontSize: 16,
              textAlign: 'center',
              width: 200,
            }}
          >
            Toca aquí para agregar el primer vértice
          </Text>
        )}

        {/* Capa táctil */}
        <Pressable
          style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
          onPress={handleCanvasTap}
        />
      </View>
    );
  };

  /**
   * Guarda la parcela (nueva o edición) en SQLite.
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
        await updateParcelaAlias(parcelaId, nombre);
        Alert.alert('Éxito', 'Parcela actualizada correctamente');
      } else {
        const id = randomUUID();
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
   * Elimina el último vértice agregado.
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
   * Limpia todos los vértices del canvas.
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
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bgPrimary }} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgPrimary} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack gap="$lg" pb="$xxl">

          {/* ── Header ───────────────────────────────────────────── */}
          <YStack
            bg="$white"
            borderBottomWidth={1}
            borderColor="$border"
            px="$lg"
            py="$lg"
            gap="$md"
          >
            <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.85}>
              <XStack alignItems="center" gap="$xs">
                <ArrowLeft size={20} color={COLORS.primary} />
                <Text fontSize={14} fontWeight="600" color="$primary">
                  Volver
                </Text>
              </XStack>
            </TouchableOpacity>
            <Text fontSize={24} fontWeight="800" color="$primary" textAlign="center">
              {isEditing ? 'Editar Parcela' : 'Dibujar Parcela'}
            </Text>
          </YStack>

          {/* ── Nombre de la parcela ─────────────────────────────── */}
          <YStack px="$lg" gap="$sm">
            <XStack alignItems="center" gap="$xs">
              <Pencil size={18} color={COLORS.primary} />
              <Text fontSize={16} fontWeight="700" color="$textPrimary">
                Nombre de la parcela
              </Text>
            </XStack>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: COLORS.border,
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
                color: COLORS.textPrimary,
                backgroundColor: COLORS.bgPrimary,
              }}
              value={nombre}
              onChangeText={setNombre}
              placeholder="Ej: Parcela Norte, Terreno A, ..."
              placeholderTextColor={COLORS.textMuted}
            />
          </YStack>

          {/* ── Canvas ───────────────────────────────────────────── */}
          <YStack px="$lg" gap="$sm">
            <XStack alignItems="center" gap="$xs">
              <MapPin size={18} color={COLORS.primary} />
              <Text fontSize={16} fontWeight="700" color="$textPrimary">
                {isEditing ? 'Vista de la parcela' : 'Toca el mapa para agregar vértices'}
              </Text>
            </XStack>
            <YStack alignItems="center">
              {renderPolygon()}
            </YStack>
          </YStack>

          {/* ── Información con acento de color ──────────────────── */}
          <YStack
            mx="$lg"
            bg="$white"
            borderRadius="$lg"
            p="$md"
            style={SHADOW.md}
            gap="$sm"
          >
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize={16} color="$textSecondary">
                Vértices:
              </Text>
              <Text fontSize={18} fontWeight="800" color="$primary">
                {vertices.length}
              </Text>
            </XStack>

            {area !== null && (
              <XStack justifyContent="space-between" alignItems="center">
                <Text fontSize={16} color="$textSecondary">
                  Área:
                </Text>
                <Text fontSize={20} fontWeight="800" color="$primary">
                  {formatearArea(area)}
                </Text>
              </XStack>
            )}
          </YStack>

          {/* ── Botones de acción ────────────────────────────────── */}
          <YStack px="$lg" gap="$md">
            <TouchableOpacity
                  onPress={handleDeshacer}
                  disabled={vertices.length === 0}
                  activeOpacity={0.85}
                >
                  <YStack
                    bg="$white"
                    borderWidth={1}
                    borderColor="$border"
                    py="$md"
                    borderRadius="$lg"
                    alignItems="center"
                    flexDirection="row"
                    justifyContent="center"
                    gap="$sm"
                    style={vertices.length === 0 ? { opacity: 0.4 } : undefined}
                  >
                    <Undo2 size={20} color={COLORS.textPrimary} />
                    <Text fontSize={16} fontWeight="600" color="$textPrimary">
                      Deshacer último
                    </Text>
                  </YStack>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleLimpiar}
                  disabled={vertices.length === 0}
                  activeOpacity={0.85}
                >
                  <YStack
                    bg="$dangerLight"
                    borderWidth={1}
                    borderColor="$dangerLight"
                    py="$md"
                    borderRadius="$lg"
                    alignItems="center"
                    flexDirection="row"
                    justifyContent="center"
                    gap="$sm"
                    style={vertices.length === 0 ? { opacity: 0.4 } : undefined}
                  >
                    <Trash2 size={20} color={COLORS.danger} />
                    <Text fontSize={16} fontWeight="600" color="$danger">
                      Limpiar todo
                    </Text>
                  </YStack>
                </TouchableOpacity>

            <TouchableOpacity
              onPress={handleGuardar}
              disabled={vertices.length < 3 || !nombre.trim()}
              activeOpacity={0.85}
            >
              <YStack
                bg={(vertices.length < 3 || !nombre.trim()) ? COLORS.textMuted : COLORS.primary}
                py="$md"
                borderRadius="$lg"
                alignItems="center"
                flexDirection="row"
                justifyContent="center"
                gap="$sm"
              >
                <Save size={20} color={COLORS.white} />
                <Text fontSize={16} fontWeight="700" color="$white">
                  {isEditing ? 'Actualizar Parcela' : 'Guardar Parcela'}
                </Text>
              </YStack>
            </TouchableOpacity>
          </YStack>

        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}
