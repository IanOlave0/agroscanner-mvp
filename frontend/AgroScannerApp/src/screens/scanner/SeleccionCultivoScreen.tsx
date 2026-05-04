/**
 * @file src/screens/scanner/SeleccionCultivoScreen.tsx
 * @description Pantalla de selección de cultivo previo al escaneo.
 * Permite al usuario elegir qué tipo de cultivo va a fotografiar
 * antes de entrar a la cámara.
 *
 * Migración UI/UX:
 * - Layout reemplazado de View/StyleSheet a stacks de Tamagui (YStack, XStack).
 * - Iconos de emojis migrados a vectoriales de Lucide React Native.
 * - Iconos de cultivos reemplazados por componentes SVG vectoriales.
 *
 * @author AgroScanner Team
 */

import React from 'react';
import {
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { YStack, XStack, Text } from 'tamagui';
import { Camera, ChevronRight } from 'lucide-react-native';

import { RootStackParams } from '../../types';
import { COLORS, SHADOW } from '../../constants';
import { LimonIcon, PapayaIcon, PlatanoIcon } from '../../components/icons';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParams, 'SeleccionCultivo'>;
};

const SeleccionCultivoScreen = ({ navigation }: Props) => {

  const cultivos = [
    { id: 1, data: require('../../constants').CULTIVOS.limon },
    { id: 2, data: require('../../constants').CULTIVOS.papaya },
    { id: 3, data: require('../../constants').CULTIVOS.platano },
  ];

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
        <YStack px="$lg" pt="$xl" pb="$xxl" gap="$lg">

          {/* ── Header ───────────────────────────────────────────── */}
          <YStack gap="$xs">
            <Text fontSize={28} fontWeight="800" color="$textPrimary">
              Seleccionar cultivo
            </Text>
            <Text fontSize={16} color="$textSecondary" lineHeight={22}>
              Elige el cultivo antes de tomar la foto de la hoja
            </Text>
          </YStack>

          {/* ── Instrucciones ────────────────────────────────────── */}
          <YStack bg="$bgGreen" borderRadius="$lg" p="$md" gap="$sm" borderWidth={1} borderColor="$primaryLight">
            <XStack alignItems="center" gap="$sm">
              <Camera size={20} color={COLORS.primary} />
              <Text fontSize={16} fontWeight="700" color="$primary">
                ¿Cómo tomar la foto?
              </Text>
            </XStack>
            <Text fontSize={14} color="$textSecondary" lineHeight={24}>
              • Enfoca una sola hoja{'\n'}
              • Busca buena iluminación natural{'\n'}
              • Mantén el celular estable{'\n'}
              • La hoja debe ocupar la mayor parte de la pantalla
            </Text>
          </YStack>

          {/* ── Tarjetas de cultivos ─────────────────────────────── */}
          <Text fontSize={18} fontWeight="700" color="$textPrimary">
            ¿Qué cultivo vas a analizar?
          </Text>

          <YStack gap="$md">
            {cultivos.map((c) => {
              const cultivo = c.data;
              return (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => navigation.navigate('Camara', {
                    cultivoId:     cultivo.id,
                    cultivoNombre: cultivo.nombre,
                  })}
                  activeOpacity={0.85}
                >
                  <XStack
                    alignItems="center"
                    bg="$bgCard"
                    borderRadius="$xl"
                    p="$md"
                    gap="$md"
                    borderWidth={1.5}
                    borderColor={cultivo.color}
                    style={SHADOW.sm}
                  >
                    {/* Icono del cultivo */}
                    <YStack
                      width={80}
                      height={80}
                      borderRadius="$lg"
                      bg={cultivo.colorFondo}
                      alignItems="center"
                      justifyContent="center"
                    >
                      {getIconoCultivo(c.id, 44)}
                    </YStack>

                    {/* Info del cultivo */}
                    <YStack flex={1} gap="$xs">
                      <Text fontSize={22} fontWeight="700" color={cultivo.color}>
                        {cultivo.nombre}
                      </Text>
                      <Text fontSize={14} color="$textSecondary" lineHeight={18}>
                        {cultivo.descripcion}
                      </Text>
                      <YStack
                        alignSelf="flex-start"
                        borderRadius="$full"
                        py={4}
                        px="$sm"
                        mt={4}
                        bg={cultivo.colorFondo}
                      >
                        <Text fontSize={12} fontWeight="600" color={cultivo.color}>
                          {cultivo.enfermedad}
                        </Text>
                      </YStack>
                    </YStack>

                    {/* Flecha */}
                    <ChevronRight size={28} color={cultivo.color} />
                  </XStack>
                </TouchableOpacity>
              );
            })}
          </YStack>

        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SeleccionCultivoScreen;
