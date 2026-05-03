/**
 * @file App.tsx
 * @description Punto de entrada principal de la aplicación AgroScanner.
 * Responsabilidades:
 * 1. Inicializar la base de datos SQLite local (initDatabase + seedDatabase).
 * 2. Proveer el contexto de Tamagui para el sistema de diseño.
 * 3. Proveer SafeAreaProvider y NavigationContainer para la navegación.
 *
 * @author AgroScanner Team
 */

import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TamaguiProvider } from 'tamagui';
import tamaguiConfig from './tamagui.config';
import AppNavigation from './src/navigation';
import { initDatabase, seedDatabase } from './src/database';
import { COLORS, FONT_SIZE, FONT_WEIGHT } from './src/constants';

/**
 * Componente raíz de la aplicación.
 * Gestiona la inicialización asíncrona de la base de datos antes de renderizar
 * la interfaz de usuario. Muestra un indicador de carga mientras la BD se prepara.
 */
const App = () => {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        console.log('[AgroScanner App] Inicializando base de datos...');
        await initDatabase();
        console.log('[AgroScanner App] Base de datos inicializada');

        await seedDatabase();
        console.log('[AgroScanner App] Datos iniciales cargados');

        setDbReady(true);
      } catch (error) {
        console.error('[AgroScanner App] Error inicializando BD:', error);
        setDbReady(true);
      }
    };
    init();
  }, []);

  // ── Estado de carga: base de datos no lista ──────────────────────
  if (!dbReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Inicializando AgroScanner...</Text>
      </View>
    );
  }

  // ── Renderizado principal con proveedores de contexto ────────────
  // TamaguiProvider: provee tokens de diseño y tema 'light' por defecto.
  // SafeAreaProvider: gestiona insets de dispositivos con notch.
  // NavigationContainer: contenedor raíz de React Navigation.
  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      <SafeAreaProvider>
        <NavigationContainer>
          <AppNavigation />
        </NavigationContainer>
      </SafeAreaProvider>
    </TamaguiProvider>
  );
};

// ── Estilos para pantalla de carga (pre-Tamagui) ───────────────────
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bgPrimary,
    gap: 16,
  },
  loadingText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textSecondary,
  },
});

export default App;
