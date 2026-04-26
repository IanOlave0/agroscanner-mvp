import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { COLORS, FONT_SIZE, FONT_WEIGHT, SPACING, RADIUS, CULTIVOS } from '../../constants';

type TabParams = {
  Home: undefined;
  Scanner: undefined;
  Historial: undefined;
  Mapa: undefined;
  Perfil: undefined;
};

const HomeScreen = () => {
  const navigation = useNavigation<BottomTabNavigationProp<TabParams>>();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgPrimary} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >

        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.saludo}>Buenos días 👋</Text>
            <Text style={styles.titulo}>¿Qué vamos a{'\n'}analizar hoy?</Text>
          </View>
          <TouchableOpacity
            style={styles.perfilBtn}
            onPress={() => navigation.navigate('Perfil')}
          >
            <Text style={styles.perfilEmoji}>👤</Text>
          </TouchableOpacity>
        </View>

        {/* ── Banner offline ── */}
        <View style={styles.bannerOffline}>
          <Text style={styles.bannerEmoji}>📡</Text>
          <View style={styles.bannerTexto}>
            <Text style={styles.bannerTitulo}>Modo sin conexión disponible</Text>
            <Text style={styles.bannerSubtitulo}>
              La IA funciona directo en tu celular
            </Text>
          </View>
        </View>

        {/* ── Título sección cultivos ── */}
        <Text style={styles.seccionTitulo}>Selecciona tu cultivo</Text>

        {/* ── Tarjetas de cultivos ── */}
        <View style={styles.cultivosContainer}>

          <TarjetaCultivo
            emoji={CULTIVOS.limon.emoji}
            nombre={CULTIVOS.limon.nombre}
            enfermedad={CULTIVOS.limon.enfermedad}
            color={CULTIVOS.limon.color}
            colorFondo={CULTIVOS.limon.colorFondo}
            onPress={() => navigation.navigate('Scanner')}
          />

          <TarjetaCultivo
            emoji={CULTIVOS.papaya.emoji}
            nombre={CULTIVOS.papaya.nombre}
            enfermedad={CULTIVOS.papaya.enfermedad}
            color={CULTIVOS.papaya.color}
            colorFondo={CULTIVOS.papaya.colorFondo}
            onPress={() => navigation.navigate('Scanner')}
          />

          <TarjetaCultivo
            emoji={CULTIVOS.platano.emoji}
            nombre={CULTIVOS.platano.nombre}
            enfermedad={CULTIVOS.platano.enfermedad}
            color={CULTIVOS.platano.color}
            colorFondo={CULTIVOS.platano.colorFondo}
            onPress={() => navigation.navigate('Scanner')}
          />

        </View>

        {/* ── Sección estadísticas rápidas ── */}
        <Text style={styles.seccionTitulo}>Resumen de hoy</Text>
        <View style={styles.statsRow}>
          <StatCard emoji="🔍" numero="0" label="Escaneos" color={COLORS.primary} />
          <StatCard emoji="⚠️" numero="0" label="Alertas"  color={COLORS.danger} />
          <StatCard emoji="✅" numero="0" label="Sanas"    color={COLORS.success} />
        </View>

        {/* ── Acceso rápido ── */}
        <Text style={styles.seccionTitulo}>Acceso rápido</Text>
        <View style={styles.accesoRow}>

          <TouchableOpacity
            style={styles.accesoBtn}
            onPress={() => navigation.navigate('Historial')}
            activeOpacity={0.85}
          >
            <Text style={styles.accesoEmoji}>📋</Text>
            <Text style={styles.accesoLabel}>Ver historial</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.accesoBtn}
            onPress={() => navigation.navigate('Mapa')}
            activeOpacity={0.85}
          >
            <Text style={styles.accesoEmoji}>🗺️</Text>
            <Text style={styles.accesoLabel}>Mapa de calor</Text>
          </TouchableOpacity>

        </View>

      </ScrollView>
    </View>
  );
};

// ── Tarjeta de cultivo ────────────────────
const TarjetaCultivo = ({
  emoji, nombre, enfermedad, color, colorFondo, onPress,
}: {
  emoji: string; nombre: string; enfermedad: string;
  color: string; colorFondo: string; onPress: () => void;
}) => (
  <TouchableOpacity
    style={[styles.tarjeta, { borderLeftColor: color, borderLeftWidth: 5 }]}
    onPress={onPress}
    activeOpacity={0.85}
  >
    <View style={[styles.tarjetaEmojiBg, { backgroundColor: colorFondo }]}>
      <Text style={styles.tarjetaEmoji}>{emoji}</Text>
    </View>
    <View style={styles.tarjetaInfo}>
      <Text style={styles.tarjetaNombre}>{nombre}</Text>
      <Text style={styles.tarjetaEnfermedad}>Detecta: {enfermedad}</Text>
    </View>
    <Text style={styles.tarjetaFlecha}>›</Text>
  </TouchableOpacity>
);

// ── Tarjeta de estadística ────────────────
const StatCard = ({
  emoji, numero, label, color,
}: {
  emoji: string; numero: string; label: string; color: string;
}) => (
  <View style={[styles.statCard, { borderTopColor: color, borderTopWidth: 3 }]}>
    <Text style={styles.statEmoji}>{emoji}</Text>
    <Text style={[styles.statNumero, { color }]}>{numero}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: COLORS.bgPrimary,
  },
  scroll: {
    paddingHorizontal: SPACING.lg,
    paddingTop:        SPACING.xl,
    paddingBottom:     SPACING.xxl,
    gap:               SPACING.md,
  },
  header: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
    marginBottom:   SPACING.sm,
  },
  saludo: {
    fontSize: FONT_SIZE.md,
    color:    COLORS.textSecondary,
  },
  titulo: {
    fontSize:   FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.extrabold,
    color:      COLORS.textPrimary,
    lineHeight: 36,
    marginTop:  SPACING.xs,
  },
  perfilBtn: {
    width:           48,
    height:          48,
    borderRadius:    RADIUS.full,
    backgroundColor: COLORS.bgGreen,
    borderWidth:     2,
    borderColor:     COLORS.primary,
    alignItems:      'center',
    justifyContent:  'center',
  },
  perfilEmoji: { fontSize: 22 },
  bannerOffline: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: COLORS.bgGreen,
    borderRadius:    RADIUS.md,
    padding:         SPACING.md,
    gap:             SPACING.md,
    borderWidth:     1,
    borderColor:     COLORS.primaryLight,
  },
  bannerEmoji:    { fontSize: 28 },
  bannerTexto:    { flex: 1 },
  bannerTitulo: {
    fontSize:   FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color:      COLORS.primary,
  },
  bannerSubtitulo: {
    fontSize: FONT_SIZE.sm,
    color:    COLORS.textSecondary,
  },
  seccionTitulo: {
    fontSize:   FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color:      COLORS.textPrimary,
    marginTop:  SPACING.sm,
  },
  cultivosContainer: { gap: SPACING.sm },
  tarjeta: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: COLORS.bgCard,
    borderRadius:    RADIUS.lg,
    padding:         SPACING.md,
    gap:             SPACING.md,
    elevation:       2,
  },
  tarjetaEmojiBg: {
    width:          64,
    height:         64,
    borderRadius:   RADIUS.md,
    alignItems:     'center',
    justifyContent: 'center',
  },
  tarjetaEmoji:  { fontSize: 36 },
  tarjetaInfo:   { flex: 1, gap: 4 },
  tarjetaNombre: {
    fontSize:   FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color:      COLORS.textPrimary,
  },
  tarjetaEnfermedad: {
    fontSize: FONT_SIZE.sm,
    color:    COLORS.textSecondary,
  },
  tarjetaFlecha: {
    fontSize:   FONT_SIZE.xxl,
    color:      COLORS.textMuted,
    fontWeight: FONT_WEIGHT.bold,
  },
  statsRow: {
    flexDirection: 'row',
    gap:           SPACING.sm,
  },
  statCard: {
    flex:            1,
    backgroundColor: COLORS.bgCard,
    borderRadius:    RADIUS.md,
    padding:         SPACING.md,
    alignItems:      'center',
    gap:             4,
    elevation:       1,
  },
  statEmoji:  { fontSize: 22 },
  statNumero: {
    fontSize:   FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.extrabold,
  },
  statLabel: {
    fontSize: FONT_SIZE.xs,
    color:    COLORS.textMuted,
  },
  accesoRow: {
    flexDirection: 'row',
    gap:           SPACING.sm,
  },
  accesoBtn: {
    flex:            1,
    backgroundColor: COLORS.bgCard,
    borderRadius:    RADIUS.lg,
    padding:         SPACING.md,
    alignItems:      'center',
    gap:             SPACING.sm,
    borderWidth:     1,
    borderColor:     COLORS.border,
  },
  accesoEmoji: { fontSize: 32 },
  accesoLabel: {
    fontSize:   FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color:      COLORS.textSecondary,
    textAlign:  'center',
  },
});