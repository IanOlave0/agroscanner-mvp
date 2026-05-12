/**
 * @file src/screens/mapa/MapaScreen.tsx
 * @description Pantalla de mapa de calor por parcela.
 * Permite seleccionar una parcela y ver sus estadisticas de detecciones.
 * El heatmap visual se integrara en la Fase 4 (Mapbox).
 *
 * @author AgroScanner Team
 */

import React, { useState, useEffect } from 'react';
import {
  ScrollView, StatusBar, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { YStack, XStack, Text } from 'tamagui';
import {
  Map, Sprout, ChevronDown, ChevronRight,
  AlertTriangle, CheckCircle2, MapPin, SearchX, Ruler,
} from 'lucide-react-native';

import { COLORS, SHADOW } from '../../constants';
import { useAuth } from '../../context/AuthContext';
import { getParcelasByUsuario, getDeteccionesByParcela } from '../../database/queries';
import { Parcela, Deteccion } from '../../types';
import { formatearArea } from '../../utils/geometria';

const MapaScreen = () => {
  const { usuarioId } = useAuth();
  const [parcelas, setParcelas] = useState<Parcela[]>([]);
  const [parcelaSeleccionada, setParcelaSeleccionada] = useState<Parcela | null>(null);
  const [detecciones, setDetecciones] = useState<Deteccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrandoSelector, setMostrandoSelector] = useState(false);

  useEffect(() => {
    cargarParcelas();
  }, [usuarioId]);

  useEffect(() => {
    if (parcelaSeleccionada) {
      cargarDetecciones(parcelaSeleccionada.id);
    }
  }, [parcelaSeleccionada]);

  const cargarParcelas = async () => {
    try {
      const lista = await getParcelasByUsuario(usuarioId);
      const filtradas = lista.filter((p: Parcela) => p.id !== 'guest-parcela');
      setParcelas(filtradas);
      if (filtradas.length > 0) {
        setParcelaSeleccionada(filtradas[0]);
      }
    } catch (error) {
      console.error('[MapaScreen] Error cargando parcelas:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarDetecciones = async (parcelaId: string) => {
    try {
      const lista = await getDeteccionesByParcela(parcelaId);
      setDetecciones(lista);
    } catch (error) {
      console.error('[MapaScreen] Error cargando detecciones:', error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bgPrimary }} edges={['top']}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  if (parcelas.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bgPrimary }} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgPrimary} />
        <YStack flex={1} alignItems="center" justifyContent="center" gap="$md" px="$xl">
          <SearchX size={56} color={COLORS.textMuted} />
          <Text fontSize={22} fontWeight="700" color="$textSecondary" textAlign="center">
            Sin parcelas registradas
          </Text>
          <Text fontSize={16} color="$textMuted" textAlign="center">
            Registra una parcela en la pantalla de inicio para ver su mapa de calor.
          </Text>
        </YStack>
      </SafeAreaView>
    );
  }

  const ultimaDeteccion = detecciones.length > 0 ? detecciones[0] : null;
  const conteoPositivas = detecciones.filter(d => d.enfermedad_id).length;
  const enfermedadMasComun = getEnfermedadMasComun(detecciones);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bgPrimary }} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgPrimary} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack px="$lg" pt="$xl" pb="$xxl" gap="$lg">

          {/* Header */}
          <YStack gap="$xs">
            <Text fontSize={28} fontWeight="800" color="$textPrimary">
              Mapa de Calor
            </Text>
            <Text fontSize={16} color="$textSecondary">
              Visualizacion de detecciones por parcela
            </Text>
          </YStack>

          {/* Selector de parcela */}
          <YStack gap="$sm">
            <Text fontSize={14} fontWeight="600" color="$textMuted">
              Seleccionar parcela
            </Text>
            <TouchableOpacity
              onPress={() => setMostrandoSelector(!mostrandoSelector)}
              activeOpacity={0.85}
            >
              <XStack
                bg="$white"
                borderRadius="$lg"
                p="$md"
                alignItems="center"
                justifyContent="space-between"
                borderWidth={1}
                borderColor="$border"
                style={SHADOW.sm}
              >
                <XStack alignItems="center" gap="$sm">
                  <MapPin size={18} color={COLORS.primary} />
                  <Text fontSize={16} fontWeight="600" color="$textPrimary">
                    {parcelaSeleccionada?.alias || 'Selecciona una parcela'}
                  </Text>
                </XStack>
                <ChevronDown size={20} color={COLORS.textSecondary} />
              </XStack>
            </TouchableOpacity>

            {mostrandoSelector && (
              <YStack
                bg="$white"
                borderRadius="$lg"
                borderWidth={1}
                borderColor="$border"
                overflow="hidden"
                style={SHADOW.sm}
              >
                {parcelas.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    onPress={() => {
                      setParcelaSeleccionada(p);
                      setMostrandoSelector(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <XStack
                      bg={parcelaSeleccionada?.id === p.id ? '$bgGreen' : 'transparent'}
                      p="$md"
                      alignItems="center"
                      justifyContent="space-between"
                      borderBottomWidth={0.5}
                      borderBottomColor="$border"
                    >
                      <XStack alignItems="center" gap="$sm">
                        <Sprout size={16} color={COLORS.primary} />
                        <Text fontSize={15} fontWeight="500" color="$textPrimary">
                          {p.alias}
                        </Text>
                      </XStack>
                      <Text fontSize={12} color="$textMuted">
                        {formatearArea(p.metros_cuadrados)}
                      </Text>
                    </XStack>
                  </TouchableOpacity>
                ))}
              </YStack>
            )}
          </YStack>

          {/* Placeholder del mapa */}
          <YStack
            height={200}
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
            <Map size={48} color={COLORS.primary} />
            <Text fontSize={18} fontWeight="700" color="$primary" textAlign="center">
              Heatmap disponible pronto
            </Text>
            <Text fontSize={14} color="$textMuted" textAlign="center">
              Se integrara con Mapbox en la Fase 4 para visualizar detecciones sobre el poligono de la parcela.
            </Text>
          </YStack>

          {/* Estadisticas de la parcela seleccionada */}
          {parcelaSeleccionada && (
            <YStack gap="$md">
              <Text fontSize={18} fontWeight="700" color="$textPrimary">
                {parcelaSeleccionada.alias}
              </Text>

              <XStack flexWrap="wrap" gap="$sm">
                <StatCard
                  valor={detecciones.length}
                  label="Detecciones"
                  icon={AlertTriangle}
                  color={COLORS.primary}
                />
                <StatCard
                  valor={conteoPositivas}
                  label="Positivas"
                  icon={AlertTriangle}
                  color={COLORS.danger}
                />
                <StatCard
                  valor={formatearArea(parcelaSeleccionada.metros_cuadrados)}
                  label="Area"
                  icon={Ruler}
                  color={COLORS.acento}
                />
              </XStack>

              {ultimaDeteccion && (
                <YStack
                  bg="$white"
                  borderRadius="$lg"
                  p="$md"
                  borderWidth={1}
                  borderColor="$border"
                  style={SHADOW.sm}
                  gap="$sm"
                >
                  <Text fontSize={14} fontWeight="600" color="$textMuted">
                    Ultima deteccion
                  </Text>
                  <XStack alignItems="center" gap="$sm">
                    {ultimaDeteccion.enfermedad_id ? (
                      <AlertTriangle size={22} color={COLORS.danger} />
                    ) : (
                      <CheckCircle2 size={22} color={COLORS.success} />
                    )}
                    <YStack flex={1}>
                      <Text fontSize={16} fontWeight="700" color="$textPrimary">
                        {ultimaDeteccion.nombre_enfermedad || ultimaDeteccion.nombre_cultivo || 'Desconocido'}
                      </Text>
                      <Text fontSize={13} color="$textMuted">
                        Confianza: {Math.round(ultimaDeteccion.nivel_confianza)}%
                      </Text>
                    </YStack>
                    <ChevronRight size={18} color={COLORS.textMuted} />
                  </XStack>
                </YStack>
              )}

              {enfermedadMasComun && (
                <YStack
                  bg="$white"
                  borderRadius="$lg"
                  p="$md"
                  borderWidth={1}
                  borderColor="$border"
                  style={SHADOW.sm}
                  gap="$sm"
                >
                  <Text fontSize={14} fontWeight="600" color="$textMuted">
                    Enfermedad mas comun
                  </Text>
                  <XStack alignItems="center" gap="$sm">
                    <AlertTriangle size={22} color={COLORS.danger} />
                    <YStack flex={1}>
                      <Text fontSize={16} fontWeight="700" color="$textPrimary">
                        {enfermedadMasComun.nombre}
                      </Text>
                      <Text fontSize={13} color="$textMuted">
                        {enfermedadMasComun.conteo} de {detecciones.length} detecciones
                      </Text>
                    </YStack>
                  </XStack>
                </YStack>
              )}
            </YStack>
          )}

        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
};

const StatCard = ({
  valor, label, icon: Icon, color,
}: {
  valor: string | number;
  label: string;
  icon: React.ElementType;
  color: string;
}) => (
  <YStack
    width="30%"
    bg="$white"
    borderRadius="$lg"
    p="$md"
    alignItems="center"
    gap={4}
    borderWidth={1}
    borderColor="$border"
    style={SHADOW.sm}
  >
    <Icon size={18} color={color} />
    <Text fontSize={22} fontWeight="800" color={color}>
      {valor}
    </Text>
    <Text fontSize={12} color="$textMuted" textAlign="center">
      {label}
    </Text>
  </YStack>
);

const getEnfermedadMasComun = (detecciones: Deteccion[]) => {
  const conteo: Record<string, { nombre: string; conteo: number }> = {};
  detecciones.forEach(d => {
    if (d.enfermedad_id && d.nombre_enfermedad) {
      if (!conteo[d.nombre_enfermedad]) {
        conteo[d.nombre_enfermedad] = { nombre: d.nombre_enfermedad, conteo: 0 };
      }
      conteo[d.nombre_enfermedad].conteo++;
    }
  });
  const valores = Object.values(conteo);
  if (valores.length === 0) return null;
  return valores.sort((a, b) => b.conteo - a.conteo)[0];
};

export default MapaScreen;
