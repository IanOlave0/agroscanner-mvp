import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { RootStackParams } from '../types';
import { COLORS, FONT_SIZE, FONT_WEIGHT } from '../constants';

// Importar pantallas
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegistroScreen from '../screens/auth/RegistroScreen';
import HomeScreen from '../screens/main/HomeScreen';
import PerfilScreen from '../screens/main/PerfilScreen';
import SeleccionCultivoScreen from '../screens/scanner/SeleccionCultivoScreen';
import CamaraScreen from '../screens/scanner/CamaraScreen';
import ResultadoScreen from '../screens/scanner/ResultadoScreen';
import HistorialScreen from '../screens/historial/HistorialScreen';
import MapaScreen from '../screens/mapa/MapaScreen';

const Stack = createNativeStackNavigator<RootStackParams>();
const Tab = createBottomTabNavigator();

// 1. Componente de Icono Estabilizado (FUERA de los navegadores)
const TabIcon = ({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) => (
  <View style={styles.tabItem}>
    <Text style={styles.tabEmoji}>{emoji}</Text>
    <Text style={[styles.tabLabel, { color: focused ? COLORS.primary : COLORS.textMuted }]}>
      {label}
    </Text>
  </View>
);

// 2. Función generadora de iconos para evitar advertencias de ESLint
const makeIcon = (emoji: string, label: string) => ({ focused }: { focused: boolean }) => (
  <TabIcon emoji={emoji} label={label} focused={focused} />
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: styles.tabBar,
      tabBarShowLabel: false,
    }}
  >
    <Tab.Screen 
      name="Home" 
      component={HomeScreen} 
      options={{ tabBarIcon: makeIcon("🏠", "Inicio") }} 
    />
    <Tab.Screen 
      name="Scanner" 
      component={SeleccionCultivoScreen} 
      options={{ tabBarIcon: makeIcon("📷", "Escanear") }} 
    />
    <Tab.Screen 
      name="Historial" 
      component={HistorialScreen} 
      options={{ tabBarIcon: makeIcon("📋", "Historial") }} 
    />
    <Tab.Screen 
      name="Mapa" 
      component={MapaScreen} 
      options={{ tabBarIcon: makeIcon("🗺️", "Mapa") }} 
    />
    <Tab.Screen 
      name="Perfil" 
      component={PerfilScreen} 
      options={{ tabBarIcon: makeIcon("👤", "Perfil") }} 
    />
  </Tab.Navigator>
);

const AppNavigation = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Welcome">
    <Stack.Screen name="Welcome" component={WelcomeScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Registro" component={RegistroScreen} />
    {/* La ruta 'Home' ahora apunta al TabNavigator */}
    <Stack.Screen name="Home" component={MainTabs} />
    <Stack.Screen name="SeleccionCultivo" component={SeleccionCultivoScreen} />
    <Stack.Screen name="Camara" component={CamaraScreen} />
    <Stack.Screen name="Resultado" component={ResultadoScreen} />
  </Stack.Navigator>
);

export default AppNavigation;

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.white,
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    height: 72,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabItem: { alignItems: 'center', gap: 4 },
  tabEmoji: { fontSize: 22 },
  tabLabel: { fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.medium },
});