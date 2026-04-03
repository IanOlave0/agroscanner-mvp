import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  StatusBar, KeyboardAvoidingView, Platform, ScrollView,
  ActivityIndicator, Alert, Image,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParams } from '../../types';
import { COLORS, FONT_SIZE, FONT_WEIGHT, SPACING, RADIUS, SHADOW, IMAGES } from '../../constants';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParams, 'Registro'>;
};

const RegistroScreen = ({ navigation }: Props) => {
  const [nombre,     setNombre]     = useState('');
  const [correo,     setCorreo]     = useState('');
  const [password,   setPassword]   = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [parcela,    setParcela]    = useState('');
  const [_telefono, _setTelefono] = useState('');
  const [verPwd,     setVerPwd]     = useState(false);
  const [cargando,   setCargando]   = useState(false);
  const [errores, setErrores] = useState({
    nombre: '', correo: '', password: '', confirmPwd: '',
  });

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

  const handleRegistro = async () => {
    if (!validar()) return;
    setCargando(true);
    await new Promise<void>((resolve) => setTimeout(resolve, 1500));
    setCargando(false);
    Alert.alert('¡Cuenta creada! ✅', 'Tu cuenta fue creada exitosamente.', [
      { text: 'Continuar', onPress: () => navigation.navigate('Home') },
    ]);
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
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Regresar</Text>
        </TouchableOpacity>

        {/* Logo */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image source={IMAGES.logo} style={styles.logoImage} resizeMode="contain" />
          </View>
          <Text style={styles.title}>CREAR NUEVA CUENTA</Text>
          <Text style={styles.subtitle}>
            Registra tu cuenta para guardar y sincronizar tus escaneos
          </Text>
        </View>

        <View style={styles.form}>
          <Campo label="Nombre Completo *" placeholder="Ej. Carlos Ramírez"
            value={nombre} onChangeText={setNombre} error={errores.nombre} />
          <Campo label="Correo Electrónico *" placeholder="correo@ejemplo.com"
            value={correo} onChangeText={setCorreo} error={errores.correo}
            keyboardType="email-address" autoCapitalize="none" />
          <Campo label="Ubicación *" placeholder="Ej. Colima, México"
            value={parcela} onChangeText={setParcela} />
          <Campo label="Nombre de la Parcela *" placeholder="Ej. Rancho El Jaguar"
            value={parcela} onChangeText={setParcela} />
          <Campo label="Contraseña *" placeholder="••••••••••"
            value={password} onChangeText={setPassword} error={errores.password}
            secureTextEntry={!verPwd}
            rightElement={
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setVerPwd(v => !v)}>
                <Text style={styles.eyeIcon}>{verPwd ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            }
          />
          <Campo label="Confirmar Contraseña *" placeholder="••••••••••"
            value={confirmPwd} onChangeText={setConfirmPwd}
            error={errores.confirmPwd} secureTextEntry={!verPwd} />
        </View>

        <TouchableOpacity
          style={[styles.btnRegistrar, cargando && styles.btnDisabled]}
          onPress={handleRegistro} disabled={cargando} activeOpacity={0.85}
        >
          {cargando
            ? <ActivityIndicator color={COLORS.white} size="small" />
            : <Text style={styles.btnRegistrarText}>CREAR CUENTA</Text>
          }
        </TouchableOpacity>

        <View style={styles.loginRow}>
          <Text style={styles.loginLabel}>¿Ya tienes cuenta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Inicia sesión</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const Campo = ({
  label, placeholder, value, onChangeText, error,
  secureTextEntry, keyboardType, autoCapitalize, rightElement,
}: any) => (
  <View style={styles.fieldGroup}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputWrapper}>
      <TextInput
        style={[styles.input, error && styles.inputError, rightElement && styles.inputWithRight]}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        value={value} onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType ?? 'default'}
        autoCapitalize={autoCapitalize ?? 'words'}
      />
      {rightElement}
    </View>
    {error ? <Text style={styles.errorText}>⚠ {error}</Text> : null}
  </View>
);

export default RegistroScreen;

const styles = StyleSheet.create({
  kav:    { flex: 1, backgroundColor: COLORS.bgPrimary },
  scroll: { flexGrow: 1, paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl, paddingBottom: SPACING.xxl },
  backBtn:   { marginBottom: SPACING.md },
  backText:  { fontSize: FONT_SIZE.md, color: COLORS.primary, fontWeight: FONT_WEIGHT.semibold },
  header:    { alignItems: 'center', marginBottom: SPACING.xl, gap: SPACING.sm },
  logoContainer: {
    width: 80, height: 80, borderRadius: RADIUS.full,
    backgroundColor: COLORS.bgCard, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2.5, borderColor: COLORS.primary, ...SHADOW.md,
  },
  logoImage: { width: 58, height: 58 },
  title:    { fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.extrabold, color: COLORS.primary, letterSpacing: 1, textAlign: 'center' },
  subtitle: { fontSize: FONT_SIZE.md, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },
  form:     { gap: SPACING.md, marginBottom: SPACING.xl },
  fieldGroup:    { gap: SPACING.xs },
  label:         { fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.semibold, color: COLORS.primary },
  errorText:     { fontSize: FONT_SIZE.sm, color: COLORS.danger },
  inputWrapper:  { position: 'relative' },
  input: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg,
    borderWidth: 1.5, borderColor: COLORS.border,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
    fontSize: FONT_SIZE.md, color: COLORS.textPrimary, ...SHADOW.sm,
  },
  inputError:    { borderColor: COLORS.danger },
  inputWithRight: { paddingRight: 56 },
  eyeBtn:        { position: 'absolute', right: SPACING.md, top: '20%' },
  eyeIcon:       { fontSize: 20 },
  btnRegistrar: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.xl,
    paddingVertical: SPACING.lg, alignItems: 'center',
    marginBottom: SPACING.md, ...SHADOW.lg,
  },
  btnDisabled:      { opacity: 0.7 },
  btnRegistrarText: { fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.extrabold, color: COLORS.white, letterSpacing: 2 },
  loginRow:   { flexDirection: 'row', justifyContent: 'center' },
  loginLabel: { fontSize: FONT_SIZE.md, color: COLORS.textSecondary },
  loginLink:  { fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: COLORS.primary },
});