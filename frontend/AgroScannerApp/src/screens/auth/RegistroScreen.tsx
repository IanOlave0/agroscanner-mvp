/**
 * @file src/screens/auth/RegistroScreen.tsx
 * @description Pantalla de registro de nuevo usuario.
 * Permite crear una cuenta con nombre, correo y contraseña.
 *
 * Migración UI/UX:
 * - Layout reemplazado de View/StyleSheet a stacks de Tamagui (YStack, XStack).
 * - Inputs nativos reemplazados por componente Input de Tamagui.
 * - Iconos de emojis migrados a vectoriales de Lucide React Native.
 * - Agregado SafeAreaView para proteger notch/barra de estado.
 * - Eliminados campos redundantes (ubicación y nombre de parcela)
 *   que se gestionan en flujos posteriores de la app.
 *
 * @author AgroScanner Team
 */

import React, { useState, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { YStack, XStack, Text, Input } from 'tamagui';
import { ChevronLeft, Eye, EyeOff, MapPin } from 'lucide-react-native';
import * as Location from 'expo-location';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParams } from '../../types';
import { COLORS, SHADOW } from '../../constants';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParams, 'Registro'>;
};

const RegistroScreen = ({ navigation }: Props) => {
  const [nombre,       setNombre]       = useState('');
  const [correo,       setCorreo]       = useState('');
  const [telefono,     setTelefono]     = useState('');
  const [zonaAgricola, setZonaAgricola] = useState('');
  const [password,     setPassword]     = useState('');
  const [confirmPwd,   setConfirmPwd]   = useState('');
  const [verPwd,       setVerPwd]       = useState(false);
  const [cargando,     setCargando]     = useState(false);
  const [gpsLoading,   setGpsLoading]   = useState(false);
  const [errores, setErrores] = useState({
    nombre: '', correo: '', password: '', confirmPwd: '',
  });

  useEffect(() => {
    detectarUbicacion();
  }, []);

  const detectarUbicacion = async () => {
    try {
      setGpsLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const location = await Location.getCurrentPositionAsync({});
      const [geocode] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (geocode) {
        const zona = [geocode.city, geocode.region]
          .filter(Boolean)
          .join(', ');
        if (zona) setZonaAgricola(zona);
      }
    } catch (error) {
      console.log('[Registro] GPS no disponible:', error);
    } finally {
      setGpsLoading(false);
    }
  };

  /**
   * Valida los campos del formulario antes de enviar.
   * @returns true si todos los campos son válidos.
   */
  const validar = (): boolean => {
    const e = { nombre: '', correo: '', password: '', confirmPwd: '' };
    let ok = true;
    if (nombre.trim().length < 2) { e.nombre = 'Ingresa tu nombre completo'; ok = false; }
    if (!correo.includes('@'))    { e.correo = 'Correo inválido'; ok = false; }
    if (password.length < 6)     { e.password = 'Mínimo 6 caracteres'; ok = false; }
    if (password !== confirmPwd) { e.confirmPwd = 'Las contraseñas no coinciden'; ok = false; }
    setErrores(e);
    return ok;
  };

  /**
   * Handler de envío del formulario de registro.
   * Simula creación de cuenta con timeout y navega al Home.
   */
  const handleRegistro = async () => {
    if (!validar()) return;
    setCargando(true);
    await new Promise<void>((resolve) => setTimeout(resolve, 1500));
    setCargando(false);
    Alert.alert('¡Cuenta creada!', 'Tu cuenta fue creada exitosamente.', [
      { text: 'Continuar', onPress: () => navigation.navigate('Home') },
    ]);
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
            <YStack width={80} height={80} borderRadius="$full" bg="$bgCard" alignItems="center" justifyContent="center" borderWidth={2.5} borderColor="$primary" style={SHADOW.md}>
              <Image source={require('../../../assets/logo/jaguar.png')} style={{ width: 58, height: 58 }} resizeMode="contain" />
            </YStack>
            <Text fontSize={22} fontWeight="800" color="$primary" letterSpacing={1} textAlign="center">
              CREAR NUEVA CUENTA
            </Text>
            <Text fontSize={16} color="$textSecondary" textAlign="center" lineHeight={22}>
              Registra tu cuenta para guardar y sincronizar tus escaneos
            </Text>
          </YStack>

          {/* ── Formulario ─────────────────────────────────────── */}
          <YStack gap="$md" mb="$xl">

            <Campo
              label="Nombre Completo *"
              placeholder="Ej. Carlos Ramírez"
              value={nombre}
              onChangeText={setNombre}
              error={errores.nombre}
            />

            <Campo
              label="Correo Electrónico *"
              placeholder="correo@ejemplo.com"
              value={correo}
              onChangeText={setCorreo}
              error={errores.correo}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Campo
              label="Telefono"
              placeholder="Opcional — para alertas"
              value={telefono}
              onChangeText={setTelefono}
              keyboardType="phone-pad"
            />

            <Campo
              label="Zona Agricola"
              placeholder="Ej. Tecoman, Colima"
              value={zonaAgricola}
              onChangeText={setZonaAgricola}
              rightElement={
                gpsLoading ? (
                  <ActivityIndicator
                    size="small"
                    color={COLORS.primary}
                    style={{ position: 'absolute', right: 36, top: 15 }}
                  />
                ) : zonaAgricola ? (
                  <MapPin
                    size={18}
                    color={COLORS.primary}
                    style={{ position: 'absolute', right: 36, top: 15 }}
                  />
                ) : null
              }
            />

            <Campo
              label="Contraseña *"
              placeholder="••••••••••"
              value={password}
              onChangeText={setPassword}
              error={errores.password}
              secureTextEntry={!verPwd}
              autoCapitalize="none"
              rightElement={
                <TouchableOpacity
                  style={{ position: 'absolute', right: 36, top: 15 }}
                  onPress={() => setVerPwd(v => !v)}
                  activeOpacity={0.7}
                >
                  {verPwd ? (
                    <EyeOff size={20} color={COLORS.textMuted} />
                  ) : (
                    <Eye size={20} color={COLORS.textMuted} />
                  )}
                </TouchableOpacity>
              }
            />

            <Campo
              label="Confirmar Contraseña *"
              placeholder="••••••••••"
              value={confirmPwd}
              onChangeText={setConfirmPwd}
              error={errores.confirmPwd}
              secureTextEntry={!verPwd}
              autoCapitalize="none"
            />

          </YStack>

          {/* ── Botón: Crear cuenta ────────────────────────────── */}
          <TouchableOpacity
            onPress={handleRegistro}
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
                  CREAR CUENTA
                </Text>
              )}
            </YStack>
          </TouchableOpacity>

          {/* ── Enlace: Login ──────────────────────────────────── */}
          <XStack justifyContent="center" mt="$md">
            <Text fontSize={16} color="$textSecondary">
              ¿Ya tienes cuenta?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text fontSize={16} fontWeight="700" color="$primary">
                Inicia sesión
              </Text>
            </TouchableOpacity>
          </XStack>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ── Subcomponente: Campo de formulario ─────────────────────────────
/**
 * Campo reutilizable de formulario con label, input y mensaje de error.
 *
 * @param label           Texto descriptivo del campo.
 * @param placeholder     Placeholder del input.
 * @param value           Valor actual del input.
 * @param onChangeText    Handler de cambio de texto.
 * @param error           Mensaje de error (opcional).
 * @param secureTextEntry Ocultar texto (contraseña).
 * @param keyboardType    Tipo de teclado del input.
 * @param autoCapitalize  Configuración de capitalización.
 * @param rightElement    Elemento adicional a la derecha (ej. botón de ojo).
 */
const Campo = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  rightElement,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'words';
  rightElement?: React.ReactNode;
}) => (
  <YStack gap="$xs">
    <Text fontSize={16} fontWeight="600" color="$primary">
      {label}
    </Text>
    <YStack position="relative">
      <Input
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType ?? 'default'}
        autoCapitalize={autoCapitalize ?? 'words'}
        borderWidth={1.5}
        borderRadius="$lg"
        px="$md"
        pr={rightElement ? 80 : '$md'}
        fontSize={16}
        color="$textPrimary"
        bg="$bgCard"
        style={{ ...SHADOW.sm, borderColor: error ? COLORS.danger : COLORS.border, height: 50 }}
      />
      {rightElement}
    </YStack>
    {error ? (
      <Text fontSize={14} color="$danger">
        {error}
      </Text>
    ) : null}
  </YStack>
);

export default RegistroScreen;
