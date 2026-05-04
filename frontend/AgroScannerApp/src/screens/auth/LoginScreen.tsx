/**
 * @file src/screens/auth/LoginScreen.tsx
 * @description Pantalla de inicio de sesión (Login).
 * Permite al agricultor autenticarse con correo y contraseña,
 * o acceder como invitado para escanear sin cuenta.
 *
 * Migración UI/UX:
 * - Layout reemplazado de View/StyleSheet a stacks de Tamagui (YStack, XStack).
 * - Inputs nativos reemplazados por componente Input de Tamagui.
 * - Iconos de emojis migrados a vectoriales de Lucide React Native.
 * - Agregado SafeAreaView para proteger notch/barra de estado.
 * - KeyboardAvoidingView preservado para compatibilidad con teclado en iOS.
 *
 * @author AgroScanner Team
 */

import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { YStack, XStack, Text, Input } from 'tamagui';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParams } from '../../types';
import { COLORS, SHADOW } from '../../constants';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParams, 'Login'>;
};

const LoginScreen = ({ navigation }: Props) => {
  const [correo,    setCorreo]    = useState('');
  const [password,  setPassword]  = useState('');
  const [verPwd,    setVerPwd]    = useState(false);
  const [cargando,  setCargando]  = useState(false);
  const [errCorreo, setErrCorreo] = useState('');
  const [errPwd,    setErrPwd]    = useState('');

  /**
   * Valida los campos del formulario antes de enviar.
   * @returns true si ambos campos son válidos.
   */
  const validar = (): boolean => {
    let valido = true;
    if (!correo.includes('@')) {
      setErrCorreo('Ingresa un correo válido');
      valido = false;
    } else { setErrCorreo(''); }
    if (password.length < 6) {
      setErrPwd('Mínimo 6 caracteres');
      valido = false;
    } else { setErrPwd(''); }
    return valido;
  };

  /**
   * Handler de envío del formulario de login.
   * Simula autenticación con timeout y navega al Home.
   */
  const handleLogin = async () => {
    if (!validar()) return;
    setCargando(true);
    await new Promise<void>(r => setTimeout(r, 1000));
    setCargando(false);
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bgPrimary }} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgPrimary} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 32, paddingBottom: 48 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          {/* ── Botón regresar ─────────────────────────────────── */}
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <XStack alignItems="center" gap="$xs" mb="$lg">
              <ChevronLeft size={20} color={COLORS.primary} />
              <Text fontSize={16} fontWeight="600" color="$primary">
                Regresar
              </Text>
            </XStack>
          </TouchableOpacity>

          {/* ── Header: logo + título ──────────────────────────── */}
          <YStack alignItems="center" mb="$xl" gap="$sm">
            <YStack width={90} height={90} borderRadius="$full" bg="$bgCard" alignItems="center" justifyContent="center" borderWidth={2.5} borderColor="$primary" style={SHADOW.md}>
              <Image source={require('../../../assets/logo/jaguar.png')} style={{ width: 65, height: 65 }} resizeMode="contain" />
            </YStack>
            <Text fontSize={28} fontWeight="800" color="$primary">
              AgroScanner
            </Text>
            <Text fontSize={16} color="$textSecondary">
              Bienvenido de vuelta
            </Text>
          </YStack>

          {/* ── Formulario ─────────────────────────────────────── */}
          <YStack gap="$md" mb="$xl">

            {/* Campo: Correo */}
            <YStack gap="$xs">
              <Text fontSize={16} fontWeight="600" color="$primary">
                Correo Electrónico
              </Text>
              <Input
                placeholder="agricultor@ejemplo.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={correo}
                onChangeText={setCorreo}
                borderWidth={1.5}
                borderRadius="$lg"
                py="$md"
                px="$md"
                fontSize={16}
                color="$textPrimary"
                bg="$bgCard"
                style={{ ...SHADOW.sm, borderColor: errCorreo ? COLORS.danger : COLORS.border }}
              />
              {errCorreo ? (
                <Text fontSize={14} color="$danger">
                  {errCorreo}
                </Text>
              ) : null}
            </YStack>

            {/* Campo: Contraseña */}
            <YStack gap="$xs">
              <Text fontSize={16} fontWeight="600" color="$primary">
                Contraseña
              </Text>
              <YStack position="relative">
                <Input
                  placeholder="••••••••••"
                  secureTextEntry={!verPwd}
                  value={password}
                  onChangeText={setPassword}
                  borderWidth={1.5}
                  borderRadius="$lg"
                  py="$md"
                  px="$md"
                  pr="$xxl"
                  fontSize={16}
                  color="$textPrimary"
                  bg="$bgCard"
                  style={{ ...SHADOW.sm, borderColor: errPwd ? COLORS.danger : COLORS.border }}
                />
                <TouchableOpacity
                  style={{ position: 'absolute', right: 16, top: '25%' }}
                  onPress={() => setVerPwd(v => !v)}
                  activeOpacity={0.7}
                >
                  {verPwd ? (
                    <EyeOff size={20} color={COLORS.textMuted} />
                  ) : (
                    <Eye size={20} color={COLORS.textMuted} />
                  )}
                </TouchableOpacity>
              </YStack>
              {errPwd ? (
                <Text fontSize={14} color="$danger">
                  {errPwd}
                </Text>
              ) : null}
            </YStack>

          </YStack>

          {/* ── Botón: Iniciar sesión ──────────────────────────── */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={cargando}
            activeOpacity={0.85}
          >
            <YStack
              bg="$primary"
              borderRadius="$xl"
              py="$lg"
              alignItems="center"
              style={SHADOW.lg}
              opacity={cargando ? 0.7 : 1}
            >
              {cargando ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <Text fontSize={18} fontWeight="800" color="$white" letterSpacing={2}>
                  INICIAR SESIÓN
                </Text>
              )}
            </YStack>
          </TouchableOpacity>

          {/* ── Enlace: Registro ───────────────────────────────── */}
          <XStack justifyContent="center" mt="$md" mb="$xl">
            <Text fontSize={16} color="$textSecondary">
              ¿No tienes cuenta?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Registro')}>
              <Text fontSize={16} fontWeight="700" color="$primary">
                Regístrate aquí
              </Text>
            </TouchableOpacity>
          </XStack>

          {/* ── Separador ──────────────────────────────────────── */}
          <XStack alignItems="center" gap="$sm" mb="$md">
            <YStack flex={1} height={1} bg="$border" />
            <Text fontSize={14} color="$textMuted">
              o continúa sin cuenta
            </Text>
            <YStack flex={1} height={1} bg="$border" />
          </XStack>

          {/* ── Botón: Invitado ────────────────────────────────── */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.85}
          >
            <YStack
              bg="$acentoLight"
              borderRadius="$xl"
              py="$md"
              alignItems="center"
              borderWidth={1.5}
              borderColor="$acento"
            >
              <Text fontSize={16} fontWeight="700" color="$acentoDark">
                Escanear sin cuenta
              </Text>
            </YStack>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
