/**
 * @file src/screens/parcelas/ParcelaGestionScreen.tsx
 * @description Pantalla de gestión de parcelas del agricultor.
 * Permite ver, crear, editar y eliminar parcelas.
 *
 * Migración UI/UX:
 * - Layout reemplazado de View/StyleSheet a stacks de Tamagui (YStack, XStack).
 * - Header rediseñado: título centrado verde + botón descriptivo full-width.
 * - Iconos de emojis migrados a vectoriales de Lucide React Native.
 *
 * @author AgroScanner Team
 */

import React, { useState, useEffect } from 'react';
import {
  FlatList, TouchableOpacity, Alert, StatusBar, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { YStack, XStack, Text } from 'tamagui';
import {
  Sprout, ArrowLeft, Plus, Pencil, Trash2, MapPin, Ruler,
} from 'lucide-react-native';

import { COLORS, SHADOW } from '../../constants';
import { RootStackParams, Parcela, Usuario } from '../../types';
import { getParcelasByUsuario, getUsuarioActivo, deleteParcela } from '../../database/queries';
import { formatearArea, parseGeometria, getCentroide } from '../../utils/geometria';

type ParcelaGestionNavigationProp = NativeStackNavigationProp<RootStackParams, 'ParcelaGestion'>;

type Props = {
  navigation: ParcelaGestionNavigationProp;
};

// ── Componente de tarjeta para mostrar una parcela en la lista ───────
const ParcelaCard = ({
  parcela,
  onEditar,
  onEliminar,
}: {
  parcela: Parcela;
  onEditar: (id: string) => void;
  onEliminar: (id: string) => void;
}) => {
  const vertices = parseGeometria(parcela.geometria);
  const centroide = getCentroide(vertices);

  return (
    <YStack
      bg="$white"
      borderRadius="$lg"
      p="$md"
      style={SHADOW.md}
      gap="$sm"
    >
      {/* Header de la card */}
      <YStack gap="$xs">
        <Text
          fontSize={18}
          fontWeight="700"
          color="$textPrimary"
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {parcela.alias}
        </Text>
        <XStack alignItems="center" gap="$xs">
          <Ruler size={16} color={COLORS.primary} />
          <Text fontSize={16} fontWeight="600" color="$primary">
            {formatearArea(parcela.metros_cuadrados)}
          </Text>
        </XStack>
      </YStack>

      {/* Info de la parcela */}
      <YStack gap="$xs">
        <XStack alignItems="center" gap="$xs">
          <MapPin size={14} color={COLORS.textMuted} />
          <Text fontSize={14} color="$textSecondary">
            Vértices: {vertices.length}
          </Text>
        </XStack>
        <Text fontSize={14} color="$textSecondary">
          Centro: {centroide.lat.toFixed(6)}, {centroide.lng.toFixed(6)}
        </Text>
        <Text fontSize={14} color="$textSecondary">
          Creada: {parcela.fecha_creacion ? new Date(parcela.fecha_creacion).toLocaleDateString() : 'N/A'}
        </Text>
      </YStack>

      {/* Acciones */}
      <XStack gap="$sm" mt="$sm">
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={() => onEditar(parcela.id)}
          activeOpacity={0.85}
        >
          <YStack
            bg="$primaryBg"
            py="$sm"
            borderRadius="$md"
            alignItems="center"
            borderWidth={1}
            borderColor="$primaryLight"
          >
            <XStack alignItems="center" gap="$xs">
              <Pencil size={16} color={COLORS.primary} />
              <Text fontSize={16} fontWeight="600" color="$primary">
                Editar
              </Text>
            </XStack>
          </YStack>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={() => onEliminar(parcela.id)}
          activeOpacity={0.85}
        >
          <YStack
            bg="$dangerLight"
            py="$sm"
            borderRadius="$md"
            alignItems="center"
            borderWidth={1}
            borderColor="$dangerLight"
          >
            <XStack alignItems="center" gap="$xs">
              <Trash2 size={16} color={COLORS.danger} />
              <Text fontSize={16} fontWeight="600" color="$danger">
                Eliminar
              </Text>
            </XStack>
          </YStack>
        </TouchableOpacity>
      </XStack>
    </YStack>
  );
};

export default function ParcelaGestionScreen({ navigation }: Props) {
  const [parcelas, setParcelas] = useState<Parcela[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarParcelas();
  }, []);

  /**
   * Carga todas las parcelas del usuario activo.
   */
  const cargarParcelas = async () => {
    try {
      const usuario = await getUsuarioActivo() as Usuario | null;
      if (!usuario) {
        Alert.alert(
          'Sesión requerida',
          'Debes iniciar sesión para gestionar parcelas',
          [{ text: 'OK', onPress: () => navigation.navigate('Welcome') }]
        );
        return;
      }

      const lista = await getParcelasByUsuario(usuario.id);
      setParcelas(lista);
    } catch (error) {
      console.error('[ParcelaGestion] Error cargando parcelas:', error);
      Alert.alert('Error', 'No se pudieron cargar las parcelas');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Navega a ParcelaCanvasScreen para crear una nueva parcela.
   */
  const handleCrearParcela = () => {
    navigation.navigate('ParcelaCanvas', { parcelaId: undefined });
  };

  /**
   * Navega a ParcelaCanvasScreen para editar una parcela existente.
   */
  const handleEditarParcela = (id: string) => {
    navigation.navigate('ParcelaCanvas', { parcelaId: id });
  };

  /**
   * Elimina una parcela tras confirmación del usuario.
   */
  const handleEliminarParcela = (id: string) => {
    Alert.alert(
      'Eliminar parcela',
      '¿Estás seguro? Se eliminarán todas las detecciones vinculadas.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteParcela(id);
              console.log('[ParcelaGestion] Parcela eliminada:', id);
              await cargarParcelas();
            } catch (error) {
              console.error('[ParcelaGestion] Error eliminando parcela:', error);
              Alert.alert('Error', 'No se pudo eliminar la parcela');
            }
          },
        },
      ]
    );
  };

  // ── Estado de carga ──────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bgPrimary }} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgPrimary} />
        <YStack flex={1} justifyContent="center" alignItems="center" gap="$md">
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text fontSize={16} color="$textSecondary">
            Cargando parcelas...
          </Text>
        </YStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bgPrimary }} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgPrimary} />

      {/* ── Header rediseñado ──────────────────────────────────────── */}
      <YStack bg="$white" borderBottomWidth={1} borderColor="$border" px="$lg" py="$lg" gap="$md">
        {/* Volver */}
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.85}>
          <XStack alignItems="center" gap="$xs">
            <ArrowLeft size={20} color={COLORS.primary} />
            <Text fontSize={14} fontWeight="600" color="$primary">
              Volver
            </Text>
          </XStack>
        </TouchableOpacity>

        {/* Título centrado */}
        <Text
          fontSize={24}
          fontWeight="800"
          color="$primary"
          textAlign="center"
        >
          Mis Parcelas
        </Text>

        {/* Botón descriptivo full-width */}
        <TouchableOpacity onPress={handleCrearParcela} activeOpacity={0.85}>
          <YStack
            bg="$primary"
            py="$md"
            borderRadius="$lg"
            alignItems="center"
            flexDirection="row"
            justifyContent="center"
            gap="$sm"
          >
            <Plus size={20} color={COLORS.white} />
            <Text fontSize={16} fontWeight="700" color="$white">
              Crear Nueva Parcela
            </Text>
          </YStack>
        </TouchableOpacity>
      </YStack>

      {/* ── Contenido ──────────────────────────────────────────────── */}
      {parcelas.length === 0 ? (
        <YStack flex={1} justifyContent="center" alignItems="center" gap="$md" px="$xl">
          <Sprout size={64} color={COLORS.primary} />
          <Text fontSize={18} fontWeight="700" color="$textPrimary" textAlign="center">
            No tienes parcelas registradas
          </Text>
          <Text fontSize={16} color="$textSecondary" textAlign="center" lineHeight={22}>
            Crea tu primera parcela dibujando el polígono en el mapa
          </Text>
          <TouchableOpacity onPress={handleCrearParcela} activeOpacity={0.85}>
            <YStack
              bg="$primary"
              py="$md"
              px="$xl"
              borderRadius="$lg"
              mt="$md"
            >
              <Text fontSize={16} fontWeight="600" color="$white">
                Crear mi primera parcela
              </Text>
            </YStack>
          </TouchableOpacity>
        </YStack>
      ) : (
        <FlatList
          data={parcelas}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ParcelaCard
              parcela={item}
              onEditar={handleEditarParcela}
              onEliminar={handleEliminarParcela}
            />
          )}
          contentContainerStyle={{ padding: 16, gap: 16 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
