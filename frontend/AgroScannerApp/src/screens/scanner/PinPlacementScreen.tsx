/**
 * Pantalla de Colocación de Pin en Parcela
 *
 * Flujo:
 * 1. Viene de ResultadoScreen tras análisis de IA
 * 2. Selecciona parcela de una lista
 * 3. Muestra polígono de la parcela (SVG)
 * 4. Usuario toca para colocar pin en planta enferma
 * 5. Verifica que pin esté dentro del polígono
 * 6. Guarda detección vinculada a parcela + coordenadas pin
 *
 * PANTALLA CRÍTICA: Vincula detección → parcela → ubicación exacta
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  ScrollView,
  FlatList,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import Svg, { Line, Circle } from 'react-native-svg';
import { RootStackParams, ResultadoIA, Parcela, Usuario } from '../../types';
import { COLORS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT } from '../../constants';
import { getParcelasByUsuario, getUsuarioActivo, insertDeteccion } from '../../database/queries';
import { parseGeometria, puntoEnPoligono, getCentroide } from '../../utils/geometria';
import { v4 as uuidv4 } from 'uuid';

type PinPlacementNavigationProp = NativeStackNavigationProp<RootStackParams, 'PinPlacement'>;
type PinPlacementRouteProp = RouteProp<RootStackParams, 'PinPlacement'>;

type Props = {
  navigation: PinPlacementNavigationProp;
  route: PinPlacementRouteProp;
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CANVAS_SIZE = Math.min(SCREEN_WIDTH - 32, SCREEN_HEIGHT * 0.4);

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

  const cargarParcelas = async () => {
    try {
      const usuario = await getUsuarioActivo() as Usuario | null;
      if (!usuario) {
        Alert.alert(
          'Sesión requerida',
          'Para guardar detecciones, debes registrarte. ¿Deseas hacerlo ahora?',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Registrarme', onPress: () => navigation.navigate('Welcome') }
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

  const handleSeleccionarParcela = (p: Parcela) => {
    setParcelaSeleccionada(p);
    setPin(null);
  };

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

  const renderParcela = () => {
    if (!parcelaSeleccionada) return null;

    const vertices = parseGeometria(parcelaSeleccionada.geometria);
    const centroide = getCentroide(vertices);

    const scaled = vertices.map((v) => ({
      x: (v.lng - centroide.lng) * 50000 + CANVAS_SIZE / 2,
      y: (v.lat - centroide.lat) * 50000 + CANVAS_SIZE / 2,
    }));

    return (
      <View style={styles.canvasContainer}>
        <Text style={styles.canvasTitle}>{parcelaSeleccionada.alias}</Text>

        <View style={[styles.canvas, { width: CANVAS_SIZE, height: CANVAS_SIZE }]}>
          <Svg width={CANVAS_SIZE} height={CANVAS_SIZE} style={StyleSheet.absoluteFill}>
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

            {pin && (
              <Circle
                cx={pin.x}
                cy={pin.y}
                r={12}
                fill={COLORS.danger}
                stroke={COLORS.white}
                strokeWidth={2}
              />
            )}
          </Svg>

          {pin && (
            <View style={[styles.pinMarker, { left: pin.x - 12, top: pin.y - 24 }]}>
              <Text style={styles.pinMarkerText}>📍</Text>
            </View>
          )}

          {!pin && (
            <Text style={styles.canvasHint}>Toca para colocar el pin</Text>
          )}

          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={handleCanvasTap}
          />
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgPrimary} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando parcelas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgPrimary} />
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Ubicar Planta Enferma</Text>
        </View>

        <View style={styles.resultadoCard}>
          <Text style={styles.resultadoTitle}>Resultado del análisis</Text>
          <Text style={styles.resultadoText}>Enfermedad: {resultado.enfermedad}</Text>
          <Text style={styles.resultadoText}>
            Confianza: {(resultado.confianza * 100).toFixed(1)}%
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Selecciona la parcela</Text>

          {parcelas.length === 0 ? (
            <Text style={styles.emptyText}>No tienes parcelas registradas</Text>
          ) : (
            <FlatList
              data={parcelas}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.parcelaCard,
                    parcelaSeleccionada?.id === item.id && styles.parcelaSelected,
                  ]}
                  onPress={() => handleSeleccionarParcela(item)}
                >
                  <Text style={styles.parcelaName}>{item.alias}</Text>
                  <Text style={styles.parcelaArea}>
                    {item.metros_cuadrados.toFixed(0)} m²
                  </Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.parcelaList}
            />
          )}
        </View>

        {parcelaSeleccionada && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Coloca el pin en la planta</Text>
            {renderParcela()}
          </View>
        )}

        <View style={styles.buttonsSection}>
          <TouchableOpacity
            style={[
              styles.button,
              styles.primaryButton,
              (!parcelaSeleccionada || !pin) && styles.disabledButton,
            ]}
            onPress={handleGuardar}
            disabled={!parcelaSeleccionada || !pin}
          >
            <Text style={styles.primaryButtonText}>Guardar Detección</Text>
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
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  loadingText: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: FONT_SIZE.lg,
    color: COLORS.textSecondary,
  },
  resultadoCard: {
    backgroundColor: COLORS.white,
    margin: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  resultadoTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  resultadoText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  section: {
    padding: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textMuted,
    textAlign: 'center',
    padding: SPACING.xl,
  },
  parcelaList: {
    gap: SPACING.sm,
  },
  parcelaCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    width: 150,
  },
  parcelaSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  parcelaName: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  parcelaArea: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  canvasContainer: {
    alignItems: 'center',
  },
  canvasTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  canvas: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  pinMarker: {
    position: 'absolute',
    alignItems: 'center',
  },
  pinMarkerText: {
    fontSize: 24,
  },
  canvasHint: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -60 }, { translateY: -12 }],
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.sm,
  },
  buttonsSection: {
    padding: SPACING.lg,
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
  disabledButton: {
    backgroundColor: COLORS.textMuted,
  },
});