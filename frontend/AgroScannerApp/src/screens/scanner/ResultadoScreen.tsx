import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParams } from '../../types';
import {
  COLORS, FONT_SIZE, FONT_WEIGHT,
  SPACING, RADIUS,
} from '../../constants';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParams, 'Resultado'>;
  route:      RouteProp<RootStackParams, 'Resultado'>;
};

const ResultadoScreen = ({ navigation, route }: Props) => {
  const { resultado, imagenUri, cultivoId } = route.params;
  const [guardado, setGuardado] = useState(false);

  // ── Determinar colores del semáforo ───────────────────────
  // Según RNF07 del documento: semáforo Verde/Amarillo/Rojo
  // Verde  = planta sana
  // Amarillo = riesgo medio (confianza entre 60-80%)
  // Rojo   = enfermedad detectada con alta confianza
  const getSemaforo = () => {
    if (!resultado.resultado_positivo) {
      return {
        color:      COLORS.semaforoVerde,
        colorFondo: COLORS.successLight,
        icono:      '✅',
        titulo:     '¡Planta Sana!',
        mensaje:    'No se detectaron señales de enfermedad en esta hoja.',
      };
    }
    if (resultado.confianza >= 0.85) {
      return {
        color:      COLORS.semaforoRojo,
        colorFondo: COLORS.dangerLight,
        icono:      '🔴',
        titulo:     '⚠ Alerta: ' + resultado.enfermedad,
        mensaje:    'Se detectó la enfermedad con alta certeza. Actúa de inmediato.',
      };
    }
    return {
      color:      COLORS.semaforoAmarillo,
      colorFondo: COLORS.warningLight,
      icono:      '🟡',
      titulo:     'Posible: ' + resultado.enfermedad,
      mensaje:    'Se detectaron señales sospechosas. Se recomienda revisión adicional.',
    };
  };

  const semaforo = getSemaforo();
  const confianzaPct = Math.round(resultado.confianza * 100);

  // ── Guardar detección localmente ──────────────────────────
  // Según CU-07 del documento: guardar diagnóstico y ubicación
  const handleGuardar = () => {
    Alert.alert(
      'Iniciar sesión requerido',
      'Para guardar y sincronizar tus detecciones necesitas una cuenta.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Iniciar sesión',
          onPress: () => navigation.navigate('Login'),
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgPrimary} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >

        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')}>
            <Text style={styles.backText}>← Inicio</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitulo}>Diagnóstico</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* ── Imagen analizada ── */}
        <View style={styles.imagenContainer}>
          <Image
            source={{ uri: imagenUri }}
            style={styles.imagen}
            resizeMode="cover"
          />
          {/* Badge sobre la imagen */}
          <View style={[styles.badge, { backgroundColor: semaforo.color }]}>
            <Text style={styles.badgeText}>{semaforo.icono} {confianzaPct}% certeza</Text>
          </View>
        </View>

        {/* ── Tarjeta de resultado principal ── */}
        {/* Este es el semáforo que exige el RNF07 del documento */}
        <View style={[styles.resultadoCard, { backgroundColor: semaforo.colorFondo, borderColor: semaforo.color }]}>

          {/* Semáforo visual */}
          <View style={styles.semaforoRow}>
            <SemaforoLuz
              color={COLORS.semaforoRojo}
              activo={resultado.resultado_positivo && resultado.confianza >= 0.85}
            />
            <SemaforoLuz
              color={COLORS.semaforoAmarillo}
              activo={resultado.resultado_positivo && resultado.confianza < 0.85}
            />
            <SemaforoLuz
              color={COLORS.semaforoVerde}
              activo={!resultado.resultado_positivo}
            />
          </View>

          <Text style={[styles.resultadoTitulo, { color: semaforo.color }]}>
            {semaforo.titulo}
          </Text>
          <Text style={styles.resultadoMensaje}>{semaforo.mensaje}</Text>

          {/* Barra de confianza */}
          <View style={styles.confianzaSection}>
            <View style={styles.confianzaHeader}>
              <Text style={styles.confianzaLabel}>Nivel de certeza de la IA</Text>
              <Text style={[styles.confianzaNum, { color: semaforo.color }]}>
                {confianzaPct}%
              </Text>
            </View>
            <View style={styles.barraFondo}>
              <View style={[
                styles.barraRelleno,
                {
                  width:           `${confianzaPct}%`,
                  backgroundColor: semaforo.color,
                },
              ]} />
            </View>
          </View>

        </View>

        {/* ── Enfermedad detectada ── */}
        {resultado.resultado_positivo && (
          <View style={styles.seccionCard}>
            <Text style={styles.seccionTitulo}>🦠 Enfermedad detectada</Text>
            <Text style={styles.enfermedadNombre}>{resultado.enfermedad}</Text>
          </View>
        )}

        {/* ── Tratamiento recomendado ── */}
        {/* Viene del campo "tratamiento" de la tabla Enfermedad en la BD */}
        <View style={styles.seccionCard}>
          <Text style={styles.seccionTitulo}>💊 Recomendaciones de tratamiento</Text>
          <Text style={styles.tratamientoTexto}>{resultado.tratamiento}</Text>
        </View>

        {/* ── Aviso importante ── */}
        <View style={styles.avisoCard}>
          <Text style={styles.avisoTexto}>
            ⚠ Este diagnóstico es orientativo. No reemplaza la evaluación de un ingeniero agrónomo certificado.
          </Text>
        </View>

        {/* ── Botones de acción ── */}
        <View style={styles.botonesContainer}>

          {/* Guardar detección — CU-07 */}
          <TouchableOpacity
            style={[styles.btnGuardar, guardado && styles.btnGuardado]}
            onPress={handleGuardar}
            disabled={guardado}
            activeOpacity={0.85}
          >
            <Text style={styles.btnGuardarText}>
              {guardado ? '✅ Guardado' : '💾 Guardar detección'}
            </Text>
          </TouchableOpacity>

          {/* Nuevo escaneo */}
          <TouchableOpacity
            style={styles.btnNuevo}
            onPress={() => navigation.navigate('SeleccionCultivo')}
            activeOpacity={0.85}
          >
            <Text style={styles.btnNuevoText}>📷 Nuevo escaneo</Text>
          </TouchableOpacity>

        </View>

      </ScrollView>
    </View>
  );
};

// ── Componente luz de semáforo ────────────────────────────────
// Muestra las 3 luces del semáforo, solo una activa a la vez
const SemaforoLuz = ({
  color,
  activo,
}: {
  color:  string;
  activo: boolean;
}) => (
  <View style={[
    styles.semaforoLuz,
    {
      backgroundColor: activo ? color : COLORS.border,
      transform:       [{ scale: activo ? 1.3 : 1 }],
    },
  ]} />
);

export default ResultadoScreen;

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: COLORS.bgPrimary,
  },
  scroll: {
    paddingBottom: SPACING.xxl,
  },

  // ── Header
  header: {
    flexDirection:     'row',
    justifyContent:    'space-between',
    alignItems:        'center',
    paddingHorizontal: SPACING.lg,
    paddingTop:        SPACING.xl,
    paddingBottom:     SPACING.md,
  },
  backText: {
    fontSize:   FONT_SIZE.md,
    color:      COLORS.primary,
    fontWeight: FONT_WEIGHT.semibold,
  },
  headerTitulo: {
    fontSize:   FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color:      COLORS.textPrimary,
  },

  // ── Imagen
  imagenContainer: {
    position:         'relative',
    marginHorizontal: SPACING.lg,
    marginBottom:     SPACING.md,
    borderRadius:     RADIUS.xl,
    overflow:         'hidden',
    height:           220,
  },
  imagen: {
    width:  '100%',
    height: '100%',
  },
  badge: {
    position:          'absolute',
    bottom:            SPACING.md,
    right:             SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical:   SPACING.xs,
    borderRadius:      RADIUS.full,
  },
  badgeText: {
    fontSize:   FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color:      COLORS.white,
  },

  // ── Tarjeta resultado
  resultadoCard: {
    marginHorizontal: SPACING.lg,
    marginBottom:     SPACING.md,
    borderRadius:     RADIUS.xl,
    padding:          SPACING.lg,
    borderWidth:      2,
    gap:              SPACING.md,
  },
  semaforoRow: {
    flexDirection:  'row',
    justifyContent: 'center',
    gap:            SPACING.md,
    marginBottom:   SPACING.xs,
  },
  semaforoLuz: {
    width:        28,
    height:       28,
    borderRadius: RADIUS.full,
  },
  resultadoTitulo: {
    fontSize:   FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.extrabold,
    textAlign:  'center',
  },
  resultadoMensaje: {
    fontSize:   FONT_SIZE.md,
    color:      COLORS.textSecondary,
    textAlign:  'center',
    lineHeight: 22,
  },

  // ── Barra de confianza
  confianzaSection: {
    gap: SPACING.sm,
  },
  confianzaHeader: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
  },
  confianzaLabel: {
    fontSize: FONT_SIZE.sm,
    color:    COLORS.textSecondary,
  },
  confianzaNum: {
    fontSize:   FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.extrabold,
  },
  barraFondo: {
    height:          16,
    backgroundColor: COLORS.border,
    borderRadius:    RADIUS.full,
    overflow:        'hidden',
  },
  barraRelleno: {
    height:       '100%',
    borderRadius: RADIUS.full,
  },

  // ── Secciones
  seccionCard: {
    marginHorizontal: SPACING.lg,
    marginBottom:     SPACING.md,
    backgroundColor:  COLORS.bgCard,
    borderRadius:     RADIUS.lg,
    padding:          SPACING.md,
    gap:              SPACING.sm,
    borderWidth:      1,
    borderColor:      COLORS.border,
  },
  seccionTitulo: {
    fontSize:   FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color:      COLORS.textPrimary,
  },
  enfermedadNombre: {
    fontSize:   FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.extrabold,
    color:      COLORS.danger,
  },
  tratamientoTexto: {
    fontSize:   FONT_SIZE.md,
    color:      COLORS.textSecondary,
    lineHeight: 24,
  },

  // ── Aviso
  avisoCard: {
    marginHorizontal: SPACING.lg,
    marginBottom:     SPACING.md,
    backgroundColor:  COLORS.warningLight,
    borderRadius:     RADIUS.lg,
    padding:          SPACING.md,
    borderWidth:      1,
    borderColor:      COLORS.warning,
  },
  avisoTexto: {
    fontSize:   FONT_SIZE.sm,
    color:      COLORS.warning,
    lineHeight: 20,
  },

  // ── Botones
  botonesContainer: {
    marginHorizontal: SPACING.lg,
    gap:              SPACING.md,
  },
  btnGuardar: {
    backgroundColor: COLORS.primary,
    borderRadius:    RADIUS.lg,
    paddingVertical: SPACING.lg,
    alignItems:      'center',
  },
  btnGuardado: {
    backgroundColor: COLORS.successLight,
    borderWidth:     1,
    borderColor:     COLORS.success,
  },
  btnGuardarText: {
    fontSize:   FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color:      COLORS.white,
  },
  btnNuevo: {
    backgroundColor: COLORS.bgCard,
    borderRadius:    RADIUS.lg,
    paddingVertical: SPACING.lg,
    alignItems:      'center',
    borderWidth:     1.5,
    borderColor:     COLORS.primary,
  },
  btnNuevoText: {
    fontSize:   FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color:      COLORS.primary,
  },
});