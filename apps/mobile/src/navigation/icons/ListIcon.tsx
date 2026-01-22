/**
 * List Icon SVG Component
 */

import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface ListIconProps {
  size?: number;
  color?: string;
}

export function ListIcon({ size = 24, color = '#000000' }: ListIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M8 6H21M8 12H21M8 18H21M3 6H3.01M3 12H3.01M3 18H3.01"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
