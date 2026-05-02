import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParams } from '../../types';
import { COLORS, FONT_SIZE, FONT_WEIGHT, SPACING, RADIUS } from '../../constants';
import { clearMockUser } from '../../database/seedData';

const PerfilScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParams>>();
  const [notificaciones, setNotificaciones] = useState(true);
  const [modoOffline, setModoOffline] = useState(true);

  // ── CONFIGURACIÓN PARA LA DEMO ───────────────
  const haySession = true; 
  const nombreUsuario = haySession ? 'Carlos Ramírez' : 'Invitado';

  const handleCerrarSesion = async () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro que deseas cerrar tu sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            await clearMockUser();
            navigation.replace('Welcome');
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgPrimary} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.perfilHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarEmoji}>{haySession ? '👨‍🌾' : '👤'}</Text>
          </View>
          <Text style={styles.nombreUsuario}>{nombreUsuario}</Text>
          {haySession ? (
            <Text style={styles.rolUsuario}>Agricultor · Colima, MX</Text>
          ) : (
            <View style={styles.guestBadge}>
              <Text style={styles.guestBadgeText}>Modo invitado</Text>
            </View>
          )}
        </View>

        {!haySession && (
          <View style={styles.bannerLogin}>
            <Text style={styles.bannerLoginTitulo}>💾 Guarda tus escaneos</Text>
            <Text style={styles.bannerLoginSub}>
              Crea una cuenta para sincronizar tus detecciones y verlas en el mapa regional.
            </Text>
            <TouchableOpacity 
              style={styles.bannerLoginBtn}
              onPress={() => navigation.navigate('Registro')}
            >
              <Text style={styles.bannerLoginBtnText}>Crear cuenta gratis</Text>
            </TouchableOpacity>
          </View>
        )}

        <SeccionMenu titulo="Preferencias">
          <ItemSwitch
            emoji="🔔"
            label="Notificaciones de alerta"
            valor={notificaciones}
            onChange={setNotificaciones}
          />
          <ItemSwitch
            emoji="📡"
            label="Modo sin conexión"
            descripcion="La IA funciona sin internet"
            valor={modoOffline}
            onChange={setModoOffline}
          />
        </SeccionMenu>

        <SeccionMenu titulo="Sincronización">
          <ItemMenu
            emoji="☁️"
            label="Escaneos pendientes"
            valor={haySession ? "0 pendientes" : "1 pendiente"}
            onPress={() => {}}
          />
          <ItemMenu
            emoji="🕐"
            label="Última sincronización"
            valor="Hace 2 horas"
            onPress={() => {}}
          />
        </SeccionMenu>

        <SeccionMenu titulo="Información">
          <ItemMenu
            emoji="📋"
            label="Versión del modelo IA"
            valor="v1.0-Colima"
            onPress={() => {}}
          />
          <ItemMenu
            emoji="🛡"
            label="Política de privacidad"
            onPress={() => {}}
          />
        </SeccionMenu>

        <View style={styles.creditos}>
          <Text style={styles.creditosEmoji}>🐆</Text>
          <Text style={styles.creditosTitulo}>CPI Jaguars</Text>
          <Text style={styles.creditosSub}>Ian Olave · Carlos Ramírez · José Negrete</Text>
          <Text style={styles.creditosSub}>TecNM · Instituto Tecnológico de Colima</Text>
        </View>

        {haySession && (
          <TouchableOpacity
            style={styles.btnCerrarSesion}
            onPress={handleCerrarSesion}
            activeOpacity={0.85}
          >
            <Text style={styles.btnCerrarSesionText}>🚪 Cerrar sesión</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const SeccionMenu = ({ titulo, children }: any) => (
  <View style={styles.seccion}>
    <Text style={styles.seccionTitulo}>{titulo}</Text>
    <View style={styles.seccionCard}>{children}</View>
  </View>
);

const ItemSwitch = ({ emoji, label, descripcion, valor, onChange }: any) => (
  <View style={styles.itemRow}>
    <Text style={styles.itemEmoji}>{emoji}</Text>
    <View style={styles.itemInfo}>
      <Text style={styles.itemLabel}>{label}</Text>
      {descripcion && <Text style={styles.itemDesc}>{descripcion}</Text>}
    </View>
    <Switch
      value={valor}
      onValueChange={onChange}
      trackColor={{ true: COLORS.primary + '80', false: COLORS.border }}
      thumbColor={valor ? COLORS.primary : '#f4f3f4'}
    />
  </View>
);

const ItemMenu = ({ emoji, label, valor, onPress }: any) => (
  <TouchableOpacity style={styles.itemRow} onPress={onPress} activeOpacity={0.7}>
    <Text style={styles.itemEmoji}>{emoji}</Text>
    <Text style={styles.itemLabel}>{label}</Text>
    {/* CORRECCIÓN: Se eliminó el estilo inline flex:1 y se usa styles.spacer */}
    <View style={styles.spacer} />
    {valor && <Text style={styles.itemValor}>{valor}</Text>}
    <Text style={styles.itemFlecha}>›</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  scroll: { paddingBottom: SPACING.xxl, gap: SPACING.lg },
  perfilHeader: {
    alignItems: 'center',
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.lg,
    backgroundColor: COLORS.white,
    gap: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.bgPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  avatarEmoji: { fontSize: 44 },
  nombreUsuario: { fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.extrabold, color: COLORS.textPrimary },
  rolUsuario: { fontSize: FONT_SIZE.md, color: COLORS.textSecondary },
  guestBadge: {
    backgroundColor: COLORS.bgPrimary,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  guestBadgeText: { fontSize: FONT_SIZE.sm, color: COLORS.textMuted, fontWeight: FONT_WEIGHT.semibold },
  bannerLogin: {
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.primary + '10',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    gap: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  bannerLoginTitulo: { fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: COLORS.primary },
  bannerLoginSub: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, lineHeight: 18 },
  bannerLoginBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  bannerLoginBtnText: { fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: COLORS.white },
  seccion: { paddingHorizontal: SPACING.lg, gap: SPACING.xs },
  seccionTitulo: { fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.bold, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
  seccionCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, gap: SPACING.md, borderBottomWidth: 0.5, borderBottomColor: COLORS.border },
  itemEmoji: { fontSize: 20 },
  itemInfo: { flex: 1 },
  itemLabel: { fontSize: FONT_SIZE.md, color: COLORS.textPrimary, fontWeight: FONT_WEIGHT.medium },
  itemDesc: { fontSize: FONT_SIZE.xs, color: COLORS.textMuted, marginTop: 2 },
  itemValor: { fontSize: FONT_SIZE.sm, color: COLORS.textMuted },
  itemFlecha: { fontSize: FONT_SIZE.lg, color: COLORS.textMuted },
  spacer: { flex: 1 }, // Estilo para reemplazar el inline style
  creditos: { alignItems: 'center', gap: 4, paddingVertical: SPACING.md },
  creditosEmoji: { fontSize: 32 },
  creditosTitulo: { fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: COLORS.primary },
  creditosSub: { fontSize: 12, color: COLORS.textMuted, textAlign: 'center' },
  btnCerrarSesion: {
    marginHorizontal: SPACING.lg,
    backgroundColor: '#FFF5F5',
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FEB2B2',
  },
  btnCerrarSesionText: { fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: '#C53030' },
});

export default PerfilScreen;