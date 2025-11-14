import { useEffect, useState, useRef } from 'react';
import styles from '../../../scss/pc/homepage/CustomCursor.module.scss';

const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isDesktop, setIsDesktop] = useState(false);
  const trailingRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const trailingPositionRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Check if desktop
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth > 768);
    };

    checkDesktop();
    window.addEventListener('resize', checkDesktop);

    let mouseX = 0;
    let mouseY = 0;

    const updateMousePosition = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      setMousePosition({ x: mouseX, y: mouseY });
    };

    const animateTrailing = () => {
      if (trailingRef.current && isDesktop) {
        const currentX = trailingPositionRef.current.x;
        const currentY = trailingPositionRef.current.y;

        const dx = mouseX - currentX;
        const dy = mouseY - currentY;

        // Smooth easing - trailing circle follows cursor with slight delay
        trailingPositionRef.current.x += dx * 0.15; // Slower for more delay
        trailingPositionRef.current.y += dy * 0.15;

        trailingRef.current.style.left = `${trailingPositionRef.current.x}px`;
        trailingRef.current.style.top = `${trailingPositionRef.current.y}px`;
      }

      animationFrameRef.current = requestAnimationFrame(animateTrailing);
    };

    // Only show on desktop
    if (isDesktop) {
      window.addEventListener('mousemove', updateMousePosition);
      // Initialize positions
      trailingPositionRef.current = { x: mouseX, y: mouseY };
      animationFrameRef.current = requestAnimationFrame(animateTrailing);
    }

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('resize', checkDesktop);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isDesktop]);

  // Hide on mobile
  if (!isDesktop) {
    return null;
  }

  return (
    <div
      ref={trailingRef}
      className={styles.cursorTrail}
      style={{
        left: `${trailingPositionRef.current.x}px`,
        top: `${trailingPositionRef.current.y}px`,
      }}
    />
  );
};

export default CustomCursor;
