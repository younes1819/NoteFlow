import { useColorScheme } from 'react-native';

export type ColorMode = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  foreground: string;
  muted: string;
  accent: string;
  border: string;
  cardHeader: string;
  cardHeaderText: string;
  surface: string;
}

export interface ThemeTypography {
  fontFamily: string;
  fontFamilyMono: string;
  sizes: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    '2xl': number;
    label: number;
  };
  letterSpacing: {
    tight: number;
    wide: number;
    widest: number;
  };
}

export interface ThemeSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
}

export interface NoteFlowTheme {
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  radius: number;
}

const sharedTypography: ThemeTypography = {
  fontFamily: 'System',
  fontFamilyMono: 'Courier New',
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 18,
    xl: 22,
    '2xl': 28,
    label: 12,
  },
  letterSpacing: {
    tight: 0,
    wide: 1.2,
    widest: 2.4,
  },
};

const sharedSpacing: ThemeSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
};

export const noteflowTheme: Record<ColorMode, NoteFlowTheme> = {
  light: {
    colors: {
      background: '#FFFFFF',
      foreground: '#000000',
      muted: '#666666',
      accent: '#E85D04',
      border: '#000000',
      cardHeader: '#000000',
      cardHeaderText: '#FFFFFF',
      surface: '#FFFFFF',
    },
    typography: sharedTypography,
    spacing: sharedSpacing,
    radius: 0,
  },
  dark: {
    colors: {
      background: '#000000',
      foreground: '#FFFFFF',
      muted: '#AAAAAA',
      accent: '#FF6B35',
      border: '#FFFFFF',
      cardHeader: '#FFFFFF',
      cardHeaderText: '#000000',
      surface: '#111111',
    },
    typography: sharedTypography,
    spacing: sharedSpacing,
    radius: 0,
  },
};

export function getColorMode(scheme: string | null | undefined): ColorMode {
  return scheme === 'dark' ? 'dark' : 'light';
}

export function useTheme(): NoteFlowTheme & { mode: ColorMode } {
  const mode = getColorMode(useColorScheme());
  return { ...noteflowTheme[mode], mode };
}

/** RGB triplets for Gluestack CSS variables (space-separated). */
export function toRgbTriplet(hex: string): string {
  const normalized = hex.replace('#', '');
  const value =
    normalized.length === 3
      ? normalized
          .split('')
          .map((c) => c + c)
          .join('')
      : normalized;
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `${r} ${g} ${b}`;
}

export function buildGluestackVars(mode: ColorMode) {
  const t = noteflowTheme[mode];
  const foreground = toRgbTriplet(t.colors.foreground);
  const muted = toRgbTriplet(t.colors.muted);
  const background = toRgbTriplet(t.colors.background);

  return {
    '--color-background-0': background,
    '--color-background-950': toRgbTriplet(t.colors.surface),
    '--color-typography-700': foreground,
    '--color-typography-900': foreground,
    '--color-typography-500': muted,
    '--color-primary-500': toRgbTriplet(t.colors.accent),
    '--color-outline-900': toRgbTriplet(t.colors.border),
  };
}
