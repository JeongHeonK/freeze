import { act, renderHook } from '@testing-library/react';
import { useFreeze } from './useFreeze';

describe('useFreeze', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('isOpen=true일 때 shouldRender=true, frozen=false', () => {
    const { result } = renderHook(() => useFreeze(true));
    expect(result.current).toEqual({ shouldRender: true, frozen: false });
  });

  it('isOpen=false일 때 shouldRender=false, frozen=false', () => {
    const { result } = renderHook(() => useFreeze(false));
    expect(result.current).toEqual({ shouldRender: false, frozen: false });
  });

  it('false→true 전환 시 shouldRender=true, frozen=false', () => {
    const { result, rerender } = renderHook(({ isOpen }) => useFreeze(isOpen), {
      initialProps: { isOpen: false },
    });

    rerender({ isOpen: true });

    expect(result.current).toEqual({ shouldRender: true, frozen: false });
  });

  it('true→false 전환 즉시 shouldRender=true, frozen=true', () => {
    const { result, rerender } = renderHook(({ isOpen }) => useFreeze(isOpen), {
      initialProps: { isOpen: true },
    });

    rerender({ isOpen: false });

    expect(result.current).toEqual({ shouldRender: true, frozen: true });
  });

  it('닫힘 후 기본 duration(300ms) 경과 시 shouldRender=false, frozen=false', () => {
    const { result, rerender } = renderHook(({ isOpen }) => useFreeze(isOpen), {
      initialProps: { isOpen: true },
    });

    rerender({ isOpen: false });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toEqual({ shouldRender: false, frozen: false });
  });

  it('커스텀 duration(500ms)을 존중한다', () => {
    const { result, rerender } = renderHook(
      ({ isOpen }) => useFreeze(isOpen, 500),
      { initialProps: { isOpen: true } },
    );

    rerender({ isOpen: false });

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toEqual({ shouldRender: true, frozen: true });

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toEqual({ shouldRender: false, frozen: false });
  });

  it('duration 내 재오픈 시 타임아웃을 취소한다', () => {
    const { result, rerender } = renderHook(({ isOpen }) => useFreeze(isOpen), {
      initialProps: { isOpen: true },
    });

    rerender({ isOpen: false });

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toEqual({ shouldRender: true, frozen: true });

    rerender({ isOpen: true });
    expect(result.current).toEqual({ shouldRender: true, frozen: false });

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toEqual({ shouldRender: true, frozen: false });
  });

  it('unmount 시 타임아웃을 정리한다', () => {
    const { rerender, unmount } = renderHook(
      ({ isOpen }) => useFreeze(isOpen),
      { initialProps: { isOpen: true } },
    );

    rerender({ isOpen: false });
    unmount();

    // setTimeout 콜백이 에러 없이 실행되지 않아야 함
    expect(() => {
      vi.advanceTimersByTime(300);
    }).not.toThrow();
  });

  it('빠른 open/close/open 토글을 처리한다', () => {
    const { result, rerender } = renderHook(({ isOpen }) => useFreeze(isOpen), {
      initialProps: { isOpen: true },
    });

    // close
    rerender({ isOpen: false });
    expect(result.current).toEqual({ shouldRender: true, frozen: true });

    // reopen quickly
    rerender({ isOpen: true });
    expect(result.current).toEqual({ shouldRender: true, frozen: false });

    // close again
    rerender({ isOpen: false });
    expect(result.current).toEqual({ shouldRender: true, frozen: true });

    // reopen again before timeout
    rerender({ isOpen: true });
    expect(result.current).toEqual({ shouldRender: true, frozen: false });

    // ensure no lingering timeouts cause issues
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toEqual({ shouldRender: true, frozen: false });
  });
});

describe('useFreeze - onExitComplete', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('duration 경과 시 onExitComplete를 호출한다', () => {
    const onExitComplete = vi.fn();
    const { rerender } = renderHook(
      ({ isOpen }) => useFreeze(isOpen, { duration: 300, onExitComplete }),
      { initialProps: { isOpen: true } },
    );

    rerender({ isOpen: false });

    expect(onExitComplete).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(onExitComplete).toHaveBeenCalledTimes(1);
  });

  it('재오픈 시 onExitComplete를 호출하지 않는다', () => {
    const onExitComplete = vi.fn();
    const { rerender } = renderHook(
      ({ isOpen }) => useFreeze(isOpen, { duration: 300, onExitComplete }),
      { initialProps: { isOpen: true } },
    );

    rerender({ isOpen: false });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    rerender({ isOpen: true });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(onExitComplete).not.toHaveBeenCalled();
  });

  it('options 객체로 duration을 전달한다', () => {
    const { result, rerender } = renderHook(
      ({ isOpen }) => useFreeze(isOpen, { duration: 500 }),
      { initialProps: { isOpen: true } },
    );

    rerender({ isOpen: false });

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toEqual({ shouldRender: true, frozen: true });

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toEqual({ shouldRender: false, frozen: false });
  });

  it('숫자와 options 객체가 동일하게 동작한다', () => {
    const { result: resultNumber, rerender: rerenderNumber } = renderHook(
      ({ isOpen }) => useFreeze(isOpen, 400),
      { initialProps: { isOpen: true } },
    );

    const { result: resultOptions, rerender: rerenderOptions } = renderHook(
      ({ isOpen }) => useFreeze(isOpen, { duration: 400 }),
      { initialProps: { isOpen: true } },
    );

    rerenderNumber({ isOpen: false });
    rerenderOptions({ isOpen: false });

    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(resultNumber.current).toEqual(resultOptions.current);
  });

  it('onExitComplete가 undefined이어도 에러가 없다', () => {
    const { rerender } = renderHook(
      ({ isOpen }) => useFreeze(isOpen, { duration: 300 }),
      { initialProps: { isOpen: true } },
    );

    rerender({ isOpen: false });

    expect(() => {
      act(() => {
        vi.advanceTimersByTime(300);
      });
    }).not.toThrow();
  });

  it('콜백 변경 시 타이머를 리셋하지 않는다', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    const { rerender } = renderHook(
      ({ isOpen, onExitComplete }) =>
        useFreeze(isOpen, { duration: 300, onExitComplete }),
      { initialProps: { isOpen: true, onExitComplete: callback1 } },
    );

    rerender({ isOpen: false, onExitComplete: callback1 });

    act(() => {
      vi.advanceTimersByTime(150);
    });

    // 콜백 변경 — 타이머 리셋 안됨
    rerender({ isOpen: false, onExitComplete: callback2 });

    act(() => {
      vi.advanceTimersByTime(150);
    });

    // callback2가 호출되어야 함 (최신 콜백)
    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).toHaveBeenCalledTimes(1);
  });
});

describe('useFreeze - ref 기반 이벤트 감지', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('transitionend 이벤트로 언마운트한다', () => {
    const el = document.createElement('div');
    const ref = { current: el };
    const onExitComplete = vi.fn();

    const { result, rerender } = renderHook(
      ({ isOpen }) => useFreeze(isOpen, { ref, onExitComplete }),
      { initialProps: { isOpen: true } },
    );

    rerender({ isOpen: false });
    expect(result.current).toEqual({ shouldRender: true, frozen: true });

    act(() => {
      el.dispatchEvent(new Event('transitionend'));
    });

    expect(result.current).toEqual({ shouldRender: false, frozen: false });
    expect(onExitComplete).toHaveBeenCalledTimes(1);
  });

  it('animationend 이벤트로 언마운트한다', () => {
    const el = document.createElement('div');
    const ref = { current: el };
    const onExitComplete = vi.fn();

    const { result, rerender } = renderHook(
      ({ isOpen }) => useFreeze(isOpen, { ref, onExitComplete }),
      { initialProps: { isOpen: true } },
    );

    rerender({ isOpen: false });

    act(() => {
      el.dispatchEvent(new Event('animationend'));
    });

    expect(result.current).toEqual({ shouldRender: false, frozen: false });
    expect(onExitComplete).toHaveBeenCalledTimes(1);
  });

  it('이벤트 미발생 시 MAX_DURATION 후 안전 언마운트한다', () => {
    const el = document.createElement('div');
    const ref = { current: el };

    const { result, rerender } = renderHook(
      ({ isOpen }) => useFreeze(isOpen, { ref }),
      { initialProps: { isOpen: true } },
    );

    rerender({ isOpen: false });
    expect(result.current).toEqual({ shouldRender: true, frozen: true });

    // MAX_DURATION(10000ms) 전에는 여전히 frozen
    act(() => {
      vi.advanceTimersByTime(9999);
    });
    expect(result.current).toEqual({ shouldRender: true, frozen: true });

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toEqual({ shouldRender: false, frozen: false });
  });

  it('재오픈 시 이벤트 리스너를 정리한다', () => {
    const el = document.createElement('div');
    const ref = { current: el };
    const onExitComplete = vi.fn();

    const { result, rerender } = renderHook(
      ({ isOpen }) => useFreeze(isOpen, { ref, onExitComplete }),
      { initialProps: { isOpen: true } },
    );

    rerender({ isOpen: false });

    // 재오픈
    rerender({ isOpen: true });
    expect(result.current).toEqual({ shouldRender: true, frozen: false });

    // 이전 리스너의 이벤트가 발생해도 상태 변경 없어야 함
    act(() => {
      el.dispatchEvent(new Event('transitionend'));
    });
    expect(result.current).toEqual({ shouldRender: true, frozen: false });
    expect(onExitComplete).not.toHaveBeenCalled();
  });

  it('ref.current가 null이면 duration 폴백한다', () => {
    const ref = { current: null };

    const { result, rerender } = renderHook(
      ({ isOpen }) => useFreeze(isOpen, { ref, duration: 200 }),
      { initialProps: { isOpen: true } },
    );

    rerender({ isOpen: false });
    expect(result.current).toEqual({ shouldRender: true, frozen: true });

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toEqual({ shouldRender: false, frozen: false });
  });

  it('duration과 ref 동시 제공 시 ref를 우선한다', () => {
    const el = document.createElement('div');
    const ref = { current: el };

    const { result, rerender } = renderHook(
      ({ isOpen }) => useFreeze(isOpen, { ref, duration: 100 }),
      { initialProps: { isOpen: true } },
    );

    rerender({ isOpen: false });

    // duration(100ms)이 지나도 ref 모드이므로 여전히 frozen
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toEqual({ shouldRender: true, frozen: true });

    // 이벤트로 언마운트
    act(() => {
      el.dispatchEvent(new Event('transitionend'));
    });
    expect(result.current).toEqual({ shouldRender: false, frozen: false });
  });
});
