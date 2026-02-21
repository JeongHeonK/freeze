import {
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

const DEFAULT_DURATION = 300;
const MAX_DURATION = 10000;

export interface UseFreezeOptions {
  duration?: number;
  onExitComplete?: () => void;
  ref?: RefObject<HTMLElement | null>;
}

export interface UseFreezeReturn {
  shouldRender: boolean;
  frozen: boolean;
}

export function useFreeze(
  isOpen: boolean,
  durationOrOptions?: number | UseFreezeOptions,
): UseFreezeReturn {
  const isOptions =
    typeof durationOrOptions === 'object' && durationOrOptions !== null;

  const duration = isOptions
    ? (durationOrOptions.duration ?? DEFAULT_DURATION)
    : (durationOrOptions ?? DEFAULT_DURATION);

  const onExitComplete = isOptions
    ? durationOrOptions.onExitComplete
    : undefined;

  const elementRef = isOptions ? durationOrOptions.ref : undefined;

  const safeDuration = Math.max(0, Math.min(duration, MAX_DURATION));
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [frozen, setFrozen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const onExitCompleteRef = useRef(onExitComplete);
  onExitCompleteRef.current = onExitComplete;

  const clearTimer = useCallback(() => {
    if (timeoutRef.current !== undefined) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, []);

  const scheduleRefExit = (el: HTMLElement) => {
    let settled = false;

    const handleEnd = () => {
      if (settled) return;
      settled = true;
      clearTimer();
      el.removeEventListener('transitionend', handleEnd);
      el.removeEventListener('animationend', handleEnd);
      setShouldRender(false);
      setFrozen(false);
      onExitCompleteRef.current?.();
    };

    el.addEventListener('transitionend', handleEnd);
    el.addEventListener('animationend', handleEnd);
    timeoutRef.current = setTimeout(handleEnd, MAX_DURATION);

    return () => {
      settled = true;
      clearTimer();
      el.removeEventListener('transitionend', handleEnd);
      el.removeEventListener('animationend', handleEnd);
    };
  };

  const scheduleDurationExit = () => {
    timeoutRef.current = setTimeout(() => {
      setShouldRender(false);
      setFrozen(false);
      timeoutRef.current = undefined;
      onExitCompleteRef.current?.();
    }, safeDuration);
    return clearTimer;
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies(shouldRender): adding causes infinite loop — effect sets shouldRender
  // biome-ignore lint/correctness/useExhaustiveDependencies(elementRef?.current): ref.current changes don't require effect re-run; listeners are bound on close transition
  // biome-ignore lint/correctness/useExhaustiveDependencies(scheduleRefExit): stable closure recreated per render, not a dependency
  // biome-ignore lint/correctness/useExhaustiveDependencies(scheduleDurationExit): stable closure recreated per render, not a dependency
  useEffect(() => {
    if (isOpen) {
      clearTimer();
      setShouldRender(true);
      setFrozen(false);
      return clearTimer;
    }

    if (!shouldRender) return clearTimer;

    setFrozen(true);
    clearTimer();

    const el = elementRef?.current;
    return el ? scheduleRefExit(el) : scheduleDurationExit();
  }, [isOpen, clearTimer]);

  return { shouldRender, frozen };
}
