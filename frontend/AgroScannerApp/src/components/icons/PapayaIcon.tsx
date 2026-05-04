/**
 * @file src/components/icons/PapayaIcon.tsx
 * @description Icono vectorial de Papaya.
 * Representación visual precisa del cultivo soportado por AgroScanner.
 *
 * @author AgroScanner Team
 */

import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

type Props = {
  width?: number;
  height?: number;
};

const PapayaIcon = ({ width = 28, height = 28 }: Props) => (
  <Svg
    viewBox="0 0 64 64"
    width={width}
    height={height}
  >
    <Path fill="#6d4d42" d="M44,15.61l-3.93,3.93a7.318,7.318,0,0,0-3.61-3.61L40.39,12Z" />
    <Path fill="#5e4137" d="M44,15.61l-3.93,3.93a7.49,7.49,0,0,0-1.48-2.13l3.61-3.6Z" />
    <Path fill="#f78c1e" d="M60,40a6.604,6.604,0,0,1-6.69,6.52,17.64,17.64,0,0,0-10.1,3.16,12.987,12.987,0,0,1-18.27-3.54L21,40l3.94-6.14a12.987,12.987,0,0,1,18.27-3.54,17.64,17.64,0,0,0,10.1,3.16A6.604,6.604,0,0,1,60,40Z" />
    <Path fill="#f47c20" d="M60,40a6.604,6.604,0,0,1-6.69,6.52,17.64,17.64,0,0,0-10.1,3.16,12.987,12.987,0,0,1-18.27-3.54L21,40Z" />
    <Path fill="#42a047" d="M38.48,28.29a12.907,12.907,0,0,0-13.54,5.57L21,40l3.94,6.14a12.416,12.416,0,0,0,2.11,2.49,15.055,15.055,0,0,1-12.57,3.04l-8.35-1.8-1.8-8.35A15.346,15.346,0,0,1,16.62,23.39a21.007,21.007,0,0,0,11.02-5.8,7.618,7.618,0,1,1,10.84,10.7Z" />
    <Path fill="#378e43" d="M38.48,28.29a12.907,12.907,0,0,0-13.54,5.57L21,40l3.94,6.14a12.416,12.416,0,0,0,2.11,2.49,15.055,15.055,0,0,1-12.57,3.04l-8.35-1.8L38.59,17.41A7.749,7.749,0,0,1,38.48,28.29Z" />
    <Path fill="#f05223" d="M46,40s-4.03,4-9,4-9-4-9-4,4.03-4,9-4S46,40,46,40Z" />
    <Path fill="#e44c25" d="M46,40s-4.03,4-9,4-9-4-9-4Z" />
  </Svg>
);

export default PapayaIcon;
