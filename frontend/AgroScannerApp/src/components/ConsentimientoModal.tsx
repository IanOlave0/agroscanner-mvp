/**
 * Modal de consentimiento para compartir datos anonimos.
 *
 * Se muestra tras la primera deteccion guardada por el usuario.
 * El agricultor decide si sus detecciones se comparten de forma
 * anonima para alertar a otros productores sobre brotes de plagas.
 *
 * @author AgroScanner Team
 */

import React from 'react';
import { Modal, TouchableOpacity, View, ScrollView } from 'react-native';
import { YStack, XStack, Text } from 'tamagui';
import { Shield, Sprout, Users } from 'lucide-react-native';
import { COLORS, RADIUS, SHADOW } from '../constants';

interface ConsentimientoModalProps {
  visible: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

const ConsentimientoModal = ({ visible, onAccept, onDecline }: ConsentimientoModalProps) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    statusBarTranslucent
  >
    <View style={{
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.55)',
      justifyContent: 'flex-end',
    }}>
      <ScrollView
        bounces={false}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'flex-end',
          paddingBottom: 20,
        }}
      >
        <YStack
          bg={COLORS.white}
          mx={20}
          borderRadius={RADIUS.xl}
          p={24}
          gap={20}
          style={SHADOW.lg}
        >
          {/* Icono */}
          <YStack alignItems="center">
            <YStack
              width={72}
              height={72}
              borderRadius={RADIUS.full}
              bg={COLORS.primaryBg}
              alignItems="center"
              justifyContent="center"
              borderWidth={2}
              borderColor={COLORS.primaryLight}
            >
              <Sprout size={36} color={COLORS.primary} />
            </YStack>
          </YStack>

          {/* Titulo */}
          <Text
            fontSize={22}
            fontWeight="800"
            color={COLORS.textPrimary}
            textAlign="center"
          >
            Ayudas a cuidar el campo?
          </Text>

          {/* Mensaje */}
          <Text
            fontSize={15}
            color={COLORS.textSecondary}
            textAlign="center"
            lineHeight={22}
          >
            Tus escaneos pueden alertar a otros productores de la zona
            sobre brotes de plagas antes de que se expandan.
          </Text>

          {/* Garantias de privacidad */}
          <YStack
            bg={COLORS.primaryBg}
            borderRadius={RADIUS.md}
            p={16}
            gap={12}
            borderWidth={1}
            borderColor={COLORS.primaryLight}
          >
            <XStack alignItems="flex-start" gap={10}>
              <Shield size={18} color={COLORS.primary} style={{ marginTop: 2 }} />
              <YStack flex={1}>
                <Text fontSize={14} fontWeight="700" color={COLORS.primary}>
                  Lo que NUNCA compartimos:
                </Text>
                <Text fontSize={13} color={COLORS.textSecondary} lineHeight={19} mt={2}>
                  Tu nombre ni tus datos personales. La ubicacion exacta
                  de tu parcela nunca sera revelada.
                </Text>
              </YStack>
            </XStack>

            <XStack alignItems="flex-start" gap={10}>
              <Users size={18} color={COLORS.primary} style={{ marginTop: 2 }} />
              <YStack flex={1}>
                <Text fontSize={14} fontWeight="700" color={COLORS.primary}>
                  Lo que SI compartimos:
                </Text>
                <Text fontSize={13} color={COLORS.textSecondary} lineHeight={19} mt={2}>
                  Solo la zona general y el tipo de plaga para generar
                  alertas comunitarias y mapas de calor regionales.
                </Text>
              </YStack>
            </XStack>
          </YStack>

          {/* Botones */}
          <YStack gap={12}>
            <TouchableOpacity onPress={onAccept} activeOpacity={0.85}>
              <YStack
                bg={COLORS.primary}
                py={14}
                borderRadius={RADIUS.full}
                alignItems="center"
              >
                <Text fontSize={16} fontWeight="700" color={COLORS.white}>
                  Si, quiero ayudar
                </Text>
              </YStack>
            </TouchableOpacity>

            <TouchableOpacity onPress={onDecline} activeOpacity={0.7}>
              <YStack alignItems="center" py={8}>
                <Text fontSize={14} fontWeight="600" color={COLORS.textMuted}>
                  Por ahora no
                </Text>
              </YStack>
            </TouchableOpacity>
          </YStack>

          {/* Nota */}
          <Text fontSize={12} color={COLORS.textMuted} textAlign="center" lineHeight={17}>
            Puedes cambiar esta decision cuando quieras desde tu perfil.
          </Text>
        </YStack>
      </ScrollView>
    </View>
  </Modal>
);

export default ConsentimientoModal;
