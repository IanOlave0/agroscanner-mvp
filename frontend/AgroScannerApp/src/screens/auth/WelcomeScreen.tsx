/**
 * @file src/screens/auth/WelcomeScreen.tsx
 * @description Pantalla de bienvenida (landing) de AgroScanner.
 * Presenta la marca, los cultivos soportados y las opciones de acceso:
 * iniciar sesión, crear cuenta, demo o acceso como invitado.
 *
 * Migración UI/UX:
 * - Layout reemplazado de View/StyleSheet a stacks de Tamagui (YStack, XStack).
 * - Tipografía y colores utilizan tokens del tema de Tamagui.
 * - Botones envueltos en TouchableOpacity nativo (interactividad) con
 *   layout visual en YStack (evita limitaciones de Button en Tamagui v3 RC).
 * - Animaciones de entrada preservadas vía Animated API de React Native.
 *
 * @author AgroScanner Team
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  StatusBar, Animated, Image, ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { YStack, XStack, Text } from 'tamagui';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParams } from '../../types';
import { COLORS, SHADOW } from '../../constants';
import { seedMockUser } from '../../database/seedData';

// ── Tipos de props ─────────────────────────────────────────────────
type Props = {
  navigation: NativeStackNavigationProp<RootStackParams, 'Welcome'>;
};

// ── Componente principal ───────────────────────────────────────────
const WelcomeScreen = ({ navigation }: Props) => {
  // Referencias de animación para entrada suave (fade, slide, scale)
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

  /**
   * Inicializa un usuario de demostración en la base de datos local
   * y navega al panel principal (Home).
   */
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
    <YStack flex={1} bg="$bgPrimary" px="$lg" pt="$xl" pb="$xl" overflow="hidden" justifyContent="space-between">
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgPrimary} />

      {/* ── Elementos decorativos de fondo ───────────────────────── */}
      <YStack position="absolute" top={-80} right={-80} width={240} height={240} borderRadius={120} bg="$primaryBg" opacity={0.8} />
      <YStack position="absolute" bottom={-60} left={-60} width={200} height={200} borderRadius={100} bg="$acentoLight" opacity={0.6} />

      {/* ── Sección de logo y marca ──────────────────────────────── */}
      <Animated.View style={{
        flex: 1,
        opacity: fadeAnim,
        transform: [
          { translateY: slideAnim },
          { scale: scaleAnim },
        ],
      }}>
        <YStack flex={1} alignItems="center" justifyContent="center" gap="$md">
          {/* Contenedor circular del logo institucional (jaguar) */}
          <YStack width={130} height={130} borderRadius="$full" bg="$bgCard" alignItems="center" justifyContent="center" borderWidth={3} borderColor="$primary" style={SHADOW.lg} mb="$sm">
            <Image
              source={require('../../../assets/jaguar.png')}
              style={{ width: 100, height: 100 }}
              resizeMode="contain"
            />
          </YStack>

          {/* Nombre de la aplicación */}
          <Text fontSize={36} fontWeight="800" color="$primary" letterSpacing={1}>
            AgroScanner
          </Text>

          {/* Eslogan / descripción del servicio */}
          <Text fontSize={18} color="$textSecondary" textAlign="center" lineHeight={26}>
            Diagnóstico inteligente{'\n'}para el campo colimense
          </Text>

          {/* ── Chips de cultivos soportados ─────────────────────── */}
          <XStack gap="$sm" mt="$md">
            <CultivoChip emoji="🍋" nombre="Limón" color="#F9A825" />
            <CultivoChip emoji="🍈" nombre="Papaya" color="#E65100" />
            <CultivoChip emoji="🍌" nombre="Plátano" color="#2E7D32" />
          </XStack>
        </YStack>
      </Animated.View>

      {/* ── Sección de botones de acción ─────────────────────────── */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <YStack gap="$md">

          {/* Botón: Iniciar sesión */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.85}
          >
            <YStack bg="$primary" borderRadius="$xl" py="$lg" alignItems="center" style={SHADOW.lg}>
              <Text color="$white" fontSize={18} fontWeight="800" letterSpacing={2}>
                INICIAR SESIÓN
              </Text>
            </YStack>
          </TouchableOpacity>

          {/* Botón: Crear cuenta */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Registro')}
            activeOpacity={0.85}
          >
            <YStack bg="$bgCard" borderRadius="$xl" py="$lg" alignItems="center" borderWidth={2} borderColor="$primary" style={SHADOW.sm}>
              <Text color="$primary" fontSize={18} fontWeight="800" letterSpacing={2}>
                CREAR CUENTA
              </Text>
            </YStack>
          </TouchableOpacity>

          {/* Botón: Modo demostración */}
          <TouchableOpacity
            onPress={handleDemo}
            activeOpacity={0.85}
            disabled={loading}
          >
            <YStack bg="$bgCard" borderRadius="$xl" py="$lg" alignItems="center" borderWidth={2} borderColor="$acento" style={{ ...SHADOW.sm, borderStyle: 'dashed' }}>
              {loading ? (
                <ActivityIndicator color={COLORS.primary} />
              ) : (
                <Text color="$acentoDark" fontSize={18} fontWeight="800" letterSpacing={1}>
                    Iniciar como Demo
                </Text>
              )}
            </YStack>
          </TouchableOpacity>

          {/* Botón: Acceso como invitado (sin cuenta) */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.85}
          >
            <YStack bg="$acentoLight" borderRadius="$xl" py="$md" alignItems="center" borderWidth={1.5} borderColor="$acento">
              <Text color="$acentoDark" fontSize={16} fontWeight="700">
                  Escanear sin cuenta
              </Text>
            </YStack>
          </TouchableOpacity>

          {/* Créditos institucionales */}
          <Text fontSize={12} color="$textMuted" textAlign="center" mt="$xs">
            CPI Jaguars · TecNM Instituto Tecnológico de Colima
          </Text>

        </YStack>
      </Animated.View>
    </YStack>
  );
};

// ── Subcomponente: Chip de cultivo ─────────────────────────────────
/**
 * Representa visualmente un cultivo soportado con emoji y nombre.
 *
 * @param emoji  Emoji representativo del cultivo.
 * @param nombre Nombre del cultivo (ej. "Limón").
 * @param color  Código HEX del color de acento para el borde y texto.
 */
const CultivoChip = ({
  emoji, nombre, color,
}: {
  emoji: string; nombre: string; color: string;
}) => (
  <YStack alignItems="center" bg="$bgCard" borderRadius="$lg" borderWidth={1.5} borderColor={color + '60'} py="$sm" px="$md" gap={4} style={SHADOW.sm}>
    <Text fontSize={28}>{emoji}</Text>
    <Text fontSize={14} fontWeight="700" color={color}>
      {nombre}
    </Text>
  </YStack>
);

export default WelcomeScreen;
