export function useFreeze(_isOpen: boolean, _duration?: number) {
  return { shouldRender: false, frozen: false };
}
