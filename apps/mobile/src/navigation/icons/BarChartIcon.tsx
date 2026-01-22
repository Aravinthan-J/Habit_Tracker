/**
 * Bar Chart Icon SVG Component
 */

import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface BarChartIconProps {
  size?: number;
  color?: string;
}

export function BarChartIcon({ size = 24, color = '#000000' }: BarChartIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 20V10M18 20V4M6 20V16"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
