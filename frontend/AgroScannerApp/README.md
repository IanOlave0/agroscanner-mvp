# AgroScanner App

Aplicacion movil Expo / React Native para detecciones fitosanitarias de cultivos.

## Requisitos previos

- Node.js >= 18
- Expo CLI (`npx expo`)
- Expo Go en dispositivo movil (Android/iOS) o emulador

## Instalacion

```bash
npm install
```

## Desarrollo

```bash
npx expo start
```

Escanear el codigo QR con Expo Go o presionar `a` (Android) / `i` (iOS) para abrir en emulador.

## Estructura del proyecto

```
src/
├── database/          # SQLite local (init, seed, queries)
├── screens/
│   ├── auth/          # Welcome, Login, Registro
│   ├── main/          # Home, Perfil
│   ├── scanner/       # SeleccionCultivo, Camara, Resultado, ResultadoDecision, PinPlacement
│   ├── parcelas/      # ParcelaGestion, ParcelaCanvas
│   ├── historial/     # HistorialScreen
│   └── mapa/          # MapaScreen
├── components/        # Iconos SVG, componentes reutilizables
├── constants/         # COLORS, SPACING, RADIUS, SHADOW, CULTIVOS
├── navigation/        # Stack + Bottom Tabs
├── types/             # Interfaces TypeScript
├── utils/             # Utilidades (geometria)
└── context/           # AuthContext (proximamente)
```

## Dependencias principales

| Paquete                  | Uso                       |
| ------------------------ | ------------------------- |
| `expo`                   | Framework                 |
| `expo-sqlite`            | BD local offline-first    |
| `expo-camera`            | Camara del dispositivo    |
| `expo-location`          | GPS y coordenadas         |
| `tamagui`                | Design system             |
| `lucide-react-native`    | Iconos vectoriales        |
| `react-native-maps`      | Mapas y heatmaps          |
| `react-native-svg`       | Dibujo de poligonos       |
| `@react-navigation/*`    | Navegacion                |
| `@turf/turf`             | Calculos geoespaciales    |
| `uuid`                   | Generacion de IDs unicos  |
