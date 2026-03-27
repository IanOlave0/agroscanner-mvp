import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParams } from '../../types';
import { COLORS, FONT_SIZE, FONT_WEIGHT, SPACING, RADIUS } from '../../constants';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParams, 'Login'>;
};

const LoginScreen = ({ navigation }: Props) => {
  // ── Estado del formulario ─────────────
  // useState guarda valores que cambian en pantalla
  // cuando el usuario escribe su correo, el estado se actualiza
  const [correo,    setCorreo]    = useState('');
  const [password,  setPassword]  = useState('');
  const [verPwd,    setVerPwd]    = useState(false);
  const [cargando,  setCargando]  = useState(false);
  const [errCorreo, setErrCorreo] = useState('');
  const [errPwd,    setErrPwd]    = useState('');

  // ── Validación del formulario ─────────
  // Antes de enviar al backend, verificamos
  // que los campos estén bien llenados
  const validar = (): boolean => {
    let valido = true;

    if (!correo.includes('@')) {
      setErrCorreo('Ingresa un correo válido');
      valido = false;
    } else {
      setErrCorreo('');
    }

    if (password.length < 6) {
      setErrPwd('Mínimo 6 caracteres');
      valido = false;
    } else {
      setErrPwd('');
    }

    return valido;
  };

  // ── Enviar login al backend ───────────
  const handleLogin = async () => {
    if (!validar()) return;

    setCargando(true);
    try {
      // Aquí irá la llamada real al backend FastAPI
      // Por ahora simulamos un login exitoso
      await new Promise(r => setTimeout(r, 1000));
      navigation.navigate('Home');
    } catch (e) {
      Alert.alert(
        'Error al iniciar sesión',
        'Verifica tu correo y contraseña',
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.kav}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgPrimary} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        {/* ── Botón regresar ── */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>← Regresar</Text>
        </TouchableOpacity>

        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.logoEmoji}>🌿</Text>
          <Text style={styles.title}>AgroScanner</Text>
          <Text style={styles.subtitle}>Bienvenido de vuelta</Text>
        </View>

        {/* ── Formulario ── */}
        <View style={styles.form}>

          {/* Campo correo */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Correo Electrónico</Text>
            <TextInput
              style={[
                styles.input,
                errCorreo ? styles.inputError : null,
              ]}
              placeholder="agricultor@ejemplo.com"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={correo}
              onChangeText={setCorreo}
            />
            {errCorreo ? (
              <Text style={styles.errorText}>⚠ {errCorreo}</Text>
            ) : null}
          </View>

          {/* Campo contraseña */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Contraseña</Text>
            <View style={styles.pwdContainer}>
              <TextInput
                style={[
                  styles.input,
                  styles.pwdInput,
                  errPwd ? styles.inputError : null,
                ]}
                placeholder="••••••••••"
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry={!verPwd}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setVerPwd(v => !v)}
              >
                <Text style={styles.eyeIcon}>
                  {verPwd ? '🙈' : '👁️'}
                </Text>
              </TouchableOpacity>
            </View>
            {errPwd ? (
              <Text style={styles.errorText}>⚠ {errPwd}</Text>
            ) : null}
          </View>

        </View>

        {/* ── Botón login ── */}
        <TouchableOpacity
          style={[styles.btnLogin, cargando && styles.btnDisabled]}
          onPress={handleLogin}
          disabled={cargando}
          activeOpacity={0.85}
        >
          {cargando
            ? <ActivityIndicator color={COLORS.white} size="small" />
            : <Text style={styles.btnLoginText}>INICIAR SESIÓN</Text>
          }
        </TouchableOpacity>

        {/* ── Link a registro ── */}
        <View style={styles.registerRow}>
          <Text style={styles.registerLabel}>¿No tienes cuenta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Registro')}>
            <Text style={styles.registerLink}>Regístrate aquí</Text>
          </TouchableOpacity>
        </View>

        {/* ── Separador ── */}
        <View style={styles.separador}>
          <View style={styles.linea} />
          <Text style={styles.separadorText}>o continúa sin cuenta</Text>
          <View style={styles.linea} />
        </View>

        {/* ── Botón invitado ── */}
        <TouchableOpacity
          style={styles.btnGuest}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.85}
        >
          <Text style={styles.btnGuestText}>
            📷  Escanear sin cuenta
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  kav: {
    flex:            1,
    backgroundColor: COLORS.bgPrimary,
  },
  scroll: {
    flexGrow:          1,
    paddingHorizontal: SPACING.lg,
    paddingTop:        SPACING.xl,
    paddingBottom:     SPACING.xxl,
  },
  backBtn: {
    marginBottom: SPACING.lg,
  },
  backText: {
    fontSize:   FONT_SIZE.md,
    color:      COLORS.primary,
    fontWeight: FONT_WEIGHT.semibold,
  },
  header: {
    alignItems:   'center',
    marginBottom: SPACING.xl,
    gap:          SPACING.xs,
  },
  logoEmoji: {
    fontSize: 48,
  },
  title: {
    fontSize:   FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.extrabold,
    color:      COLORS.primary,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color:    COLORS.textSecondary,
  },
  form: {
    gap:          SPACING.md,
    marginBottom: SPACING.xl,
  },
  fieldGroup: {
    gap: SPACING.xs,
  },
  label: {
    fontSize:   FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color:      COLORS.primary,
  },
  input: {
    backgroundColor: COLORS.bgCard,
    borderRadius:    RADIUS.md,
    borderWidth:     1.5,
    borderColor:     COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical:   SPACING.md,
    fontSize:        FONT_SIZE.md,
    color:           COLORS.textPrimary,
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  errorText: {
    fontSize: FONT_SIZE.sm,
    color:    COLORS.danger,
  },
  pwdContainer: {
    position: 'relative',
  },
  pwdInput: {
    paddingRight: 56,
  },
  eyeBtn: {
    position: 'absolute',
    right:    SPACING.md,
    top:      '20%',
  },
  eyeIcon: {
    fontSize: 20,
  },
  btnLogin: {
    backgroundColor: COLORS.primary,
    borderRadius:    RADIUS.lg,
    paddingVertical: SPACING.lg,
    alignItems:      'center',
    marginBottom:    SPACING.md,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  btnLoginText: {
    fontSize:      FONT_SIZE.lg,
    fontWeight:    FONT_WEIGHT.bold,
    color:         COLORS.textWhite,
    letterSpacing: 1.5,
  },
  registerRow: {
    flexDirection:  'row',
    justifyContent: 'center',
    marginBottom:   SPACING.xl,
  },
  registerLabel: {
    fontSize: FONT_SIZE.md,
    color:    COLORS.textSecondary,
  },
  registerLink: {
    fontSize:   FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color:      COLORS.primary,
  },
  separador: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           SPACING.sm,
    marginBottom:  SPACING.md,
  },
  linea: {
    flex:            1,
    height:          1,
    backgroundColor: COLORS.border,
  },
  separadorText: {
    fontSize: FONT_SIZE.sm,
    color:    COLORS.textMuted,
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
});