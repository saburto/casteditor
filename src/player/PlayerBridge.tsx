import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import * as AsciinemaPlayer from 'asciinema-player';
import { serializeCast } from '../serializer/castSerializer';
import type { CastDocument } from '../types/asciicast';

type PlayerInstance = ReturnType<typeof AsciinemaPlayer.create>;

export interface PlayerBridgeHandle {
  seek(time: number): void;
}

interface PlayerBridgeProps {
  document: CastDocument;
  fontFamily?: string;
  onTimeUpdate?: (time: number) => void;
}

const PlayerBridge = forwardRef<PlayerBridgeHandle, PlayerBridgeProps>(
function PlayerBridge({ document, fontFamily, onTimeUpdate }, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<PlayerInstance | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onTimeUpdateRef = useRef(onTimeUpdate);
  onTimeUpdateRef.current = onTimeUpdate;

  useImperativeHandle(ref, () => ({
    seek(time: number) {
      try { playerRef.current?.seek(time); } catch { /* ignore */ }
    },
  }));

  useEffect(() => {
    if (!containerRef.current) return;

    // Capture current time before we destroy (it's a Promise)
    const recreate = async () => {
      let startAt = 0;
      if (playerRef.current) {
        try {
          startAt = await playerRef.current.getCurrentTime() ?? 0;
        } catch {
          startAt = 0;
        }
        try { playerRef.current.dispose(); } catch { /* ignore */ }
        playerRef.current = null;
      }

      if (containerRef.current) {
        containerRef.current.innerHTML = '';
        const castText = serializeCast(document, 2);

        // If the document has an embedded theme, let the player read it from the
        // cast data (don't override with a player option). Otherwise use monokai.
        const playerOpts: Record<string, unknown> = { startAt, fit: 'height' };
        if (!document.header.theme) {
          playerOpts.theme = 'monokai';
        }

        playerRef.current = AsciinemaPlayer.create(
          { data: castText },
          containerRef.current,
          playerOpts as Parameters<typeof AsciinemaPlayer.create>[2]
        );
      }
    };

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => { recreate(); }, 300);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [document, fontFamily]);

  // Inject font CSS — runs after player recreation so new DOM gets the font
  useEffect(() => {
    const STYLE_ID = 'casteditor-font-override';
    const doc = window.document;
    let styleEl = doc.getElementById(STYLE_ID) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = doc.createElement('style');
      styleEl.id = STYLE_ID;
      doc.head.appendChild(styleEl);
    }
    if (!fontFamily || fontFamily === 'monospace') {
      styleEl.textContent = '';
    } else {
      styleEl.textContent = `.ap-player, .ap-player * { font-family: "${fontFamily}", monospace !important; }`;
    }
  }, [document, fontFamily]);



  // Poll time — getCurrentTime() returns a Promise<number>
  useEffect(() => {
    const interval = setInterval(async () => {
      if (playerRef.current && onTimeUpdateRef.current) {
        try {
          const t = await playerRef.current.getCurrentTime();
          if (typeof t === 'number' && onTimeUpdateRef.current) {
            onTimeUpdateRef.current(t);
          }
        } catch { /* ignore */ }
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (playerRef.current) {
        try { playerRef.current.dispose(); } catch { /* ignore */ }
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', minHeight: 0, background: '#000' }}
    />
  );
});

export default PlayerBridge;
