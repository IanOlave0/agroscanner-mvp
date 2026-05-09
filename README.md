# AgroScanner MVP

App movil offline-first para detecciones fitosanitarias de cultivos mediante
inteligencia artificial en el dispositivo. Desarrollado para agricultores de
Colima, Mexico.

## Cultivos soportados (sujeto a cambios)

- Limon
- Papaya
- Platano

## Enfermedades detectables (sujeto a cambios)

- **HLB (Dragon Amarillo)** -- _Candidatus Liberibacter_
- **Shigatoka Negra** -- _Mycosphaerella fijiensis_
- **Arana Roja** -- _Tetranychus urticae_

---

## Arquitectura

```
agroscanner-mvp/
├── frontend/AgroScannerApp/   ← App Expo / React Native (TypeScript)
│   └── src/
│       ├── database/          ← SQLite offline-first (6 tablas)
│       ├── screens/           ← Pantallas por flujo
│       │   ├── auth/          ← Welcome, Login, Registro
│       │   ├── main/          ← Home, Perfil
│       │   ├── scanner/       ← Camara, Resultado, Pin
│       │   ├── parcelas/      ← Gestion y dibujo de poligonos
│       │   ├── historial/     ← Historial de detecciones
│       │   └── mapa/          ← Mapa de calor (placeholder)
│       ├── components/        ← Iconos SVG, componentes reutilizables
│       ├── constants/         ← COLORS, SPACING, RADIUS, CULTIVOS
│       ├── navigation/        ← Stack + Bottom Tabs
│       ├── types/             ← Interfaces TypeScript
│       └── context/           ← AuthContext (proximamente)
├── backend/                   ← Placeholder (sera reemplazado por Supabase)
└── ia-model/                  ← Placeholder (IA en dispositivo)
```

---

## Stack tecnico

| Capa            | Tecnologia                                       |
| --------------- | ------------------------------------------------ |
| Framework       | React Native 0.81 + Expo SDK 54                  |
| UI              | Tamagui v2 (design system) + Lucide React Native |
| Navegacion      | React Navigation 7 (Stack + Bottom Tabs)         |
| BD local        | expo-sqlite 16 -- SQLite offline-first           |
| Permisos        | expo-camera, expo-location                       |
| Mapas           | react-native-maps 1.20 (migrando a Mapbox)       |
| Poligonos       | react-native-svg                                 |
| Geo             | @turf/turf                                       |
| IDs             | uuid                                             |
| BD cloud        | Supabase (proximamente)                          |

---

## Setup rapido

```bash
cd frontend/AgroScannerApp
npm install
npx expo start
```

Escanear QR con Expo Go en Android/iOS.

---

## Estado actual (v0.1.0)

- UI completa con Tamagui y Lucide icons
- Navegacion Stack + Bottom Tabs (4 pestanas)
- Base de datos SQLite con 6 tablas y seed data
- Flujo de escaneo simulado (mock IA)
- Gestion de parcelas con dibujo de poligonos
- Historial de detecciones con filtros
- Modo demo y acceso como invitado
- Perfil con preferencias y cierre de sesion

Pendiente:

- Camara real (placeholder -- `setTimeout`)
- Modelo IA real (mock data)
- Backend funcional
- Sincronizacion con nube

---

## Roadmap (sujeto a cambios)

| Fase    | Version | Descripcion                                                            |
| ------- | ------- | ---------------------------------------------------------------------- |
| 0       | v0.2.0  | AuthContext, MapaScreen por parcela, tabs condicionales guest/auth     |
| 1       | v0.3.0  | Camara real (expo-camera), flash, galeria                              |
| 2       | v0.4.0  | Supabase -- proyecto, esquema, RLS, seed catalog                       |
| 3       | v0.5.0  | Auth real con Supabase, migrar Login/Registro                          |
| 4       | v0.6.0  | Sync Manager offline-first (push/pull)                                 |
| 5       | v0.7.0  | Mapbox -- mapas offline, heatmaps, parcelas                            |
| 6       | v0.8.0  | Admin dashboard + mapa de calor regional                               |

---

## Equipo

CPI Jaguars · TecNM Instituto Tecnologico de Colima

Ian Olave · Carlos Ramirez · José Negrete · Andrew Ceja · Daria Vázquez
