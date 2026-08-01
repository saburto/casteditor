import type { CastDocument } from '../types/asciicast';

const r3 = (n: number) => Math.round(n * 1000) / 1000;

type OutputVersion = 2 | 3;

function buildHeader(doc: CastDocument, version: OutputVersion): Record<string, unknown> {
  const h = doc.header;
  const lastEventTime = doc.events.length > 0
    ? Math.max(...doc.events.map(e => e.time))
    : 0;

  if (version === 3) {
    // Build v3 header with nested 'term' object
    const term: Record<string, unknown> = {
      cols: h.width,
      rows: h.height,
    };
    if (h.termType) term.type = h.termType;
    if (h.termVersion) term.version = h.termVersion;
    if (h.theme) term.theme = h.theme;

    const header: Record<string, unknown> = {
      version: 3,
      term,
      duration: r3(lastEventTime),
    };
    if (h.title) header.title = h.title;
    if (h.timestamp != null) header.timestamp = h.timestamp;
    if (h.env) header.env = h.env;
    if (h.idle_time_limit != null) header.idle_time_limit = h.idle_time_limit;

    // Preserve any unknown fields from the original header (skip ones we handle explicitly)
    for (const [key, value] of Object.entries(h)) {
      if (['version', 'width', 'height', 'termType', 'termVersion',
           'timestamp', 'env', 'idle_time_limit', 'title', 'duration', 'theme'].includes(key)) continue;
      if (!(key in header)) header[key] = value;
    }

    return header;
  }

  // v2: flat header
  const header: Record<string, unknown> = {
    version: 2,
    width: h.width,
    height: h.height,
    duration: r3(lastEventTime),
  };
  if (h.title) header.title = h.title;
  if (h.theme) header.theme = h.theme;

  // Preserve unknown fields
  for (const [key, value] of Object.entries(h)) {
    if (['version', 'width', 'height', 'duration', 'title',
         'termType', 'termVersion', 'timestamp', 'env', 'idle_time_limit', 'theme'].includes(key)) continue;
    if (!(key in header)) header[key] = value;
  }

  return header;
}

export function serializeCast(doc: CastDocument, version: OutputVersion = 2): string {
  const header = buildHeader(doc, version);
  const lines: string[] = [JSON.stringify(header)];

  // Pre-sort comments by eventIndex for O(n) interleaving
  const commentMap = new Map<number, string[]>();
  if (doc.comments) {
    for (const c of doc.comments) {
      const existing = commentMap.get(c.eventIndex);
      if (existing) existing.push(c.text);
      else commentMap.set(c.eventIndex, [c.text]);
    }
  }

  let commentIdx = 0;
  for (const event of doc.events) {
    // Emit any comments that appear before this event
    const pendingComments = commentMap.get(commentIdx);
    if (pendingComments) {
      for (const c of pendingComments) lines.push(c);
    }
    commentIdx++;

    let time: number;
    let data: string | number = event.data;

    if (version === 3) {
      // Convert absolute time to delta (relative to previous event)
      const prevTime = commentIdx > 1 ? doc.events[commentIdx - 2].time : 0;
      time = r3(event.time - prevTime);
      // 'x' events carry numeric exit code in v3
      if (event.type === 'x') {
        const n = parseInt(event.data, 10);
        data = isNaN(n) ? 0 : n;
      }
    } else {
      time = event.time;
    }

    lines.push(JSON.stringify([time, event.type, data]));
  }

  // Emit any trailing comments (after the last event)
  const trailingComments = commentMap.get(commentIdx);
  if (trailingComments) {
    for (const c of trailingComments) lines.push(c);
  }

  return lines.join('\n') + '\n';
}
