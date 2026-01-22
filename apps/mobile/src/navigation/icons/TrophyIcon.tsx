/**
 * Trophy Icon SVG Component
 */

import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface TrophyIconProps {
  size?: number;
  color?: string;
}

export function TrophyIcon({ size = 24, color = '#000000' }: TrophyIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 9H4C3.44772 9 3 9.44772 3 10V12C3 15.3137 5.68629 18 9 18H15C18.3137 18 21 15.3137 21 12V10C21 9.44772 20.5523 9 20 9H18M6 9V7C6 4.79086 7.79086 3 10 3H14C16.2091 3 18 4.79086 18 7V9M6 9H18M18 9V11C18 13.2091 16.2091 15 14 15H10C7.79086 15 6 13.2091 6 11V9"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
