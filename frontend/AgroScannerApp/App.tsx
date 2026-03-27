import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigation from './src/navigation';

// ── App principal ─────────────────────────
// Este es el punto de entrada de AgroScanner
// NavigationContainer envuelve toda la app
// y habilita el sistema de navegación
const App = () => {
  return (
    <NavigationContainer>
      <AppNavigation />
    </NavigationContainer>
  );
};

export default App;