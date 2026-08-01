export type EventType = 'o' | 'i' | 'r' | 'm' | 'x';

export interface CastEvent {
  id: string;        // crypto.randomUUID(), assigned once at parse time
  time: number;      // seconds from recording start
  type: EventType;
  data: string;
}

/** Terminal color theme embedded in the asciicast header. */
export interface CastTheme {
  fg: string;       // hex foreground color, e.g. "#d0d0d0"
  bg: string;       // hex background color, e.g. "#121212"
  palette: string;  // colon-separated 16 hex ANSI colors
}

export interface CastHeader {
  version: 2 | 3;
  width: number;
  height: number;
  title?: string;
  duration?: number;
  /** v3: terminal type/emulation (e.g. "xterm-256color"), preserved on round-trip */
  termType?: string;
  /** v3: terminal version string (XTVERSION), preserved on round-trip */
  termVersion?: string;
  /** v3: Unix timestamp of recording start */
  timestamp?: number;
  /** v3: captured environment variables */
  env?: Record<string, string>;
  /** v3: idle time limit used during recording */
  idle_time_limit?: number;
  /** Terminal color theme (v2 top-level or v3 term.theme) */
  theme?: CastTheme;
  [key: string]: unknown;  // preserve unknown fields on round-trip
}

/** A comment line (# ...) from a v3 file, preserved on round-trip. */
export interface CastComment {
  /** 0-based index in the original event stream before which this comment appeared. */
  eventIndex: number;
  text: string;
}

export interface CastDocument {
  header: CastHeader;
  events: CastEvent[];
  /** v3 comment lines, preserved on round-trip. Re-inserted during serialization. */
  comments?: CastComment[];
}

export interface TimeRange { start: number; end: number; }

export type PanelId = 'trim' | 'cut' | 'speed' | 'removeIdle' | 'addIdle' | 'normalizeInput' | 'resize' | 'replaceText' | 'theme' | 'font' | 'info';

export interface EditorState {
  document: CastDocument | null;
  filename: string | null;
  selection: TimeRange | null;
  playhead: number;
  activePanel: PanelId | null;
  fontFamily: string;
  past: CastDocument[];   // undo stack (capped at 50)
  future: CastDocument[];
}
