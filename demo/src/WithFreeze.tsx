import { useEffect, useRef, useState } from "react";
import { Freeze, useFreeze } from "@jeonheonkim/freeze";

export default function WithFreeze() {
  const [isOpen, setIsOpen] = useState(false);
  const [count, setCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 400ms: 닫힘 애니메이션(fadeOut 0.4s)과 일치
  const { shouldRender, frozen } = useFreeze(isOpen, 400);

  // 팝오버가 열려 있는 동안 0.1초마다 카운터 증가
  useEffect(() => {
    if (isOpen) {
      intervalRef.current = setInterval(() => {
        setCount((c) => c + 1);
      }, 100);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isOpen]);

  return (
    <div className="demo-area">
      <button className="trigger-btn" onClick={() => setIsOpen(true)}>
        팝오버 열기
      </button>

      {shouldRender && (
        <Freeze frozen={frozen}>
          <div className={`popover ${frozen ? "popover--closing" : "popover--bad"}`}>
            <p className="popover-title">Counter (100ms)</p>
            {/* frozen=true 동안 Suspense가 DOM 커밋을 막아 카운터 고정 */}
            <div className="counter-display">{count}</div>
            <button
              className="close-btn"
              onClick={() => {
                setCount(0);
                setIsOpen(false);
              }}
            >
              닫기
            </button>
          </div>
        </Freeze>
      )}
    </div>
  );
}
