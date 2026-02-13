import { render, screen } from '@testing-library/react';
import { Freeze } from './Freeze';

describe('Freeze', () => {
  it('frozen=false일 때 children을 정상 렌더링한다', () => {
    render(
      <Freeze frozen={false}>
        <div data-testid="child">Hello</div>
      </Freeze>,
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('frozen=true일 때 children을 렌더링하지 않는다', () => {
    render(
      <Freeze frozen={true}>
        <div data-testid="child">Hello</div>
      </Freeze>,
    );

    expect(screen.queryByTestId('child')).not.toBeInTheDocument();
  });

  it('unfrozen→frozen 전환 시 children이 숨겨진다', () => {
    const { rerender } = render(
      <Freeze frozen={false}>
        <div data-testid="child">Hello</div>
      </Freeze>,
    );

    expect(screen.getByTestId('child')).toBeVisible();

    rerender(
      <Freeze frozen={true}>
        <div data-testid="child">Hello</div>
      </Freeze>,
    );

    // jsdom에서 Suspense는 이미 커밋된 children을 display:none으로 숨김
    const child = screen.queryByTestId('child');
    if (child) {
      expect(child).not.toBeVisible();
    } else {
      expect(child).toBeNull();
    }
  });

  it('frozen→unfrozen 전환 시 children이 복원된다', () => {
    const { rerender } = render(
      <Freeze frozen={true}>
        <div data-testid="child">Hello</div>
      </Freeze>,
    );

    expect(screen.queryByTestId('child')).not.toBeInTheDocument();

    rerender(
      <Freeze frozen={false}>
        <div data-testid="child">Hello</div>
      </Freeze>,
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('.freeze-container wrapper div가 존재한다', () => {
    const { container } = render(
      <Freeze frozen={false}>
        <div>Hello</div>
      </Freeze>,
    );

    expect(container.querySelector('.freeze-container')).toBeInTheDocument();
  });

  it('style 태그를 주입하고 제거한다', () => {
    const { unmount } = render(
      <Freeze frozen={false}>
        <div>Hello</div>
      </Freeze>,
    );

    expect(
      document.querySelector('style[data-freeze-style]'),
    ).toBeInTheDocument();

    unmount();

    expect(
      document.querySelector('style[data-freeze-style]'),
    ).not.toBeInTheDocument();
  });

  it('다중 인스턴스 시 style 태그가 중복되지 않는다', () => {
    const { unmount: unmount1 } = render(
      <Freeze frozen={false}>
        <div>First</div>
      </Freeze>,
    );

    const { unmount: unmount2 } = render(
      <Freeze frozen={false}>
        <div>Second</div>
      </Freeze>,
    );

    const styleTags = document.querySelectorAll('style[data-freeze-style]');
    expect(styleTags.length).toBe(1);

    unmount1();
    expect(
      document.querySelector('style[data-freeze-style]'),
    ).toBeInTheDocument();

    unmount2();
    expect(
      document.querySelector('style[data-freeze-style]'),
    ).not.toBeInTheDocument();
  });
});
