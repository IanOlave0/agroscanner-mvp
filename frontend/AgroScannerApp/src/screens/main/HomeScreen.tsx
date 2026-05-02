/**
 * Pantalla Home - Panel de control del agricultor
 *
 * Muestra:
 * - Lista de parcelas del usuario
 * - Últimas 3 detecciones con enfermedad y parcela
 * - Acceso rápido a funciones principales
 *
 * ACCESO: Solo usuarios autenticados
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONT_SIZE, FONT_WEIGHT, SPACING, RADIUS, CULTIVOS } from '../../constants';
import { getParcelasByUsuario, getDeteccionesByUsuario, getUsuarioActivo } from '../../database/queries';
import { Parcela, Deteccion, Usuario } from '../../types';
import { RootStackParams } from '../../types';
import { formatearArea, parseGeometria } from '../../utils/geometria';

type TabParams = {
  Home: undefined;
  Scanner: undefined;
  Historial: undefined;
  Mapa: undefined;
  Perfil: undefined;
};

const HomeScreen = () => {
  const navigation = useNavigation<BottomTabNavigationProp<TabParams>>();
  const stackNavigation = useNavigation<NativeStackNavigationProp<RootStackParams>>();
  const [parcelas, setParcelas] = useState<Parcela[]>([]);
  const [detecciones, setDetecciones] = useState<Deteccion[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      cargarDatos();
    }, [])
  );

  const cargarDatos = async () => {
    try {
      const usuario = await getUsuarioActivo() as Usuario | null;
      if (!usuario) {
        return;
      }

      const [listaParcelas, listaDetecciones] = await Promise.all([
        getParcelasByUsuario(usuario.id),
        getDeteccionesByUsuario(usuario.id),
      ]);

      setParcelas(listaParcelas);
      setDetecciones(listaDetecciones);
    } catch (error) {
      console.error('[Home] Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleIrAGestionParcelas = () => {
    stackNavigation.navigate('ParcelaGestion');
  };

  const handleEditarParcela = (id: string) => {
    stackNavigation.navigate('ParcelaCanvas', { parcelaId: id });
  };

  const getNivelRiesgoBadge = (deteccion: Deteccion) => {
    if (!deteccion.enfermedad_id) {
      return { emoji: '🟢', texto: 'Sano' };
    }
    if (deteccion.nivel_confianza >= 80) {
      return { emoji: '🔴', texto: 'Alto' };
    }
    return { emoji: '🟡', texto: 'Medio' };
  };

  const formatFechaRelativa = (fechaStr: string) => {
    const fecha = new Date(fechaStr);
    const ahora = new Date();
    const diffMs = ahora.getTime() - fecha.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHoras = Math.floor(diffMins / 60);
    const diffDias = Math.floor(diffHoras / 24);

    if (diffMins < 60) return `hace ${diffMins}m`;
    if (diffHoras < 24) return `hace ${diffHoras}h`;
    if (diffDias < 7) return `hace ${diffDias}d`;
    return fecha.toLocaleDateString();
  };

  const parcelasVisibles = parcelas.slice(0, 3);
  const hayMasParcelas = parcelas.length > 3;
  const deteccionesRecientes = detecciones.slice(0, 3);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgPrimary} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >

        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.saludo}>Buenos días 👋</Text>
            <Text style={styles.titulo}>Panel de{'\n'}Control</Text>
          </View>
          <TouchableOpacity
            style={styles.perfilBtn}
            onPress={() => navigation.navigate('Perfil')}
          >
            <Text style={styles.perfilEmoji}>👤</Text>
          </TouchableOpacity>
        </View>

        {/* ── Banner offline ── */}
        <View style={styles.bannerOffline}>
          <Text style={styles.bannerEmoji}>📡</Text>
          <View style={styles.bannerTexto}>
            <Text style={styles.bannerTitulo}>Modo sin conexión disponible</Text>
            <Text style={styles.bannerSubtitulo}>
              La IA funciona directo en tu celular
            </Text>
          </View>
        </View>

        {/* ── Lista de parcelas ── */}
        <View style={styles.panelParcelas}>
          <TouchableOpacity
            style={styles.panelHeader}
            onPress={handleIrAGestionParcelas}
            activeOpacity={0.7}
          >
            <View style={styles.panelHeaderLeft}>
              <Text style={styles.panelIcon}>🌱</Text>
              <Text style={styles.panelTitulo}>Mis Parcelas</Text>
            </View>
            <Text style={styles.panelFlecha}>›</Text>
          </TouchableOpacity>

          {parcelas.length === 0 ? (
            <View style={styles.emptyParcelas}>
              <Text style={styles.emptyParcelasText}>
                Sin parcelas registradas
              </Text>
              <Text style={styles.emptyParcelasSub}>
                Toca "Mis Parcelas" para crear tu primera parcela
              </Text>
            </View>
          ) : (
            <>
              {parcelasVisibles.map((parcela) => {
                const vertices = parseGeometria(parcela.geometria);
                return (
                  <TouchableOpacity
                    key={parcela.id}
                    style={styles.parcelaItem}
                    onPress={() => handleEditarParcela(parcela.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.parcelaIconContainer}>
                      <Text style={styles.parcelaIcon}>📍</Text>
                    </View>
                    <View style={styles.parcelaInfo}>
                      <Text style={styles.parcelaNombre}>{parcela.alias}</Text>
                      <Text style={styles.parcelaMeta}>
                        {vertices.length} vértices · {formatearArea(parcela.metros_cuadrados)}
                      </Text>
                    </View>
                    <Text style={styles.parcelaFlecha}>›</Text>
                  </TouchableOpacity>
                );
              })}
            </>
          )}
        </View>

        {/* ── Detecciones recientes ── */}
        {deteccionesRecientes.length > 0 ? (
          <>
            <Text style={styles.seccionTitulo}>Detecciones recientes</Text>
            <View style={styles.deteccionesContainer}>
              {deteccionesRecientes.map((deteccion) => {
                const badge = getNivelRiesgoBadge(deteccion);
                return (
                  <View key={deteccion.id} style={styles.deteccionCard}>
                    <View style={styles.deteccionInfo}>
                      <Text style={styles.deteccionEnfermedad}>
                        {deteccion.enfermedad_id
                          ? deteccion.nombre_enfermedad || 'Enfermedad detectada'
                          : 'Sano'}
                      </Text>
                      <Text style={styles.deteccionParcela}>
                        {deteccion.nombre_cultivo || 'Cultivo'} • {deteccion.parcela_alias || 'Sin parcela'}
                      </Text>
                    </View>
                    <View style={styles.deteccionRight}>
                      <Text style={styles.deteccionBadge}>{badge.emoji}</Text>
                      <Text style={styles.deteccionTiempo}>
                        {formatFechaRelativa(deteccion.fecha_creacion || '')}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        ) : (
          <View style={styles.emptyDetecciones}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>
              Sin detecciones aún. Ve a "Escanear" para comenzar.
            </Text>
          </View>
        )}

        {/* ── Acceso rápido ── */}
        <Text style={styles.seccionTitulo}>Acceso rápido</Text>
        <View style={styles.accesoRow}>

          <TouchableOpacity
            style={styles.accesoBtn}
            onPress={() => navigation.navigate('Historial')}
            activeOpacity={0.85}
          >
            <Text style={styles.accesoEmoji}>📋</Text>
            <Text style={styles.accesoLabel}>Ver historial</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.accesoBtn}
            onPress={() => navigation.navigate('Mapa')}
            activeOpacity={0.85}
          >
            <Text style={styles.accesoEmoji}>🗺️</Text>
            <Text style={styles.accesoLabel}>Mapa de calor</Text>
          </TouchableOpacity>

        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: COLORS.bgPrimary,
  },
  scroll: {
    paddingHorizontal: SPACING.lg,
    paddingTop:        SPACING.md,
    paddingBottom:     SPACING.xxl,
    gap:               SPACING.md,
  },
  header: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
    marginBottom:   SPACING.xs,
  },
  saludo: {
    fontSize: FONT_SIZE.md,
    color:    COLORS.textSecondary,
  },
  titulo: {
    fontSize:   FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.extrabold,
    color:      COLORS.textPrimary,
    lineHeight: 36,
    marginTop:  SPACING.xs,
  },
  perfilBtn: {
    width:           48,
    height:          48,
    borderRadius:    RADIUS.full,
    backgroundColor: COLORS.bgGreen,
    borderWidth:     2,
    borderColor:     COLORS.primary,
    alignItems:      'center',
    justifyContent:  'center',
  },
  perfilEmoji: { fontSize: 22 },
  bannerOffline: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: COLORS.bgGreen,
    borderRadius:    RADIUS.md,
    padding:         SPACING.md,
    gap:             SPACING.md,
    borderWidth:     1,
    borderColor:     COLORS.primaryLight,
  },
  bannerEmoji:    { fontSize: 28 },
  bannerTexto:    { flex: 1 },
  bannerTitulo: {
    fontSize:   FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color:      COLORS.primary,
  },
  bannerSubtitulo: {
    fontSize: FONT_SIZE.sm,
    color:    COLORS.textSecondary,
  },
  seccionTitulo: {
    fontSize:   FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color:      COLORS.textPrimary,
    marginTop:  SPACING.xs,
  },
  panelParcelas: {
    backgroundColor: COLORS.white,
    borderRadius:    RADIUS.lg,
    overflow:        'hidden',
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 2 },
    shadowOpacity:   0.1,
    shadowRadius:    4,
    elevation:       3,
  },
  panelHeader: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'space-between',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  panelHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  panelIcon: {
    fontSize: 20,
  },
  panelTitulo: {
    fontSize:   FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color:      COLORS.white,
  },
  panelFlecha: {
    fontSize:   FONT_SIZE.xl,
    color:      COLORS.white,
    fontWeight: FONT_WEIGHT.bold,
  },
  emptyParcelas: {
    padding: SPACING.lg,
    alignItems: 'center',
    backgroundColor: COLORS.bgPrimary,
    gap: SPACING.xs,
  },
  emptyParcelasText: {
    fontSize: FONT_SIZE.sm,
    color:    COLORS.textMuted,
  },
  emptyParcelasSub: {
    fontSize:   FONT_SIZE.xs,
    color:      COLORS.textMuted,
    textAlign:  'center',
  },
  parcelaItem: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: COLORS.bgPrimary,
    padding:         SPACING.md,
    gap:             SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  parcelaIconContainer: {
    width:         36,
    height:        36,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.bgGreen,
    alignItems:   'center',
    justifyContent: 'center',
  },
  parcelaIcon: {
    fontSize: 18,
  },
  parcelaInfo: { flex: 1 },
  parcelaNombre: {
    fontSize:   FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color:      COLORS.textPrimary,
  },
  parcelaMeta: {
    fontSize: FONT_SIZE.sm,
    color:    COLORS.textSecondary,
    marginTop: 2,
  },
  parcelaFlecha: {
    fontSize:   FONT_SIZE.xl,
    color:      COLORS.textMuted,
    fontWeight: FONT_WEIGHT.bold,
  },
  deteccionesContainer: {
    gap: SPACING.sm,
  },
  deteccionCard: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: COLORS.white,
    borderRadius:    RADIUS.md,
    padding:         SPACING.md,
    gap:             SPACING.md,
  },
  deteccionInfo: { flex: 1, gap: 2 },
  deteccionEnfermedad: {
    fontSize:   FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color:      COLORS.textPrimary,
  },
  deteccionParcela: {
    fontSize: FONT_SIZE.sm,
    color:    COLORS.textSecondary,
  },
  deteccionRight: {
    alignItems: 'flex-end',
    gap:        4,
  },
  deteccionBadge: { fontSize: 18 },
  deteccionTiempo: {
    fontSize:   FONT_SIZE.xs,
    color:      COLORS.textMuted,
  },
  emptyDetecciones: {
    backgroundColor: COLORS.white,
    borderRadius:    RADIUS.lg,
    padding:         SPACING.lg,
    alignItems:     'center',
    gap:             SPACING.sm,
  },
  emptyIcon:  { fontSize: 40 },
  emptyText: {
    fontSize:  FONT_SIZE.sm,
    color:     COLORS.textSecondary,
    textAlign: 'center',
  },
  accesoRow: {
    flexDirection: 'row',
    gap:           SPACING.sm,
  },
  accesoBtn: {
    flex:            1,
    backgroundColor: COLORS.white,
    borderRadius:    RADIUS.lg,
    padding:         SPACING.md,
    alignItems:      'center',
    gap:             SPACING.sm,
    borderWidth:     1,
    borderColor:     COLORS.border,
  },
  accesoEmoji: { fontSize: 32 },
  accesoLabel: {
    fontSize:   FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color:      COLORS.textSecondary,
    textAlign:  'center',
  },
});