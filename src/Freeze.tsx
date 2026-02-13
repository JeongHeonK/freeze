import { type ReactNode, Suspense, useInsertionEffect } from 'react';

const neverResolve = new Promise<void>(() => {});

let instanceCount = 0;

// Suspense가 re-suspend 시 커밋된 children에 inline display:none을 적용함.
// 이를 override하여 frozen 상태에서도 children이 화면에 보이도록 함.
const FREEZE_STYLE =
  '.freeze-container > [style*="display: none"] { display: block !important; }';

function injectStyle(): void {
  if (typeof document === 'undefined') return;
  instanceCount++;
  if (document.querySelector('style[data-freeze-style]')) return;
  const style = document.createElement('style');
  style.setAttribute('data-freeze-style', '');
  style.textContent = FREEZE_STYLE;
  document.head.appendChild(style);
}

function removeStyle(): void {
  if (typeof document === 'undefined') return;
  instanceCount--;
  if (instanceCount > 0) return;
  const style = document.querySelector('style[data-freeze-style]');
  if (style) style.remove();
}

function Suspender(): never {
  throw neverResolve;
}

export function Freeze({
  frozen,
  children,
}: {
  frozen: boolean;
  children: ReactNode;
}) {
  useInsertionEffect(() => {
    injectStyle();
    return removeStyle;
  }, []);

  return (
    <div className="freeze-container">
      <Suspense fallback={null}>
        {frozen && <Suspender />}
        {children}
      </Suspense>
    </div>
  );
}
