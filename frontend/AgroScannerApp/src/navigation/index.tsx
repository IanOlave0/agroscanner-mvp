/**
 * @file src/navigation/index.tsx
 * @description Configuración central de navegación de AgroScanner.
 * Define dos niveles de navegación:
 * - Stack Navigator (raíz): gestiona flujos completos de pantallas (Auth, Scanner, Parcelas).
 * - Bottom Tab Navigator: navegación principal entre las 4 secciones centrales de la app.
 *
 * Migración UI/UX:
 * - Los íconos de tabs fueron migrados de emojis nativos a iconos vectoriales
 *   de Lucide React Native para mayor consistencia visual.
 * - Se eliminó el tab "Perfil" del bottom navigator (antes eran 5 tabs).
 *   El acceso al perfil se realiza desde el header de HomeScreen para evitar
 *   saturación visual y problemas de espaciado en pantallas estrechas.
 * - Se utiliza la API nativa de React Navigation (tabBarLabel + tabBarIcon)
 *   en lugar de un componente custom TabIcon, garantizando correcto manejo
 *   de colores activos/inactivos y layout por parte de la librería.
 *
 * @author AgroScanner Team
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

// ── Iconos vectoriales (Lucide React Native) ───────────────────────
// NOTA: requiere react-native-svg (ya incluido en dependencias).
import { Home, ScanLine, ClipboardList, Map } from 'lucide-react-native';

import { RootStackParams } from '../types';
import { COLORS, FONT_SIZE, FONT_WEIGHT } from '../constants';
import { useAuth } from '../context/AuthContext';

// ── Importación de pantallas ───────────────────────────────────────

// Auth
import WelcomeScreen  from '../screens/auth/WelcomeScreen';
import LoginScreen    from '../screens/auth/LoginScreen';
import RegistroScreen from '../screens/auth/RegistroScreen';

// Main
import HomeScreen   from '../screens/main/HomeScreen';
import PerfilScreen from '../screens/main/PerfilScreen';

// Scanner
import SeleccionCultivoScreen  from '../screens/scanner/SeleccionCultivoScreen';
import CamaraScreen            from '../screens/scanner/CamaraScreen';
import ResultadoScreen         from '../screens/scanner/ResultadoScreen';
import ResultadoDecisionScreen from '../screens/scanner/ResultadoDecisionScreen';
import PinPlacementScreen      from '../screens/scanner/PinPlacementScreen';

// Historial
import HistorialScreen from '../screens/historial/HistorialScreen';
import DeteccionDetalleScreen from '../screens/historial/DeteccionDetalleScreen';

// Mapa
import MapaScreen from '../screens/mapa/MapaScreen';

// Parcelas
import ParcelaGestionScreen from '../screens/parcelas/ParcelaGestionScreen';
import ParcelaCanvasScreen  from '../screens/parcelas/ParcelaCanvasScreen';

// ── Estilos nativos (tab bar) ──────────────────────────────────────
const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.white,
    borderTopColor:  COLORS.border,
    borderTopWidth:  1,
    height:          72,
    paddingHorizontal: 16,
    paddingBottom:   15,
    paddingTop:      3,
  },
  tabLabel: {
    fontSize:   FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.medium,
  },
});

// ── Instanciación de navegadores ───────────────────────────────────
const Stack = createNativeStackNavigator<RootStackParams>();
const Tab   = createBottomTabNavigator();

const TAB_SCREEN_OPTIONS = {
  headerShown: false,
  tabBarStyle: styles.tabBar,
  tabBarActiveTintColor: COLORS.primary,
  tabBarInactiveTintColor: COLORS.textMuted,
  tabBarLabelStyle: styles.tabLabel,
  tabBarItemStyle: { paddingVertical: 4 },
} as const;

const GuestTabs = () => (
  <Tab.Navigator screenOptions={TAB_SCREEN_OPTIONS}>
    <Tab.Screen
      name="Scanner"
      component={SeleccionCultivoScreen}
      options={{
        tabBarLabel: 'Escanear',
        tabBarIcon: ({ color }) => <ScanLine size={22} color={color} />,
      }}
    />
    <Tab.Screen
      name="Historial"
      component={HistorialScreen}
      options={{
        tabBarLabel: 'Historial',
        tabBarIcon: ({ color }) => <ClipboardList size={22} color={color} />,
      }}
    />
  </Tab.Navigator>
);

const AuthTabs = () => (
  <Tab.Navigator screenOptions={TAB_SCREEN_OPTIONS}>
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        tabBarLabel: 'Inicio',
        tabBarIcon: ({ color }) => <Home size={22} color={color} />,
      }}
    />
    <Tab.Screen
      name="Scanner"
      component={SeleccionCultivoScreen}
      options={{
        tabBarLabel: 'Escanear',
        tabBarIcon: ({ color }) => <ScanLine size={22} color={color} />,
      }}
    />
    <Tab.Screen
      name="Historial"
      component={HistorialScreen}
      options={{
        tabBarLabel: 'Historial',
        tabBarIcon: ({ color }) => <ClipboardList size={22} color={color} />,
      }}
    />
    <Tab.Screen
      name="Mapa"
      component={MapaScreen}
      options={{
        tabBarLabel: 'Mapa',
        tabBarIcon: ({ color }) => <Map size={22} color={color} />,
      }}
    />
  </Tab.Navigator>
);

const MainTabs = () => {
  const { estado } = useAuth();

  if (estado === 'loading') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bgPrimary }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return estado === 'guest' ? <GuestTabs /> : <AuthTabs />;
};

// ── Stack Navigator (raíz) ─────────────────────────────────────────
/**
 * Stack Navigator principal de la aplicación.
 * Gestiona toda la jerarquía de navegación:
 * 1. Flujo de autenticación (Welcome, Login, Registro)
 * 2. Aplicación principal (MainTabs con 4 pestañas)
 * 3. Pantallas de flujo de scanner (Camara, Resultado, PinPlacement)
 * 4. Gestión de parcelas (ParcelaGestion, ParcelaCanvas)
 * 5. Perfil (accesible desde el header de HomeScreen, no desde tab bar)
 */
const AppNavigation = () => (
  <Stack.Navigator
    screenOptions={{ headerShown: false }}
    initialRouteName="Welcome"
  >
    {/* ── Flujo de autenticación ─────────────────────────────────── */}
    <Stack.Screen name="Welcome"  component={WelcomeScreen} />
    <Stack.Screen name="Login"    component={LoginScreen} />
    <Stack.Screen name="Registro" component={RegistroScreen} />

    {/* ── Aplicación principal (tabs) ────────────────────────────── */}
    <Stack.Screen name="Home" component={MainTabs} />

    {/* ── Perfil (accesible desde HomeScreen) ────────────────────── */}
    <Stack.Screen name="Perfil" component={PerfilScreen} />

    {/* ── Flujo de escaneo (scanner) ─────────────────────────────── */}
    <Stack.Screen name="SeleccionCultivo"  component={SeleccionCultivoScreen} />
    <Stack.Screen name="Camara"            component={CamaraScreen} />
    <Stack.Screen name="Resultado"         component={ResultadoScreen} />
    <Stack.Screen name="ResultadoDecision" component={ResultadoDecisionScreen} />
    <Stack.Screen name="PinPlacement"      component={PinPlacementScreen} />

    {/* ── Flujo de gestión de parcelas ───────────────────────────── */}
    <Stack.Screen name="ParcelaGestion" component={ParcelaGestionScreen} />
    <Stack.Screen name="ParcelaCanvas"  component={ParcelaCanvasScreen} />

    {/* ── Detalle de detección ──────────────────────────────────── */}
    <Stack.Screen name="DeteccionDetalle" component={DeteccionDetalleScreen} />
  </Stack.Navigator>
);

export default AppNavigation;
