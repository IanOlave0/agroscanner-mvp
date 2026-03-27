import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Image,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParams } from '../../types';
import { COLORS, FONT_SIZE, FONT_WEIGHT, SPACING, RADIUS } from '../../constants';

const { width, height } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<RootStackParams, 'Welcome'>;
};

const WelcomeScreen = ({ navigation }: Props) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgPrimary} />

      {/* ── Sección superior — Logo y nombre ── */}
      <View style={styles.topSection}>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>🌿</Text>
        </View>

        {/* Nombre de la app */}
        <Text style={styles.appName}>AgroScanner</Text>
        <Text style={styles.tagline}>
          Diagnóstico inteligente{'\n'}para el campo colimense
        </Text>

        {/* Tarjetas de cultivos */}
        <View style={styles.cultivosRow}>
          <CultivoChip emoji="🍋" nombre="Limón" />
          <CultivoChip emoji="🍈" nombre="Papaya" />
          <CultivoChip emoji="🍌" nombre="Plátano" />
        </View>

      </View>

      {/* ── Sección inferior — Botones ── */}
      <View style={styles.bottomSection}>

        {/* Botón principal */}
        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.85}
        >
          <Text style={styles.btnPrimaryText}>INICIAR SESIÓN</Text>
        </TouchableOpacity>

        {/* Botón secundario */}
        <TouchableOpacity
          style={styles.btnSecondary}
          onPress={() => navigation.navigate('Registro')}
          activeOpacity={0.85}
        >
          <Text style={styles.btnSecondaryText}>CREAR CUENTA</Text>
        </TouchableOpacity>

        {/* Botón invitado — muy importante según CU-04 */}
        <TouchableOpacity
          style={styles.btnGuest}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.85}
        >
          <Text style={styles.btnGuestText}>
            📷  Escanear sin cuenta
          </Text>
        </TouchableOpacity>

        {/* Footer */}
        <Text style={styles.footer}>
          Desarrollado por CPI Jaguars · TecNM Colima
        </Text>

      </View>
    </View>
  );
};

// ── Componente pequeño para cada cultivo ──
const CultivoChip = ({
  emoji,
  nombre,
}: {
  emoji: string;
  nombre: string;
}) => (
  <View style={styles.chip}>
    <Text style={styles.chipEmoji}>{emoji}</Text>
    <Text style={styles.chipNombre}>{nombre}</Text>
  </View>
);

export default WelcomeScreen;

// ── Estilos ───────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: COLORS.bgPrimary,
    justifyContent:  'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop:      SPACING.xxl,
    paddingBottom:   SPACING.xl,
  },

  // ── Sección superior
  topSection: {
    flex:       1,
    alignItems: 'center',
    justifyContent: 'center',
    gap:        SPACING.md,
  },
  logoContainer: {
    width:           120,
    height:          120,
    borderRadius:    RADIUS.full,
    backgroundColor: COLORS.bgGreen,
    borderWidth:     3,
    borderColor:     COLORS.primary,
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    SPACING.sm,
  },
  logoEmoji: {
    fontSize: 60,
  },
  appName: {
    fontSize:   FONT_SIZE.xxxl,
    fontWeight: FONT_WEIGHT.extrabold,
    color:      COLORS.primary,
    letterSpacing: 1,
  },
  tagline: {
    fontSize:  FONT_SIZE.lg,
    color:     COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
  },

  // ── Chips de cultivos
  cultivosRow: {
    flexDirection: 'row',
    gap:           SPACING.sm,
    marginTop:     SPACING.md,
  },
  chip: {
    alignItems:      'center',
    backgroundColor: COLORS.bgCard,
    borderRadius:    RADIUS.lg,
    borderWidth:     1,
    borderColor:     COLORS.border,
    paddingVertical:   SPACING.sm,
    paddingHorizontal: SPACING.md,
    gap:             4,
  },
  chipEmoji: {
    fontSize: 28,
  },
  chipNombre: {
    fontSize:   FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color:      COLORS.textSecondary,
  },

  // ── Sección inferior — botones
  bottomSection: {
    gap: SPACING.md,
  },
  btnPrimary: {
    backgroundColor: COLORS.primary,
    borderRadius:    RADIUS.lg,
    paddingVertical: SPACING.lg,
    alignItems:      'center',
  },
  btnPrimaryText: {
    fontSize:      FONT_SIZE.lg,
    fontWeight:    FONT_WEIGHT.bold,
    color:         COLORS.textWhite,
    letterSpacing: 1.5,
  },
  btnSecondary: {
    backgroundColor: COLORS.bgCard,
    borderRadius:    RADIUS.lg,
    paddingVertical: SPACING.lg,
    alignItems:      'center',
    borderWidth:     2,
    borderColor:     COLORS.primary,
  },
  btnSecondaryText: {
    fontSize:      FONT_SIZE.lg,
    fontWeight:    FONT_WEIGHT.bold,
    color:         COLORS.primary,
    letterSpacing: 1.5,
  },
  btnGuest: {
    backgroundColor: COLORS.bgGreen,
    borderRadius:    RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems:      'center',
    borderWidth:     1,
    borderColor:     COLORS.primaryLight,
  },
  btnGuestText: {
    fontSize:   FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color:      COLORS.primary,
  },
  footer: {
    fontSize:  FONT_SIZE.xs,
    color:     COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
});