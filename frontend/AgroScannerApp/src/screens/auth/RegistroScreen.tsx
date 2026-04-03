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
  navigation: NativeStackNavigationProp<RootStackParams, 'Registro'>;
};

// ── Componente Auxiliar Campo (Corregido) ─────────────────
const Campo = ({ label, error, rightElement, ...props }: any) => (
  <View style={styles.fieldGroup}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputWrapper}>
      <TextInput
        style={[styles.input, error ? styles.inputError : null]}
        placeholderTextColor={COLORS.textMuted}
        {...props}
      />
      {rightElement}
    </View>
    {error ? <Text style={styles.errorText}>⚠ {error}</Text> : null}
  </View>
);

const RegistroScreen = ({ navigation }: Props) => {
  // ── Estado del formulario ─────────────
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [verPwd, setVerPwd] = useState(false);
  const [cargando, setCargando] = useState(false);

  // ── Errores por campo ─────────────────
  const [errores, setErrores] = useState({
    nombre: '',
    correo: '',
    password: '',
    confirmPwd: '',
  });

  // ── Validación ────────────────────────
  const validar = (): boolean => {
    const nuevosErrores = { nombre: '', correo: '', password: '', confirmPwd: '' };
    let valido = true;

    if (nombre.trim().length < 2) {
      nuevosErrores.nombre = 'Ingresa tu nombre completo';
      valido = false;
    }
    if (!correo.includes('@')) {
      nuevosErrores.correo = 'Ingresa un correo válido';
      valido = false;
    }
    if (password.length < 6) {
      nuevosErrores.password = 'Mínimo 6 caracteres';
      valido = false;
    }
    if (password !== confirmPwd) {
      nuevosErrores.confirmPwd = 'Las contraseñas no coinciden';
      valido = false;
    }

    setErrores(nuevosErrores);
    return valido;
  };

  // ── Enviar registro ───────────────────
  const handleRegistro = async () => {
    if (!validar()) return;

    setCargando(true);
    try {
      // CORRECCIÓN: Tipado de promesa para evitar error de 'unknown'
      await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 1000);
      });

      Alert.alert(
        '¡Cuenta creada! ✅',
        'Tu cuenta fue creada exitosamente.',
        [{ text: 'Continuar', onPress: () => navigation.navigate('Home') }],
      );
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo crear la cuenta. Intenta de nuevo.');
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
        {/* Botón regresar */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>← Regresar</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>CREAR NUEVA CUENTA</Text>
          <Text style={styles.subtitle}>
            Registra tu cuenta para guardar y sincronizar tus escaneos
          </Text>
        </View>

        {/* Formulario */}
        <View style={styles.form}>
          <Campo
            label="Nombre Completo *"
            placeholder="Carlos Antonio Ramírez Reyna"
            value={nombre}
            onChangeText={setNombre}
            error={errores.nombre}
          />

          <Campo
            label="Correo Electrónico *"
            placeholder="agricultor@ejemplo.com"
            value={correo}
            onChangeText={setCorreo}
            error={errores.correo}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Campo
            label="Contraseña *"
            placeholder="••••••••••"
            value={password}
            onChangeText={setPassword}
            error={errores.password}
            secureTextEntry={!verPwd}
            rightElement={
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setVerPwd(v => !v)}
              >
                <Text style={styles.eyeIcon}>{verPwd ? '🙈' : '👁️'}</Text>
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
          />
        </View>

        {/* Botón Enviar */}
        <TouchableOpacity
          style={[styles.btnRegistro, cargando && styles.btnDisabled]}
          onPress={handleRegistro}
          disabled={cargando}
        >
          {cargando ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.btnRegistroText}>CREAR CUENTA</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegistroScreen;

// ── Estilos ───────────────────────────────
const styles = StyleSheet.create({
  kav: { flex: 1, backgroundColor: COLORS.bgPrimary },
  scroll: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },
  backBtn: { marginBottom: SPACING.lg },
  backText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.semibold,
  },
  header: { marginBottom: SPACING.xl, gap: SPACING.xs },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.extrabold,
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  form: { gap: SPACING.md, marginBottom: SPACING.xl },
  fieldGroup: { gap: SPACING.xs },
  label: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
  },
  inputWrapper: { position: 'relative', justifyContent: 'center' },
  input: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: Platform.OS === 'ios' ? SPACING.md : 10,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
  },
  inputError: { borderColor: COLORS.danger },
  errorText: { fontSize: FONT_SIZE.sm, color: COLORS.danger, marginTop: 2 },
  eyeBtn: { position: 'absolute', right: SPACING.md },
  eyeIcon: { fontSize: 20 },
  btnRegistro: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  btnRegistroText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
    letterSpacing: 1,
  },
  btnDisabled: { opacity: 0.6 },
});