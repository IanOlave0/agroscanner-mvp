/**
 * @file src/screens/scanner/PinPlacementScreen.tsx
 * @description Pantalla de colocación de pin en parcela.
 * Vincula una detección de IA a una parcela y coordenadas exactas.
 *
 * Migración UI/UX:
 * - Layout externo migrado a Tamagui (YStack, XStack, Text).
 * - Header rediseñado al patrón centrado verde + flecha volver.
 * - Icono emoji 📍 reemplazado por MapPin de Lucide.
 * - Canvas SVG interno se mantiene funcionalmente igual.
 * - Hint movido fuera del canvas como texto simple.
 *
 * @author AgroScanner Team
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Alert,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { YStack, XStack, Text } from 'tamagui';
import { Svg, Line } from 'react-native-svg';
import {
  MapPin, ArrowLeft, Ruler, CheckCircle2,
} from 'lucide-react-native';

import { COLORS, SHADOW } from '../../constants';
import { RootStackParams, ResultadoIA, Parcela, Usuario } from '../../types';
import {
  getParcelasByUsuario, getUsuarioActivo, insertDeteccion,
} from '../../database/queries';
import { parseGeometria, puntoEnPoligono, getCentroide } from '../../utils/geometria';
import { v4 as uuidv4 } from 'uuid';

type PinPlacementNavigationProp = NativeStackNavigationProp<RootStackParams, 'PinPlacement'>;
type PinPlacementRouteProp = RouteProp<RootStackParams, 'PinPlacement'>;

type Props = {
  navigation: PinPlacementNavigationProp;
  route: PinPlacementRouteProp;
};

// Tamaño del canvas SVG (mantenido igual)
const CANVAS_SIZE = 280;

interface PinPosition {
  x: number;
  y: number;
  lat: number;
  lng: number;
}

export default function PinPlacementScreen({ navigation, route }: Props) {
  const { resultado, imagenUri, cultivoId, cultivoNombre } = route.params;
  const [parcelas, setParcelas] = useState<Parcela[]>([]);
  const [parcelaSeleccionada, setParcelaSeleccionada] = useState<Parcela | null>(null);
  const [pin, setPin] = useState<PinPosition | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarParcelas();
  }, []);

  /**
   * Carga las parcelas del usuario activo.
   */
  const cargarParcelas = async () => {
    try {
      const usuario = await getUsuarioActivo() as Usuario | null;
      if (!usuario) {
        Alert.alert(
          'Sesión requerida',
          'Para guardar detecciones, debes registrarte. ¿Deseas hacerlo ahora?',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Registrarme', onPress: () => navigation.navigate('Welcome') },
          ]
        );
        return;
      }

      const lista = await getParcelasByUsuario(usuario.id);
      setParcelas(lista);

      if (lista.length === 0) {
        Alert.alert(
          'Sin parcelas',
          'Debes registrar al menos una parcela antes de hacer detecciones.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('[PinPlacement] Error cargando parcelas:', error);
      Alert.alert('Error', 'No se pudieron cargar las parcelas');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Selecciona una parcela para colocar el pin.
   */
  const handleSeleccionarParcela = (p: Parcela) => {
    setParcelaSeleccionada(p);
    setPin(null);
  };

  /**
   * Maneja el tap en el canvas para colocar el pin.
   */
  const handleCanvasTap = (event: any) => {
    if (!parcelaSeleccionada) return;

    const { locationX, locationY } = event.nativeEvent;

    const vertices = parseGeometria(parcelaSeleccionada.geometria);
    const centroide = getCentroide(vertices);

    const lat = centroide.lat + (locationY - CANVAS_SIZE / 2) * 0.000001;
    const lng = centroide.lng + (locationX - CANVAS_SIZE / 2) * 0.000001;

    const newPin: PinPosition = {
      x: locationX,
      y: locationY,
      lat,
      lng,
    };

    const dentro = puntoEnPoligono(vertices, { lat, lng });
    if (!dentro) {
      Alert.alert('Pin fuera de parcela', 'El pin debe estar dentro del polígono de la parcela');
      return;
    }

    setPin(newPin);
  };

  /**
   * Guarda la detección vinculada a parcela y coordenadas.
   */
  const handleGuardar = async () => {
    if (!parcelaSeleccionada) {
      Alert.alert('Error', 'Selecciona una parcela');
      return;
    }

    if (!pin) {
      Alert.alert('Error', 'Coloca el pin en la planta enferma');
      return;
    }

    try {
      const usuario = await getUsuarioActivo() as Usuario | null;
      if (!usuario) {
        Alert.alert('Sesión requerida', 'Debes iniciar sesión');
        return;
      }

      const enfermedadId = resultado.resultado_positivo ? null : null;
      const id = uuidv4();

      await insertDeteccion(
        id,
        usuario.id,
        parcelaSeleccionada.id,
        cultivoId,
        enfermedadId,
        imagenUri,
        resultado.confianza * 100,
        null,
        null,
        pin.lat,
        pin.lng
      );

      Alert.alert(
        'Éxito',
        'Detección guardada correctamente',
        [{ text: 'OK', onPress: () => navigation.navigate('Historial') }]
      );
    } catch (error) {
      console.error('[PinPlacement] Error guardando detección:', error);
      Alert.alert('Error', 'No se pudo guardar la detección');
    }
  };

  /**
   * Renderiza el canvas SVG con el polígono de la parcela y el pin.
   * MANTENIDO FUNCIONALMENTE IGUAL — solo reemplaza emoji 📍 por MapPin.
   */
  const renderParcela = () => {
    if (!parcelaSeleccionada) return null;

    const vertices = parseGeometria(parcelaSeleccionada.geometria);
    const centroide = getCentroide(vertices);

    const scaled = vertices.map((v) => ({
      x: (v.lng - centroide.lng) * 50000 + CANVAS_SIZE / 2,
      y: (v.lat - centroide.lat) * 50000 + CANVAS_SIZE / 2,
    }));

    return (
      <YStack alignItems="center" gap="$sm">
        <Text fontSize={16} fontWeight="700" color="$textPrimary">
          {parcelaSeleccionada.alias}
        </Text>

        <View
          style={{
            width: CANVAS_SIZE,
            height: CANVAS_SIZE,
            backgroundColor: COLORS.white,
            borderRadius: 16,
            borderWidth: 2,
            borderColor: COLORS.border,
            overflow: 'hidden',
          }}
        >
          {/* SVG del polígono */}
          <Svg
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
          >
            {scaled.map((v, i) => {
              if (i === 0) return null;
              const prev = scaled[i - 1];
              return (
                <Line
                  key={`line-${i}`}
                  x1={prev.x}
                  y1={prev.y}
                  x2={v.x}
                  y2={v.y}
                  stroke={COLORS.primary}
                  strokeWidth={2}
                />
              );
            })}

            {scaled.length >= 3 && (
              <Line
                x1={scaled[scaled.length - 1].x}
                y1={scaled[scaled.length - 1].y}
                x2={scaled[0].x}
                y2={scaled[0].y}
                stroke={COLORS.primary}
                strokeWidth={2}
              />
            )}

          </Svg>

          {/* Pin icon */}
          {pin && (
            <View
              style={{
                position: 'absolute',
                left: pin.x - 12,
                top: pin.y - 24,
                alignItems: 'center',
              }}
            >
              <MapPin size={24} color={COLORS.danger} fill={COLORS.danger} />
            </View>
          )}

          {/* Overlay táctil */}
          <TouchableOpacity
            style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
            onPress={handleCanvasTap}
          />
        </View>
      </YStack>
    );
  };

  // ── Estado de carga ──────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bgPrimary }} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgPrimary} />
        <YStack flex={1} justifyContent="center" alignItems="center" gap="$md">
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text fontSize={16} color="$textSecondary">
            Cargando parcelas...
          </Text>
        </YStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.primary }} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: COLORS.bgPrimary }}
      >
        <YStack gap="$lg" pb="$xxl">

          {/* ── Header con fondo verde y bordes redondeados ──────── */}
          <YStack
            backgroundColor={COLORS.primary}
            px="$lg"
            pt="$lg"
            pb="$xl"
            gap="$md"
            borderBottomLeftRadius={32}
            borderBottomRightRadius={32}
            style={SHADOW.lg}
          >
            <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.85}>
              <XStack alignItems="center" gap="$xs">
                <ArrowLeft size={20} color={COLORS.white} />
                <Text fontSize={14} fontWeight="600" color={COLORS.white}>
                  Volver
                </Text>
              </XStack>
            </TouchableOpacity>
            <Text fontSize={24} fontWeight="800" color={COLORS.white} textAlign="center">
              Ubicar Planta Enferma
            </Text>
          </YStack>

          {/* ── Card resumen análisis ────────────────────────────── */}
          <YStack
            mx="$lg"
            backgroundColor={COLORS.white}
            borderRadius="$lg"
            p="$md"
            style={SHADOW.md}
            gap="$sm"
          >
            <XStack alignItems="center" gap="$xs">
              <CheckCircle2 size={18} color={COLORS.primary} />
                <Text fontSize={16} fontWeight="700" color={COLORS.textPrimary}>
                Resultado del análisis
              </Text>
            </XStack>
            <Text fontSize={14} color={COLORS.textSecondary}>
              Enfermedad: {resultado.enfermedad}
            </Text>
            <Text fontSize={14} color={COLORS.textSecondary}>
              Confianza: {(resultado.confianza * 100).toFixed(1)}%
            </Text>
          </YStack>

          {/* ... (El resto de tu código del Canvas y el Botón sigue igual, 
              solo asegúrate de cambiar los color="$textPrimary" a color={COLORS.textPrimary}) ... */}

          {/* ── Selección de parcela ─────────────────────────────── */}
          <YStack px="$lg" gap="$md">
            <Text fontSize={18} fontWeight="700" color="$textPrimary">
              1. Selecciona la parcela
            </Text>

            {parcelas.length === 0 ? (
              <Text fontSize={16} color="$textMuted" textAlign="center" py="$xl">
                No tienes parcelas registradas
              </Text>
            ) : (
              <YStack gap="$md">
                {parcelas.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => handleSeleccionarParcela(item)}
                    activeOpacity={0.85}
                  >
                    <YStack
                      width="100%"
                      bg="$white"
                      p="$md"
                      borderRadius="$md"
                      borderWidth={2}
                      borderColor={parcelaSeleccionada?.id === item.id ? COLORS.primary : COLORS.border}
                      style={parcelaSeleccionada?.id === item.id ? { backgroundColor: COLORS.primary + '10' } : undefined}
                      gap="$xs"
                    >
                      <Text
                        fontSize={16}
                        fontWeight="700"
                        color="$textPrimary"
                        numberOfLines={2}
                        ellipsizeMode="tail"
                      >
                        {item.alias}
                      </Text>
                      <XStack alignItems="center" gap="$xs">
                        <Ruler size={14} color={COLORS.textSecondary} />
                        <Text fontSize={14} color="$textSecondary">
                          {item.metros_cuadrados.toFixed(0)} m²
                        </Text>
                      </XStack>
                    </YStack>
                  </TouchableOpacity>
                ))}
              </YStack>
            )}
          </YStack>

          {/* ── Canvas con pin ───────────────────────────────────── */}
          {parcelaSeleccionada && (
            <YStack px="$lg" gap="$md">
              <Text fontSize={18} fontWeight="700" color="$textPrimary">
                2. Coloca el pin en la planta
              </Text>
              <Text fontSize={14} color="$textMuted">
                Toca dentro del polígono para colocar el pin
              </Text>
              {renderParcela()}
            </YStack>
          )}

          {/* ── Botón guardar ────────────────────────────────────── */}
          <YStack px="$lg">
            <TouchableOpacity
              onPress={handleGuardar}
              disabled={!parcelaSeleccionada || !pin}
              activeOpacity={0.85}
            >
              <YStack
                bg={(!parcelaSeleccionada || !pin) ? COLORS.textMuted : COLORS.primary}
                py="$md"
                borderRadius="$lg"
                alignItems="center"
              >
                <Text fontSize={16} fontWeight="700" color="$white">
                  Guardar Detección
                </Text>
              </YStack>
            </TouchableOpacity>
          </YStack>

        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}
