import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigation from './src/navigation';
import { initDatabase, seedDatabase } from './src/database';
import { COLORS, FONT_SIZE, FONT_WEIGHT } from './src/constants';

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

  if (!dbReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Inicializando AgroScanner...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AppNavigation />
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

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