import { useEffect, useState } from "react";
import { Freeze, useFreeze } from "@jeonheonkim/freeze";

export default function WithFreeze() {
  const [isOpen, setIsOpen] = useState(false);
  const [count, setCount] = useState(0);

  // 400ms: 닫힘 애니메이션(fadeOut 0.4s)과 일치
  const { shouldRender, frozen } = useFreeze(isOpen, 400);

  useEffect(() => {
    if (!isOpen) return;

    setCount(0);
    const id = setInterval(() => setCount((c) => c + 1), 100);
    return () => clearInterval(id);
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
            {/* frozen=true 동안 Suspense가 DOM 커밋을 막아 닫기 클릭 시점 값으로 고정 */}
            <div className="counter-display">{count}</div>
            <button className="close-btn" onClick={() => setIsOpen(false)}>
              닫기
            </button>
          </div>
        </Freeze>
      )}
    </div>
  );
}
