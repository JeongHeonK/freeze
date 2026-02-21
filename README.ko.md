# freeze

> Freeze your React components during exit animations.

닫히는 컴포넌트가 애니메이션 중 내용이 바뀌는 현상을 방지하는 React 라이브러리.

## Inspiration

이 라이브러리는 [Maxwell Barvian의 "Bulletproof React Exit Animations"](https://barvian.me/react-exit-animations)에서 영감을 받아 제작되었습니다.

### 문제: Exit Animation 중 콘텐츠 변경

팝오버, 모달, 드로어 같은 컴포넌트가 닫히는 애니메이션 도중에도 React는 상태 업데이트를 계속 처리합니다. 이로 인해 닫히는 동안 검색어 placeholder가 바뀌거나, 선택된 항목의 순서가 재정렬되는 등 사용자 경험을 해치는 깜빡임이 발생합니다.

### 해결: "보이지만 얼어붙은" 컴포넌트

핵심 아이디어는 React의 **Suspense**를 역으로 활용하는 것입니다. Suspense는 서브트리를 렌더링하되 DOM 커밋을 방지하는 특성을 가지는데, 이를 이용해 컴포넌트를 "정지된" 상태로 만들 수 있습니다. 무한 Promise를 throw하여 강제로 suspend시키면, 화면에는 이전 상태가 그대로 유지됩니다.

React 팀이 개발 중인 **Activity API**가 공식 지원되면 유사한 "보이지만 비활성" 상태를 네이티브로 제공할 수 있을 것으로 기대됩니다.

freeze는 두 가지 접근법을 제공합니다:

1. **`useFreeze` hook** — 타이머 기반으로 컴포넌트 언마운트를 지연시키고, `frozen` 상태를 제공하여 개발자가 인터랙션을 제어할 수 있게 합니다. 대부분의 경우에 충분합니다.

2. **`Freeze` component** — React Suspense를 활용하여 DOM 커밋 자체를 차단합니다. 렌더링은 계속하되 화면에는 이전 상태가 그대로 유지됩니다.

## Demo

GIF 녹화 후 아래 이미지가 표시됩니다. 직접 실행하려면:

```bash
pnpm build
cd demo && pnpm install && pnpm dev
```

<table>
  <tr>
    <th>Without freeze — 깜빡임 발생</th>
    <th>With freeze — 깔끔</th>
  </tr>
  <tr>
    <td><img src="./demo/assets/without-freeze.gif" alt="without-freeze" /></td>
    <td><img src="./demo/assets/with-freeze.gif" alt="with-freeze" /></td>
  </tr>
</table>

---

## Installation

```bash
npm install @jeonheonkim/freeze
# or
pnpm add @jeonheonkim/freeze
# or
yarn add @jeonheonkim/freeze
```

> React 18 이상이 필요합니다.

## API

### `useFreeze(isOpen, durationOrOptions?)`

컴포넌트의 렌더 라이프사이클을 관리하는 hook.

```ts
// 간단한 사용 — 고정 duration
const { shouldRender, frozen } = useFreeze(isOpen, 300);

// options 객체 — 콜백 포함
const { shouldRender, frozen } = useFreeze(isOpen, {
  duration: 300,
  onExitComplete: () => console.log('exit done'),
});

// ref 기반 — animation/transition 종료 자동 감지
const ref = useRef<HTMLDivElement>(null);
const { shouldRender, frozen } = useFreeze(isOpen, {
  ref,
  onExitComplete: () => console.log('exit done'),
});
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `isOpen` | `boolean` | — | 컴포넌트의 열림/닫힘 상태 |
| `durationOrOptions` | `number \| UseFreezeOptions` | `300` | 닫힘 애니메이션 지속 시간(ms) 또는 options 객체 |

**`UseFreezeOptions`:**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `duration` | `number` | `300` | 닫힘 애니메이션 지속 시간 (ms, 최대 10000) |
| `onExitComplete` | `() => void` | — | 닫힘 애니메이션 완료 후 컴포넌트 언마운트 시 호출 |
| `ref` | `RefObject<HTMLElement \| null>` | — | `transitionend` / `animationend` 자동 감지를 위한 요소 ref. 제공 시 `duration`은 무시됨 (`ref.current`가 `null`이면 `duration`으로 폴백). 이벤트 미감지 시 10초 안전 타임아웃 발동. |

**Returns (`UseFreezeReturn`):**

| Property | Type | Description |
|----------|------|-------------|
| `shouldRender` | `boolean` | 컴포넌트를 렌더링해야 하는지 여부 |
| `frozen` | `boolean` | 컴포넌트가 얼어붙은 상태인지 여부 |

### `<Freeze frozen={boolean}>`

Suspense 기반으로 children의 DOM 업데이트를 완전히 차단하는 컴포넌트.

```tsx
<Freeze frozen={frozen}>
  <div>이 내용은 frozen=true일 때 화면에서 변경되지 않습니다</div>
</Freeze>
```

**Props (`FreezeProps`):**

| Prop | Type | Description |
|------|------|-------------|
| `frozen` | `boolean` | `true`이면 children의 DOM 커밋을 차단 |
| `children` | `ReactNode` | 렌더링할 자식 요소 |

### TypeScript

모든 타입이 export됩니다:

```ts
import type { FreezeProps, UseFreezeOptions, UseFreezeReturn } from '@jeonheonkim/freeze';
```

## Usage

### 기본 사용 (useFreeze만 사용)

대부분의 경우 `useFreeze`만으로 충분합니다.

```tsx
import { useFreeze } from '@jeonheonkim/freeze';

function Modal({ isOpen }: { isOpen: boolean }) {
  const { shouldRender, frozen } = useFreeze(isOpen, 300);

  if (!shouldRender) return null;

  return (
    <div
      className={isOpen ? 'modal-enter' : 'modal-exit'}
      style={{ pointerEvents: frozen ? 'none' : 'auto' }}
    >
      <p>Modal Content</p>
    </div>
  );
}
```

### `onExitComplete` 콜백

닫힘 애니메이션 완료 후 정리 로직을 실행합니다.

```tsx
import { useFreeze } from '@jeonheonkim/freeze';

function Drawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { shouldRender, frozen } = useFreeze(isOpen, {
    duration: 400,
    onExitComplete: () => onClose(),
  });

  if (!shouldRender) return null;

  return (
    <div
      className={isOpen ? 'drawer-enter' : 'drawer-exit'}
      style={{ pointerEvents: frozen ? 'none' : 'auto' }}
    >
      <p>Drawer Content</p>
    </div>
  );
}
```

### ref 기반 이벤트 감지

CSS animation/transition 종료를 브라우저가 알려줍니다 — `duration`을 하드코딩할 필요가 없습니다.

```tsx
import { useRef } from 'react';
import { useFreeze } from '@jeonheonkim/freeze';

function Tooltip({ isOpen }: { isOpen: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { shouldRender, frozen } = useFreeze(isOpen, { ref });

  if (!shouldRender) return null;

  return (
    <div
      ref={ref}
      className={isOpen ? 'tooltip-enter' : 'tooltip-exit'}
      style={{ pointerEvents: frozen ? 'none' : 'auto' }}
    >
      <p>Tooltip Content</p>
    </div>
  );
}
```

### Suspense 기반 (useFreeze + Freeze 조합)

DOM 업데이트를 완전히 차단해야 할 때 `Freeze` 컴포넌트를 함께 사용합니다.

```tsx
import { Freeze, useFreeze } from '@jeonheonkim/freeze';

function Popover({ isOpen }: { isOpen: boolean }) {
  const { shouldRender, frozen } = useFreeze(isOpen, { duration: 200 });

  if (!shouldRender) return null;

  return (
    <Freeze frozen={frozen}>
      <div className={isOpen ? 'popover-enter' : 'popover-exit'}>
        <SearchInput />
        <ItemList />
      </div>
    </Freeze>
  );
}
```

## License

MIT
