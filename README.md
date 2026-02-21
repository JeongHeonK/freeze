# freeze

> Freeze your React components during exit animations.

A React library that prevents content from changing inside components while they are animating out.

[한국어](./README.ko.md)

## Inspiration

Inspired by [Maxwell Barvian's "Bulletproof React Exit Animations"](https://barvian.me/react-exit-animations).

### The problem: content changes during exit animations

When a popover, modal, or drawer starts closing, React keeps processing state updates during the animation. This causes visible flicker — search placeholders change, selected items reorder, counters keep ticking — all while the component is fading out.

### The solution: "visible but frozen" components

The core idea is to repurpose React's **Suspense** mechanism. Suspense renders a subtree but prevents DOM commits — by throwing a never-resolving Promise, we force a component into a suspended state where the screen keeps showing the last committed snapshot.

Once the React team ships the **Activity API**, a native "visible but inactive" state will be available. Until then, this library provides a practical solution.

freeze offers two approaches:

1. **`useFreeze` hook** — delays unmounting with a timer and exposes a `frozen` flag so you can disable interactions during the exit. Sufficient for most cases.

2. **`Freeze` component** — uses React Suspense to block all DOM commits. The component keeps rendering but nothing reaches the screen.

## Demo

Run the demo app locally:

```bash
pnpm build
cd demo && pnpm install && pnpm dev
```

### Without freeze (flicker)

![without-freeze](./demo/assets/without-freeze.gif)

### With freeze (clean)

![with-freeze](./demo/assets/with-freeze.gif)

---

## Installation

```bash
npm install @jeonheonkim/freeze
# or
pnpm add @jeonheonkim/freeze
# or
yarn add @jeonheonkim/freeze
```

> Requires React 18 or later.

## API

### `useFreeze(isOpen, duration?)`

Manages the render lifecycle of a component during exit animations.

```ts
const { shouldRender, frozen } = useFreeze(isOpen, duration);
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `isOpen` | `boolean` | — | Open/close state of the component |
| `duration` | `number` | `300` | Exit animation duration in ms (max 10000) |

**Returns:**

| Property | Type | Description |
|----------|------|-------------|
| `shouldRender` | `boolean` | Whether the component should be in the DOM |
| `frozen` | `boolean` | Whether the component is currently frozen |

### `<Freeze frozen={boolean}>`

Blocks all DOM commits to children using React Suspense.

```tsx
<Freeze frozen={frozen}>
  <div>This content will not update on screen while frozen=true</div>
</Freeze>
```

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `frozen` | `boolean` | When `true`, blocks DOM commits to children |
| `children` | `ReactNode` | Content to render |

## Usage

### Basic usage (useFreeze only)

`useFreeze` alone is enough for most cases.

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

### Suspense-based (useFreeze + Freeze)

Use the `Freeze` component when you need to completely block DOM updates.

```tsx
import { Freeze, useFreeze } from '@jeonheonkim/freeze';

function Popover({ isOpen }: { isOpen: boolean }) {
  const { shouldRender, frozen } = useFreeze(isOpen, 200);

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
