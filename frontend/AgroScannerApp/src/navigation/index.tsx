import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { RootStackParams } from '../types';
import { COLORS, FONT_SIZE, FONT_WEIGHT } from '../constants';

// ── Importar pantallas ────────────────────

// Auth
import WelcomeScreen  from '../screens/auth/WelcomeScreen';
import LoginScreen    from '../screens/auth/LoginScreen';
import RegistroScreen from '../screens/auth/RegistroScreen';

// Main
import HomeScreen   from '../screens/main/HomeScreen';
import PerfilScreen from '../screens/main/PerfilScreen';

// Scanner
import SeleccionCultivoScreen from '../screens/scanner/SeleccionCultivoScreen';
import CamaraScreen           from '../screens/scanner/CamaraScreen';
import ResultadoScreen        from '../screens/scanner/ResultadoScreen';
import PinPlacementScreen     from '../screens/scanner/PinPlacementScreen';

// Historial
import HistorialScreen from '../screens/historial/HistorialScreen';

// Mapa
import MapaScreen from '../screens/mapa/MapaScreen';

// Parcelas
import ParcelaGestionScreen from '../screens/parcelas/ParcelaGestionScreen';
import ParcelaCanvasScreen  from '../screens/parcelas/ParcelaCanvasScreen';

// ── Navegadores ───────────────────────────
const Stack = createNativeStackNavigator<RootStackParams>();
const Tab   = createBottomTabNavigator();

// ── Ícono de tab ──────────────────────────
const TabIcon = ({
  emoji,
  label,
  focused,
}: {
  emoji:   string;
  label:   string;
  focused: boolean;
}) => (
  <View style={styles.tabItem}>
    <Text style={styles.tabEmoji}>{emoji}</Text>
    <Text style={[
      styles.tabLabel,
      { color: focused ? COLORS.primary : COLORS.textMuted },
    ]}>
      {label}
    </Text>
  </View>
);

// ── Tab Navigator ─────────────────────────
const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown:     false,
      tabBarStyle:     styles.tabBar,
      tabBarShowLabel: false,
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        tabBarIcon: ({ focused }) => (
          <TabIcon emoji="🏠" label="Inicio" focused={focused} />
        ),
      }}
    />
    <Tab.Screen
      name="Scanner"
      component={SeleccionCultivoScreen}
      options={{
        tabBarIcon: ({ focused }) => (
          <TabIcon emoji="📷" label="Escanear" focused={focused} />
        ),
      }}
    />
    <Tab.Screen
      name="Historial"
      component={HistorialScreen}
      options={{
        tabBarIcon: ({ focused }) => (
          <TabIcon emoji="📋" label="Historial" focused={focused} />
        ),
      }}
    />
    <Tab.Screen
      name="Mapa"
      component={MapaScreen}
      options={{
        tabBarIcon: ({ focused }) => (
          <TabIcon emoji="🗺️" label="Mapa" focused={focused} />
        ),
      }}
    />
    <Tab.Screen
      name="Perfil"
      component={PerfilScreen}
      options={{
        tabBarIcon: ({ focused }) => (
          <TabIcon emoji="👤" label="Perfil" focused={focused} />
        ),
      }}
    />
  </Tab.Navigator>
);

// ── Stack Navigator principal ─────────────
const AppNavigation = () => (
  <Stack.Navigator
    screenOptions={{ headerShown: false }}
    initialRouteName="Welcome"
  >
    {/* Auth */}
    <Stack.Screen name="Welcome"  component={WelcomeScreen} />
    <Stack.Screen name="Login"    component={LoginScreen} />
    <Stack.Screen name="Registro" component={RegistroScreen} />

    {/* App principal */}
    <Stack.Screen name="Home" component={MainTabs} />

    {/* Scanner flow */}
    <Stack.Screen name="SeleccionCultivo" component={SeleccionCultivoScreen} />
    <Stack.Screen name="Camara"           component={CamaraScreen} />
    <Stack.Screen name="Resultado"        component={ResultadoScreen} />
    <Stack.Screen name="PinPlacement"     component={PinPlacementScreen} />

    {/* Parcelas flow */}
    <Stack.Screen name="ParcelaGestion"   component={ParcelaGestionScreen} />
    <Stack.Screen name="ParcelaCanvas"    component={ParcelaCanvasScreen} />
  </Stack.Navigator>
);

export default AppNavigation;

// ── Estilos ───────────────────────────────
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
  tabEmoji: {
    fontSize: 22,
  },
  tabLabel: {
    fontSize:   FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.medium,
  },
});