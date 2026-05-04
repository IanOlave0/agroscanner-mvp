/**
 * @file src/screens/historial/HistorialScreen.tsx
 * @description Pantalla de historial de detecciones.
 * Muestra el listado de escaneos previos con filtro por cultivo.
 *
 * Migración UI/UX:
 * - Layout reemplazado de View/StyleSheet a stacks de Tamagui (YStack, XStack).
 * - Iconos de emojis migrados a vectoriales de Lucide React Native.
 * - Iconos de cultivos reemplazados por componentes SVG vectoriales.
 * - Tipografía utiliza tokens de color de Tamagui; fontSize usa valores numéricos.
 *
 * @author AgroScanner Team
 */

import React, { useState } from 'react';
import {
  ScrollView, StatusBar, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { YStack, XStack, Text } from 'tamagui';
import {
  CloudOff, Sprout, CheckCircle2, AlertTriangle,
  ChevronRight,
} from 'lucide-react-native';

import { COLORS } from '../../constants';
import { LimonIcon, PapayaIcon, PlatanoIcon } from '../../components/icons';

// ── Datos de ejemplo ───────────────────────────────────────────────
const DETECCIONES_EJEMPLO = [
  {
    id: 1,
    fecha: '2026-03-20 09:15',
    cultivo: 'Limón Mexicano',
    cultivoId: 1,
    enfermedad: 'HLB (Dragón Amarillo)',
    resultado_positivo: true,
    confianza: 0.92,
    sincronizado: true,
  },
  {
    id: 2,
    fecha: '2026-03-20 10:30',
    cultivo: 'Papaya',
    cultivoId: 2,
    enfermedad: 'Araña Roja',
    resultado_positivo: false,
    confianza: 0.88,
    sincronizado: false,
  },
  {
    id: 3,
    fecha: '2026-03-19 14:00',
    cultivo: 'Plátano',
    cultivoId: 3,
    enfermedad: 'Sigatoka Negra',
    resultado_positivo: true,
    confianza: 0.76,
    sincronizado: true,
  },
];

const FILTROS = ['Todos', 'Limón', 'Papaya', 'Plátano'];

const HistorialScreen = () => {
  const [filtroActivo, setFiltroActivo] = useState('Todos');

  const deteccionesFiltradas = DETECCIONES_EJEMPLO.filter(d => {
    if (filtroActivo === 'Todos') return true;
    return d.cultivo.includes(filtroActivo);
  });

  const getIconoCultivo = (id: number, size: number) => {
    switch (id) {
      case 1: return <LimonIcon width={size} height={size} />;
      case 2: return <PapayaIcon width={size} height={size} />;
      case 3: return <PlatanoIcon width={size} height={size} />;
      default: return null;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bgPrimary }} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgPrimary} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack pb="$xxl">

          {/* ── Header ───────────────────────────────────────────── */}
          <YStack px="$lg" pt="$xl" pb="$md" gap="$xs">
            <Text fontSize={28} fontWeight="800" color="$textPrimary">
              Historial
            </Text>
            <Text fontSize={16} color="$textSecondary">
              {deteccionesFiltradas.length} escaneos registrados
            </Text>
          </YStack>

          {/* ── Banner: sin sincronizar ──────────────────────────── */}
          {DETECCIONES_EJEMPLO.some(d => !d.sincronizado) && (
            <XStack mx="$lg" alignItems="center" bg="#FFF9C4" borderRadius="$md" p="$md" gap="$md" mb="$md" borderWidth={1} borderColor="$warning">
              <CloudOff size={24} color={COLORS.warning} />
              <YStack flex={1}>
                <Text fontSize={14} fontWeight="700" color="#856404">
                  Tienes escaneos sin sincronizar
                </Text>
                <Text fontSize={12} color="$textSecondary">
                  Se subirán automáticamente cuando tengas internet
                </Text>
              </YStack>
            </XStack>
          )}

          {/* ── Filtros ──────────────────────────────────────────── */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <XStack px="$lg" gap="$sm" pb="$md">
              {FILTROS.map(filtro => (
                <TouchableOpacity
                  key={filtro}
                  onPress={() => setFiltroActivo(filtro)}
                  activeOpacity={0.85}
                >
                  <YStack
                    px="$md"
                    py="$sm"
                    borderRadius="$full"
                    bg={filtroActivo === filtro ? '$primary' : '$bgCard'}
                    borderWidth={1.5}
                    borderColor={filtroActivo === filtro ? '$primary' : '$border'}
                  >
                    <Text
                      fontSize={14}
                      fontWeight="600"
                      color={filtroActivo === filtro ? '$white' : '$textSecondary'}
                    >
                      {filtro}
                    </Text>
                  </YStack>
                </TouchableOpacity>
              ))}
            </XStack>
          </ScrollView>

          {/* ── Lista de detecciones ─────────────────────────────── */}
          <YStack px="$lg" gap="$md">
            {deteccionesFiltradas.length === 0 ? (
              <YStack alignItems="center" pt="$xxl" gap="$md">
                <Sprout size={56} color={COLORS.primaryLight} />
                <Text fontSize={22} fontWeight="700" color="$textSecondary">
                  Sin escaneos aún
                </Text>
                <Text fontSize={16} color="$textMuted" textAlign="center">
                  Tus diagnósticos aparecerán aquí
                </Text>
              </YStack>
            ) : (
              deteccionesFiltradas.map(deteccion => (
                <TarjetaDeteccion
                  key={deteccion.id}
                  deteccion={deteccion}
                  getIconoCultivo={getIconoCultivo}
                />
              ))
            )}
          </YStack>

        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
};

// ── Subcomponente: Tarjeta de detección ────────────────────────────
const TarjetaDeteccion = ({
  deteccion,
  getIconoCultivo,
}: {
  deteccion: any;
  getIconoCultivo: (id: number, size: number) => React.ReactNode;
}) => {
  const confianzaPct = Math.round(deteccion.confianza * 100);
  const esPositivo = deteccion.resultado_positivo;
  const colorResultado = esPositivo ? COLORS.danger : COLORS.success;

  return (
    <XStack bg="$bgCard" borderRadius="$lg" overflow="hidden" borderWidth={1} borderColor="$border" style={{ elevation: 2 }}>
      {/* Franja de color izquierda */}
      <YStack width={5} bg={colorResultado} />

      <YStack flex={1} p="$md" gap="$sm">
        {/* Top: icono + info + badge */}
        <XStack alignItems="center" gap="$sm">
          {getIconoCultivo(deteccion.cultivoId, 32)}
          <YStack flex={1}>
            <Text fontSize={16} fontWeight="700" color="$textPrimary">
              {deteccion.cultivo}
            </Text>
            <Text fontSize={12} color="$textMuted">
              {deteccion.fecha}
            </Text>
          </YStack>
          <XStack alignItems="center" gap="$xs" px="$sm" py={4} borderRadius="$full" bg={colorResultado + '20'}>
            {esPositivo ? (
              <AlertTriangle size={14} color={colorResultado} />
            ) : (
              <CheckCircle2 size={14} color={colorResultado} />
            )}
            <Text fontSize={12} fontWeight="700" color={colorResultado}>
              {esPositivo ? 'Enfermedad' : 'Sana'}
            </Text>
          </XStack>
        </XStack>

        {/* Bottom: enfermedad + meta */}
        <YStack gap="$xs">
          {esPositivo && (
            <Text fontSize={14} fontWeight="600" color="$danger">
              {deteccion.enfermedad}
            </Text>
          )}
          <XStack justifyContent="space-between" alignItems="center">
            <Text fontSize={12} color="$textMuted">
              Certeza: {confianzaPct}%
            </Text>
            <XStack alignItems="center" gap={4}>
              <YStack width={8} height={8} borderRadius="$full" bg={deteccion.sincronizado ? '$success' : '$warning'} />
              <Text fontSize={12} color="$textMuted">
                {deteccion.sincronizado ? 'Sincronizado' : 'Pendiente'}
              </Text>
            </XStack>
          </XStack>
        </YStack>
      </YStack>
    </XStack>
  );
};

export default HistorialScreen;
