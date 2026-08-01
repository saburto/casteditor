export type EventType = 'o' | 'i' | 'r' | 'm' | 'x';

export interface CastEvent {
  id: string;        // crypto.randomUUID(), assigned once at parse time
  time: number;      // seconds from recording start
  type: EventType;
  data: string;
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

export type PanelId = 'trim' | 'cut' | 'speed' | 'removeIdle' | 'addIdle' | 'normalizeInput' | 'resize' | 'replaceText' | 'info';

export interface EditorState {
  document: CastDocument | null;
  filename: string | null;
  selection: TimeRange | null;
  playhead: number;
  activePanel: PanelId | null;
  past: CastDocument[];   // undo stack (capped at 50)
  future: CastDocument[];
}
