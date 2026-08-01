import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import { useEditor } from '../../state/documentStore';
import { getPanelColor } from '../../theme/panelColors';
import { THEME_PRESETS } from '../../theme/presets';
import type { CastTheme } from '../../types/asciicast';
import type { ThemePreset } from '../../theme/presets';

const PALETTE_LABELS = [
  'Black', 'Red', 'Green', 'Yellow', 'Blue', 'Magenta', 'Cyan', 'White',
  'Bright Black', 'Bright Red', 'Bright Green', 'Bright Yellow',
  'Bright Blue', 'Bright Magenta', 'Bright Cyan', 'Bright White',
];

/** Split a palette string into exactly 16 colors, filling missing slots with #000. */
function splitPalette(palette: string): string[] {
  const parts = palette.split(':');
  const result = parts.slice(0, 16);
  while (result.length < 16) result.push('#000000');
  return result;
}

/** Return the preset whose fg, bg, palette match the given theme, or null. */
function findMatchingPreset(theme: CastTheme | undefined): ThemePreset | null {
  if (!theme) return null;
  return THEME_PRESETS.find(
    p => p.theme.fg === theme.fg && p.theme.bg === theme.bg && p.theme.palette === theme.palette,
  ) ?? null;
}

export default function ThemePanel() {
  const { state, dispatch } = useEditor();
  const currentTheme = state.document?.header.theme;
  const activePreset = useMemo(() => findMatchingPreset(currentTheme), [currentTheme]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [fg, setFg] = useState('#dcdccc');
  const [bg, setBg] = useState('#1d1f21');
  const [palette, setPalette] = useState<string[]>(() => splitPalette(''));

  const color = getPanelColor('theme');
  const rgb = `rgb(${color.r},${color.g},${color.b})`;
  const rgbHover = `rgba(${color.r},${color.g},${color.b},0.85)`;

  const handlePreset = (preset: ThemePreset) => {
    dispatch({ type: 'APPLY_THEME', payload: { theme: preset.theme } });
  };

  const handleRemove = () => {
    dispatch({ type: 'APPLY_THEME', payload: { theme: null } });
  };

  const handleOpenCustom = () => {
    if (currentTheme) {
      setFg(currentTheme.fg);
      setBg(currentTheme.bg);
      setPalette(splitPalette(currentTheme.palette));
    } else {
      setFg('#dcdccc');
      setBg('#1d1f21');
      setPalette(splitPalette(THEME_PRESETS[0].theme.palette));
    }
    setDialogOpen(true);
  };

  const handleApplyCustom = () => {
    const theme: CastTheme = {
      fg,
      bg,
      palette: palette.join(':'),
    };
    dispatch({ type: 'APPLY_THEME', payload: { theme } });
    setDialogOpen(false);
  };

  return (
    <>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', height: '100%' }}>
        {THEME_PRESETS.map(p => {
          const isActive = activePreset?.name === p.name;
          return (
            <Button
              key={p.name}
              variant={isActive ? 'contained' : 'outlined'}
              size="small"
              onClick={() => handlePreset(p)}
              sx={
                isActive
                  ? { bgcolor: rgb, '&:hover': { bgcolor: rgbHover } }
                  : undefined
              }
            >
              {p.label}
            </Button>
          );
        })}
        <Button size="small" variant="outlined" onClick={handleOpenCustom}>
          Custom…
        </Button>
        {currentTheme && (
          <Button size="small" color="error" variant="outlined" onClick={handleRemove}>
            Remove
          </Button>
        )}
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Custom Theme</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            {/* Foreground & Background */}
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ minWidth: 100 }}>Foreground</Typography>
                <input
                  type="color"
                  value={fg}
                  onChange={e => setFg(e.target.value)}
                  style={{ width: 36, height: 36, border: 'none', cursor: 'pointer', background: 'none' }}
                />
                <TextField
                  size="small"
                  value={fg}
                  onChange={e => setFg(e.target.value)}
                  sx={{ width: 100 }}
                  inputProps={{ maxLength: 7 }}
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ minWidth: 100 }}>Background</Typography>
                <input
                  type="color"
                  value={bg}
                  onChange={e => setBg(e.target.value)}
                  style={{ width: 36, height: 36, border: 'none', cursor: 'pointer', background: 'none' }}
                />
                <TextField
                  size="small"
                  value={bg}
                  onChange={e => setBg(e.target.value)}
                  sx={{ width: 100 }}
                  inputProps={{ maxLength: 7 }}
                />
              </Box>
            </Box>

            {/* Palette */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>ANSI Palette (16 colors)</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 1 }}>
                {palette.map((colorVal, i) => (
                  <Box key={i} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="caption" sx={{ fontSize: '0.65rem', lineHeight: 1 }}>
                      {PALETTE_LABELS[i]}
                    </Typography>
                    <input
                      type="color"
                      value={colorVal}
                      onChange={e => {
                        const next = [...palette];
                        next[i] = e.target.value;
                        setPalette(next);
                      }}
                      style={{ width: 28, height: 28, border: 'none', cursor: 'pointer', background: 'none' }}
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleApplyCustom}>Apply</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
