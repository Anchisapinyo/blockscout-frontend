import type { IconName } from 'ui/shared/IconSvg';

export const COLOR_THEMES = [
  {
    name: 'Light',
    colorMode: 'light',
    icon: 'sun' as IconName,
    colors: [
      { hex: '#DFE2E3', sampleBg: 'linear-gradient(154deg, #EFEFEF 50%, rgba(255, 255, 255, 0.00) 330.86%)' },
    ],
  },
  {
    name: 'Dim',
    colorMode: 'dark',
    icon: 'moon-with-star' as IconName,
    colors: [
      { hex: '#002F3B', sampleBg: 'linear-gradient(150deg, #002F3B 50%, rgba(255, 255, 255, 0.00) 312.75%)' },
      { hex: '#17012f', sampleBg: 'linear-gradient(152deg, #17012f 50%, rgba(255, 255, 255, 0.00) 290.71%)' },
    ],
  },
  {
    name: 'Dark',
    colorMode: 'dark',
    icon: 'moon' as IconName,
    colors: [
      { hex: '#101112', sampleBg: 'linear-gradient(161deg, #000 9.37%, #383838 92.52%)' },
    ],
  },
];

export type ColorTheme = typeof COLOR_THEMES[number];

export type ColorThemeColor = ColorTheme['colors'][number];
