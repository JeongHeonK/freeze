import { act, render, screen } from '@testing-library/react';
import { Freeze } from './Freeze';
import { useFreeze } from './useFreeze';

function Modal({ isOpen, duration }: { isOpen: boolean; duration?: number }) {
  const { shouldRender, frozen } = useFreeze(isOpen, duration);
  if (!shouldRender) return null;
  return (
    <Freeze frozen={frozen}>
      <div data-testid="modal">Modal Content</div>
    </Freeze>
  );
}

describe('useFreeze + Freeze 통합', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('isOpen=true일 때 children이 렌더링된다', () => {
    render(<Modal isOpen={true} />);
    expect(screen.getByTestId('modal')).toBeInTheDocument();
  });

  it('isOpen=false일 때 children이 렌더링되지 않는다', () => {
    render(<Modal isOpen={false} />);
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
  });

  it('닫힘 시 frozen 상태에서 children이 DOM에 남아있다', () => {
    const { rerender } = render(<Modal isOpen={true} />);
    expect(screen.getByTestId('modal')).toBeInTheDocument();

    act(() => {
      rerender(<Modal isOpen={false} />);
    });

    // frozen 상태: duration 내에 children이 DOM에 남아있다
    const modal = screen.queryByTestId('modal');
    expect(modal).toBeInTheDocument();
  });

  it('닫힘 후 duration 경과 시 children이 제거된다', () => {
    const { rerender } = render(<Modal isOpen={true} duration={300} />);
    expect(screen.getByTestId('modal')).toBeInTheDocument();

    act(() => {
      rerender(<Modal isOpen={false} duration={300} />);
    });

    // frozen 상태: 아직 보임
    expect(screen.queryByTestId('modal')).toBeInTheDocument();

    // duration 경과 → shouldRender=false → 언마운트
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
  });

  it('frozen 중 재오픈 시 타이머가 취소되고 정상 상태로 복원된다', () => {
    const { rerender } = render(<Modal isOpen={true} duration={300} />);

    // 닫기
    act(() => {
      rerender(<Modal isOpen={false} duration={300} />);
    });
    expect(screen.queryByTestId('modal')).toBeInTheDocument();

    // 100ms 후 재오픈
    act(() => {
      vi.advanceTimersByTime(100);
    });
    act(() => {
      rerender(<Modal isOpen={true} duration={300} />);
    });

    expect(screen.getByTestId('modal')).toBeInTheDocument();

    // 나머지 시간 경과해도 제거되지 않음
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.getByTestId('modal')).toBeInTheDocument();
  });

  it('커스텀 duration을 존중한다', () => {
    const { rerender } = render(<Modal isOpen={true} duration={500} />);

    act(() => {
      rerender(<Modal isOpen={false} duration={500} />);
    });

    // 300ms에는 아직 보임
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.queryByTestId('modal')).toBeInTheDocument();

    // 500ms에 제거됨
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
  });
});
