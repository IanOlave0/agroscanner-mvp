/**
 * Pantalla de Decisión de Resultado
 * 
 * Flujo inteligente que bifurca según el contexto del usuario:
 * - SIN CUENTA: Muestra resultado sin guardar + CTA para registrarse
 * - CON CUENTA + SIN PARCELAS: Prompt para crear parcela primero
 * - CON CUENTA + CON PARCELAS: Navega a PinPlacementScreen
 * 
 * IMPORTANTE:
 * - Usuarios sin cuenta NO guardan detecciones (no tienen usuario_id válido)
 * - Solo usuarios con cuenta y parcelas pueden geolocalizar detecciones
 */
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParams, ResultadoIA } from '../../types';
import { COLORS, FONT_SIZE, FONT_WEIGHT, SPACING, RADIUS } from '../../constants';
import { getUsuarioActivo, getParcelasByUsuario } from '../../database/queries';
import { Usuario, Parcela } from '../../types';

type ResultadoDecisionNavigationProp = NativeStackNavigationProp<RootStackParams, 'ResultadoDecision'>;
type ResultadoDecisionRouteProp = RouteProp<RootStackParams, 'ResultadoDecision'>;

type Props = {
  navigation: ResultadoDecisionNavigationProp;
  route: ResultadoDecisionRouteProp;
};

export default function ResultadoDecisionScreen({ navigation, route }: Props) {
  const { resultado, imagenUri, cultivoId } = route.params;
  
  const [loading, setLoading] = useState(true);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [tieneParcelas, setTieneParcelas] = useState(false);
  const [flujo, setFlujo] = useState<'sin_cuenta' | 'sin_parcelas' | 'con_parcelas' | null>(null);

  useEffect(() => {
    verificarContexto();
  }, []);

  /**
   * Verifica el contexto del usuario y determina el flujo apropiado
   */
  const verificarContexto = async () => {
    try {
      const user = await getUsuarioActivo() as Usuario | null;
      
      if (!user || !user.token) {
        // Usuario sin cuenta
        setUsuario(null);
        setFlujo('sin_cuenta');
      } else {
        setUsuario(user);
        
        // Verificar si tiene parcelas
        const parcelas = await getParcelasByUsuario(user.id);
        if (parcelas.length > 0) {
          setTieneParcelas(true);
          setFlujo('con_parcelas');
        } else {
          setTieneParcelas(false);
          setFlujo('sin_parcelas');
        }
      }
    } catch (error) {
      console.error('[ResultadoDecision] Error verificando contexto:', error);
      setFlujo('sin_cuenta');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Flujo: Usuario sin cuenta
   * Muestra resultado sin guardar + CTA para registrarse
   */
  const renderSinCuenta = () => (
    <View style={styles.content}>
      {/* Header de resultado */}
      <View style={[styles.header, { backgroundColor: resultado.resultado_positivo ? COLORS.danger : COLORS.success }]}>
        <Text style={styles.headerLabel}>Resultado del Análisis</Text>
        <Text style={styles.headerPorcentaje}>{(resultado.confianza * 100).toFixed(0)}%</Text>
        <Text style={styles.headerConfianza}>
          {resultado.resultado_positivo ? 'Probabilidad de infección' : 'Planta sana'}
        </Text>
      </View>

      {/* Tarjeta de diagnóstico */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Enfermedad detectada:</Text>
        <Text style={[styles.cardPrincipal, { color: resultado.resultado_positivo ? COLORS.danger : COLORS.success }]}>
          {resultado.enfermedad}
        </Text>
        <View style={styles.divider} />
        <Text style={styles.cardLabel}>Tratamiento sugerido:</Text>
        <Text style={styles.cardSub}>{resultado.tratamiento}</Text>
      </View>

      {/* CTA Registro */}
      <View style={styles.ctaContainer}>
        <View style={styles.ctaCard}>
          <Text style={styles.ctaIcon}>📍</Text>
          <Text style={styles.ctaTitle}>¿Quieres geolocalizar tus detecciones?</Text>
          <Text style={styles.ctaText}>
            Crea una cuenta para registrar tus parcelas y ubicar exactamente dónde están las plantas enfermas.
          </Text>
          <TouchableOpacity 
            style={styles.ctaButton}
            onPress={() => navigation.navigate('Welcome')}
          >
            <Text style={styles.ctaButtonText}>Crear cuenta gratis</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Botones de acción */}
      <View style={styles.btnGroup}>
        <TouchableOpacity 
          style={styles.btnVolver} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.btnVolverText}>Volver al inicio</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  /**
   * Flujo: Usuario con cuenta pero sin parcelas
   * Prompt para crear parcela primero
   */
  const renderSinParcelas = () => (
    <View style={styles.content}>
      {/* Header de resultado */}
      <View style={[styles.header, { backgroundColor: resultado.resultado_positivo ? COLORS.danger : COLORS.success }]}>
        <Text style={styles.headerLabel}>Resultado del Análisis</Text>
        <Text style={styles.headerPorcentaje}>{(resultado.confianza * 100).toFixed(0)}%</Text>
        <Text style={styles.headerConfianza}>
          {resultado.resultado_positivo ? 'Probabilidad de infección' : 'Planta sana'}
        </Text>
      </View>

      {/* Tarjeta de diagnóstico */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Enfermedad detectada:</Text>
        <Text style={[styles.cardPrincipal, { color: resultado.resultado_positivo ? COLORS.danger : COLORS.success }]}>
          {resultado.enfermedad}
        </Text>
        <View style={styles.divider} />
        <Text style={styles.cardLabel}>Tratamiento sugerido:</Text>
        <Text style={styles.cardSub}>{resultado.tratamiento}</Text>
      </View>

      {/* Prompt para crear parcela */}
      <View style={styles.promptContainer}>
        <View style={styles.promptCard}>
          <Text style={styles.promptIcon}>📐</Text>
          <Text style={styles.promptTitle}>Necesitas registrar una parcela</Text>
          <Text style={styles.promptText}>
            Para guardar esta detección con ubicación exacta, primero debes dibujar al menos una parcela en el mapa.
          </Text>
          <View style={styles.promptButtons}>
            <TouchableOpacity 
              style={styles.promptButton}
              onPress={() => navigation.navigate('ParcelaCanvas', { parcelaId: undefined })}
            >
              <Text style={styles.promptButtonText}>Crear mi primera parcela</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Botones de acción */}
      <View style={styles.btnGroup}>
        <TouchableOpacity 
          style={styles.btnSecundario}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.btnSecundarioText}>Volver al inicio</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  /**
   * Flujo: Usuario con cuenta y con parcelas
   * Navega a PinPlacementScreen
   */
  const renderConParcelas = () => {
    // Auto-navegar a PinPlacement
    navigation.replace('PinPlacement', { resultado, imagenUri, cultivoId });
    return null;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Verificando tu cuenta...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {flujo === 'sin_cuenta' && renderSinCuenta()}
      {flujo === 'sin_parcelas' && renderSinParcelas()}
      {flujo === 'con_parcelas' && renderConParcelas()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bgPrimary,
    gap: SPACING.md,
  },
  loadingText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  content: {
    paddingBottom: SPACING.xxl,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
  },
  headerLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
  },
  headerPorcentaje: {
    color: COLORS.white,
    fontSize: 64,
    fontWeight: FONT_WEIGHT.extrabold,
  },
  headerConfianza: {
    color: COLORS.white,
    fontSize: FONT_SIZE.md,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginHorizontal: SPACING.lg,
    marginTop: -30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
  },
  cardLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  cardPrincipal: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    marginBottom: 12,
  },
  cardSub: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  ctaContainer: {
    padding: SPACING.lg,
  },
  ctaCard: {
    backgroundColor: COLORS.primaryBg,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  ctaIcon: {
    fontSize: 48,
  },
  ctaTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  ctaText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  ctaButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.md,
    marginTop: SPACING.sm,
  },
  ctaButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
  },
  promptContainer: {
    padding: SPACING.lg,
  },
  promptCard: {
    backgroundColor: COLORS.acentoLight,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.acento + '40',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  promptIcon: {
    fontSize: 48,
  },
  promptTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  promptText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  promptButtons: {
    marginTop: SPACING.sm,
    width: '100%',
  },
  promptButton: {
    backgroundColor: COLORS.acento,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  promptButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
  },
  btnGroup: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    gap: SPACING.md,
  },
  btnVolver: {
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  btnVolverText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
  },
  btnSecundario: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  btnSecundarioText: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.bold,
    fontSize: FONT_SIZE.md,
  },
});