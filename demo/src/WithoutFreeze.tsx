import { useEffect, useRef, useState } from "react";

export default function WithoutFreeze() {
  const [isOpen, setIsOpen] = useState(false);
  const [count, setCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

      {/* isOpen=false 즉시 언마운트 → 닫기 버튼 클릭 직후 카운터 변경 보임 */}
      {isOpen && (
        <div className="popover popover--bad">
          <p className="popover-title">Counter (100ms)</p>
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
      )}
    </div>
  );
}
