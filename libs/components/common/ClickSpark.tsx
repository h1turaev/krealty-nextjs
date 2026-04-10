import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import styles from '../../../scss/pc/homepage/ClickSpark.module.scss';

export type ClickSparkProps = {
  sparkColor?: string;
  sparkSize?: number;
  sparkRadius?: number;
  sparkCount?: number;
  duration?: number;
  children: ReactNode;
};

type Burst = { id: number; x: number; y: number };

const ClickSpark = ({
  sparkColor = '#fff',
  sparkSize = 10,
  sparkRadius = 15,
  sparkCount = 8,
  duration = 400,
  children,
}: ClickSparkProps) => {
  const [bursts, setBursts] = useState<Burst[]>([]);
  const nextId = useRef(0);

  const addBurst = useCallback(
    (clientX: number, clientY: number) => {
      const id = ++nextId.current;
      setBursts((prev) => [...prev, { id, x: clientX, y: clientY }]);
      window.setTimeout(() => {
        setBursts((prev) => prev.filter((b) => b.id !== id));
      }, duration + 50);
    },
    [duration],
  );

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      addBurst(e.clientX, e.clientY);
    };
    document.addEventListener('pointerdown', onPointerDown, { passive: true });
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [addBurst]);

  return (
    <>
      {children}
      <div className={styles.layer} aria-hidden>
        {bursts.map((burst) => (
          <div
            key={burst.id}
            className={styles.burst}
            style={{ left: burst.x, top: burst.y }}
          >
            {Array.from({ length: sparkCount }, (_, i) => {
              const angleDeg = (360 / sparkCount) * i;
              return (
                <div
                  key={i}
                  className={styles.rayWrapper}
                  style={{ transform: `rotate(${angleDeg}deg)` }}
                >
                  <div
                    className={styles.ray}
                    style={{
                      width: sparkSize,
                      height: Math.max(2, sparkSize * 0.2),
                      backgroundColor: sparkColor,
                      ['--spark-radius' as string]: `${sparkRadius}px`,
                      animationDuration: `${duration}ms`,
                    }}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
};

export default ClickSpark;
