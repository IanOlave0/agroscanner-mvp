import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Share,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONT_SIZE, FONT_WEIGHT, SPACING, RADIUS } from '../../constants';

const ResultadoScreen = () => {
  const navigation = useNavigation();

  const resultado = {
    planta: 'Limón Mexicano',
    diagnostico: 'HLB (Dragón Amarillo)',
    confianza: 94,
    estado: 'critico',
    fecha: new Date().toLocaleDateString(),
    recomendacion: 'Se recomienda el aislamiento de la planta y la aplicación de control fitosanitario para el insecto vector.',
  };

  const handleCompartir = async () => {
    try {
      await Share.share({
        message: `Alerta AgroScanner: Detectado ${resultado.diagnostico} con ${resultado.confianza}% de confianza.`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.danger} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { backgroundColor: COLORS.danger }]}>
          <Text style={styles.headerLabel}>Resultado del Análisis</Text>
          <Text style={styles.headerPorcentaje}>{resultado.confianza}%</Text>
          <Text style={styles.headerConfianza}>Probabilidad de infección</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Detección:</Text>
            <Text style={styles.cardPrincipal}>{resultado.diagnostico}</Text>
            <View style={styles.divider} />
            <Text style={styles.cardLabel}>Cultivo analizado:</Text>
            <Text style={styles.cardSub}>{resultado.planta}</Text>
          </View>

          <View style={styles.recomendaContainer}>
            <Text style={styles.seccionTitulo}>📋 Recomendaciones</Text>
            <View style={styles.recomendaCard}>
              <Text style={styles.recomendaTexto}>{resultado.recomendacion}</Text>
            </View>
          </View>

          <View style={styles.btnGroup}>
            <TouchableOpacity style={styles.btnPrimario} onPress={() => navigation.navigate('Mapa' as never)}>
              <Text style={styles.btnPrimarioText}>Ver en mapa de calor</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnSecundario} onPress={handleCompartir}>
              <Text style={styles.btnSecundarioText}>Compartir reporte</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnVolver} onPress={() => navigation.goBack()}>
              <Text style={styles.btnVolverText}>Repetir escaneo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  header: { paddingTop: 60, paddingBottom: 40, alignItems: 'center', borderBottomLeftRadius: RADIUS.xl, borderBottomRightRadius: RADIUS.xl },
  headerLabel: { color: 'rgba(255,255,255,0.8)', fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold },
  headerPorcentaje: { color: COLORS.white, fontSize: 64, fontWeight: FONT_WEIGHT.extrabold },
  headerConfianza: { color: COLORS.white, fontSize: FONT_SIZE.md },
  content: { padding: SPACING.lg, marginTop: -30 },
  card: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.lg, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, marginBottom: SPACING.lg },
  cardLabel: { fontSize: FONT_SIZE.sm, color: COLORS.textMuted, marginBottom: 4 },
  cardPrincipal: { fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.bold, color: COLORS.danger, marginBottom: 12 },
  cardSub: { fontSize: FONT_SIZE.md, color: COLORS.textPrimary, fontWeight: FONT_WEIGHT.semibold },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 12 },
  seccionTitulo: { fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, marginBottom: 10, color: COLORS.textPrimary },
  recomendaCard: { backgroundColor: COLORS.primary + '10', padding: SPACING.md, borderRadius: RADIUS.md, borderLeftWidth: 4, borderLeftColor: COLORS.primary },
  recomendaTexto: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, lineHeight: 22 },
  btnGroup: { marginTop: SPACING.xl, gap: SPACING.md },
  btnPrimario: { backgroundColor: COLORS.primary, padding: SPACING.md, borderRadius: RADIUS.lg, alignItems: 'center' },
  btnPrimarioText: { color: COLORS.white, fontWeight: FONT_WEIGHT.bold, fontSize: FONT_SIZE.md },
  btnSecundario: { borderWidth: 1, borderColor: COLORS.primary, padding: SPACING.md, borderRadius: RADIUS.lg, alignItems: 'center' },
  btnSecundarioText: { color: COLORS.primary, fontWeight: FONT_WEIGHT.bold },
  btnVolver: { padding: SPACING.md, alignItems: 'center' },
  btnVolverText: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm },
  recomendaContainer: { marginBottom: 20 }
});

export default ResultadoScreen;