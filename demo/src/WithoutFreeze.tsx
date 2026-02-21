import { useEffect, useRef, useState } from "react";

export default function WithoutFreeze() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [count, setCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 팝오버가 열려 있는 동안 0.1초마다 카운터 증가 (닫히는 중에도 계속 올라감)
  useEffect(() => {
    if (isOpen) {
      setCount(0);
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

  const handleClose = () => {
    // CSS 애니메이션만 시작 — 카운터는 계속 올라감 (문제 재현)
    setIsClosing(true);
    timerRef.current = setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 400);
  };

  const handleOpen = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsClosing(false);
    setIsOpen(true);
  };

  return (
    <div className="demo-area">
      <button className="trigger-btn" onClick={handleOpen}>
        팝오버 열기
      </button>

      {(isOpen || isClosing) && (
        <div className={`popover ${isClosing ? "popover--closing" : "popover--bad"}`}>
          <p className="popover-title">Counter (100ms)</p>
          {/* 닫히는 애니메이션 중에도 카운터가 계속 변경됨 */}
          <div className="counter-display">{count}</div>
          <button className="close-btn" onClick={handleClose}>
            닫기
          </button>
        </div>
      )}
    </div>
  );
}
