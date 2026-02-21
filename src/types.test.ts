import type { FreezeProps, UseFreezeReturn } from './index';

describe('Type exports', () => {
  it('FreezeProps 타입이 frozen과 children을 가진다', () => {
    const props: FreezeProps = {
      frozen: true,
      children: null,
    };
    expect(props.frozen).toBe(true);
  });

  it('UseFreezeReturn 타입이 shouldRender와 frozen을 가진다', () => {
    const result: UseFreezeReturn = {
      shouldRender: true,
      frozen: false,
    };
    expect(result.shouldRender).toBe(true);
    expect(result.frozen).toBe(false);
  });
});
