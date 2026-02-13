import { renderHook, act } from '@testing-library/react';
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
    const { result, rerender } = renderHook(
      ({ isOpen }) => useFreeze(isOpen),
      { initialProps: { isOpen: false } },
    );

    rerender({ isOpen: true });

    expect(result.current).toEqual({ shouldRender: true, frozen: false });
  });

  it('true→false 전환 즉시 shouldRender=true, frozen=true', () => {
    const { result, rerender } = renderHook(
      ({ isOpen }) => useFreeze(isOpen),
      { initialProps: { isOpen: true } },
    );

    rerender({ isOpen: false });

    expect(result.current).toEqual({ shouldRender: true, frozen: true });
  });

  it('닫힘 후 기본 duration(300ms) 경과 시 shouldRender=false, frozen=false', () => {
    const { result, rerender } = renderHook(
      ({ isOpen }) => useFreeze(isOpen),
      { initialProps: { isOpen: true } },
    );

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
    const { result, rerender } = renderHook(
      ({ isOpen }) => useFreeze(isOpen),
      { initialProps: { isOpen: true } },
    );

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
    const { result, rerender } = renderHook(
      ({ isOpen }) => useFreeze(isOpen),
      { initialProps: { isOpen: true } },
    );

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
