import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParams } from '../../types';
import { COLORS, FONT_SIZE, FONT_WEIGHT, SPACING, RADIUS } from '../../constants';

const { width } = Dimensions.get('window');

// ── Datos de ejemplo del mapa ─────────────
// Cuando el backend esté listo, estos datos
// vendrán de la API como coordenadas GPS reales
// y se renderizarán con Google Maps SDK
const STATS_MAPA = {
  area_total_ha:   120,
  zona_critica_pct: 15,
  zona_riesgo_pct:  35,
  zona_segura_pct:  50,
  total_detecciones: 28,
  activas_hoy:       4,
};

// Zonas con brotes activos simuladas
const ZONAS_ALERTA = [
  {
    id:         1,
    nombre:     'Parcela Norte — Tecomán',
    enfermedad: 'HLB (Dragón Amarillo)',
    cultivo:    '🍋 Limón',
    nivel:      'critico',
    detecciones: 8,
  },
  {
    id:         2,
    nombre:     'Rancho El Limonal — Armería',
    enfermedad: 'Araña Roja',
    cultivo:    '🍈 Papaya',
    nivel:      'riesgo',
    detecciones: 5,
  },
  {
    id:         3,
    nombre:     'Huerta Sur — Tecomán',
    enfermedad: 'Sigatoka Negra',
    cultivo:    '🍌 Plátano',
    nivel:      'riesgo',
    detecciones: 3,
  },
];

const MapaScreen = () => {
  const [vistaActiva, setVistaActiva] = useState<'mapa' | 'lista'>('mapa');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParams>>();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgPrimary} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >

        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.titulo}>Mapa de Calor</Text>
          <Text style={styles.subtitulo}>
            Visualización epidemiológica de Colima
          </Text>
          <TouchableOpacity 
            style={styles.btnGestionar}
            onPress={() => navigation.navigate('ParcelaGestion')}
          >
            <Text style={styles.btnGestionarText}>📐 Gestionar Parcelas</Text>
          </TouchableOpacity>
        </View>

        {/* ── Selector de vista ── */}
        <View style={styles.selectorVista}>
          <TouchableOpacity
            style={[
              styles.vistaBtn,
              vistaActiva === 'mapa' && styles.vistaBtnActivo,
            ]}
            onPress={() => setVistaActiva('mapa')}
          >
            <Text style={[
              styles.vistaBtnText,
              vistaActiva === 'mapa' && styles.vistaBtnTextActivo,
            ]}>
              🗺 Mapa
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.vistaBtn,
              vistaActiva === 'lista' && styles.vistaBtnActivo,
            ]}
            onPress={() => setVistaActiva('lista')}
          >
            <Text style={[
              styles.vistaBtnText,
              vistaActiva === 'lista' && styles.vistaBtnTextActivo,
            ]}>
              📋 Zonas
            </Text>
          </TouchableOpacity>
        </View>

        {vistaActiva === 'mapa' ? (
          <>
            {/* ── Placeholder del mapa ── */}
            {/* Aquí irá el Google Maps SDK cuando se integre */}
            {/* Por ahora mostramos un placeholder visual */}
            <View style={styles.mapaContainer}>
              <View style={styles.mapaPlaceholder}>
                <Text style={styles.mapaEmoji}>🗺️</Text>
                <Text style={styles.mapaTitulo}>Mapa de Calor</Text>
                <Text style={styles.mapaSubtitulo}>
                  Colima, México
                </Text>
                <Text style={styles.mapaInfo}>
                  El mapa interactivo con heatmap se integrará con Google Maps SDK en la siguiente fase del proyecto
                </Text>
              </View>

              {/* Leyenda del mapa */}
              <View style={styles.leyenda}>
                <Text style={styles.leyendaTitulo}>Leyenda</Text>
                <View style={styles.leyendaItems}>
                  <LeyendaItem color={COLORS.semaforoRojo}    label="Zona crítica" />
                  <LeyendaItem color={COLORS.semaforoAmarillo} label="Zona de riesgo" />
                  <LeyendaItem color={COLORS.semaforoVerde}   label="Zona segura" />
                </View>
              </View>
            </View>

            {/* ── Estadísticas del área ── */}
            <Text style={styles.seccionTitulo}>📊 Estadísticas de la región</Text>

            <View style={styles.statsGrid}>
              <StatBox
                valor={`${STATS_MAPA.area_total_ha} Ha`}
                label="Área total"
                color={COLORS.primary}
              />
              <StatBox
                valor={`${STATS_MAPA.zona_critica_pct}%`}
                label="Zona crítica"
                color={COLORS.semaforoRojo}
              />
              <StatBox
                valor={`${STATS_MAPA.zona_riesgo_pct}%`}
                label="Zona de riesgo"
                color={COLORS.semaforoAmarillo}
              />
              <StatBox
                valor={`${STATS_MAPA.zona_segura_pct}%`}
                label="Zona segura"
                color={COLORS.semaforoVerde}
              />
            </View>

            {/* Detecciones hoy */}
            <View style={styles.detectcionesHoy}>
              <View style={styles.deteccionItem}>
                <Text style={styles.deteccionNumero}>
                  {STATS_MAPA.total_detecciones}
                </Text>
                <Text style={styles.deteccionLabel}>Total escaneos</Text>
              </View>
              <View style={styles.deteccionDivider} />
              <View style={styles.deteccionItem}>
                <Text style={[
                  styles.deteccionNumero,
                  { color: COLORS.danger },
                ]}>
                  {STATS_MAPA.activas_hoy}
                </Text>
                <Text style={styles.deteccionLabel}>Alertas hoy</Text>
              </View>
            </View>
          </>
        ) : (
          <>
            {/* ── Vista de lista de zonas ── */}
            <Text style={styles.seccionTitulo}>
              ⚠ Zonas con brotes activos
            </Text>

            <View style={styles.zonasContainer}>
              {ZONAS_ALERTA.map(zona => (
                <ZonaCard key={zona.id} zona={zona} />
              ))}
            </View>
          </>
        )}

        {/* ── Aviso de datos ── */}
        <View style={styles.avisoCard}>
          <Text style={styles.avisoTexto}>
            📡 Los datos se actualizan automáticamente cuando los agricultores suben nuevos escaneos. La información refleja reportes de los últimos 30 días.
          </Text>
        </View>

      </ScrollView>
    </View>
  );
};

// ── Componente leyenda ────────────────────
const LeyendaItem = ({
  color,
  label,
}: {
  color: string;
  label: string;
}) => (
  <View style={styles.leyendaItem}>
    <View style={[styles.leyendaPunto, { backgroundColor: color }]} />
    <Text style={styles.leyendaLabel}>{label}</Text>
  </View>
);

// ── Componente estadística ────────────────
const StatBox = ({
  valor,
  label,
  color,
}: {
  valor: string;
  label: string;
  color: string;
}) => (
  <View style={[styles.statBox, { borderTopColor: color }]}>
    <Text style={[styles.statValor, { color }]}>{valor}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// ── Componente zona de alerta ─────────────
const ZonaCard = ({ zona }: { zona: any }) => {
  const esCritico = zona.nivel === 'critico';
  const color     = esCritico ? COLORS.danger : COLORS.warning;
  const colorFondo = esCritico ? COLORS.dangerLight : COLORS.warningLight;

  return (
    <View style={[styles.zonaCard, { borderLeftColor: color }]}>
      <View style={styles.zonaHeader}>
        <View style={[styles.zonaNivelBadge, { backgroundColor: colorFondo }]}>
          <Text style={[styles.zonaNivelText, { color }]}>
            {esCritico ? '🔴 CRÍTICO' : '🟡 RIESGO'}
          </Text>
        </View>
        <Text style={styles.zonaDetecciones}>
          {zona.detecciones} escaneos
        </Text>
      </View>
      <Text style={styles.zonaNombre}>{zona.nombre}</Text>
      <Text style={styles.zonaCultivo}>{zona.cultivo}</Text>
      <Text style={[styles.zonaEnfermedad, { color }]}>
        {zona.enfermedad}
      </Text>
    </View>
  );
};

export default MapaScreen;

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: COLORS.bgPrimary,
  },
  scroll: {
    paddingBottom: SPACING.xxl,
    gap:           SPACING.md,
  },

  // ── Header
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop:        SPACING.xl,
    gap:               SPACING.xs,
  },
  titulo: {
    fontSize:   FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.extrabold,
    color:      COLORS.textPrimary,
  },
  subtitulo: {
    fontSize: FONT_SIZE.md,
    color:    COLORS.textSecondary,
  },
  btnGestionar: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: SPACING.md,
    alignSelf: 'flex-start',
  },
  btnGestionarText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
  },

  // ── Selector vista
  selectorVista: {
    flexDirection:     'row',
    marginHorizontal:  SPACING.lg,
    backgroundColor:   COLORS.bgCard,
    borderRadius:      RADIUS.lg,
    padding:           4,
    borderWidth:       1,
    borderColor:       COLORS.border,
  },
  vistaBtn: {
    flex:           1,
    paddingVertical: SPACING.sm,
    alignItems:     'center',
    borderRadius:   RADIUS.md,
  },
  vistaBtnActivo: {
    backgroundColor: COLORS.primary,
  },
  vistaBtnText: {
    fontSize:   FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color:      COLORS.textSecondary,
  },
  vistaBtnTextActivo: {
    color: COLORS.white,
  },

  // ── Mapa placeholder
  mapaContainer: {
    marginHorizontal: SPACING.lg,
    gap:              SPACING.md,
  },
  mapaPlaceholder: {
    height:          280,
    backgroundColor: COLORS.bgGreen,
    borderRadius:    RADIUS.xl,
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     2,
    borderColor:     COLORS.primaryLight,
    borderStyle:     'dashed',
    gap:             SPACING.sm,
    padding:         SPACING.lg,
  },
  mapaEmoji: {
    fontSize: 56,
  },
  mapaTitulo: {
    fontSize:   FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color:      COLORS.primary,
  },
  mapaSubtitulo: {
    fontSize: FONT_SIZE.md,
    color:    COLORS.textSecondary,
  },
  mapaInfo: {
    fontSize:   FONT_SIZE.sm,
    color:      COLORS.textMuted,
    textAlign:  'center',
    lineHeight: 20,
  },

  // ── Leyenda
  leyenda: {
    backgroundColor: COLORS.bgCard,
    borderRadius:    RADIUS.lg,
    padding:         SPACING.md,
    borderWidth:     1,
    borderColor:     COLORS.border,
    gap:             SPACING.sm,
  },
  leyendaTitulo: {
    fontSize:   FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color:      COLORS.textSecondary,
  },
  leyendaItems: {
    flexDirection: 'row',
    gap:           SPACING.md,
  },
  leyendaItem: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           6,
  },
  leyendaPunto: {
    width:        12,
    height:       12,
    borderRadius: RADIUS.full,
  },
  leyendaLabel: {
    fontSize: FONT_SIZE.xs,
    color:    COLORS.textSecondary,
  },

  // ── Sección título
  seccionTitulo: {
    paddingHorizontal: SPACING.lg,
    fontSize:          FONT_SIZE.lg,
    fontWeight:        FONT_WEIGHT.bold,
    color:             COLORS.textPrimary,
  },

  // ── Stats grid
  statsGrid: {
    flexDirection:     'row',
    flexWrap:          'wrap',
    paddingHorizontal: SPACING.lg,
    gap:               SPACING.sm,
  },
  statBox: {
    width:           (width - SPACING.lg * 2 - SPACING.sm) / 2,
    backgroundColor: COLORS.bgCard,
    borderRadius:    RADIUS.lg,
    padding:         SPACING.md,
    borderTopWidth:  4,
    borderWidth:     1,
    borderColor:     COLORS.border,
    gap:             4,
  },
  statValor: {
    fontSize:   FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.extrabold,
  },
  statLabel: {
    fontSize: FONT_SIZE.sm,
    color:    COLORS.textMuted,
  },

  // ── Detecciones hoy
  detectcionesHoy: {
    flexDirection:     'row',
    marginHorizontal:  SPACING.lg,
    backgroundColor:   COLORS.bgCard,
    borderRadius:      RADIUS.lg,
    padding:           SPACING.lg,
    borderWidth:       1,
    borderColor:       COLORS.border,
  },
  deteccionItem: {
    flex:       1,
    alignItems: 'center',
    gap:        4,
  },
  deteccionDivider: {
    width:           1,
    backgroundColor: COLORS.border,
    marginVertical:  SPACING.xs,
  },
  deteccionNumero: {
    fontSize:   FONT_SIZE.xxxl,
    fontWeight: FONT_WEIGHT.extrabold,
    color:      COLORS.primary,
  },
  deteccionLabel: {
    fontSize: FONT_SIZE.sm,
    color:    COLORS.textMuted,
  },

  // ── Zonas
  zonasContainer: {
    paddingHorizontal: SPACING.lg,
    gap:               SPACING.md,
  },
  zonaCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius:    RADIUS.lg,
    padding:         SPACING.md,
    borderLeftWidth: 5,
    borderWidth:     1,
    borderColor:     COLORS.border,
    gap:             SPACING.xs,
  },
  zonaHeader: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
  },
  zonaNivelBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical:   4,
    borderRadius:      RADIUS.full,
  },
  zonaNivelText: {
    fontSize:   FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
  },
  zonaDetecciones: {
    fontSize: FONT_SIZE.xs,
    color:    COLORS.textMuted,
  },
  zonaNombre: {
    fontSize:   FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color:      COLORS.textPrimary,
  },
  zonaCultivo: {
    fontSize: FONT_SIZE.sm,
    color:    COLORS.textSecondary,
  },
  zonaEnfermedad: {
    fontSize:   FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
  },

  // ── Aviso
  avisoCard: {
    marginHorizontal: SPACING.lg,
    backgroundColor:  COLORS.bgGreen,
    borderRadius:     RADIUS.lg,
    padding:          SPACING.md,
    borderWidth:      1,
    borderColor:      COLORS.primaryLight,
  },
  avisoTexto: {
    fontSize:   FONT_SIZE.sm,
    color:      COLORS.textSecondary,
    lineHeight: 20,
  },
});