import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { COLORS, FONT_SIZE, FONT_WEIGHT, SPACING, RADIUS, CULTIVOS } from '../../constants';

// ── Datos de ejemplo ──────────────────────
// Mientras el backend no esté listo usamos
// datos falsos para ver cómo se ve la pantalla
// Cuando Ian termine el backend, esto vendrá
// de la base de datos real
const DETECCIONES_EJEMPLO = [
  {
    id:                1,
    fecha:             '2026-03-20 09:15',
    cultivo:           'Limón Mexicano',
    emoji:             '🍋',
    enfermedad:        'HLB (Dragón Amarillo)',
    resultado_positivo: true,
    confianza:         0.92,
    sincronizado:      true,
  },
  {
    id:                2,
    fecha:             '2026-03-20 10:30',
    cultivo:           'Papaya',
    emoji:             '🍈',
    enfermedad:        'Araña Roja',
    resultado_positivo: false,
    confianza:         0.88,
    sincronizado:      false,
  },
  {
    id:                3,
    fecha:             '2026-03-19 14:00',
    cultivo:           'Plátano',
    emoji:             '🍌',
    enfermedad:        'Sigatoka Negra',
    resultado_positivo: true,
    confianza:         0.76,
    sincronizado:      true,
  },
];

// ── Filtros disponibles ───────────────────
const FILTROS = ['Todos', 'Limón', 'Papaya', 'Plátano'];

const HistorialScreen = () => {
  const [filtroActivo, setFiltroActivo] = useState('Todos');

  // ── Filtrar detecciones según cultivo ────
  // Según RF25 y RF26 del documento:
  // listar por fecha y filtrar por cultivo
  const deteccionesFiltradas = DETECCIONES_EJEMPLO.filter(d => {
    if (filtroActivo === 'Todos') return true;
    return d.cultivo.includes(filtroActivo);
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgPrimary} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >

        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.titulo}>Historial</Text>
          <Text style={styles.subtitulo}>
            {deteccionesFiltradas.length} escaneos registrados
          </Text>
        </View>

        {/* ── Banner offline pendientes ── */}
        {/* Según el documento: mostrar aviso si hay datos sin sincronizar */}
        {DETECCIONES_EJEMPLO.some(d => !d.sincronizado) && (
          <View style={styles.bannerPendiente}>
            <Text style={styles.bannerEmoji}>☁️</Text>
            <View style={styles.bannerTexto}>
              <Text style={styles.bannerTitulo}>Tienes escaneos sin sincronizar</Text>
              <Text style={styles.bannerSub}>
                Se subirán automáticamente cuando tengas internet
              </Text>
            </View>
          </View>
        )}

        {/* ── Filtros por cultivo ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtrosContainer}
        >
          {FILTROS.map(filtro => (
            <TouchableOpacity
              key={filtro}
              style={[
                styles.filtroPill,
                filtroActivo === filtro && styles.filtroPillActivo,
              ]}
              onPress={() => setFiltroActivo(filtro)}
              activeOpacity={0.85}
            >
              <Text style={[
                styles.filtroTexto,
                filtroActivo === filtro && styles.filtroTextoActivo,
              ]}>
                {filtro}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Lista de detecciones ── */}
        <View style={styles.listaContainer}>
          {deteccionesFiltradas.length === 0 ? (
            <View style={styles.vacio}>
              <Text style={styles.vacioEmoji}>🌿</Text>
              <Text style={styles.vacioTitulo}>Sin escaneos aún</Text>
              <Text style={styles.vacioSub}>
                Tus diagnósticos aparecerán aquí
              </Text>
            </View>
          ) : (
            deteccionesFiltradas.map(deteccion => (
              <TarjetaDeteccion
                key={deteccion.id}
                deteccion={deteccion}
              />
            ))
          )}
        </View>

      </ScrollView>
    </View>
  );
};

// ── Tarjeta de cada detección ─────────────
const TarjetaDeteccion = ({ deteccion }: { deteccion: any }) => {
  const confianzaPct  = Math.round(deteccion.confianza * 100);
  const esPositivo    = deteccion.resultado_positivo;
  const colorResultado = esPositivo ? COLORS.danger : COLORS.success;
  const textoResultado = esPositivo ? '⚠ Enfermedad' : '✅ Sana';

  return (
    <View style={styles.tarjeta}>

      {/* Franja de color según resultado */}
      <View style={[
        styles.tarjetaFranja,
        { backgroundColor: colorResultado },
      ]} />

      <View style={styles.tarjetaContenido}>

        {/* Fila superior */}
        <View style={styles.tarjetaTop}>
          <Text style={styles.tarjetaEmoji}>{deteccion.emoji}</Text>
          <View style={styles.tarjetaInfo}>
            <Text style={styles.tarjetaCultivo}>{deteccion.cultivo}</Text>
            <Text style={styles.tarjetaFecha}>{deteccion.fecha}</Text>
          </View>
          <View style={[
            styles.tarjetaBadge,
            { backgroundColor: colorResultado + '20' },
          ]}>
            <Text style={[styles.tarjetaBadgeText, { color: colorResultado }]}>
              {textoResultado}
            </Text>
          </View>
        </View>

        {/* Fila inferior */}
        <View style={styles.tarjetaBottom}>
          {esPositivo && (
            <Text style={styles.tarjetaEnfermedad}>
              {deteccion.enfermedad}
            </Text>
          )}
          <View style={styles.tarjetaMeta}>
            <Text style={styles.tarjetaConfianza}>
              Certeza: {confianzaPct}%
            </Text>
            {/* Indicador de sincronización */}
            <View style={styles.syncIndicador}>
              <View style={[
                styles.syncPunto,
                {
                  backgroundColor: deteccion.sincronizado
                    ? COLORS.success
                    : COLORS.warning,
                },
              ]} />
              <Text style={styles.syncTexto}>
                {deteccion.sincronizado ? 'Sincronizado' : 'Pendiente'}
              </Text>
            </View>
          </View>
        </View>

      </View>
    </View>
  );
};

export default HistorialScreen;

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

  // ── Banner pendiente
  bannerPendiente: {
    flexDirection:     'row',
    alignItems:        'center',
    marginHorizontal:  SPACING.lg,
    backgroundColor:   COLORS.warningLight,
    borderRadius:      RADIUS.md,
    padding:           SPACING.md,
    gap:               SPACING.md,
    borderWidth:       1,
    borderColor:       COLORS.warning,
  },
  bannerEmoji: { fontSize: 24 },
  bannerTexto: { flex: 1 },
  bannerTitulo: {
    fontSize:   FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color:      COLORS.warning,
  },
  bannerSub: {
    fontSize: FONT_SIZE.xs,
    color:    COLORS.textSecondary,
  },

  // ── Filtros
  filtrosContainer: {
    paddingHorizontal: SPACING.lg,
    gap:               SPACING.sm,
  },
  filtroPill: {
    paddingHorizontal: SPACING.md,
    paddingVertical:   SPACING.sm,
    borderRadius:      RADIUS.full,
    backgroundColor:   COLORS.bgCard,
    borderWidth:       1.5,
    borderColor:       COLORS.border,
  },
  filtroPillActivo: {
    backgroundColor: COLORS.primary,
    borderColor:     COLORS.primary,
  },
  filtroTexto: {
    fontSize:   FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color:      COLORS.textSecondary,
  },
  filtroTextoActivo: {
    color: COLORS.white,
  },

  // ── Lista
  listaContainer: {
    paddingHorizontal: SPACING.lg,
    gap:               SPACING.md,
  },

  // ── Estado vacío
  vacio: {
    alignItems:  'center',
    paddingTop:  SPACING.xxl,
    gap:         SPACING.md,
  },
  vacioEmoji: { fontSize: 56 },
  vacioTitulo: {
    fontSize:   FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color:      COLORS.textSecondary,
  },
  vacioSub: {
    fontSize:  FONT_SIZE.md,
    color:     COLORS.textMuted,
    textAlign: 'center',
  },

  // ── Tarjeta
  tarjeta: {
    flexDirection:   'row',
    backgroundColor: COLORS.bgCard,
    borderRadius:    RADIUS.lg,
    overflow:        'hidden',
    borderWidth:     1,
    borderColor:     COLORS.border,
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 1 },
    shadowOpacity:   0.05,
    shadowRadius:    3,
    elevation:       1,
  },
  tarjetaFranja: {
    width: 5,
  },
  tarjetaContenido: {
    flex:    1,
    padding: SPACING.md,
    gap:     SPACING.sm,
  },
  tarjetaTop: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           SPACING.sm,
  },
  tarjetaEmoji: { fontSize: 32 },
  tarjetaInfo:  { flex: 1 },
  tarjetaCultivo: {
    fontSize:   FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color:      COLORS.textPrimary,
  },
  tarjetaFecha: {
    fontSize: FONT_SIZE.xs,
    color:    COLORS.textMuted,
    marginTop: 2,
  },
  tarjetaBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical:   4,
    borderRadius:      RADIUS.full,
  },
  tarjetaBadgeText: {
    fontSize:   FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
  },
  tarjetaBottom: {
    gap: SPACING.xs,
  },
  tarjetaEnfermedad: {
    fontSize:   FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color:      COLORS.danger,
  },
  tarjetaMeta: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
  },
  tarjetaConfianza: {
    fontSize: FONT_SIZE.xs,
    color:    COLORS.textMuted,
  },
  syncIndicador: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           4,
  },
  syncPunto: {
    width:        8,
    height:       8,
    borderRadius: RADIUS.full,
  },
  syncTexto: {
    fontSize: FONT_SIZE.xs,
    color:    COLORS.textMuted,
  },
});