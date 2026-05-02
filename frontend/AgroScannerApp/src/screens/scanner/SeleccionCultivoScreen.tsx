import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParams } from '../../types';
import {
  COLORS, FONT_SIZE, FONT_WEIGHT,
  SPACING, RADIUS, CULTIVOS,
} from '../../constants';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParams, 'SeleccionCultivo'>;
};

const SeleccionCultivoScreen = ({ navigation }: Props) => {

  const cultivos = [
    CULTIVOS.limon,
    CULTIVOS.papaya,
    CULTIVOS.platano,
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgPrimary} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.titulo}>Seleccionar cultivo</Text>
          <Text style={styles.subtitulo}>
            Elige el cultivo antes de tomar la foto de la hoja
          </Text>
        </View>

        {/* ── Instrucciones ── */}
        <View style={styles.instrucciones}>
          <Text style={styles.instruccionesTitle}>📸 ¿Cómo tomar la foto?</Text>
          <Text style={styles.instruccionesTexto}>
            • Enfoca una sola hoja{'\n'}
            • Busca buena iluminación natural{'\n'}
            • Mantén el celular estable{'\n'}
            • La hoja debe ocupar la mayor parte de la pantalla
          </Text>
        </View>

        {/* ── Tarjetas de cultivos ── */}
        <Text style={styles.seccionTitulo}>¿Qué cultivo vas a analizar?</Text>

        <View style={styles.cultivosContainer}>
          {cultivos.map((cultivo) => (
            <TouchableOpacity
              key={cultivo.id}
              style={styles.tarjeta}
              onPress={() => navigation.navigate('Camara', {
                cultivoId:     cultivo.id,
                cultivoNombre: cultivo.nombre,
              })}
              activeOpacity={0.85}
            >
              {/* Emoji grande y fondo de color */}
              <View style={[
                styles.emojiContainer,
                { backgroundColor: cultivo.colorFondo },
              ]}>
                <Text style={styles.emoji}>{cultivo.emoji}</Text>
              </View>

              {/* Info del cultivo */}
              <View style={styles.info}>
                <Text style={styles.nombre}>{cultivo.nombre}</Text>
                <Text style={styles.descripcion}>{cultivo.descripcion}</Text>
                <View style={[
                  styles.enfermBadge,
                  { backgroundColor: cultivo.colorFondo },
                ]}>
                  <Text style={[
                    styles.enfermText,
                    { color: cultivo.color },
                  ]}>
                    ⚠ {cultivo.enfermedad}
                  </Text>
                </View>
              </View>

              {/* Flecha */}
              <Text style={[styles.flecha, { color: cultivo.color }]}>›</Text>

            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default SeleccionCultivoScreen;

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: COLORS.bgPrimary,
  },
  scroll: {
    paddingHorizontal: SPACING.lg,
    paddingTop:        SPACING.xl,
    paddingBottom:     SPACING.xxl,
    gap:               SPACING.lg,
  },

  // ── Header
  header: {
    gap: SPACING.xs,
  },
  titulo: {
    fontSize:   FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.extrabold,
    color:      COLORS.textPrimary,
  },
  subtitulo: {
    fontSize:   FONT_SIZE.md,
    color:      COLORS.textSecondary,
    lineHeight: 22,
  },

  // ── Instrucciones
  instrucciones: {
    backgroundColor: COLORS.bgGreen,
    borderRadius:    RADIUS.lg,
    padding:         SPACING.md,
    gap:             SPACING.sm,
    borderWidth:     1,
    borderColor:     COLORS.primaryLight,
  },
  instruccionesTitle: {
    fontSize:   FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color:      COLORS.primary,
  },
  instruccionesTexto: {
    fontSize:   FONT_SIZE.sm,
    color:      COLORS.textSecondary,
    lineHeight: 24,
  },

  // ── Sección
  seccionTitulo: {
    fontSize:   FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color:      COLORS.textPrimary,
  },

  // ── Tarjetas
  cultivosContainer: {
    gap: SPACING.md,
  },
  tarjeta: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: COLORS.bgCard,
    borderRadius:    RADIUS.xl,
    padding:         SPACING.md,
    gap:             SPACING.md,
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 2 },
    shadowOpacity:   0.08,
    shadowRadius:    6,
    elevation:       3,
  },
  emojiContainer: {
    width:          80,
    height:         80,
    borderRadius:   RADIUS.lg,
    alignItems:     'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 44,
  },
  info: {
    flex: 1,
    gap:  SPACING.xs,
  },
  nombre: {
    fontSize:   FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color:      COLORS.textPrimary,
  },
  descripcion: {
    fontSize:   FONT_SIZE.sm,
    color:      COLORS.textSecondary,
    lineHeight: 18,
  },
  enfermBadge: {
    alignSelf:       'flex-start',
    borderRadius:    RADIUS.full,
    paddingVertical:   4,
    paddingHorizontal: SPACING.sm,
    marginTop:       4,
  },
  enfermText: {
    fontSize:   FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semibold,
  },
  flecha: {
    fontSize:   FONT_SIZE.xxxl,
    fontWeight: FONT_WEIGHT.bold,
  },
});