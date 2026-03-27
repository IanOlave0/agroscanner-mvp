import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, StatusBar, Alert, Switch,
} from 'react-native';
import { COLORS, FONT_SIZE, FONT_WEIGHT, SPACING, RADIUS } from '../../constants';

const PerfilScreen = () => {
  const [notificaciones, setNotificaciones] = useState(true);
  const [modoOffline,    setModoOffline]    = useState(true);

  // ── Simula si hay sesión activa ───────
  // Cuando el backend esté listo esto vendrá
  // del contexto de autenticación real
  const haySession  = false;
  const nombreUsuario = 'Invitado';

  const handleCerrarSesion = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro que deseas cerrar tu sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text:    'Cerrar sesión',
          style:   'destructive',
          onPress: () => console.log('Cerrar sesión'),
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

        {/* ── Header perfil ── */}
        <View style={styles.perfilHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarEmoji}>
              {haySession ? '👨‍🌾' : '👤'}
            </Text>
          </View>
          <Text style={styles.nombreUsuario}>{nombreUsuario}</Text>
          {haySession
            ? <Text style={styles.rolUsuario}>Agricultor · Colima</Text>
            : (
              <View style={styles.guestBadge}>
                <Text style={styles.guestBadgeText}>Modo invitado</Text>
              </View>
            )
          }
        </View>

        {/* ── Banner para iniciar sesión ── */}
        {!haySession && (
          <View style={styles.bannerLogin}>
            <Text style={styles.bannerLoginTitulo}>
              💾 Guarda tus escaneos
            </Text>
            <Text style={styles.bannerLoginSub}>
              Crea una cuenta para sincronizar tus detecciones y verlas en el mapa regional
            </Text>
            <TouchableOpacity style={styles.bannerLoginBtn}>
              <Text style={styles.bannerLoginBtnText}>Crear cuenta gratis</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Sección preferencias ── */}
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

        {/* ── Sección sincronización ── */}
        <SeccionMenu titulo="Sincronización">
          <ItemMenu
            emoji="☁️"
            label="Escaneos pendientes"
            valor="1 pendiente"
            onPress={() => {}}
          />
          <ItemMenu
            emoji="🕐"
            label="Última sincronización"
            valor="Hace 2 horas"
            onPress={() => {}}
          />
        </SeccionMenu>

        {/* ── Sección información ── */}
        <SeccionMenu titulo="Información">
          <ItemMenu
            emoji="📋"
            label="Versión del modelo IA"
            valor="v1.0"
            onPress={() => {}}
          />
          <ItemMenu
            emoji="📱"
            label="Versión de la app"
            valor="1.0.0"
            onPress={() => {}}
          />
          <ItemMenu
            emoji="🛡"
            label="Política de privacidad"
            onPress={() => {}}
          />
          <ItemMenu
            emoji="📄"
            label="Términos de uso"
            onPress={() => {}}
          />
        </SeccionMenu>

        {/* ── Créditos ── */}
        <View style={styles.creditos}>
          <Text style={styles.creditosEmoji}>🐆</Text>
          <Text style={styles.creditosTitulo}>CPI Jaguars</Text>
          <Text style={styles.creditosSub}>
            Ian Olave · Carlos Ramírez · José Negrete
          </Text>
          <Text style={styles.creditosSub}>TecNM · Instituto Tecnológico de Colima</Text>
        </View>

        {/* ── Cerrar sesión ── */}
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

// ── Componente sección ────────────────────
const SeccionMenu = ({
  titulo,
  children,
}: {
  titulo:   string;
  children: React.ReactNode;
}) => (
  <View style={styles.seccion}>
    <Text style={styles.seccionTitulo}>{titulo}</Text>
    <View style={styles.seccionCard}>{children}</View>
  </View>
);

// ── Componente item con switch ────────────
const ItemSwitch = ({
  emoji,
  label,
  descripcion,
  valor,
  onChange,
}: {
  emoji:       string;
  label:       string;
  descripcion?: string;
  valor:       boolean;
  onChange:    (v: boolean) => void;
}) => (
  <View style={styles.itemRow}>
    <Text style={styles.itemEmoji}>{emoji}</Text>
    <View style={styles.itemInfo}>
      <Text style={styles.itemLabel}>{label}</Text>
      {descripcion && (
        <Text style={styles.itemDesc}>{descripcion}</Text>
      )}
    </View>
    <Switch
      value={valor}
      onValueChange={onChange}
      trackColor={{ true: COLORS.primaryLight, false: COLORS.border }}
      thumbColor={valor ? COLORS.primary : COLORS.textMuted}
    />
  </View>
);

// ── Componente item con flecha ────────────
const ItemMenu = ({
  emoji,
  label,
  valor,
  onPress,
}: {
  emoji:   string;
  label:   string;
  valor?:  string;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.itemRow} onPress={onPress} activeOpacity={0.7}>
    <Text style={styles.itemEmoji}>{emoji}</Text>
    <Text style={styles.itemLabel}>{label}</Text>
    <View style={{ flex: 1 }} />
    {valor && <Text style={styles.itemValor}>{valor}</Text>}
    <Text style={styles.itemFlecha}>›</Text>
  </TouchableOpacity>
);

export default PerfilScreen;

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: COLORS.bgPrimary,
  },
  scroll: {
    paddingBottom: SPACING.xxl,
    gap:           SPACING.lg,
  },

  // ── Header perfil
  perfilHeader: {
    alignItems:      'center',
    paddingTop:      SPACING.xl,
    paddingBottom:   SPACING.lg,
    backgroundColor: COLORS.bgGreen,
    gap:             SPACING.sm,
  },
  avatarContainer: {
    width:           96,
    height:          96,
    borderRadius:    RADIUS.full,
    backgroundColor: COLORS.bgCard,
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     3,
    borderColor:     COLORS.primary,
  },
  avatarEmoji: { fontSize: 48 },
  nombreUsuario: {
    fontSize:   FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.extrabold,
    color:      COLORS.textPrimary,
  },
  rolUsuario: {
    fontSize: FONT_SIZE.md,
    color:    COLORS.textSecondary,
  },
  guestBadge: {
    backgroundColor:   COLORS.bgCard,
    paddingHorizontal: SPACING.md,
    paddingVertical:   SPACING.xs,
    borderRadius:      RADIUS.full,
    borderWidth:       1,
    borderColor:       COLORS.border,
  },
  guestBadgeText: {
    fontSize:   FONT_SIZE.sm,
    color:      COLORS.textMuted,
    fontWeight: FONT_WEIGHT.semibold,
  },

  // ── Banner login
  bannerLogin: {
    marginHorizontal: SPACING.lg,
    backgroundColor:  COLORS.bgGreen,
    borderRadius:     RADIUS.xl,
    padding:          SPACING.lg,
    gap:              SPACING.sm,
    borderWidth:      1,
    borderColor:      COLORS.primaryLight,
  },
  bannerLoginTitulo: {
    fontSize:   FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color:      COLORS.primary,
  },
  bannerLoginSub: {
    fontSize:   FONT_SIZE.sm,
    color:      COLORS.textSecondary,
    lineHeight: 20,
  },
  bannerLoginBtn: {
    backgroundColor: COLORS.primary,
    borderRadius:    RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems:      'center',
    marginTop:       SPACING.xs,
  },
  bannerLoginBtnText: {
    fontSize:   FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color:      COLORS.white,
  },

  // ── Secciones
  seccion: {
    paddingHorizontal: SPACING.lg,
    gap:               SPACING.sm,
  },
  seccionTitulo: {
    fontSize:      FONT_SIZE.sm,
    fontWeight:    FONT_WEIGHT.bold,
    color:         COLORS.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  seccionCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius:    RADIUS.lg,
    borderWidth:     1,
    borderColor:     COLORS.border,
    overflow:        'hidden',
  },

  // ── Items
  itemRow: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: SPACING.md,
    paddingVertical:   SPACING.md,
    gap:               SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  itemEmoji: { fontSize: 20 },
  itemInfo:  { flex: 1 },
  itemLabel: {
    fontSize:   FONT_SIZE.md,
    color:      COLORS.textPrimary,
    fontWeight: FONT_WEIGHT.medium,
  },
  itemDesc: {
    fontSize:  FONT_SIZE.xs,
    color:     COLORS.textMuted,
    marginTop: 2,
  },
  itemValor: {
    fontSize: FONT_SIZE.sm,
    color:    COLORS.textMuted,
  },
  itemFlecha: {
    fontSize:   FONT_SIZE.xl,
    color:      COLORS.textMuted,
    fontWeight: FONT_WEIGHT.bold,
  },

  // ── Créditos
  creditos: {
    alignItems: 'center',
    gap:        SPACING.xs,
    paddingVertical: SPACING.md,
  },
  creditosEmoji: { fontSize: 36 },
  creditosTitulo: {
    fontSize:   FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color:      COLORS.primary,
  },
  creditosSub: {
    fontSize:  FONT_SIZE.sm,
    color:     COLORS.textMuted,
    textAlign: 'center',
  },

  // ── Cerrar sesión
  btnCerrarSesion: {
    marginHorizontal: SPACING.lg,
    backgroundColor:  COLORS.dangerLight,
    borderRadius:     RADIUS.lg,
    paddingVertical:  SPACING.md,
    alignItems:       'center',
    borderWidth:      1,
    borderColor:      COLORS.danger,
  },
  btnCerrarSesionText: {
    fontSize:   FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color:      COLORS.danger,
  },
});