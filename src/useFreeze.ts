import { useState, useEffect, useRef, useCallback } from 'react';

const DEFAULT_DURATION = 300;
const MAX_DURATION = 10000;

export function useFreeze(isOpen: boolean, duration: number = DEFAULT_DURATION) {
  const safeDuration = Math.max(0, Math.min(duration, MAX_DURATION));
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [frozen, setFrozen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current !== undefined) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      // 열림: 타이머 취소, frozen 해제, 렌더링 보장
      clearTimer();
      setShouldRender(true);
      setFrozen(false);
    } else if (shouldRender) {
      // 닫힘: frozen 상태로 전환, duration 후 언마운트
      setFrozen(true);
      clearTimer();
      timeoutRef.current = setTimeout(() => {
        setShouldRender(false);
        setFrozen(false);
        timeoutRef.current = undefined;
      }, safeDuration);
    }

    return clearTimer;
  }, [isOpen, clearTimer]);

  return { shouldRender, frozen };
}
