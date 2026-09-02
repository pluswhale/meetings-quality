import { useCallback, useEffect, useRef } from 'react';
import { useMeetingStore } from '../store/useMeetingStore';
import type { UseMeetingSocketReturn } from './useMeetingSocket';

const THROTTLE_MS = 400;

/**
 * Meeting-level «Выводы встречи». Only the creator may write; everyone else
 * reads the live store value broadcast by the server.
 */
export const useMeetingConclusions = (
  socket: UseMeetingSocketReturn,
  isCreator: boolean,
) => {
  const conclusions = useMeetingStore((s) => s.conclusions);
  const setConclusions = useMeetingStore((s) => s.setConclusions);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestRef = useRef(conclusions);
  latestRef.current = conclusions;

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const onConclusionsChange = useCallback(
    (text: string) => {
      if (!isCreator) return;
      setConclusions(text);
      latestRef.current = text;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        socket.emitUpdateConclusions(latestRef.current);
      }, THROTTLE_MS);
    },
    [isCreator, setConclusions, socket],
  );

  return { conclusions, onConclusionsChange };
};
