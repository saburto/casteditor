import type { CastTheme } from '../types/asciicast';

export interface ThemePreset {
  name: string;
  label: string;
  theme: CastTheme;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    name: 'asciinema',
    label: 'Asciinema',
    theme: {
      fg: '#dcdccc',
      bg: '#1d1f21',
      palette: '#1d1f21:#cc6666:#b5bd68:#f0c674:#81a2be:#b294bb:#8abeb7:#c5c8c6:#666666:#cc6666:#b5bd68:#f0c674:#81a2be:#b294bb:#8abeb7:#ffffff',
    },
  },
  {
    name: 'monokai',
    label: 'Monokai',
    theme: {
      fg: '#f8f8f2',
      bg: '#272822',
      palette: '#272822:#f92672:#a6e22e:#f4bf75:#66d9ef:#ae81ff:#a1efe4:#f8f8f2:#75715e:#f92672:#a6e22e:#f4bf75:#66d9ef:#ae81ff:#a1efe4:#f9f8f5',
    },
  },
  {
    name: 'solarized-dark',
    label: 'Solarized Dark',
    theme: {
      fg: '#839496',
      bg: '#002b36',
      palette: '#073642:#dc322f:#859900:#b58900:#268bd2:#d33682:#2aa198:#eee8d5:#002b36:#cb4b16:#586e75:#657b83:#839496:#6c71c4:#93a1a1:#fdf6e3',
    },
  },
  {
    name: 'solarized-light',
    label: 'Solarized Light',
    theme: {
      fg: '#657b83',
      bg: '#fdf6e3',
      palette: '#073642:#dc322f:#859900:#b58900:#268bd2:#d33682:#2aa198:#eee8d5:#002b36:#cb4b16:#586e75:#657b83:#839496:#6c71c4:#93a1a1:#fdf6e3',
    },
  },
  {
    name: 'dracula',
    label: 'Dracula',
    theme: {
      fg: '#f8f8f2',
      bg: '#282a36',
      palette: '#21222c:#ff5555:#50fa7b:#f1fa8c:#bd93f9:#ff79c6:#8be9fd:#f8f8f2:#6272a4:#ff6e6e:#69ff94:#ffffa5:#d6acff:#ff92df:#a4ffff:#ffffff',
    },
  },
  {
    name: 'tango',
    label: 'Tango',
    theme: {
      fg: '#d3d7cf',
      bg: '#2e3436',
      palette: '#2e3436:#cc0000:#4e9a06:#c4a000:#3465a4:#75507b:#06989a:#d3d7cf:#555753:#ef2929:#8ae234:#fce94f:#729fcf:#ad7fa8:#34e2e2:#eeeeec',
    },
  },
  {
    name: 'gruvbox',
    label: 'Gruvbox',
    theme: {
      fg: '#ebdbb2',
      bg: '#282828',
      palette: '#282828:#cc241d:#98971a:#d79921:#458588:#b16286:#689d6a:#a89984:#928374:#fb4934:#b8bb26:#fabd2f:#83a598:#d3869b:#8ec07c:#ebdbb2',
    },
  },
];
