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

const RegistroScreen = ({ navigation }: Props) => {
  // ── Estado del formulario ─────────────
  const [nombre,        setNombre]        = useState('');
  const [correo,        setCorreo]        = useState('');
  const [password,      setPassword]      = useState('');
  const [confirmPwd,    setConfirmPwd]    = useState('');
  const [parcela,       setParcela]       = useState('');
  const [telefono,      setTelefono]      = useState('');
  const [verPwd,        setVerPwd]        = useState(false);
  const [cargando,      setCargando]      = useState(false);

  // ── Errores por campo ─────────────────
  const [errores, setErrores] = useState({
    nombre:     '',
    correo:     '',
    password:   '',
    confirmPwd: '',
  });

  // ── Validación ────────────────────────
  const validar = (): boolean => {
    const nuevosErrores = {
      nombre:     '',
      correo:     '',
      password:   '',
      confirmPwd: '',
    };
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
      // Aquí irá la llamada real al backend
      await new Promise(r => setTimeout(r, 1000));
      Alert.alert(
        '¡Cuenta creada! ✅',
        'Tu cuenta fue creada exitosamente.',
        [{ text: 'Continuar', onPress: () => navigation.navigate('Home') }],
      );
    } catch (e) {
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

        {/* ── Botón regresar ── */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>← Regresar</Text>
        </TouchableOpacity>

        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.title}>CREAR NUEVA CUENTA</Text>
          <Text style={styles.subtitle}>
            Registra tu cuenta para guardar y sincronizar tus escaneos
          </Text>
        </View>

        {/* ── Formulario ── */}
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
          