/**
 * @file src/screens/mapa/MapaScreen.tsx
 * @description Pantalla de mapa epidemiológico con vista de heatmap y lista de zonas.
 * Muestra estadísticas de la región y alertas activas.
 *
 * Migración UI/UX:
 * - Layout migrado de View/StyleSheet a stacks de Tamagui (YStack, XStack).
 * - Iconos de emojis migrados a vectoriales de Lucide React Native y SVGs custom.
 *
 * @author AgroScanner Team
 */

import React, { useState } from 'react';
import {
  ScrollView, StatusBar, TouchableOpacity, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { YStack, XStack, Text } from 'tamagui';
import {
  Map, List, BarChart3, AlertTriangle, AlertCircle, Info,
} from 'lucide-react-native';

import { COLORS } from '../../constants';
import { LimonIcon, PapayaIcon, PlatanoIcon } from '../../components/icons';

const { width } = Dimensions.get('window');

// ── Datos de ejemplo del mapa ─────────────────────────────────────────
// Cuando el backend esté listo, estos datos
// vendrán de la API como coordenadas GPS reales
// y se renderizarán con Google Maps SDK
const STATS_MAPA = {
  area_total_ha:    120,
  zona_critica_pct: 15,
  zona_riesgo_pct:  35,
  zona_segura_pct:  50,
  total_detecciones: 28,
  activas_hoy:       4,
};

// Zonas con brotes activos simuladas
const ZONAS_ALERTA = [
  {
    id:          1,
    nombre:      'Parcela Norte — Tecomán',
    enfermedad:  'HLB (Dragón Amarillo)',
    cultivo:     'Limón',
    nivel:       'critico',
    detecciones: 8,
  },
  {
    id:          2,
    nombre:      'Rancho El Limonal — Armería',
    enfermedad:  'Araña Roja',
    cultivo:     'Papaya',
    nivel:       'riesgo',
    detecciones: 5,
  },
  {
    id:          3,
    nombre:      'Huerta Sur — Tecomán',
    enfermedad:  'Sigatoka Negra',
    cultivo:     'Plátano',
    nivel:       'riesgo',
    detecciones: 3,
  },
];

const ICONO_CULTIVO: Record<string, React.ReactNode> = {
  Limón:   <LimonIcon   width={16} height={16} />,
  Papaya:  <PapayaIcon  width={16} height={16} />,
  Plátano: <PlatanoIcon width={16} height={16} />,
};

const MapaScreen = () => {
  const [vistaActiva, setVistaActiva] = useState<'mapa' | 'lista'>('mapa');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bgPrimary }} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgPrimary} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32, gap: 16 }}
      >

        {/* ── Header ─────────────────────────────────────────── */}
        <YStack px="$lg" pt="$xl" gap="$xs">
          <Text fontSize={28} fontWeight="800" color="$textPrimary">
            Mapa de Calor
          </Text>
          <Text fontSize={16} color="$textSecondary">
            Visualización epidemiológica de Colima
          </Text>
        </YStack>

        {/* ── Selector de vista ──────────────────────────────── */}
        <XStack
          mx="$lg"
          bg="$bgCard"
          borderRadius="$lg"
          p={4}
          borderWidth={1}
          borderColor="$border"
          gap={4}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => setVistaActiva('mapa')}
            activeOpacity={0.85}
          >
            <YStack
              alignItems="center"
              py="$sm"
              borderRadius="$md"
              bg={vistaActiva === 'mapa' ? COLORS.primary : 'transparent'}
            >
              <XStack alignItems="center" gap="$xs">
                <Map
                  size={18}
                  color={vistaActiva === 'mapa' ? COLORS.white : COLORS.textSecondary}
                />
                <Text
                  fontSize={16}
                  fontWeight="700"
                  color={vistaActiva === 'mapa' ? '$white' : '$textSecondary'}
                >
                  Mapa
                </Text>
              </XStack>
            </YStack>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => setVistaActiva('lista')}
            activeOpacity={0.85}
          >
            <YStack
              alignItems="center"
              py="$sm"
              borderRadius="$md"
              bg={vistaActiva === 'lista' ? COLORS.primary : 'transparent'}
            >
              <XStack alignItems="center" gap="$xs">
                <List
                  size={18}
                  color={vistaActiva === 'lista' ? COLORS.white : COLORS.textSecondary}
                />
                <Text
                  fontSize={16}
                  fontWeight="700"
                  color={vistaActiva === 'lista' ? '$white' : '$textSecondary'}
                >
                  Zonas
                </Text>
              </XStack>
            </YStack>
          </TouchableOpacity>
        </XStack>

        {vistaActiva === 'mapa' ? (
          <>
            {/* ── Placeholder del mapa ───────────────────────── */}
            <YStack mx="$lg" gap="$md">
              <YStack
                height={280}
                bg="$bgGreen"
                borderRadius="$xl"
                alignItems="center"
                justifyContent="center"
                borderWidth={2}
                borderColor="$primaryLight"
                borderStyle="dashed"
                gap="$sm"
                p="$lg"
              >
                <Map size={64} color={COLORS.primary} />
                <Text fontSize={20} fontWeight="700" color="$primary">
                  Mapa de Calor
                </Text>
                <Text fontSize={16} color="$textSecondary">
                  Colima, México
                </Text>
                <Text fontSize={14} color="$textMuted" textAlign="center" lineHeight={20}>
                  El mapa interactivo con heatmap se integrará con Google Maps SDK en la siguiente fase del proyecto
                </Text>
              </YStack>

              {/* Leyenda del mapa */}
              <YStack
                bg="$bgCard"
                borderRadius="$lg"
                p="$md"
                borderWidth={1}
                borderColor="$border"
                gap="$sm"
              >
                <Text fontSize={14} fontWeight="700" color="$textSecondary">
                  Leyenda
                </Text>
                <XStack gap="$md">
                  <LeyendaItem color={COLORS.semaforoRojo}    label="Zona crítica" />
                  <LeyendaItem color={COLORS.semaforoAmarillo} label="Zona de riesgo" />
                  <LeyendaItem color={COLORS.semaforoVerde}   label="Zona segura" />
                </XStack>
              </YStack>
            </YStack>

            {/* ── Estadísticas de la región ──────────────────── */}
            <XStack alignItems="center" gap="$sm" px="$lg">
              <BarChart3 size={20} color={COLORS.primary} />
              <Text fontSize={18} fontWeight="700" color="$textPrimary">
                Estadísticas de la región
              </Text>
            </XStack>

            <XStack
              flexWrap="wrap"
              px="$lg"
              gap="$sm"
            >
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
            </XStack>

            {/* Detecciones hoy */}
            <XStack
              mx="$lg"
              bg="$bgCard"
              borderRadius="$lg"
              p="$lg"
              borderWidth={1}
              borderColor="$border"
            >
              <YStack flex={1} alignItems="center" gap={4}>
                <Text fontSize={32} fontWeight="800" color="$primary">
                  {STATS_MAPA.total_detecciones}
                </Text>
                <Text fontSize={14} color="$textMuted">
                  Total escaneos
                </Text>
              </YStack>

              <YStack width={1} bg="$border" my="$xs" />

              <YStack flex={1} alignItems="center" gap={4}>
                <Text fontSize={32} fontWeight="800" color="$danger">
                  {STATS_MAPA.activas_hoy}
                </Text>
                <Text fontSize={14} color="$textMuted">
                  Alertas hoy
                </Text>
              </YStack>
            </XStack>
          </>
        ) : (
          <>
            {/* ── Vista de lista de zonas ────────────────────── */}
            <XStack alignItems="center" gap="$sm" px="$lg">
              <AlertTriangle size={20} color={COLORS.danger} />
              <Text fontSize={18} fontWeight="700" color="$textPrimary">
                Zonas con brotes activos
              </Text>
            </XStack>

            <YStack px="$lg" gap="$md">
              {ZONAS_ALERTA.map(zona => (
                <ZonaCard key={zona.id} zona={zona} />
              ))}
            </YStack>
          </>
        )}

        {/* ── Aviso de datos ───────────────────────────────── */}
        <XStack
          mx="$lg"
          bg="$bgGreen"
          borderRadius="$lg"
          p="$md"
          borderWidth={1}
          borderColor="$primaryLight"
          gap="$sm"
          alignItems="flex-start"
        >
          <Info size={20} color={COLORS.primary} style={{ marginTop: 2 }} />
          <Text fontSize={14} color="$textSecondary" lineHeight={20} flex={1}>
            Los datos se actualizan automáticamente cuando los agricultores suben nuevos escaneos. La información refleja reportes de los últimos 30 días.
          </Text>
        </XStack>

      </ScrollView>
    </SafeAreaView>
  );
};

// ── Componente leyenda ────────────────────────────────────────────────
const LeyendaItem = ({ color, label }: { color: string; label: string }) => (
  <XStack alignItems="center" gap={6}>
    <YStack width={12} height={12} borderRadius={999} bg={color} />
    <Text fontSize={12} color="$textSecondary">
      {label}
    </Text>
  </XStack>
);

// ── Componente estadística ────────────────────────────────────────────
const StatBox = ({ valor, label, color }: { valor: string; label: string; color: string }) => (
  <YStack
    width={(width - 32 * 2 - 8) / 2}
    bg="$bgCard"
    borderRadius="$lg"
    p="$md"
    borderTopWidth={4}
    borderWidth={1}
    borderColor="$border"
    gap={4}
  >
    <Text fontSize={28} fontWeight="800" color={color}>
      {valor}
    </Text>
    <Text fontSize={14} color="$textMuted">
      {label}
    </Text>
  </YStack>
);

// ── Componente zona de alerta ─────────────────────────────────────────
const ZonaCard = ({ zona }: { zona: typeof ZONAS_ALERTA[0] }) => {
  const esCritico = zona.nivel === 'critico';
  const color      = esCritico ? COLORS.danger : COLORS.warning;
  const colorFondo = esCritico ? COLORS.dangerLight : COLORS.warningLight;
  const IconoNivel = esCritico ? AlertCircle : AlertTriangle;

  return (
    <YStack
      bg="$bgCard"
      borderRadius="$lg"
      p="$md"
      borderLeftWidth={5}
      borderWidth={1}
      borderColor="$border"
      gap="$xs"
      borderLeftColor={color}
    >
      <XStack justifyContent="space-between" alignItems="center">
        <XStack
          px="$sm"
          py={4}
          borderRadius="$full"
          bg={colorFondo}
          alignItems="center"
          gap="$xs"
        >
          <IconoNivel size={12} color={color} />
          <Text fontSize={12} fontWeight="700" color={color}>
            {esCritico ? 'CRÍTICO' : 'RIESGO'}
          </Text>
        </XStack>
        <Text fontSize={12} color="$textMuted">
          {zona.detecciones} escaneos
        </Text>
      </XStack>

      <Text fontSize={16} fontWeight="700" color="$textPrimary">
        {zona.nombre}
      </Text>

      <XStack alignItems="center" gap="$xs">
        {ICONO_CULTIVO[zona.cultivo]}
        <Text fontSize={14} color="$textSecondary">
          {zona.cultivo}
        </Text>
      </XStack>

      <Text fontSize={14} fontWeight="600" color={color}>
        {zona.enfermedad}
      </Text>
    </YStack>
  );
};

export default MapaScreen;
