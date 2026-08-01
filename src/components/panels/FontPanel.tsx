import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { useEditor } from '../../state/documentStore';

interface FontOption {
  name: string;
  label: string;
  family: string;
}

const FONTS: FontOption[] = [
  { name: 'monospace', label: 'Default (monospace)', family: 'monospace' },
  { name: 'JetBrains Mono', label: 'JetBrains Mono', family: '"JetBrains Mono", monospace' },
  { name: 'Fira Code', label: 'Fira Code', family: '"Fira Code", monospace' },
  { name: 'Cascadia Code', label: 'Cascadia Code', family: '"Cascadia Code", monospace' },
  { name: 'Source Code Pro', label: 'Source Code Pro', family: '"Source Code Pro", monospace' },
  { name: 'IBM Plex Mono', label: 'IBM Plex Mono', family: '"IBM Plex Mono", monospace' },
  { name: 'Hack', label: 'Hack', family: '"Hack", monospace' },
  { name: 'Menlo', label: 'Menlo', family: 'Menlo, monospace' },
  { name: 'Monaco', label: 'Monaco', family: 'Monaco, monospace' },
  { name: 'Consolas', label: 'Consolas', family: 'Consolas, monospace' },
  { name: 'Courier New', label: 'Courier New', family: '"Courier New", monospace' },
];

const SAMPLE_TEXT = 'The quick brown fox jumps over the lazy dog.\n0123456789 !@#$%^&*()_+-=[]{}|;:\'",./<>?';

export default function FontPanel() {
  const { state, dispatch } = useEditor();
  const fontFamily = state.fontFamily;

  return (
    <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, height: '100%' }}>
      <Select
        size="small"
        value={fontFamily}
        onChange={e => dispatch({ type: 'SET_FONT_FAMILY', payload: e.target.value })}
        sx={{ minWidth: 200 }}
        MenuProps={{
          PaperProps: {
            sx: { maxHeight: 360 },
          },
        }}
      >
        {FONTS.map(f => (
          <MenuItem key={f.name} value={f.name} sx={{ fontFamily: f.family }}>
            {f.label}
          </MenuItem>
        ))}
      </Select>

      <Box
        sx={{
          fontFamily: FONTS.find(f => f.name === fontFamily)?.family ?? 'monospace',
          fontSize: '0.8rem',
          lineHeight: 1.5,
          color: 'text.secondary',
          whiteSpace: 'pre',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          flex: 1,
          minWidth: 0,
        }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
          Preview:
        </Typography>
        {SAMPLE_TEXT}
      </Box>
    </Box>
  );
}
