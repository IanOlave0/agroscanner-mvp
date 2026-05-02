import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, Animated, Image, ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParams } from '../../types';
import { COLORS, FONT_SIZE, FONT_WEIGHT, SPACING, RADIUS, SHADOW } from '../../constants';
import { seedMockUser } from '../../database/seedData';


type Props = {
  navigation: NativeStackNavigationProp<RootStackParams, 'Welcome'>;
};

const WelcomeScreen = ({ navigation }: Props) => {
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const [loading, setLoading] = useState(false);

  useEffect(() => {
  Animated.parallel([
    Animated.timing(fadeAnim, {
      toValue:         1,
      duration:        800,
      useNativeDriver: true,
    }),
    Animated.timing(slideAnim, {
      toValue:         0,
      duration:        800,
      useNativeDriver: true,
    }),
    Animated.spring(scaleAnim, {
      toValue:         1,
      tension:         50,
      friction:        7,
      useNativeDriver: true,
    }),
  ]).start();
}, []);

  const handleDemo = async () => {
    try {
      setLoading(true);
      await seedMockUser();
      navigation.replace('Home');
    } catch (error) {
      console.error('[WelcomeScreen] Error al iniciar demo:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgPrimary} />

      {/* Círculos decorativos de fondo */}
      <View style={styles.circuloTop} />
      <View style={styles.circuloBottom} />

      {/* ── Sección logo ── */}
      <Animated.View style={[
        styles.logoSection,
        {
          opacity:   fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
        },
      ]}>
        {/* Logo del jaguar */}
        <View style={styles.logoContainer}>
          <Image
  source={require('../../../assets/jaguar.png')}
  style={styles.logoImage}
  resizeMode="contain"
/>
        </View>

        <Text style={styles.appName}>AgroScanner</Text>
        <Text style={styles.tagline}>
          Diagnóstico inteligente{'\n'}para el campo colimense
        </Text>

        {/* Chips de cultivos */}
        <View style={styles.cultivosRow}>
          <CultivoChip emoji="🍋" nombre="Limón" color="#F9A825" />
          <CultivoChip emoji="🍈" nombre="Papaya" color="#E65100" />
          <CultivoChip emoji="🍌" nombre="Plátano" color="#2E7D32" />
        </View>
      </Animated.View>

      {/* ── Botones ── */}
      <Animated.View style={[styles.botonesSection, { opacity: fadeAnim }]}>

        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.85}
        >
          <Text style={styles.btnPrimaryText}>INICIAR SESIÓN</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnSecondary}
          onPress={() => navigation.navigate('Registro')}
          activeOpacity={0.85}
        >
          <Text style={styles.btnSecondaryText}>CREAR CUENTA</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnDemo}
          onPress={handleDemo}
          activeOpacity={0.85}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.primary} />
          ) : (
            <Text style={styles.btnDemoText}>👨‍🌾 Iniciar como Demo</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnGuest}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.85}
        >
          <Text style={styles.btnGuestText}>📷 Escanear sin cuenta</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          CPI Jaguars · TecNM Instituto Tecnológico de Colima
        </Text>

      </Animated.View>
    </View>
  );
};

const CultivoChip = ({
  emoji, nombre, color,
}: {
  emoji: string; nombre: string; color: string;
}) => (
  <View style={[styles.chip, { borderColor: color + '60' }]}>
    <Text style={styles.chipEmoji}>{emoji}</Text>
    <Text style={[styles.chipNombre, { color }]}>{nombre}</Text>
  </View>
);

export default WelcomeScreen;

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: COLORS.bgPrimary,
    justifyContent:  'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop:      SPACING.xl,
    paddingBottom:   SPACING.xl,
    overflow:        'hidden',
  },

  // ── Círculos decorativos
  circuloTop: {
    position:        'absolute',
    top:             -80,
    right:           -80,
    width:           240,
    height:          240,
    borderRadius:    120,
    backgroundColor: COLORS.primaryBg,
    opacity:         0.8,
  },
  circuloBottom: {
    position:        'absolute',
    bottom:          -60,
    left:            -60,
    width:           200,
    height:          200,
    borderRadius:    100,
    backgroundColor: COLORS.acentoLight,
    opacity:         0.6,
  },

  // ── Logo
  logoSection: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    gap:            SPACING.md,
  },
  logoContainer: {
    width:           130,
    height:          130,
    borderRadius:    RADIUS.full,
    backgroundColor: COLORS.bgCard,
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     3,
    borderColor:     COLORS.primary,
    ...SHADOW.lg,
    marginBottom:    SPACING.sm,
  },
  logoImage: {
    width:  100,
    height: 100,
  },
  appName: {
    fontSize:      FONT_SIZE.xxxl,
    fontWeight:    FONT_WEIGHT.extrabold,
    color:         COLORS.primary,
    letterSpacing: 1,
  },
  tagline: {
    fontSize:   FONT_SIZE.lg,
    color:      COLORS.textSecondary,
    textAlign:  'center',
    lineHeight: 26,
  },

  // ── Chips
  cultivosRow: {
    flexDirection: 'row',
    gap:           SPACING.sm,
    marginTop:     SPACING.md,
  },
  chip: {
    alignItems:        'center',
    backgroundColor:   COLORS.bgCard,
    borderRadius:      RADIUS.lg,
    borderWidth:       1.5,
    paddingVertical:   SPACING.sm,
    paddingHorizontal: SPACING.md,
    gap:               4,
    ...SHADOW.sm,
  },
  chipEmoji:  { fontSize: 28 },
  chipNombre: {
    fontSize:   FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
  },

  // ── Botones
  botonesSection: {
    gap: SPACING.md,
  },
  btnPrimary: {
    backgroundColor: COLORS.primary,
    borderRadius:    RADIUS.xl,
    paddingVertical: SPACING.lg,
    alignItems:      'center',
    ...SHADOW.lg,
  },
  btnPrimaryText: {
    fontSize:      FONT_SIZE.lg,
    fontWeight:    FONT_WEIGHT.extrabold,
    color:         COLORS.white,
    letterSpacing: 2,
  },
  btnSecondary: {
    backgroundColor: COLORS.bgCard,
    borderRadius:    RADIUS.xl,
    paddingVertical: SPACING.lg,
    alignItems:      'center',
    borderWidth:     2,
    borderColor:     COLORS.primary,
    ...SHADOW.sm,
  },
  btnSecondaryText: {
    fontSize:      FONT_SIZE.lg,
    fontWeight:    FONT_WEIGHT.extrabold,
    color:         COLORS.primary,
    letterSpacing: 2,
  },
  btnDemo: {
    backgroundColor: COLORS.bgCard,
    borderRadius:    RADIUS.xl,
    paddingVertical: SPACING.lg,
    alignItems:      'center',
    borderWidth:     2,
    borderColor:     COLORS.acento,
    borderStyle:     'dashed',
    ...SHADOW.sm,
  },
  btnDemoText: {
    fontSize:      FONT_SIZE.lg,
    fontWeight:    FONT_WEIGHT.extrabold,
    color:         COLORS.acentoDark,
    letterSpacing: 1,
  },
  btnGuest: {
    backgroundColor: COLORS.acentoLight,
    borderRadius:    RADIUS.xl,
    paddingVertical: SPACING.md,
    alignItems:      'center',
    borderWidth:     1.5,
    borderColor:     COLORS.acento,
  },
  btnGuestText: {
    fontSize:   FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color:      COLORS.acentoDark,
  },
  footer: {
    fontSize:  FONT_SIZE.xs,
    color:     COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
});