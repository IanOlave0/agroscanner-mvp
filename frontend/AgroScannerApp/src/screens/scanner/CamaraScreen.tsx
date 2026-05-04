/**
 * Pantalla de Cámara para escaneo de cultivos
 *
 * Flujo:
 * 1. Usuario selecciona cultivo en SeleccionCultivoScreen
 * 2. Se muestra esta pantalla con preview de cámara (placeholder por ahora)
 * 3. Usuario enfoca hoja dentro del marco
 * 4. Presiona botón de captura
 * 5. Simula análisis de IA (2 segundos)
 * 6. Navega a ResultadoScreen con el resultado
 *
 * NOTA: La cámara real se integrará con react-native-camera en producción
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParams, ResultadoIA } from '../../types';
import { COLORS, FONT_SIZE, FONT_WEIGHT, SPACING, RADIUS } from '../../constants';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParams, 'Camara'>;
  route:      RouteProp<RootStackParams, 'Camara'>;
};

const CamaraScreen = ({ navigation, route }: Props) => {
  const { cultivoId, cultivoNombre } = route.params;
  const [analizando, setAnalizando] = useState(false);

  const handleCapturar = async () => {
    setAnalizando(true);

    await new Promise<void>((resolve) => setTimeout(resolve, 2000));

    const resultadoSimulado: ResultadoIA = getResultadoSimulado(cultivoId);

    setAnalizando(false);

    navigation.navigate('Resultado', {
      resultado:     resultadoSimulado,
      imagenUri:     'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Hapus_Mango.jpg/640px-Hapus_Mango.jpg',
      cultivoId,
      cultivoNombre,
    });
  };

  const handleGaleria = () => {
    Alert.alert(
      'Seleccionar imagen',
      'Esta función estará disponible cuando se integre la cámara nativa en la siguiente fase.',
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* ── Vista de cámara ── */}
      <View style={styles.camaraArea}>

        {/* Header */}
        <View style={styles.camaraHeader}>
          <TouchableOpacity
            style={styles.btnBack}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.btnBackText}>X</Text>
          </TouchableOpacity>
          <View style={styles.cultivoBadge}>
            <Text style={styles.cultivoBadgeText}>{cultivoNombre}</Text>
          </View>
          <View style={{ width: 44 }} />
        </View>

        {/* Instrucciones sobre el marco */}
        <Text style={styles.instruccionTexto}>
          Enfoca la hoja dentro del marco
        </Text>

        {/* Marco de enfoque */}
        <View style={styles.marcoContainer}>
          <View style={styles.marco}>
            <View style={[styles.esquina, styles.esquinaTL]} />
            <View style={[styles.esquina, styles.esquinaTR]} />
            <View style={[styles.esquina, styles.esquinaBL]} />
            <View style={[styles.esquina, styles.esquinaBR]} />
          </View>
        </View>

        {/* Tips debajo del marco */}
        <Text style={styles.tipsTexto}>
          Buena luz • Hoja centrada • Sin mover
        </Text>

        {/* Overlay de análisis */}
        {analizando && (
          <View style={styles.analizandoOverlay}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.analizandoTitulo}>Analizando...</Text>
            <Text style={styles.analizandoSub}>Menos de 3 segundos</Text>
          </View>
        )}

        {/* Controles inferiores */}
        <View style={styles.controles}>
          <TouchableOpacity
            style={styles.btnControl}
            onPress={handleGaleria}
            disabled={analizando}
          >
            <Text style={styles.btnControlText}>Galeria</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.btnCaptura,
              analizando && styles.btnCapturaDisabled,
            ]}
            onPress={handleCapturar}
            disabled={analizando}
            activeOpacity={0.8}
          >
            <View style={styles.btnCapturaInner} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnControl} disabled={analizando}>
            <Text style={styles.btnControlText}>Flash</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
};

// ── Resultado simulado según cultivo ──────
const getResultadoSimulado = (cultivoId: number): ResultadoIA => {
  const resultados: Record<number, ResultadoIA> = {
    1: {
      enfermedad:         'HLB (Dragón Amarillo)',
      confianza:           0.92,
      resultado_positivo:  true,
      nivel_riesgo:       'critico',
      tratamiento:        'No tiene cura. Retire el árbol infectado inmediatamente para evitar propagación. Controle el vector (psílido asiático). Contacte a SENASICA para reporte oficial.',
    },
    2: {
      enfermedad:         'Araña Roja',
      confianza:           0.78,
      resultado_positivo:  false,
      nivel_riesgo:       'sano',
      tratamiento:        'La hoja luce saludable. Continúe con monitoreo preventivo cada 15 días. Mantenga riego adecuado para evitar condiciones favorables para la plaga.',
    },
    3: {
      enfermedad:         'Sigatoka Negra',
      confianza:           0.85,
      resultado_positivo:  true,
      nivel_riesgo:       'alto',
      tratamiento:        'Aplique fungicida sistémico (propiconazol). Elimine hojas con más del 50% de daño. Mejore el drenaje del suelo. Repita aplicación en 15 días.',
    },
  };
  return resultados[cultivoId] ?? resultados[1];
};

export default CamaraScreen;

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: '#000',
  },

  // ── Área de cámara
  camaraArea: {
    flex:            1,
    backgroundColor: '#111',
  },
  camaraHeader: {
    flexDirection:     'row',
    justifyContent:    'space-between',
    alignItems:        'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical:   SPACING.md,
  },
  btnBack: {
    width:           44,
    height:          44,
    borderRadius:    RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems:      'center',
    justifyContent:  'center',
  },
  btnBackText: {
    fontSize:   FONT_SIZE.lg,
    color:      COLORS.white,
    fontWeight: FONT_WEIGHT.bold,
  },
  cultivoBadge: {
    backgroundColor:   'rgba(0,0,0,0.5)',
    paddingHorizontal: SPACING.md,
    paddingVertical:   SPACING.xs,
    borderRadius:      RADIUS.full,
    borderWidth:       1,
    borderColor:       COLORS.primary,
  },
  cultivoBadgeText: {
    fontSize:   FONT_SIZE.sm,
    color:      COLORS.white,
    fontWeight: FONT_WEIGHT.semibold,
  },

  // ── Instrucciones
  instruccionTexto: {
    fontSize:          FONT_SIZE.sm,
    color:             COLORS.white,
    textAlign:         'center',
    marginBottom:      SPACING.sm,
  },

  // ── Marco de enfoque
  marcoContainer: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
  },
  marco: {
    width:         260,
    height:        260,
    position:      'relative',
  },
  esquina: {
    position:    'absolute',
    width:       32,
    height:      32,
    borderColor: COLORS.primary,
    borderWidth: 3,
  },
  esquinaTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  esquinaTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  esquinaBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  esquinaBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },

  // ── Tips
  tipsTexto: {
    fontSize:   FONT_SIZE.xs,
    color:      'rgba(255,255,255,0.5)',
    textAlign:  'center',
    marginTop:  SPACING.sm,
  },

  // ── Overlay analizando
  analizandoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems:      'center',
    justifyContent:  'center',
    gap:             SPACING.md,
  },
  analizandoTitulo: {
    fontSize:   FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color:      COLORS.white,
  },
  analizandoSub: {
    fontSize: FONT_SIZE.md,
    color:    'rgba(255,255,255,0.7)',
  },

  // ── Controles
  controles: {
    flexDirection:     'row',
    justifyContent:    'space-around',
    alignItems:        'center',
    paddingVertical:   SPACING.xl,
    paddingHorizontal: SPACING.xl,
    backgroundColor:   'rgba(0,0,0,0.3)',
  },
  btnControl: {
    alignItems: 'center',
    minWidth:   60,
  },
  btnControlText: {
    fontSize:   FONT_SIZE.sm,
    color:      COLORS.white,
    fontWeight: FONT_WEIGHT.medium,
  },
  btnCaptura: {
    width:           80,
    height:          80,
    borderRadius:    RADIUS.full,
    borderWidth:     4,
    borderColor:     COLORS.white,
    alignItems:      'center',
    justifyContent:  'center',
  },
  btnCapturaDisabled: {
    borderColor: COLORS.textMuted,
  },
  btnCapturaInner: {
    width:           60,
    height:          60,
    borderRadius:    RADIUS.full,
    backgroundColor: COLORS.white,
  },
});