// tamagui.config.ts
import { config } from '@tamagui/config/v3'
import { createTamagui } from 'tamagui'

// Creamos la configuración 
const tamaguiConfig = createTamagui(config)

// Autocompleta estilos
type Conf = typeof tamaguiConfig
declare module 'tamagui' {
  interface TamaguiCustomConfig extends Conf {}
}

export default tamaguiConfig