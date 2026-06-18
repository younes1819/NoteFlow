import { vars } from 'nativewind';

import { buildGluestackVars } from '@/constants/theme';

function modeVars(mode: 'light' | 'dark') {
  return vars(buildGluestackVars(mode));
}

export const config = {
  light: modeVars('light'),
  dark: modeVars('dark'),
};
