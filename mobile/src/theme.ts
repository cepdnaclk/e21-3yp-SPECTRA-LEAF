export const theme = {
  colors: {
    background: '#FFFFFF',
    backgroundSoft: '#F2F3F5',
    surface: '#FFFFFF',
    surfaceSoft: '#F7F8FA',
    subtle: '#EEF0F2',
    chip: '#F4F5F6',
    panelGreen: '#EAFBF1',
    panelBlue: '#F4F5F6',
    panelAmber: '#F7F8FA',
    panelRed: '#FFF1F1',

    border: '#E5E7EB',
    borderActive: '#111111',

    primary: '#18A558',
    primaryDark: '#087A3A',
    primaryLight: '#34D178',
    primarySoft: '#EAFBF1',
    primaryBorder: '#B9ECCD',

    accent: '#111111',
    accentSoft: '#F4F5F6',

    text: '#0A0A0A',
    textSecondary: '#393D42',
    textMuted: '#858B93',

    danger: '#E5484D',
    dangerSoft: '#FFF1F1',
    warning: '#0A0A0A',
    warningSoft: '#F7F8FA',
    success: '#18A558',
    info: '#111111',

    dark: '#050505',
    darkSoft: '#171717',
    darkPanel: '#0C0C0D',
    darkMuted: '#B8BDC4',

    shadow: '#000000',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  radius: {
    sm: 8,
    md: 14,
    lg: 22,
    xl: 32,
    pill: 999,
  },
  font: {
    h1: 26,
    h2: 20,
    h3: 17,
    body: 15,
    small: 13,
    tiny: 11,
  },
};

export type Theme = typeof theme;
