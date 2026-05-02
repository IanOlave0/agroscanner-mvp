/**
 * Pantalla de Gestión de Parcelas
 * 
 * Permite al agricultor:
 * - Ver lista de todas sus parcelas
 * - Crear nuevas parcelas (navega a ParcelaCanvasScreen)
 * - Editar/eliminar parcelas existentes
 * - Ver área de cada parcela (calculada con turf.js)
 * 
 * ACCESO: Solo usuarios autenticados
 * Sin cuenta: Se redirige a pantalla de registro
 */
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParams, Parcela, Usuario } from '../../types';
import { COLORS, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT } from '../../constants';
import { getParcelasByUsuario, getUsuarioActivo, deleteParcela } from '../../database/queries';
import { formatearArea, parseGeometria, getCentroide } from '../../utils/geometria';

type ParcelaGestionNavigationProp = NativeStackNavigationProp<RootStackParams, 'ParcelaGestion'>;

type Props = {
  navigation: ParcelaGestionNavigationProp;
};

/**
 * Componente de tarjeta para mostrar una parcela en la lista
 */
const ParcelaCard = ({ 
  parcela, 
  onEditar, 
  onEliminar 
}: { 
  parcela: Parcela; 
  onEditar: (id: string) => void; 
  onEliminar: (id: string) => void;
}) => {
  const vertices = parseGeometria(parcela.geometria);
  const centroide = getCentroide(vertices);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{parcela.alias}</Text>
        <Text style={styles.cardArea}>{formatearArea(parcela.metros_cuadrados)}</Text>
      </View>
      
      <View style={styles.cardInfo}>
        <Text style={styles.cardInfoText}>
          Vértices: {vertices.length}
        </Text>
        <Text style={styles.cardInfoText}>
          Centro: {centroide.lat.toFixed(6)}, {centroide.lng.toFixed(6)}
        </Text>
        <Text style={styles.cardInfoText}>
          Creada: {parcela.fecha_creacion ? new Date(parcela.fecha_creacion).toLocaleDateString() : 'N/A'}
        </Text>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={[styles.cardButton, styles.editButton]} 
          onPress={() => onEditar(parcela.id)}
        >
          <Text style={styles.editButtonText}>Editar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.cardButton, styles.deleteButton]} 
          onPress={() => onEliminar(parcela.id)}
        >
          <Text style={styles.deleteButtonText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function ParcelaGestionScreen({ navigation }: Props) {
  const [parcelas, setParcelas] = useState<Parcela[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarParcelas();
  }, []);

  /**
   * Carga todas las parcelas del usuario activo
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
   * Navega a ParcelaCanvasScreen para crear/editar
   */
  const handleCrearParcela = () => {
    navigation.navigate('ParcelaCanvas', { parcelaId: undefined });
  };

  /**
   * Navega a ParcelaCanvasScreen para editar una parcela existente
   */
  const handleEditarParcela = (id: string) => {
    navigation.navigate('ParcelaCanvas', { parcelaId: id });
  };

  /**
   * Elimina una parcela después de confirmación
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
              await cargarParcelas(); // Recargar lista
            } catch (error) {
              console.error('[ParcelaGestion] Error eliminando parcela:', error);
              Alert.alert('Error', 'No se pudo eliminar la parcela');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgPrimary} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando parcelas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgPrimary} />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Mis Parcelas</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleCrearParcela}>
          <Text style={styles.addButtonText}>+ Nueva</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de parcelas */}
      {parcelas.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🌾</Text>
          <Text style={styles.emptyTitle}>No tienes parcelas registradas</Text>
          <Text style={styles.emptyText}>
            Crea tu primera parcela dibujando el polígono en el mapa
          </Text>
          <TouchableOpacity style={styles.emptyButton} onPress={handleCrearParcela}>
            <Text style={styles.emptyButtonText}>Crear mi primera parcela</Text>
          </TouchableOpacity>
        </View>
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
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
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
  },
  header: {
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    alignSelf: 'flex-start',
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
  },
  list: {
    padding: SPACING.md,
    gap: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  cardTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  cardArea: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.primary,
  },
  cardInfo: {
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  cardInfoText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  cardActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  cardButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: COLORS.primary + '20',
  },
  editButtonText: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
  },
  deleteButton: {
    backgroundColor: COLORS.danger + '20',
  },
  deleteButtonText: {
    color: COLORS.danger,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  emptyButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.lg,
  },
  emptyButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
  },
  loadingText: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: FONT_SIZE.lg,
    color: COLORS.textSecondary,
  },
});