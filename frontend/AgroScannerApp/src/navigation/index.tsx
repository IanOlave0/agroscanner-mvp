/**
 * @file src/navigation/index.tsx
 * @description Configuración central de navegación de AgroScanner.
 * Define dos niveles de navegación:
 * - Stack Navigator (raíz): gestiona flujos completos (Auth, Scanner, Parcelas).
 * - Bottom Tab Navigator: navegación principal entre secciones de la app.
 *
 * Migración UI/UX: los íconos de tabs fueron migrados de emojis nativos a
 * iconos vectoriales SVG de Lucide React Native para mayor consistencia visual.
 *
 * @author AgroScanner Team
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';

// ── Iconos vectoriales (Lucide React Native) ───────────────────────
// NOTA: requiere react-native-svg (ya incluido en dependencias).
import { Home, ScanLine, ClipboardList, Map, User } from 'lucide-react-native';

import { RootStackParams } from '../types';
import { COLORS, FONT_SIZE, FONT_WEIGHT } from '../constants';

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

// Mapa
import MapaScreen from '../screens/mapa/MapaScreen';

// Parcelas
import ParcelaGestionScreen from '../screens/parcelas/ParcelaGestionScreen';
import ParcelaCanvasScreen  from '../screens/parcelas/ParcelaCanvasScreen';

// ── Instanciación de navegadores ───────────────────────────────────
const Stack = createNativeStackNavigator<RootStackParams>();
const Tab   = createBottomTabNavigator();

// ── Componente de ícono de tab ─────────────────────────────────────
/**
 * Renderiza un ícono vectorial de Lucide + etiqueta para cada tab del bottom navigator.
 *
 * @param icon   Componente de ícono de lucide-react-native.
 * @param label  Texto descriptivo de la pestaña.
 * @param focused Indica si la pestaña está activa (afecta color del ícono y texto).
 */
const TabIcon = ({
  icon: Icon,
  label,
  focused,
}: {
  icon:    React.ElementType;
  label:   string;
  focused: boolean;
}) => (
  <View style={styles.tabItem}>
    <Icon size={22} color={focused ? COLORS.primary : COLORS.textMuted} />
    <Text style={[
      styles.tabLabel,
      { color: focused ? COLORS.primary : COLORS.textMuted },
    ]}>
      {label}
    </Text>
  </View>
);

// ── Tab Navigator (navegación principal) ───────────────────────────
const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown:     false,
      tabBarStyle:     styles.tabBar,
      tabBarShowLabel: false, // Se usa componente personalizado para ícono + label
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        tabBarIcon: ({ focused }) => (
          <TabIcon icon={Home} label="Inicio" focused={focused} />
        ),
      }}
    />
    <Tab.Screen
      name="Scanner"
      component={SeleccionCultivoScreen}
      options={{
        tabBarIcon: ({ focused }) => (
          <TabIcon icon={ScanLine} label="Escanear" focused={focused} />
        ),
      }}
    />
    <Tab.Screen
      name="Historial"
      component={HistorialScreen}
      options={{
        tabBarIcon: ({ focused }) => (
          <TabIcon icon={ClipboardList} label="Historial" focused={focused} />
        ),
      }}
    />
    <Tab.Screen
      name="Mapa"
      component={MapaScreen}
      options={{
        tabBarIcon: ({ focused }) => (
          <TabIcon icon={Map} label="Mapa" focused={focused} />
        ),
      }}
    />
    <Tab.Screen
      name="Perfil"
      component={PerfilScreen}
      options={{
        tabBarIcon: ({ focused }) => (
          <TabIcon icon={User} label="Perfil" focused={focused} />
        ),
      }}
    />
  </Tab.Navigator>
);

// ── Stack Navigator (raíz) ─────────────────────────────────────────
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

    {/* ── Flujo de escaneo (scanner) ─────────────────────────────── */}
    <Stack.Screen name="SeleccionCultivo"  component={SeleccionCultivoScreen} />
    <Stack.Screen name="Camara"            component={CamaraScreen} />
    <Stack.Screen name="Resultado"         component={ResultadoScreen} />
    <Stack.Screen name="ResultadoDecision" component={ResultadoDecisionScreen} />
    <Stack.Screen name="PinPlacement"      component={PinPlacementScreen} />

    {/* ── Flujo de gestión de parcelas ───────────────────────────── */}
    <Stack.Screen name="ParcelaGestion" component={ParcelaGestionScreen} />
    <Stack.Screen name="ParcelaCanvas"  component={ParcelaCanvasScreen} />
  </Stack.Navigator>
);

export default AppNavigation;

// ── Estilos nativos (tab bar aún usa StyleSheet por compatibilidad) ─
const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.white,
    borderTopColor:  COLORS.border,
    borderTopWidth:  1,
    height:          72,
    paddingBottom:   8,
    paddingTop:      8,
  },
  tabItem: {
    alignItems: 'center',
    gap:        4,
  },
  tabLabel: {
    fontSize:   FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.medium,
  },
});
