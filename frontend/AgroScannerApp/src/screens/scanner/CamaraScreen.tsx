import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, Alert, ActivityIndicator,
} from 'react-native';
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

  const [analizando,   setAnalizando]   = useState(false);


  // ── Simular captura de foto ───────────
  // Aquí irá react-native-camera en producción
  // Por ahora simulamos el flujo completo
  const handleCapturar = async () => {
    setAnalizando(true);

    // Simular tiempo de análisis de la IA (< 3 seg según RNF06)
    await new Promise<void>((resolve) => setTimeout(resolve, 2000));

    // Resultado simulado de la IA
    // En producción vendrá del modelo TFLite
    const resultadoSimulado: ResultadoIA = getResultadoSimulado(cultivoId);

    setAnalizando(false);

    // Navegar a pantalla de resultado
    navigation.navigate('Resultado', {
      resultado:  resultadoSimulado,
      imagenUri:  'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Hapus_Mango.jpg/640px-Hapus_Mango.jpg',
      cultivoId,
    });
  };

  // ── Abrir galería ─────────────────────
  // Aquí irá react-native-image-picker
  const handleGaleria = () => {
    Alert.alert(
      'Seleccionar imagen',
      'Esta función estará disponible cuando se integre la cámara nativa en la siguiente fase.',
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* ── Vista de cámara ── */}
      {/* En producción aquí va el componente RNCamera */}
      <View style={styles.camaraArea}>

        {/* Header sobre la cámara */}
        <View style={styles.camaraHeader}>
          <TouchableOpacity
            style={styles.btnBack}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.btnBackText}>✕</Text>
          </TouchableOpacity>
          <View style={styles.cultivoBadge}>
            <Text style={styles.cultivoBadgeText}>
              Analizando: {cultivoNombre}
            </Text>
          </View>
          <View style={{ width: 44 }} />
        </View>

        {/* Marco de enfoque — guía al agricultor */}
        <View style={styles.marcoContainer}>
          <Text style={styles.instruccionTexto}>
            Enfoca la hoja a la cámara
          </Text>

          <View style={styles.marco}>
            {/* Esquinas del marco */}
            <View style={[styles.esquina, styles.esquinaTL]} />
            <View style={[styles.esquina, styles.esquinaTR]} />
            <View style={[styles.esquina, styles.esquinaBL]} />
            <View style={[styles.esquina, styles.esquinaBR]} />

            {/* Placeholder de imagen */}
            <View style={styles.camaraPlaceholder}>
              <Text style={styles.camaraPlaceholderEmoji}>📷</Text>
              <Text style={styles.camaraPlaceholderText}>
                Vista de cámara
              </Text>
            </View>
          </View>

          <Text style={styles.instruccionSub}>
            Asegúrate de tener buena iluminación natural
          </Text>
        </View>

        {/* Overlay de análisis */}
        {analizando && (
          <View style={styles.analizandoOverlay}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.analizandoTitulo}>Analizando con IA...</Text>
            <Text style={styles.analizandoSub}>
              Esto tarda menos de 3 segundos
            </Text>
          </View>
        )}

        {/* Controles inferiores */}
        <View style={styles.controles}>

          {/* Botón galería */}
          <TouchableOpacity
            style={styles.btnGaleria}
            onPress={handleGaleria}
            disabled={analizando}
          >
            <Text style={styles.btnGaleriaEmoji}>🖼</Text>
            <Text style={styles.btnGaleriaText}>Galería</Text>
          </TouchableOpacity>

          {/* Botón captura principal — grande para uso en campo */}
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

          {/* Flash */}
          <TouchableOpacity style={styles.btnFlash} disabled={analizando}>
            <Text style={styles.btnFlashEmoji}>⚡</Text>
            <Text style={styles.btnFlashText}>Flash</Text>
          </TouchableOpacity>

        </View>

      </View>

      {/* ── Instrucciones rápidas ── */}
      <View style={styles.instrucciones}>
        <InstruccionItem emoji="🍃" texto="Una sola hoja" />
        <InstruccionItem emoji="☀️" texto="Buena luz" />
        <InstruccionItem emoji="📐" texto="Hoja centrada" />
        <InstruccionItem emoji="✋" texto="Sin mover" />
      </View>

    </View>
  );
};

// ── Componente instrucción ────────────────
const InstruccionItem = ({
  emoji,
  texto,
}: {
  emoji: string;
  texto: string;
}) => (
  <View style={styles.instruccionItem}>
    <Text style={styles.instruccionEmoji}>{emoji}</Text>
    <Text style={styles.instruccionItemTexto}>{texto}</Text>
  </View>
);

// ── Resultado simulado según cultivo ──────
// En producción esto viene del modelo TFLite
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
    position:        'relative',
  },
  camaraHeader: {
    flexDirection:     'row',
    justifyContent:    'space-between',
    alignItems:        'center',
    paddingHorizontal: SPACING.lg,
    paddingTop:        SPACING.xl,
    paddingBottom:     SPACING.md,
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

  // ── Marco de enfoque
  marcoContainer: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    gap:            SPACING.md,
  },
  instruccionTexto: {
    fontSize:          FONT_SIZE.sm,
    color:             COLORS.white,
    backgroundColor:   'rgba(0,0,0,0.5)',
    paddingHorizontal: SPACING.md,
    paddingVertical:   SPACING.xs,
    borderRadius:      RADIUS.full,
  },
  marco: {
    width:         260,
    height:        260,
    position:      'relative',
    alignItems:    'center',
    justifyContent: 'center',
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
  camaraPlaceholder: {
    width:          220,
    height:         220,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            SPACING.sm,
  },
  camaraPlaceholderEmoji: { fontSize: 48 },
  camaraPlaceholderText: {
    fontSize: FONT_SIZE.sm,
    color:    'rgba(255,255,255,0.5)',
  },
  instruccionSub: {
    fontSize: FONT_SIZE.xs,
    color:    'rgba(255,255,255,0.6)',
  },

  // ── Overlay analizando
  analizandoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
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
    backgroundColor:   'rgba(0,0,0,0.5)',
  },
  btnGaleria: {
    alignItems: 'center',
    gap:        4,
  },
  btnGaleriaEmoji: { fontSize: 28 },
  btnGaleriaText: {
    fontSize: FONT_SIZE.xs,
    color:    COLORS.white,
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
  btnFlash: {
    alignItems: 'center',
    gap:        4,
  },
  btnFlashEmoji: { fontSize: 28 },
  btnFlashText: {
    fontSize: FONT_SIZE.xs,
    color:    COLORS.white,
  },

  // ── Instrucciones rápidas
  instrucciones: {
    flexDirection:     'row',
    justifyContent:    'space-around',
    backgroundColor:   COLORS.bgCard,
    paddingVertical:   SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  instruccionItem: {
    alignItems: 'center',
    gap:        4,
  },
  instruccionEmoji: { fontSize: 20 },
  instruccionItemTexto: {
    fontSize: FONT_SIZE.xs,
    color:    COLORS.textSecondary,
  },
});