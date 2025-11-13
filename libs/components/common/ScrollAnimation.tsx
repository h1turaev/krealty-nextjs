import { motion, useScroll, useTransform } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ReactNode, useRef, useEffect, useState } from 'react';

interface ScrollAnimationProps {
  children: ReactNode;
  animationType?: 'fadeIn' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scale' | 'continuous';
  delay?: number;
  duration?: number;
  className?: string;
  threshold?: number;
}

// Separate component for continuous animation to avoid SSR issues
const ContinuousScrollAnimation = ({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ['start end', 'end start'],
    layoutEffect: false,
  });

  const continuousY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const continuousOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 1, 0.3]);
  const continuousScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);

  return (
    <motion.div
      ref={scrollRef}
      className={className}
      style={{
        y: continuousY,
        opacity: continuousOpacity,
        scale: continuousScale,
      }}
    >
      {children}
    </motion.div>
  );
};

const ScrollAnimation = ({
  children,
  animationType = 'fadeIn',
  delay = 0,
  duration = 0.6,
  className = '',
  threshold = 0.1,
}: ScrollAnimationProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const { ref, inView } = useInView({
    threshold,
    triggerOnce: false, // Allow animation to trigger multiple times
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Animation variants
  const getVariants = () => {
    switch (animationType) {
      case 'fadeIn':
        return {
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { duration, delay, ease: [0.25, 0.46, 0.45, 0.94] },
          },
        };
      case 'slideUp':
        return {
          hidden: { opacity: 0, y: 60 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration, delay, ease: [0.25, 0.46, 0.45, 0.94] },
          },
        };
      case 'slideDown':
        return {
          hidden: { opacity: 0, y: -60 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration, delay, ease: [0.25, 0.46, 0.45, 0.94] },
          },
        };
      case 'slideLeft':
        return {
          hidden: { opacity: 0, x: 60 },
          visible: {
            opacity: 1,
            x: 0,
            transition: { duration, delay, ease: [0.25, 0.46, 0.45, 0.94] },
          },
        };
      case 'slideRight':
        return {
          hidden: { opacity: 0, x: -60 },
          visible: {
            opacity: 1,
            x: 0,
            transition: { duration, delay, ease: [0.25, 0.46, 0.45, 0.94] },
          },
        };
      case 'scale':
        return {
          hidden: { opacity: 0, scale: 0.8 },
          visible: {
            opacity: 1,
            scale: 1,
            transition: { duration, delay, ease: [0.25, 0.46, 0.45, 0.94] },
          },
        };
      default:
        return {
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { duration, delay, ease: [0.25, 0.46, 0.45, 0.94] },
          },
        };
    }
  };

  // Continuous animation (while scrolling) - use separate component
  if (animationType === 'continuous') {
    if (!isMounted) {
      return <div className={className}>{children}</div>;
    }
    return <ContinuousScrollAnimation className={className}>{children}</ContinuousScrollAnimation>;
  }

  // Element trigger animation (scroll into view)
  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isMounted && inView ? 'visible' : 'hidden'}
      variants={getVariants()}
    >
      {children}
    </motion.div>
  );
};

export default ScrollAnimation;
