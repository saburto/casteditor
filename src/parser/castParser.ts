import type { CastDocument, CastComment, CastEvent, CastHeader, EventType } from '../types/asciicast';

function normalizeHeader(raw: Record<string, unknown>): CastHeader {
  const version = raw.version as number;
  if (version !== 2 && version !== 3) {
    throw new Error(`Unsupported asciicast version: ${version}`);
  }

  let width: number;
  let height: number;
  let termType: string | undefined;
  let termVersion: string | undefined;

  if (version === 3 && raw.term && typeof raw.term === 'object') {
    const term = raw.term as Record<string, unknown>;
    width = (term.cols as number) ?? 80;
    height = (term.rows as number) ?? 24;
    termType = term.type as string | undefined;
    termVersion = term.version as string | undefined;
  } else {
    width = (raw.width as number) ?? 80;
    height = (raw.height as number) ?? 24;
  }

  // Delete raw's width/height/term so the spread won't clobber normalized values
  const { version: _v, width: _w, height: _h, term: _term, ...rest } = raw;

  return {
    version,
    width,
    height,
    ...rest,
    title: raw.title as string | undefined,
    duration: raw.duration as number | undefined,
    termType,
    termVersion,
    timestamp: raw.timestamp as number | undefined,
    env: raw.env as Record<string, string> | undefined,
    idle_time_limit: raw.idle_time_limit as number | undefined,
  };
}

export function parseCast(text: string): CastDocument {
  const rawLines = text.split('\n');
  if (rawLines.length === 0) throw new Error('Empty file');

  // Find first non-empty, non-comment line (the header)
  let headerLineIdx = 0;
  while (headerLineIdx < rawLines.length) {
    const trimmed = rawLines[headerLineIdx].trim();
    if (trimmed && !trimmed.startsWith('#')) break;
    headerLineIdx++;
  }
  if (headerLineIdx >= rawLines.length) throw new Error('No header found');

  const rawHeader = JSON.parse(rawLines[headerLineIdx].trim()) as Record<string, unknown>;
  const header = normalizeHeader(rawHeader);
  const isV3 = header.version === 3;

  const events: CastEvent[] = [];
  const comments: CastComment[] = [];
  let absoluteTime = 0;

  for (let i = headerLineIdx + 1; i < rawLines.length; i++) {
    const line = rawLines[i].trim();
    if (!line) continue;

    // Handle comment lines (v3)
    if (line.startsWith('#')) {
      comments.push({ eventIndex: events.length, text: line });
      continue;
    }

    try {
      const parsed = JSON.parse(line) as [number, string, unknown];
      const [rawTime, type, rawData] = parsed;

      // Convert delta to absolute for v3
      if (isV3) {
        absoluteTime += rawTime;
      } else {
        absoluteTime = rawTime;
      }

      // 'x' events carry a numeric exit code; coerce to string for uniform storage
      const data = typeof rawData === 'number' ? String(rawData) : (rawData as string);

      events.push({
        id: crypto.randomUUID(),
        time: Math.round(absoluteTime * 1000) / 1000,
        type: type as EventType,
        data,
      });
    } catch {
      // skip malformed lines
    }
  }

  const doc: CastDocument = { header, events };
  if (comments.length > 0) doc.comments = comments;
  return doc;
}
